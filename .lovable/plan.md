

## Alterar cor do logo para branco no footer

O logo SVG tem cores fixas (#d85151 e #2d595e). Para o tornar branco no footer escuro, basta adicionar a classe CSS `brightness-0 invert` (Tailwind) ao `<img>` do logo em cada footer.

### Ficheiros a alterar (9 ficheiros)

Em cada ficheiro, localizar `<img src={logo}` dentro do `<footer>` e adicionar `className="h-8 brightness-0 invert"`:

1. `src/pages/Home.tsx`
2. `src/pages/Blog.tsx`
3. `src/pages/BlogPost.tsx`
4. `src/pages/Sobre.tsx`
5. `src/pages/Contactos.tsx`
6. `src/pages/FunerariaDetail.tsx`
7. `src/pages/FunerariaArchive.tsx`
8. `src/pages/ObituaryArchive.tsx`
9. `src/pages/ObituaryDetail.tsx`

### Alteração padrão

```tsx
// Antes
<img src={logo} alt="Memoralis" className="h-8" />

// Depois
<img src={logo} alt="Memoralis" className="h-8 brightness-0 invert" />
```

**Nota:** Uma melhoria futura seria extrair o footer para um componente partilhado, evitando duplicação.

