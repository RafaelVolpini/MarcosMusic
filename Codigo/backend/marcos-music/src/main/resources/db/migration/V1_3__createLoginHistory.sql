CREATE TABLE login_history (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   UUID NOT NULL,
    timestamp    TIMESTAMP NOT NULL,
    termos_aceito BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_login_history_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_login_history_usuario_ts
    ON login_history (usuario_id, timestamp DESC);
