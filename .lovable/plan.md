

## Atualizar cards de funerárias na Home

### Alterações em `src/pages/Home.tsx` (linhas 317-347)

1. **Remover** o botão "Ver página" (linha 341-343)
2. **Usar logo** em vez de cover image: trocar `getFunerariaImage(f.cover_image_url, f.logo_url)` por `f.logo_url || "/placeholder.svg"` com `object-contain` e fundo claro para logos ficarem bem
3. **Adicionar contador de visualizações**: `Eye` icon + `stats.view_count` ao lado da localidade
4. **Adicionar contador de avaliações**: já existe rating, adicionar também quando `review_count === 0` de forma discreta ou manter visível só com dados

Layout atualizado:
```text
┌─────────────────────────────────────┐
│ ┌──────────┐  Nome Comercial        │
│ │  logo    │  ★ 3.9 (18)           │
│ │ contain  │  📍 Localidade        │
│ │          │  👁 392                │
│ └──────────┘                        │
└─────────────────────────────────────┘
```

### Ficheiro editado
1. `src/pages/Home.tsx`

