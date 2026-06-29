package com.marcos.music.dto.Chat;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatDTO(
        Long id,
        UUID alunoId,
        String alunoNome,
        String ultimaMensagem,
        LocalDateTime ultimaMensagemEm,
        long naoLidas
) {}
