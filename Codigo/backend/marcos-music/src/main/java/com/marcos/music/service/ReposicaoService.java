package com.marcos.music.service;

import com.marcos.music.dto.Reposicao.CriarReposicaoDTO;
import com.marcos.music.dto.Reposicao.ReposicaoResponseDTO;
import com.marcos.music.entity.Aluno;
import com.marcos.music.entity.Aula;
import com.marcos.music.entity.CreditoReposicao;
import com.marcos.music.entity.Disponibilidade;
import com.marcos.music.entity.Reposicao;
import com.marcos.music.repository.AlunoRepository;
import com.marcos.music.repository.Aula.AulaRepository;
import com.marcos.music.repository.CreditoReposicaoRepository;
import com.marcos.music.repository.DisponibilidadeRepository;
import com.marcos.music.repository.ReposicaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReposicaoService {

    private final ReposicaoRepository repository;
    private final DisponibilidadeRepository disponibilidadeRepository;
    private final AlunoRepository alunoRepository;
    private final AulaRepository aulaRepository;
    private final NotificacaoService notificacaoService;
    private final CreditoReposicaoService creditoReposicaoService;
    private final CreditoReposicaoRepository creditoReposicaoRepository;

    public ReposicaoService(
            ReposicaoRepository repository,
            DisponibilidadeRepository disponibilidadeRepository,
            AlunoRepository alunoRepository,
            AulaRepository aulaRepository,
            NotificacaoService notificacaoService,
            CreditoReposicaoService creditoReposicaoService,
            CreditoReposicaoRepository creditoReposicaoRepository) {
        this.repository = repository;
        this.disponibilidadeRepository = disponibilidadeRepository;
        this.alunoRepository = alunoRepository;
        this.aulaRepository = aulaRepository;
        this.notificacaoService = notificacaoService;
        this.creditoReposicaoService = creditoReposicaoService;
        this.creditoReposicaoRepository = creditoReposicaoRepository;
    }

    public List<ReposicaoResponseDTO> listar() {
        return repository.findAllWithAlunos().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReposicaoResponseDTO criar(CriarReposicaoDTO dto) {
        Disponibilidade disp = disponibilidadeRepository.findById(dto.getDisponibilidadeId())
                .orElseThrow(() -> new IllegalArgumentException("Slot de disponibilidade não encontrado"));

        Reposicao r = new Reposicao();
        r.setDisponibilidade(disp);
        r.setDataAula(dto.getDataAula());
        r.setObservacao(dto.getObservacao());
        r.setStatus("ABERTA");

        if (dto.getAulaId() != null) {
            Aula aula = aulaRepository.findById(dto.getAulaId())
                    .orElseThrow(() -> new IllegalArgumentException("Aula não encontrada: " + dto.getAulaId()));
            r.setAula(aula);
        }

        if (dto.getAlunoIds() != null && !dto.getAlunoIds().isEmpty()) {
            List<Aluno> alunos = dto.getAlunoIds().stream()
                    .map(id -> alunoRepository.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado: " + id)))
                    .collect(Collectors.toList());
            r.setAlunos(alunos);
        }

        return toDTO(repository.save(r));
    }

    @Transactional
    public ReposicaoResponseDTO adicionarAluno(Long id, UUID alunoId) {
        Reposicao r = repository.findByIdWithAlunos(id)
                .orElseThrow(() -> new IllegalArgumentException("Reposição não encontrada"));
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado"));

        boolean jaAdicionado = r.getAlunos().stream().anyMatch(a -> a.getId().equals(alunoId));
        if (!jaAdicionado) {
            // Verifica se aluno tem créditos disponíveis
            int creditosDisponiveis = creditoReposicaoService.contarCreditosDisponiveis(alunoId);
            if (creditosDisponiveis <= 0) {
                throw new IllegalArgumentException("Créditos de reposição insuficientes");
            }

            // Consome um crédito
            CreditoReposicao creditoUsado = creditoReposicaoService.consumirCredito(alunoId, id);

            r.getAlunos().add(aluno);
            repository.save(r);

            notificacaoService.reposicaoAgendada(alunoId, r.getId(), r.getDataAula(),
                    r.getDisponibilidade().getHorario());

            // Notifica professor que aluno marcou reposição
            notificacaoService.criarParaProfessor(
                    "REPOSICAO_AGENDADA",
                    "Nova reposição marcada",
                    aluno.getNome() + " marcou reposição para " + r.getDataAula() + " às " + r.getDisponibilidade().getHorario(),
                    r.getId()
            );
        }
        return toDTO(repository.save(r));
    }

    @Transactional
    public ReposicaoResponseDTO removerAluno(Long id, UUID alunoId) {
        Reposicao r = repository.findByIdWithAlunos(id)
                .orElseThrow(() -> new IllegalArgumentException("Reposição não encontrada"));

        boolean eraInscrito = r.getAlunos().stream().anyMatch(a -> a.getId().equals(alunoId));
        r.getAlunos().removeIf(a -> a.getId().equals(alunoId));

        // Devolve o crédito se o aluno estava inscrito e a reposição ainda está ABERTA
        if (eraInscrito && "ABERTA".equals(r.getStatus())) {
            // Encontra o crédito USADO para esta reposição
            CreditoReposicao creditoUsado = creditoReposicaoRepository
                    .findByAlunoIdOrderByDataCriacaoDesc(alunoId)
                    .stream()
                    .filter(c -> c.getReposicao() != null && c.getReposicao().getId().equals(id))
                    .filter(c -> CreditoReposicao.STATUS_USADO.equals(c.getStatus()))
                    .findFirst()
                    .orElse(null);

            if (creditoUsado != null) {
                creditoReposicaoService.devolverCredito(creditoUsado.getId());
            }

            notificacaoService.reposicaoRemovida(alunoId, r.getId(), r.getDataAula(),
                    r.getDisponibilidade().getHorario());
        }
        return toDTO(repository.save(r));
    }

    @Transactional
    public void deletar(Long id) {
        Reposicao r = repository.findByIdWithAlunos(id)
                .orElseThrow(() -> new IllegalArgumentException("Reposição não encontrada"));

        // Devolve créditos USADO dos alunos inscritos
        for (Aluno aluno : r.getAlunos()) {
            UUID alunoId = aluno.getId();
            creditoReposicaoRepository
                    .findByReposicaoId(id)
                    .stream()
                    .filter(c -> c.getAluno().getId().equals(alunoId)
                            && CreditoReposicao.STATUS_USADO.equals(c.getStatus()))
                    .findFirst()
                    .ifPresent(c -> creditoReposicaoService.devolverCredito(c.getId()));
        }

        // Desvincula créditos desta reposição (evita FK violation em credito_reposicao)
        creditoReposicaoRepository.findByReposicaoId(id)
                .forEach(c -> {
                    c.setReposicao(null);
                    creditoReposicaoRepository.save(c);
                });

        // Limpa a tabela join reposicao_aluno (evita FK violation)
        r.getAlunos().clear();
        repository.save(r);
        repository.deleteById(id);
    }

    private ReposicaoResponseDTO toDTO(Reposicao r) {
        List<ReposicaoResponseDTO.AlunoResumo> alunos = r.getAlunos().stream()
                .map(a -> new ReposicaoResponseDTO.AlunoResumo(a.getId(), a.getNome()))
                .collect(Collectors.toList());
        return new ReposicaoResponseDTO(
                r.getId(),
                r.getDisponibilidade().getId(),
                r.getDisponibilidade().getDiaSemana(),
                r.getDisponibilidade().getHorario(),
                r.getDataAula(),
                r.getStatus(),
                r.getObservacao(),
                alunos,
                r.getAula() != null ? r.getAula().getId() : null
        );
    }
}
