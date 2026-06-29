package com.marcos.music.dto.Reposicao;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReposicaoResponseDTO(
        Long id,
        Long disponibilidadeId,
        String diaSemana,
        String horario,
        LocalDate dataAula,
        String status,
        String observacao,
        List<AlunoResumo> alunos,
        Long aulaId
) {
    public record AlunoResumo(UUID id, String nome) {}
}
