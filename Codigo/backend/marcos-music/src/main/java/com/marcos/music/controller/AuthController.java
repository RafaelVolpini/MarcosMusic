package com.marcos.music.controller;

import com.marcos.music.dto.Auth.AcceptTermsRequest;
import com.marcos.music.dto.Auth.AuthDTO;
import com.marcos.music.dto.Auth.LoginResponse;
import com.marcos.music.dto.Auth.ProfileUpdateDTO;
import com.marcos.music.security.JwtService;
import com.marcos.music.service.AuthService;
import com.marcos.music.service.PasswordResetService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;
    private final PasswordResetService passwordResetService;
    private final JwtService jwtService;

    public AuthController(AuthService service, PasswordResetService passwordResetService, JwtService jwtService) {
        this.service = service;
        this.passwordResetService = passwordResetService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO request, HttpServletResponse response) {
        try {
            com.marcos.music.entity.Role role =
                "marcoslima91@hotmail.com".equalsIgnoreCase(request.getEmail())
                    ? com.marcos.music.entity.Role.ADMIN
                    : com.marcos.music.entity.Role.USER;
            String nomeCompleto = null;
            if (request.getNome() != null && !request.getNome().isBlank()) {
                nomeCompleto = request.getNome().trim();
                if (request.getSobrenome() != null && !request.getSobrenome().isBlank()) {
                    nomeCompleto += " " + request.getSobrenome().trim();
                }
            }
            String token = service.register(request.getEmail(), request.getPassword(), role, nomeCompleto, request.getTelefone());
            addAuthCookie(response, token);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(409).body("E-mail já cadastrado");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO request, HttpServletResponse response) {
        try {
            boolean rememberMe = Boolean.TRUE.equals(request.getRememberMe());
            LoginResponse loginResp = service.login(request.getEmail(), request.getPassword(), rememberMe);
            // Access token → HttpOnly cookie (JS cannot read this)
            addAuthCookie(response, loginResp.getToken(), rememberMe);
            // Return metadata without the token in the body
            loginResp.setToken(null);
            return ResponseEntity.ok(loginResp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("access_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // delete immediately
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept-terms")
    public ResponseEntity<Void> acceptTerms(@RequestBody AcceptTermsRequest request) {
        try {
            service.acceptTerms(request.getEmail());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).build();
        }
    }

    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateDTO dto, HttpServletRequest request, HttpServletResponse response) {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(401).body("Não autenticado");
            }
            boolean rememberMe = isCurrentSessionLongLived(request);
            String newToken = service.updateUserProfile(auth.getName(), dto.getNome(), dto.getTelefone(), dto.getEmail(), rememberMe);
            // O e-mail (subject do token) pode ter mudado — reemite o cookie com o token novo
            addAuthCookie(response, newToken, rememberMe);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao atualizar perfil: " + e.getMessage());
        }
    }

    private boolean isCurrentSessionLongLived(HttpServletRequest request) {
        if (request.getCookies() == null) return false;
        for (Cookie cookie : request.getCookies()) {
            if ("access_token".equals(cookie.getName())) {
                return jwtService.isLongLived(cookie.getValue());
            }
        }
        return false;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        if (!email.isEmpty()) {
            try { passwordResetService.solicitarReset(email); } catch (Exception ignored) {}
        }
        // Always 200 to avoid leaking account existence
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> body) {
        String token = body.getOrDefault("token", "");
        String novaSenha = body.getOrDefault("novaSenha", "");
        if (token.isBlank() || novaSenha.isBlank()) {
            return ResponseEntity.badRequest().body("Token e nova senha são obrigatórios");
        }
        try {
            passwordResetService.resetarSenha(token, novaSenha);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void addAuthCookie(HttpServletResponse response, String token) {
        addAuthCookie(response, token, false);
    }

    private void addAuthCookie(HttpServletResponse response, String token, boolean rememberMe) {
        int maxAge = rememberMe
                ? 30 * 24 * 60 * 60   // 30 days
                : 3 * 60 * 60;         // 3 hours
        response.addHeader("Set-Cookie",
            "access_token=" + token +
            "; Path=/" +
            "; HttpOnly" +
            "; Max-Age=" + maxAge +
            "; SameSite=Lax"
        );
    }
}
