-- Plano do aluno: quantidade máxima de aulas por semana (padrão: 3)
ALTER TABLE aluno ADD aulas_por_semana_plano INT NOT NULL DEFAULT 3;
