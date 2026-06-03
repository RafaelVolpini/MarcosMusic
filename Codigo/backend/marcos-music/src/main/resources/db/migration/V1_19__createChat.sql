-- Chat: uma conversa entre professor e aluno
CREATE TABLE chat (
    id        INT              IDENTITY(1,1) PRIMARY KEY,
    aluno_id  UNIQUEIDENTIFIER NOT NULL,
    criado_em DATETIME2        NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_chat_aluno FOREIGN KEY (aluno_id) REFERENCES aluno(id)
);

-- Mensagens do chat
CREATE TABLE chat_mensagem (
    id           BIGINT           IDENTITY(1,1) PRIMARY KEY,
    chat_id      INT              NOT NULL,
    remetente    NVARCHAR(20)     NOT NULL,          -- 'professor' ou 'aluno'
    remetente_id UNIQUEIDENTIFIER NOT NULL,
    conteudo     NVARCHAR(MAX)    NOT NULL,
    tipo         NVARCHAR(20)     NOT NULL DEFAULT 'text', -- 'text','image','video' no futuro
    lida         BIT              NOT NULL DEFAULT 0,
    criada_em    DATETIME2        NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_msg_chat FOREIGN KEY (chat_id) REFERENCES chat(id) ON DELETE CASCADE
);
