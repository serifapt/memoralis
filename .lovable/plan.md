

## Uniformizar altura dos cards de obituário

### Problema
Nomes longos ou localidades com texto extenso fazem com que os cards fiquem com alturas diferentes entre si na mesma linha.

### Solução
No `PublicObituaryCard`, usar `h-full` no Card e `flex flex-col` no CardContent para que o conteúdo se distribua verticalmente. Fixar a altura do bloco de texto (nome + datas + localidade + funerária) com `flex-1` para que ocupe o espaço disponível, empurrando os contadores e o botão para baixo de forma consistente.

Adicionalmente, separar visualmente a linha de datas/idade da linha de freguesia-localidade com um `mt-1.5` extra.

### Alterações em `src/components/obituaries/PublicObituaryCard.tsx`

1. **Card**: adicionar `h-full flex flex-col`
2. **CardContent**: trocar `space-y-3` por `flex flex-col flex-1 space-y-3`
3. **Bloco de info** (div que contém nome, datas, localidade, funerária): adicionar `flex-1` para que absorva a diferença de altura
4. **Localidade** (`MapPin` div): trocar `mb-1` por `mt-2` para criar separação visual clara da linha de datas

### Ficheiro editado
1. `src/components/obituaries/PublicObituaryCard.tsx`

