package com.marcos.music.service;

import com.marcos.music.dto.Notificacao.NotificacaoDTO;
import com.marcos.music.entity.Notificacao;
import com.marcos.music.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository repository;

    private static final DateTimeFormatter FMT_DT = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");
    private static final DateTimeFormatter FMT_D  = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ─── Criação genérica ───────────────────────────────────────────────────────

    public Notificacao criar(String destinatario, String tipo, String titulo, String mensagem, Long refId) {
        Notificacao n = new Notificacao();
        n.setDestinatario(destinatario);
        n.setTipo(tipo);
        n.setTitulo(titulo);
        n.setMensagem(mensagem);
        n.setRefId(refId);
        return repository.save(n);
    }

    public void criarParaAluno(UUID alunoId, String tipo, String titulo, String mensagem, Long refId) {
        criar(alunoId.toString(), tipo, titulo, mensagem, refId);
    }

    public void criarParaProfessor(String tipo, String titulo, String mensagem, Long refId) {
        criar(Notificacao.DESTINATARIO_PROFESSOR, tipo, titulo, mensagem, refId);
    }

    // ─── Lembrete com deduplicação (evita spam) ─────────────────────────────────

    public void criarLembreteSeDuplicado(String destinatario, String tipo, Long refId,
                                          String titulo, String mensagem) {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        boolean jaExiste = repository.existsByDestinatarioAndTipoAndRefIdAndCriadaEmAfter(
                destinatario, tipo, refId, inicioDia);
        if (!jaExiste) {
            criar(destinatario, tipo, titulo, mensagem, refId);
        }
    }

    // ─── Consulta ────────────────────────────────────────────────────────────────

    public List<NotificacaoDTO> listar(String destinatario) {
        return repository.findByDestinatarioOrderByCriadaEmDesc(destinatario)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public long contarNaoLidas(String destinatario) {
        return repository.countByDestinatarioAndLidaFalse(destinatario);
    }

    // ─── Marcação como lida ──────────────────────────────────────────────────────

    @Transactional
    public void marcarLida(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setLida(true);
            repository.save(n);
        });
    }

    @Transactional
    public void marcarTodasLidas(String destinatario) {
        repository.marcarTodasLidas(destinatario);
    }

    // ─── Factories de mensagem por evento ────────────────────────────────────────

    /** Aluno: confirme sua presença (mesmo dia da aula) */
    public void lembreteHoje(UUID alunoId, Long aulaId, LocalDateTime dataAula) {
        String horario = dataAula.format(DateTimeFormatter.ofPattern("HH:mm"));
        criarLembreteSeDuplicado(
                alunoId.toString(), Notificacao.LEMBRETE_HOJE, aulaId,
                "Confirme sua presença",
                "Você tem aula hoje às " + horario + ". Confirme sua presença!"
        );
    }

    /** Aluno: lembrete da aula amanhã */
    public void lembreteAmanha(UUID alunoId, Long aulaId, LocalDateTime dataAula) {
        String horario = dataAula.format(DateTimeFormatter.ofPattern("HH:mm"));
        criarLembreteSeDuplicado(
                alunoId.toString(), Notificacao.LEMBRETE_AMANHA, aulaId,
                "Lembrete de aula amanhã",
                "Lembre-se da sua aula amanhã às " + horario + "."
        );
    }

    /** Aluno: aula agendada */
    public void aulaAgendada(UUID alunoId, Long aulaId, LocalDateTime dataAula) {
        criarParaAluno(alunoId, Notificacao.AULA_AGENDADA,
                "Aula agendada",
                "Sua aula foi agendada para " + dataAula.format(FMT_DT) + ".",
                aulaId);
    }

    /** Aluno: aula reagendada */
    public void aulaReagendada(UUID alunoId, Long aulaId, LocalDateTime novaData) {
        criarParaAluno(alunoId, Notificacao.AULA_REAGENDADA,
                "Aula reagendada",
                "Sua aula foi reagendada para " + novaData.format(FMT_DT) + ".",
                aulaId);
    }

    /** Professor: aluno confirmou presença */
    public void alunoConfirmouPresenca(String nomeAluno, Long aulaId, LocalDateTime dataAula) {
        criarParaProfessor(Notificacao.CONFIRMOU_PRESENCA,
                "Presença confirmada",
                nomeAluno + " confirmou presença para a aula de " + dataAula.format(FMT_DT) + ".",
                aulaId);
    }

    /** Professor: aluno cancelou aula */
    public void alunoCancelou(String nomeAluno, Long aulaId, LocalDateTime dataAula) {
        criarParaProfessor(Notificacao.AULA_CANCELADA,
                "Aula cancelada",
                nomeAluno + " cancelou a aula de " + dataAula.format(FMT_DT) + ".",
                aulaId);
    }

    /** Aluno: inscrito em reposição */
    public void reposicaoAgendada(UUID alunoId, Long reposicaoId, LocalDate data, String horario) {
        criarParaAluno(alunoId, Notificacao.REPOSICAO_AGENDADA,
                "Reposição agendada",
                "Você foi inscrito em uma reposição no dia " + data.format(FMT_D) + " às " + horario + ".",
                reposicaoId);
    }

    /** Aluno: removido de reposição */
    public void reposicaoRemovida(UUID alunoId, Long reposicaoId, LocalDate data, String horario) {
        criarParaAluno(alunoId, Notificacao.REPOSICAO_REMOVIDA,
                "Removido de reposição",
                "Você foi removido da reposição do dia " + data.format(FMT_D) + " às " + horario + ".",
                reposicaoId);
    }

    /** Professor ou aluno: nova mensagem de chat */
    public void novaMensagem(String destinatario, String remetente, Long chatId) {
        criarLembreteSeDuplicado(
                destinatario, Notificacao.NOVA_MENSAGEM, chatId,
                "Nova mensagem",
                remetente + " enviou uma mensagem."
        );
    }

    // ─── Conversão DTO ───────────────────────────────────────────────────────────

    private NotificacaoDTO toDTO(Notificacao n) {
        return new NotificacaoDTO(
                n.getId(), n.getDestinatario(), n.getTipo(),
                n.getTitulo(), n.getMensagem(), n.isLida(),
                n.getCriadaEm(), n.getRefId());
    }
}
