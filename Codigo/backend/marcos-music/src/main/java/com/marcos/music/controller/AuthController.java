package com.marcos.music.controller;

import com.marcos.music.dto.Auth.AcceptTermsRequest;
import com.marcos.music.dto.Auth.AuthDTO;
import com.marcos.music.entity.Role;
import com.marcos.music.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO request) {
        try {
            // Papel: admin apenas para o e-mail do professor; todos os outros são USER
            Role role = "marcos@musga.com".equalsIgnoreCase(request.getEmail()) ? Role.ADMIN : Role.USER;
            // Monta nome completo a partir dos campos opcionais
            String nomeCompleto = null;
            if (request.getNome() != null && !request.getNome().isBlank()) {
                nomeCompleto = request.getNome().trim();
                if (request.getSobrenome() != null && !request.getSobrenome().isBlank()) {
                    nomeCompleto += " " + request.getSobrenome().trim();
                }
            }
            String token = service.register(request.getEmail(), request.getPassword(), role, nomeCompleto, request.getTelefone());
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.status(409).body("E-mail já cadastrado");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO request) {
        try {
            return ResponseEntity.ok(service.login(request.getEmail(), request.getPassword()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
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
}
