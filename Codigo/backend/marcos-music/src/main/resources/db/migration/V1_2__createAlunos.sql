CREATE TABLE aluno (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    
    cpf VARCHAR(14) NOT NULL,
    endereco VARCHAR(255),
    data_nascimento DATE,
    telefone VARCHAR(20),

    termos BIT NOT NULL DEFAULT 0,

    CONSTRAINT fk_aluno_usuario
        FOREIGN KEY (id) REFERENCES usuario(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_aluno_cpf ON aluno(cpf);