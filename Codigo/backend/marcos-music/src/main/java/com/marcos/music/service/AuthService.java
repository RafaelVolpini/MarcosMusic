package com.marcos.music.service;

import com.marcos.music.dto.Auth.LoginResponse;
import com.marcos.music.dto.ResetPassword.PasswordResetStatus;
import com.marcos.music.entity.*;
import com.marcos.music.repository.AlunoRepository;
import com.marcos.music.repository.PasswordResetRepository;
import com.marcos.music.repository.TermsHistoryRepository;
import com.marcos.music.repository.UsuarioRepository;
import com.marcos.music.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marcos.music.repository.CreditoReposicaoRepository;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;
import java.time.YearMonth;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final AlunoRepository alunoRepository;
    private final TermsHistoryRepository loginHistoryRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final PasswordResetRepository passwordResetRepository;
    private final NotificacaoService notificacaoService;

    public AuthService(
        UsuarioRepository repository, PasswordEncoder encoder,
        JwtService jwtService, AlunoRepository alunoRepository,
        TermsHistoryRepository loginHistoryRepository, 
        EmailService emailService,
        PasswordResetRepository passwordResetRepository,
        NotificacaoService notificacaoService
    ) {
        this.repository = repository;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.alunoRepository = alunoRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.emailService = emailService;
        this.passwordResetRepository = passwordResetRepository;
        this.notificacaoService = notificacaoService;
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
        LocalDate hoje = LocalDate.now();

        // Registra o login na tabela login_history
        TermsHistory history = new TermsHistory(user, agora, termos != null && termos);
        loginHistoryRepository.save(history);

        // Notificação de mensalidade: envia apenas uma vez no primeiro login do mês
        if (aluno != null && aluno.getMensalidadeNotificacao() == null) {
            // Primeira vez que aluno loga neste sistema
            notificacaoService.criarParaAluno(user.getId(),
                    "PAGAMENTO_MENSALIDADE",
                    "Lembrete: pague sua mensalidade",
                    "Olá " + nome + "! Lembre-se de pagar sua mensalidade no início de cada mês para continuar suas aulas.",
                    null);
            aluno.setMensalidadeNotificacao(hoje);
            alunoRepository.save(aluno);
        } else if (aluno != null && aluno.getMensalidadeNotificacao() != null) {
            // Verifica se já passou para um novo mês
            YearMonth ultimoMes = YearMonth.from(aluno.getMensalidadeNotificacao());
            YearMonth mesAtual = YearMonth.from(hoje);
            if (!ultimoMes.equals(mesAtual)) {
                // Novo mês: envia notificação novamente
                notificacaoService.criarParaAluno(user.getId(),
                        "PAGAMENTO_MENSALIDADE",
                        "Lembrete: pague sua mensalidade",
                        "Olá " + nome + "! Lembre-se de pagar sua mensalidade no início de cada mês para continuar suas aulas.",
                        null);
                aluno.setMensalidadeNotificacao(hoje);
                alunoRepository.save(aluno);
            }
        }

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

    @Transactional
    public void updateUserProfile(String email, String nome, String telefone) {
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        Aluno aluno = alunoRepository.findById(usuario.getId()).orElse(null);
        if (aluno == null) {
            // Conta criada antes do registro automático de Aluno  cria o registro agora
            aluno = new Aluno();
            aluno.setUsuario(usuario);
            aluno.setNome(nome != null && !nome.isBlank() ? nome.trim()
                    : (email.contains("@") ? email.substring(0, email.indexOf('@')) : email));
            aluno.setTelefone(telefone != null && !telefone.isBlank() ? telefone.trim() : null);
            aluno.setStatus(true);
            aluno.setTermos(false);
            aluno.setReposicoes(0);
            alunoRepository.save(aluno);
            return;
        }
        String finalNome = (nome != null && !nome.isBlank()) ? nome.trim() : aluno.getNome();
        String finalTelefone = (telefone != null && !telefone.isBlank()) ? telefone.trim() : null;
        // Use direct JPQL update to avoid triggering cascade/orphanRemoval on horarios (lazy collection)
        alunoRepository.updateNomeAndTelefone(aluno.getId(), finalNome, finalTelefone);
    }

    @Transactional
    public void solicitarRecuperacaoSenha(String email) {
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Usuário não encontrado"));

        String codigo = String.format(
                "%06d",
                new Random().nextInt(999999)
        );

        PasswordReset reset = new PasswordReset();

        reset.setUsuarioId(usuario.getId());
        reset.setEmail(usuario.getEmail());
        reset.setVerificationCode(codigo);

        reset.setStatus(PasswordResetStatus.PENDENTE);

        reset.setCreatedAt(LocalDateTime.now());

        reset.setExpiresAt(
                LocalDateTime.now().plusMinutes(15)
        );

        passwordResetRepository.save(reset);

        emailService.enviarCodigo(email, codigo);
    }

    @Transactional
    public void resetarSenha(String email, String verificationCode, String novaSenha) {

        PasswordReset reset =
            passwordResetRepository
                    .findFirstByEmailAndVerificationCodeAndStatusOrderByCreatedAtDesc(
                            email,
                            verificationCode,
                            PasswordResetStatus.PENDENTE)
                    .orElseThrow(() ->
                        new IllegalArgumentException("Código inválido"));

        if (reset.getExpiresAt().isBefore(LocalDateTime.now())) {
            reset.setStatus(PasswordResetStatus.EXPIRADO);
            passwordResetRepository.save(reset);

            throw new IllegalArgumentException("Código expirado");
        }

        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Usuário não encontrado"));

        usuario.setPassword(encoder.encode(novaSenha));

        repository.save(usuario);

        reset.setStatus(PasswordResetStatus.CONCLUIDO);
        reset.setCompletedAt(LocalDateTime.now());

        passwordResetRepository.save(reset);
    }
}
