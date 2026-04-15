-- Permitir registro sem CPF (preenchido depois no perfil)
ALTER TABLE aluno ALTER COLUMN cpf VARCHAR(14) NULL;

-- Recriar índice único com filtro para ignorar NULLs
DROP INDEX idx_aluno_cpf ON aluno;
CREATE UNIQUE INDEX idx_aluno_cpf ON aluno(cpf) WHERE cpf IS NOT NULL;
