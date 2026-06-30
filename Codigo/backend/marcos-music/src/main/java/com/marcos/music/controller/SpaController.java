package com.marcos.music.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // Redireciona todas as rotas não-API para o index.html do React
    @GetMapping(value = {
        "/",
        "/login",
        "/registro",
        "/agenda",
        "/alunos",
        "/modulos",
        "/perfil",
        "/recuperar-senha",
        "/chat",
        "/configuracoes"
    })
    public String spa() {
        return "forward:/index.html";
    }
}
