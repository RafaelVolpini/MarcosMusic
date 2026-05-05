package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reposicao")
public class Reposicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disponibilidade_id", nullable = false)
    private Disponibilidade disponibilidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id")
    private Aula aula;

    @Column(name = "data_aula", nullable = false)
    private LocalDate dataAula;

    @Column(length = 20, nullable = false)
    private String status = "ABERTA";

    @Column(length = 500)
    private String observacao;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "reposicao_aluno",
        joinColumns = @JoinColumn(name = "reposicao_id"),
        inverseJoinColumns = @JoinColumn(name = "aluno_id")
    )
    private List<Aluno> alunos = new ArrayList<>();
}
