package com.marcos.music.service;

import com.marcos.music.dto.AlunoDTO;
import com.marcos.music.entity.*;
import com.marcos.music.repository.*;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final AuthService authService;

    public AlunoService(AlunoRepository alunoRepository, AuthService authService) {
        this.alunoRepository = alunoRepository;
        this.authService = authService;
    }

    public Aluno criarAluno(AlunoDTO dto) {
        if(dto.getId() != null){
            Aluno aluno = new Aluno(dto);
            return alunoRepository.save(aluno);
        }
        
        Usuario user = authService.criarUsuario(dto.getEmail(), "123456", Role.USER); //trocar senha padrão

        dto.setId(user.getId());

        Aluno aluno = new Aluno(dto);
        return alunoRepository.save(aluno);
    }

    public Aluno aceitarTermos(UUID userId) {
        Aluno aluno = alunoRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        aluno.setTermos(true);
        return alunoRepository.save(aluno);
    }

    public boolean jaAceitouTermos(UUID userId) {
        return alunoRepository.findById(userId)
                .map(Aluno::getTermos)
                .orElse(false);
    }
}
