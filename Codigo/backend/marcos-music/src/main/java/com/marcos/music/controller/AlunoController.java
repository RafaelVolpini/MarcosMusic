package com.marcos.music.controller;

import com.marcos.music.dto.Aluno.AlunoDTO;
import com.marcos.music.dto.Aula.HorarioValidatorDTO;
import com.marcos.music.entity.Aluno;
import com.marcos.music.service.AlunoService;
import com.marcos.music.service.AulaService;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/aluno")
public class AlunoController {

    private final AlunoService service;
    private final AulaService aService;

    public AlunoController(AlunoService service, AulaService aService) {
        this.service = service;
        this.aService = aService;
    }

    @PostMapping("/salvar")
    public Aluno salvar(@RequestBody AlunoDTO dto){
        return service.criarAluno(dto);
    }

    @PostMapping("/{userId}/aceitar-termos")
    public Aluno aceitarTermos(@PathVariable UUID uid) {
        return service.aceitarTermos(uid);
    }

    @GetMapping("/swap-status/{id}")
    public Aluno getMethodName(@PathVariable UUID uid) {
        return service.swapStatus(uid);
    }

    @PostMapping("validar-horario")
    public Boolean validarHorario(@RequestBody HorarioValidatorDTO dto){
        return aService.validarHorarioSemana(dto);
    }
    
}