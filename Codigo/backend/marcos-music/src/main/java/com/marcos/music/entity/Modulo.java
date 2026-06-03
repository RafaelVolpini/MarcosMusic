package com.marcos.music.entity;

import java.util.ArrayList;
import java.util.List;

import com.marcos.music.dto.UploadModulo.ModuloDTO;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "modulo")
public class Modulo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @OneToMany(mappedBy = "modulo",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private List<UploadModulo> uploads = new ArrayList<>();

    public Modulo(ModuloDTO dto) {
        this.id = dto.getId();
        this.nome = dto.getNome();
    }
}
