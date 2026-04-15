package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "login_history")
@Getter
@Setter
@NoArgsConstructor
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "termos_aceito", nullable = false)
    private Boolean termosAceito;

    public LoginHistory(Usuario usuario, LocalDateTime timestamp, Boolean termosAceito) {
        this.usuario = usuario;
        this.timestamp = timestamp;
        this.termosAceito = termosAceito;
    }
}
