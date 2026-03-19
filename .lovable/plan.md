

## Diagnóstico: Porque os dados do dashboard não aparecem nas páginas públicas

### Problema Principal: Versão publicada desatualizada

A página publicada em **memoralis.lovable.app** está a correr uma **versão antiga** do código com dados mock (96 funerárias fictícias, avaliações falsas, carrosséis). A versão atual do código já está ligada a dados reais, mas **ainda não foi publicada**.

**Solução**: Clicar em **"Publish" → "Update"** no canto superior direito do editor Lovable para publicar a versão mais recente.

### Problema Secundário: Imagens (logo e capa) não carregam

Confirmei que:
- Os ficheiros existem no storage (logo: 72KB PNG, capa: 199KB JPEG)
- O bucket `funeraria-logos` está público
- As políticas de acesso permitem leitura anónima
- Os URLs estão corretamente guardados na base de dados

No entanto, o browser dispara o evento `onError` nas imagens, ativando os fallbacks (iniciais "SJ" e placeholder). Isto pode dever-se a:
- Cache do browser com uma resposta antiga (antes do upload)
- Headers CSP que bloqueiam imagens de domínios externos
- Problema temporário de rede

### Plano de Correção

| Ficheiro | Ação |
|---|---|
| `src/pages/FunerariaDetail.tsx` | Adicionar cache-busting nos URLs das imagens e melhor logging |
| `src/pages/FunerariaArchive.tsx` | Adicionar cache-busting e melhorar fallback visual |
| `src/lib/funeraria-utils.ts` | Adicionar função de cache-busting para URLs de storage |

**Detalhes técnicos:**

1. **Cache-busting**: Adicionar `?t={timestamp}` aos URLs das imagens do storage para forçar o browser a carregar a versão mais recente, evitando respostas em cache
2. **Retry on error**: Quando a imagem falha, tentar recarregar uma vez com cache-busting antes de mostrar o fallback
3. **Logging**: Adicionar `console.warn` no `onError` das imagens para facilitar debug futuro

A função em `funeraria-utils.ts`:
```
export function withCacheBust(url: string | null): string | null {
  if (!url) return null;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}
```

Aplicada nos componentes `FunerariaDetail` e `FunerariaArchive` nos `src` das tags `<img>`.

