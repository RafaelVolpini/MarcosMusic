CREATE TABLE aluno (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    
    nome VARCHAR(255) NOT NULL,
    telefone CHAR(11),
    status TINYINT NOT NULL,
    reposicoes INT DEFAULT 0,
    termos BIT NOT NULL DEFAULT 0,

    CONSTRAINT fk_aluno_usuario
        FOREIGN KEY (id) REFERENCES usuario(id)
        ON DELETE CASCADE
);
