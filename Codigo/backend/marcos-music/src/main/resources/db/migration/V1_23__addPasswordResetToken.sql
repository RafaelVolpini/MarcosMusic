CREATE TABLE password_reset_token (
    id           BIGSERIAL     PRIMARY KEY,
    email        VARCHAR(255)  NOT NULL,
    token        VARCHAR(64)   NOT NULL UNIQUE,
    expira_em    TIMESTAMP     NOT NULL,
    usado        BOOLEAN       NOT NULL DEFAULT FALSE
);
