package com.marcos.music.controller;

import com.marcos.music.dto.Credito.CreditoReposicaoDTO;
import com.marcos.music.dto.Credito.SaldoCreditosDTO;
import com.marcos.music.entity.CreditoReposicao;
import com.marcos.music.entity.Usuario;
import com.marcos.music.repository.Aula.AulaRepository;
import com.marcos.music.repository.UsuarioRepository;
import com.marcos.music.service.CreditoReposicaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/credito-reposicao")
@RequiredArgsConstructor
public class CreditoReposicaoController {

    private final CreditoReposicaoService service;
    private final UsuarioRepository usuarioRepository;
    private final AulaRepository aulaRepository;

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

        // Intervalo da semana atual (segunda-feira a domingo)
        LocalDate hoje = LocalDate.now();
        LocalDate monday = hoje.minusDays(hoje.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue());
        LocalDateTime semanaInicio = monday.atStartOfDay();
        LocalDateTime semanaFim = monday.plusDays(6).atTime(23, 59, 59);

        // Intervalo do mês atual
        LocalDateTime mesInicio = hoje.withDayOfMonth(1).atStartOfDay();
        LocalDateTime mesFim = hoje.withDayOfMonth(hoje.lengthOfMonth()).atTime(23, 59, 59);

        // Consulta direta por aluno (evita carregar aulas de todos os alunos)
        int aulasSemana = aulaRepository
                .findByAlunoIdAndDataInicioBetweenAndFlagCanceladaFalse(alunoId, semanaInicio, semanaFim)
                .size();
        int aulasMes = aulaRepository
                .findByAlunoIdAndDataInicioBetweenAndFlagCanceladaFalse(alunoId, mesInicio, mesFim)
                .size();

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
     * Retorna saldo de créditos do aluno autenticado
     */
    @GetMapping("/meus-creditos")
    public ResponseEntity<?> meusCreditosReposicao() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(401).body("Não autenticado");
            }

            Usuario usuario = usuarioRepository.findByEmailIgnoreCase(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Se é professor, não tem créditos de aluno
            if ("ADMIN".equals(usuario.getRole().name())) {
                return ResponseEntity.ok(new SaldoCreditosDTO());
            }

            return getSaldoCreditos(usuario.getId());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao buscar créditos: " + e.getMessage());
        }
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
}
