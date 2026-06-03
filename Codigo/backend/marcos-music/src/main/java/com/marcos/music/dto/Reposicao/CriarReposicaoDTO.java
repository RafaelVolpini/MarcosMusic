package com.marcos.music.dto.Reposicao;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CriarReposicaoDTO {
    private Long disponibilidadeId;
    private LocalDate dataAula;
    private List<UUID> alunoIds;
    private String observacao;
    private Long aulaId; // opcional – aula de origem que virou reposição
}
