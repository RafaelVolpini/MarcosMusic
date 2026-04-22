package com.marcos.music.service;

import com.marcos.music.dto.Auth.LoginResponse;
import com.marcos.music.entity.*;
import com.marcos.music.repository.AlunoRepository;
import com.marcos.music.repository.LoginHistoryRepository;
import com.marcos.music.repository.UsuarioRepository;
import com.marcos.music.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final AlunoRepository alunoRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository repository, PasswordEncoder encoder,
                       JwtService jwtService, AlunoRepository alunoRepository,
                       LoginHistoryRepository loginHistoryRepository) {
        this.repository = repository;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.alunoRepository = alunoRepository;
        this.loginHistoryRepository = loginHistoryRepository;
    }

    public String register(String email, String password, Role role) {
        Usuario user = criarUsuario(email, password, role);

        // Cria registro aluno com termos=false (dados pessoais preenchidos depois)
        Aluno aluno = new Aluno();
        aluno.setId(user.getId());
        aluno.setTermos(false);
        alunoRepository.save(aluno);

        return jwtService.generateToken(user);
    }

    public LoginResponse login(String email, String password) {
        Usuario user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }

        String jwt = jwtService.generateToken(user);

        Boolean termos = alunoRepository.findById(user.getId())
                .map(Aluno::getTermos)
                .orElse(null);

        LocalDateTime agora = LocalDateTime.now();

        // Registra o login na tabela login_history
        LoginHistory history = new LoginHistory(user, agora, termos != null && termos);
        loginHistoryRepository.save(history);

        return new LoginResponse(jwt, termos, agora);
    }

    /**
     * Persiste a aceitação dos termos pelo usuário:
     * - Atualiza Aluno.termos = true (somente se o registro Aluno existir)
     * - Registra em login_history com termosAceito = true
     */
    public void acceptTerms(String email) {
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Atualiza termos no Aluno (cria se necessário)
        Aluno aluno = alunoRepository.findById(usuario.getId()).orElseGet(() -> {
            Aluno novo = new Aluno();
            novo.setId(usuario.getId());
            novo.setTermos(false);
            return novo;
        });
        aluno.setTermos(true);
        alunoRepository.save(aluno);

        LoginHistory history = new LoginHistory(usuario, LocalDateTime.now(), true);
        loginHistoryRepository.save(history);
    }

    public Usuario criarUsuario(String email, String password, Role role) {
        Usuario user = new Usuario();
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole(role);
        return repository.save(user);
    }

    public UUID getIdFromToken(String id){
        return jwtService.getUserIdFromToken(id);
    }
}
