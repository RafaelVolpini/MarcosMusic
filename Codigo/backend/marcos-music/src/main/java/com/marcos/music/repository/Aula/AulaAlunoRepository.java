package com.marcos.music.repository.Aula;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.marcos.music.entity.AulaAluno;

public interface AulaAlunoRepository extends JpaRepository<AulaAluno, Long> {
    List<AulaAluno> findByAlunoIdAndIdNotIn(UUID alunoId, List<Long> ids);

    @Query("""
        SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END
        FROM AulaAluno a
        WHERE a.dia = :dia
        AND a.horarioInicio < :horarioFim
        AND a.horarioFim > :horarioInicio
    """)
    Boolean existsConflitoHorario(
            @Param("dia") Integer dia,
            @Param("horarioInicio") LocalTime inicio,
            @Param("horarioFim") LocalTime fim
    );
}
