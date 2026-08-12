-- Remove a coluna flag_cancelada de disponibilidade.
-- O estado de cancelamento agora é derivado diretamente de aula.flag_cancelada via FK aula_id.
--
-- No Postgres o DEFAULT é um atributo da própria coluna (não um constraint nomeado à parte
-- como no SQL Server), então não é preciso localizar/dropar um "default constraint" antes:
-- basta remover o CHECK constraint e a coluna.

ALTER TABLE disponibilidade DROP CONSTRAINT IF EXISTS chk_disp_cancelada;
ALTER TABLE disponibilidade DROP COLUMN flag_cancelada;
