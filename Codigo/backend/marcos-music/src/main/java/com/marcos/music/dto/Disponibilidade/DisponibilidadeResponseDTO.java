package com.marcos.music.dto.Disponibilidade;

/**
 * Representa um slot da tabela disponibilidade para leitura.
 * Contém apenas os flags de disponibilidade e reposição sem lógica de aula.
 */
public record DisponibilidadeResponseDTO(
        Long id,
        String diaSemana,
        String horario,
        Boolean disponivel,
        Boolean reposicao
) {}
