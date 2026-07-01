package com.marcos.music.controller;

import com.marcos.music.dto.Aula.CalendarFilterDTO;
import com.marcos.music.dto.Aula.CalendarResponseDTO;
import com.marcos.music.dto.Aula.CriarAulaDTO;
import com.marcos.music.dto.Aula.RemarcarAulaDTO;
import com.marcos.music.entity.Aula;
import com.marcos.music.entity.Usuario;
import com.marcos.music.repository.UsuarioRepository;
import com.marcos.music.service.AulaService;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/aula")
public class AulaController {
    private final AulaService service;
    private final UsuarioRepository usuarioRepository;

    public AulaController(AulaService service, UsuarioRepository usuarioRepository) {
        this.service = service;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario getUsuarioAutenticado() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return usuarioRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
    }

    private CalendarResponseDTO toDTO(Aula aula) {
        return new CalendarResponseDTO(
                aula.getId(),
                aula.getDataInicio(),
                aula.getDataFim(),
                aula.getAluno().getId(),
                aula.getAluno().getNome(),
                aula.getFlagCancelada(),
                aula.getPresencaConfirmada(),
                aula.getRecorrente(),
                aula.getFlagRealizada(),
                aula.getMeetLink(),
                aula.getIsOnline()
        );
    }

    @GetMapping("/cancelar/{id}")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(toDTO(service.cancelar(id, getUsuarioAutenticado())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/reagendar/{id}")
    public ResponseEntity<?> reagendar(@PathVariable Long id, @RequestBody RemarcarAulaDTO dto) {
        try {
            return ResponseEntity.ok(toDTO(service.reagendar(id, dto.getDataInicio(), dto.getDataFim(), getUsuarioAutenticado())));
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

    @PostMapping("/buscar")
    public List<CalendarResponseDTO> buscar(@RequestBody CalendarFilterDTO f) {
        return service.buscar(f);
    }

    @GetMapping("/buscar")
    public List<CalendarResponseDTO> buscarPorQuery(
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim
    ) {
        CalendarFilterDTO filter = new CalendarFilterDTO();
        if (dataInicio != null && !dataInicio.isBlank()) {
            filter.setDataInicio(LocalDateTime.parse(dataInicio));
        }
        if (dataFim != null && !dataFim.isBlank()) {
            filter.setDataFim(LocalDateTime.parse(dataFim));
        }
        return service.buscar(filter);
    }

    @PostMapping("/criar")
    public ResponseEntity<?> criar(@RequestBody CriarAulaDTO dto) {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }
            String email = auth.getName();
            List<CalendarResponseDTO> result = service.criar(email, dto)
                    .stream()
                    .map(this::toDTO)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/regenerate-meet")
    public ResponseEntity<?> regenerateMeet(@PathVariable Long id) {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }
            String email = auth.getName();
            return ResponseEntity.ok(toDTO(service.regenerateMeetLink(id, email)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
