CREATE TABLE login_history (
    id           UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    usuario_id   UNIQUEIDENTIFIER NOT NULL,
    timestamp    DATETIME2        NOT NULL,
    termos_aceito BIT             NOT NULL DEFAULT 0,

    CONSTRAINT fk_login_history_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_login_history_usuario_ts
    ON login_history (usuario_id, timestamp DESC);
