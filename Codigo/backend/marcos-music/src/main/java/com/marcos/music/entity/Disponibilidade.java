package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.*;

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

    /** Dia da semana: 'seg','ter','qua','qui','sex','sab','dom' */
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
}
