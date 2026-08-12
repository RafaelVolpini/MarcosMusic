-- Add ON DELETE CASCADE to FKs that reference aluno(id)
-- so that deleting an aluno automatically cleans up reposicao_aluno and notificacao rows.

ALTER TABLE reposicao_aluno DROP CONSTRAINT IF EXISTS fk_repos_aluno_a;

ALTER TABLE reposicao_aluno
    ADD CONSTRAINT fk_repos_aluno_a
    FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE CASCADE;
