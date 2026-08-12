CREATE TABLE aluno (
    id UUID PRIMARY KEY,

    nome VARCHAR(255) NOT NULL,
    telefone CHAR(11),
    status BOOLEAN NOT NULL,
    reposicoes INT DEFAULT 0,
    termos BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_aluno_usuario
        FOREIGN KEY (id) REFERENCES usuario(id)
        ON DELETE CASCADE
);
