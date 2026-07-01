package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "aluno")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Aluno {

    @Id
    private UUID id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    @JsonIgnore
    private Usuario usuario;

    @Column(nullable = false, length = 255)
    private String nome;

    @Column(length = 20)
    private String telefone;

    @Column(nullable = false)
    private Boolean status = true;

    @Column(nullable = false)
    private Integer reposicoes = 0;

    @Column(name = "termos")
    private Boolean termos = false;

    @Column(name = "apelido", length = 100)
    private String apelido;

    @Column(name = "mensalidade_notificacao")
    private LocalDate mensalidadeNotificacao;

    @Column(name = "plano_aulas_mes")
    private Integer planoAulasMes;

    @OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<AulaAluno> horarios;

}