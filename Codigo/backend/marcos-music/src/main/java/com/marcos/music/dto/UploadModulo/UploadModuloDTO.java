package com.marcos.music.dto.UploadModulo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UploadModuloDTO {
    private Long id;
    private String nome;
    private String descricao;
    private String url;
    private Long idModulo;
}
