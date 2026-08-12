-- Remove a logica de aula da tabela disponibilidade.
-- chk_disp_cancelada e flag_cancelada ja foram removidos em V1_12.
-- Mantém apenas os campos disponivel e reposicao.
--
-- No Postgres os defaults não são constraints nomeados à parte (diferente do SQL Server),
-- então dropar a coluna já remove o default junto — não é preciso caçar nomes gerados.

ALTER TABLE disponibilidade DROP CONSTRAINT IF EXISTS chk_disp_aula_marcada;
ALTER TABLE disponibilidade DROP CONSTRAINT IF EXISTS fk_disp_aluno;
ALTER TABLE disponibilidade DROP CONSTRAINT IF EXISTS fk_disp_aula;

ALTER TABLE disponibilidade DROP COLUMN IF EXISTS aula_marcada;
ALTER TABLE disponibilidade DROP COLUMN IF EXISTS aula_id;
ALTER TABLE disponibilidade DROP COLUMN IF EXISTS aluno_id;
