

## Adicionar fotos aos óbitos existentes (#07-16)

### Processo
1. Upload das 10 fotos ao bucket `obituary-photos` (pasta `sjoao-import/`)
2. Consultar a tabela `obituaries` para confirmar que os 10 registos existem (por nome + funeraria_id)
3. Atualizar apenas o campo `photo_url` de cada registo correspondente via migração SQL

### Mapeamento foto → nome
| Foto | display_name (ILIKE) |
|------|---------------------|
| 07-joao-carlos-de-brito-galvao.jpg | %Brito Galv% |
| 08-lourenco-goncalves-cunha.jpg | %Lourenço%Cunha% |
| 09-maria-monteiro-pereira.jpg | %Monteiro Pereira% |
| 10-antonio-de-morais-correa.jpg | %Morais Corr% |
| 11-maria-pereira-dantas.jpg | %Pereira Dantas% |
| 12-antonio-alberto-dias.jpg | %Alberto Dias% |
| 13-olinda-esteves-loureiro.jpg | %Esteves Loureiro% |
| 14-maria-da-conceicao-lopes-pereira-rodrigues.jpg | %Conceição%Rodrigues% |
| 15-amaro-martins-de-barros.jpg | %Amaro%Barros% |
| 16-armando-silva-araujo.jpg | %Silva Araújo% |

### Detalhes técnicos
- Bucket: `obituary-photos` (público, já existe)
- Path: `sjoao-import/{filename}`
- URL: `https://oxvpukidtudltzntwlsz.supabase.co/storage/v1/object/public/obituary-photos/sjoao-import/{filename}`
- Apenas UPDATE no campo `photo_url`, sem criar registos novos
- Filtro: `funeraria_id = '1dd8e1e1-2c91-49f9-a1b0-1faa7dc4b55d'`

