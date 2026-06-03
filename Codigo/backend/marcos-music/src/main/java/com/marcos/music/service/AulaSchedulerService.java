package com.marcos.music.service;

import com.marcos.music.repository.Aula.AulaRepository;
import com.marcos.music.repository.ReposicaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AulaSchedulerService {

    private final AulaRepository aulaRepository;
    private final ReposicaoRepository reposicaoRepository;
    private final NotificacaoService notificacaoService;

    /**
     * Executa a cada minuto.
     * – Marca aulas cujo dataFim já passou como flag_realizada = true.
     * – Marca reposições ABERTA cujo horário + 50 min já passou como REALIZADA.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void encerrarFinalizados() {
        LocalDateTime agora = LocalDateTime.now();

        // ── Aulas ────────────────────────────────────────────────────────────
        var aulasVencidas = aulaRepository
                .findByFlagCanceladaFalseAndFlagRealizadaFalseAndDataFimBefore(agora);

        aulasVencidas.forEach(a -> a.setFlagRealizada(true));
        if (!aulasVencidas.isEmpty()) {
            aulaRepository.saveAll(aulasVencidas);
            log.info("[Scheduler] {} aula(s) marcada(s) como REALIZADA", aulasVencidas.size());
        }

        // ── Reposições ───────────────────────────────────────────────────────
        var reposVencidas = reposicaoRepository.findAbertas().stream()
                .filter(r -> {
                    String horario = r.getDisponibilidade().getHorario(); // "HH:mm"
                    LocalTime inicio = LocalTime.parse(horario);
                    LocalDateTime fim = LocalDateTime.of(r.getDataAula(), inicio).plusMinutes(50);
                    return fim.isBefore(agora);
                })
                .toList();

        reposVencidas.forEach(r -> r.setStatus("REALIZADA"));
        if (!reposVencidas.isEmpty()) {
            reposicaoRepository.saveAll(reposVencidas);
            log.info("[Scheduler] {} reposição(ões) marcada(s) como REALIZADA", reposVencidas.size());
        }
    }

    /**
     * A cada hora, gera notificações de lembrete:
     * – "Sua aula é amanhã" para aulas que começam no próximo dia.
     * – "Confirme sua presença" para aulas que começam hoje (ainda não confirmadas).
     */
    @Scheduled(fixedRate = 3_600_000) // a cada 1 hora
    @Transactional
    public void enviarLembretes() {
        LocalDate hoje = LocalDate.now();
        LocalDate amanha = hoje.plusDays(1);

        // Lembrete de hoje (confirmar presença)
        var aulasHoje = aulaRepository
                .findByFlagCanceladaFalseAndFlagRealizadaFalseAndDataFimAfter(LocalDateTime.now())
                .stream()
                .filter(a -> a.getDataInicio().toLocalDate().equals(hoje)
                          && !Boolean.TRUE.equals(a.getPresencaConfirmada()))
                .toList();

        for (var aula : aulasHoje) {
            notificacaoService.lembreteHoje(aula.getAluno().getId(), aula.getId(), aula.getDataInicio());
        }
        if (!aulasHoje.isEmpty()) {
            log.info("[Scheduler] {} lembrete(s) de hoje enviado(s)", aulasHoje.size());
        }

        // Lembrete de amanhã
        var aulasAmanha = aulaRepository
                .findByFlagCanceladaFalseAndFlagRealizadaFalseAndDataFimAfter(LocalDateTime.now())
                .stream()
                .filter(a -> a.getDataInicio().toLocalDate().equals(amanha))
                .toList();

        for (var aula : aulasAmanha) {
            notificacaoService.lembreteAmanha(aula.getAluno().getId(), aula.getId(), aula.getDataInicio());
        }
        if (!aulasAmanha.isEmpty()) {
            log.info("[Scheduler] {} lembrete(s) de amanhã enviado(s)", aulasAmanha.size());
        }
    }
}
