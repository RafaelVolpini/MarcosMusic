package com.marcos.music.dto.Disponibilidade;

import java.util.UUID;

/**
 * Representa um slot da tabela disponibilidade para leitura.
 */
public record DisponibilidadeResponseDTO(
        Long id,
        String diaSemana,
        String horario,
        Boolean disponivel,
        Boolean reposicao,
        Boolean aulaMarcada,
        Long aulaId,
        UUID alunoId,
        String alunoNome,
        Boolean flagCancelada
) {}
