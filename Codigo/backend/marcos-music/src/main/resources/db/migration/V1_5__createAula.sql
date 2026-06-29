CREATE TABLE aula (
    id INT IDENTITY(1,1) PRIMARY KEY,
    data_inicio DATETIME2 NOT NULL,
    data_fim DATETIME2 NOT NULL,
    flag_cancelada BIT DEFAULT 0,
    id_aluno UNIQUEIDENTIFIER NOT NULL,

    CONSTRAINT fk_aula_aluno
        FOREIGN KEY (id_aluno)
        REFERENCES aluno(id)
        ON DELETE CASCADE
);