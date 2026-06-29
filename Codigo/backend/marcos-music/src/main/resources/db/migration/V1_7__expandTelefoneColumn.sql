-- Expande coluna telefone de 11 para 20 caracteres para suportar formato (XX) XXXXX-XXXX
ALTER TABLE aluno ALTER COLUMN telefone VARCHAR(20);
