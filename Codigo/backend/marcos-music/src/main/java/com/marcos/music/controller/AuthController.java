package com.marcos.music.controller;

import com.marcos.music.dto.Auth.AcceptTermsRequest;
import com.marcos.music.dto.Auth.AuthDTO;
import com.marcos.music.dto.Auth.LoginResponse;
import com.marcos.music.dto.Auth.ProfileUpdateDTO;
import com.marcos.music.dto.ResetPassword.ResetPasswordRequestDTO;
import com.marcos.music.dto.ResetPassword.SolicitarResetSenhaRequest;
import com.marcos.music.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
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
            LoginResponse loginResp = service.login(request.getEmail(), request.getPassword());
            // Access token → HttpOnly cookie (JS cannot read this)
            addAuthCookie(response, loginResp.getToken());
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
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateDTO dto) {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(401).body("Não autenticado");
            }
            service.updateUserProfile(auth.getName(), dto.getNome(), dto.getTelefone());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao atualizar perfil: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @RequestBody SolicitarResetSenhaRequest request) {

        service.solicitarRecuperacaoSenha(
                request.getEmail()
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @RequestBody ResetPasswordRequestDTO request) {

        service.resetarSenha(
                request.getEmail(),
                request.getVerificationCode(),
                request.getNewPassword()
        );

        return ResponseEntity.ok().build();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void addAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("access_token", token);
        cookie.setHttpOnly(true);   // inaccessible to JavaScript
        cookie.setPath("/");
        cookie.setMaxAge(3 * 60 * 60);  // 3 hours matches JWT expiry
        // In production behind HTTPS, add: cookie.setSecure(true);
        // SameSite is set via header because Java's Cookie class doesn't expose it directly
        response.addCookie(cookie);
        // Overwrite with SameSite attribute (required to allow cross-port in dev via proxy)
        response.addHeader("Set-Cookie",
            "access_token=" + token +
            "; Path=/" +
            "; HttpOnly" +
            "; Max-Age=10800" +
            "; SameSite=None" +
            "; Secure"
        );
    }
}
