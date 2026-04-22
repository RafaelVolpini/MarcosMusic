package com.marcos.music.dto.Aula;

import java.time.LocalDateTime;

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
}
