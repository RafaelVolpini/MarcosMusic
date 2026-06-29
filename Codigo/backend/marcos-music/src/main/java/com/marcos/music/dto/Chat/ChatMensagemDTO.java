package com.marcos.music.dto.Chat;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatMensagemDTO(
        Long id,
        Long chatId,
        String remetente,
        UUID remetenteId,
        String conteudo,
        String tipo,
        boolean lida,
        LocalDateTime criadaEm
) {}
