package com.marcos.music.service;

import com.marcos.music.dto.Disponibilidade.DisponibilidadeResponseDTO;
import com.marcos.music.dto.Disponibilidade.SalvarDisponibilidadeRequestDTO;
import com.marcos.music.entity.Disponibilidade;
import com.marcos.music.entity.Reposicao;
import com.marcos.music.repository.DisponibilidadeRepository;
import com.marcos.music.repository.ReposicaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DisponibilidadeService {

    private final DisponibilidadeRepository repository;
    private final ReposicaoRepository reposicaoRepository;

    public DisponibilidadeService(DisponibilidadeRepository repository,
                                  ReposicaoRepository reposicaoRepository) {
        this.repository = repository;
        this.reposicaoRepository = reposicaoRepository;
    }

    private LocalDate thisWeekDate(String diaSemana) {
        Map<String, DayOfWeek> map = Map.of(
            "seg", DayOfWeek.MONDAY,
            "ter", DayOfWeek.TUESDAY,
            "qua", DayOfWeek.WEDNESDAY,
            "qui", DayOfWeek.THURSDAY,
            "sex", DayOfWeek.FRIDAY,
            "sab", DayOfWeek.SATURDAY,
            "dom", DayOfWeek.SUNDAY
        );
        DayOfWeek dow = map.get(diaSemana);
        if (dow == null) return null;
        return LocalDate.now().with(TemporalAdjusters.nextOrSame(dow));
    }

    public List<DisponibilidadeResponseDTO> listar() {
        return repository.findAllByOrderByDiaSemanaAscHorarioAsc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public List<DisponibilidadeResponseDTO> salvar(SalvarDisponibilidadeRequestDTO dto) {
        Map<String, List<String>> avail = dto.availability() != null ? dto.availability() : Map.of();
        Map<String, List<String>> repos = dto.availabilityReposicao() != null ? dto.availabilityReposicao() : Map.of();

        Set<String> dias = new HashSet<>();
        dias.addAll(avail.keySet());
        dias.addAll(repos.keySet());

        for (String dia : dias) {
            List<String> horariosAvail = avail.getOrDefault(dia, List.of());
            List<String> horariosRepos = repos.getOrDefault(dia, List.of());

            Set<String> todosHorarios = new HashSet<>();
            todosHorarios.addAll(horariosAvail);
            todosHorarios.addAll(horariosRepos);

            for (String horario : todosHorarios) {
                Disponibilidade slot = repository
                        .findByDiaSemanaAndHorario(dia, horario)
                        .orElseGet(() -> {
                            Disponibilidade novo = new Disponibilidade();
                            novo.setDiaSemana(dia);
                            novo.setHorario(horario);
                            return novo;
                        });

                slot.setDisponivel(horariosAvail.contains(horario));
                slot.setReposicao(horariosRepos.contains(horario));
                Disponibilidade saved = repository.save(slot);

                if (Boolean.TRUE.equals(saved.getReposicao())) {
                    LocalDate dataAula = thisWeekDate(dia);
                    if (dataAula != null && !reposicaoRepository.existsConflito(dataAula, horario)) {
                        Reposicao r = new Reposicao();
                        r.setDisponibilidade(saved);
                        r.setDataAula(dataAula);
                        r.setStatus("ABERTA");
                        reposicaoRepository.save(r);
                    }
                }
            }

            repository.findAllByOrderByDiaSemanaAscHorarioAsc().stream()
                    .filter(s -> s.getDiaSemana().equals(dia) && !todosHorarios.contains(s.getHorario()))
                    .forEach(s -> {
                        s.setDisponivel(false);
                        s.setReposicao(false);
                        repository.save(s);
                    });
        }

        return listar();
    }

    private DisponibilidadeResponseDTO toDTO(Disponibilidade s) {
        return new DisponibilidadeResponseDTO(
                s.getId(),
                s.getDiaSemana(),
                s.getHorario(),
                Boolean.TRUE.equals(s.getDisponivel()),
                Boolean.TRUE.equals(s.getReposicao())
        );
    }
}
