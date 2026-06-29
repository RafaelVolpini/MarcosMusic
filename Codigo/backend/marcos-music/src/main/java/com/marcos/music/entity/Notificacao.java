package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notificacao")
public class Notificacao {

    /** Tipos de notificação suportados */
    public static final String LEMBRETE_HOJE     = "LEMBRETE_HOJE";
    public static final String LEMBRETE_AMANHA   = "LEMBRETE_AMANHA";
    public static final String AULA_AGENDADA     = "AULA_AGENDADA";
    public static final String AULA_REAGENDADA   = "AULA_REAGENDADA";
    public static final String AULA_CANCELADA    = "AULA_CANCELADA";
    public static final String CONFIRMOU_PRESENCA = "CONFIRMOU_PRESENCA";
    public static final String REPOSICAO_AGENDADA = "REPOSICAO_AGENDADA";
    public static final String REPOSICAO_REMOVIDA = "REPOSICAO_REMOVIDA";
    public static final String NOVA_MENSAGEM      = "NOVA_MENSAGEM";

    /** Destinatário especial para o professor */
    public static final String DESTINATARIO_PROFESSOR = "PROFESSOR";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID do aluno (como string) ou 'PROFESSOR' */
    @Column(nullable = false, length = 100)
    private String destinatario;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String mensagem;

    @Column(nullable = false)
    private boolean lida = false;

    @Column(name = "criada_em", nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();

    /** ID da aula, reposição ou chat relacionado (opcional) */
    @Column(name = "ref_id")
    private Long refId;
}
