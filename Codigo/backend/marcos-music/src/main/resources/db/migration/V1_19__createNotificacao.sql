-- V1_20: Tabela de notificações do sistema
CREATE TABLE notificacao (
    id          BIGSERIAL     PRIMARY KEY,
    destinatario VARCHAR(100) NOT NULL,  -- UUID do aluno ou 'PROFESSOR'
    tipo         VARCHAR(50)  NOT NULL,  -- LEMBRETE_HOJE, LEMBRETE_AMANHA, AULA_REAGENDADA, etc.
    titulo       VARCHAR(255) NOT NULL,
    mensagem     VARCHAR(500) NOT NULL,
    lida         BOOLEAN      NOT NULL DEFAULT FALSE,
    criada_em    TIMESTAMP    NOT NULL DEFAULT now(),
    ref_id       BIGINT       NULL      -- id da aula, reposição ou chat relacionado
);

CREATE INDEX ix_notificacao_destinatario ON notificacao (destinatario);
CREATE INDEX ix_notificacao_lida         ON notificacao (lida);
