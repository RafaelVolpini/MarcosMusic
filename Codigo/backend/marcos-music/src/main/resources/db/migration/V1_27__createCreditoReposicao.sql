-- Criar tabela de créditos de reposição com rastreamento completo
CREATE TABLE credito_reposicao (
    id INT IDENTITY(1,1) PRIMARY KEY,
    aluno_id UNIQUEIDENTIFIER NOT NULL,
    data_criacao DATETIME2 DEFAULT GETDATE(),
    data_expiracao DATETIME2 NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'VALIDO', -- VALIDO, EXPIRADO, USADO
    aula_id INT NULL,
    reposicao_id INT NULL,
    observacao NVARCHAR(500),
    FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aula(id),
    FOREIGN KEY (reposicao_id) REFERENCES reposicao(id),
    INDEX idx_aluno_status (aluno_id, status),
    INDEX idx_expiracao (data_expiracao)
);

-- Adicionar coluna de rastreamento em aula (para saber se cancelamento foi válido)
ALTER TABLE aula ADD
    data_solicitacao_cancelamento DATETIME2 NULL,
    cancelamento_gera_credito BIT DEFAULT 0;

-- Remover coluna reposicoes de aluno (vamos usar credito_reposicao)
-- Mas manter compatibilidade: vamos calcular dinamicamente via view
ALTER TABLE aluno ADD
    data_ultima_leitura_creditos DATETIME2 NULL;
