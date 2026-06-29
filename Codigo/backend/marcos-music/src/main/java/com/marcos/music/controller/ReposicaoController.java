package com.marcos.music.controller;

import com.marcos.music.dto.Reposicao.CriarReposicaoDTO;
import com.marcos.music.dto.Reposicao.ReposicaoResponseDTO;
import com.marcos.music.service.ReposicaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reposicao")
public class ReposicaoController {

    private final ReposicaoService service;

    public ReposicaoController(ReposicaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<ReposicaoResponseDTO> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody CriarReposicaoDTO dto) {
        try {
            return ResponseEntity.ok(service.criar(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/aluno/{alunoId}")
    public ResponseEntity<?> adicionarAluno(
            @PathVariable Long id,
            @PathVariable UUID alunoId) {
        try {
            return ResponseEntity.ok(service.adicionarAluno(id, alunoId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/aluno/{alunoId}")
    public ResponseEntity<?> removerAluno(
            @PathVariable Long id,
            @PathVariable UUID alunoId) {
        try {
            return ResponseEntity.ok(service.removerAluno(id, alunoId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
