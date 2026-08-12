CREATE TABLE aula_aluno (
    id SERIAL PRIMARY KEY,
    dia INT NOT NULL, -- ex: 1=segunda ... 7=domingo
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    id_aluno UUID NOT NULL,

    CONSTRAINT fk_aula_aluno_aluno
        FOREIGN KEY (id_aluno)
        REFERENCES aluno(id)
        ON DELETE CASCADE
);
