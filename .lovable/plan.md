

## Centrar verticalmente a localidade e funerária no card

### Problema
A localidade e nome da funerária estão coladas logo abaixo das datas. Quando o `flex-1` expande o bloco de info para igualar alturas entre cards, o espaço extra fica todo em baixo. O pedido é centrar verticalmente esse conteúdo dentro do espaço disponível.

### Solução em `src/components/obituaries/PublicObituaryCard.tsx`

Dividir o bloco `flex-1` (linha 61–84) em duas partes:
1. **Parte superior fixa**: nome + datas (sem flex)
2. **Parte inferior com centração vertical**: localidade + funerária dentro de um `flex-1 flex flex-col justify-center`

Estrutura:

```
<div className="flex-1 flex flex-col">
  {/* Nome + datas — ficam no topo */}
  <h3>...</h3>
  <p>datas</p>
  
  {/* Localidade + funerária — centrados verticalmente no espaço restante */}
  <div className="flex-1 flex flex-col justify-center">
    {locationStr && <div>...</div>}
    {funerarias && <Link>...</Link>}
  </div>
</div>
```

Remover `justify-center` horizontal que foi adicionado anteriormente (manter alinhamento à esquerda como originalmente, ou manter centrado — sem alterar o eixo horizontal).

### Ficheiro editado
1. `src/components/obituaries/PublicObituaryCard.tsx`

