package com.marcos.music.integration.google;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marcos.music.entity.Aula;
import com.marcos.music.entity.GoogleOAuthToken;
import com.marcos.music.repository.Aula.AulaRepository;
import com.marcos.music.repository.GoogleOAuthTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GoogleCalendarService {
    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth";
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1";
    private static final String GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final String TIME_ZONE = "America/Sao_Paulo";

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private final AulaRepository aulaRepository;
    private final GoogleOAuthTokenRepository tokenRepository;
    private final Map<String, GoogleAuthState> states = new ConcurrentHashMap<>();
    private final Map<UUID, GoogleToken> tokens = new ConcurrentHashMap<>();

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String redirectUri;

    @Value("${google.oauth.frontend-redirect}")
    private String frontendRedirect;

    public GoogleCalendarService(AulaRepository aulaRepository, GoogleOAuthTokenRepository tokenRepository) {
        this.aulaRepository = aulaRepository;
        this.tokenRepository = tokenRepository;
    }

    public String buildAuthUrl(UUID userId, String loginHint, String returnUrl) {
        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalStateException("Credenciais do Google não configuradas");
        }
        String state = UUID.randomUUID().toString();
        String finalReturnUrl = normalizeReturnUrl(returnUrl);
        states.put(state, new GoogleAuthState(userId, finalReturnUrl));

        StringBuilder sb = new StringBuilder(GOOGLE_AUTH_URL).append('?');
        sb.append("client_id=").append(urlEncode(clientId));
        sb.append("&redirect_uri=").append(urlEncode(redirectUri));
        sb.append("&response_type=code");
        sb.append("&access_type=offline");
        sb.append("&include_granted_scopes=true");
        sb.append("&prompt=consent");
        sb.append("&scope=").append(urlEncode("https://www.googleapis.com/auth/calendar.events"));
        sb.append("&state=").append(urlEncode(state));
        if (loginHint != null && !loginHint.isBlank()) {
            sb.append("&login_hint=").append(urlEncode(loginHint.trim()));
        }
        return sb.toString();
    }

    public String handleCallback(String code, String state) throws IOException, InterruptedException {
        GoogleAuthState authState = states.remove(state);
        if (authState == null) {
            throw new IllegalStateException("Estado inválido");
        }
        GoogleToken token = exchangeCode(code);
        tokens.put(authState.userId(), token);
        saveTokenToDB(authState.userId(), token);
        return authState.returnUrl();
    }

    public int syncLessons(UUID userId, List<Aula> lessons) throws IOException, InterruptedException {
        String accessToken = getAccessToken(userId);
        int synced = 0;
        for (Aula lesson : lessons) {
            try {
                // Re-read from DB to get the freshest googleEventId and avoid concurrent-sync duplicates
                Aula fresh = aulaRepository.findById(lesson.getId()).orElse(lesson);
                if (fresh.getGoogleEventId() != null && !fresh.getGoogleEventId().isBlank()) {
                    updateEvent(accessToken, fresh.getGoogleEventId(), fresh);
                    synced++;
                } else {
                    // First time syncing this lesson — create event
                    EventCreationResult result = createEvent(accessToken, lesson);
                    if (result.eventId() != null) {
                        lesson.setGoogleEventId(result.eventId());
                        if (result.hangoutLink() != null && !result.hangoutLink().isBlank()) {
                            lesson.setMeetLink(result.hangoutLink());
                        }
                        aulaRepository.save(lesson);
                        synced++;
                    }
                }
            } catch (Exception e) {
                // Continue with next lesson on error
            }
        }
        return synced;
    }

    /**
     * Creates a single Google Meet room for the given lesson and returns the hangoutLink.
     * Also saves the Google event ID to prevent duplicates on future syncs.
     * Throws IllegalStateException if the user is not connected to Google.
     */
    public String createMeetLink(UUID userId, Aula aula) throws IOException, InterruptedException {
        String accessToken = getAccessToken(userId);
        EventCreationResult result = createEvent(accessToken, aula);
        if (result.eventId() != null) {
            aula.setGoogleEventId(result.eventId());
            aulaRepository.save(aula);
        }
        return result.hangoutLink();
    }

    public boolean hasToken(UUID userId) {
        return tokens.containsKey(userId) || tokenRepository.existsById(userId);
    }

    /** Returns the Google profile photo URL for the given user, or null if unavailable. */
    public String getProfilePhoto(UUID userId) throws IOException, InterruptedException {
        String accessToken = getAccessToken(userId);
        HttpRequest request = HttpRequest.newBuilder(URI.create(GOOGLE_USERINFO_URL))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) return null;
        JsonNode json = mapper.readTree(response.body());
        String picture = json.path("picture").asText(null);
        return (picture != null && !picture.isBlank()) ? picture : null;
    }

    public String getFrontendRedirect() {
        return frontendRedirect;
    }

    private String getAccessToken(UUID userId) throws IOException, InterruptedException {
        GoogleToken token = tokens.get(userId);
        if (token == null) {
            token = loadTokenFromDB(userId);
            if (token == null) {
                throw new IllegalStateException("Conta Google não conectada");
            }
            tokens.put(userId, token);
        }
        if (!token.isExpired()) return token.accessToken();

        GoogleToken refreshed = refreshToken(token);
        tokens.put(userId, refreshed);
        saveTokenToDB(userId, refreshed);
        return refreshed.accessToken();
    }

    private GoogleToken exchangeCode(String code) throws IOException, InterruptedException {
        String body = "code=" + urlEncode(code)
                + "&client_id=" + urlEncode(clientId)
                + "&client_secret=" + urlEncode(clientSecret)
                + "&redirect_uri=" + urlEncode(redirectUri)
                + "&grant_type=authorization_code";

        HttpRequest request = HttpRequest.newBuilder(URI.create(GOOGLE_TOKEN_URL))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Falha ao obter token do Google");
        }

        JsonNode json = mapper.readTree(response.body());
        String accessToken = json.path("access_token").asText();
        String refreshToken = json.path("refresh_token").asText(null);
        long expiresIn = json.path("expires_in").asLong(3600);

        return new GoogleToken(accessToken, refreshToken, Instant.now().plusSeconds(expiresIn));
    }

    private GoogleToken refreshToken(GoogleToken token) throws IOException, InterruptedException {
        if (token.refreshToken() == null || token.refreshToken().isBlank()) {
            throw new IllegalStateException("Token do Google expirou e precisa reconectar");
        }
        String body = "client_id=" + urlEncode(clientId)
                + "&client_secret=" + urlEncode(clientSecret)
                + "&refresh_token=" + urlEncode(token.refreshToken())
                + "&grant_type=refresh_token";

        HttpRequest request = HttpRequest.newBuilder(URI.create(GOOGLE_TOKEN_URL))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Falha ao atualizar token do Google");
        }

        JsonNode json = mapper.readTree(response.body());
        String accessToken = json.path("access_token").asText();
        long expiresIn = json.path("expires_in").asLong(3600);

        return new GoogleToken(accessToken, token.refreshToken(), Instant.now().plusSeconds(expiresIn));
    }

    private record EventCreationResult(String hangoutLink, String eventId) {}

    private EventCreationResult createEvent(String accessToken, Aula lesson) throws IOException, InterruptedException {
        String alunoNome = (lesson.getAluno() != null) ? lesson.getAluno().getNome() : "Aluno";
        String alunoEmail = (lesson.getAluno() != null && lesson.getAluno().getUsuario() != null) 
                            ? lesson.getAluno().getUsuario().getEmail() : null;

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
        String startStr = lesson.getDataInicio().atZone(ZoneId.of(TIME_ZONE)).format(formatter);
        String endStr = lesson.getDataFim().atZone(ZoneId.of(TIME_ZONE)).format(formatter);

        Map<String, Object> payloadMap = new java.util.HashMap<>();
        payloadMap.put("summary", "Aula de Música: " + alunoNome);
        payloadMap.put("location", "Link do Meet será gerado automaticamente");
        payloadMap.put("description", "Acesse o Google Calendar para entrar na aula via Google Meet.\n\nAluno: " + alunoNome);
        
        payloadMap.put("start", Map.of(
                "dateTime", startStr,
                "timeZone", TIME_ZONE
        ));
        
        payloadMap.put("end", Map.of(
                "dateTime", endStr,
                "timeZone", TIME_ZONE
        ));

        if (alunoEmail != null) {
            payloadMap.put("attendees", List.of(Map.of("email", alunoEmail)));
        }

        // Stable requestId so Google deduplicates if the same request is retried
        payloadMap.put("conferenceData", Map.of(
                "createRequest", Map.of(
                        "requestId", "marcos-music-aula-" + lesson.getId(),
                        "conferenceSolutionKey", Map.of("type", "hangoutsMeet")
                )
        ));

        payloadMap.put("reminders", Map.of(
                "useDefault", false,
                "overrides", List.of(
                        Map.of("method", "email", "minutes", 1440),
                        Map.of("method", "popup", "minutes", 30)
                )
        ));

        String payload = mapper.writeValueAsString(payloadMap);
        
        HttpRequest request = HttpRequest.newBuilder(URI.create(GOOGLE_CALENDAR_URL))
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            System.err.println("Erro do Google (Status " + response.statusCode() + "): " + response.body());
            return new EventCreationResult(null, null);
        }

        JsonNode responseJson = mapper.readTree(response.body());
        String eventId = responseJson.path("id").asText(null);
        String hangoutLink = responseJson.path("hangoutLink").asText(null);
        if (hangoutLink == null || hangoutLink.isBlank()) {
            // Fallback: check conferenceData.entryPoints for video entry
            JsonNode entryPoints = responseJson.path("conferenceData").path("entryPoints");
            if (entryPoints.isArray()) {
                for (JsonNode ep : entryPoints) {
                    if ("video".equals(ep.path("entryPointType").asText())) {
                        hangoutLink = ep.path("uri").asText(null);
                        break;
                    }
                }
            }
        }
        return new EventCreationResult(hangoutLink, eventId);
    }

    /** PATCHes an existing Google Calendar event to update title and time. */
    private void updateEvent(String accessToken, String eventId, Aula lesson) throws IOException, InterruptedException {
        String alunoNome = (lesson.getAluno() != null) ? lesson.getAluno().getNome() : "Aluno";
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
        String startStr = lesson.getDataInicio().atZone(ZoneId.of(TIME_ZONE)).format(formatter);
        String endStr   = lesson.getDataFim().atZone(ZoneId.of(TIME_ZONE)).format(formatter);

        Map<String, Object> patch = new java.util.HashMap<>();
        patch.put("summary", "Aula de Música: " + alunoNome);
        patch.put("start", Map.of("dateTime", startStr, "timeZone", TIME_ZONE));
        patch.put("end",   Map.of("dateTime", endStr,   "timeZone", TIME_ZONE));

        String url = "https://www.googleapis.com/calendar/v3/calendars/primary/events/" + eventId + "?conferenceDataVersion=1";
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .method("PATCH", HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(patch)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 404) {
            // Event was deleted from Google Calendar  reset so it gets recreated on next sync
            lesson.setGoogleEventId(null);
            aulaRepository.save(lesson);
        }
    }

    private void saveTokenToDB(UUID userId, GoogleToken token) {
        GoogleOAuthToken entity = tokenRepository.findById(userId)
                .orElseGet(() -> { GoogleOAuthToken e = new GoogleOAuthToken(); e.setUserId(userId); return e; });
        entity.setAccessToken(token.accessToken());
        entity.setRefreshToken(token.refreshToken());
        entity.setExpiresAt(token.expiresAt() != null ? token.expiresAt().getEpochSecond() : 0L);
        tokenRepository.save(entity);
    }

    private GoogleToken loadTokenFromDB(UUID userId) {
        return tokenRepository.findById(userId)
                .map(e -> new GoogleToken(
                        e.getAccessToken(),
                        e.getRefreshToken(),
                        Instant.ofEpochSecond(e.getExpiresAt())))
                .orElse(null);
    }

    private String normalizeReturnUrl(String returnUrl) {
        if (returnUrl == null || returnUrl.isBlank()) return frontendRedirect;
        return returnUrl.trim();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
