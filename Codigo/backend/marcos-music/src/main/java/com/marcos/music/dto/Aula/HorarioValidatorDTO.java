package com.marcos.music.dto.Aula;

import java.time.LocalTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HorarioValidatorDTO {
    private Integer dia;
    private LocalTime horarioInicio;
    private LocalTime horarioFim;
}
