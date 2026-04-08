package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

import com.marcos.music.dto.AlunoDTO;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "aluno")
public class Aluno {

    @Id
    private UUID id;

    private String cpf;

    private String endereco;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    private String telefone;

    @Column(name = "termos")
    private Boolean termos;

    public Aluno (AlunoDTO dto){
        this.id = dto.getId();
        this.cpf = dto.getCpf();
        this.endereco = dto.getEndereco();
        this.dataNascimento = dto.getDataNascimento();
        this.telefone = dto.getTelefone();
        this.termos = dto.getTermos();
    }
}