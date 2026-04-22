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

import com.marcos.music.dto.Aula.CalendarFilterDTO;
import com.marcos.music.dto.Aula.CalendarResponseDTO;
import com.marcos.music.dto.Aula.HorarioValidatorDTO;
import com.marcos.music.entity.Aula;
import com.marcos.music.entity.AulaAluno;
import com.marcos.music.repository.Aula.AulaAlunoRepository;
import com.marcos.music.repository.Aula.AulaCustomRepository;
import com.marcos.music.repository.Aula.AulaRepository;


@Service
public class AulaService {
    private final AulaRepository repository;
    private final AulaAlunoRepository aulaAlunoRepository;
    private final AlunoService alunoService;
    private final AulaCustomRepository aulaCustomRepository;


    public AulaService(
        AulaRepository repository,
        AulaAlunoRepository aulaAlunoRepository,
        @Lazy AlunoService alunoService,
        AulaCustomRepository aulaCustomRepository
    ){
        this.repository = repository;
        this.aulaAlunoRepository = aulaAlunoRepository;
        this.alunoService = alunoService;
        this.aulaCustomRepository = aulaCustomRepository;
    }

    public Aula salvar(Aula a) throws RuntimeException{
        try {
            if (a.getId() == null && repository.validarData(a.getDataInicio(), a.getDataFim())) {
                throw new RuntimeException("Já existe uma aula nesse horário");
            }
            return repository.save(a);
        } catch (RuntimeException e) {
            throw new RuntimeException();
        }
    }

    public List<CalendarResponseDTO> buscar(CalendarFilterDTO f){
        return aulaCustomRepository.buscar(f);
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
