CREATE TABLE password_reset_token (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    email        NVARCHAR(255) NOT NULL,
    token        NVARCHAR(64)  NOT NULL UNIQUE,
    expira_em    DATETIME2     NOT NULL,
    usado        BIT           NOT NULL DEFAULT 0
);
