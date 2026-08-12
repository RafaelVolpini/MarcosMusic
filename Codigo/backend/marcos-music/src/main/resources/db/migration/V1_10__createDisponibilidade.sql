-- Tabela de disponibilidade semanal do professor
-- Cada linha representa um slot recorrente: (dia_semana, horario)
-- disponivel  = true → horário liberado para aula regular
-- reposicao   = true → horário liberado exclusivamente para reposição
-- aula_marcada = true → há uma aula concreta vinculada (aula_id + aluno_id obrigatórios)
-- flag_cancelada = true → a aula vinculada foi cancelada (ou a reposição foi cancelada)

CREATE TABLE disponibilidade (
    id              SERIAL      PRIMARY KEY,
    dia_semana      VARCHAR(3)  NOT NULL,   -- 'mon','tue','wed','thu','fri','sat','sun'
    horario         VARCHAR(5)  NOT NULL,   -- '07:00' ... '23:00'
    disponivel      BOOLEAN     NOT NULL DEFAULT FALSE,
    reposicao       BOOLEAN     NOT NULL DEFAULT FALSE,
    aula_marcada    BOOLEAN     NOT NULL DEFAULT FALSE,
    aula_id         INT         NULL,
    aluno_id        UUID        NULL,
    flag_cancelada  BOOLEAN     NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_disponibilidade
        UNIQUE (dia_semana, horario),

    CONSTRAINT fk_disp_aula
        FOREIGN KEY (aula_id)
        REFERENCES aula(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_disp_aluno
        FOREIGN KEY (aluno_id)
        REFERENCES aluno(id)
        ON DELETE NO ACTION,

    -- se aula_marcada = true, aula_id e aluno_id devem ser preenchidos
    CONSTRAINT chk_disp_aula_marcada
        CHECK (aula_marcada = FALSE OR (aula_id IS NOT NULL AND aluno_id IS NOT NULL)),

    -- flag_cancelada só faz sentido quando há aula marcada
    CONSTRAINT chk_disp_cancelada
        CHECK (flag_cancelada = FALSE OR aula_marcada = TRUE)
);
