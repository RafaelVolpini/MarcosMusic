package com.marcos.music.dto.Disponibilidade;

import java.util.List;
import java.util.Map;

/**
 * Payload enviado pelo frontend para salvar a disponibilidade semanal.
 *
 * availability         → mapa dia→lista de horários disponíveis (ex: {"mon":["09:00","10:00"]})
 * availabilityReposicao → mapa dia→lista de horários de reposição
 */
public record SalvarDisponibilidadeRequestDTO(
        Map<String, List<String>> availability,
        Map<String, List<String>> availabilityReposicao
) {}
