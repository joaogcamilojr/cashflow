# Shell autenticado

## Arquitetura

`AppShell` mantém a estrutura única: `AppSidebar` ou `MobileSidebar`, `AppHeader` e conteúdo autenticado. O `ToastProvider` fica no shell, portanto sobrevive à navegação cliente.

Rotas reais da navegação: `/dashboard`, `/accounts` e `/accounts/new`. A configuração está em `lib/navigation/navigation.ts`.

## Sidebar

Desktop: branca, 256px expandida e 76px recolhida. A preferência visual usa `cash-flow-sidebar-collapsed` em `localStorage`, somente após montagem no cliente. O primeiro render é expandido para evitar hydration mismatch.

Mobile: drawer com overlay, Escape, botão de fechar, fechamento ao navegar e bloqueio de rolagem do body. O foco vai para fechar ao abrir.

## Visual

Tokens do app ficam no bloco `/* App shell */` de `app/globals.css`: fundo `#F6FAFF`, superfícies brancas, azul `#4E73DF`, texto `#212529`, borda `#DCE5F1` e estados semânticos.

Ícones são SVG React locais, usam `currentColor` e recebem nome acessível do controle pai.

## Componentes

- `PageContainer`: tamanhos `default`, `wide`, `form`.
- `PageHeader`: eyebrow, título, descrição, ações e voltar.
- `Breadcrumbs`: somente rotas conhecidas; último item não é link.
- `LoadingState`/skeletons: estrutura sem valores financeiros falsos.
- `EmptyState` e `ErrorState`: estados reutilizáveis e seguros.
- `ToastProvider`: quatro variantes, máximo de três, fechamento manual e auto-dismiss de cinco segundos; erros permanecem.
- `ConfirmDialog`: confirmação destrutiva, Escape e foco inicial no cancelamento.

## Perfil e logout

O shell recebe `displayName` e `email` da sessão. Avatar usa iniciais locais. O menu só oferece sair; não há edição de perfil. Logout chama `/api/v1/auth/logout`, bloqueia repetição e exibe erro genérico.

## Acessibilidade

Há skip link, `main#main-content`, navegação semântica, `aria-current`, labels de controles, live regions para toast, diálogo modal, foco visível e suporte a `prefers-reduced-motion`.

## Extensão futura

Para adicionar navegação, primeiro crie rota real e depois inclua item em `navigationGroups`. Não adicionar links especulativos ou módulos sem página.

## Validação manual

1. Abrir dashboard, contas e nova conta.
2. Recolher sidebar; recarregar e confirmar persistência.
3. Em viewport mobile, abrir drawer, pressionar Escape e testar overlay.
4. Testar navegação por teclado e skip link.
5. Arquivar/excluir conta e verificar confirmação/toast.
6. Compartilhar conta e verificar toast.
7. Testar erro de rede e botão de retry.
