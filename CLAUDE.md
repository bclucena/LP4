# Ludos Pro: design system e mockup navegável

Este projeto é a fonte de verdade para **novos layouts** do Ludos Pro. Toda tela nova segue os tokens, componentes e regras
de layout daqui. Leia antes de criar: `README.md`, `docs/ARQUITETURA.md` (como escrever componentes e telas) e
`design-system/HANDOFF.md` (breakpoints, grids e comportamento).

## Stack (não mudar)

- HTML, CSS e JavaScript puros, módulos ES. **Sem framework, sem Tailwind, sem build e sem dependências.**
- Rodar: `node serve.mjs` (http://localhost:5173). `app.html#<area>` = mockup; `index.html` = catálogo do design system.
- O código vai depois para Storybook → Angular + ASP.NET, então priorize marcação explícita e fácil de converter.

## Fontes de verdade

| O quê | Onde |
|---|---|
| Tokens em uso | `css/tokens.css` (`design-system/tokens.css` é a extração bruta do Figma, com tipografia, spacing e radius completos) |
| Cor primária | gerador de tema (`js/core/theme.js`), regra em `design-system/COR-PRIMARIA.md`. Onde diverge do Figma, vale o gerador |
| Telas, breakpoints e comportamento | Figma "Ludos Pro 4.0 - handoff" (`bm9Ln7x6EXYVuxdzi2Ye3A`) e `design-system/HANDOFF.md` |
| Componentes e fundamentos | Figma "LP-DesignSystem 4.0" (`3NRrDyxpWYIJD52LwuoysG`), node ids em `design-system/FIGMA-MAP.md` |
| Referência visual | `assets/handoff/*.png` (capturas por área e largura) |

## Regras de estilo

- **Só tokens semânticos dentro de componentes e telas**: `--color-text-*`, `--color-background-*`, `--color-border-*`,
  `--color-icon-*`, `--color-surface-*`. Nunca as rampas (`--color-gray-500`, `--color-purple-600`) nem hex soltos.
- Primária: `--color-action` (botões e links), `--color-action-hover`/`--color-action-active`, `--color-on-action` (texto sobre ação),
  `--color-surface-system-*` (fundos de marca). Nunca fixe o roxo `#7b2fbe`: a cor muda por cliente.
- Texto na cor da marca usa `--color-text-brand` (ou `-strong`), nunca `--color-action` como `color`: no tema escuro ele vira um tom
  claro. Superfície que fica escura nos dois temas (selo sobre imagem, toast, scrim) usa `--color-surface-dark`. Tema escuro e alto
  contraste vêm de `data-theme`/`data-contrast` no `<html>` (`js/core/appearance.js`); confira tela nova nos dois temas.
- Sucesso, erro, aviso e info são fixos (`--color-*-success|error|warning|info`) e não derivam da primária.
- Fundo da página é `--color-background-default` = `#f8f8f8` ("branco" do Figma), não `#fff`.
- Fonte: Plus Jakarta Sans (`var(--font-sans)`), já carregada localmente.
- Tipografia (desktop): display-lg 48/48 700 · display-sm 30/40 700 · heading 20/32 700 · subtitle 16/24 700 · price 18/28 700 ·
  body 14/20 (400–800) · caption 12/16 (300–800). Mobile: caption/body 10/12, heading-area 12/16 700.
  Há divergências rótulo × render no Figma (ver FIGMA-MAP.md); na dúvida, confirme com design.
- Espaçamento em múltiplos de 4px. Padding de componentes de interação: 0 a 24px, igual em todos os breakpoints.
- Radius: 2, 4, 6, 8, 12, 16, 24, full. Sombras: `--shadow-2xs` a `--shadow-2xl`.
- Ícones: Feather via `icon('nome', tamanho)` de `js/core/icons.js`; quando o Feather não tiver, os LP-Icons (próprios da Ludos Pro)
  via `lpIcon('nome', tamanho)` de `js/core/lp-icons.js`. Os dois são exportados do Figma (SVGs em `assets/icons/feather` e
  `assets/icons/lp`), têm traço de 1px e herdam a cor do texto. Não edite os `.js` gerados: troque o SVG e rode o gerador.
- Foco visível: outline 2px `--color-surface-system-default` (já no `base.css`). Respeitar `prefers-reduced-motion`.

## Layout e responsividade

| Largura | Navegação | App bar | Menu lateral | Conteúdo |
|---|---|---|---|---|
| 360 | navigation bar | 44 | não | 360 |
| 768 | navigation bar | 64 | não | padding 24 |
| 1179 | navigation bar | 64 | não | padding 24 (detalhe em drawer) |
| 1180 | menu lateral | 64 | 240 | padding 16 |
| 1366 | menu lateral | 64 | 272 | padding 24 |
| 1440+ | menu lateral | 64 | 306 | padding 24 |

- **Miolo** (tudo menos o menu) cresce até no máximo **1366px**; acima disso a sobra vira margem lateral, não colunas.
- Grids de cards: **Layout A** (Cursos, Missões, Certificados, Eventos) mín. 343px, gap 16. **Layout B** (Biblioteca, Conquistas,
  Loja) entre 253,5 e 271,2px. **Layout C** = 1 coluna. Toda tela nova escolhe um desses.
- Mobile/tablet: filtros e detalhes em **bottom sheet**; desktop: filtros em pílulas, detalhe em **drawer** (`panel.js`).
- Trocas estruturais usam `minWidth(px)` (`js/core/media.js`) + `breakpoints` do `createView`; ajustes visuais ficam no CSS com `@media`.
- Conferir sempre em 360, 768, 1180 e 1440.

## Como criar uma tela ou componente

1. Reaproveitar antes de criar: `js/components/` (button, iconButton, chip, pillMenu, categoryMenu, avatar, panel, pagination,
   progress, filtros, cards mobile, mobile-sheets) e o catálogo (`index.html`).
2. Componente novo: função que devolve HTML em `js/components/<nome>.js` + `css/components/<nome>.css`, BEM com prefixo `c-`,
   variações por modificador (`c-x--primary`), texto de dados sempre por `esc()`.
3. Tela nova: `js/screens/<tela>.js` com `createView({ state, view, actions })`, dados em `js/data/<tela>.js`, estilo em
   `css/screens/<tela>.css`. Registrar em `screens`/`labels` de `js/app.js` e o CSS em `css/app.css`.
4. Estados obrigatórios: skeleton, vazio e (quando houver lista) paginação.
5. Atualizar `docs/MIGRACAO.md` / `design-system/HANDOFF.md` com o que foi feito.

## Pastas

- `_legado/` (app antigo React + Tailwind e proposta Angular) é só referência e está fora do git. Não editar.
- Textos da interface em português do Brasil.
