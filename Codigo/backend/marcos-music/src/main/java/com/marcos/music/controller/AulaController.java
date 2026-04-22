package com.marcos.music.controller;

import com.marcos.music.dto.Aula.CalendarFilterDTO;
import com.marcos.music.dto.Aula.CalendarResponseDTO;
import com.marcos.music.dto.Aula.CriarAulaDTO;
import com.marcos.music.dto.Aula.RemarcarAulaDTO;
import com.marcos.music.entity.Aula;
import com.marcos.music.security.JwtService;
import com.marcos.music.service.AulaService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/aula")
public class AulaController {
    private final AulaService service;
    private final JwtService jwtService;

    public AulaController(AulaService service, JwtService jwtService) {
        this.service = service;
        this.jwtService = jwtService;
    }

    private CalendarResponseDTO toDTO(Aula aula) {
        return new CalendarResponseDTO(
                aula.getId(),
                aula.getDataInicio(),
                aula.getDataFim(),
                aula.getAluno().getId(),
                aula.getAluno().getNome(),
                aula.getFlagCancelada(),
                aula.getPresencaConfirmada()
        );
    }

    @GetMapping("/cancelar/{id}")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(toDTO(service.cancelar(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/reagendar/{id}")
    public ResponseEntity<?> reagendar(@PathVariable Long id, @RequestBody RemarcarAulaDTO dto) {
        try {
            return ResponseEntity.ok(toDTO(service.reagendar(id, dto.getDataInicio(), dto.getDataFim())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/confirmarPresenca/{id}")
    public ResponseEntity<?> confirmarPresenca(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(toDTO(service.confirmarPresenca(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("buscar")
    public List<CalendarResponseDTO> buscar(@RequestBody CalendarFilterDTO f) {
        return service.buscar(f);
    }

    @PostMapping("/criar")
    public ResponseEntity<?> criar(
            @RequestBody CriarAulaDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }
            String email = jwtService.getEmailFromToken(authHeader.substring(7));
            return ResponseEntity.ok(toDTO(service.criar(email, dto)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
