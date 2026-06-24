package com.marcos.music.dto.UploadModulo;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ModuloDTO {
    private Long id;
    private String nome;
    private List<UploadModuloDTO> uploads;
}
