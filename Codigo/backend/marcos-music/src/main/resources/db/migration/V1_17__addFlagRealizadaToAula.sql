-- Marca se uma aula foi realizada (encerrada naturalmente após o horário de fim)
ALTER TABLE aula ADD COLUMN flag_realizada BOOLEAN NOT NULL DEFAULT FALSE;
