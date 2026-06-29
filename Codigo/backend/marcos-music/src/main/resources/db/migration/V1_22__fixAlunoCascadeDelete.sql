-- V1_22: Add ON DELETE CASCADE to FKs that reference aluno(id)
-- so that deleting an aluno automatically cleans up chat, reposicao_aluno, and notificacao rows.

-- ── 1. chat.fk_chat_aluno ─────────────────────────────────────────────────────
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'fk_chat_aluno' AND parent_object_id = OBJECT_ID('chat')
)
    ALTER TABLE chat DROP CONSTRAINT fk_chat_aluno;

ALTER TABLE chat
    ADD CONSTRAINT fk_chat_aluno
    FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE CASCADE;

-- ── 2. reposicao_aluno.fk_repos_aluno_a ──────────────────────────────────────
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'fk_repos_aluno_a' AND parent_object_id = OBJECT_ID('reposicao_aluno')
)
    ALTER TABLE reposicao_aluno DROP CONSTRAINT fk_repos_aluno_a;

ALTER TABLE reposicao_aluno
    ADD CONSTRAINT fk_repos_aluno_a
    FOREIGN KEY (aluno_id) REFERENCES aluno(id) ON DELETE CASCADE;
