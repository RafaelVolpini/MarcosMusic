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
    private int aulasEstaSemana;
    private int aulasEsteMes;

    public int getAulasEstaSemana() { return aulasEstaSemana; }
    public void setAulasEstaSemana(int aulasEstaSemana) { this.aulasEstaSemana = aulasEstaSemana; }
    public int getAulasEsteMes() { return aulasEsteMes; }
    public void setAulasEsteMes(int aulasEsteMes) { this.aulasEsteMes = aulasEsteMes; }
}
