# Ludos Pro: mockup navegável

Mockup navegável da plataforma Ludos Pro, feito a partir do Figma `LP-DesignSystem 4.0` e do handoff.
**Só HTML, CSS e JavaScript puros: sem framework, sem Tailwind, sem build e sem dependências.** Esta fase é para validar
telas, comportamento e medidas; depois o time de dev leva o código para o Storybook e transforma em Angular e ASP.NET.

## Como abrir

Os módulos ES não carregam por `file://`; abra por um servidor estático. O mais simples (precisa só do Node):

```bash
node serve.mjs          # http://localhost:5173   (ou: npm start)
```

Serve qualquer servidor estático (Live Server do VS Code, `python -m http.server`, `npx serve`).

- `app.html#biblioteca`: o mockup navegável (casca do produto + a tela da área). Troque o hash para ir a outra área.
- `index.html`: o catálogo do design system (cores, tipografia, componentes, ícones, tema, mapa de produto e telas por área), com menu lateral.
- Parâmetros: `?motion=on` (força a sequência de montagem mesmo com "reduzir movimento" ligado) e `?slow=5` (câmera lenta).
- **Tweaks:** nas telas com variações (Curso, Tabuleiro, Atividades, Regulamentos) aparece o botão "Tweaks" no canto inferior
  direito. Ele troca o estado e as variações de layout da tela (ex.: curso concluído, Versão B da trilha, fundo escuro,
  menu de atividades em cards) e grava a escolha no endereço
  (`#curso?estado=concluido`), então o link compartilhado já abre a variação. Lista em `js/data/tweaks.js`.

## Estrutura

```
index.html               catálogo do design system (js/catalog)
app.html                 mockup navegável (casca do produto + telas)
css/                     tokens.css (variáveis), base.css, shell.css, components/*.css, screens/*.css, app.css (importa tudo)
js/core/                 view.js (mini runtime das telas), dom.js, media.js, icons.js (Feather, gerado), lp-icons.js (LP-Icons, gerado)
js/components/           button, badges, avatar, panel (sheet e drawer), filters, pagination: funções que devolvem HTML
js/shell/                casca: app bar, menu lateral, navigation bar, abas, montagem inicial
js/screens/              uma tela por arquivo (library.js, ...)
js/data/                 dados de exemplo
assets/                  logotipo, fontes, capturas do handoff e icons/feather e icons/lp (SVGs dos ícones, exportados do Figma)
design-system/           tokens e documentos do Figma (HANDOFF.md, FIGMA-MAP.md, COR-PRIMARIA.md)
docs/                    ARQUITETURA.md (como escrever componentes e telas) e MIGRACAO.md (o que já foi portado)
tools/                   gerar-icones.mjs (Feather) e gerar-icones-lp.mjs (LP-Icons)
```

## Convenções

- Um componente é uma **função que devolve HTML** (`js/components/x.js`) e **um CSS** (`css/components/x.css`), classes em BEM com prefixo `c-`.
- Uma tela é um **estado + uma função de visão + ações** (`createView`, em `js/core/view.js`). Detalhes em [docs/ARQUITETURA.md](docs/ARQUITETURA.md).
- Cores e medidas vêm dos **tokens semânticos** (`var(--color-text-primary)`, `var(--color-surface-system-default)`), nunca das rampas, dentro de componentes.
- `bg-white` do Figma é `#f8f8f8` (`--color-background-default`), não branco puro.

## Estado

A casca e todas as telas do menu já estão em JS puro: Cursos, Biblioteca, Gestores, Missões, Rankings, Conquistas, Certificados, Loja, Feed,
Eventos, FAQ e Extrato, mais o passo a passo do PWA (`#instalar-pwa`). Só a **Home** segue com a captura do handoff, porque ainda não tem tela
no Figma. O que falta e os pontos a decidir com o time estão em [docs/MIGRACAO.md](docs/MIGRACAO.md).

O app antigo (React + Tailwind + Vite) e a proposta em Angular ficaram em `_legado/`, **fora do git** (ver `.gitignore`), só
como referência até a migração terminar. Quem quiser rodar o app antigo: `cd _legado/react-tailwind && npm install && npm run dev`.
