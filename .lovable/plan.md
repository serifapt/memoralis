

## Plano: Adicionar opções de personalização e tipos de anúncio ao AnnouncementGenerator

### Contexto
O utilizador quer que, antes de gerar o anúncio, possa configurar:
1. Se inclui o local de falecimento (ex: "Faleceu em França")
2. Se usa a mensagem da família do processo
3. O **tipo de anúncio** a gerar (não apenas "Faleceu", mas também Missas e Aniversários)

### Alterações

#### 1. `src/components/obituaries/types.ts` — Novo tipo de anúncio
Adicionar:
```ts
export type AnnouncementType = "faleceu" | "faleceu_local" | "missa_7" | "missa_30" | "missa_aniversario";
```

#### 2. `src/components/obituaries/AnnouncementGenerator.tsx` — Painel de opções
Antes da selecção de template, adicionar um Card com:
- **Select** para tipo de anúncio com 5 opções:
  - Faleceu
  - Faleceu em "[local]" (preenche automaticamente com `deathLocation`)
  - Missa 7º Dia
  - Missa 30º Dia
  - Missa 1º Aniversário
- **Checkbox** "Incluir local de falecimento" (visível apenas quando tipo é "faleceu_local", pré-preenchido com `deathLocation`)
- **Checkbox** "Incluir mensagem da família" (toggle para usar `publicMessage` no template)

Novo estado:
```ts
const [announcementType, setAnnouncementType] = useState<AnnouncementType>("faleceu");
const [includeDeathLocation, setIncludeDeathLocation] = useState(false);
const [includeFamilyMessage, setIncludeFamilyMessage] = useState(true);
```

Passar `announcementType`, `includeDeathLocation` e `includeFamilyMessage` ao `ObituaryTemplateA4`.

#### 3. `src/components/obituaries/ObituaryTemplateA4.tsx` — Adaptar ao tipo de anúncio
Expandir a interface `ObituaryTemplateA4Data` com:
```ts
announcementType?: AnnouncementType;
includeDeathLocation?: boolean;
includeFamilyMessage?: boolean;
```

Lógica condicional no template:
- **"faleceu"**: Mostra "FALECEU" sem local
- **"faleceu_local"**: Mostra "FALECEU EM [LOCAL]"
- **"missa_7"**: Substitui o bloco "FALECEU" por "MISSA DO 7º DIA" e mostra apenas a secção de cerimónia religiosa
- **"missa_30"**: Idem para 30º dia
- **"missa_aniversario"**: "MISSA DO 1º ANIVERSÁRIO"
- Se `includeFamilyMessage` for false, omite o bloco de mensagem pública

### Ficheiros
- `src/components/obituaries/types.ts`
- `src/components/obituaries/AnnouncementGenerator.tsx`
- `src/components/obituaries/ObituaryTemplateA4.tsx`

