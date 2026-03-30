

## Adicionar fotos aos óbitos existentes

### Dados
10 novas fotos para os óbitos nº 7-16 da importação anterior (Funerária S. João):
- 07 - João Carlos de Brito Galvão
- 08 - Lourenço Gonçalves Cunha
- 09 - Maria Monteiro Pereira
- 10 - António de Morais Corrêa
- 11 - Maria Pereira Dantas
- 12 - António Alberto Dias
- 13 - Olinda Esteves Loureiro
- 14 - Maria da Conceição Lopes Pereira Rodrigues
- 15 - Amaro Martins de Barros
- 16 - Armando Silva Araújo

### Processo (script direto)
1. Consultar a tabela `obituaries` para obter os IDs dos 10 registos pelo nome
2. Upload das 10 fotos ao bucket `obituary-photos` (pasta `sjoao-import/`)
3. Atualizar o campo `photo_url` de cada registo com o URL público do storage

### Ficheiros do projeto
Nenhuma alteração ao código. Apenas operações de dados (upload + update).

