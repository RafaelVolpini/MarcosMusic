package com.marcos.music.repository;

import com.marcos.music.entity.Reposicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReposicaoRepository extends JpaRepository<Reposicao, Long> {

    @Query("SELECT DISTINCT r FROM Reposicao r " +
           "LEFT JOIN FETCH r.alunos " +
           "LEFT JOIN FETCH r.disponibilidade d " +
           "ORDER BY r.dataAula ASC, d.horario ASC")
    List<Reposicao> findAllWithAlunos();

    @Query("SELECT r FROM Reposicao r " +
           "LEFT JOIN FETCH r.alunos " +
           "LEFT JOIN FETCH r.disponibilidade " +
           "WHERE r.id = :id")
    Optional<Reposicao> findByIdWithAlunos(Long id);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
           "FROM Reposicao r JOIN r.disponibilidade d " +
           "WHERE r.dataAula = :dataAula AND d.horario = :horario AND r.status = 'ABERTA'")
    boolean existsConflito(@Param("dataAula") LocalDate dataAula, @Param("horario") String horario);

    @Query("SELECT r FROM Reposicao r JOIN FETCH r.disponibilidade WHERE r.status = 'ABERTA'")
    List<Reposicao> findAbertas();
}
