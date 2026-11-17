# Arquitetura do mockup (HTML, CSS e JavaScript puros)

O objetivo é um código **simples de ler e fácil de converter**: o time de dev leva estes arquivos para o Storybook e
depois escreve os componentes em Angular e as páginas em ASP.NET. Por isso não há framework, build nem biblioteca:
só módulos ES, CSS com variáveis e marcação explícita.

## Componente = função + CSS

```js
// js/components/button.js
export function button({ label, variant = 'primary', iconEnd, action }) {
  return `<button type="button" class="c-button c-button--${variant}" data-action="${action}">…</button>`;
}
```

- A função recebe dados e devolve uma string de HTML. Todo texto vindo de dado passa por `esc()` (`js/core/dom.js`).
- O estilo fica em `css/components/<nome>.css`, em BEM com prefixo `c-` (`c-lib-card`, `c-lib-card__title`, `c-lib-card--compact`).
- Variações são classes de modificador (`--primary`), nunca estilos soltos. Estados do navegador usam `:hover`, `:active`, `:disabled`.
- Ícones: `icon('award', 16)` (Feather, em `js/core/icons.js`) ou `lpIcon('crown', 16)` (LP-Icons, os próprios da Ludos Pro, em
  `js/core/lp-icons.js`). Os dois vêm do Figma, têm traço de 1px e herdam a cor do texto. Use o LP-Icon quando o Feather não tiver
  o ícone. Os SVGs ficam em `assets/icons/feather` e `assets/icons/lp`; depois de exportar de novo do Figma, rode
  `npm run icones` (Feather) ou `npm run icones-lp` (LP-Icons).

| Aqui | No Angular depois |
|---|---|
| função `button({...})` | componente `app-button` com `input()`s |
| classe `c-button--primary` | `variant="primary"` |
| `data-action="x"` | `(click)="x()"` |
| arquivo `button.css` | `button.component.scss` |

## Tela = estado + visão + ações

```js
// js/screens/library.js
createView(root, {
  state: { tab: 'todos', favs: [2, 5] },
  view: (state, ctx) => `…HTML da tela inteira…`,
  actions: { setTab: (ctx, el) => ctx.set({ tab: el.dataset.id }) },
  onMount, onRender, breakpoints: [768, 1179, 1180],
});
```

- `ctx.set(patch)` atualiza o estado e **refaz o HTML da tela**, restaurando foco (`data-key`) e rolagem (`data-scroll-key`).
- Eventos entram por delegação na raiz: `data-action` (clique), `data-input` (digitação), `data-change` (mudança).
- Cruzar um corte de largura (`breakpoints`) também refaz a tela: as trocas estruturais (tabela x cards, drawer x sheet) usam `minWidth(px)` de `js/core/media.js`; ajustes de estilo ficam no CSS com `@media`.
- `state.fresh` vale só para a renderização em que foi ligado: serve para animar a **entrada** de um painel sem repetir a cada re-render.
- Popovers e Esc: `closeOnOutside` e `onEscape` (em `view.js`) se desfazem junto com a tela.
- No Angular: estado vira signals, a visão vira o template e as ações viram os handlers.

## Casca e navegação

`js/app.js` monta a casca (app bar, menu lateral a partir de 1180, navigation bar abaixo) e a tela da área, escolhida pelo
**hash** (`app.html#biblioteca`). A troca entre menu lateral e navigation bar é só CSS. A sequência de montagem do handoff
(`js/shell/boot.js`) liga grupos em `data-on` e o CSS faz as transições (`[data-reveal]`).

## Breakpoints do handoff

| Corte | O que muda |
|---|---|
| 768 | tablet: app bar de 64, 3 colunas de cards |
| 1000 | 4 colunas de cards compactos |
| 1024 | Gestores: tabela no lugar dos cards |
| 1179/1180 | detalhe em drawer (1179); menu lateral, cards grandes e filtros em pílulas (1180) |
| 1366, 1440, 2560 | larguras do menu lateral (296, 330) e miolo (tudo menos o menu) de no máximo 1366; acima disso a sobra vai para as laterais |

Atenção: o produto (Angular) hoje tem três faixas (menor que 768, de 768 a 1279 e 1280 ou mais); alinhar com o UX antes de converter.

## Tweaks (variações para revisão)

O painel "Tweaks" (`js/shell/tweaks.js`) mostra as variações da tela aberta, listadas em `js/data/tweaks.js`, e grava a escolha
como parâmetro do hash (`#tabuleiro?estado=concluido`; o valor padrão não aparece no endereço). Para criar um tweak:

1. Acrescente em `js/data/tweaks.js`, na chave da tela: `{ id, label, type: 'choice' | 'select' | 'switch', options, default }`.
2. Faça a tela ler o parâmetro (`new URLSearchParams(location.hash.split('?')[1])`) e reagir ao `hashchange` com `ctx.listen`,
   porque trocar só o parâmetro não remonta a tela.

É ferramenta de revisão, não do produto: no Angular os tweaks viram estados das stories do Storybook.

## Como portar uma tela do app antigo

1. Ler o `.tsx` da tela em `_legado/react-tailwind/src/shell/` e listar os componentes que ela usa.
2. Criar o que faltar em `js/components` + `css/components` (traduzindo as classes do Tailwind para CSS com os tokens).
3. Escrever `js/screens/<tela>.js` (dados em `js/data/<tela>.js`) e `css/screens/<tela>.css`; registrar a tela em `js/app.js` (`screens`) e o CSS em `css/app.css`.
4. Conferir em `app.html#<tela>` nos tamanhos 360, 768, 1180 e 1440, e marcar em [MIGRACAO.md](MIGRACAO.md).

## Catálogo do design system

`index.html` carrega `js/catalog/catalog.js`: menu lateral + uma página por item (`js/catalog/pages/*.js`), com a página no hash
(`#cores`, `#buttons`, `#produto-telas?area=cursos`). Cada página é uma função que devolve HTML; as interativas (chips, paginação,
busca de ícones, filtros de área, seletor de tema) usam as mesmas ações do `createView`. Os estados hover, pressed e disabled das
matrizes de componentes são forçados por `data-state` (o CSS dos componentes trata `:hover` e `[data-state="hover"]` juntos).
Para uma página nova: criar a função em `js/catalog/pages/`, registrar o item em `groups` (`catalog.js`) e, se houver ação, espalhar em `actions`.
