package com.marcos.music.repository;

import com.marcos.music.entity.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    /** Todas as notificações de um destinatário, mais recentes primeiro */
    List<Notificacao> findByDestinatarioOrderByCriadaEmDesc(String destinatario);

    /** Conta não lidas */
    long countByDestinatarioAndLidaFalse(String destinatario);

    /** Marca todas como lidas para um destinatário */
    @Modifying
    @Transactional
    @Query("UPDATE Notificacao n SET n.lida = true WHERE n.destinatario = :dest AND n.lida = false")
    void marcarTodasLidas(@Param("dest") String destinatario);

    /** Evita duplicatas de lembrete no mesmo dia para a mesma aula */
    boolean existsByDestinatarioAndTipoAndRefIdAndCriadaEmAfter(
            String destinatario, String tipo, Long refId, LocalDateTime after);
}
