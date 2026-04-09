

## Página dedicada de Flores em vez de caixa de diálogo

### Resumo
Substituir o modal `SendFlowersModal` por uma página dedicada `/obituario/:id/flores` que mostra informações resumidas do obituário no topo e o catálogo de flores por baixo. Ao clicar num produto, abre-se um painel/secção com detalhes completos e formulário de encomenda.

### Alterações

**1. Nova página `src/pages/ObituaryFlowers.tsx`**
- Rota pública `/obituario/:id/flores`
- Busca dados do obituário (nome, foto, datas, localidade) e da funerária (nome, logo, serviço de flores)
- Verifica se o serviço está ativo e dentro do prazo (`isFlowerOrderOpen`) — se não, redireciona para `/obituario/:id`
- Layout:
  - Header público (PublicHeader) + breadcrumb (Início > Obituário > Nome > Flores)
  - Secção resumo do obituário (foto, nome, datas, localidade — versão compacta)
  - Grelha de produtos (reutiliza `FlowerProductCard`)
  - Ao clicar num produto, mostra secção expandida com: imagem grande, nome, descrição completa, preço, selector de quantidade, mensagem de condolências, dados do remetente e botão "Confirmar Pedido"
  - Confirmação inline (sem modal) com feedback de sucesso

**2. Rota no `src/App.tsx`**
- Adicionar `<Route path="/obituario/:id/flores" element={<ObituaryFlowers />} />`

**3. Atualizar `src/pages/ObituaryDetail.tsx`**
- Substituir `onClick={() => setIsFlowersModalOpen(true)}` por navegação: `<Link to={`/obituario/${id}/flores`}>`
- Remover import e uso do `SendFlowersModal`
- Remover state `isFlowersModalOpen`

**4. Atualizar `src/components/obituaries/PublicObituaryCard.tsx`**
- Substituir o botão "Enviar Flores" que abre modal por um `<Link>` para `/obituario/${id}/flores`

**5. Componente `FlowerProductCard`**
- Manter como está para a grelha do catálogo

**6. Reutilizar lógica do `SendFlowersModal`**
- A lógica de cálculo (subtotal, comissão, total), formulário de dados do remetente e submissão à BD será movida para a nova página
- O modal `SendFlowersModal` pode ser mantido no código mas deixará de ser usado (ou removido)

### Fluxo do utilizador
1. Na página do obituário, clica "Enviar Flores" → navega para `/obituario/:id/flores`
2. Vê resumo do obituário + grelha de produtos
3. Clica num produto → expande detalhes (descrição completa, preço, imagem)
4. Preenche quantidade, dados pessoais e mensagem
5. Confirma pedido → feedback de sucesso com botão para voltar ao obituário

