package com.marcos.music.dto.Credito;

import com.marcos.music.entity.CreditoReposicao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditoReposicaoDTO {
    private Long id;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataExpiracao;
    private String status; // VALIDO, EXPIRADO, USADO
    private String observacao;
    private int diasAteExpiracao;
    private boolean disponivel;

    public static CreditoReposicaoDTO from(CreditoReposicao credito) {
        return CreditoReposicaoDTO.builder()
                .id(credito.getId())
                .dataCriacao(credito.getDataCriacao())
                .dataExpiracao(credito.getDataExpiracao())
                .status(credito.getStatus())
                .observacao(credito.getObservacao())
                .diasAteExpiracao(credito.diasAteExpiracao())
                .disponivel(credito.isDisponivelParaUso())
                .build();
    }
}
