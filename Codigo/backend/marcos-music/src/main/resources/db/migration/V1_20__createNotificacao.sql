-- V1_20: Tabela de notificações do sistema
CREATE TABLE notificacao (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    destinatario NVARCHAR(100) NOT NULL,  -- UUID do aluno ou 'PROFESSOR'
    tipo         NVARCHAR(50)  NOT NULL,  -- LEMBRETE_HOJE, LEMBRETE_AMANHA, AULA_REAGENDADA, etc.
    titulo       NVARCHAR(255) NOT NULL,
    mensagem     NVARCHAR(500) NOT NULL,
    lida         BIT           NOT NULL DEFAULT 0,
    criada_em    DATETIME2     NOT NULL DEFAULT GETDATE(),
    ref_id       BIGINT        NULL      -- id da aula, reposição ou chat relacionado
);

CREATE INDEX ix_notificacao_destinatario ON notificacao (destinatario);
CREATE INDEX ix_notificacao_lida         ON notificacao (lida);
