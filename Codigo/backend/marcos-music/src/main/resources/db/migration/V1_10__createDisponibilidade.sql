-- Tabela de disponibilidade semanal do professor
-- Cada linha representa um slot recorrente: (dia_semana, horario)
-- disponivel  = 1 → horário liberado para aula regular
-- reposicao   = 1 → horário liberado exclusivamente para reposição
-- aula_marcada = 1 → há uma aula concreta vinculada (aula_id + aluno_id obrigatórios)
-- flag_cancelada = 1 → a aula vinculada foi cancelada (ou a reposição foi cancelada)

CREATE TABLE disponibilidade (
    id              INT              IDENTITY(1,1) PRIMARY KEY,
    dia_semana      VARCHAR(3)       NOT NULL,   -- 'mon','tue','wed','thu','fri','sat','sun'
    horario         VARCHAR(5)       NOT NULL,   -- '07:00' ... '23:00'
    disponivel      BIT              NOT NULL DEFAULT 0,
    reposicao       BIT              NOT NULL DEFAULT 0,
    aula_marcada    BIT              NOT NULL DEFAULT 0,
    aula_id         INT              NULL,
    aluno_id        UNIQUEIDENTIFIER NULL,
    flag_cancelada  BIT              NOT NULL DEFAULT 0,

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

    -- se aula_marcada = 1, aula_id e aluno_id devem ser preenchidos
    CONSTRAINT chk_disp_aula_marcada
        CHECK (aula_marcada = 0 OR (aula_id IS NOT NULL AND aluno_id IS NOT NULL)),

    -- flag_cancelada só faz sentido quando há aula marcada
    CONSTRAINT chk_disp_cancelada
        CHECK (flag_cancelada = 0 OR aula_marcada = 1)
);
