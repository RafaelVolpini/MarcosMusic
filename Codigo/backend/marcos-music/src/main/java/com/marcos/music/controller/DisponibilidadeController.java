package com.marcos.music.controller;

import com.marcos.music.dto.Disponibilidade.DisponibilidadeResponseDTO;
import com.marcos.music.dto.Disponibilidade.SalvarDisponibilidadeRequestDTO;
import com.marcos.music.service.DisponibilidadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/disponibilidade")
public class DisponibilidadeController {

    private final DisponibilidadeService service;

    public DisponibilidadeController(DisponibilidadeService service) {
        this.service = service;
    }

    /** Lista todos os slots de disponibilidade cadastrados. */
    @GetMapping
    public List<DisponibilidadeResponseDTO> listar() {
        return service.listar();
    }

    /**
     * Salva (upsert) a disponibilidade semanal completa.
     * Recebe availability + availabilityReposicao no mesmo formato que o frontend usa.
     */
    @PostMapping("/salvar")
    public ResponseEntity<?> salvar(@RequestBody SalvarDisponibilidadeRequestDTO dto) {
        try {
            return ResponseEntity.ok(service.salvar(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

