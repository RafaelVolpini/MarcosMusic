package com.marcos.music.service;

import com.marcos.music.dto.Auth.LoginResponse;
import com.marcos.music.entity.*;
import com.marcos.music.repository.AlunoRepository;
import com.marcos.music.repository.UsuarioRepository;
import com.marcos.music.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final AlunoRepository alunoRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository repository, PasswordEncoder encoder, JwtService jwtService, AlunoRepository alunoRepository) {
        this.repository = repository;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.alunoRepository = alunoRepository;
    }

    public String register(String email, String password, Role role) {
        return jwtService.generateToken(criarUsuario(email, password, role));
    }

    public LoginResponse login(String email, String password) {
         Usuario user = repository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String jwt = jwtService.generateToken(user);

        return alunoRepository.findById(user.getId())
                .map(aluno -> new LoginResponse(jwt, aluno.getTermos()))
                .orElse(new LoginResponse(jwt, null));
    }

    public Usuario criarUsuario(String email, String password, Role role){
        Usuario user = new Usuario();
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole(role);

        return repository.save(user);
    }
}