package com.marcos.music.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public void enviarCodigo(String email, String codigo) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(email);
            message.setSubject("Recuperação de Senha");
            message.setText(
                    "Seu código de recuperação é: "
                    + codigo
            );

            mailSender.send(message);
        } catch (Exception e) {
            logger.warn("Falha ao enviar email de recuperação para {}: {}", email, e.getMessage());
            // Continua sem lançar exceção - permite fluxo de reset sem email configurado
        }
    }
}
