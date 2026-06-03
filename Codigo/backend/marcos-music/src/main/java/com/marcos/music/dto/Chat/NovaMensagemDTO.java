package com.marcos.music.dto.Chat;

import java.util.UUID;

public record NovaMensagemDTO(
        UUID remetenteId,
        String remetente,   // "professor" ou "aluno"
        String conteudo,
        String tipo         // "text" | "image" | "video" – null = "text"
) {}
