

## Adicionar autocomplete aos inputs do Hero

### Objetivo
Ao digitar nos campos "Nome", "Localização" e "Funerária" da secção hero, mostrar resultados sugeridos do banco de dados em tempo real, permitindo clicar num resultado para navegar diretamente.

### Alterações

**1. Novo componente: `src/components/search/HeroSearchInput.tsx`**
- Input com dropdown de sugestões (popover posicionado abaixo do input)
- Debounce de 300ms na pesquisa para não sobrecarregar
- Mostra até 5 resultados; ao clicar num resultado, navega para a página correspondente
- Estado de loading enquanto pesquisa

**2. Ficheiro: `src/pages/Home.tsx`**
- Substituir os 3 `<Input>` estáticos pelo novo `HeroSearchInput`
- Cada input terá uma função de pesquisa diferente:
  - **Nome**: pesquisa na tabela `obituaries` por `display_name` (ilike), mostra nome + localidade, navega para o detalhe do obituário
  - **Localização**: pesquisa na tabela `obituaries` por `locality` ou `freguesia` (ilike), mostra valores únicos, filtra obituários por localização na página de arquivo
  - **Funerária**: pesquisa na tabela `funerarias` por `nome_comercial` (ilike), mostra nome + localidade, navega para a página da funerária
- O botão "Pesquisar" navegará para `/obituarios` com os filtros como query params

### Lógica de pesquisa (queries Supabase)

```typescript
// Nome — pesquisa obituários públicos
supabase.from("obituaries")
  .select("id, display_name, locality, funeraria_id, funerarias(slug)")
  .eq("is_public", true)
  .ilike("display_name", `%${query}%`)
  .limit(5)

// Localização — valores únicos de localidade
supabase.from("obituaries")
  .select("locality")
  .eq("is_public", true)
  .ilike("locality", `%${query}%`)
  .limit(5)

// Funerária — pesquisa funerárias públicas
supabase.from("funerarias")
  .select("id, nome_comercial, localidade, slug")
  .eq("pagina_publica_visivel", true)
  .ilike("nome_comercial", `%${query}%`)
  .limit(5)
```

### UX do dropdown
- Aparece ao digitar (mínimo 2 caracteres)
- Lista com ícone + texto, hover highlight
- Fecha ao clicar fora ou ao selecionar
- Se não houver resultados: "Nenhum resultado encontrado"

### Secção técnica
- Componente usa `useState` + `useEffect` com debounce
- Dropdown posicionado com CSS absolute (sem dependência de Popover/Command)
- Navegação via `useNavigate` do React Router

