package com.marcos.music.controller;

import com.marcos.music.dto.Credito.CreditoReposicaoDTO;
import com.marcos.music.dto.Credito.SaldoCreditosDTO;
import com.marcos.music.entity.CreditoReposicao;
import com.marcos.music.entity.Usuario;
import com.marcos.music.repository.UsuarioRepository;
import com.marcos.music.service.CreditoReposicaoService;
import com.marcos.music.service.AulaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/credito-reposicao")
@RequiredArgsConstructor
public class CreditoReposicaoController {

    private final CreditoReposicaoService service;
    private final UsuarioRepository usuarioRepository;
    private final AulaService aulaService;

    /**
     * Retorna o saldo de créditos do aluno (para perfil)
     */
    @GetMapping("/aluno/{alunoId}/saldo")
    public ResponseEntity<SaldoCreditosDTO> getSaldoCreditos(@PathVariable UUID alunoId) {
        List<CreditoReposicao> creditosDisponivel = service.listarCreditosDisponiveis(alunoId);
        List<CreditoReposicao> historicoCompleto = service.listarHistoricoCreditosAluno(alunoId);

        int totalDisponivel = creditosDisponivel.size();
        int totalUsado = (int) historicoCompleto.stream()
                .filter(c -> CreditoReposicao.STATUS_USADO.equals(c.getStatus()))
                .count();
        int totalExpirado = (int) historicoCompleto.stream()
                .filter(c -> CreditoReposicao.STATUS_EXPIRADO.equals(c.getStatus()))
                .count();

        int diasAteProxima = service.diasAteExpiracaoPrimeiroCradit(alunoId);

        // Calcula intervalo da semana atual (segunda-feira a domingo)
        java.time.LocalDate hoje = java.time.LocalDate.now();
        java.time.DayOfWeek dow = hoje.getDayOfWeek();
        java.time.LocalDate monday = hoje.minusDays(dow.getValue() - 1);
        java.time.LocalDate sunday = monday.plusDays(6);

        java.time.LocalDateTime semanaInicio = monday.atStartOfDay();
        java.time.LocalDateTime semanaFim = sunday.atTime(23, 59, 59);

        // Intervalo do mês atual
        java.time.LocalDate firstOfMonth = hoje.withDayOfMonth(1);
        java.time.LocalDate lastOfMonth = hoje.withDayOfMonth(hoje.lengthOfMonth());
        java.time.LocalDateTime mesInicio = firstOfMonth.atStartOfDay();
        java.time.LocalDateTime mesFim = lastOfMonth.atTime(23, 59, 59);

        int aulasSemana = aulaService.buscar(new com.marcos.music.dto.Aula.CalendarFilterDTO() {{
            setDataInicio(semanaInicio);
            setDataFim(semanaFim);
        }}).stream().filter(a -> a.getIdAluno() != null && a.getIdAluno().equals(alunoId)).collect(Collectors.toList()).size();

        int aulasMes = aulaService.buscar(new com.marcos.music.dto.Aula.CalendarFilterDTO() {{
            setDataInicio(mesInicio);
            setDataFim(mesFim);
        }}).stream().filter(a -> a.getIdAluno() != null && a.getIdAluno().equals(alunoId)).collect(Collectors.toList()).size();

        // Monta DTO e anexa contagens
        SaldoCreditosDTO dto = SaldoCreditosDTO.builder()
            .totalDisponivel(totalDisponivel)
            .totalUsado(totalUsado)
            .totalExpirado(totalExpirado)
            .diasAteProximaExpiracao(diasAteProxima)
            .creditosAtivos(creditosDisponivel.stream().map(CreditoReposicaoDTO::from).collect(Collectors.toList()))
            .historicoCompleto(historicoCompleto.stream().map(CreditoReposicaoDTO::from).collect(Collectors.toList()))
            .build();

        dto.setAulasEstaSemana(aulasSemana);
        dto.setAulasEsteMes(aulasMes);

        return ResponseEntity.ok(dto);
    }

    /**
     * Retorna apenas créditos disponíveis (para ReschedulingPage)
     */
    @GetMapping("/aluno/{alunoId}/disponivel")
    public ResponseEntity<List<CreditoReposicaoDTO>> getCreditosDisponivel(@PathVariable UUID alunoId) {
        List<CreditoReposicaoDTO> creditos = service.listarCreditosDisponiveis(alunoId)
                .stream()
                .map(CreditoReposicaoDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(creditos);
    }

    /**
     * Conta total de créditos disponíveis (simples, para UI badge)
     */
    @GetMapping("/aluno/{alunoId}/total")
    public ResponseEntity<Integer> getTotalCreditosDisponivel(@PathVariable UUID alunoId) {
        return ResponseEntity.ok(service.contarCreditosDisponiveis(alunoId));
    }

    /**
     * Retorna saldo de créditos do aluno autenticado
     */
    @GetMapping("/meus-creditos")
    public ResponseEntity<?> meusCreditosReposicao() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(401).body("Não autenticado");
            }

            Usuario usuario = usuarioRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Se é professor, não tem créditos de aluno
            if (usuario.getRole().name().equals("ADMIN")) {
                return ResponseEntity.ok(new SaldoCreditosDTO());
            }

            return getSaldoCreditos(usuario.getId());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao buscar créditos: " + e.getMessage());
        }
    }
}
