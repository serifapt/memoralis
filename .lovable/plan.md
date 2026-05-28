## Adicionar 2 cards de features na aba "Agências Funerárias"

Atualmente a grelha tem 7 cards (3+3+1), deixando 2 espaços vazios na última linha. Adicionar mais 2 cards completa o 3x3.

### Cards propostos

**1. Gestão de clientes e familiares** (icon: `Users`)
- Título: "Base de dados de clientes"
- Descrição: "Histórico completo de familiares e contactos, com pesquisa rápida e reutilização em novos processos."

**2. Testemunhos e reputação online** (icon: `Star`)
- Título: "Testemunhos públicos"
- Descrição: "Recolha avaliações de famílias e reforce a sua reputação na página pública da funerária."

(Alternativas caso prefira outras: Página pública personalizada `Globe`, Notificações em tempo real `Bell`, Equipa multi-utilizador `UserCog`, Condolências moderadas `MessageCircle`.)

### Alteração

- `src/pages/Sobre.tsx`: adicionar 2 entradas no array de features da aba "profissional", importar os ícones `Users` e `Star` do lucide-react (se ainda não estiverem). Mantém o mesmo estilo de card existente.

### Fora do âmbito

- Layout, espaçamentos e estilo dos cards permanecem iguais.
