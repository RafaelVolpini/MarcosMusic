package com.marcos.music.service;

import com.marcos.music.dto.Aluno.AlunoDTO;
import com.marcos.music.entity.*;
import com.marcos.music.repository.*;
import com.marcos.music.repository.Aula.AulaAlunoRepository;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlunoService {

    private final AlunoRepository repository;
    private final AuthService authService;
    private final AulaService aulaService;
    private final UsuarioRepository usuarioRepository;
    private final AulaAlunoRepository aulaAlunoRepository;

    private final static String PASS = "123456"; //trocar senha padrão

    public AlunoService(
        AlunoRepository repository, 
        AuthService authService,
        @Lazy AulaService aulaService,
        UsuarioRepository usuarioRepository,
        AulaAlunoRepository aulaAlunoRepository
    ) {
        this.repository = repository;
        this.authService = authService;
        this.aulaService = aulaService;
        this.usuarioRepository = usuarioRepository;
        this.aulaAlunoRepository =aulaAlunoRepository;
    }

    @Transactional
    public Aluno criarAluno(AlunoDTO dto) {
        if (dto.getId() != null) {
            Aluno aluno = repository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

            aluno.setNome(dto.getNome());
            aluno.setTelefone(dto.getTelefone());
            aluno.setStatus(dto.getStatus() != null ? dto.getStatus() : true);
            aluno.setTermos(dto.getTermos() != null ? dto.getTermos() : false);
            aluno.setApelido(dto.getApelido());
            aluno.setPlanoAulasMes(dto.getPlanoAulasMes());

            List<Long> idsDTO = dto.getHorarios() == null ? List.of() :
                    dto.getHorarios().stream()
                            .map(AulaAluno::getId)
                            .filter(Objects::nonNull)
                            .toList();

            if (dto.getHorarios() != null) {
                if (!idsDTO.isEmpty()) {
                    List<AulaAluno> deletados = aulaService.findDeletedsHorarios(dto.getId(), idsDTO);
                    for (AulaAluno aa : deletados) {
                        aulaService.deletePorHorario(aa);
                    }
                }

                if (aluno.getHorarios() == null) {
                    aluno.setHorarios(new ArrayList<>());
                } else {
                    aluno.getHorarios().clear();
                }

                for (AulaAluno h : dto.getHorarios()) {
                    h.setAluno(aluno); // 🔥 ESSENCIAL
                    aluno.getHorarios().add(h);
                }
            }

            aluno = repository.save(aluno);

            if (dto.getHorarios() != null) {
                for (AulaAluno a : dto.getHorarios()) {
                    if (a.getId() == null) {
                        aulaService.gerarPorHorario(a);
                    }
                }
            }

            Usuario u = usuarioRepository.findById(aluno.getId())
                    .orElseThrow(() -> new RuntimeException("Usuario não encontrado"));

            u.setEmail(dto.getEmail());
            usuarioRepository.save(u);

            return aluno;
        }

        Usuario user = authService.criarUsuario(dto.getEmail(), PASS, Role.USER);

        Aluno aluno = new Aluno();
        aluno.setNome(dto.getNome());
        aluno.setTelefone(dto.getTelefone());
        aluno.setTermos(dto.getTermos() != null ? dto.getTermos() : false);
        aluno.setStatus(dto.getStatus() != null ? dto.getStatus() : true);
        aluno.setApelido(dto.getApelido());
        aluno.setPlanoAulasMes(dto.getPlanoAulasMes());

        aluno.setUsuario(user); 

        aluno = repository.save(aluno);

        if (dto.getHorarios() != null) {
            for (AulaAluno h : dto.getHorarios()) {
                h.setAluno(aluno);
                aulaAlunoRepository.save(h);
            }
        }

        if (dto.getHorarios() != null) {
            for (AulaAluno a : dto.getHorarios()) {
                aulaService.gerarPorHorario(a);
            }
        }

        return aluno;
    }

    public Aluno aceitarTermos(UUID userId) {
        Aluno aluno = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        aluno.setTermos(true);
        return repository.save(aluno);
    }

    public Aluno swapStatus(UUID uid){
        Aluno aluno = repository.findById(uid)
                    .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        aluno.setStatus(!aluno.getStatus());

        return repository.save(aluno);
    }

    @Transactional
    public Aluno resetarTermos(UUID alunoId) {
        Aluno aluno = repository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
        aluno.setTermos(false);
        return repository.save(aluno);
    }

    public boolean jaAceitouTermos(UUID userId) {
        return repository.findById(userId)
                .map(Aluno::getTermos)
                .orElse(false);
    }

    public void adicionarReposicao(Aluno a, Integer creditos){
        a.setReposicoes(a.getReposicoes() + creditos);

        repository.save(a);
    }

    public void adicionarReposicao(Aluno a){
        a.setReposicoes(a.getReposicoes() + 1);

        repository.save(a);
    }

    public List<AlunoDTO> listarTodos() {
        return repository.findAll().stream()
                .filter(aluno -> aluno.getUsuario() == null || aluno.getUsuario().getRole() != Role.ADMIN)
                .map(aluno -> {
                    AlunoDTO dto = new AlunoDTO();
                    dto.setId(aluno.getId());
                    dto.setNome(aluno.getNome());
                    dto.setTelefone(aluno.getTelefone());
                    dto.setStatus(aluno.getStatus());
                    dto.setReposicoes(aluno.getReposicoes());
                    dto.setTermos(aluno.getTermos());
                    if (aluno.getUsuario() != null) {
                        dto.setEmail(aluno.getUsuario().getEmail());
                    }
                    dto.setApelido(aluno.getApelido());
                    dto.setPlanoAulasMes(aluno.getPlanoAulasMes());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletarAluno(UUID id) {
        Aluno aluno = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado"));
        repository.delete(aluno);          // JPA cascade → AulaAluno; DB cascade → Aula
        usuarioRepository.deleteById(id); // remove o login
    }
}
