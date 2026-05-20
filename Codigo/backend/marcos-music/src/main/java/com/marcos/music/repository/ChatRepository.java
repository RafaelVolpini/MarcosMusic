package com.marcos.music.repository;

import com.marcos.music.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    Optional<Chat> findByAlunoId(UUID alunoId);

    @Query("SELECT c FROM Chat c JOIN FETCH c.aluno a LEFT JOIN FETCH a.usuario ORDER BY c.criadoEm DESC")
    List<Chat> findAllWithAluno();
}
