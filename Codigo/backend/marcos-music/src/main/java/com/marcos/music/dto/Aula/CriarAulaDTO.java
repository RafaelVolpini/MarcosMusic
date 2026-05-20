package com.marcos.music.dto.Aula;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CriarAulaDTO {
    private String studentId;       // UUID do aluno (obrigatório quando professor cria)
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private Boolean recorrente = false;
    private Boolean isOnline = false;
}
