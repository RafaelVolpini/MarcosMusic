-- Adicionar coluna para rastrear quando foi enviada notificação de mensalidade
ALTER TABLE aluno ADD COLUMN mensalidade_notificacao DATE NULL;
