

## Plano: Adicionar botão "Novo Orçamento" no Dashboard

### Alteração
**`src/pages/Dashboard.tsx`** — Adicionar um segundo botão ao lado do "Novo Obituário" (linha 546-549) que navega para `/budgets/new`:

```tsx
<Button variant="outline" onClick={() => navigate("/budgets/new")}>
  <Receipt className="w-4 h-4 mr-2" />
  Novo Orçamento
</Button>
```

- Importar `Receipt` do lucide-react (já usado no Sidebar para Orçamentos)
- Botão com `variant="outline"` para diferenciar visualmente do botão primário
- Posicionado antes do botão "Novo Obituário" na div `flex items-center gap-3`

### Ficheiro editado
1. `src/pages/Dashboard.tsx`

