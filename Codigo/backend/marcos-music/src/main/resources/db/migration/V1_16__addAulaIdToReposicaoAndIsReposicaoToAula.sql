-- Vincula reposição à aula de origem (opcional – só preenchido quando criado a partir de uma aula)
ALTER TABLE reposicao ADD aula_id INT NULL;
ALTER TABLE reposicao ADD CONSTRAINT fk_reposicao_aula
    FOREIGN KEY (aula_id) REFERENCES aula(id) ON DELETE SET NULL;

-- Marca se uma aula é do tipo reposição (0 = aula normal, 1 = reposição)
ALTER TABLE aula ADD is_reposicao BIT NOT NULL DEFAULT 0;
