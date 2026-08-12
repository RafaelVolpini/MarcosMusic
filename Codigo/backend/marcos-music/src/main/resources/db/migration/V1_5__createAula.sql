CREATE TABLE aula (
    id SERIAL PRIMARY KEY,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    flag_cancelada BOOLEAN DEFAULT FALSE,
    id_aluno UUID NOT NULL,

    CONSTRAINT fk_aula_aluno
        FOREIGN KEY (id_aluno)
        REFERENCES aluno(id)
        ON DELETE CASCADE
);
