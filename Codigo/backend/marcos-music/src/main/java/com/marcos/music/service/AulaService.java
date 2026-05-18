package com.marcos.music.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Transactional;

import com.marcos.music.dto.Aula.CalendarFilterDTO;
import com.marcos.music.dto.Aula.CalendarResponseDTO;
import com.marcos.music.dto.Aula.CriarAulaDTO;
import com.marcos.music.dto.Aula.HorarioValidatorDTO;
import com.marcos.music.entity.Aluno;
import com.marcos.music.entity.Aula;
import com.marcos.music.entity.AulaAluno;
import com.marcos.music.entity.Usuario;
import com.marcos.music.repository.AlunoRepository;
import com.marcos.music.repository.Aula.AulaAlunoRepository;
import com.marcos.music.repository.Aula.AulaCustomRepository;
import com.marcos.music.repository.Aula.AulaRepository;
import com.marcos.music.repository.ReposicaoRepository;
import com.marcos.music.repository.UsuarioRepository;
@Service
public class AulaService {
    private final AulaRepository repository;
    private final AulaAlunoRepository aulaAlunoRepository;
    private final AlunoService alunoService;
    private final AulaCustomRepository aulaCustomRepository;
    private final UsuarioRepository usuarioRepository;
    private final AlunoRepository alunoRepository;
    private final ReposicaoRepository reposicaoRepository;
    private final NotificacaoService notificacaoService;


    public AulaService(
        AulaRepository repository,
        AulaAlunoRepository aulaAlunoRepository,
        @Lazy AlunoService alunoService,
        AulaCustomRepository aulaCustomRepository,
        UsuarioRepository usuarioRepository,
        AlunoRepository alunoRepository,
        ReposicaoRepository reposicaoRepository,
        NotificacaoService notificacaoService
    ){
        this.repository = repository;
        this.aulaAlunoRepository = aulaAlunoRepository;
        this.alunoService = alunoService;
        this.aulaCustomRepository = aulaCustomRepository;
        this.usuarioRepository = usuarioRepository;
        this.alunoRepository = alunoRepository;
        this.reposicaoRepository = reposicaoRepository;
        this.notificacaoService = notificacaoService;
    }

    public Aula salvar(Aula a) throws RuntimeException{
        if (a.getId() == null && repository.validarData(a.getDataInicio(), a.getDataFim())) {
            throw new RuntimeException("Já existe uma aula nesse horário");
        }
        if (a.getId() == null) {
            String horario = String.format("%02d:%02d",
                a.getDataInicio().getHour(), a.getDataInicio().getMinute());
            if (reposicaoRepository.existsConflito(a.getDataInicio().toLocalDate(), horario)) {
                throw new RuntimeException("Horário reservado para uma reposição");
            }
        }
        return repository.save(a);
    }

    public List<CalendarResponseDTO> buscar(CalendarFilterDTO f){
        return aulaCustomRepository.buscar(f);
    }

    public List<Aula> criar(String email, CriarAulaDTO dto) {
        Aluno aluno;
        if (dto.getStudentId() != null && !dto.getStudentId().isBlank()) {
            UUID studentUUID;
            try {
                studentUUID = UUID.fromString(dto.getStudentId());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("studentId inválido: " + dto.getStudentId());
            }
            aluno = alunoRepository.findById(studentUUID)
                    .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
        } else {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            aluno = alunoRepository.findById(usuario.getId())
                    .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
        }

        boolean recorrente = Boolean.TRUE.equals(dto.getRecorrente());
        List<Aula> aulas = new ArrayList<>();

        Aula primeira = salvar(new Aula(dto.getDataInicio(), dto.getDataFim(), aluno, recorrente));
        logAula(primeira, "AGENDADO");
        notificacaoService.aulaAgendada(aluno.getId(), primeira.getId(), primeira.getDataInicio());
        aulas.add(primeira);

        if (recorrente) {
            // Cria aulas semanais por 1 ano (51 ocorrências adicionais = 52 no total)
            for (int i = 1; i <= 51; i++) {
                LocalDateTime nextInicio = dto.getDataInicio().plusWeeks(i);
                LocalDateTime nextFim = dto.getDataFim().plusWeeks(i);
                try {
                    Aula proxima = salvar(new Aula(nextInicio, nextFim, aluno, true));
                    logAula(proxima, "AGENDADO");
                    aulas.add(proxima);
                } catch (RuntimeException e) {
                    // Ignora semanas com conflito de horário
                }
            }
        }

        return aulas;
    }

    public List<Aula> gerarPorHorario(AulaAluno e) throws RuntimeException{
        List<Aula> as = new ArrayList<>();

        List<LocalDate> datas = gerarDatasHojeFimPeriodo(e.getDia());
        for(LocalDate d : datas){
            LocalDateTime dataInicio = LocalDateTime.of(d, e.getHorarioInicio());
            LocalDateTime dataFim = LocalDateTime.of(d, e.getHorarioInicio());

            Aula a = salvar(new Aula(dataInicio, dataFim, e.getAluno()));

            as.add(a);
        }
            
        return as;
    }

    public List<Aula> deletePorHorario(AulaAluno e) throws RuntimeException {
        List<Aula> as = new ArrayList<>();

        List<LocalDate> datas = gerarDatasHojeFimPeriodo(e.getDia());

        for(LocalDate d : datas){
            LocalDateTime dataInicio = LocalDateTime.of(d, e.getHorarioInicio());
            LocalDateTime dataFim = LocalDateTime.of(d, e.getHorarioInicio());

            Aula a = findDeletedAula(e.getAluno().getId(), dataInicio, dataFim);
            if(a != null){
                repository.delete(a);

            as.add(a);
            }
        }

        return as;
    }

    @Transactional
    public Aula cancelar(Long id) throws RuntimeException{
        try{
            Aula a = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Aula não encontrado"));

            LocalDateTime agora = LocalDateTime.now();

            boolean dentroDaJanela = 
                    !agora.isBefore(a.getDataInicio().minusHours(1)) &&
                    !agora.isAfter(a.getDataInicio());

            if(dentroDaJanela){
                throw  new RuntimeException("Você não pode cancelar a aula até 1h antes");
            }

            a.setFlagCancelada(true);

            alunoService.adicionarReposicao(a.getAluno());

            repository.save(a);
            logAula(a, "CANCELADO");
            notificacaoService.alunoCancelou(a.getAluno().getNome(), a.getId(), a.getDataInicio());

            return a;
        } catch (RuntimeException e){
            throw new RuntimeException(e.getMessage());
        }

    }

    public Boolean validarHorarioSemana(HorarioValidatorDTO dto){
        return !aulaAlunoRepository.existsConflitoHorario(dto.getDia(), dto.getHorarioInicio(), dto.getHorarioFim());
    }

    @Transactional
    public Aula reagendar(Long id, LocalDateTime novaDataInicio, LocalDateTime novaDataFim) {
        Aula a = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aula n\u00e3o encontrada"));
        if (Boolean.TRUE.equals(a.getFlagCancelada())) {
            throw new RuntimeException("N\u00e3o \u00e9 poss\u00edvel reagendar uma aula cancelada");
        }
        a.setDataInicio(novaDataInicio);
        a.setDataFim(novaDataFim);
        Aula salva = repository.save(a);
        logAula(salva, "REAGENDADO");
        notificacaoService.aulaReagendada(a.getAluno().getId(), salva.getId(), novaDataInicio);
        return salva;
    }

    @Transactional
    public Aula confirmarPresenca(Long id) {
        Aula a = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aula n\u00e3o encontrada"));
        a.setPresencaConfirmada(true);
        Aula salva = repository.save(a);
        notificacaoService.alunoConfirmouPresenca(a.getAluno().getNome(), salva.getId(), a.getDataInicio());
        return salva;
    }

    public List<AulaAluno> findDeletedsHorarios(UUID idAluno, List<Long> ids){
        if(idAluno != null && !ids.isEmpty()) return aulaAlunoRepository.findByAlunoIdAndIdNotIn(idAluno,ids);
        return null;
    }

    public Aula findDeletedAula(UUID idAluno, LocalDateTime dataInicio, LocalDateTime dataFim){
        if(idAluno != null && dataInicio != null && dataFim != null) return repository.findByAlunoIdAndDataInicioAndDataFim(idAluno, dataInicio, dataFim).get();
        return null;
    }

    private void logAula(Aula aula, String acao) {
        AulaAluno log = new AulaAluno();
        log.setAluno(aula.getAluno());
        log.setDia(aula.getDataInicio().getDayOfWeek().getValue());
        log.setHorarioInicio(aula.getDataInicio().toLocalTime());
        log.setHorarioFim(aula.getDataFim().toLocalTime());
        log.setAula(aula);
        log.setAcao(acao);
        log.setDataRegistro(LocalDateTime.now());
        aulaAlunoRepository.save(log);
    }

    private List<LocalDate> gerarDatasHojeFimPeriodo(Integer dia) {
        DayOfWeek diaSemana = DayOfWeek.of(dia);

        LocalDate hoje = LocalDate.now();

        LocalDate fimPeriodo = hoje
                .plusMonths(1)
                .with(TemporalAdjusters.lastDayOfMonth());

        List<LocalDate> datas = new ArrayList<>();

        LocalDate data = hoje.with(TemporalAdjusters.nextOrSame(diaSemana));

        while (!data.isAfter(fimPeriodo)) {
            datas.add(data);
            data = data.plusWeeks(1);
        }

        return datas;
    }
}
