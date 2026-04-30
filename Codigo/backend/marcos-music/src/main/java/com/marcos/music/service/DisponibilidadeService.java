package com.marcos.music.service;

import com.marcos.music.dto.Disponibilidade.DisponibilidadeResponseDTO;
import com.marcos.music.dto.Disponibilidade.SalvarDisponibilidadeRequestDTO;
import com.marcos.music.entity.Aula;
import com.marcos.music.entity.Disponibilidade;
import com.marcos.music.repository.Aula.AulaRepository;
import com.marcos.music.repository.DisponibilidadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DisponibilidadeService {

    private final DisponibilidadeRepository repository;
    private final AulaRepository aulaRepository;

    public DisponibilidadeService(DisponibilidadeRepository repository, AulaRepository aulaRepository) {
        this.repository = repository;
        this.aulaRepository = aulaRepository;
    }


    public List<DisponibilidadeResponseDTO> listar() {
        return repository.findAllByOrderByDiaSemanaAscHorarioAsc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ── Salvar / Upsert completo ──────────────────────────────────────────────

    @Transactional
    public List<DisponibilidadeResponseDTO> salvar(SalvarDisponibilidadeRequestDTO dto) {
        Map<String, List<String>> avail = dto.availability() != null ? dto.availability() : Map.of();
        Map<String, List<String>> repos = dto.availabilityReposicao() != null ? dto.availabilityReposicao() : Map.of();

        // Mapa de "dia-horario" → Aula ativa (não cancelada) para cruzar com aulas existentes
        Map<String, Aula> lessonLookup = buildLessonLookup();

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

                aplicarFlags(slot, dia, horario, horariosAvail, horariosRepos, lessonLookup);
                repository.save(slot);
            }

            // Slots que existem no banco para este dia mas não vieram nos mapas
            repository.findAllByOrderByDiaSemanaAscHorarioAsc().stream()
                    .filter(s -> s.getDiaSemana().equals(dia) && !todosHorarios.contains(s.getHorario()))
                    .forEach(s -> {
                        // Sem aula ativa → indisponível; com aula ativa → preserva marcação
                        aplicarFlags(s, dia, s.getHorario(), List.of(), List.of(), lessonLookup);
                        repository.save(s);
                    });
        }

        return listar();
    }

    // ── Cancelar aula de um slot ──────────────────────────────────────────────

    @Transactional
    public DisponibilidadeResponseDTO cancelar(Long id) {
        Disponibilidade slot = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot de disponibilidade não encontrado: " + id));

        if (!Boolean.TRUE.equals(slot.getAulaMarcada())) {
            throw new RuntimeException("Não há aula marcada neste slot.");
        }

        // A flag de cancelamento agora é derivada da aula via FK — não há campo local
        return toDTO(slot);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Aplica os flags corretos no slot:
     * - Se há aula ativa no banco para esse (dia, horario): aula_marcada=true, disponivel=false, reposicao=false
     * - Caso contrário: disponivel/reposicao conforme os mapas do frontend
     */
    private void aplicarFlags(Disponibilidade slot, String dia, String horario,
                              List<String> horariosAvail, List<String> horariosRepos,
                              Map<String, Aula> lessonLookup) {
        Aula aula = lessonLookup.get(dia + "-" + horario);
        if (aula != null) {
            slot.setAulaMarcada(true);
            slot.setDisponivel(false);
            slot.setReposicao(false);
            slot.setAula(aula);
            slot.setAluno(aula.getAluno());
        } else {
            slot.setAulaMarcada(false);
            slot.setAula(null);
            slot.setAluno(null);
            slot.setDisponivel(horariosAvail.contains(horario));
            slot.setReposicao(horariosRepos.contains(horario));
        }
    }

    /**
     * Carrega todas as aulas não canceladas e constrói um mapa "dia-horario" → Aula.
     * O dia é derivado do DayOfWeek em português (seg/ter/qua/qui/sex/sab/dom).
     * O horario é a hora cheia do dataInicio (ex: "14:00").
     */
    private Map<String, Aula> buildLessonLookup() {
        Map<String, String> dowToPt = Map.of(
            "MONDAY",    "seg",
            "TUESDAY",   "ter",
            "WEDNESDAY", "qua",
            "THURSDAY",  "qui",
            "FRIDAY",    "sex",
            "SATURDAY",  "sab",
            "SUNDAY",    "dom"
        );

        Map<String, Aula> lookup = new HashMap<>();
        aulaRepository.findByFlagCanceladaFalse().forEach(a -> {
            String dia = dowToPt.get(a.getDataInicio().getDayOfWeek().name());
            if (dia != null) {
                String horario = String.format("%02d:00", a.getDataInicio().getHour());
                // Se houver mais de uma aula na mesma combinação dia+hora, qualquer uma serve
                lookup.putIfAbsent(dia + "-" + horario, a);
            }
        });
        return lookup;
    }

    private DisponibilidadeResponseDTO toDTO(Disponibilidade s) {
        boolean cancelada = s.getAula() != null && Boolean.TRUE.equals(s.getAula().getFlagCancelada());
        return new DisponibilidadeResponseDTO(
                s.getId(),
                s.getDiaSemana(),
                s.getHorario(),
                s.getDisponivel(),
                s.getReposicao(),
                s.getAulaMarcada(),
                s.getAula() != null ? s.getAula().getId() : null,
                s.getAluno() != null ? s.getAluno().getId() : null,
                s.getAluno() != null ? s.getAluno().getNome() : null,
                cancelada
        );
    }
}

