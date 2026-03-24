

## Plano: Ativar funcionalidades de partilha

### Alterações em `src/pages/ObituaryDetail.tsx` (linhas 314-318)

Os botões Facebook, WhatsApp e Email já existem mas não têm `onClick`. Adicionar:

1. **Facebook**: `onClick` abre `https://www.facebook.com/sharer/sharer.php?u={url}` em nova janela
2. **WhatsApp** (MessageCircle): `onClick` abre `https://wa.me/?text={texto + url}` em nova janela
3. **Email** (Mail): `onClick` abre `mailto:?subject={nome}&body={texto + url}`
4. **Copiar link** (LinkIcon): já funciona — adicionar toast de confirmação "Link copiado!"
5. **Imprimir** (Printer): já funciona via `window.print()`

O URL de partilha será `window.location.href` e o texto incluirá o nome do falecido.

