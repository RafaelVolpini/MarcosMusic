package com.marcos.music.entity;

import java.time.LocalDateTime;
import java.time.LocalTime;
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
@Table(name = "aula_aluno")
public class AulaAluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer dia;

    @Column(name = "horario_inicio", nullable = false)
    private LocalTime horarioInicio;

    @Column(name = "horario_fim", nullable = false)
    private LocalTime horarioFim;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aluno", nullable = false)
    private Aluno aluno;

    /** Momento em que esta entrada de log foi registrada. */
    @Column(name = "data_registro")
    private LocalDateTime dataRegistro;

    /** Ação que originou este registro: AGENDADO, CANCELADO, REAGENDADO. */
    @Column(length = 30)
    private String acao;

    /** Aula específica relacionada a este log (null para entradas de template). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aula")
    private Aula aula;
}
