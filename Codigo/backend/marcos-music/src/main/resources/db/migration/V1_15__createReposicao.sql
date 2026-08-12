CREATE TABLE reposicao (
    id               SERIAL       PRIMARY KEY,
    disponibilidade_id INT        NOT NULL,
    data_aula        DATE         NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'ABERTA',
    observacao       VARCHAR(500),
    CONSTRAINT fk_reposicao_disp FOREIGN KEY (disponibilidade_id)
        REFERENCES disponibilidade(id) ON DELETE CASCADE
);

CREATE TABLE reposicao_aluno (
    reposicao_id INT  NOT NULL,
    aluno_id     UUID NOT NULL,
    PRIMARY KEY (reposicao_id, aluno_id),
    CONSTRAINT fk_repos_aluno_r FOREIGN KEY (reposicao_id)
        REFERENCES reposicao(id) ON DELETE CASCADE,
    CONSTRAINT fk_repos_aluno_a FOREIGN KEY (aluno_id)
        REFERENCES aluno(id)
);
