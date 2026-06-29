package com.marcos.music.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "aula")
public class Aula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDateTime dataFim;

    @Column(name = "flag_cancelada")
    private Boolean flagCancelada = false;

    @Column(name = "presenca_confirmada")
    private Boolean presencaConfirmada = false;

    @Column(name = "recorrente")
    private Boolean recorrente = false;

    @Column(name = "is_reposicao")
    private Boolean isReposicao = false;

    @Column(name = "flag_realizada")
    private Boolean flagRealizada = false;

    @Column(name = "meet_link", length = 500)
    private String meetLink;

    @Column(name = "is_online")
    private Boolean isOnline = false;

    @Column(name = "google_event_id", length = 255)
    private String googleEventId;

    @Column(name = "data_solicitacao_cancelamento")
    private LocalDateTime dataSolicitacaoCancelamento;

    @Column(name = "cancelamento_gera_credito")
    private Boolean cancelamentoGeraCredito = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aluno", nullable = false)
    private Aluno aluno;

    public Aula(LocalDateTime dataInicio, LocalDateTime dataFim, Aluno aluno){
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.aluno = aluno;
    }

    public Aula(LocalDateTime dataInicio, LocalDateTime dataFim, Aluno aluno, Boolean recorrente){
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.aluno = aluno;
        this.recorrente = recorrente != null ? recorrente : false;
    }

}