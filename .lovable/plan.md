

## Corrigir layout e qualidade do template de obituário

### Problemas identificados

1. **Logo funerária** — `left: 40px` está correcto mas o logo pode ser maior (width: 150px → 180px, height: 43px → 50px)
2. **Bloco informações pessoais** — Está a `top: 194px`, mas o fundo da foto é a 248px (40+208). Precisa subir para alinhar com o fundo da foto
3. **Flores** — `backgroundPosition: "right top"` deveria ser `"right bottom"` e o container deve tocar o fundo da página (top + height = 842)
4. **Qualidade geral e QR** — `scale: 2` insuficiente, aumentar para `scale: 3`

### Alterações

**1. `src/components/ObituaryTemplate/ObituaryTemplate.tsx`**

- **Logo funerária** (linha 305): aumentar `width: "180px"`, `height: "50px"`, manter `left: "40px"`, ajustar `top: "700px"`
- **Bloco informações pessoais** (linha 206): mover `top: "194px"` → `top: "210px"` para que o fundo do bloco (idade + localidade ~38px) alinhe com o fundo da foto (248px)
- **Flores** (linha 395-406): mudar para `left: "390px"`, `top: "578px"`, `width: "205px"`, `height: "264px"`, `backgroundPosition: "right bottom"` — garantir que o container toca o fundo da página (578+264=842)

**2. `src/components/obituaries/AnnouncementGenerator.tsx`**

- **Qualidade PDF** (linha 281): aumentar `scale: 2` → `scale: 3` para melhorar nitidez do QR code e texto

