package com.marcos.music.repository.Aula;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.marcos.music.entity.Aula;

public interface AulaRepository extends JpaRepository<Aula, Long>{
    Optional<Aula> findByAlunoIdAndDataInicioAndDataFim(UUID alunoId, LocalDateTime dataInicio, LocalDateTime dataFim);

    List<Aula> findByFlagCanceladaFalse();

    List<Aula> findByDataInicioBetweenAndFlagCanceladaFalse(LocalDateTime dataInicio, LocalDateTime dataFim);

    List<Aula> findByAlunoIdAndDataInicioBetweenAndFlagCanceladaFalse(UUID alunoId, LocalDateTime dataInicio, LocalDateTime dataFim);

    @Query("""
        SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END
        FROM Aula a
        WHERE a.flagCancelada = false
          AND :inicioNovo < a.dataFim
          AND :fimNovo > a.dataInicio
    """)
    Boolean validarData(
        @Param("inicioNovo") LocalDateTime inicioNovo,
        @Param("fimNovo") LocalDateTime fimNovo
    );

    List<Aula> findByFlagCanceladaFalseAndFlagRealizadaFalseAndDataFimBefore(LocalDateTime dateTime);

    List<Aula> findByFlagCanceladaFalseAndFlagRealizadaFalseAndDataFimAfter(LocalDateTime dateTime);
}
