package com.marcos.music.dto.Aula;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CalendarFilterDTO {
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
}
