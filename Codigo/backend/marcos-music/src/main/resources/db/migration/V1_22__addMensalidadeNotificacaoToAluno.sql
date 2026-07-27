-- Adicionar coluna para rastrear quando foi enviada notificação de mensalidade
ALTER TABLE aluno ADD
    mensalidade_notificacao DATE NULL;
