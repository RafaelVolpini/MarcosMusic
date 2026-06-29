package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Entity
@Table(name = "credito_reposicao", indexes = {
    @Index(name = "idx_aluno_status", columnList = "aluno_id,status"),
    @Index(name = "idx_expiracao", columnList = "data_expiracao")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditoReposicao {

    public static final String STATUS_VALIDO = "VALIDO";
    public static final String STATUS_EXPIRADO = "EXPIRADO";
    public static final String STATUS_USADO = "USADO";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_expiracao", nullable = false)
    private LocalDateTime dataExpiracao;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = STATUS_VALIDO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id")
    private Aula aula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reposicao_id")
    private Reposicao reposicao;

    @Column(name = "observacao", length = 500)
    private String observacao;

    // Helpers
    public boolean isValido() {
        return STATUS_VALIDO.equals(status);
    }

    public boolean isExpirado() {
        return LocalDateTime.now().isAfter(dataExpiracao);
    }

    public boolean isDisponivelParaUso() {
        return isValido() && !isExpirado();
    }

    public int diasAteExpiracao() {
        return (int) java.time.temporal.ChronoUnit.DAYS.between(
            LocalDateTime.now(), dataExpiracao
        );
    }
}
