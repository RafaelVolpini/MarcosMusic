package com.marcos.music.dto.Credito;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaldoCreditosDTO {
    private int totalDisponivel;
    private int totalUsado;
    private int totalExpirado;
    private int diasAteProximaExpiracao;
    private List<CreditoReposicaoDTO> creditosAtivos;
    private List<CreditoReposicaoDTO> historicoCompleto;
}
