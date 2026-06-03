-- Remove a coluna flag_cancelada de disponibilidade.
-- O estado de cancelamento agora é derivado diretamente de aula.flag_cancelada via FK aula_id.

-- 1. Dropa o DEFAULT constraint gerado automaticamente pelo SQL Server
DECLARE @df NVARCHAR(256);
SELECT @df = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
JOIN sys.tables t ON c.object_id = t.object_id
WHERE t.name = 'disponibilidade' AND c.name = 'flag_cancelada';
IF @df IS NOT NULL
    EXEC('ALTER TABLE disponibilidade DROP CONSTRAINT ' + @df);

-- 2. Dropa o CHECK constraint nomeado
ALTER TABLE disponibilidade DROP CONSTRAINT chk_disp_cancelada;

-- 3. Dropa a coluna
ALTER TABLE disponibilidade DROP COLUMN flag_cancelada;
