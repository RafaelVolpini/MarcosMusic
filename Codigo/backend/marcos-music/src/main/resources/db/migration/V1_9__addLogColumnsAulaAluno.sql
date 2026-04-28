ALTER TABLE aula_aluno
    ADD data_registro DATETIME2 DEFAULT GETDATE(),
        acao          VARCHAR(30) DEFAULT 'AGENDADO',
        id_aula       INT NULL;

ALTER TABLE aula_aluno
    ADD CONSTRAINT fk_aula_aluno_aula_log
        FOREIGN KEY (id_aula) REFERENCES aula(id)
        ON DELETE NO ACTION;
