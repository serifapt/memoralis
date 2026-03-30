

## Importação em massa de 32 óbitos - Funerária S. João

### Dados disponíveis
- **Excel**: 32 óbitos com nome, velório (local/data/hora), funeral (local/data/hora), cemitério e observações
- **Fotos**: 9 fotos para óbitos nº 5, 6, 18, 19, 20, 21, 22, 23, 24
- **Funerária ID**: `1dd8e1e1-2c91-49f9-b1b0-1faa7dc4b55d`

### Processo de importação (script Python)

1. **Ler o Excel** com pandas e mapear colunas
2. **Inserir 32 registos** na tabela `obituaries`:
   - `display_name` e `full_name` = nome do Excel
   - `funeraria_id` = ID da Funerária S. João
   - `death_date` = data do funeral - 1 dia (melhor aproximação disponível)
   - `is_public = true`, `is_completed = true`
3. **Upload das 9 fotos** ao bucket `obituary-photos` e atualizar `photo_url` nos registos correspondentes
4. **Inserir ceremony_events** para cada óbito:
   - Evento tipo `velorio` (local, data, hora)
   - Evento tipo `funeral` (local, data, hora)
   - Evento tipo `cemiterio` (local do cemitério)
5. Óbitos sem velório (nº 30, 31) ou sem datas (nº 4) serão tratados com os campos disponíveis

### Ficheiros envolvidos
Nenhuma alteração ao código. Apenas inserção de dados via script direto na base de dados e upload ao storage.

### Notas
- As datas de nascimento e falecimento não constam no Excel (só datas de cerimónia) - o `death_date` será aproximado pela data do funeral menos 1 dia
- Os 23 óbitos sem foto ficarão sem imagem (pode adicionar mais fotos depois)

