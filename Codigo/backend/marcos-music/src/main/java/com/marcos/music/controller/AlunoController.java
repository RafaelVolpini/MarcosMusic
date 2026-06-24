package com.marcos.music.controller;

import com.marcos.music.dto.Aluno.AlunoDTO;
import com.marcos.music.dto.Aula.HorarioValidatorDTO;
import com.marcos.music.entity.Aluno;
import com.marcos.music.service.AlunoService;
import com.marcos.music.service.AulaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<?> salvar(@RequestBody AlunoDTO dto) {
        try {
            return ResponseEntity.ok(service.criarAluno(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @GetMapping
    public List<AlunoDTO> listarTodos() {
        return service.listarTodos();
    }

    @PostMapping("/{userId}/aceitar-termos")
    public Aluno aceitarTermos(@PathVariable("userId") UUID userId) {
        return service.aceitarTermos(userId);
    }

    @GetMapping("/swap-status/{id}")
    public Aluno swapStatus(@PathVariable UUID id) {
        return service.swapStatus(id);
    }

    @PostMapping("/dev/reset-termos/{alunoId}")
    public ResponseEntity<?> resetTermos(@PathVariable UUID alunoId) {
        try {
            Aluno aluno = service.resetarTermos(alunoId);
            return ResponseEntity.ok("✅ Termos resetados para: " + aluno.getNome());
        } catch (Exception e) {
            return ResponseEntity.status(404).body("❌ Erro: " + e.getMessage());
        }
    }

    @PostMapping("validar-horario")
    public Boolean validarHorario(@RequestBody HorarioValidatorDTO dto){
        return aService.validarHorarioSemana(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        try {
            service.deletarAluno(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).build();
        }
    }

}