package com.marcos.music.repository;

import com.marcos.music.entity.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AlunoRepository extends JpaRepository<Aluno, UUID> {
    Optional<Aluno> findById(UUID id);

    @Modifying
    @Query("UPDATE Aluno a SET a.nome = :nome, a.telefone = :telefone WHERE a.id = :id")
    void updateNomeAndTelefone(@Param("id") UUID id, @Param("nome") String nome, @Param("telefone") String telefone);
}