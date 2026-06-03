package com.marcos.music.repository;

import com.marcos.music.entity.ChatMensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChatMensagemRepository extends JpaRepository<ChatMensagem, Long> {

    List<ChatMensagem> findByChatIdOrderByCriadaEmAsc(Long chatId);

    long countByChatIdAndLidaFalseAndRemetenteNot(Long chatId, String remetente);

    @Modifying
    @Transactional
    @Query("UPDATE ChatMensagem m SET m.lida = true WHERE m.chat.id = :chatId AND m.remetente != :remetente AND m.lida = false")
    void marcarComoLidasPor(@Param("chatId") Long chatId, @Param("remetente") String remetente);

    @Query("SELECT COUNT(m) FROM ChatMensagem m JOIN m.chat c WHERE m.lida = false AND m.remetente != :remetente")
    long totalNaoLidasPara(@Param("remetente") String remetente);
}
