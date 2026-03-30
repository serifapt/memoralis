

## Ajustes mobile no header e grids

### Alterações

#### 1. `src/components/layout/PublicHeader.tsx`
- **Logo menor no mobile**: Alterar classe do logo de `w-[220px]` para `w-[165px] md:w-[220px]` (75% = 165px)
- **Remover botão "Entrar"**: Eliminar o `Button variant="ghost"` com "Entrar" — manter apenas o botão "Registar" em todos os dispositivos
- **Menu mobile (hamburger)**: Adicionar botão `Menu` (ícone) visível apenas em `md:hidden`. Ao clicar, abre um `Sheet` (lateral) com os links de navegação (Início, Obituário, Funerárias, Sobre, Blog, Contactos) + botão Registar

#### 2. Grids 2 colunas no mobile
Alterar os grids de obituários e funerárias de `grid-cols-1 sm:grid-cols-2` para `grid-cols-2` em todos os ficheiros:

- **`src/pages/Home.tsx`**:
  - Secção obituários: `grid-cols-2 lg:grid-cols-4`
  - Secção funerárias: `grid-cols-2 lg:grid-cols-3`
- **`src/pages/ObituaryArchive.tsx`**: `grid-cols-2 lg:grid-cols-4`
- **`src/pages/FunerariaArchive.tsx`**: `grid-cols-2 lg:grid-cols-3`

### Ficheiros editados
1. `src/components/layout/PublicHeader.tsx` — logo menor, menu mobile com Sheet, remover "Entrar"
2. `src/pages/Home.tsx` — grids 2 colunas
3. `src/pages/ObituaryArchive.tsx` — grid 2 colunas
4. `src/pages/FunerariaArchive.tsx` — grid 2 colunas

