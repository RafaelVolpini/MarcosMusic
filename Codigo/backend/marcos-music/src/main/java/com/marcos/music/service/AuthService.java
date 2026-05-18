package com.marcos.music.service;

import com.marcos.music.dto.Auth.LoginResponse;
import com.marcos.music.entity.*;
import com.marcos.music.repository.AlunoRepository;
import com.marcos.music.repository.TermsHistoryRepository;
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
    private final TermsHistoryRepository loginHistoryRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository repository, PasswordEncoder encoder,
                       JwtService jwtService, AlunoRepository alunoRepository,
                       TermsHistoryRepository loginHistoryRepository) {
        this.repository = repository;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.alunoRepository = alunoRepository;
        this.loginHistoryRepository = loginHistoryRepository;
    }

    public String register(String email, String password, Role role, String nome, String telefone) {
        Usuario user = criarUsuario(email, password, role);

        // Auto-cria registro Aluno com os dados fornecidos no cadastro
        Aluno aluno = new Aluno();
        aluno.setUsuario(user);  // @MapsId vai usar user.getId() como PK do Aluno
        String nomeFinal = (nome != null && !nome.isBlank()) ? nome.trim()
                : (email.contains("@") ? email.substring(0, email.indexOf('@')) : email);
        aluno.setNome(nomeFinal);
        aluno.setTelefone(telefone != null ? telefone.trim() : null);
        aluno.setTermos(false);
        aluno.setStatus(true);
        aluno.setReposicoes(0);
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

        Aluno aluno = alunoRepository.findById(user.getId()).orElse(null);

        if (aluno != null && Boolean.FALSE.equals(aluno.getStatus())) {
            throw new RuntimeException("Conta desativada. Entre em contato com o professor.");
        }

        Boolean termos = aluno != null ? aluno.getTermos() : null;
        String nome = aluno != null ? aluno.getNome() : null;
        String telefone = aluno != null ? aluno.getTelefone() : null;

        LocalDateTime agora = LocalDateTime.now();

        // Registra o login na tabela login_history
        TermsHistory history = new TermsHistory(user, agora, termos != null && termos);
        loginHistoryRepository.save(history);

        LoginResponse resp = new LoginResponse(jwt, termos, agora);
        resp.setNome(nome);
        resp.setTelefone(telefone);
        resp.setRole(user.getRole() != null ? user.getRole().name() : "USER");
        resp.setId(user.getId());
        return resp;
    }

    /**
     * Persiste a aceitação dos termos pelo usuário:
     * - Atualiza Aluno.termos = true (somente se o registro Aluno existir)
     * - Registra em login_history com termosAceito = true
     */
    public void acceptTerms(String email) {
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Atualiza termos no Aluno somente se o registro já existir
        alunoRepository.findById(usuario.getId()).ifPresent(aluno -> {
            aluno.setTermos(true);
            alunoRepository.save(aluno);
        });

        TermsHistory history = new TermsHistory(usuario, LocalDateTime.now(), true);
        loginHistoryRepository.save(history);
    }

    public Usuario criarUsuario(String email, String password, Role role) {
        if (repository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado: " + email);
        }
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
