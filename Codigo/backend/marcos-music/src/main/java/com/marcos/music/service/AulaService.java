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
import com.marcos.music.repository.UsuarioRepository;


@Service
public class AulaService {
    private final AulaRepository repository;
    private final AulaAlunoRepository aulaAlunoRepository;
    private final AlunoService alunoService;
    private final AulaCustomRepository aulaCustomRepository;
    private final UsuarioRepository usuarioRepository;
    private final AlunoRepository alunoRepository;


    public AulaService(
        AulaRepository repository,
        AulaAlunoRepository aulaAlunoRepository,
        @Lazy AlunoService alunoService,
        AulaCustomRepository aulaCustomRepository,
        UsuarioRepository usuarioRepository,
        AlunoRepository alunoRepository
    ){
        this.repository = repository;
        this.aulaAlunoRepository = aulaAlunoRepository;
        this.alunoService = alunoService;
        this.aulaCustomRepository = aulaCustomRepository;
        this.usuarioRepository = usuarioRepository;
        this.alunoRepository = alunoRepository;
    }

    public Aula salvar(Aula a) throws RuntimeException{
        if (a.getId() == null && repository.validarData(a.getDataInicio(), a.getDataFim())) {
            throw new RuntimeException("Já existe uma aula nesse horário");
        }
        return repository.save(a);
    }

    public List<CalendarResponseDTO> buscar(CalendarFilterDTO f){
        return aulaCustomRepository.buscar(f);
    }

    public Aula criar(String email, CriarAulaDTO dto) {
        Aluno aluno;
        if (dto.getStudentId() != null && !dto.getStudentId().isBlank()) {
            // Professor criando aula para um aluno específico
            UUID studentUUID;
            try {
                studentUUID = UUID.fromString(dto.getStudentId());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("studentId inválido: " + dto.getStudentId());
            }
            aluno = alunoRepository.findById(studentUUID)
                    .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
        } else {
            // Aluno criando sua própria aula via JWT
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            aluno = alunoRepository.findById(usuario.getId())
                    .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
        }
        return salvar(new Aula(dto.getDataInicio(), dto.getDataFim(), aluno));
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
        return repository.save(a);
    }

    @Transactional
    public Aula confirmarPresenca(Long id) {
        Aula a = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aula n\u00e3o encontrada"));
        a.setPresencaConfirmada(true);
        return repository.save(a);
    }

    public List<AulaAluno> findDeletedsHorarios(UUID idAluno, List<Long> ids){
        if(idAluno != null && !ids.isEmpty()) return aulaAlunoRepository.findByAlunoIdAndIdNotIn(idAluno,ids);
        return null;
    }

    public Aula findDeletedAula(UUID idAluno, LocalDateTime dataInicio, LocalDateTime dataFim){
        if(idAluno != null && dataInicio != null && dataFim != null) return repository.findByAlunoIdAndDataInicioAndDataFim(idAluno, dataInicio, dataFim).get();
        return null;
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
