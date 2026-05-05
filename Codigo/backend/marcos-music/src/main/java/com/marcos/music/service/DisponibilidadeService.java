package com.marcos.music.service;

import com.marcos.music.dto.Disponibilidade.DisponibilidadeResponseDTO;
import com.marcos.music.dto.Disponibilidade.SalvarDisponibilidadeRequestDTO;
import com.marcos.music.entity.Aula;
import com.marcos.music.entity.Disponibilidade;
import com.marcos.music.repository.Aula.AulaRepository;
import com.marcos.music.repository.DisponibilidadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
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
        Map<String, Aula> lookup = buildLessonLookup();
        return repository.findAllByOrderByDiaSemanaAscHorarioAsc()
                .stream()
                .map(s -> toDTO(s, lookup))
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

    // ── Sincronizar flags de aula (sem alterar disponivel/reposicao) ─────────

    /**
     * Varre todos os slots já salvos no banco e atualiza apenas as flags de aula
     * (aulaMarcada, aula_id, aluno_id) consultando a tabela de aulas.
     * Não altera os campos disponivel/reposicao definidos pelo professor.
     */
    @Transactional
    public List<DisponibilidadeResponseDTO> sincronizar() {
        Map<String, Aula> lessonLookup = buildLessonLookup();

        repository.findAllByOrderByDiaSemanaAscHorarioAsc().forEach(slot -> {
            String key = slot.getDiaSemana() + "-" + slot.getHorario();
            Aula aula = lessonLookup.get(key);
            if (aula != null) {
                slot.setAulaMarcada(true);
                slot.setAula(aula);
                slot.setAluno(aula.getAluno());
            } else {
                slot.setAulaMarcada(false);
                slot.setAula(null);
                slot.setAluno(null);
            }
            repository.save(slot);
        });

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

        return toDTO(slot, buildLessonLookup());
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
        // Sempre persiste a configuração do professor — disponivel/reposicao são "template" semanal
        slot.setDisponivel(horariosAvail.contains(horario));
        slot.setReposicao(horariosRepos.contains(horario));

        // aulaMarcada é cache: listar() sobrescreve dinamicamente a cada chamada
        Aula aula = lessonLookup.get(dia + "-" + horario);
        if (aula != null) {
            slot.setAulaMarcada(true);
            slot.setAula(aula);
            slot.setAluno(aula.getAluno());
        } else {
            slot.setAulaMarcada(false);
            slot.setAula(null);
            slot.setAluno(null);
        }
    }

    /**
     * Carrega as aulas não canceladas DA SEMANA ATUAL e constrói um mapa "dia-horario" → Aula.
     * "Semana atual" = segunda-feira a domingo da semana corrente.
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

        // Somente aulas de hoje em diante até o fim desta semana (domingo)
        // Dias já passados desta semana não devem contar como "aula ativa"
        LocalDate today = LocalDate.now();
        LocalDateTime weekStart = today.atStartOfDay();
        LocalDateTime weekEnd   = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(23, 59, 59);

        Map<String, Aula> lookup = new HashMap<>();
        aulaRepository.findByDataInicioBetweenAndFlagCanceladaFalse(weekStart, weekEnd).forEach(a -> {
            String dia = dowToPt.get(a.getDataInicio().getDayOfWeek().name());
            if (dia != null) {
                String horario = String.format("%02d:00", a.getDataInicio().getHour());
                lookup.putIfAbsent(dia + "-" + horario, a);
            }
        });
        return lookup;
    }

    /**
     * Converte um slot para DTO usando o lookup dinâmico da semana atual.
     * aulaMarcada é computado do lookup (não da coluna do banco),
     * e disponivel/reposicao são mascarados se houver aula ativa no slot.
     */
    private DisponibilidadeResponseDTO toDTO(Disponibilidade s, Map<String, Aula> lookup) {
        Aula aula = lookup.get(s.getDiaSemana() + "-" + s.getHorario());
        boolean aulaMarcada = aula != null;
        boolean cancelada = aula != null && Boolean.TRUE.equals(aula.getFlagCancelada());
        return new DisponibilidadeResponseDTO(
                s.getId(),
                s.getDiaSemana(),
                s.getHorario(),
                !aulaMarcada && Boolean.TRUE.equals(s.getDisponivel()),
                !aulaMarcada && Boolean.TRUE.equals(s.getReposicao()),
                aulaMarcada,
                aula != null ? aula.getId() : null,
                aula != null && aula.getAluno() != null ? aula.getAluno().getId() : null,
                aula != null && aula.getAluno() != null ? aula.getAluno().getNome() : null,
                cancelada
        );
    }
}

