

## Uniformizar estrela de avaliação nos cards de funerárias

### Problema
A estrela de avaliação precisa seguir o padrão do anexo: estrela preenchida cor laranja/amber quando há avaliações, com rating e total entre parênteses. Sem avaliações, a estrela não deve aparecer preenchida (ou não aparecer).

### Alterações

#### 1. `src/components/funerarias/PublicFunerariaCard.tsx` (arquivo)
- Manter lógica atual: só mostra estrela + rating quando `review_count > 0`
- Mudar cor da estrela de `fill-primary text-primary` para `fill-amber-500 text-amber-500` (laranja como no anexo)
- Rating em `font-semibold text-foreground`, count em `text-muted-foreground`

#### 2. `src/pages/Home.tsx` (secção funerárias, linhas 330-336)
- Mesma alteração de cor: `fill-amber-500 text-amber-500`
- Manter condição `review_count > 0` para mostrar

### Ficheiros editados
1. `src/components/funerarias/PublicFunerariaCard.tsx`
2. `src/pages/Home.tsx`

