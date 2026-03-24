

## Plano: Merge dos tabs "Empresa" e "Página Pública"

### Problema
Os campos Morada, Telefone, Email, Localidade e Código Postal existem tanto no tab "Empresa" como no "Página Pública", criando duplicação.

### Alterações

#### 1. Settings.tsx — Remover tab "Página Pública" e reorganizar tab "Empresa"

- Remover o `TabsTrigger` e `TabsContent` de "Página Pública" (e o tab "Marca" também, integrando o logótipo no "Empresa")
- Mudar `grid-cols-6` para `grid-cols-4` (Empresa, Serviços, Utilizadores, Notificações)
- No tab "Empresa", após o card de "Informações da Empresa", adicionar:
  - Card do **Logótipo** (movido do tab Marca)
  - Secção da **Página Pública** — renderizar `<PublicPageTab>` inline

#### 2. PublicPageTab — Remover campos duplicados

- Remover os campos **Localidade** e **Código Postal** do card "Contactos Adicionais" (já existem no formulário principal da empresa)
- Manter os campos exclusivos: visibilidade, slug, imagem de capa, descrição, serviços, telefone secundário, website, redes sociais, horário

#### 3. Settings.tsx — Unificar dados da empresa

- Expandir `companyData` e a query `loadCompanyData` para incluir também `localidade` e `codigo_postal`
- Adicionar esses dois campos ao formulário da empresa (após Morada, numa grid 2 colunas)
- Incluí-los no `handleSaveCompany`

### Resultado
- Tab "Empresa" passa a conter: dados da empresa (incluindo localidade/código postal), logótipo, e toda a configuração da página pública
- Tabs "Marca" e "Página Pública" são eliminados
- Zero duplicação de campos

