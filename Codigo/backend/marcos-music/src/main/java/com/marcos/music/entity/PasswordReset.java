package com.marcos.music.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.marcos.music.dto.ResetPassword.PasswordResetStatus;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "password_reset")
public class PasswordReset {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    private String email;

    @Column(name = "verification_code")
    private String verificationCode;

    @Enumerated(EnumType.STRING)
    private PasswordResetStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
