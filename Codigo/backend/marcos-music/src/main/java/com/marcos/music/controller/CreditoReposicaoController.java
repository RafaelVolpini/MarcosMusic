package com.marcos.music.controller;

import com.marcos.music.dto.Credito.CreditoReposicaoDTO;
import com.marcos.music.dto.Credito.SaldoCreditosDTO;
import com.marcos.music.entity.CreditoReposicao;
import com.marcos.music.service.CreditoReposicaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/credito-reposicao")
@RequiredArgsConstructor
public class CreditoReposicaoController {

    private final CreditoReposicaoService service;

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

        return ResponseEntity.ok(
                SaldoCreditosDTO.builder()
                        .totalDisponivel(totalDisponivel)
                        .totalUsado(totalUsado)
                        .totalExpirado(totalExpirado)
                        .diasAteProximaExpiracao(diasAteProxima)
                        .creditosAtivos(creditosDisponivel.stream()
                                .map(CreditoReposicaoDTO::from)
                                .collect(Collectors.toList()))
                        .historicoCompleto(historicoCompleto.stream()
                                .map(CreditoReposicaoDTO::from)
                                .collect(Collectors.toList()))
                        .build()
        );
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
