package com.marcos.music.controller;

import com.marcos.music.entity.Role;
import com.marcos.music.entity.Usuario;
import com.marcos.music.integration.google.GoogleCalendarService;
import com.marcos.music.security.JwtService;
import com.marcos.music.repository.Aula.AulaRepository;
import com.marcos.music.repository.UsuarioRepository;
import com.marcos.music.entity.Aula;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/google")
public class GoogleCalendarController {
    private final GoogleCalendarService googleService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final AulaRepository aulaRepository;

    public GoogleCalendarController(GoogleCalendarService googleService, JwtService jwtService,
                                    UsuarioRepository usuarioRepository, AulaRepository aulaRepository) {
        this.googleService = googleService;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.aulaRepository = aulaRepository;
    }

    @PostMapping("/oauth/url")
    public ResponseEntity<?> buildOAuthUrl(
            @RequestBody OAuthStartRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }
            String email = jwtService.getEmailFromToken(authHeader.substring(7));
            Usuario user = usuarioRepository.findByEmail(email)
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
    public ResponseEntity<?> syncCalendar(
            @RequestBody GoogleSyncRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String email = jwtService.getEmailFromToken(authHeader.substring(7));
            Usuario user = usuarioRepository.findByEmail(email)
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

        public GoogleSyncResponse(int total, int success, int failed) {
            this.total = total;
            this.success = success;
            this.failed = failed;
        }
    }
}
