package com.marcos.music.dto;
import java.time.LocalDate;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlunoDTO {
    private UUID id;
    private String email;
    private String passwaord;
    private String cpf;
    private String endereco;
    private LocalDate dataNascimento;
    private String telefone;
    private Boolean termos;
}
