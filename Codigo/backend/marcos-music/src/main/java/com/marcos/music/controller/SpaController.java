package com.marcos.music.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // Catch-all: encaminha para index.html qualquer rota GET que não seja de API ou asset estático.
    // O regex exclui os prefixos de API conhecidos e extensões de arquivo (assets, js, css, etc).
    @GetMapping(value = {
        "/",
        "/{path:^(?!aula|aluno|auth|disponibilidade|reposicao|credito-reposicao|chat|notificacao|google|upload-modulo|swagger-ui|v3|error|assets)([^.]*)$}",
        "/{path:^(?!aula|aluno|auth|disponibilidade|reposicao|credito-reposicao|chat|notificacao|google|upload-modulo|swagger-ui|v3|error|assets)([^.]*)$}/**"
    })
    public String spa() {
        return "forward:/index.html";
    }
}
