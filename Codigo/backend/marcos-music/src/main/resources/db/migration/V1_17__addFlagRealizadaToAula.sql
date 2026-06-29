-- Marca se uma aula foi realizada (encerrada naturalmente após o horário de fim)
ALTER TABLE aula ADD flag_realizada BIT NOT NULL DEFAULT 0;
