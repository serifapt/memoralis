

# Plano: Implementar upload de foto de destaque do obituário

## Problema
O bloco "Adicionar foto destaque óbito" (linhas 945-956 de `NewObituary.tsx`) é apenas um placeholder visual — um `Input type="text"` e um botão sem funcionalidade. Não há lógica de upload de ficheiro, nem integração com storage.

## Solução

### 1. Criar bucket de storage (se necessário)
Já existe o bucket `obituary-documents` mas é privado. Criar um bucket público `obituary-photos` para as fotos de destaque (precisam ser públicas para exibição no obituário público).

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('obituary-photos', 'obituary-photos', true);

-- RLS: funerárias podem fazer upload/delete das fotos dos seus obituários
CREATE POLICY "Authenticated users can upload obituary photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'obituary-photos');

CREATE POLICY "Anyone can view obituary photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'obituary-photos');

CREATE POLICY "Users can delete own obituary photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'obituary-photos');
```

### 2. Atualizar `NewObituary.tsx`

- Adicionar estado `photoUrl` e `photoFile` para gerir a foto
- Substituir o placeholder por um `<input type="file" accept="image/*">` escondido + preview da imagem
- No `handleSubmit`, antes de guardar o obituário:
  1. Fazer upload do ficheiro para `obituary-photos/{obituaryId}/{filename}`
  2. Obter URL pública via `supabase.storage.from('obituary-photos').getPublicUrl()`
  3. Incluir `photo_url` no objeto `obituaryData`
- Mostrar preview da foto selecionada antes de guardar
- Carregar `photo_url` existente ao editar (já vem do `data.photo_url` mas não está a ser usado)

### Alterações concretas no componente:
- Novo estado: `const [photoFile, setPhotoFile] = useState<File | null>(null)` e `const [photoPreview, setPhotoPreview] = useState<string>("")` 
- Carregar `photoPreview` com `data.photo_url` no `loadObituaryData`
- Input file hidden com ref, triggered pelo botão Camera
- Preview com possibilidade de remover
- Upload no `handleSubmit` antes do insert/update do obituário
- Incluir `photo_url` no `obituaryData`

