package com.marcos.music.service;

import com.marcos.music.entity.Aluno;
import com.marcos.music.entity.Aula;
import com.marcos.music.entity.CreditoReposicao;
import com.marcos.music.repository.CreditoReposicaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditoReposicaoService {

    private final CreditoReposicaoRepository repository;
    private final NotificacaoService notificacaoService;

    /**
     * Gera crédito de reposição se o aluno cancelou a aula até 23:00 do dia anterior
     *
     * @param aula aula que foi cancelada
     * @param dataSolicitacaoCancelamento quando o aluno solicitou o cancelamento
     * @return true se crédito foi gerado, false caso contrário
     */
    @Transactional
    public boolean gerarCreditoSeCancelamentoValido(Aula aula, LocalDateTime dataSolicitacaoCancelamento) {
        LocalDateTime inicioAula = aula.getDataInicio();
        LocalDateTime dataLimiteCancelamento = inicioAula.minusDays(1).withHour(23).withMinute(0).withSecond(0);

        // Verifica se o cancelamento foi feito até 23:00 do dia anterior
        if (dataSolicitacaoCancelamento.isAfter(dataLimiteCancelamento)) {
            log.warn("Cancelamento de aula {} fora do prazo. Solicitado em {} (limite: {})",
                    aula.getId(), dataSolicitacaoCancelamento, dataLimiteCancelamento);
            return false;
        }

        // Cancelamento válido: criar crédito
        LocalDateTime dataExpiracao = LocalDateTime.now().plusMonths(6);

        CreditoReposicao credito = CreditoReposicao.builder()
                .aluno(aula.getAluno())
                .dataCriacao(LocalDateTime.now())
                .dataExpiracao(dataExpiracao)
                .status(CreditoReposicao.STATUS_VALIDO)
                .aula(aula)
                .observacao("Crédito gerado por cancelamento de aula em " + dataSolicitacaoCancelamento.format(
                        java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .build();

        repository.save(credito);

        log.info("Crédito gerado para aluno {} (aula: {}, expira em {})",
                aula.getAluno().getId(), aula.getId(), dataExpiracao);

        // Notificar aluno
        notificacaoService.criarParaAluno(
                aula.getAluno().getId(),
                "CREDITO_GERADO",
                "Você ganhou 1 crédito de reposição",
                "Seu cancelamento foi aceito. Você ganhou 1 crédito que expira em " +
                        dataExpiracao.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                        ". Use na página de Reposições!",
                aula.getId()
        );

        return true;
    }

    /**
     * Incrementa crédito manualmente (por admin/professor)
     */
    @Transactional
    public CreditoReposicao adicionarCreditoManual(Aluno aluno, String observacao) {
        LocalDateTime dataExpiracao = LocalDateTime.now().plusMonths(6);

        CreditoReposicao credito = CreditoReposicao.builder()
                .aluno(aluno)
                .dataCriacao(LocalDateTime.now())
                .dataExpiracao(dataExpiracao)
                .status(CreditoReposicao.STATUS_VALIDO)
                .observacao(observacao != null ? observacao : "Adicionado manualmente")
                .build();

        return repository.save(credito);
    }

    /**
     * Consome um crédito do aluno (usado ao se inscrever em reposição)
     */
    @Transactional
    public CreditoReposicao consumirCredito(UUID alunoId, Long reposicaoId) {
        List<CreditoReposicao> creditosDisponveis = repository.findCreditosDisponiveisParaAluno(alunoId);

        if (creditosDisponveis.isEmpty()) {
            throw new IllegalArgumentException("Créditos de reposição insuficientes");
        }

        // Usa o crédito que expira mais cedo (FIFO)
        CreditoReposicao credito = creditosDisponveis.get(0);
        credito.setStatus(CreditoReposicao.STATUS_USADO);
        credito.setReposicao(new com.marcos.music.entity.Reposicao() {{
            setId(reposicaoId);
        }});

        return repository.save(credito);
    }

    /**
     * Devolve um crédito (quando aluno se retira de uma reposição ABERTA)
     */
    @Transactional
    public CreditoReposicao devolverCredito(Long creditoId) {
        CreditoReposicao credito = repository.findById(creditoId)
                .orElseThrow(() -> new IllegalArgumentException("Crédito não encontrado"));

        if (!CreditoReposicao.STATUS_USADO.equals(credito.getStatus())) {
            throw new IllegalArgumentException("Só é possível devolver créditos que estão USADO");
        }

        credito.setStatus(CreditoReposicao.STATUS_VALIDO);
        credito.setReposicao(null);

        return repository.save(credito);
    }

    /**
     * Conta créditos disponíveis para um aluno
     */
    public int contarCreditosDisponiveis(UUID alunoId) {
        return repository.contarCreditosDisponiveisParaAluno(alunoId);
    }

    /**
     * Retorna créditos disponíveis do aluno
     */
    public List<CreditoReposicao> listarCreditosDisponiveis(UUID alunoId) {
        return repository.findCreditosDisponiveisParaAluno(alunoId);
    }

    /**
     * Retorna histórico completo de créditos do aluno
     */
    public List<CreditoReposicao> listarHistoricoCreditosAluno(UUID alunoId) {
        return repository.findByAlunoIdOrderByDataCriacaoDesc(alunoId);
    }

    /**
     * Scheduler: marca créditos como expirados (roda a cada 1 hora)
     */
    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void expirarCreditosVencidos() {
        int expiraram = repository.expirarCreditosVencidos();
        if (expiraram > 0) {
            log.info("[Scheduler] {} crédito(s) marcado(s) como EXPIRADO", expiraram);
        }
    }

    /**
     * Calcula dias até expiração de um crédito
     */
    public int diasAteExpiracaoPrimeiroCradit(UUID alunoId) {
        List<CreditoReposicao> creditos = listarCreditosDisponiveis(alunoId);
        if (creditos.isEmpty()) {
            return 0;
        }
        return creditos.get(0).diasAteExpiracao();
    }
}
