package com.marcos.music.dto.Auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthDTO {
    private String email;
    private String password;
    // campos extras usados apenas no registro
    private String nome;
    private String sobrenome;
    private String telefone;
}
