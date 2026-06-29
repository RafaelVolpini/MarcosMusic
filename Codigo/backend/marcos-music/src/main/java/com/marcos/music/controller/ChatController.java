package com.marcos.music.controller;

import com.marcos.music.dto.Chat.ChatDTO;
import com.marcos.music.dto.Chat.ChatMensagemDTO;
import com.marcos.music.dto.Chat.NovaMensagemDTO;
import com.marcos.music.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatService service;

    public ChatController(ChatService service) {
        this.service = service;
    }

    /** Lista todos os chats  usado pelo professor */
    @GetMapping
    public List<ChatDTO> listar() {
        return service.listarTodos();
    }

    /** Inicia ou retorna o chat com um aluno específico */
    @PostMapping("/iniciar/{alunoId}")
    public ResponseEntity<?> iniciar(@PathVariable UUID alunoId) {
        try {
            return ResponseEntity.ok(service.iniciarOuBuscar(alunoId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Retorna o chat de um aluno (aluno busca o próprio chat) */
    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<?> porAluno(@PathVariable UUID alunoId) {
        try {
            return ResponseEntity.ok(service.iniciarOuBuscar(alunoId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Mensagens de um chat */
    @GetMapping("/{chatId}/mensagens")
    public List<ChatMensagemDTO> mensagens(@PathVariable Long chatId) {
        return service.getMensagens(chatId);
    }

    /** Envia uma mensagem */
    @PostMapping("/{chatId}/mensagem")
    public ResponseEntity<?> enviar(@PathVariable Long chatId,
                                    @RequestBody NovaMensagemDTO dto) {
        try {
            return ResponseEntity.ok(service.enviarMensagem(chatId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Marca todas as mensagens do chat como lidas para o remetente informado */
    @PutMapping("/{chatId}/ler")
    public ResponseEntity<Void> marcarLidas(@PathVariable Long chatId,
                                            @RequestParam String remetente) {
        service.marcarLidas(chatId, remetente);
        return ResponseEntity.ok().build();
    }

    /** Retorna o total de mensagens não lidas (para badge no header) */
    @GetMapping("/nao-lidas")
    public ResponseEntity<Long> naoLidas(@RequestParam String remetente) {
        return ResponseEntity.ok(service.totalNaoLidas(remetente));
    }
}
