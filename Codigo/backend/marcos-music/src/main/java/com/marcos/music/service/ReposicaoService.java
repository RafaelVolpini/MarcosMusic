package com.marcos.music.service;

import com.marcos.music.dto.Reposicao.CriarReposicaoDTO;
import com.marcos.music.dto.Reposicao.ReposicaoResponseDTO;
import com.marcos.music.entity.Aluno;
import com.marcos.music.entity.Aula;
import com.marcos.music.entity.Disponibilidade;
import com.marcos.music.entity.Reposicao;
import com.marcos.music.repository.AlunoRepository;
import com.marcos.music.repository.Aula.AulaRepository;
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

    public ReposicaoService(
            ReposicaoRepository repository,
            DisponibilidadeRepository disponibilidadeRepository,
            AlunoRepository alunoRepository,
            AulaRepository aulaRepository,
            NotificacaoService notificacaoService) {
        this.repository = repository;
        this.disponibilidadeRepository = disponibilidadeRepository;
        this.alunoRepository = alunoRepository;
        this.aulaRepository = aulaRepository;
        this.notificacaoService = notificacaoService;
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
            int atual = aluno.getReposicoes() != null ? aluno.getReposicoes() : 0;
            if (atual <= 0) {
                throw new IllegalArgumentException("Créditos de reposição insuficientes");
            }
            r.getAlunos().add(aluno);
            aluno.setReposicoes(atual - 1);
            alunoRepository.save(aluno);
            notificacaoService.reposicaoAgendada(alunoId, r.getId(), r.getDataAula(),
                    r.getDisponibilidade().getHorario());
        }
        return toDTO(repository.save(r));
    }

    @Transactional
    public ReposicaoResponseDTO removerAluno(Long id, UUID alunoId) {
        Reposicao r = repository.findByIdWithAlunos(id)
                .orElseThrow(() -> new IllegalArgumentException("Reposição não encontrada"));

        boolean eraInscrito = r.getAlunos().stream().anyMatch(a -> a.getId().equals(alunoId));
        r.getAlunos().removeIf(a -> a.getId().equals(alunoId));

        // Devolve o crédito se o aluno estava inscrito e a reposição ainda não aconteceu
        if (eraInscrito && "ABERTA".equals(r.getStatus())) {
            alunoRepository.findById(alunoId).ifPresent(aluno -> {
                int atual = aluno.getReposicoes() != null ? aluno.getReposicoes() : 0;
                aluno.setReposicoes(atual + 1);
                alunoRepository.save(aluno);
            });
            notificacaoService.reposicaoRemovida(alunoId, r.getId(), r.getDataAula(),
                    r.getDisponibilidade().getHorario());
        }
        return toDTO(repository.save(r));
    }

    @Transactional
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Reposição não encontrada");
        }
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
