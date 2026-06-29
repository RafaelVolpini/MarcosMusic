package com.marcos.music.dto.Notificacao;

import java.time.LocalDateTime;

public record NotificacaoDTO(
        Long id,
        String destinatario,
        String tipo,
        String titulo,
        String mensagem,
        boolean lida,
        LocalDateTime criadaEm,
        Long refId
) {}
