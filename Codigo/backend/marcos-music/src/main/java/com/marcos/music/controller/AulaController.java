package com.marcos.music.controller;

import com.marcos.music.dto.Aula.CalendarFilterDTO;
import com.marcos.music.dto.Aula.CalendarResponseDTO;
import com.marcos.music.entity.Aula;
import com.marcos.music.service.AulaService;

import java.util.List;

import org.springframework.web.bind.annotation.*;




@RestController
@RequestMapping("/aula")
public class AulaController {
    private final AulaService service;

    public AulaController(AulaService service) {
        this.service = service;
    }

    @GetMapping("/cancelar/{id}")
    public Aula cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }

    @PostMapping("buscar")
    public List<CalendarResponseDTO> buscar(@RequestBody CalendarFilterDTO f) {
        return service.buscar(f);
    }
    
}
