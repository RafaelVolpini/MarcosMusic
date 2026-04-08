package com.marcos.music.controller;

import com.marcos.music.dto.Auth.AuthDTO;
import com.marcos.music.entity.Role;
import com.marcos.music.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public String register(@RequestBody AuthDTO request) {
        return service.register(request.getEmail(), request.getPassword(), Role.ADMIN); //apenas para testes
    }

    @PostMapping("/login")
    public Object login(@RequestBody AuthDTO request) {
        
        return service.login(request.getEmail(), request.getPassword());
    }
}