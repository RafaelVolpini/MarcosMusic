CREATE TABLE password_reset (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    usuario_id UNIQUEIDENTIFIER NOT NULL,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    expires_at DATETIME2 NOT NULL,
    completed_at DATETIME2 NULL,
    CONSTRAINT FK_password_reset_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
);
GO

CREATE INDEX idx_password_reset_email
ON password_reset(email);

CREATE INDEX idx_password_reset_code
ON password_reset(verification_code);

CREATE INDEX idx_password_reset_status
ON password_reset(status);