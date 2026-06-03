CREATE TABLE modulo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
);

CREATE TABLE upload_modulo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    id_modulo INT NOT NULL,

    CONSTRAINT fk_upload_modulo
        FOREIGN KEY (id_modulo)
        REFERENCES modulo(id)
        ON DELETE CASCADE
);