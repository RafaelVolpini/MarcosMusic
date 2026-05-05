package com.marcos.music.repository;

import com.marcos.music.entity.Disponibilidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DisponibilidadeRepository extends JpaRepository<Disponibilidade, Long> {

    Optional<Disponibilidade> findByDiaSemanaAndHorario(String diaSemana, String horario);

    List<Disponibilidade> findAllByOrderByDiaSemanaAscHorarioAsc();
}
