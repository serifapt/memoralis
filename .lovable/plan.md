

## Botão "Voltar ao Obituário" no mobile

### Alteração

**`src/pages/ObituaryDetail.tsx`**

Adicionar um botão visível apenas no mobile (`lg:hidden`) entre a secção de condolências (que termina na linha ~592) e a sidebar da funerária (linha ~596). No layout atual, em desktop é uma grid de 2 colunas (`lg:grid-cols-[1fr_350px]`), mas no mobile a sidebar aparece por baixo do conteúdo principal. O botão será inserido dentro da coluna principal, após o card de condolências e antes do fecho da `div.space-y-8`.

```tsx
{/* Botão voltar ao arquivo - mobile only */}
<div className="lg:hidden">
  <Button variant="outline" className="w-full" asChild>
    <Link to="/obituario">
      <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
      Voltar ao Obituário
    </Link>
  </Button>
</div>
```

Inserido na linha ~593 (após o fecho do card de condolências `</Card>` e do `)}`, antes do `</div>` que fecha a coluna principal).

