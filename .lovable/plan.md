## Objetivo

No diálogo "Novo cemitério" (`/admin/care/cemeterios`), adicionar um campo "Link do Google Maps" com botão **Importar**. Ao clicar, os campos do formulário (Nome, Localidade, Freguesia, Morada, Lat/Lng e pin no mapa) são preenchidos automaticamente a partir do link.

Suporta links curtos `https://share.google/...`, `https://maps.app.goo.gl/...` e URLs completos do Google Maps.

## Como vai funcionar

1. Utilizador cola o link partilhado e clica em **Importar**.
2. Uma Edge Function `import-google-maps-place` faz o seguinte:
   - Segue os redirects do link curto até chegar ao URL final do Google Maps.
   - Extrai do URL:
     - **Nome** do local (a partir do segmento `/place/<nome>/`).
     - **Coordenadas** (a partir de `!3d<lat>!4d<lng>` ou `/@lat,lng,zoom`).
   - Faz **reverse geocoding** via [OpenStreetMap Nominatim](https://nominatim.org/) (gratuito, sem chave) para obter de forma estruturada: `morada` (road + número), `freguesia` (suburb/village/parish), `municipio` (city/town/municipality) e código postal.
3. A resposta volta ao frontend, que faz `setForm({...})` com os campos preenchidos e centra o pin do `LeafletPicker` nas coordenadas.

Não é necessário ligar a conta Google Maps Platform — a Nominatim cobre a parte de morada/freguesia/município. Se o link já trouxer o nome e as coordenadas, o resto é apenas refinamento da morada.

## Alterações

**Nova Edge Function** `supabase/functions/import-google-maps-place/index.ts`
- Recebe `{ url: string }`.
- `fetch(url, { redirect: "follow" })` para resolver shortlinks.
- Regex sobre o URL final para extrair `name`, `lat`, `lng`.
- Chama `https://nominatim.openstreetmap.org/reverse?lat=&lon=&format=json&addressdetails=1&accept-language=pt` com `User-Agent: Memoralis/1.0`.
- Devolve `{ name, lat, lng, morada, freguesia, municipio, postcode, raw_address }`.
- `verify_jwt = false` (consulta admin, mas a action é trivial).

**Editado** `src/pages/AdminCemeteries.tsx`
- No `Dialog` "Novo / Editar cemitério", adicionar acima dos campos atuais:
  - Input "Link do Google Maps" + botão "Importar" (com loader).
  - Pequeno texto de ajuda: *"Cole o link partilhado do Google Maps para preencher automaticamente."*
- Função `handleImport()` chama a edge function via `supabase.functions.invoke("import-google-maps-place", { body: { url } })` e faz `setForm({...form, nome, morada, freguesia, municipio, lat, lng })`.
- Mostra toast de sucesso / erro ("Não foi possível ler o link").

**Sem alterações na BD** — usa as colunas existentes (`nome`, `municipio`, `freguesia`, `morada`, `lat`, `lng`).

## Notas

- O nome devolvido pelo Google ("Cemitério de São Romão de Neiva") é mantido tal e qual no campo Nome — o utilizador pode editar antes de guardar.
- Se a Nominatim falhar (raro), o formulário ainda recebe nome + coordenadas; o utilizador preenche município/freguesia à mão.
- O pin do `LeafletPicker` move-se para o `lat,lng` importado.
