-- Renomeia os valores de dia_semana de inglês para português
UPDATE disponibilidade SET dia_semana = 'seg' WHERE dia_semana = 'mon';
UPDATE disponibilidade SET dia_semana = 'ter' WHERE dia_semana = 'tue';
UPDATE disponibilidade SET dia_semana = 'qua' WHERE dia_semana = 'wed';
UPDATE disponibilidade SET dia_semana = 'qui' WHERE dia_semana = 'thu';
UPDATE disponibilidade SET dia_semana = 'sex' WHERE dia_semana = 'fri';
UPDATE disponibilidade SET dia_semana = 'sab' WHERE dia_semana = 'sat';
UPDATE disponibilidade SET dia_semana = 'dom' WHERE dia_semana = 'sun';
