

## Alterar grelha de obituários para 6 colunas

### Alterações

**1. `src/pages/Home.tsx`** — linha 240
```
grid grid-cols-2 lg:grid-cols-4 gap-6
→ grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4
```
Ajustar também o skeleton para gerar 6 itens em vez de 4.

**2. `src/pages/ObituaryArchive.tsx`** — linhas 313 e 323
```
grid grid-cols-2 lg:grid-cols-4 gap-6
→ grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4
```
Ajustar skeleton para 6 itens.

