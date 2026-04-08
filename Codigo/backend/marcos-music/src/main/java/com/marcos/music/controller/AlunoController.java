package com.marcos.music.controller;

import com.marcos.music.dto.AlunoDTO;
import com.marcos.music.entity.Aluno;
import com.marcos.music.service.AlunoService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/aluno")
public class AlunoController {

    private final AlunoService service;

    public AlunoController(AlunoService service) {
        this.service = service;
    }

    @PostMapping("/salvar")
    public Aluno salvar(@RequestBody AlunoDTO dto){
        return service.criarAluno(dto);
    }

    @PostMapping("/{userId}/aceitar-termos")
    public Aluno aceitarTermos(@PathVariable UUID userId) {
        return service.aceitarTermos(userId);
    }
}