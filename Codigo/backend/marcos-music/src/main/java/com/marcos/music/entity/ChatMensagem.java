package com.marcos.music.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "chat_mensagem")
public class ChatMensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    /** "professor" ou "aluno" */
    @Column(name = "remetente", nullable = false, length = 20)
    private String remetente;

    @Column(name = "remetente_id", nullable = false)
    private UUID remetenteId;

    /** Conteúdo tratado como String para suportar texto, URLs de imagem/vídeo no futuro */
    @Column(name = "conteudo", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String conteudo;

    /** "text" | "image" | "video" – extensível no futuro */
    @Column(name = "tipo", nullable = false, length = 20)
    private String tipo = "text";

    @Column(name = "lida", nullable = false)
    private boolean lida = false;

    @Column(name = "criada_em", nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();
}
