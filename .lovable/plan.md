

## Plano: Centrar texto dos contactos e morada

### Problema
Os links usam `justify-center` (propriedade flexbox) com `display: block`, pelo que o texto não fica centrado. Falta `text-center`.

### Alterações em `src/pages/ObituaryDetail.tsx`

- Linhas 377, 381, 391, 395: substituir `justify-center` por `text-center` nos links de telefone, email, morada e no parágrafo da morada

