-- V1_21: Garante existência das tabelas chat, chat_mensagem e notificacao
-- (Reparo caso V1_19/V1_20 tenham sido registradas no histórico mas não executadas)

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'chat' AND type = 'U')
BEGIN
    CREATE TABLE chat (
        id        INT              IDENTITY(1,1) PRIMARY KEY,
        aluno_id  UNIQUEIDENTIFIER NOT NULL,
        criado_em DATETIME2        NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_chat_aluno FOREIGN KEY (aluno_id) REFERENCES aluno(id)
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'chat_mensagem' AND type = 'U')
BEGIN
    CREATE TABLE chat_mensagem (
        id           BIGINT           IDENTITY(1,1) PRIMARY KEY,
        chat_id      INT              NOT NULL,
        remetente    NVARCHAR(20)     NOT NULL,
        remetente_id UNIQUEIDENTIFIER NOT NULL,
        conteudo     NVARCHAR(MAX)    NOT NULL,
        tipo         NVARCHAR(20)     NOT NULL DEFAULT 'text',
        lida         BIT              NOT NULL DEFAULT 0,
        criada_em    DATETIME2        NOT NULL DEFAULT GETDATE(),
        CONSTRAINT fk_msg_chat FOREIGN KEY (chat_id) REFERENCES chat(id) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'notificacao' AND type = 'U')
BEGIN
    CREATE TABLE notificacao (
        id           BIGINT        IDENTITY(1,1) PRIMARY KEY,
        destinatario NVARCHAR(100) NOT NULL,
        tipo         NVARCHAR(50)  NOT NULL,
        titulo       NVARCHAR(255) NOT NULL,
        mensagem     NVARCHAR(500) NOT NULL,
        lida         BIT           NOT NULL DEFAULT 0,
        criada_em    DATETIME2     NOT NULL DEFAULT GETDATE(),
        ref_id       BIGINT        NULL
    );
END;
