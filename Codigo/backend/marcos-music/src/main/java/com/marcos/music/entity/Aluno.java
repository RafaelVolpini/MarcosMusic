package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marcos.music.dto.Aluno.AlunoDTO;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "aluno")
public class Aluno {

    @Id
    private UUID id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Usuario usuario;

    @Column(nullable = false, length = 255)
    private String nome;

    @Column(length = 11)
    private String telefone;

    @Column(nullable = false)
    private Boolean status = true;

    @Column(nullable = false)
    private Integer reposicoes = 0;

    @Column(name = "termos")
    private Boolean termos = false;


    @OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<AulaAluno> horarios;

    public Aluno (AlunoDTO dto){
        this.id = dto.getId();
        this.nome = dto.getNome();
        this.telefone = dto.getTelefone();
        this.termos = dto.getTermos() != null ? dto.getTermos() : false;
        this.status = dto.getStatus() != null ? dto.getStatus() : true;
    }
}