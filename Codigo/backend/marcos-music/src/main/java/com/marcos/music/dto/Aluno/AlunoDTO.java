package com.marcos.music.dto.Aluno;
import java.util.List;
import java.util.UUID;
import com.marcos.music.entity.AulaAluno;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlunoDTO {
    private UUID id;
    private String email;
    private String passwaord;
    private String nome;
    private String telefone;
    private Boolean status;
    private Integer reposicoes;
    private Boolean termos;
    private String apelido;
    private Integer planoAulasSem;
    private List<AulaAluno> horarios;
}
