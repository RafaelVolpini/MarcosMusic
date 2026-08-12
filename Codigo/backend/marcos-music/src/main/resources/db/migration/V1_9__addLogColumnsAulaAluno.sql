ALTER TABLE aula_aluno
    ADD COLUMN data_registro TIMESTAMP DEFAULT now(),
    ADD COLUMN acao          VARCHAR(30) DEFAULT 'AGENDADO',
    ADD COLUMN id_aula       INT NULL;

ALTER TABLE aula_aluno
    ADD CONSTRAINT fk_aula_aluno_aula_log
        FOREIGN KEY (id_aula) REFERENCES aula(id)
        ON DELETE NO ACTION;
