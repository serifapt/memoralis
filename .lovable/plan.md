

## Botões de ação full-width no mobile

### Alteração
No ficheiro `src/pages/ObituaryDetail.tsx`, linha 446, alterar o container dos 3 botões (Condolências, Acender Vela, Enviar Flores) para que no mobile cada botão ocupe 100% da largura do card.

### Mudança concreta
- Alterar `<div className="flex flex-wrap gap-3">` (linha 446) para `<div className="flex flex-col sm:flex-row flex-wrap gap-3">`
- Adicionar `w-full sm:w-auto` a cada um dos 3 botões (linhas 447, 448, 452)

Isto faz com que em mobile os botões empilhem verticalmente e ocupem toda a largura, enquanto em desktop mantêm o layout horizontal atual.

### Ficheiro a alterar
- `src/pages/ObituaryDetail.tsx` — linhas 446-455

