package com.marcos.music.dto.CreditoReposicao;

import java.time.LocalDateTime;

public class CreditoReposicaoDTO {
    public Long id;
    public LocalDateTime dataCriacao;
    public LocalDateTime dataExpiracao;
    public String status;
    public String origem; // "Aula cancelada" ou "Reposição usada"
    public String aulaData; // Data/hora da aula cancelada (origem)
    public String reposicaoData; // Data/hora da reposição usada
    public int diasAteExpiracao;
    public boolean disponivel;

    public CreditoReposicaoDTO() {}

    public CreditoReposicaoDTO(Long id, LocalDateTime dataCriacao, LocalDateTime dataExpiracao,
                               String status, String origem, String aulaData, String reposicaoData,
                               int diasAteExpiracao, boolean disponivel) {
        this.id = id;
        this.dataCriacao = dataCriacao;
        this.dataExpiracao = dataExpiracao;
        this.status = status;
        this.origem = origem;
        this.aulaData = aulaData;
        this.reposicaoData = reposicaoData;
        this.diasAteExpiracao = diasAteExpiracao;
        this.disponivel = disponivel;
    }
}
