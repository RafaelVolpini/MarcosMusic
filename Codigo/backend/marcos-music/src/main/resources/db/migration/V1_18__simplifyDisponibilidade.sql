-- Remove a logica de aula da tabela disponibilidade.
-- chk_disp_cancelada e flag_cancelada ja foram removidos em V1_12.
-- Mantém apenas os campos disponivel e reposicao.

-- 1. Remover constraints nomeadas restantes
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'chk_disp_aula_marcada' AND parent_object_id = OBJECT_ID('disponibilidade'))
    ALTER TABLE disponibilidade DROP CONSTRAINT chk_disp_aula_marcada;

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_disp_aluno' AND parent_object_id = OBJECT_ID('disponibilidade'))
    ALTER TABLE disponibilidade DROP CONSTRAINT fk_disp_aluno;

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_disp_aula' AND parent_object_id = OBJECT_ID('disponibilidade'))
    ALTER TABLE disponibilidade DROP CONSTRAINT fk_disp_aula;

-- 2. Remover DEFAULT constraints auto-gerados pelo SQL Server (nomes aleatórios)
DECLARE @df NVARCHAR(256);

SELECT @df = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
JOIN sys.tables t ON c.object_id = t.object_id
WHERE t.name = 'disponibilidade' AND c.name = 'aula_marcada';
IF @df IS NOT NULL EXEC('ALTER TABLE disponibilidade DROP CONSTRAINT ' + @df);

SET @df = NULL;
SELECT @df = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
JOIN sys.tables t ON c.object_id = t.object_id
WHERE t.name = 'disponibilidade' AND c.name = 'aula_id';
IF @df IS NOT NULL EXEC('ALTER TABLE disponibilidade DROP CONSTRAINT ' + @df);

SET @df = NULL;
SELECT @df = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
JOIN sys.tables t ON c.object_id = t.object_id
WHERE t.name = 'disponibilidade' AND c.name = 'aluno_id';
IF @df IS NOT NULL EXEC('ALTER TABLE disponibilidade DROP CONSTRAINT ' + @df);

-- 3. Remover colunas restantes (flag_cancelada ja removida em V1_12)
IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'aula_marcada' AND object_id = OBJECT_ID('disponibilidade'))
    ALTER TABLE disponibilidade DROP COLUMN aula_marcada;

IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'aula_id' AND object_id = OBJECT_ID('disponibilidade'))
    ALTER TABLE disponibilidade DROP COLUMN aula_id;

IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'aluno_id' AND object_id = OBJECT_ID('disponibilidade'))
    ALTER TABLE disponibilidade DROP COLUMN aluno_id;
