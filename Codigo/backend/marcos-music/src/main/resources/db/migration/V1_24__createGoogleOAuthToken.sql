-- Persiste tokens do Google OAuth para que não sejam perdidos no restart do servidor
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'google_oauth_token'
)
BEGIN
    CREATE TABLE google_oauth_token (
        user_id       UNIQUEIDENTIFIER NOT NULL,
        access_token  NVARCHAR(2000)   NOT NULL,
        refresh_token NVARCHAR(2000)   NULL,
        expires_at    BIGINT           NOT NULL,
        CONSTRAINT pk_google_oauth_token PRIMARY KEY (user_id),
        CONSTRAINT fk_google_token_user FOREIGN KEY (user_id) REFERENCES usuario(id) ON DELETE CASCADE
    );
END
