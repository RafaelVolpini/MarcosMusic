package com.marcos.music.dto.Auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponse {

    private String token;
    private Boolean termos;
    private LocalDateTime ultimoLogin;
    private String nome;
    private String telefone;
    private String role;
    private java.util.UUID id;

    public LoginResponse(String token) {
        this.token = token;
    }

    public LoginResponse(String token, Boolean termos) {
        this.token = token;
        this.termos = termos;
    }

    public LoginResponse(String token, Boolean termos, LocalDateTime ultimoLogin) {
        this.token = token;
        this.termos = termos;
        this.ultimoLogin = ultimoLogin;
    }
}
