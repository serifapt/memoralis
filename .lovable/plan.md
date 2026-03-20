

## Plano: Suportar múltiplas datas/localizações no Velório

### Contexto
A base de dados já suporta múltiplos eventos por obituário (tabela `ceremony_events`). A limitação é apenas no editor, que usa campos fixos (`velorioDate`, `velorioTime`, etc.) em vez de um array.

### Alterações em `src/pages/NewObituary.tsx`

1. **Substituir campos flat por array de velórios**:
   - Remover `velorioDate`, `velorioTime`, `velorioLocation`, `velorioMapLink` do `formData`
   - Criar novo state: `const [velorioEntries, setVelorioEntries] = useState([{ date: "", time: "", location: "", mapLink: "" }])`
   - Funções `addVelorioEntry()` e `removeVelorioEntry(index)`

2. **UI do Velório — múltiplas linhas**:
   - Cada entrada renderiza a mesma row de 4 campos (Data, Hora, Nome do Local, Link do mapa)
   - Botão `+` (ícone `Plus`) à direita da última linha para adicionar nova entrada
   - Botão `X` (ícone `Trash`/`X`) em cada linha extra para remover (mínimo 1 entrada)

3. **Carregar dados existentes** (edição):
   - No fetch de `ceremony_events`, filtrar todos os eventos `velorio` e popular o array `velorioEntries` em vez de campos flat

4. **Guardar dados**:
   - No save, inserir um registo `ceremony_events` por cada entrada no array `velorioEntries`

5. **Marcar alterações não guardadas**:
   - Incluir `velorioEntries` na detecção de alterações

### Frontend (ObituaryDetail.tsx)
Já renderiza todos os eventos da tabela `ceremony_events` dinamicamente — nenhuma alteração necessária.

### Detalhes técnicos
- Tipo da entrada: `{ date: string; time: string; location: string; mapLink: string }`
- Botão `+`: `<Button variant="ghost" size="icon">` com ícone `Plus`
- Botão remover: ícone `X`, visível apenas quando há mais de 1 entrada
- Layout: cada linha usa o mesmo `grid md:grid-cols-4 gap-4 pl-8` actual, com o botão de acção alinhado à direita

