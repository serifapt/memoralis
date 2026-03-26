

## Plano: Atualizar logo e ícone Memoralis em todo o projeto

### Contexto
O projeto usa 3 versões dos assets Memoralis:
- `src/assets/logo-memoralis.png` — usado em **15 ficheiros** (páginas públicas, auth, headers)
- `src/assets/logo-memoralis.svg` — usado apenas no **Sidebar.tsx**
- `src/assets/icon-memoralis.svg` — usado apenas no **Sidebar.tsx** (collapsed)
- **Inline SVG** no `ObituaryIcons.tsx` com cores cinza (#6C727F) em vez das cores da marca

### Alterações

#### 1. Substituir ficheiros de assets
- Copiar `memoralis-logo-cores.svg` → `src/assets/logo-memoralis.svg` (substituir)
- Copiar `memoralis-icon-cor.svg` → `src/assets/icon-memoralis.svg` (substituir)
- Eliminar `src/assets/logo-memoralis.png` (já não será necessário)

#### 2. Migrar todos os imports de PNG para SVG (15 ficheiros)
Alterar `import logo from "@/assets/logo-memoralis.png"` → `import logo from "@/assets/logo-memoralis.svg"` em:
- `src/components/layout/PublicHeader.tsx`
- `src/components/layout/CareHeader.tsx`
- `src/components/layout/AdminSidebar.tsx`
- `src/pages/Auth.tsx`
- `src/pages/ForgotPassword.tsx`
- `src/pages/ResetPassword.tsx`
- `src/pages/Home.tsx`
- `src/pages/Sobre.tsx`
- `src/pages/Blog.tsx`
- `src/pages/BlogPost.tsx`
- `src/pages/Contactos.tsx`
- `src/pages/FunerariaRegister.tsx`
- `src/pages/FunerariaStatus.tsx`
- `src/pages/FunerariaArchive.tsx`
- `src/pages/FunerariaDetail.tsx`
- `src/pages/ObituaryArchive.tsx`
- `src/pages/ObituaryDetail.tsx`

#### 3. Atualizar LogoMemoralis inline no ObituaryIcons.tsx
Substituir o SVG inline do `LogoMemoralis` (atualmente cinza #6C727F) pelas cores da marca:
- Ícone (3 barras): `fill="#d85151"` (vermelho)
- Wordmark (texto "memoralis"): `fill="#2d595e"` (verde escuro)
- Atualizar paths e viewBox para coincidir com o SVG oficial uploaded

#### 4. Sidebar.tsx — sem alterações de import
Já importa os ficheiros `.svg` correctos. Só beneficia da substituição dos ficheiros.

### Ficheiros editados
1. `src/assets/logo-memoralis.svg` — substituído pelo novo
2. `src/assets/icon-memoralis.svg` — substituído pelo novo
3. `src/components/obituaries/ObituaryIcons.tsx` — cores atualizadas no LogoMemoralis
4. 17 ficheiros com import `.png` → `.svg`

