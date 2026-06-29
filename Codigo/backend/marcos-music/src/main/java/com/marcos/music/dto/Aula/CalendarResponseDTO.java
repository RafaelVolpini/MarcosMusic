package com.marcos.music.dto.Aula;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CalendarResponseDTO {
    private Long id;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private UUID idAluno;
    private String nomeAluno;
    private Boolean flagCancelada;
    private Boolean presencaConfirmada;
    private Boolean recorrente;
    private Boolean flagRealizada;
    private String meetLink;
    private Boolean isOnline;
}
