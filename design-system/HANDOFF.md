> **Nota (nov/2026):** o projeto passou a ser HTML, CSS e JavaScript puros (sem React, Tailwind, Vite nem build). Os arquivos citados
> abaixo como `src/shell/*.tsx` e `src/pages/*.tsx` agora estão em `_legado/react-tailwind/src` (fora do git); o código vivo está em
> `js/`, `css/` e `assets/`. Veja `README.md`, `docs/ARQUITETURA.md` e `docs/MIGRACAO.md`. As decisões de design abaixo continuam valendo.

# Figma de handoff: Ludos Pro 4.0

- Arquivo: https://www.figma.com/design/bm9Ln7x6EXYVuxdzi2Ye3A/Ludos-Pro-4.0---handoff
- fileKey: `bm9Ln7x6EXYVuxdzi2Ye3A`
- É a fonte para telas, breakpoints e comportamento. O arquivo "LP-DesignSystem 4.0" (`3NRrDyxpWYIJD52LwuoysG`) continua sendo a fonte dos componentes e tokens.

## Páginas

| Página | O que tem |
|---|---|
| Layout design | Layouts A, B e C, regra de grid de cards, side menu |
| [mobile] Menu do usuário | Menu do usuário (dropdown), cursos e rotas, filtros, side menu mobile |
| [mobile] Comportamento | Skeleton loader, scroll e swipe |
| A.Extrato, B.Gestores, 1.Cursos até 10.Perguntas frequentes e Regulamento | Uma página por área, com frames em 360, 768, 1179, 1180, 1366, 1440 e 2560 |
| Páginas "->X.Y [Interna]" | Vazias no momento da leitura (só separadores) |

## Breakpoints

| Frame | Navegação | Topbar | Menu lateral | Conteúdo |
|---|---|---|---|---|
| 360 x 800 | Navigation bar | 88 | não | 360 |
| 768 x 1024 | Navigation bar | 64 | não | 768, padding 24 |
| 1179 x 768 | Navigation bar | 64 | não | 1179, padding 24 |
| 1180 x 768 | Menu lateral | 64 | 240 | 876, padding 16 |
| 1366 x 768 | Menu lateral | 64 | 272 | 1022, padding 24 |
| 1440 x 900 | Menu lateral | 64 | 306 | 1062, padding 24 |
| 2560 x 1440 | Menu lateral | 64 | 306 | 1366 fixo, centralizado (regra do miolo) |

A navegação muda entre 1179 e 1180. Os tokens de breakpoint do `index.css` foram alinhados: md 768, lg 1180, xl 1366, 2xl 1440 e 3xl 2560.

## Telas grandes e ultrawide (2560 em diante)

Regra adotada (o handoff só define até 2560; o resto é a extensão natural dele):

- **Regra do miolo (atualizada):** o miolo é todo o conteúdo, exceto o menu. Ele cresce até no máximo **1366px**; passando disso, o conteúdo para de crescer e o espaçamento dos lados esquerdo e direito é que aumenta. Vale a partir do breakpoint xl (1366), em qualquer tela maior (1920, 2560, 3440, 5120): `max-w-[1366px]` + `mx-auto` no container, sem breakpoints novos. (Antes o limite era 1440 e só valia em 3xl.)
- **Mais largura vira margem, não colunas.** Os cards continuam em 3 por linha (conteúdo de 1062 ao lado do menu lateral de 306 em 1440).
- **Menu lateral na esquerda** e topbar na largura toda, com o conteúdo da topbar alinhado ao mesmo container.
- **Fundo contínuo** na área lateral, para o conteúdo parecer uma folha no centro da tela.
- **Imagens e capas** ficam no container; entregar em 2x (`srcset`) para telas 4K.
- **Exceção a discutir com o design:** telas de dados (dashboard de gestores) podem usar mais, de 1680 a 1920, porque tabelas e gráficos aproveitam o espaço. Telas de leitura continuam estreitas.

No visualizador da página inteira de Cursos, as variações 1920 (1920x1080), 2560 e 3440 (ambas x1440) usam a altura de um monitor real e são reduzidas para caber na janela.

## Grid de cards

- **Layout A** (Cursos, Missões, Certificados, Eventos): auto layout com wrap e 16 de espaço; largura mínima 343, sem máximo. Em 1062 de conteúdo cabem 3 por linha; em 1420, 4.
- **Layout B** (Biblioteca, Conquistas, Loja): mínima 253,5 e máxima 271,2. Em 1062 cabem 4; em 1420, 5.
- **Layout C** (1 coluna): o documento não lista as áreas.

## Comportamento mobile

Transcrito de uma captura; confirme os tempos no Figma.

- **Skeleton após login:** começa 200ms depois do carregamento, na ordem: skeleton some, app bar (100ms), search (100ms), menu e navigation bar (200ms), background (200ms), componentes da área (200ms). Nas outras páginas, o skeleton aparece só nos componentes da área.
- **Scroll:** app bar fica estática; search sobe por baixo dela; menu sobe e ocupa o lugar do search; navigation bar desce e fica fora da tela, e só volta no scroll no sentido contrário.
- **Swipe:** o menu da página e os componentes da tela aceitam swipe lateral; a navigation bar não.

## Implementado

Topbar, menu lateral, navigation bar, menu top mobile, menu header desktop com filtros e card de curso (desktop e compacto), em `src/shell`. A tela de Cursos de exemplo troca de layout em 1180.

Nota sobre o grid: o handoff define largura mínima de 343 para o Layout A. Com scrollbar clássica de 15px (Windows), o conteúdo de 1440 cai de 1062 para 1047 e 343 dá só 2 colunas. O exemplo usa mínimo de 336 para manter 3 por linha. Vale o time decidir entre reduzir o mínimo ou reservar o espaço da scrollbar.

## Comportamento do menu lateral (desktop)

O menu acompanha o scroll nos dois sentidos:

- **Ao descer:** sobe junto com a página até a base dele encostar na base da tela; depois fica parado, e o conteúdo da direita continua rolando.
- **Ao inverter para cima:** já no primeiro movimento ele começa a descer junto com a página, até o topo dele encostar na topbar; depois fica parado.
- **Menu que cabe na tela:** fica fixo logo abaixo da topbar.

Implementação: `StickySide` em `src/shell/Shell.tsx`. O wrapper é `position: sticky` abaixo da topbar, com a altura útil da tela (`100vh - 64px`). O conteúdo é deslocado por `t`, que soma o delta do scroll e fica limitado entre 0 e (altura do menu - altura útil). O deslocamento é aplicado por `transform` dentro de `requestAnimationFrame`.

Medido em 1440 x 700 com passos de 100 de scroll: a base do menu para em 700 a partir de scroll 500; ao voltar, o menu se move já no primeiro passo e o topo para em 64 a partir de scroll 900.

## Comportamento mobile implementado (tela de Cursos)

Código em `src/shell/Shell.tsx` e `src/shell/Courses.tsx`.

- **Skeleton no primeiro carregamento:** `useBoot` e `BOOT_STEPS`. Começa 200ms depois do carregamento: o skeleton some (200ms), depois entram app bar (100ms), search (100ms), menu e navigation bar (200ms), background (200ms) e os cards (200ms). Cada etapa espera a anterior terminar.
- **Navegação entre páginas:** o skeleton aparece só nos cards (900ms no exemplo). App bar, search, menu e navigation bar ficam fixos.
- **Scroll:** a app bar (44) é `sticky` no topo; a busca fica no fluxo e passa por baixo dela (z menor); o menu é `sticky` em `top: 44` e ocupa o lugar da busca. A navigation bar some quando a página rola para baixo mais de 6px e volta ao rolar para cima (`useHideOnScroll`). No tablet o menu fica em `top: 64`, abaixo da topbar.
- **Swipe:** a linha do menu (Filtro e abas) rola na horizontal com `scroll-snap`. Um swipe horizontal (mínimo de 60px e pelo menos 1,5x maior que o vertical) sobre os cards troca de aba. A aba ativa é trazida para o centro da linha. A navigation bar não responde a swipe.
- **Reduzir movimento:** com `prefers-reduced-motion`, a página abre já montada, sem a sequência.
- **Revisão:** `/#exemplo-cursos?motion=on&slow=5` força a animação e a mostra em câmera lenta (5x). Na página do catálogo há botões para isso.

Dúvidas para confirmar no Figma: o texto de scroll do handoff foi lido de uma captura, e o limite de 6px para esconder a navigation bar e o de 60px do swipe são escolhas minhas.

## Dropdowns dos filtros (Cursos, desktop)

Código em `src/shell/Filters.tsx`; ligados em `CoursesScreen`. Fonte: instâncias `dropdown-categoria`, `dropdown-subcategoria`, `dropdown_conteúdo`, `dropdown_progresso` e `dropdown_ordem` da página 1.Cursos.

- **Pills:** pill dividida (texto + chevron). O texto mostra a escolha atual; a pill fica em system-light quando o filtro não é o padrão. Cada pill abre um popover de 248 de largura (radius 2xl). Fecha com Esc, clique fora ou ao escolher (nos de lista simples).
- **Categoria e subcategoria são o mesmo dropdown.** Ao escolher uma categoria com subcategorias (Marketing, Vendas, Liderança), o painel desliza para a esquerda (200ms, translate de 248) e mostra as subcategorias, com seta de voltar e o nome da categoria no topo. A altura do popover acompanha o painel visível. Categorias sem subcategoria (Dados, Produto etc.) selecionam e fecham.
- **Subcategorias:** checkboxes. "Todas as subcategorias" é o padrão. O primeiro clique em uma subcategoria escolhe só ela; marcar todas volta para "Todas"; desmarcar a última também.
- **Pill de categoria:** "Todas as categorias", "Marketing" ou "Marketing: Performance, Branding".
- **Busca:** o campo "Buscar categoria..." filtra a lista de categorias; a lista rola com scrollbar de 4px.
- **Conteúdo** (Todos os conteúdos, Cursos, Rotas de aprendizagem), **progresso** (Todos, Não iniciados, Em andamento, Concluídos) e **ordem** (Mais recentes, Mais antigos, Maior progresso, Menor progresso, Título A-Z, Título Z-A, Mais populares): lista de radios.
- **Limpar** restaura os quatro filtros; fica desabilitado quando já estão no padrão. Sem resultado, aparece um aviso com "Limpar filtros".

Pontos para confirmar com o design:

1. No Figma, "Todas as categorias" tem chevron, mas não há painel de subcategorias para ela. Mantive o chevron e o clique seleciona tudo e fecha.
2. O Figma escreve "Contúdo"; usei "Conteúdo".
3. Só as subcategorias de Marketing vêm do Figma. As de Vendas e Liderança são exemplos.
4. O estado selecionado do radio e do checkbox não aparece no Figma; usei o mesmo estilo dos itens de dropdown mobile (borda e miolo em system-strong).
5. No mobile e no tablet, o botão Filtro abre o bottom sheet "filtros mobile" (seção abaixo).

## Bottom sheet "filtros mobile" (Cursos, mobile e tablet)

Código em `src/shell/FilterSheet.tsx`; aberto pelo botão Filtro do menu de Cursos (abaixo de 1180). Usa o mesmo tipo `Filters` dos dropdowns do desktop, então os dois são intercambiáveis.

- **Estrutura:** alça, quatro grupos de chips (Categoria, Tipo de conteúdo, Progresso, Ordenar por) separados por divisores, e rodapé com "N resultados encontrados", "Limpar filtro" e "Aplicar". 494 de altura máxima (limitada a 92% da tela), largura total no mobile; no tablet, centralizada com no máximo 640 de largura (padrão Material/iPad para telas médias), com respiro nas laterais.
- **Rascunho:** as escolhas ficam em um rascunho. Só "Aplicar" grava nos filtros da tela e fecha. Fechar por scrim, Esc ou arrastando a alça para baixo (60px) descarta o rascunho. "Limpar filtro" zera só o rascunho.
- **Contagem ao vivo:** o número do rodapé usa os mesmos filtros e a aba atual da tela, e muda a cada chip.
- **Categoria com subníveis:** ao escolher Marketing, Vendas ou Liderança, um painel (system-light) abre logo abaixo da linha de chips daquela categoria, com uma seta apontando para o chip. As subcategorias são chips com check. O chip da categoria mostra um badge com quantas subcategorias estão marcadas e um caret.
- **Botão Filtro:** mostra um contador com quantos grupos fogem do padrão (categoria, conteúdo, progresso, ordem).

Pontos para confirmar com o design:

1. O Figma mostra o sheet com 360 de largura; no tablet usei largura máxima de 640 centralizada (o respiro exato do Figma não foi medido).
2. O estado selecionado do chip (borda e fundo system-subtle, texto semibold) não aparece no Figma para todos os grupos; usei o mesmo para todos.
3. O Figma não mostra a animação de entrada; usei slide-up de 200ms com scrim de 40%.
4. O badge do botão Filtro conta grupos alterados, não itens marcados.

## Ainda sem implementação no catálogo

Modal, scrim, estado vazio da página (o aviso de filtros sem resultado é simples), navdrawer e gráficos do perfil do gestor. O skeleton só existe na tela de Cursos.

## Estado das telas (em construção, em revisão, pronto para desenvolvimento)

O estado se muda no próprio catálogo, em **Telas por área**: ao lado do título da área há um seletor com os três estados. "Pronto para desenvolvimento" é a liberação para o time de dev.

- A escolha fica salva no navegador (localStorage, chave `lp-area-status`) e vale só para ele. O ponto de partida está em `src/pages/productData.ts` (campos `status`, `updated` e `built`); para a escolha virar padrão do time, copie o valor para esse arquivo.
- Aparece no Mapa de produto (etiqueta por área e resumo por grupo), em Telas por área (filtros, resumo geral, etiqueta com data e aviso nas telas em construção) e na página inteira de Cursos.
- O estado vale para o **design**; "Implementada no catálogo" indica separadamente que existe uma tela em código.
- Hoje: Cursos em revisão; as demais em construção.

## Mockup navegável (Tela de Cursos)

A casca (topbar, menu lateral, navigation bar) navega entre todas as áreas. A página atual fica no endereço (`#exemplo-cursos?p=biblioteca`), então dá para compartilhar o link de qualquer tela.

- **Cursos** é a tela real, com filtros, abas, skeleton e bottom sheet.
- **Demais áreas** (Biblioteca, Missões, Rankings, Conquistas, Certificados, Loja, Feed, Eventos, Perguntas frequentes, Meu time e Extrato) mostram a captura do handoff recortada na área de conteúdo, com a etiqueta de estado e o link para o Figma. Abaixo de 768 usa a captura de 360; a partir de 768, a de 1440. O recorte é aproximado (`crop` em `src/shell/Pages.tsx`).
- **Home** ainda não tem tela no Figma (a página está vazia), então mostra um aviso.
- **Mais** (navigation bar) abre uma folha com os itens que não cabem na barra. "Ver extrato" abre Extrato; o logo volta à Home.
- Para trocar uma captura por uma tela em código, crie o componente e renderize-o em `CoursesDemo` no lugar de `HandoffPage`.

**Telas por área usa o mockup ao vivo.** Os dois quadros principais de cada área (desktop 1440 e mobile 360) são iframes do mockup navegável, reduzidos para caber e interativos, com os links "Abrir mockup" (página inteira) e Figma. As telas ainda sem código aparecem como captura dentro da casca real; as demais capturas (outros breakpoints e estados) continuam como imagem.

## Biblioteca em código (Layout B)

`src/shell/Library.tsx`, aberta em `#exemplo-cursos?p=biblioteca` (menu Biblioteca ou navigation bar).
- Abas Todos/Favoritos (contagem acompanha os filtros; o marcador do card favorita), filtros desktop (categoria, material, seção atual, ordem, Limpar) e, no mobile/tablet, botão **Filtro** com bottom sheet próprio (material, seção, ordenar; sem modo tela cheia).
- Seções: painel de chips com contagem e "Ver mais" no desktop; linha de chips rolável no mobile. Clicar numa seção abre o subnível (breadcrumb "Seções > Aprendizado") e filtra; clicar no breadcrumb volta.
- Cards: `LibraryCard` (a partir de 1180) e `LibraryCardCompact` (abaixo). Dados de exemplo; as contagens das seções são as do Figma, então não batem com o número de cards filtrados.
- Em "Telas por área" a Biblioteca passa a mostrar esse mockup ao vivo; o link "Implementada no catálogo" abre `?p=biblioteca`.

## Missões em código (Layout A)

`src/shell/Missions.tsx`, em `#exemplo-cursos?p=missoes`. Abas Todos, Favoritos e por período (Único a Anual); filtros categoria, escopo, tipo (meta/evidência), status (novo, devolvido, aprovado, reprovado, em correção) e ordem. Card desktop com pills de status, progresso e recompensas; card compacto abaixo de 1180 (donut na meta, "n/100" na evidência). No mobile não há bottom sheet de filtro (o botão Filtro fica fora do menu top). Dados de exemplo; rodadas, devolutiva e envio de evidência ainda não existem.

## Ranking em código

`src/shell/Ranking.tsx`, em `#exemplo-cursos?p=ranking`. Carrossel de rankings (cards selecionáveis, setas no desktop), seletor de rodada, botão Regras (painel), contagem regressiva, pódio (1º a 3º) e lista a partir do 4º. Desktop: filtros de ranking, tipo e ordem; mobile/tablet: abas Todos/Ativos/Finalizados (sem bottom sheet de filtro). Dados de exemplo; o pódio usa iniciais no lugar das fotos e sem a moldura de louros do Figma. `MenuHeader` agora omite a linha de abas quando `tabs` está vazio.

## Conquistas em código (Layout B)

`src/shell/Achievements.tsx`, em `#exemplo-cursos?p=conquistas`. Abas Todos/Mérito/Épicas, filtros de progresso e ordem (desktop em pills, mobile/tablet no `GroupsSheet`). Clicar num card abre o detalhe: **drawer lateral de 400px no desktop (1180+)** e **bottom sheet** abaixo disso, com selo, descrição, progresso e recompensas; Esc, fundo e X fecham. O selo é um hexágono em CSS no lugar da imagem "Patented" do Figma, apagado enquanto a conquista não termina. A captura de 360 do Figma repete os cards da Biblioteca; usei os cards do desktop, em tamanho compacto.

## Certificados em código (Layout A)

`src/shell/Certificates.tsx`, em `#exemplo-cursos?p=certificados`. Abas Todos/Em andamento/Conquistados; filtros de tipo (curso, evento, trilha híbrida) e ordem (pills no desktop, `GroupsSheet` no mobile/tablet). **O botão Baixar só habilita com 100% de progresso** (desabilitado com dica "Disponível com 100% de progresso"); baixar mostra apenas um aviso simulado. As capturas de 360 do Figma repetem os cards de Missões; o card compacto segue o padrão das outras telas (tipo e meta, botão e donut de progresso).

## Loja em código (Layout B)

`src/shell/Store.tsx`, em `#exemplo-cursos?p=loja`. Banner (desktop), faixa "Seu saldo", filtros de categoria e ordem (pills no desktop, `GroupsSheet` no mobile/tablet) e cards com preço em moedas, "Item único" e "Esgotado". **Fluxo de compra:** Trocar abre "Finalizar compra" (modal no desktop, bottom sheet abaixo de 1180) com saldo, preço e saldo após a troca; confirmar debita o saldo e mostra "Compra realizada". Esgotado ou saldo insuficiente desabilitam o botão. O saldo (2.500) é local da tela e não atualiza o menu lateral, que segue estático.

## Feed em código

`src/shell/Feed.tsx`, em `#exemplo-cursos?p=feed`. Abas Todas/Favoritas; filtros de categoria, tipo (com imagem/só texto) e ordem (pills no desktop, `GroupsSheet` no mobile/tablet). Notícia com ou sem imagem, favoritar, **gostar** (alterna e soma ao contador), **comentar** (painel com comentários, respostas e campo de envio; o comentário novo entra na lista). No desktop (1180+) a coluna lateral traz **Canais** (filtra o feed) e **Em alta!**; abaixo disso os canais viram a linha "Seções". Responder a um comentário ainda não está implementado (as respostas exibidas são de exemplo). Estado local; some ao recarregar.

## Eventos em código (Layout A)

`src/shell/Events.tsx`, em `#exemplo-cursos?p=eventos`. Abas Todos/Favoritos/Em breve/Encerrados; filtros de categoria, tipo (presencial, online, híbrido) e ordem (pills no desktop, `GroupsSheet` no mobile/tablet). Card com data, local, vagas (ilimitadas, n/total, esgotado), favoritar, **Inscrever-se / Cancelar inscrição** (desabilitado se encerrado ou esgotado) e **Adicionar à agenda** (aviso simulado, só no card desktop; no compacto só a inscrição). Estado local, some ao recarregar; inscrever não altera o número de vagas.

## Perguntas frequentes e regulamento em código

`src/shell/Faq.tsx`, em `#exemplo-cursos?p=faq` (item "Perguntas frequentes" do menu e do "Mais"). Acordeão com uma pergunta aberta por vez (a primeira abre de início). **Regulamento:** lista com ícone de link externo; cada item abre um modal com o PDF (simulado). O Figma prevê o caso de um único regulamento abrir direto, mas o mockup só mostra a lista de vários. O alternador "Perguntas frequentes / Regulamento" é nosso, porque o menu do Figma só tem o primeiro item. Textos de exemplo, no lugar de "Pergunta" e "Text" do Figma.

**Atualização (06/11/2026): refeito pelo Figma** (página 10.Perguntas frequentes e Regulamento, nó 18:1644; `js/screens/faq.js`).
- O alternador "Perguntas frequentes / Regulamento" saiu: são duas áreas. `#faq` (menu lateral e "Mais") e `#regulamento`
  (item "Regulamento" do menu do perfil). No mobile e no tablet o título vem do menu top da casca ("Perguntas frequentes",
  "Regulamentos"); no desktop não há título, como no Figma.
- Medidas do Figma: card com padding 16 e raio 16 (mobile: 8 e 8); item de 68 com passo de 85 (mobile: 42 e 59); botão de ícone
  de 36, raio 12 (mobile: 28, raio 8); texto 14/20 (mobile: type-mobile/body 12/18); divisor de 1px em background-muted.
- Regulamentos: vários viram lista e cada um abre o modal "regulamento full" (804 de largura) com as páginas do documento;
  um só abre direto no card, ocupando a altura da tela (`#regulamento?unico=1` para ver). A página é a imagem exportada do Figma
  (`assets/regulamento/pagina.png`); o PDF real vem da API.
- Nova versão do Figma (06/11/2026): nos frames de 1179 em diante todas as perguntas começam fechadas; em 360 e 768 a primeira
  continua aberta. Os frames de Regulamentos só tiveram os componentes refeitos, sem mudança visual.
- `menuTop` passou a omitir a linha de abas quando não há abas nem filtro (o "menu top mobile" do Figma tem 42 de altura).
- Pontos a confirmar: o frame de 360 "regulamento único" repete a lista de vários; aqui o documento abre direto em todas as larguras.
  O modal tem cabeçalho com título e Fechar (o componente do Figma só mostra o documento), por acessibilidade.

## Meu time (Gestores) em código

`src/shell/Team.tsx`, em `#exemplo-cursos?p=time`. Segue a **nova página de gestores** do Figma LP-DesignSystem (nó 4694:17004).
- **Lista "Usuários":** tabela no desktop (nome, progressão com barra, performance, curso, certificados, último acesso; **cabeçalhos ordenáveis**) com filtro de curso, Limpar e paginação; cards com "Ver mais" abaixo de 1180 (filtro no `GroupsSheet`).
- **Desktop (1180+):** clicar na linha leva **direto à página do usuário**. A tabela de Conteúdo tem Progressão, Performance, Obrigatório e Prazo.
- **Mobile e tablet (abaixo de 1180):** teste feito **sem consultar o Figma mobile**, adaptando a página do desktop. Tocar no card do usuário abre a mesma página (sem sheet). Barra fixa com voltar (alvo de 44px) e o nome; cabeçalho em duas linhas (identidade, depois pontos e último acesso); indicadores em grade de 2 colunas (o 5º ocupa a linha toda; 5 colunas a partir de 768); **Conteúdo vira lista de cards** (título em até várias linhas, barra de progresso, performance, obrigatório, prazo; chip "Ordenar por: Performance/Prazo" no lugar do cabeçalho clicável); abas roláveis; Certificados e Missões com título em 2 linhas e botão de baixar de 44px; seções empilhadas. O drawer/sheet de detalhe rápido foi removido do fluxo.
- **Conteúdo navegável:** abas Rota de aprendizagem / Cursos; clicar desce rota > curso > módulo > atividade (a seta volta um nível). Na página (desktop), tabela com Progressão e Performance, e **Jogadas** na atividade.
- **Página do usuário:** Voltar, cabeçalho (nível, pontos e moedas, último acesso), indicadores (progresso, performance, cursos, certificados, missões), Conteúdo, Horas de treinamento (donut), Certificados (com baixar), Conquistas e Missões (com status).
- Dados de exemplo. Não feitos: a busca (lupa) dos cards, o radar "Estudo por competência" da versão mobile e as variações de swipe do Figma. Selos de conquista e donut são desenhos simples.


### Meu time: desktop fiel ao Figma
O desktop (1180+) foi refeito com as medidas do Figma (nós 4764:129372, 4710:44644, 4747:60198, 4747:59752, 4747:60000, 4726:55227), conferidas por medição no DOM em 1440: cabeçalho do usuário de 146px (avatar 96 com anel, badge Nv.2, pílulas de pontos e moedas, último acesso), totalizadores com ícone de 20px e número de 20/32 (altura 86), tabela de Usuários com colunas de largura fixa (288, 128, 111, 80, 80, 128), linhas de 64px e divisor recuado em 48, tabela de Conteúdo com cabeçalho em fundo `surface-system-subtle`, linhas de 60px e colunas fixas, Horas (donut de 200px, legenda e "Faltam 14h"), Certificados e Missões em lista rolável de 211px, grade de 416 : 808 com 24px entre blocos. Fora do Figma: selos de conquista, ícones e donut são aproximações; o mobile segue o teste feito sem consultar o Figma.

**Conteúdo no tablet (768 a 1179):** mantém a tabela do desktop, mas compacta: as colunas Obrigatório e Prazo saem e viram uma linha abaixo do título ("Obrigatório · Prazo 13 Out. 2027"); ficam Progressão, Performance e a seta. Abaixo de 768 continua a lista de cards com o chip "Ordenar por".

**Animação ao navegar no Conteúdo (Meu time):** ao descer um nível (rota > curso > módulo > atividade) a lista inteira (caixa de contexto e tabela ou cards) entra da direita para a esquerda; ao voltar, entra da esquerda. 240ms, `cubic-bezier(0.22, 1, 0.36, 1)`, deslocamento de 32px com fade (`.lp-slide-in-right` e `.lp-slide-in-left` em `index.css`). Trocar de aba não anima. Respeita "reduzir movimento" do sistema, a menos que a página abra com `?motion=on`, como nas outras telas.

**Mobile: Missões do usuário e Certificados.** Abaixo de 1180, Missões vira a lista "Missões do usuário" ("Missões para o usuário participar"): ícone em quadrado de 36px, título em uma linha, "Meta · Individual" e o status na mesma linha, divisor recuado em 48, mais respiro (linhas de 12px de padding, 6px entre título e meta) e **Carregar mais** no fim (5 itens, depois mais 4). Certificados no mobile não tem rolagem interna: mostra 3 e o **Carregar mais** abre mais 3. No desktop continuam as listas roláveis de 211px. A página "Gestores mobile (teste)" do Figma tem o mesmo card de Missões.

**Filtro de status nas Missões do usuário (Meu time).** O cabeçalho "Status" do card de Missões é um botão que abre as opções **Em andamento, Aprovada, Não iniciada e Reprovada**, com caixas de marcação (dá para marcar várias; "Limpar seleção" volta a todas). O botão mostra a quantidade marcada. A lista filtra na hora, com mensagem quando nenhuma missão bate. Vale no desktop (cabeçalho da lista) e no mobile (botão "Status" ao lado do título "Missões do usuário"). O rótulo "Concluída" virou "Aprovada" e entrou o status "Reprovada" (vermelho). A página de teste do Figma ainda mostra os status antigos e não tem o menu.

**Status das missões no mobile e tablet:** o botão "Status" abre um **bottom sheet** (centralizado com no máximo 640 no tablet) em vez do menu suspenso. Ele lista as quatro opções com caixas de marcação, mostra a contagem de resultados e tem Limpar filtro e Aplicar (a lista só muda ao aplicar). No desktop (1180+) continua o menu suspenso que filtra na hora. O botão usa o ícone de três linhas que diminuem.

**Lista "Usuários" (Meu time) no tablet e no mobile:** a tabela do desktop vale em todos os tamanhos, em versão compacta. Abaixo de 1180 ficam três colunas (Nome, Progressão e Performance, com cabeçalhos ordenáveis) e Curso, Certificados e Último acesso passam para uma linha pequena sob o nome ("128/128 cursos · 128/128 certificados · Último acesso 30 Out."); no mobile (abaixo de 768) a linha traz só cursos e certificados. As linhas têm no mínimo 56px e abrem a página do usuário. Os cards antigos do mobile saíram. O rodapé mostra a contagem e "Exibir 12" em todos os tamanhos; a paginação aparece a partir de 768.

**Atualização: Usuários com rolagem lateral (abaixo de 1180).** A versão compacta de três colunas foi trocada pela tabela completa do desktop (seis colunas) dentro de uma área com **rolagem horizontal** (largura mínima de 880px), para nada ficar apertado. A coluna **Nome fica fixa** à esquerda enquanto se rola, e os cabeçalhos continuam ordenáveis. **Na primeira vez que a tabela aparece**, ela rola 72px para a direita e volta (um "bounce" de 0,8s) para avisar que há mais colunas; acontece uma vez por visita à página e respeita "reduzir movimento" (ou `?motion=on`). No desktop não há rolagem.

**Ajuste do bounce e da rolagem da tabela de Usuários.** O bounce usa uma rolagem animada com easing (easeInOutCubic): vai a 64px em 0,8s, espera 0,25s e volta em 1s; tocar ou usar a roda do mouse na tabela cancela a animação. A área de rolagem ocupa o cartão de ponta a ponta (cabeçalho, divisores e linhas rolam juntos; o hover das linhas vai de borda a borda), com a coluna Nome fixa.

**Atualização:** a coluna Nome da tabela de Usuários **não fica mais fixa** ao rolar; todas as colunas rolam juntas.

**Tempos do bounce (versão atual):** começa 0,6s depois de a tabela aparecer, vai a 64px em 0,55s, espera 0,15s e volta em 0,7s (1,4s no total).

**Ordenação do Conteúdo no mobile (abaixo de 768):** o botão ao lado de "Performance" agora leva o ícone de filtro (três linhas) e abre um **bottom sheet "Ordenar por"** com **Performance, Nome, Prazo e Progressão** (escolha única; tocar na opção aplica e fecha). Performance e Progressão ordenam do maior para o menor, Nome de A a Z e Prazo do mais próximo ao mais distante. A tabela do tablet e do desktop continua com os cabeçalhos.

**Prazo só em cursos, e ordem no sheet de ordenação.** A coluna/linha **Prazo** aparece apenas na lista de **cursos**; rotas (e módulos e atividades) não têm prazo, e a opção "Prazo" some da ordenação fora dos cursos. O sheet "Ordenar por" do mobile ganhou a seção **Ordem**, com as duas direções escritas por extenso: Performance e Progressão **Maior para o menor** / **Menor para o maior**, Nome **A a Z** / **Z a A**, Prazo **Mais próximo primeiro** / **Mais distante primeiro**. O padrão de cada critério é: maior para o menor, A a Z e prazo mais próximo. O botão da lista mostra uma seta (para baixo = decrescente, para cima = crescente) ao lado do critério, e há **Cancelar** e **Aplicar** no rodapé.

**Padrão dos bottom sheets de filtro e ordenação (mobile).** Os sheets de **Ordenar por** (Conteúdo) e de **Status** (Missões) seguem o mesmo padrão do filtro de Cursos: alça no topo, **grupos de chips** (`Group`, `SingleGroup`, `Chip` de `FilterSheet.tsx`), linha "N resultados encontrados" e botões **Limpar filtro** e **Aplicar** no rodapé. Ordenar por tem os grupos "Ordenar por" (Performance, Nome, Progressão e, em cursos, Prazo) e "Ordem" (maior para o menor / menor para o maior, A a Z / Z a A, mais próximo / mais distante); Status é múltipla escolha, com check nos chips marcados. Isso substitui as versões anteriores com caixas de marcação e botões de rádio.

**Obrigatório e Prazo só em cursos.** Rotas de aprendizagem não têm a designação de obrigatório nem prazo: na tabela, na linha do tablet e nos cards do mobile, "Obrigatório" e "Prazo" aparecem apenas na lista de **cursos**. Rotas, módulos e atividades mostram só Progressão e Performance (atividades também Jogadas).

**Figma: página "Gestores mobile (teste)" (LP-DesignSystem 4.0).** Atualizada com o estado atual do código: frame principal da página do usuário (360) e, ao lado, os frames **Sheet · Ordenar por**, **Sheet · Status** (no padrão de chips, contagem e Limpar filtro / Aplicar), **Lista de Usuários · 360** (tabela com rolagem lateral, mostrando as colunas cortadas na borda) e **Conteúdo · dentro da rota** (cursos com Obrigatório e Prazo; rotas só com Progressão e Performance). Os frames usam as variáveis de cor e os estilos de texto do arquivo; selos de conquista e avatares são aproximações.

**Chips sem check nos sheets.** Os chips selecionados dos sheets (Ordenar por, Ordem e Status) mostram a seleção só pela borda roxa, o fundo claro e o texto semibold, **sem ícone de check**; o check fica restrito ao painel de subcategorias do filtro de Cursos. Vale no código e no frame "Sheet · Status (360)" do Figma.

**Ordenar por no mobile, igual ao filtro de Cursos.** O sheet tem um único grupo "Ordenar por" com chips que juntam critério e sentido, como "Mais recentes / Maior progresso / Título A-Z" em Cursos: **Maior performance, Menor performance, Maior progresso, Menor progresso, Título A-Z, Título Z-A** e, só na lista de cursos, **Prazo mais próximo, Prazo mais distante**. Não há mais o grupo "Ordem". O botão da lista mostra o rótulo escolhido (por exemplo "Maior performance") com o ícone de filtro, sem seta. Padrão: Maior performance. Vale no código e nos frames do Figma.

**Avatar maior no cabeçalho mobile (Meu time).** Abaixo de 1180 a foto do usuário passou de 24 para 64px (60 de foto com anel de 2px em `background/notification`), com o selo "Nv.2" na base, como no desktop em menor escala. O `Avatar` ganhou a propriedade opcional `px` para tamanhos fora dos padrões. O frame do Figma "Página do usuário · 360 (teste)" tem o mesmo avatar.

**Certificados do usuário no mobile, padronizado com Missões do usuário.** Abaixo de 1180 o card de certificados usa o mesmo padrão do de missões: título "Certificados do usuário" com o subtítulo "Certificados recebidos pelo usuário", sem a lupa e sem o cabeçalho "Título"; cada linha tem o ícone em quadrado de 36px, o título **inteiro** (sem reticências) e, na linha de baixo, a data com o ícone de calendário à esquerda e o botão **baixar** (44px) à direita; divisor recuado em 48; e **Carregar mais** no fim (3 itens, depois +3 até 8). O desktop mantém o card com lista rolável de 211px. O frame "Página do usuário · 360 (teste)" do Figma foi atualizado do mesmo jeito.

Padrão comum para listas de "do usuário" no mobile: `[ícone 36] título inteiro / linha de meta com ação ou status à direita`, divisor `ml-12`, `Carregar mais`.

**Ordenar a lista de Usuários no mobile e tablet.** O botão **Filtro** de "Meu time" abre o sheet com dois grupos de chips, como o filtro de Cursos: **Curso** e **Ordenar por** (Nome A-Z, Nome Z-A, Maior progresso, Menor progresso, Maior performance, Menor performance, Acesso mais recente, Acesso mais antigo). O padrão é Nome A-Z; o sheet reabre com a opção atual marcada, a contagem acompanha a escolha e o botão Filtro mostra quantos filtros estão ativos. Os cabeçalhos da tabela continuam ordenáveis (inclusive Curso e Certificados), e a escolha feita neles aparece no sheet quando existe uma opção equivalente.

**Ordenar os certificados no mobile.** O card "Certificados do usuário" tem, à direita do cabeçalho, o botão com a ordem atual e o ícone de filtro (padrão **Mais recentes**), que abre o sheet **Ordenar por** com os chips **Mais recentes, Mais antigos, Título A-Z e Título Z-A** (contagem e Limpar filtro / Aplicar, como nos outros sheets). A lista passa a ter títulos e datas diferentes para a ordenação ser visível. No Figma há o frame "Sheet · Ordenar certificados (360)" e o botão no card.

**Correção: o Filtro da lista de Usuários é só para o curso.** O botão Filtro de "Meu time" (mobile e tablet) abre o sheet com **um único grupo, "Curso"** (seleção do nome do curso). A ordenação da lista de Usuários **não** fica nesse sheet: continua pelos cabeçalhos da tabela (Nome, Progressão, Performance, Curso, Certificados, Último acesso). Isso substitui o parágrafo anterior sobre "Ordenar a lista de Usuários no mobile e tablet".

## Componente `Sheet` (casca única dos bottom sheets)

`src/components/Sheet.tsx` reúne a casca que estava copiada em cada sheet: fundo escuro que fecha ao clicar, painel que sobe de baixo (máx. 640 no tablet), alça, corpo com rolagem e Esc para fechar. `SheetFooter` é o rodapé dos filtros (contagem, Limpar filtro, Aplicar). Usam o `Sheet`: Filtros de Cursos, `GroupsSheet` (Missões, Ranking, Usuários), Biblioteca, "Mais", e em Meu time o "Ordenar por" e o "Status". Para criar um sheet novo, passe só o conteúdo. Ficaram fora, por terem layout próprio (modal no desktop ou gaveta lateral): checkout da Loja e detalhe de Conquistas. O `BottomSheet` de `components/Mobile.tsx` continua sendo só o exemplo estático da página de componentes.

## Página do usuário · versão B (mobile e tablet, teste)

Abaixo de 1180, abrir a rota com `&v=b` (ex.: `#exemplo-cursos?p=time&v=b`) mostra a versão B; sem o parâmetro continua a versão A. Motivo: a página tinha cinco indicadores, conteúdo, horas, certificados, conquistas e missões numa rolagem só. Na B a tela mostra o essencial e o resto fica um toque adiante:
- Cabeçalho enxuto: avatar, nome, nível e e-mail.
- Linha de filtros fixa abaixo do cabeçalho (Resumo, Conteúdo, Missões, Certificados, Conquistas, Horas), com rolagem lateral; um painel por vez.
- Resumo: Progresso e Performance em destaque e uma lista de atalhos (Cursos, Missões, Certificados, Conquistas, Horas), cada um leva à seção. Pontos, moedas e último acesso ficam numa linha no fim.
- Os painéis reaproveitam os componentes da versão A (conteúdo navegável, missões, certificados, conquistas, horas). Desktop não muda.

Ajuste da versão B: o cabeçalho do usuário é o mesmo da A (componente `ProfileHeader`, com e-mail, nível, pontos, moedas e último acesso). O Resumo perdeu a linha de pontos e último acesso, que já estão no cabeçalho. O painel Conteúdo passou a mostrar uma rota ou um curso por vez: segmento Rota de aprendizagem / Cursos, um campo que abre um sheet com a lista (escolha única, fecha ao tocar), um resumo do item escolhido (progressão, performance e, em curso, obrigatório e prazo) e abaixo só os níveis dele (cursos da rota, ou módulos e atividades do curso), com o mesmo "Ordenar por". Cada aba lembra a última escolha.

## Página do usuário · versão C (teste)

O alternador da barra do topo agora tem A, B e C (`&v=c` abre direto na C). A C é a B (mesmo cabeçalho, mesmas seções) com outra listagem em Conteúdo: os mesmos cards compactos da tela Cursos (`CourseCardCompact`, 2 por linha), filtrados pelo segmento Rota de aprendizagem (4) / Cursos (8). Tocar num card abre o desempenho daquele conteúdo (resumo + níveis abaixo, com o mesmo "Ordenar por") e há um botão para voltar à lista. `Course` e `courses` passaram a ser exportados de `Courses.tsx`.

Ajuste da versão C: o card de conteúdo troca o rodapé de tags e progresso pelas métricas do gestor (`MetricsFooter`). Rota: Progressão (com barra) e Performance. Curso: Progressão, Performance, Prazo e se é Obrigatório ou Opcional. Dentro de uma rota, os cursos também aparecem nesse card (2 por linha); a partir de módulo a lista continua como antes. `CourseCardCompact` ganhou a prop opcional `footer`.

Correção da versão C: o card de conteúdo do gestor (`ManagerContentCard`) mostra só se o usuário está fazendo e como está se saindo. Saíram quantidade de cursos e módulos, ícones de selo, tempo, tags e indicador de progresso. Ficam: capa, título, estado (Não iniciado, Em andamento, Concluído), Progressão e Performance, cada uma com rótulo, valor e barra próprios (barra roxa para progressão, amarela para performance) e, em curso, Prazo e Obrigatório/Opcional. Sem progresso, a performance aparece como "—". A prop `footer` do `CourseCardCompact` foi desfeita e `Cover` passou a ser exportado de `Courses.tsx`.

## Meu time · lista de Usuários no mobile em cards

Abaixo de 768 a lista deixa de ser tabela e usa o mesmo conceito dos cards de conteúdo: avatar, nome e e-mail, seta, barra de Progressão com rótulo e percentual, e Performance. Tocar abre a página do usuário. Sem cabeçalhos de tabela, a ordenação vem do botão "Ordenar por" (rótulo combinado + ícone de filtro) que abre um sheet com uma lista de opções (Nome A-Z/Z-A, Maior/Menor progresso, Maior/Menor performance, Acesso mais recente/antigo). O Filtro do topo continua só para o curso. No tablet (768 a 1179) segue a tabela com rolagem lateral e cabeçalhos clicáveis; no desktop, a tabela de sempre.

## Resumo também na versão A (mobile e tablet)

Abaixo de 1180, a versão A troca a grade de cinco cards de indicadores pelo mesmo Resumo da B (`SummaryBlock`): Progresso e Performance em destaque e a lista de atalhos (Cursos, Missões, Certificados, Conquistas, Horas treinadas). Como na A todas as seções ficam na mesma página, cada atalho rola até a seção correspondente (com margem para a barra fixa). O desktop continua com a grade de cinco cards do Figma.

Correção: a versão A no mobile e no tablet também usa o Resumo e uma aba por seção (a rolagem única com atalhos por âncora foi desfeita). As três versões abaixo de 1180 compartilham a mesma estrutura (cabeçalho, linha de abas, Resumo); o que muda é a aba Conteúdo: A mantém a navegação em lista (Rota de aprendizagem / Cursos, "Ordenar por"), B escolhe um item por vez, C lista em cards. O desktop não muda e `Profile` passou a ser só o desktop.

## Busca de conteúdo (mobile e tablet)

A aba Conteúdo ganhou um campo "Buscar conteúdo" (`SearchField`): filtra na hora pelo título, sem diferenciar acento nem maiúsculas, com botão X para limpar e a mensagem "Nenhum conteúdo encontrado" quando não há resultado. Na versão A fica logo abaixo do segmento Rota de aprendizagem / Cursos e vale para o nível em que o usuário está (rotas, cursos, módulos, atividades); ao entrar num item ou voltar, a busca é limpa. Na B a busca fica dentro do sheet de seleção; na C, acima dos cards e também dentro do item aberto. O desktop não muda.

Ajuste no Resumo: o atalho "Cursos" virou dois, "Rotas de aprendizagem" (n/12) e "Cursos" (n/128), nessa ordem. Os dois levam à aba Conteúdo (versões A, B e C), já com o segmento correspondente (Rota de aprendizagem ou Cursos) selecionado. Tocar direto na aba Conteúdo abre em Rota de aprendizagem.

Ajuste: Missões e Certificados do usuário (mobile e tablet) mostram a lista inteira, sem o botão "Carregar mais". Como cada seção agora tem a sua aba, a rolagem da página cobre a lista.

Ajuste: o card de usuário da lista no mobile ganhou "Último acesso" (data, com o ícone de entrada) numa linha própria abaixo de Performance.

Ajuste: o card de usuário da lista no mobile mostra, abaixo da barra de Progressão, uma grade de 2 colunas com Performance, Cursos (n/128), Certificados (n/128) e Último acesso (dia e mês, sem o ano). O texto "Último acesso" completo, com ano e hora, continua na página do usuário.

Correção: o "Último acesso" do card de usuário volta a mostrar o ano (ex.: 29 Out. 2027). Como não cabe ao lado de Certificados em 360, as informações (Performance, Cursos, Certificados, Último acesso) fluem em linhas que quebram conforme a largura, em vez da grade de 2 colunas.

Reorganização do card de usuário no mobile, por hierarquia: (1) identidade: avatar, nome, e-mail e seta; (2) métricas principais lado a lado, Progressão e Performance, cada uma com rótulo, percentual e a sua própria barra (roxa e amarela, como nos cards de conteúdo); (3) divisor e dados de apoio: Cursos e Certificados (n/128, com ícone) e, numa linha própria, Último acesso com ano. Textos em 12 px ou mais, o card inteiro é o alvo de toque e os itens de apoio quebram de linha em telas estreitas.

Mesmo conceito nos conteúdos (mobile): rota de aprendizagem, curso, módulo e atividade usam a hierarquia do card de usuário. Título com ícone e seta; Progressão e Performance lado a lado, cada uma com rótulo, percentual e barra própria (`MetricPair`, compartilhado com o card de usuário); e, abaixo de um divisor, só os dados de apoio de cada nível: curso mostra Prazo (com ícone de calendário) e Obrigatório ou Opcional (`CourseMeta`); atividade mostra Jogadas; rota e módulo não têm linha de apoio. O resumo do conteúdo aberto (versões B e C) usa os mesmos componentes. O card em grade da versão C mantém as métricas empilhadas porque a coluna é estreita.

## Figma · Gestores mobile (teste): card de usuário, cards de conteúdo, Resumo e Conteúdo com busca

Na página "Gestores mobile (teste)" do LP-DesignSystem 4.0 entraram, com variáveis de cor e estilos de texto do arquivo:
- Componente **Card de conteúdo (gestor)**, conjunto com a propriedade Nível: Rota, Curso, Módulo e Atividade. Título com ícone e seta; Progressão e Performance lado a lado com barra própria; divisor e apoio só onde cabe (Curso: Prazo e Obrigatório; Atividade: Jogadas).
- Componente **Card de usuário** (identidade, métricas, Cursos, Certificados e Último acesso com ano).
- Frames: "Lista de Usuários · 360" (refeito com instâncias do card), "Conteúdo · aba com busca (360)" (substitui "Conteúdo · dentro da rota") e "Resumo · aba (360)" (indicadores e atalhos, com Rotas de aprendizagem e Cursos separados).
Ficam fora do Figma, por serem só de teste: o alternador A | B | C e as versões B e C do conteúdo.

## Versão D da página do usuário (mobile/tablet, `v=d`)
O Resumo mostra todos os indicadores como cards iguais aos de Progressão e Performance (ícone + rótulo, valor grande e barra): Progressão, Performance, Rotas de aprendizagem, Cursos, Missões, Certificados, Conquistas (6/12, total provisório) e Horas treinadas. Cada card, exceto Progressão e Performance, leva à seção correspondente. As demais abas seguem a versão A. Rótulo "Progresso" passou a "Progressão" no Resumo e no cabeçalho.

## Card de gestor aprovado (mobile)
Cards de conteúdo (lista com um card por linha) e de usuário usam o formato enxuto: barra de Progressão com % ao lado, Performance só como número com ícone de gráfico e, em curso, a pílula "Obrigatório" (vermelha) seguida de "até <data>"; opcional mostra só a data. O seletor Completo | Enxuto foi removido.

Card de usuário aprovado (mobile): barra de Progressão com % + Performance em número, e abaixo Cursos, Certificados e Último acesso, um por linha, com ícone.

## Resumo do usuário (mobile/tablet) no formato novo
Progressão e Performance com barra, grade 2x2 de atalhos (Rotas de aprendizagem, Cursos, Certificados, Missões, com valor e chevron), card Conquistas (3 últimas) e card Horas de treinamento, tudo na aba Resumo. Ordem das abas: Resumo, Conteúdo, Certificados, Missões, Conquistas, Horas.

## Página do usuário: versão A escolhida
As versões B, C e D e o seletor A | B | C | D foram removidos. Abaixo de 768 fica a página em abas (Resumo, Conteúdo, Certificados, Missões, Conquistas, Horas) com a lista de conteúdo e busca; a partir de 768 vale a estrutura do desktop.

## Figma · atualização (versão A aprovada)
Página "Gestores mobile (teste)": componente "Card de conteúdo (gestor)" (4 variantes) e "Card de usuário" no formato enxuto; frames Lista de Usuários, Conteúdo e Resumo atualizados (Resumo com grade 2x2, Conquistas e Horas). Frame "Página do usuário · 360 (teste)" marcado como versão antiga. Não há frames de 768 no Figma ainda.

## Sincronização com o Figma (página B.Gestores, 27/10/2027)
- Breakpoint novo para a tela Meu time: **1024**. Abaixo (360 e 768) a lista é de cards (1 coluna no 360, 2 colunas no 768) e o usuário abre em abas; a partir de 1024 a lista é tabela e o usuário abre na página completa (frames 1179, 1180, 1440, 2560).
- Perfil do usuário abaixo de 1024: 4 abas (Resumo, Conteúdo, Certificados, Missões). Conquistas (6) e Horas de treinamento ficam dentro do Resumo, lado a lado a partir de 768. Grade do Resumo: 2 colunas no 360, 3 no 768 (Progressão, Performance, Rotas, Cursos, Certificados, Missões). "Rotas" no 360 e "Rotas de aprendizagem" no 768.
- Topo do perfil mobile: só "← Voltar" (sem título "Meu time").
- Lista: subtítulo "Informação do desempenho nas rotas e cursos", ordenação padrão "Maior performance", botão de filtro mostra o curso escolhido ("Todos os cursos"), ícone de busca no cabeçalho, card de usuário sem chevron e com data e hora do último acesso.
- Tabela desktop sem ícones nas colunas, exceto a seta de Performance.
- Divergência aberta: o Figma desktop usa "Progresso" nos cards do perfil; o projeto mantém "Progressão" (decisão anterior).

## Biblioteca: detalhe do material (página 2.1.Biblioteca [Interna], 28/10/2026)

- Clicar em um card abre o detalhe: **navdrawer** de 400 flutuante à direita (8 de margem, scrim) a partir de 1179 de largura; abaixo disso, **bottom sheet** (no tablet com no máximo 640).
- Tipos: arquivo e imagem (capa quadrada, botão "Baixar arquivo"/"Baixar"), link (botão "Acessar site"), áudio e vídeo (capa 16:9, sem botão, linha de data, curtidas, não curtidas e visualizações).
- No bottom sheet o botão fica fixo no rodapé; título da descrição muda de "Sobre este..." (drawer) para "Sobre o..." (sheet).
- Divergências com o Figma: o drawer de arquivo diz "Sobre esta imagem" (usamos "Sobre este arquivo"); o sheet de áudio diz "Sobre o audio" (usamos "áudio"). A capa usa o gradiente do card (o Figma usa a imagem do material). Os frames do tablet têm 691 de largura; o Sheet segue limitado a 640.

## Entrega para o time de dev: detalhe do material em Angular (30/10/2026)

- Proposta de componente Angular + SCSS + stories do detalhe da Biblioteca em `entrega-dev/library-detail/` (ver o README da pasta). Escrita a partir do Storybook do time (`web-storybook.zip`: Angular 21, signals, Transloco, SCSS por componente).
- **Não foi compilada nem executada**: só havia o build estático do Storybook, sem o repositório. O SCSS foi validado; imports, nomes de ícones e o enum `LibraryMaterialType` foram deduzidos e precisam de conferência do dev.
- Pontos em aberto: (1) drawer a partir de 1179 no Figma contra `large` a partir de 1280 no produto; (2) descrição, tags, não curtidas e visualizações precisam vir da API de detalhe; (3) capa 16:9 de áudio e vídeo; (4) `app-button` e `app-tag` assumidos com projeção de conteúdo e largura total; (5) formato da data; (6) neutros fixos no SCSS, trocar por tokens se existirem.
- Outras divergências entre o protótipo e o produto vistas no Storybook: o tema do produto é gerado pela cor de cada cliente (`--system-*`), enquanto o protótipo usa uma escala roxa fixa; o produto tem 3 faixas de tela (menor que 768, 768 a 1279, 1280 ou mais), enquanto o Figma usa 768, 1179/1180, 1366, 1440 e 2560.

## Entrega para o time de dev: mais componentes em Angular (04/11/2026)

- Em `entrega-dev/` (ver `entrega-dev/README.md`): `side-panel` (casca única de navdrawer e bottom sheet, que o produto não tem), `achievement-detail` (detalhe da conquista) e `install-guide` (passo a passo do PWA no iPhone). O `library-detail` passou a usar o `side-panel`.
- Mesmo estado de antes: SCSS validado e sintaxe dos `.ts` conferida, mas nada compilado nem executado, porque só há o build estático do Storybook deles.
- Pontos novos em aberto: o PWA no iPhone realmente enviar notificações (o texto da abertura as cita); o controle de "já viu o passo a passo" ser por navegador ou por usuário; o logotipo e o nome do app por cliente (white label).
- Ainda sem versão Angular: Gestores, Missões, Ranking, Certificados, Loja, Feed, FAQ e Extrato.

## Entrega para o time de dev: lista de Gestores em Angular (04/11/2026)

- Em `entrega-dev/team-member-list/`: lista "Usuários" (tabela a partir de 1024, cards abaixo), card, tabela e bottom sheet "Ordenar por" (sobre o `side-panel`). Mesmo estado de antes: SCSS validado e sintaxe dos `.ts` conferida, nada compilado nem executado no Angular deles.
- **Não incluído:** a página do usuário (indicadores, conteúdo navegável, horas, certificados, conquistas e missões) e o filtro por curso do menu superior.
- Pontos em aberto: corte de 1024 que o produto não tem (usa 768 e 1280); sentido de "Acesso mais recente" (`lastAccess-desc` aqui, `last-asc` no protótipo); denominador `nuTotal` de cursos e certificados; formato da data com hora; trocar as barras próprias pelo `app-progress-bar` se ele aceitar percentual e alturas.

## Entrega para o time de dev: página do usuário de Gestores, etapa 1 (04/11/2026)

- Em `entrega-dev/team-profile/`: página do usuário com cabeçalho, indicadores, resumo com atalhos, horas e conquistas, e as abas abaixo de 1024. Mesmo estado de antes: SCSS validado, sintaxe e imports relativos conferidos, nada compilado nem executado no Angular deles.
- **Conteúdo, Certificados e Missões** entram por projeção (`[sectionContent]`, `[sectionCertificates]`, `[sectionMissions]`) e são as etapas 2 e 3.
- Pontos em aberto: altura da barra superior para as barras coladas (`--team-topbar-height`); passo 200 da escala `--system-*`; nomes dos ícones; o selo das conquistas é um hexágono de exemplo até haver imagem na API.

## Entrega para o time de dev: conteúdo do usuário de Gestores, etapa 2 (04/11/2026)

- Em `entrega-dev/team-content/`: navegador de conteúdo rota/curso > módulo > atividade, com tabela (a partir de 1024) e cards com busca (abaixo), caminho com voltar e ordenação. É um componente controlado (recebe `items` e `trail`, emite os eventos de navegação) e entra no slot `[sectionContent]` da página do usuário. Mesmo estado de antes: SCSS validado, sintaxe e imports relativos conferidos, nada compilado nem executado no Angular deles.
- **Acréscimo ao protótipo:** os cabeçalhos da tabela passam a ordenar ao clicar (antes eram só decorativos).
- Pontos em aberto: `BoxActivityIcon` como ícone de atividade; formato da data do prazo; busca com debounce do `app-small-search` no lugar do campo com botão de limpar; falta a etapa 3 (Certificados e Missões).

## Entrega para o time de dev: certificados e missões do usuário de Gestores, etapa 3 (04/11/2026)

- Em `entrega-dev/team-certificates/`, `entrega-dev/team-missions/` e `entrega-dev/option-sheet/`: certificados (lista rolável ou cartão com ordenação em sheet), missões (filtro de status em menu ou sheet) e o bottom sheet genérico de escolha única. Entram nos slots `[sectionCertificates]` e `[sectionMissions]` da página do usuário. Mesmo estado de antes: SCSS validado, sintaxe e imports relativos conferidos, nada compilado nem executado no Angular deles.
- Com isso a página do usuário de Gestores está coberta (cabeçalho, indicadores, resumo, horas, conquistas, conteúdo, certificados e missões). Falta o filtro por curso do menu superior.
- Pontos em aberto: o filtro de missões é feito no componente (mover para a API se a lista for grande); `app-pill` no lugar do selo menor do protótipo; cores fixas dos pontos de status; formato das datas; nomes dos ícones.

## Fluxo de curso: Curso, Tabuleiro e Atividades (06/11/2026)

Recriado a partir do protótipo `Ludos Pro 4.0/ludos-pro-fluxo` (não do Figma). Rotas `#curso`, `#tabuleiro` e `#atividade` como páginas internas
(`data-layout="focus"`). Decisões tomadas sobre o protótipo, a confirmar com design:

1. Atividade (Curso e Tabuleiro): clicar no card ou no pin abre direto a atividade (`#atividade?item=…`). Não há mais detalhe em navdrawer/bottom sheet (decisão de 11/11/2026); a avaliação continua abrindo o diálogo da avaliação antes.
2. Cores por módulo do Tabuleiro (roxo, azul, verde-água, rosa) viraram a cor primária do cliente (`--color-action`).
3. A tela de Atividades usa Inter no protótipo; aqui usa Plus Jakarta Sans.
4. O cabeçalho próprio das telas internas entra abaixo de 768 (no protótipo, 600), porque é ali que a casca esconde a app bar.
5. O painel do curso no Tabuleiro abaixo de 1024 some no protótipo; aqui abre em bottom sheet.
6. Concluir uma atividade libera a seguinte (no protótipo, a primeira pendente).
7. Curso: tipografia e espaçamento ajustados à escala do design system (13 → 12/16, 15 → 14/20, 18/24 → 18/28, 24 e 20/28 → 20/32,
   título da capa 30/40 até 1179 e 48/48 a partir de 1180; gap, padding e margin em múltiplos de 4). O protótipo usava 13, 15, 6, 10 e 14px.

8. Sons das Atividades: os mesmos tons do protótipo (Web Audio, gerados na hora, sem arquivos), em `js/core/sound.js`. O liga/desliga
   fica no menu da conta no protótipo; aqui é um botão na barra de desempenho, porque no desktop o avatar é da casca. A escolha fica no
   navegador (`lp-sound`); no produto deve virar preferência do usuário. Respeitar o som desligado por padrão em contextos corporativos é
   uma decisão a confirmar com o design.

Componentes que surgiram repetidos e valem virar compartilhados: toast, diálogo central (alertdialog) e botão de fechar no sheet do `panel.js`.

### Curso pelo Figma "Curso Classica" (10/11/2026)

A tela Curso deixou o protótipo e segue o Figma LP-DesignSystem 4.0, página "Curso Classica" (os itens 4 e 7 acima não valem mais para ela).

- **Corte em 1179.** Abaixo: componentes mobile (360 e 768 iguais, só muda a margem: 8 e 24). A partir de 1179: layout desktop
  (1179, 1180, 1366 e 1440). A navigation bar continua até 1179, como em toda a casca.
- **Casca:** o Curso mantém a app bar e a navigation bar (`data-focus-nav` em `js/app.js`/`css/shell.css`); some só o menu lateral e
  a busca mobile. Saiu o cabeçalho próprio do mobile e a barra fixa do rodapé, que o Figma não tem. Na navigation bar, "Cursos" fica ativo.
- **Mobile:** linha "Voltar", abas que trocam o conteúdo (Visão geral, Conteúdo, Materiais; sem "Recomendados", que o Figma não mostra
  no mobile). Visão geral = card do curso (imagem com selos e duração na borda, título, autor, informações, progresso, "Ir para a trilha",
  recompensas), Descrição e Categorias.
- **Desktop:** capa com a mesma imagem do card lateral (`assets/fluxo/curso-lgpd.png`) na largura da coluna principal (16:9), lado direito escuro e véu
  `surface-dark` 50% → 100% com desfoque de 8px; título display-lg com leading 44 (`leading/8` do Figma). Card do curso (400) com o topo
  306px acima da base da capa. Largura máxima do conteúdo 1248 (o Figma 1366 usa 1318; ficou valendo o 1440).
- **A confirmar:** no Figma 1179 o título da capa (3 linhas) passa por cima do autor; aqui a capa cresce.

### Tabuleiro Versão A pelo Figma "Curso Ludica - Versao A" (10/11/2026)

- **Casca e abas:** como no Curso (app bar e navigation bar ficam; `data-focus-nav`). Abaixo de 1179, abas Visão geral, Conteúdo e
  Materiais; a aba que abre é Conteúdo (a trilha). Visão geral e Materiais usam os blocos exportados de `js/screens/course-detail.js`.
  Saíram o cabeçalho próprio do mobile e o bottom sheet "Sobre o curso".
- **Desktop:** coluna do curso de 400 (sticky) com abas Visão geral (card do curso, Sobre o curso, Categorias), Descrição e Materiais;
  o botão com contorno à esquerda dela recolhe a coluna (e um botão no canto direito a mostra de novo).
- **Trilha:** linhas de 110 (estrelas 30 + pin 80) com 6 entre elas; o pin atual ocupa 142 (anel de 104, traço 6). Onda de 0, 44 e
  76px para os lados, contínua entre os módulos. Pin de 64 (72 no atual) com aro de 4 e sombra 0 10 16 4 a 10%. Cores: concluída e
  atual `surface/system-default`; as seguintes do mesmo módulo "abertas" (`surface/system-soft`, com número); as de outros módulos
  com cadeado (`background/muted`). 40 entre cabeçalho e pins; 64 entre módulos.
- **A confirmar:** o Figma mostra só números nos pins (todos "1") e 9 pins por módulo, sem o pin de conclusão: aqui os pins têm o
  número da atividade, avaliação usa o ícone challenge e missão o target (mesmo bloqueadas), e o pin do fim de cada módulo
  virou a missão do módulo (ícone target, liberada ao concluir as atividades do módulo). O balão "Continuar" sobre o pin atual saiu (o Figma não tem).
  As estrelas cheias usam `--color-icon-warning` (no Figma, a rampa `yellow/400`).

### Tabuleiro Versão B pelo Figma "Curso Ludica - Versao B" (10/11/2026)

- Mesma casca, abas e coluna do curso da Versão A; muda só a trilha (`trailBLayout` em `js/screens/board.js`).
- Um cartão por módulo (o "board module band" da Versão A, sem ficar preso no topo), na largura toda da trilha (até 832), com o
  selo Concluído (verde), "x de y concluídas" ou Bloqueado (cadeado). A estrada sai de baixo do cartão e passa por baixo do seguinte.
- Pins, estrelas e anel iguais aos da Versão A (sem a missão do fim do módulo). Fileiras de até 5 pins, a 116 uma da outra; viradas com
  curvas de 44. Estrada a 84 da borda no desktop (28 no mobile), 1º pin 72 depois dela (56 no mobile), 1ª fileira 114 abaixo do
  cartão, cartão seguinte 92 abaixo da última fileira. Traços: sombra `text/primary` 8% (24), caminho `background/default` (20),
  progresso `surface/system-default` (8).
- **A confirmar:** o Figma não tem 360 da Versão B; aqui o 360 usa as medidas do mobile acima (3 pins por fileira). Fileira com menos de 5 pins (os módulos daqui têm 3): os pins se espalham
  entre o 1º e o último lugar, em vez de ocupar só os primeiros. Saiu o
  balão "Continuar" do protótipo. Selos com LP-Icons (badge-2,
  bulb), por isso `pill()` e `mpill()` ganharam `iconHtml`.

## Menu do perfil, tema escuro e alto contraste (06/11/2026)

Fonte: `Ludos Pro 4.0/design-ref/topbar-menu-ludospro.html` (não o Figma).

- **Menu do perfil** (`js/components/profile-menu.js`, montado por `js/shell/profile.js` nas duas pílulas da app bar): painel de 288 alinhado
  à direita, 8px abaixo da pílula; Minha conta, Histórico de atividades, Regulamento (→ FAQ), Idioma da plataforma (bandeira + check),
  Tema (claro, escuro, sistema), Melhorar contraste, Instalar como aplicativo (→ passo a passo do PWA), Sair e "Versão 4.0". Fecha com
  Esc (o foco volta para a pílula) e com clique fora. É um disclosure (botão com aria-expanded), não role="menu". Com ele aberto, a app bar
  sobe acima da navigation bar no mobile.
- **Tema e contraste** (`js/core/appearance.js`): ligam `data-theme` e `data-contrast` no `<html>`; `css/tokens.css` troca só os tokens
  semânticos. A escolha fica no navegador (`lp-appearance`); o `app.html` aplica antes do primeiro desenho para não piscar.
- **Tokens novos:** `--color-text-brand` e `--color-text-brand-strong` (texto na cor da marca; no escuro, tons claros da escala do cliente)
  e `--color-surface-dark` (sempre escura: selos sobre imagem, toasts, scrim). 47 usos de `--color-action`/`--color-surface-system-*` como
  cor de texto passaram para `--color-text-brand*`; fundos e botões continuam com `--color-action`.
- **Correções que o tema escuro revelou:** títulos de cards com `color: #000` (18 lugares) e skeletons com a rampa `--color-gray-200`
  passaram para tokens semânticos. No claro o resultado é idêntico.
- **Conferido:** contraste de todo texto visível nas 16 áreas, nos 4 modos (claro, escuro, e cada um com contraste): nada abaixo de 3:1.

Pontos a confirmar com o design:

1. Os valores do modo escuro e do alto contraste vêm da referência; o Figma ainda não tem esses modos.
2. O idioma só fica guardado (`lp-lang`): o mockup ainda não tem textos traduzidos.
3. Minha conta, Histórico de atividades e Sair só fecham o menu: não há telas para eles.
4. A pílula mantém o avatar (padrão atual do mockup); a referência usa o ícone de usuário.
5. O catálogo (`index.html`) continua só no tema claro; as telas embutidas nele seguem a escolha salva.

## Tweaks do fluxo de curso (06/11/2026)

Painel "Tweaks" no mockup (`js/shell/tweaks.js`, lista em `js/data/tweaks.js`), com os tweaks do protótipo `ludos-pro-fluxo`. O padrão
de cada um é o que a tela mostrava antes (às vezes diferente do padrão do protótipo), e a escolha vai para o endereço.

- **Curso:** estado, estados vazios, recomendados simples/completo (`sugestoes=regular`), "Sobre o curso" em cards na coluna ou no
  corpo (`sobre=corpo`).
- **Tabuleiro:** estado, Versão B da trilha (`trilha=b`: estrada em serpentina com fileiras de até 5 pins, cartão por módulo, sem
  cartão fixo nem troféus, como no protótipo), fundo com imagem, cor do fundo (4 tokens) e escurecer (0–80%). Sobre fundo escuro,
  imagem ou escurecer ≥ 45%, os textos que ficam direto no fundo passam a `--color-text-on-color`.
- **Atividades:** atividade aberta, desbloquear todas, menu em capa ou cards (`trilha=cards`), tipografia B (`tipografia=b`),
  conteúdo sem card (`card=0`) e Ordenadinho sem imagem de apoio (`apoio=0`). Trocar um tweak não perde o progresso.
- **Regulamentos:** regulamento único.

Divergências do protótipo, pela regra do design system: uma só cor (a da ação) em vez de uma cor por módulo na Versão B; pins
bloqueados em cinza; tipografia B levada à escala (a diferença para a A ficou pequena); tamanhos de 11 e 13px viraram 12/16.

## Entrega para o time de dev: filtro por curso de Gestores (04/11/2026)

- Em `entrega-dev/team-toolbar/`: barra de filtros com o filtro por curso, compondo o `app-toolbar` e o `app-filter-select` que o produto já tem (cartão "FILTROS" a partir de 1024; barra colada com botão e sheet "Curso" abaixo). Mesmo estado de antes: SCSS validado, sintaxe e imports relativos conferidos, nada compilado nem executado no Angular deles.
- Com isso a tela de Gestores está coberta (filtro por curso, lista de usuários, página do usuário e todas as seções). Falta ligar tudo no produto (rota, estado e API).
- Pontos em aberto: o sheet do mobile usa o `app-option-sheet` (o produto abre filtros por overlay com `app-filter-card`); a contagem do sheet mostra o total atual, não o do curso marcado antes de aplicar.

## Rota de aprendizagem (10/11/2026)

Fonte: Figma LP-DesignSystem 4.0, página "Rota" (frame 1440). Rota `#rota`, aberta pelos cards de rota da tela Cursos
(`kind: 'rota'`). Tela em `js/screens/learning-path.js`, dados em `js/data/learning-path.js`, estilos próprios em
`css/screens/learning-path.css`; o resto usa as classes da tela Curso (`c-cd-*`).

- **Desktop (1179+):** igual ao Curso: capa (só o selo "Novo", "Rota de aprendizagem" e o título), coluna lateral com o card da rota
  (sem botão: rota sequencial, nº de cursos, usuários, acesso, certificado, atualização e recompensas), "Sobre a rota" (Cursos e Tempo
  da rota) e Categorias. Abas Visão geral, Cursos e Certificado levam às seções.
- **Cursos da rota:** card "O que você verá nessa rota de aprendizagem" com o trilho à esquerda (check concluído, círculo atual, x
  bloqueado; linha `border/strong` até o curso atual e `border/default` depois) e o card do curso ("cardCourse" use=path: imagem 334
  16:9 com selos e prazo, duração e módulos, título, tags, autor, progresso e "Ir para o curso"). Curso bloqueado fica em tons de
  cinza e não abre (aviso); concluído mostra "Revisar curso".
- **A confirmar com design:**
  1. O Figma só tem o 1440. Abaixo de 1179 a tela segue o Curso mobile (abas de verdade, componentes mobile); o card do curso fica com
     a imagem em cima abaixo de 768 e ao lado a partir de 768.
  2. A seção Certificado não está desenhada: aqui é um card com o andamento ("x de 4 cursos concluídos") e o botão "Ver certificado"
     (bloqueado até concluir a rota).
  3. O card lateral do Figma não tem chamada (Iniciar/Continuar); mantive assim. Cada curso tem o próprio "Ir para o curso".

## Diálogo da avaliação no Curso e no Tabuleiro (10/11/2026)

Clicar numa avaliação (card "Avaliação" no Curso, pin com o ícone challenge no Tabuleiro) abre um diálogo central em dois
passos, em vez do detalhe da atividade: **apresentação** (a mesma da tela de Atividades: encerramento, performance mínima,
moedas, pontos e o aviso do tempo; Cancelar ou Iniciar avaliação) → **confirmação** (as regras e digitar "Iniciar"; Agora não
ou Começar avaliação). Começar leva a `#atividade?item=15&iniciar=1`, que abre a tela de Atividades já com a 1ª questão.
Componente: `js/components/exam-dialog.js` (a tela de Atividades usa as mesmas duas partes). Avaliação bloqueada continua sem abrir.

## Tabuleiro: pins Versão B (10/11/2026)

Tweak "Pins" (`#tabuleiro?pins=b`), vale para as duas trilhas: disco branco de 84 com sombra, miolo de 66 com o ícone do tipo
de atividade (leitura, quiz, jogo; avaliação = challenge; missão = target) e o número num selo escuro de 28 que passa 10 da
borda de baixo. Concluída: miolo dourado (`background/level`) com aro de 3 na cor da marca; atual: cor da marca (com o anel de
progresso do módulo); aberta: `surface/system-soft`; bloqueada: `background/muted` com o ícone em cinza. A missão do fim do
módulo não tem número. Tweak "Imagens nos pins" (`&imagens=1`): o miolo recebe uma imagem (cover; em cinza enquanto não abre);
as imagens de exemplo estão em `pinImages` (`js/data/board.js`). Na trilha A as linhas passam a 126 de altura (o pin B é maior).
