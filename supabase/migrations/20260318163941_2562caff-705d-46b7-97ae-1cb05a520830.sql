UPDATE funerarias 
SET servicos = string_to_array(servicos[1], ', ')
WHERE array_length(servicos, 1) = 1 
  AND servicos[1] LIKE '%,%';