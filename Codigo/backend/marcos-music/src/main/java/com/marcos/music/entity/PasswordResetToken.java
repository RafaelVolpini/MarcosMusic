package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_token")
@Getter @Setter @NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expira_em", nullable = false)
    private LocalDateTime expiraEm;

    @Column(nullable = false)
    private boolean usado = false;

    public PasswordResetToken(String email, String token, LocalDateTime expiraEm) {
        this.email = email;
        this.token = token;
        this.expiraEm = expiraEm;
    }

    public boolean isValido() {
        return !usado && LocalDateTime.now().isBefore(expiraEm);
    }
}
