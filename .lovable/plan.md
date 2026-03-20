

## Plano: Uniformizar alinhamento label-campo e espaçamento

### Problema
Os campos do formulário não têm espaçamento consistente entre label e input. Todos os campos usam `<div>` sem classe de espaçamento interno, ficando o label colado ao input. Além disso, no card "Mensagem Pública" e "Observações" o label está dentro de um `<div className="mb-2">` extra, criando inconsistência.

### Alterações em `src/pages/NewObituary.tsx`

1. **Adicionar `space-y-2` a todos os wrappers de campo** (cada `<div>` que contém um `Label` + `Input`/`Select`/`Textarea`), para garantir 8px consistentes entre label e campo. Isto aplica-se a todos os tabs:
   - Tab "Informações Pessoais": ~20 campos
   - Tab "Informações Fúnebres": campos dentro dos switches (velório, funeral, cremação, missas) + observações
   - Tab "Família/Responsável": ~12 campos
   - Tab "Informação do Serviço": ~6 campos

2. **Remover `<div className="mb-2">` inconsistentes** nos campos "Mensagem Pública" (linha 1028) e "Observações" do tab fúnebres (linha 1512), substituindo pelo mesmo padrão `space-y-2`.

3. **Uniformizar `gap-4` nos grids** -- já está maioritariamente consistente, apenas confirmar que todos os `grid` usam `gap-4` horizontalmente.

### Resultado
Todos os campos terão exactamente o mesmo espaço (8px) entre label e input/select/textarea, alinhados de forma uniforme em todo o formulário.

