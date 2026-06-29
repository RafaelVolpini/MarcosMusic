package com.marcos.music.service;

import com.marcos.music.dto.Chat.ChatDTO;
import com.marcos.music.dto.Chat.ChatMensagemDTO;
import com.marcos.music.dto.Chat.NovaMensagemDTO;
import com.marcos.music.entity.Aluno;
import com.marcos.music.entity.Chat;
import com.marcos.music.entity.ChatMensagem;
import com.marcos.music.entity.Notificacao;
import com.marcos.music.repository.AlunoRepository;
import com.marcos.music.repository.ChatMensagemRepository;
import com.marcos.music.repository.ChatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMensagemRepository mensagemRepository;
    private final AlunoRepository alunoRepository;
    private final NotificacaoService notificacaoService;

    public ChatService(ChatRepository chatRepository,
                       ChatMensagemRepository mensagemRepository,
                       AlunoRepository alunoRepository,
                       NotificacaoService notificacaoService) {
        this.chatRepository = chatRepository;
        this.mensagemRepository = mensagemRepository;
        this.alunoRepository = alunoRepository;
        this.notificacaoService = notificacaoService;
    }

    // ── Listar todos os chats (visão do professor) ────────────────────────────

    public List<ChatDTO> listarTodos() {
        return chatRepository.findAllWithAluno().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Buscar ou criar chat com um aluno ─────────────────────────────────────

    @Transactional
    public ChatDTO iniciarOuBuscar(UUID alunoId) {
        return chatRepository.findByAlunoId(alunoId)
                .map(this::toDTO)
                .orElseGet(() -> {
                    Aluno aluno = alunoRepository.findById(alunoId)
                            .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado: " + alunoId));
                    Chat chat = new Chat();
                    chat.setAluno(aluno);
                    chat.setCriadoEm(LocalDateTime.now());
                    return toDTO(chatRepository.save(chat));
                });
    }

    // ── Mensagens de um chat ──────────────────────────────────────────────────

    public List<ChatMensagemDTO> getMensagens(Long chatId) {
        return mensagemRepository.findByChatIdOrderByCriadaEmAsc(chatId).stream()
                .map(this::toMensagemDTO)
                .collect(Collectors.toList());
    }

    // ── Enviar mensagem ───────────────────────────────────────────────────────

    @Transactional
    public ChatMensagemDTO enviarMensagem(Long chatId, NovaMensagemDTO dto) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat não encontrado: " + chatId));

        ChatMensagem msg = new ChatMensagem();
        msg.setChat(chat);
        msg.setRemetente(dto.remetente());
        msg.setRemetenteId(dto.remetenteId());
        msg.setConteudo(dto.conteudo());
        msg.setTipo(dto.tipo() != null ? dto.tipo() : "text");
        msg.setLida(false);
        msg.setCriadaEm(LocalDateTime.now());

        ChatMensagem salva = mensagemRepository.save(msg);

        // Notifica o destinatário da mensagem
        String nomeRemetente = "professor".equals(dto.remetente())
                ? "Professor"
                : chat.getAluno().getNome();
        String destinatario = "professor".equals(dto.remetente())
                ? chat.getAluno().getId().toString()
                : Notificacao.DESTINATARIO_PROFESSOR;
        notificacaoService.novaMensagem(destinatario, nomeRemetente, chatId);

        return toMensagemDTO(salva);
    }

    // ── Marcar mensagens como lidas ───────────────────────────────────────────

    @Transactional
    public void marcarLidas(Long chatId, String leitorRemetente) {
        mensagemRepository.marcarComoLidasPor(chatId, leitorRemetente);
    }

    // ── Total de mensagens não lidas ──────────────────────────────────────────

    public long totalNaoLidas(String remetente) {
        return mensagemRepository.totalNaoLidasPara(remetente);
    }

    // ── Helpers de mapeamento ─────────────────────────────────────────────────

    private ChatDTO toDTO(Chat chat) {
        List<ChatMensagem> msgs = chat.getMensagens();
        ChatMensagem ultima = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1);
        long naoLidas = mensagemRepository.countByChatIdAndLidaFalseAndRemetenteNot(
                chat.getId(), "professor");

        return new ChatDTO(
                chat.getId(),
                chat.getAluno().getId(),
                chat.getAluno().getNome(),
                ultima != null ? ultima.getConteudo() : null,
                ultima != null ? ultima.getCriadaEm() : null,
                naoLidas
        );
    }

    private ChatMensagemDTO toMensagemDTO(ChatMensagem m) {
        return new ChatMensagemDTO(
                m.getId(),
                m.getChat().getId(),
                m.getRemetente(),
                m.getRemetenteId(),
                m.getConteudo(),
                m.getTipo(),
                m.isLida(),
                m.getCriadaEm()
        );
    }
}
