-- Criar tabela de créditos de reposição com rastreamento completo
CREATE TABLE credito_reposicao (
    id SERIAL PRIMARY KEY,
    aluno_id UUID NOT NULL,
    data_criacao TIMESTAMP DEFAULT now(),
    data_expiracao TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VALIDO', -- VALIDO, EXPIRADO, USADO
    aula_id INT NULL,
    reposicao_id INT NULL,
    observacao VARCHAR(500),
    FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aula(id),
    FOREIGN KEY (reposicao_id) REFERENCES reposicao(id)
);

-- Postgres não aceita INDEX inline dentro de CREATE TABLE (sintaxe MySQL/SQL Server) —
-- os índices viram CREATE INDEX separados abaixo.
CREATE INDEX idx_aluno_status ON credito_reposicao (aluno_id, status);
CREATE INDEX idx_expiracao ON credito_reposicao (data_expiracao);

-- Adicionar coluna de rastreamento em aula (para saber se cancelamento foi válido)
ALTER TABLE aula
    ADD COLUMN data_solicitacao_cancelamento TIMESTAMP NULL,
    ADD COLUMN cancelamento_gera_credito BOOLEAN DEFAULT FALSE;

-- Remover coluna reposicoes de aluno (vamos usar credito_reposicao)
-- Mas manter compatibilidade: vamos calcular dinamicamente via view
ALTER TABLE aluno
    ADD COLUMN data_ultima_leitura_creditos TIMESTAMP NULL;
