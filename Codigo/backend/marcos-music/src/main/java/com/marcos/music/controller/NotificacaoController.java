package com.marcos.music.controller;

import com.marcos.music.dto.Notificacao.NotificacaoDTO;
import com.marcos.music.service.NotificacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificacao")
public class NotificacaoController {

    private final NotificacaoService service;

    public NotificacaoController(NotificacaoService service) {
        this.service = service;
    }

    /**
     * Lista notificações de um destinatário.
     * GET /notificacao?dest=PROFESSOR  ou  GET /notificacao?dest={uuid-aluno}
     */
    @GetMapping
    public List<NotificacaoDTO> listar(@RequestParam String dest) {
        return service.listar(dest);
    }

    /**
     * Conta não lidas.
     * GET /notificacao/nao-lidas?dest=...
     */
    @GetMapping("/nao-lidas")
    public ResponseEntity<Long> naoLidas(@RequestParam String dest) {
        return ResponseEntity.ok(service.contarNaoLidas(dest));
    }

    /**
     * Marca uma notificação como lida.
     * PUT /notificacao/{id}/ler
     */
    @PutMapping("/{id}/ler")
    public ResponseEntity<Void> marcarLida(@PathVariable Long id) {
        service.marcarLida(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Marca todas as notificações de um destinatário como lidas.
     * PUT /notificacao/ler-todas?dest=...
     */
    @PutMapping("/ler-todas")
    public ResponseEntity<Void> marcarTodasLidas(@RequestParam String dest) {
        service.marcarTodasLidas(dest);
        return ResponseEntity.ok().build();
    }
}
