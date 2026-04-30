package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "disponibilidade")
public class Disponibilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Dia da semana: 'mon','tue','wed','thu','fri','sat','sun' */
    @Column(name = "dia_semana", nullable = false, length = 3)
    private String diaSemana;

    /** Horário no formato HH:00, ex: '09:00' */
    @Column(name = "horario", nullable = false, length = 5)
    private String horario;

    /** true → horário disponível para aula regular */
    @Column(name = "disponivel", nullable = false)
    private Boolean disponivel = false;

    /** true → horário disponível apenas para reposição */
    @Column(name = "reposicao", nullable = false)
    private Boolean reposicao = false;

    /** true → há uma aula concreta vinculada a este slot */
    @Column(name = "aula_marcada", nullable = false)
    private Boolean aulaMarcada = false;

    /** Aula vinculada (obrigatório quando aulaMarcada = true) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id")
    private Aula aula;

    /** Aluno vinculado (obrigatório quando aulaMarcada = true) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;
}
