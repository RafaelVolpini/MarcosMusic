package com.marcos.music.service;

import com.marcos.music.entity.PasswordResetToken;
import com.marcos.music.entity.Usuario;
import com.marcos.music.repository.PasswordResetTokenRepository;
import com.marcos.music.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String emailRemetente;

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender) {
        this.tokenRepository = tokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void solicitarReset(String email) {
        // Silently succeed even if email not found (security: don't leak account existence)
        if (usuarioRepository.findByEmail(email.trim().toLowerCase()).isEmpty()) return;

        // Invalida tokens anteriores desse email
        tokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken prt = new PasswordResetToken(
                email.trim().toLowerCase(),
                token,
                LocalDateTime.now().plusMinutes(30)
        );
        tokenRepository.save(prt);

        String link = frontendUrl + "/redefinir-senha?token=" + token;
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(emailRemetente);
        msg.setTo(email);
        msg.setSubject("Marcos Music — Redefinição de senha");
        msg.setText(
            "Olá!\n\n" +
            "Recebemos uma solicitação para redefinir a senha da sua conta Marcos Music.\n\n" +
            "Clique no link abaixo para criar uma nova senha (válido por 30 minutos):\n\n" +
            link + "\n\n" +
            "Se você não solicitou isso, pode ignorar este e-mail com segurança.\n\n" +
            "— Equipe Marcos Music"
        );
        mailSender.send(msg);
    }

    @Transactional
    public void resetarSenha(String token, String novaSenha) {
        PasswordResetToken prt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token inválido ou expirado"));

        if (!prt.isValido()) {
            throw new IllegalArgumentException("Token inválido ou expirado");
        }

        Usuario usuario = usuarioRepository.findByEmail(prt.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        usuario.setPassword(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        prt.setUsado(true);
        tokenRepository.save(prt);
    }
}
