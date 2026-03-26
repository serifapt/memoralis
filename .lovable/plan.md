

## Plano: Melhorar ObituaryTemplateA4 e integração com dados completos

### Problema actual

O template A4 já existe e é visualmente próximo do design de referência, mas o `AnnouncementGenerator` **não passa vários campos importantes** ao template:
- **Foto** (`photoUrl`) — não é passada
- **Local de falecimento** (`deathLocation`) — não é passado
- **Freguesia e localidade** (`parish`, `municipality`) — não são passados
- **Dados da funerária** (nome, telefone, email, website, logo) — não são passados

### Alterações

#### 1. `src/pages/NewObituary.tsx` — Passar dados completos ao AnnouncementGenerator

- Expandir a interface `AnnouncementGeneratorProps` para incluir os campos em falta
- No ponto onde `<AnnouncementGenerator>` é renderizado (~linha 2413), adicionar:
  - `photoUrl: photoPreview`
  - `deathLocation: formData.deathLocation`
  - `parish: formData.freguesia`
  - `municipality: formData.locality`
- Buscar dados da funerária (`nome_comercial`, `telefone`, `email`, `website`, `logo_url`) no `fetchFunerariaId` e guardá-los em estado local para os passar também

#### 2. `src/components/obituaries/AnnouncementGenerator.tsx` — Propagar campos ao template

- Adicionar os novos campos à interface `obituaryData`
- Passar `photoUrl`, `deathLocation`, `parish`, `municipality` e dados da funerária ao `<ObituaryTemplateA4>`

#### 3. `src/components/obituaries/ObituaryTemplateA4.tsx` — Refinamentos visuais

O template já está bem estruturado. Ajustes menores para alinhar com o PDF de referência:
- Garantir que a foto e o nome ficam lado a lado no topo (já está assim)
- Garantir que o "FALECEU EM..." e as cerimónias ficam alinhados na mesma linha (já está assim)
- O rodapé com logo da funerária e contactos já existe

Essencialmente, o componente já está correcto — o problema principal é que **não recebe os dados**.

### Ficheiros
- `src/pages/NewObituary.tsx` — buscar dados da funerária e passar todos os campos
- `src/components/obituaries/AnnouncementGenerator.tsx` — expandir interface e propagar
- `src/components/obituaries/ObituaryTemplateA4.tsx` — sem alterações significativas (apenas se necessário ajuste menor)

