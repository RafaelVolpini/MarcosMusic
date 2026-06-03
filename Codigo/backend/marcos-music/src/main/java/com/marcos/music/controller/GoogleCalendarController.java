package com.marcos.music.controller;

import com.marcos.music.entity.Role;
import com.marcos.music.entity.Usuario;
import com.marcos.music.integration.google.GoogleCalendarService;
import com.marcos.music.repository.Aula.AulaRepository;
import com.marcos.music.repository.UsuarioRepository;
import com.marcos.music.entity.Aula;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/google")
public class GoogleCalendarController {
    private final GoogleCalendarService googleService;
    private final UsuarioRepository usuarioRepository;
    private final AulaRepository aulaRepository;

    public GoogleCalendarController(GoogleCalendarService googleService,
                                    UsuarioRepository usuarioRepository, AulaRepository aulaRepository) {
        this.googleService = googleService;
        this.usuarioRepository = usuarioRepository;
        this.aulaRepository = aulaRepository;
    }

    @GetMapping("/me/photo")
    public ResponseEntity<?> getProfilePhoto() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(401).body("Sessão expirada.");
            }
            String email = auth.getName();
            Usuario user = usuarioRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            String photoUrl = googleService.getProfilePhoto(user.getId());
            if (photoUrl == null) return ResponseEntity.noContent().build();
            return ResponseEntity.ok(Map.of("photoUrl", photoUrl));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(404).body("Google não conectado");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/oauth/url")
    public ResponseEntity<?> buildOAuthUrl(@RequestBody OAuthStartRequest request) {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(401).body("Sessão expirada. Faça login novamente.");
            }
            String email = auth.getName();
            Usuario user = usuarioRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            String authUrl = googleService.buildAuthUrl(user.getId(), request.loginHint, request.returnUrl);
            return ResponseEntity.ok(new OAuthUrlResponse(authUrl));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/oauth/callback")
    public void handleCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state,
            HttpServletResponse response
    ) throws IOException {
        try {
            String returnUrl = googleService.handleCallback(code, state);
            String separator = returnUrl.contains("?") ? "&" : "?";
            response.sendRedirect(returnUrl + separator + "google=connected");
        } catch (Exception e) {
            String fallback = googleService.getFrontendRedirect();
            String separator = fallback.contains("?") ? "&" : "?";
            response.sendRedirect(fallback + separator + "google=error");
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncCalendar(@RequestBody GoogleSyncRequest request) {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(401).body("Sessão expirada. Faça login novamente.");
            }
            String email = auth.getName();
            Usuario user = usuarioRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            List<Aula> lessons;
            if (user.getRole() == Role.ADMIN) {
                lessons = aulaRepository.findByDataInicioBetweenAndFlagCanceladaFalse(request.dataInicio, request.dataFim);
            } else {
                lessons = aulaRepository.findByAlunoIdAndDataInicioBetweenAndFlagCanceladaFalse(user.getId(), request.dataInicio, request.dataFim);
            }

            int success = googleService.syncLessons(user.getId(), lessons);
            int total = lessons.size();
            return ResponseEntity.ok(new GoogleSyncResponse(total, success, total - success));
        } catch (IllegalStateException e) {
            // Google token not in memory (e.g. after server restart)  tell frontend to re-connect
            return ResponseEntity.ok(new GoogleSyncResponse(0, 0, 0, true));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    public static class GoogleSyncRequest {
        public LocalDateTime dataInicio;
        public LocalDateTime dataFim;
    }

    public static class OAuthStartRequest {
        public String loginHint;
        public String returnUrl;
    }

    public static class OAuthUrlResponse {
        public String authUrl;

        public OAuthUrlResponse(String authUrl) {
            this.authUrl = authUrl;
        }
    }

    public static class GoogleSyncResponse {
        public int total;
        public int success;
        public int failed;
        public boolean disconnected;

        public GoogleSyncResponse(int total, int success, int failed) {
            this.total = total;
            this.success = success;
            this.failed = failed;
            this.disconnected = false;
        }

        public GoogleSyncResponse(int total, int success, int failed, boolean disconnected) {
            this.total = total;
            this.success = success;
            this.failed = failed;
            this.disconnected = disconnected;
        }
    }
}
