# Migração do app antigo (React + Tailwind) para HTML, CSS e JS puros

O código antigo está em `_legado/react-tailwind/src` (fora do git). Tamanho em linhas entre parênteses, como medida de esforço.
Ordem sugerida: primeiro o que as outras telas reaproveitam, depois as telas da mais simples para a mais complexa.

## Já portado

- [x] Base: tokens, base.css, runtime das telas (`createView`), ícones, mídia e utilitários.
- [x] Casca: app bar, busca mobile, menu lateral (com a rolagem acompanhando), navigation bar (esconde ao rolar), "Mais", menu top, menu header, abas e a sequência de montagem com skeleton.
- [x] Componentes: botão, ícone-botão, tag, pill, selo mobile, avatar, capa, painel (bottom sheet e drawer), rodapé de filtros, paginação, pílula com popover, menus de rádio e de categoria, chips de filtro.
- [x] **Cursos** (`Courses.tsx`, 479): abas, filtros em pílulas e em sheet (categoria em chips, tela cheia), cards grandes e compactos, skeleton, vazio, paginação e swipe entre abas.
- [x] **Biblioteca** (`Library.tsx`, 499): abas, filtros em pílulas e em sheet, seções, cards, favoritar, paginação e o detalhe do material (drawer e bottom sheet).

## A portar

Componentes que várias telas usam (fazer antes das telas):

- [x] `Mobile.tsx` e `MobileExtra.tsx`, parte dos cards e campos (`js/components/mobile.js`): cards da home (cursos, eventos, loja, certificados, missões, biblioteca, conquistas e news), pills mobile, tabs, text field e date picker, dropdown, ranking (item, pódio, card e options) e barra de progresso.
- [x] `Mobile.tsx` e `MobileExtra.tsx`, parte dos bottom sheets (`js/components/mobile-sheets.js`): missão (acordeão), loja, conquista (progresso, épica e concluída), certificado, biblioteca, ranking (histórico e informações), gestores, comentários (com estado vazio) e reações, mais a estrutura vazia. São folhas estáticas de 360; o conteúdo pode entrar no painel (`panel.js`).
- [ ] `Misc.tsx` (131): link, tooltip.
- [ ] Chip do catálogo (`Badges.tsx`), seletor de tema e gerador de cor primária (`theme.ts`, `ThemePicker.tsx`).

Telas:

- [x] Conquistas (`Achievements.tsx`, 191) e Certificados (`Certificates.tsx`, 176).
- [x] Missões (`Missions.tsx`, 289) e Ranking (`Ranking.tsx`, 240).
- [x] Loja (`Store.tsx`, 219), Feed (`Feed.tsx`, 228), Eventos (`Events.tsx`, 207) e FAQ (`Faq.tsx`, 91).
- [x] Extrato: sem código antigo, construído a partir das capturas do handoff (`js/screens/extract.js`).
- [x] Gestores (`Team.tsx`, 907): lista (tabela e cards), usuário, conteúdo navegável, certificados, missões e filtro por curso. A maior.
- [x] Passo a passo do PWA no iPhone (`InstallGuide.tsx`, 157).
- [ ] Home: ainda sem tela no Figma.
- [x] Menu do perfil na app bar (`js/components/profile-menu.js`, referência `design-ref/topbar-menu-ludospro.html`), com tema claro,
  escuro e do sistema e "Melhorar contraste" aplicados em todo o mockup (`js/core/appearance.js`, `css/tokens.css`).

Fluxo de curso (protótipo `Ludos Pro 4.0/ludos-pro-fluxo`, exportado do Claude Design; sem código antigo):

- [x] Seleção de Cursos: é a tela Cursos que já existia; os cards viraram links (rota de aprendizagem → `#rota`, curso com progresso
  → `#curso`, sem progresso → `#tabuleiro`).
- [x] Rota de aprendizagem (`js/screens/learning-path.js`, `#rota`, 10/11/2026): Figma LP-DesignSystem 4.0, página "Rota" (só 1440).
  Mesma montagem do Curso (capa, coluna lateral com o card da rota, "Sobre a rota" e Categorias, abas Visão geral, Cursos e Certificado)
  e a lista de cursos com o trilho em sequência. Tweak `#rota?estado=nao-iniciado|andamento|concluido`.
- [x] Curso (`js/screens/course-detail.js`, `#curso`), refeito em 10/11/2026 pelo Figma LP-DesignSystem 4.0, página "Curso Classica"
  (360, 768, 1179, 1180, 1366 e 1440). Abaixo de 1179: componentes mobile, app bar e navigation bar da casca, abas de verdade (Visão geral,
  Conteúdo, Materiais) e card do curso. A partir de 1179: capa larga com imagem desfocada, card do curso em coluna lateral sticky sobre a
  capa, abas com scroll-spy, acordeão de módulos, materiais (a seção de recomendados saiu em 10/11/2026). Clicar numa atividade abre a atividade (`#atividade?item=…`, `activityHref` em js/data/activity.js); sem drawer/sheet de detalhe desde 11/11/2026.
  Parâmetros: `#curso?estado=nao-iniciado|andamento|concluido`, `#curso?vazio=1`, `sobre` e, como no Tabuleiro, `fundo=imagem` e `escurecer=0-80`.
- [x] Tabuleiro (`js/screens/board.js`, `#tabuleiro`): Versão A refeita em 10/11/2026 pelo Figma LP-DesignSystem 4.0, página
  "Curso Ludica - Versao A" (360, 768, 1179, 1180, 1366 e 1440). Pins numerados em onda, estrelas, anel no pin atual, pin de conclusão
  por módulo, cartão do módulo preso no topo, separadores, botão de ir à atividade atual; o pin abre direto a atividade. Abaixo de 1179: abas
  Visão geral / Conteúdo (a trilha, aberta por padrão) / Materiais. A partir de 1179: coluna do curso (Visão geral, Descrição, Materiais)
  que recolhe. Versão B (`?trilha=b`) refeita no mesmo dia pelo Figma "Curso Ludica - Versao B" (768 a 1440): estrada em serpentina
  com os pins e o cartão de módulo da Versão A.
- [x] Atividades (`Atividade-Quiz-v2.dc.html` → `js/screens/activity.js` + `js/screens/activity/`, `#atividade`, `#atividade?item=<id>`):
  menu de atividades, barra de desempenho (tempo, sequência, vidas, pontos), 14 mecânicas, leitura e avaliação final.
  **Barra de desempenho no design system (17/11/2026):** saíram os chips e botões próprios da tela (`c-act-chip`, `c-act-close`);
  agora usa `progressBar` (novo em `progress.js`, a barra de 8 do DS com `role="progressbar"`), `pill` com contorno (tempo e
  sequência em cinza, tempo nos últimos 5s em vermelho, sequência > 1 em amarelo, pontos em system, "+ pts" em verde) e
  `buttonIcon` large com contorno para fechar e para guardar/mostrar a trilha. `pill` ganhou `html`, `className` e `attrs`;
  `buttonIcon` ganhou `action`, `className` e `attrs` (e `title` = rótulo).
  **Menu de atividades no design system (17/11/2026):** botões da capa (buscar, abrir/fechar a lista) = `buttonIcon` ghost
  (ícone em text-on-color sobre a capa escura); barra do curso = `progressBar`; contador do grupo ("0/12") = `pill` cinza; anel de
  andamento do item = `progressDonut` em 24px. No estilo "Cards" do menu, abrir/fechar = `buttonIcon` large e a barra =
  `progressBar`. `progressDonut` ganhou `{ size, ringId }`, usa pathLength 100 (dashoffset = 100 − valor) e esconde o
  preenchimento em 0%. O item da lista continua próprio da tela: o DS ainda não tem "button menu".
  **Busca e ícone da avaliação (17/11/2026):** novo componente `searchField` (`js/components/search.js` +
  `css/components/search.css`, página "Search" no catálogo), o "Search" da app bar: a app bar e a busca do menu de atividades
  usam o mesmo campo (no menu, com o fechar = `buttonIcon` small sem contorno). A avaliação final passou a usar o LP-Icon
  `challenge` (dois lápis cruzados) no menu e no diálogo da avaliação, como no Curso e no Tabuleiro.
  **Card de missão (17/11/2026):** no fim de cada módulo do menu, "Missão do módulo N" (ícone target), no mesmo card da
  avaliação. Bloqueado ("Conclua o módulo", cadeado) até todas as mecânicas do módulo terminarem; liberado ("Disponível", na cor
  da marca) abre `#missoes`, como o pin da missão no Tabuleiro. Limitação do mockup: as 16 mecânicas se repetem entre os módulos e
  o status é por mecânica, então ao concluir o módulo 1 todas as missões liberam juntas. Fora do estilo "Cards" do menu.
  **Mecânicas no design system (17/11/2026):** saíram `c-act-btn` e `c-act-pill`. Rodapé, diálogos (sair e avaliação) e as
  ações das mecânicas (dicas, Limpar, Recomeçar, Reembaralhar, Segure para espiar) usam `button` (primary/stroked; `size:
  'mobile'` nas linhas de indicadores); "Sair sem pontuar" virou stroked (o DS não tem botão de perigo). Indicadores usam `pill`
  (cinza, verde, vermelho, amarelo, system). `button` ganhou `href` (vira link) e `title`. Tipografia das mecânicas na escala
  do DS: títulos 20/32 (heading), avaliação e resultado 30/40 (display-sm), apoio 16/24; 18 fica só nas letras dos jogos
  (price 18/28). Continuam próprios da tela (sem equivalente no DS): teclado e letras da forca, cartas, peças, zonas de soltar,
  pontos de progresso (`c-act-dot`), selos de acerto (`c-act-badge`), alerta e o campo de confirmação da avaliação.
  **Coluna de conteúdo única (17/11/2026):** quiz, quiz com apoio e questão da avaliação viraram `c-act-card` com o cabeçalho
  padrão (antes 640/800 centralizados, pergunta centralizada); a coluna começa sempre no topo; texto corrido da Leitura em 720
  (era 768 nas citações); skeleton na largura da coluna. Regra completa em `design-system/HANDOFF.md`.
  **Feedback de acerto e erro (17/11/2026):** novo componente `feedback` (`js/components/feedback.js` +
  `css/components/feedback.css`, página "Feedback" no catálogo). Nem o catálogo nem o Figma (DS e página X.Mecânicas) tinham
  esse elemento, então ele foi montado com os fundamentos do DS: ícone Feather de 24 numa caixa de 40 (radius xl,
  background/default), título subtitle 16/24 bold na cor do status, texto body 14/20, cores fixas de status. Variantes `banner`
  (faixa do rodapé) e `inline` (This or that). Ícones: acerto check-circle, erro x-circle (antes alert-triangle, que é aviso),
  tempo esgotado clock. O conteúdo do rodapé agora alinha com a coluna de conteúdo (antes 1088, agora 1040 + respiro lateral).
  **Ícone da sequência (17/11/2026):** novo LP-Icon `flame` (Figma "LP-DesignSystem 4.0", componente `icons/LPIcons/flame`
  5204:1945 na página "-> mecanicas"; SVG em `assets/icons/lp/flame.svg`, gerado em `lp-icons.js`). Substitui o `trending-up`
  na pill de sequência da barra de desempenho.
  **Sequência em todas as mecânicas (17/11/2026):** antes só o Quiz e o This or that mexiam no `streak` (por isso parava em 4,
  depois dos dois quizzes). Agora acerto soma 1 e erro zera em todas as mecânicas de jogo, pelo helper `streakOn` de `flow.js`,
  junto da atualização que cada uma já fazia: palavra achada/seleção errada (caça-palavras), letra certa/errada (forca), par
  formado/não (memória), palavra certa/errada (misturadinho), conferir certo/errado (no lugar, ordenadinho), erro achado/toque
  fora (7 erros), troca que encaixa/não encaixa peça (quebra-cabeça; a dica não conta) e mosaico perfeito/não. Leitura,
  slideshow, enquetes e avaliação não mexem na sequência.
- Páginas internas: `js/app.js` liga `data-layout="focus"` (sem menu lateral, busca mobile e navigation bar; abaixo de 768 a tela traz o próprio cabeçalho).
- Sons das Atividades: `js/core/sound.js` (Web Audio, sem arquivos), os mesmos tons do protótipo, com liga/desliga na barra de desempenho
  (guardado no navegador, chave `lp-sound`).
- Fora: animação de pontos das Atividades, vídeo real, seletores dos tweaks (Versão B da trilha, fundo com imagem) e o modal "Baú desbloqueado".

Catálogo (páginas de documentação, em `index.html`):

- [x] Fundamentos (`Foundations.tsx`): cores, tipografia, espaçamento e raio, efeitos.
- [x] Componentes (`Components.tsx`): buttons (com badge e ícone), chips, tags, pills, avatar, link, pagination e tooltips, com os estados default, hover, pressed e disabled forçados por `data-state`.
- [x] Ícones (`IconsAndMobile.tsx`, parte dos ícones), com busca.
- [x] Produto (`Product.tsx`, `productData.ts`): mapa de produto, telas por área (com o estado de design de cada uma, guardado no navegador), layout e responsividade, e a Tela de Cursos (exemplo) em vários tamanhos.
- [x] Tema (`Theme.tsx`, `theme.ts`, `ThemePicker.tsx`): seletor de cor primária no menu lateral, cor primária e Figma vs gerador. A cor escolhida vale também no mockup (`app.html`).
- [x] Mobile (`MobileComponents.tsx`, `IconsAndMobile.tsx`): cards da home, tabs, text field (com date picker), dropdown, ranking e o inventário dos componentes do Figma.
- [x] Mobile: a página Bottom sheets. Pendentes no Figma: sheet de FAQ (a folha só mostra banners) e de filtros mobile (a Biblioteca e os Cursos já têm o sheet de filtros em `panel.js`).
- [ ] Visualizador de uma tela em vários tamanhos, em página inteira (`CoursesViewer.tsx`, 110). A página "Tela de Cursos (exemplo)" já mostra os tamanhos lado a lado.

## Pontos para decidir com o time

- Servir os módulos: `node serve.mjs` basta para o mockup; no Storybook cada função de componente vira uma story.
- Corte de 1024 (Gestores) e 1179/1180: o produto tem faixas diferentes (768 e 1280).
- Ícones: o Feather cobre o mockup; o produto usa o conjunto próprio (`@ludospro/icons`). O Feather agora segue o Figma (frame
  FeatherIcons, 198:4875): 257 ícones com traço de 1px em `assets/icons/feather`. Saíram os 30 que o Figma não tem (logos de marcas,
  git, divide, table, eye-off, film, user-check, user-x, align-center…), nenhum usado nas telas. Os 148 LP-Icons do Figma (frame LPIcons, 204:2795)
  já estão em `assets/icons/lp` e em `lpIcon()` (`js/core/lp-icons.js`). Falta conferir se batem com `@ludospro/icons` e exportar os ícones
  das mecânicas e de mídia (frames "Ludos Pro (Mecânicas)" e "Social").
- A proposta em Angular (`_legado/entrega-angular`) segue válida como referência de nomes e de estrutura para a fase 2.

- **"Mais" da navigation bar (11/11/2026, Figma "side menu mobile": 360 `5126:39076`, 768 `5106:127140`).** O "Mais" abre um
  card flutuante de 532 centralizado, 8 acima da base (cobre a navigation bar), raio 24, com o menu inteiro em seções (as
  mesmas do menu lateral: `menuSections` em js/shell/shell.js) e a página atual em `surface/system-strong`. Scrim claro com
  desfoque. No mobile o card tem 8 de margem lateral (344 em 360). Código em js/app.js (`moreMenu`) e css/app.css (`.c-more-menu`).

- **Tabuleiro: usabilidade (12/11/2026).** Sem o detalhe em drawer, o pin ganhou um cartão de detalhe no hover e no foco pelo
  teclado (tipo e duração, título e situação: concluída com as estrelas, disponível ou bloqueada e por quê), aberto para o
  lado com mais espaço (`pinTip` em js/screens/board.js, `.c-board-tip`). O pin atual mostra "Começar"/"Continuar" em cima
  (`.c-board-start`, balanço leve, sem animação com movimento reduzido). O "Continuar" da coluna do curso abre a atividade
  atual (`activityHref`) em vez da tela de Atividades genérica. Pins disponíveis crescem levemente no hover e no foco.

- **Tabuleiro: imagem de fundo por módulo (12/11/2026).** Tweak Fundo = "Imagem por módulo" (`#tabuleiro?fundo=modulos`).
  Cada módulo tem a própria imagem (`background` em `modules`, js/data/board.js); as camadas ficam empilhadas na camada fixa
  do fundo e a de cada módulo se revela com a rolagem: enquanto o separador (ou cartão, na trilha B) do módulo sobe de 90% a
  30% da altura da tela, a opacidade vai de 0 a 1 e a imagem assenta de 108% a 100% (`revealBackgrounds` em
  js/screens/board.js). A faixa acima do cartão fixo usa a imagem que domina a tela. Vale com o "Escurecer o fundo" e nas
  duas trilhas. Para trocar a imagem de um módulo, mude o `background` dele.
  **Envio das imagens (12/11/2026):** o painel Tweaks do Tabuleiro tem "Imagens dos módulos", com as 4 imagens (uma por
  módulo): miniatura, "Trocar" (escolhe o arquivo) e o X para voltar à padrão. A imagem é reduzida (até 1920 px, JPEG) e fica
  no localStorage do navegador (js/data/module-images.js); enviar uma imagem liga o fundo "Imagem por módulo" e "Restaurar
  padrão" tira as enviadas. No produto, isso vira um campo de imagem por módulo no cadastro do curso.

- **Tabuleiro: bottom sheet do pin no toque (12/11/2026).** Abaixo de 1179 (e em qualquer tela sem hover) tocar num pin abre
  um bottom sheet com o mesmo conteúdo do cartão de hover (tipo e duração, título, pontos e moedas, situação) e o botão
  "Iniciar atividade", "Iniciar avaliação" ou "Iniciar missão" ("Refazer …" se concluída; desabilitado quando bloqueada).
  Avaliação segue para o diálogo da avaliação; missão do fim do módulo vai para Missões. O "Começar/Continuar" em cima do pin
  atual continua indo direto. No desktop com mouse nada muda (hover + clique abre direto). `pinSheet` em js/screens/board.js.

- **Tabuleiro: coluna do curso fixa (12/11/2026, Figma "Curso Ludica - Versao 12/11", `5132:48443`).** No desktop a coluna
  do curso deixou de ser cards flutuantes: é uma coluna de 364 presa à direita, da app bar até a base, com rolagem própria
  (padding 16/24/24/16, borda à esquerda), com abas, card do curso, "Sobre o curso" e "Categorias" sem moldura de card. A
  trilha ocupa o resto (margem de 396 para a coluna e o botão de ocultar, preso 8 à esquerda dela). Ocultar: a coluna sai pela
  direita e a trilha volta ao centro (600ms). Em 1179 a coluna para acima da navigation bar. Os fundos por módulo continuam.
  O Figma pinta a coluna de branco puro; aqui ela usa `background/default` (#f8f8f8), porque não há token de branco.

- **Tabuleiro: pins em relevo (12/11/2026).** Os pins da Versão A viraram botões ovais em relevo (72×60; o atual 84×70; os de avaliação e prova são hexagonais, `c-board-pin--hex`): face na
  cor do estado (marca, `surface/system-soft` ou `background/muted`), espessura de 8 embaixo num tom mais escuro da mesma cor
  e sombra no chão; ao apertar, o pin afunda. Sem o aro branco. Números e ícones iguais. Os pins da Versão B não mudaram.

- **Curso: lista de atividades em linha do tempo (12/11/2026, tweak `#curso?lista=linha`, "Lista de atividades").** Variação
  da lista dentro do módulo: trilho vertical ligando as atividades (verde até a última concluída), marcador de 32 com a
  situação (check verde, play na cor da marca com halo, cadeado), linhas sem moldura (fundo só no hover), a atividade atual em
  destaque (fundo `surface/system-subtle`, borda `surface/system-soft` e o botão "Continuar"/"Iniciar avaliação"), tipo e
  duração em caixa alta pequena e pontos/moedas numa pílula (verde quando ganhos). No mobile a pílula desce para baixo do
  título. O padrão continua sendo os cards. `timelineRow` em js/screens/course-detail.js, `.c-cd-tl*` no CSS da tela.
  **Ajustes (12/11/2026):** sem o botão "Continuar" na linha; pílula de pontos e moedas sempre cinza (`background/subtle`, sem
  o verde nem o esmaecido); título alinhado ao texto do tipo ("Atividade 1", depois do ícone). Novo estado do curso "Todas
  liberadas" (`#curso?estado=liberado`): nenhuma concluída e todas abertas (marcador play em contorno na linha do tempo; nos
  cards, todas clicáveis).

- **Tabuleiro: layout moderno (12/11/2026, tweak Trilha → Layout = Moderno, `#tabuleiro?layout=moderno`).** Aproveita a
  largura da área: na trilha A a onda abre (`--wave-scale` 1,6 no tablet e de 1179 a 1365; 2,1 a partir de 1366) e a trilha
  ocupa a área toda; a partir do tablet cada pin tem o nome ao lado (tipo/duração e título, num cartão translúcido virado
  para o meio da trilha; as estrelas ficam do lado de fora), no lugar do cartão de hover; o cartão do módulo fica compacto
  (600) e translúcido; no desktop, a navegação dos módulos fica à esquerda (painel translúcido com cada módulo, andamento e
  barra; clicar rola até ele; de 1179 a 1365 só os números). No mobile o layout é o mesmo do clássico. `pinLabel` e
  `moduleNav` em js/screens/board.js, `.c-board--modern`, `.c-board-label` e `.c-board-mods` no CSS.
  **Hierarquia (12/11/2026):** no layout moderno a atividade atual é a maior, com um halo que pulsa, e ganha o cartão
  "Próxima atividade" ao lado (tipo/duração, título, pontos e moedas e o botão Continuar/Começar/Iniciar avaliação/Iniciar
  missão, que abre direto); concluídas a 92% e bloqueadas a 78%, esmaecidas. O "Continuar" flutuante sai. `.c-board-next`.

- **Tabuleiro: trilha Versão C (12/11/2026, `#tabuleiro?trilha=c`).** A estrada da Versão B (a trilha atual do produto), mais
  legível: nome da atividade (2 linhas) e estrelas embaixo de cada pin, com a atual em destaque; pins mais afastados (148 no
  desktop, 120 no mobile, 2 por fileira) e fileiras +52; setas no caminho entre os pins mostram o sentido de leitura (na cor da
  marca no trecho feito); o cartão do módulo tem barra de andamento, "x/N", estrelas ganhas e "Ver atividades"/"Ocultar". Só
  o módulo atual abre de início; os outros ficam recolhidos e a estrada passa reto por eles. `cardC`, `isModOpen` e o
  parâmetro `openMods` de `trailBLayout` em js/screens/board.js; `.c-board-clabel`, `.c-board-chev` e `.c-board-ccard` no CSS.
- **Rota: sem o card do certificado (12/11/2026).** Saiu a seção "Certificado" do desktop e a aba "Certificado" do mobile.
  **Ajustes da Versão C (12/11/2026):** sem os nomes embaixo dos pins; estrelas em cima do pin concluído, maiores (26/30/26)
  e com contorno escuro e halo claro para destacar do fundo; sem o anel de progresso no pin atual; estrada com a espessura do
  aro branco do pin B (9; sombra 13) e setas de 18; pins a 124 (desktop) / 104 (mobile) e +16 entre as fileiras.
  **Mais ajustes da Versão C (12/11/2026):** cartões dos módulos (e a navegação dos módulos do layout moderno) sem vidro fosco,
  em fundo sólido; módulos sempre abertos (saiu o "Ocultar"/"Ver atividades"); o cartão fica entre as duas descidas da estrada
  e ela entra por uma lateral dele, no meio da altura, e sai pela outra (curva de 44, ou 14 no mobile); progresso roxo da
  estrada com 3, a espessura do aro roxo do pin concluído; estrelas 25% menores (20/22) com contorno branco.
  **(12/11/2026, tarde):** saiu a navegação dos módulos à esquerda (layout moderno). Estrelas da Versão C com contorno branco
  (atrás do preenchimento, `paint-order`). Cartão do módulo da Versão C: "N atividades · tempo" (sem "Módulo X de Y") e, à
  direita, a barra de progresso do módulo da tela Curso (`c-cd-module__progress`, com o %), sem "x/N" nem as estrelas.

- **Tabuleiro: menu lateral "float" (12/11/2026, tweak Painel → Menu lateral = Versão float, `#tabuleiro?painel=float`).**
  No desktop, no lugar da coluna fixa: uma coluna de ícones (32, raio 8) presa à direita abaixo da app bar — Visão geral
  (info), Descrição (edit-2) e Materiais (file-text). Cada ícone abre o conteúdo num cartão flutuante de 330 ao lado dos
  ícones, por cima da trilha (os mesmos cards da coluna fixa, empilhados, com rolagem própria); o ícone ativo fica em
  `surface/system-light` e vira o "x" que fecha. Fechado, só os ícones ficam e a trilha usa a largura toda menos 56.
  `floatPanel` em js/screens/board.js, `.c-board-rail` e `.c-board-float` no CSS.

- **Tabuleiro: "Barra integrada" (13/11/2026, tweak Painel → Menu lateral = Barra integrada, `#tabuleiro?painel=barra`).**
  No desktop, sem coluna nem cartão flutuante: as informações do curso ficam numa barra de 64 em cima da trilha (até 1120 de
  largura), presa abaixo da app bar enquanto rola — Voltar (ícone), capa e nome do curso, barra de andamento com "%
  · x de N atividades", pílula de pontos e moedas, "Sobre o curso", "Materiais (N)" e o botão principal (Continuar/Iniciar).
  "Sobre o curso" (descrição, números, recursos, categorias) e "Materiais" abrem no navdrawer só quando pedidos. A trilha
  usa a largura toda. Abaixo de 1366 a pílula de pontos some; abaixo de 1280 os botões ficam só com o ícone. `hudBar` e
  `hudDrawer` em js/screens/board.js, `.c-board-hud` no CSS.

- **Tabuleiro: novo padrão (13/11/2026).** Sem parâmetros, `#tabuleiro` abre com trilha Versão C, pins Versão B com imagens,
  fundo "Imagem por módulo" (as 4 imagens dos módulos) e a barra integrada no lugar da coluna lateral. As outras opções
  continuam nos tweaks (e no endereço: `trilha=a`, `pins=a`, `imagens=0`, `fundo=cor`, `painel=fixo`, `painel=float`).

- Tabuleiro, tweak "Estado do curso" ganhou **Trilha liberada** (`#tabuleiro?estado=liberado`): nada concluído e todos os pins — atividades, avaliações, missões e a missão do fim do módulo — disponíveis em qualquer ordem. Novo status de pin `free` (`.c-board-pin--free`: visual do pin atual, no tamanho normal, sem anel nem "Começar"), sem cadeados no caminho, cartões dos módulos como "em andamento", cartão/sheet com "Disponível" e botão ativo.

- Dados de teste de textos longos (js/data/board.js e js/data/course-detail.js): o título do curso, o do módulo 1 e os das atividades 5, 8 e 10 têm 100 caracteres (com espaços e pontuação), para revisar quebras e cortes no Tabuleiro e na tela Curso.
- Rota de aprendizagem: o card do curso LGPD na lista usa `course.title` (de js/data/course-detail.js), então segue o título de 100 caracteres. O nome da própria rota não mudou.
- Tabuleiro, Versão C: as estrelas das atividades concluídas seguem a curva do pin. Ficam num arco centrado no pin (-23°, 0° e 23°, a 55px do centro), com as laterais mais baixas e inclinadas para fora.
- Tabuleiro, cartão do módulo (Versão C): a imagem fica centralizada na altura do título, tanto com 1 quanto com 2 linhas. O texto passou a fazer parte da grade (`display: contents`), e a barra de progresso continua alinhada com a linha "N atividades · tempo".
- Tabuleiro, cartão do hover do pin: ganhou o ícone do tipo (edit, challenge ou target, com 14px) antes de "Atividade N · X min", com o texto em caixa alta, como na lista da tela Curso. Título, pontos/moedas e situação ficam alinhados ao texto do tipo (recuo de 18px). Títulos com mais de 44 caracteres abrem o cartão com 320px de largura, em vez de 224px (`c-board-tip--wide`).
- Tabuleiro, barra integrada: "Sobre o curso" e "Materiais" abrem os cards soltos, sem a moldura do navdrawer (Figma 5149:53581 e 5154:53777). Os cards têm 400px de largura e ficam empilhados à direita, rolando juntos; o X é um botão quadrado de 36px à esquerda deles. Isso vem da nova opção `bare` do `panel()` (js/components/panel.js, `.c-panel__box--bare`), que mantém o fundo escuro, o Esc, a volta do foco ao botão e as animações de entrada e saída pela direita. O título "Materiais de apoio" voltou a aparecer no card.
- Tabuleiro, tweak "Desenho da trilha" ganhou a **Versão D**, horizontal (`#tabuleiro?trilha=d`). Os pins são os da Versão C, numa linha só, ligados por uma estrada reta com as setas (ou o cadeado) entre eles, e o espaço entre um módulo e outro é dobrado. A faixa rola para o lado e a roda do mouse também anda a trilha para os lados. Ela ocupa a largura da página, com meia tela de respiro antes do 1º pin e depois do último, então os dois ficam centralizados na página. O cartão de cada módulo fica em cima dos pins dele e gruda à esquerda enquanto o módulo passa. O fundo por módulo se revela com a rolagem horizontal, e o botão "ir para a atividade atual" vira uma seta lateral, fixa embaixo no meio. Funções: `trailDLayout`, `trailD`, `fitTrailD` e `scrollToCurrentD` (js/screens/board.js).
- Versão D: os cartões dos módulos têm a mesma largura dos da Versão C (578px em 1440; no mobile, a tela menos 16px de cada lado). Quando um módulo tem poucas atividades, a faixa dele é a largura do cartão, e o 1º pin do módulo seguinte só começa depois do fim desse cartão, com 40px de respiro. Assim os cartões não se encostam e o espaço entre os módulos cresce.
- Versão D: o cartão do módulo gruda no meio da tela (sticky com `--card-left` = (largura da tela - cartão) / 2). A faixa do cartão vai de meio cartão antes do 1º pin até meio cartão depois do último, então o cartão fica parado no centro enquanto os pins do módulo passam pelo meio, e o próximo cartão o empurra para fora. Entre os módulos, o 1º pin do seguinte começa só depois do fim dessa faixa, com 80px de respiro: 658px entre módulos no desktop, contra 140px entre os pins de um mesmo módulo.
- Versão D: a estrada fica centralizada na altura da área da trilha, entre a barra do curso (ou as abas, no mobile) e a base da tela. A altura do desenho é simétrica em volta da estrada (o dobro da distância até ela), e os cartões dos módulos descem junto, na mesma distância acima dos pins.
- Tabuleiro, tweak "Menu lateral" ganhou a 4ª opção **Dock recolhível** (`#tabuleiro?painel=dock`, desktop), para comparar com as outras três, que não mudaram. É um cartão de 296px preso no canto inferior esquerdo, com: anel com o %, nome do curso, "x de N atividades · tempo", pontos e moedas, a próxima atividade em destaque (abre direto, como o pin; no curso concluído vira o atalho para o certificado) e os botões "Sobre o curso" e "Materiais" (os mesmos cards soltos da barra integrada). Recolhe numa pílula com o anel e o nome. A trilha usa a largura toda. Funções `dockPanel` e ação `toggleDock` (js/screens/board.js); estilos `.c-board-dock*`.
- Dock recolhível: tirei o "Continuar/Começar" do tipo da próxima atividade (agora só "Atividade 6 · 9 min"), e a pílula de pontos e moedas foi para baixo do título e das informações, alinhada a eles.
- Dock recolhível: removi o bloco da próxima atividade (e os estilos dele). O cartão ficou com o anel, o curso, a pílula de pontos e moedas e os botões "Sobre o curso" e "Materiais".
- Barra integrada: a barra do curso deixou de ficar presa (sticky) e rola com a página; a faixa que cobria o vão até a app bar saiu. "Sobre o curso" e "Materiais" voltaram a abrir no navdrawer (com cabeçalho e X), com os cards atuais; o título duplicado do card de Materiais volta a ficar escondido. A opção `bare` do `panel()` continua no componente, sem uso. Na Versão C, um trecho da estrada (caminho branco com sombra e o progresso roxo, se o curso começou) liga o meio da barra ao 1º cartão de módulo: `.c-board-hudlink`, com a altura medida em `linkHud()` (`--hud-gap`) e 32px a mais de respiro entre a barra e o cartão.
- Dock recolhível aberto: "Sobre o curso" e "Materiais" viraram abas (role tablist/tab/tabpanel; setas esquerda e direita trocam a aba) e o conteúdo que abria no navdrawer agora aparece dentro do dock, rolando por dentro. O dock vai do topo (abaixo da app bar) até a base, com 300px de largura. O anel virou a barra de progresso do cartão de módulo (`c-cd-module__progress`). O botão de recolher saiu do cartão e fica à direita do topo. Pontos e moedas do card do curso ficam empilhados para caber. O dock fechado (pílula com o anel) não mudou.
- Dock recolhível aberto, novo conteúdo:
  - **Abas:** "Sobre o curso" e "Materiais" são os botões de aba do design system (`c-button-badge`, como na Coluna fixa), sem moldura.
  - **Topo:** capa do curso em cima, título inteiro (sem reticências), "N módulos · tempo" e, embaixo, o progresso do card do curso ("Progresso 24%", a barra e "x de N atividades concluídas"). Saíram a barra pequena com o % e a pílula de pontos e moedas.
  - **Aba "Sobre o curso":** o card do curso fica sem a capa, o progresso, o botão Continuar e a moldura, com as informações na largura toda.
  - **Código:** `summary(d, { cover, progress, cta })` em js/screens/course-detail.js ganhou opções (padrão: tudo ligado, então a tela Curso não muda) e o bloco de progresso foi exportado como `courseProgress()`.
- Dock recolhível: o cartão aberto rola por inteiro (capa, título, progresso, abas e conteúdo), não só a área da aba. Em Materiais o card saiu (sem moldura nem respiro), e a lista usa a largura toda. O botão de abrir e recolher virou um círculo de 36px sobreposto à borda de cima do dock, metade para fora, à direita, nos dois estados: aberto, com seta para baixo; fechado, sobre a pílula, com seta para cima, e a seta da pílula saiu. O dock aberto começa 32px abaixo da app bar, para caber o botão.
- Dock recolhível:
  - **Botão circular:** fica no meio da borda de cima, aberto e fechado.
  - **Posição:** o dock aberto fica preso embaixo, como a pílula, e cresce para cima até o limite abaixo da app bar.
  - **Animação nova:** ao abrir, a pílula some (120ms) e o cartão cresce a partir do lugar e do tamanho dela, com um recorte `clip-path` da pílula até o cartão (340ms, desacelerando); o conteúdo sobe e aparece logo depois, e o círculo surge no topo. Ao recolher, é o inverso: conteúdo e círculo somem e o cartão encolhe até a pílula (260ms, acelerando); então a pílula aparece. A troca de estado espera a animação (`toggleDock`). Com movimento reduzido, a troca é direta.
- Dock recolhível:
  - **Pílula de pontos e moedas:** voltou, entre o progresso do curso e as abas.
  - **Aba "Sobre o curso":** saíram os infocards de pontos e moedas disponíveis (nova opção `rewards` em `summary()`; padrão ligado, a tela Curso não muda). Os blocos Sobre o curso, Descrição e Categorias ficaram sem moldura, como o card do curso e Materiais, usando a largura toda, com uma linha fina (border-subtle) e 16px separando um bloco do outro.
- Dock recolhível: a pílula de pontos e moedas e as abas Sobre o curso / Materiais ficam centralizadas no cartão; o resto continua alinhado à esquerda.
- Dock recolhível: barra de rolagem como a dos navdrawers do Figma: trilho fino e arredondado (background/muted), polegar mais escuro (background/skeleton), sem setas, recuada 16px do topo e da base. Ela ocupa o respiro da direita (padding 2 + 14 da barra, com `scrollbar-gutter: stable`), então o conteúdo fica com o mesmo respiro dos dois lados e a pílula e as abas ficam no meio exato do cartão. No Firefox, barra fina nas mesmas cores.
- Tabuleiro no mobile e tablet: o "Voltar" fica preso logo abaixo da app bar. A trilha abre já rolada até a atividade atual e ele sumia junto com a rolagem. As abas Visão geral / Conteúdo / Materiais ficam presas logo abaixo dele (+40px), e as contas de centralização da trilha no mobile passaram a descontar essa faixa.
- Dock recolhível:
  - **Botão de abrir e recolher:** menor (círculo de 28px, seta de 14px), com hover (fundo e borda da marca suaves), clique (fundo surface/system-light e um leve afundar) e foco visível.
  - **Nova animação, sem crescer nem encolher o cartão:** ao abrir, o cartão aparece e os elementos entram um a um (capa, título, módulos e tempo, progresso, pontos e moedas, abas e conteúdo), subindo 12px, com 45ms entre um e outro (`style="--i:n"` no HTML). Ao recolher, saem na ordem inversa e o cartão some por último; então a pílula entra subindo, também sem escala.
- Tabuleiro: as 4 imagens de fundo enviadas pelo painel Tweaks viraram as padrão dos módulos. Estão em assets/fluxo/modulos/modulo-1.jpg a modulo-4.jpg (JPEG de 1920px, as mesmas gravadas no navegador) e entram no `background` de cada módulo em js/data/board.js. Uma imagem nova enviada pelo painel continua tendo prioridade naquele navegador; "remover" volta para estas.
- Tabuleiro, Versão C com a barra integrada (desktop): o cartão do módulo tem 68% da largura da barra do curso (32% menor; 762 de 1120px). Como o cartão fica entre as descidas da estrada, a trilha passa a ter a largura que dá esse cartão (`trailWidthForCard` em `measureTrailB`; 1018px em vez de 832px), e os pins de cada fileira ficam mais espaçados. Nos outros menus laterais continua o máximo de 832px.
- Tabuleiro, barra integrada + Versão C: a ligação entre a barra do curso e o 1º cartão de módulo saiu do meio e foi para a lateral direita, no mesmo desenho da estrada. Ela desce de baixo da barra na linha da descida da direita e faz a curva (raio 44px) para entrar no meio da lateral direita do cartão. O desenho é feito em `linkHud()` com o vão e a altura do cartão medidos.
- Ligação barra do curso → 1º módulo: o caminho agora sai do meio da lateral direita da barra do curso. Ele faz a curva para baixo numa coluna logo depois da barra (raio + 12px, sem passar da borda da tela), desce e faz a outra curva para entrar no meio da lateral direita do cartão. O desenho é refeito também ao redimensionar a janela.
- Barra integrada + Versão C: a barra do curso deixa 72px livres de cada lado (largura `min(100% - 144px, 1120px)`), para o caminho sempre sair da lateral direita dela, mesmo em telas de desktop estreitas. Antes, nessas telas, o caminho parecia sair de baixo da barra. O cartão do módulo continua com 68% da barra.
- Barra integrada (card do curso na trilha): removida a pílula de pontos e moedas. Os pontos e moedas seguem em "Sobre o curso". O título do curso ganhou o espaço e agora cabe inteiro em 1440px.
- Correção da ligação barra do curso → 1º módulo: a coluna do caminho fica sempre ao lado da barra (sem a trava pela largura da tela, que podia jogá-la para baixo da barra), e `linkHud()` é refeita por um ResizeObserver sempre que a barra, a trilha ou a área mudam de tamanho (janela redimensionada, barra de rolagem, fontes), não só quando a tela é redesenhada.
- "Sobre o curso" (cards Módulos, Atividades e Tempo do curso, `.c-cd-boxes`): o espaço entre as colunas passou de 16px para 8px, igual ao espaço entre as linhas, como no Figma (5149:53581). Vale para o Tabuleiro (Dock e navdrawer) e para a tela Curso.
- Página Curso:
  - **Novo padrão:** fundo com imagem e lista de atividades em linha do tempo (`#curso` sem parâmetros); `?fundo=cor` e `?lista=cards` continuam como tweaks.
  - **Tweak removido:** "Sobre o curso no desktop" (seção Layout). "Sobre o curso" e "Categorias" ficam sempre nos cards da coluna lateral. A lista de atividades foi para a seção "Lista".
  - **Fundo:** novo tweak "Imagem do fundo" (tipo images) para trocar a imagem. O padrão é a imagem do 1º módulo do Tabuleiro (assets/fluxo/modulos/modulo-1.jpg); a enviada fica no navegador com o prefixo `lp-curso-bg` e "remover" volta à padrão.
  - **Código:** js/data/module-images.js passou a aceitar um prefixo de armazenamento (`store`), e o painel usa o `store` e o `fundo` de cada tweak de imagens; o Tabuleiro segue no prefixo padrão.
- Tela de atividades, menu de atividades: divisores de módulo entre os grupos. Cada divisor é uma etiqueta "MÓDULO N · nome" (rótulo em caixa alta na cor da marca e o nome em text/secondary, em fundo surface/system-subtle) entre duas linhas finas. Os módulos estão em `activityModules` (js/data/activity.js): Módulo 1 Conceitos básicos (Introdução e Fixação), Módulo 2 Aplicação (Prática e Sua opinião) e Módulo 3 Conclusão (Encerramento). A avaliação final continua no card do fim. Estilos `.c-act-module*`.
- Menu de atividades, divisores de módulo (novo formato): bloco de duas linhas alinhado à esquerda. Em cima, "MÓDULO N" (caixa alta, cor da marca) • tempo do módulo; embaixo, o título do módulo (14/20 700, até 2 linhas). Uma linha fina separa um módulo do anterior. Os nomes e tempos vêm dos 4 módulos do curso (js/data/board.js): Fundamentos da LGPD (1h 25min), Bases legais e consentimento (29 min), Direitos do titular (31 min) e Segurança e resposta a incidentes (39 min). Os grupos ficam distribuídos assim: Introdução e Fixação; Prática; Sua opinião; Encerramento.
- Menu do perfil (topbar): nova seção "Sons da plataforma" antes de "Tema", com a chave liga/desliga dos efeitos sonoros das atividades ("Ligados"/"Desligados") e uma linha de ajuda. Usa a mesma preferência de antes (`lp-sound`, js/core/sound.js) e toca um clique ao ligar. O botão de som saiu da barra de desempenho da tela de atividade.
- Menu de atividades: a numeração "Atividade N" dos grupos recomeça em 1 a cada módulo, calculada pela posição do grupo dentro do módulo (em `groups()`, js/screens/activity/parts.js); o `label` dos dados só vale para grupos sem módulo.
- Curso LGPD com 12, 6, 3 e 3 atividades por módulo (24 no total). O módulo 2 ganhou 3 atividades antes da avaliação ("Consentimento livre, informado e inequívoco", "Legítimo interesse ou consentimento?" e "Ligue a base legal ao caso"; o módulo passa de 29 para 49 min), em js/data/board.js e js/data/course-detail.js, então Tabuleiro (24 pins) e Curso acompanham.
- Menu de atividades: segue os módulos do curso. Cada atividade do curso é um grupo ("Atividade N", numeração por módulo, e o título, até 2 linhas) com a mecânica de exemplo que ela abre (a mesma de `activityHref`; com 15 mecânicas, algumas se repetem). `activityGroups` e `activityModules` são gerados a partir de js/data/board.js. A avaliação final segue no card do fim.
- Menu de atividades: cada atividade do curso é um conjunto de 1 a N mecânicas (`MECHANICS_PER_ACTIVITY` em js/data/activity.js). A 1ª tem 12; as demais variam de 1 a 6 (3, 1, 4, 2, 5…). As mecânicas do mockup são distribuídas em sequência, sem repetir dentro da mesma atividade. `activityHref(n)` (Tabuleiro e Curso) abre a 1ª mecânica da atividade.

- **Atividades: card do curso no menu**: usa o título e a capa da página Curso (`activityCourse` lê `course` de
  `js/data/course-detail.js`). Linha de cima "Curso", embaixo o nome em até 3 linhas com reticências. A capa fica à direita em
  16:9 na altura atual do card, sob o mesmo véu do banner da página Curso (escuro com transparência + blur 8px, espelhado).

- **Atividades sem app bar**: ao entrar em `#atividade` a app bar sobe e some (600ms ease-in-out) e a tela sobe junto; ao sair,
  ela volta. `js/app.js` liga `data-hide-topbar` no `#shell`; `css/shell.css` registra `--topbar-height` com `@property` e a
  anima até 0 (só ≥768; no mobile a app bar já não aparece no foco). Respeita `prefers-reduced-motion`.

- **Atividades: card do curso em 16:9**: a altura sai da largura (`aspect-ratio: 16 / 9`); os botões de recolher e buscar ficam
  no canto superior, por cima, e o texto embaixo (título 20/28 em até 3 linhas; barra e "% concluído" na mesma linha). A busca
  aberta mantém a altura própria.

- **Atividades: barra de rolagem do dock**: o menu lateral (`.c-act-trail__list`, `.c-act-tcards__list`) e o corpo da atividade
  (a página, via `html:has(.c-act)`) usam a mesma barra do dock do Tabuleiro: trilho muted arredondado, polegar skeleton, sem
  setas, recuo de 16px no topo e na base (fim de `css/screens/activity.css`).

- **Atividades: animação do "+ pts"**: ao concluir, a pílula de pontos ganhos entra abrindo espaço (pontos, corações e
  sequência deslizam para a esquerda, 400ms), fica 2000ms e sai fechando o espaço (eles voltam para a direita). Na saída, o
  número da pílula de pontos gira dígito a dígito até o total novo (anterior + ganho). Código em
  `js/screens/activity/gain.js` (Web Animations; sem animação com `prefers-reduced-motion`).

- **Atividades: tipografia do card do curso**: "Curso" 10/16, título 14/20 700 em branco (`--color-text-on-color`) e a
  porcentagem só com o número (0–100%) em 12px, sem "concluído" (o leitor de tela ainda ouve "N% concluído").

- **Atividades: conteúdo sem card é o padrão**: as mecânicas abrem sempre no layout sem card (`c-act--flat`) e o tweak
  "Conteúdo em card" (`card=0`) saiu do painel. `state.tw.card` fica fixo em `false` em `js/screens/activity.js`.

- **Atividades: botões no padrão do design system**: `.c-act-btn` (Continuar, Confirmar, diálogos, avaliação) passa a ter as
  medidas do `.c-button`: padding 10/12 (40px), 14/20 700, raio 12, sem altura e largura mínima fixas; desabilitado e stroked
  com os estados do DS. As variantes verde/vermelha saíram (viram o primário); o acerto e o erro ficam na faixa de feedback.

- **Atividades: área das mecânicas em branco**: novo token `--color-surface-stage` (`#ffffff` no claro; no escuro, o fundo
  da página `#211c29`) em `css/tokens.css`, usado na coluna principal, na faixa atrás da barra de desempenho e no rodapé. O
  menu lateral continua em `background-default` (#f8f8f8). Confirmar com design se o token entra no Figma.

- **Atividades: área das mecânicas em branco**: novo token `--color-surface-stage` (`#ffffff` no claro; no escuro, o fundo
  da página `#211c29`) em `css/tokens.css`, usado na coluna principal, na faixa atrás da barra de desempenho e no rodapé. O
  menu lateral continua em `background-default` (#f8f8f8). Confirmar com design se o token entra no Figma.

- **Atividades: respiro do rodapé**: 24px acima e abaixo do botão em todas as larguras (altura mínima do rodapé 90px =
  24 + 42 + 24; antes 96px no desktop, 27px de cada lado, e 80px no mobile, 19px).

- **Atividades: quiz com imagem e texto de apoio (id 17)**: logo depois do quiz de aquecimento, na trilha. Mesmo
  funcionamento do quiz (20s por pergunta, teclas 1–4, acerto/erro no rodapé, vidas, sequência); antes de cada pergunta,
  uma imagem 16:9 e um texto de apoio no formato do Slideshow ("Pergunta N de 3", título e parágrafo). `quiz.js` virou o
  modelo `makeQuiz` usado pelos dois; dados em `quizSupport` (`js/data/activity.js`).

- **Figma: layouts da página de Atividades (1440)**: no arquivo LP-DesignSystem 4.0, página "-> mecanicas" (node 5180:6388),
  uma tela por mecânica (17: Quiz, Quiz com apoio, Leitura, Slideshow, Caça-palavras, Emparedado, Memória, Misturadinho,
  No lugar, Ordenadinho, Quebra-cabeça, 7 erros, This or that, Enquete, Enquete aberta, Mosaico, Avaliação), no estado
  inicial e com "Desbloquear todas". Gerados a partir do mockup renderizado: camadas editáveis com auto layout onde o HTML é
  flex, cores ligadas às variáveis "Colors" (modo Light), estilos de texto `type/*` quando o tamanho bate com a escala, ícones
  como instâncias dos Feather do DS e o botão do rodapé como instância do `button` (filled). As imagens ficam no quadro
  oculto "_assets" da mesma página. Menu lateral, barra de desempenho e rodapé ainda não são componentes.

### Atividades: cabeçalho único das mecânicas

- Todas as mecânicas (Quiz, Quiz com apoio, Leitura, Slideshow, Caça-palavras, Emparedado, Memória, Misturadinho, No lugar,
  Ordenadinho, Quebra-cabeça, 7 erros, This or that, Enquete, Enquete aberta, Mosaico e as questões da Avaliação) usam o mesmo
  cabeçalho, `head()` em `js/screens/activity/head.js`:
  - linha de cima (sempre 32px): instrução à esquerda (14/20 600, texto secundário), com o progresso na frente quando houver
    ("Pergunta 1 de 3 · Escolha uma alternativa"); contadores (pills) e ações (Dica, Recomeçar) à direita;
  - título abaixo: a pergunta ou o desafio, heading 20/32 700.
- Saíram as variações: instrução abaixo do título (Enquete), pills numa linha própria acima (This or that) ou abaixo (Emparedado),
  barra sem título (Caça-palavras e Misturadinho) e o meta com relógio da Leitura/Slideshow (agora "Leitura de 5 min · …").
- Caça-palavras ganhou título ("Encontre as 5 palavras ocultas"); no Misturadinho, o título é a própria frase com as lacunas.
- Quiz com apoio: o kicker do bloco de apoio virou "Texto de apoio"; "Pergunta N de M" fica só no cabeçalho da pergunta.
- Leitura e Slideshow: o título do texto passou de 30/40 para o heading 20/32 do modelo único.
- Subtítulos dentro da Leitura (`.c-act-read__h`) também ficam no heading 20/32 700 em todas as larguras (antes iam a 30/40 a
  partir de 768 e ficariam maiores que o título da atividade).

### Atividades: coluna de conteúdo mais estreita

- A coluna das mecânicas passou de 1040px para 792px (−24%, arredondado ao múltiplo de 4), na variável `--act-col` de
  `.c-act`. A barra de desempenho, o rodapé e os skeletons usam a mesma variável e continuam alinhados à coluna.

### Atividades: alternativas do Quiz e da Enquete pelo Figma

- Alternativas do Quiz, do Quiz com apoio, das questões da Avaliação e da Enquete seguem o componente `c-act-option` do Figma
  (LP-DesignSystem 4.0, node 5208:1948): fundo `--color-background-default`, borda 1px `--color-border-default`, raio 12,
  padding 16/20, gap 16; letra (A, B, C…) à esquerda num círculo de 24px com borda (body-medium 14/20 500, texto secundário);
  texto 16/24 400 primário.
- O número à direita do Quiz saiu; ao responder, o círculo da letra vira o ícone de certo/errado (24px). Selecionada: círculo
  preenchido com `--color-action`. As teclas 1–4 continuam valendo e A–D passaram a valer também no Quiz e na Avaliação.
- Enquete: mesma caixa, letra e texto (antes círculo de 36px com borda de 2px e texto 600); a barra e o percentual do
  resultado continuam iguais.

### Atividades: apresentação antes da mecânica

- Novo passo entre o clique no card da atividade (Curso, Tabuleiro, link `#atividade?item=N`) e a mecânica, pelo Figma
  (LP-DesignSystem 4.0, node 5213:1953): `js/screens/activity/intro.js`, textos em `intros` de `js/data/activity.js`.
  - App bar visível; menu de atividades e barra de desempenho escondidos.
  - Coluna de 640px centralizada na altura livre: kicker "Atividade N" (12/16 700, `--color-text-brand`, espaçamento 1px),
    título 30/40 800 (24/32 abaixo de 768) e parágrafos 16/28 400 (`--color-text-default`), gap 16.
  - X no canto superior direito (buttonIcon large com contorno, a partir de 768) volta ao Curso sem diálogo; abaixo de 768
    fica o "Voltar" do cabeçalho mobile.
  - Rodapé com "Iniciar" (Enter também inicia). Ao iniciar, a app bar sobe e o menu (abre da esquerda) e a barra de
    desempenho (desce) entram juntos em 600ms ease-in-out; respeita `prefers-reduced-motion`.
- Os relógios (cronômetro do quiz, tempo decorrido) só começam depois de "Iniciar".
- Quem esconde a app bar agora é a tela de Atividades (no render, fora da apresentação); `js/app.js` só a reexibe nas outras telas.
- Trocar de atividade pelo menu vai direto para a mecânica. A Avaliação final não tem esse passo (já tem a própria tela de
  informações e a confirmação).

### Curso: seta do card de atividade

- No card de atividade da trilha do Curso (`.c-cd-tl__go`), o ícone play-circle virou chevron-right (20px).

### Curso: divisórias nos materiais de apoio

- Voltou a divisória de 1px (`--color-border-default`) entre os itens de "Materiais de apoio" (`.c-cd-materials > li + li`),
  com 8px de espaço acima e abaixo da linha.

### Curso: kicker das atividades sem caixa alta

- No kicker da trilha (`.c-cd-tl__kicker`) saíram `text-transform: uppercase` e o espaçamento de letras: fica "Atividade 1 · 8 min",
  como no módulo.
- Ordem invertida na linha da trilha: título em cima (`.c-cd-tl__head`, com o ícone do tipo à esquerda, na mesma posição de
  antes) e as informações embaixo ("Atividade 1 · 8 min" e estrelas), alinhadas ao texto do título (recuo de 18px).
- Título das atividades concluídas na trilha com a mesma cor das liberadas (`--color-text-default`); o peso 600 continua.
- Título das atividades concluídas e liberadas igual ao da em andamento: 14/20 700 `--color-text-primary` (só as bloqueadas
  ficam em `--color-text-tertiary`).

### Tabuleiro: dock recolhido vira FAB; "Sobre" e "Tempo de conteúdo"

- Dock (tweak painel=dock) recolhido: só um FAB de 56px com o anel de progresso (44px, % no centro). Saíram o nome do curso,
  a seta e o botão circular de cima; o nome fica no rótulo acessível ("Mostrar o curso … (21% concluído)") e um clique abre o dock.
- Aba do dock "Sobre o curso" → "Sobre". Na aba, o conjunto de cards (Módulos, Atividades e tempo) aparece sem o título
  "Sobre o curso" (`sideAboutCourse(d, { title: false })`; no Curso e no drawer da barra integrada o título continua).
- Card de tempo: "Tempo do curso" → "Tempo de conteúdo" (em todos os lugares que usam esses cards: Curso, Tabuleiro e mobile).
- Dock (Versão C, desktop): a trilha usa a mesma largura da barra integrada — calcula a largura que a barra teria
  (área − 144, até 1120) e dá ao cartão do módulo 68% dela (`measureTrailB`). Pins com o mesmo espaçamento (164px em 1254,
  177px em 1440) e cartão do módulo do mesmo tamanho (712 e 762px) nas duas versões.
- Trilha Versão C (horizontal, desktop e tablet): distância entre as fileiras de pins 50% maior, de 132 para 198px
  (`step` em `trailBLayout`). A Versão B e a trilha vertical do mobile não mudam.
- Dock no canto superior direito (abaixo da app bar, a 24 da borda): o FAB recolhido e o cartão aberto. Aberto, o cartão empurra
  a trilha para o lado (`.is-dock-open` abre 348px à direita; `DOCK_PUSH` em board.js). A largura da trilha continua calculada
  como na barra integrada, mas limitada ao espaço livre: em 1440 os pins mantêm 177px; em 1254 com o dock aberto a trilha se
  ajusta ao espaço (132px entre pins, cartão do módulo de 587). O botão de recolher passou a ser chevron-up.
- Dock aberto: o botão de recolher (chevron-up) passou para o meio da borda de baixo do cartão. O cartão tem a altura do
  conteúdo, até a base da tela (rola por dentro).
- Abrir e recolher o dock anima a trilha: ela desliza para a esquerda (aberto) ou volta ao centro (recolhido) em 600ms
  ease-in-out (FLIP em `toggleDock`: mede antes e depois do render e anima a diferença; sem animação com movimento reduzido).
- Dock: recolher encolhe o cartão para cima, até o canto superior direito (onde fica o FAB), com os elementos saindo para
  cima (clip-path, 300ms); abrir faz o inverso, o cartão cresce para baixo a partir do FAB. O FAB entra com fade e escala.

### Tabuleiro: cartão de hover do pin igual à linha de atividade do Curso

- O cartão que aparece no hover (e no foco) do pin usa os elementos da trilha do Curso: título 14/20 700 com o ícone do tipo à
  esquerda; embaixo "Atividade N · X min" (11/14 600, sem caixa alta) com as estrelas da atividade concluída; a pílula de pontos
  e moedas (`.c-cd-tl__rewards`); e a situação (Concluída, Disponível…). `earnedStars` passou a ser exportado de course-detail.js.
  O bottom sheet do toque (mobile e tablet) não mudou.
- Cartão de hover do pin: sem as estrelas. Pin bloqueado (`.c-board-tip--locked`): título, ícone e "Atividade N · X min" em
  `--color-text-tertiary`, como a atividade bloqueada na trilha do Curso (a pílula de pontos e moedas não muda).

### Tabuleiro: Dock recolhível é o menu lateral padrão (17/11/2026)

- `#tabuleiro` sem parâmetro abre o **Dock recolhível** (antes, a Barra integrada). O tweak "Menu lateral" começa no Dock, que é
  a primeira opção da lista; as outras continuam em `?painel=barra`, `?painel=fixo` e `?painel=float`. Mudança em
  `looksFromHash` (js/screens/board.js) e no `default` do tweak (js/data/tweaks.js).

### Rota de aprendizagem: card do curso com miniatura (17/11/2026)

- A imagem do card (`.c-lp-course__media`) virou uma miniatura **16:9** de largura fixa: **240×135** no desktop (antes 334) e
  **200×112,5** no tablet (antes 45%, até 334), recuada dentro do card (16px no desktop, 8px no tablet; raio 8 e 6). O card
  continua com a largura toda da coluna, e o corpo ganhou o espaço.
- **Altura do card = imagem + o mesmo respiro em cima e embaixo:** 167px + borda no desktop (antes 216) e 129px + borda no
  tablet. O corpo usa o mesmo padding da imagem e distribui o conteúdo na altura dela: dados no topo, progresso e link na linha
  de baixo (`justify-content: space-between`).
- Para caber, a 1ª linha do corpo (`.c-lp-course__top`) junta os selos (Novo, Sugerido, Obrigatório) à esquerda e o tempo e os
  módulos à direita. Os selos saíram de cima da imagem; nela só fica o selo de prazo. Espaços internos: 4px entre a linha de
  cima, o título e as tags.
- No desktop os selos mostram **só o ícone** (`pill({ iconOnly: true })`), com o nome no `title` (dica ao passar o mouse) e no
  `aria-label` (`role="img"`). Com o rótulo, os três selos não cabiam na linha do tempo em 1180. No mobile e no tablet continuam
  os selos pequenos com rótulo.
- Se ainda faltar largura para a linha de cima, ela quebra e o card cresce; a imagem fica centralizada na altura, então o
  respiro em cima e embaixo continua igual.
- Título no desktop: `min-height` passou de 48 para 40px (duas linhas de 20). Com 48, o topo da 3ª linha aparecia abaixo das
  reticências.
- No mobile (360) o card continua em coluna, com a imagem 16:9 em cima; os selos foram para a linha do tempo.
- "Ir para o curso" / "Revisar curso" passou a usar o componente **Link small** do design system (`c-text-link
  c-text-link--small`: caption-bold 12/16, cor `--color-text-brand`, seta de 18) em todas as larguras. Antes era um link próprio
  no tamanho large (14/20 extrabold) no desktop. No curso bloqueado ele fica na cor de desabilitado, e o clique continua
  avisando por que está bloqueado.

### Rota de aprendizagem: trilho dos cursos igual ao das atividades do Curso (17/11/2026)

- O trilho ao lado dos cards (`.c-lp-route__rail`) segue a linha do tempo de atividades da tela Curso (`.c-cd-tl`):
  - traço de 2px: verde (`--color-icon-success`) até o curso atual e `--color-border-default` depois dele;
  - marcador de 20px (`.c-lp-route__node`): concluído com borda e check verdes sobre `--color-background-success`; atual
    cheio na cor da marca (`--color-surface-system-default`) com halo de 3px (`--color-surface-system-light`); bloqueado com
    borda cinza e cadeado. Antes eram os ícones de traço `check-circle`, `circle` e `x-circle`, num traço de 1px.
- A coluna do trilho passou de 24 para 20px (o card ganhou 4px).
- O marcador fica no meio exato do card: os 8px entre os cards são divididos em 4 + 4, e o trilho avança sobre eles (antes o
  marcador ficava 4px acima do centro).

### Rota de aprendizagem: o card do curso é o link (18/11/2026)

- Saíram os links "Ir para o curso" e "Revisar curso". O **card inteiro** é o link para o Curso (`<a class="c-lp-course"
  href="#curso">`, com o nome e a situação no `aria-label`), e um **chevron-right** de 20px em `--color-icon-default`
  (`.c-lp-course__go`) no fim da linha do progresso indica a ação.
- Estados (mesmo padrão do card de atividade do Curso, `.c-cd-act`):
  - **hover e foco:** fundo `--color-background-subtle`, e o chevron avança 2px;
  - **pressed:** o mesmo fundo, com borda e chevron em `--color-surface-system-default` e o título em
    `--color-surface-system-emphasis`;
  - **bloqueado:** não é link (`div` com `aria-disabled`); cursor de bloqueado, chevron em `--color-icon-tertiary`, e o clique
    mostra o aviso "Conclua o curso anterior para liberar este.";
  - com movimento reduzido, sem transição e sem o avanço do chevron.

### Tabuleiro: Dock recolhido ganhou o botão de expandir (18/11/2026)

- O FAB do Dock recolhido (anel com o %) tem agora, na borda de baixo do anel, o mesmo botão circular de 28px do Dock aberto,
  com `chevron-down` (expandir). Fica centralizado embaixo do anel, entrando só 4px na borda do FAB, para não cobrir o donut
  de progresso. Mesmos estados do botão de recolher
  (hover, clique e animação de entrada).
- O botão repete a ação do FAB (`toggleDock`), então fica fora do teclado e dos leitores de tela (`tabindex="-1"`,
  `aria-hidden`); o FAB continua sendo o controle acessível, com `aria-expanded` e o nome do curso.

### Tabuleiro: trilha Versão E, faixa colorida em zigue-zague (18/11/2026)

- Nova opção no tweak "Desenho da trilha": **Versão E** (`#tabuleiro?trilha=e`), inspirada em trilhas de "frentes" com uma
  faixa grossa e colorida. Usa a mesma faixa horizontal da Versão D (rolagem para o lado, roda do mouse, botão de ir à
  atividade atual, fundo por módulo revelado com a rolagem); as funções que valiam só para a D agora valem para as duas
  (`isHoriz()` em js/screens/board.js).
- **Cartões integrados à trilha:** cada módulo tem um cartão (300px; 248px no mobile, sem contorno) com a imagem 16:9 recuada
  8px do topo e das laterais (raio 8), como no card de curso mobile (`.c-course-compact`), sem nada por cima. Embaixo, a
  etiqueta "Módulo N" na cor do módulo, o título (até 2 linhas), "N atividades · tempo" e, no pé, a barra de progresso com o
  %, as mesmas do card de módulo da página de Curso (`.c-cd-module__meta` e `.c-cd-module__progress`; do tablet para cima no
  tamanho desktop de lá, 12/16; o trilho estica na largura do cartão). O cartão tem 340px de altura no desktop (276 no mobile). Os cartões alternam em cima e embaixo. **A faixa entra no cartão por um lado e sai por outro**, com os lados
  sorteados e fixos por módulo (`eEntry`, `eSides`): entra pela esquerda, por cima ou por baixo (cima/baixo só pelo lado da
  pista livre) e sai pela direita, por cima ou por baixo, nunca pelo mesmo lado por onde entrou (entrou por cima ou por baixo,
  sai pela direita). No exemplo: módulo 1 sai pela direita; o 2 entra pela esquerda e sai por cima; o 3 entra por baixo e sai
  pela direita; o 4 entra por cima. A faixa começa e termina 24px por baixo do cartão; a do último módulo termina numa chegada
  com bandeira (cinza até o curso terminar).
- **Estrada (a da Versão C):** sombra de 13px e caminho branco de 9px, em ângulos retos com curvas de raio 32, e no meio a
  **linha do progresso (6px, o dobro da C) na cor do módulo, só até o pin atual** (só entre as atividades já feitas; nada depois). Sem
  setas nem cadeados na estrada. Entre dois
  cartões a estrada sobe e desce entre as pistas quantas vezes precisar para as atividades do módulo caberem com o passo
  mínimo (168px no desktop, 132 no mobile). Geometria em JS: `trailELayout`, `eLegPoints`, `roundedSegs`, `subPath`.
- **Pins:** os da **Versão B com imagem** (`pinFaceB`; respeita o tweak "Imagens nos pins"): imagem da atividade no miolo,
  ou o ícone LP `challenge` (avaliação e prova) ou `target` (missão), e o número embaixo. Na E o miolo e o aro da concluída
  **O círculo do pin fica sempre branco** (sem miolo colorido nem aro na concluída); sem imagem (avaliação e missão), o ícone
  fica na cor do módulo. **Bloqueada com imagem:** a imagem fica colorida com desfoque de 1px e um cadeado de 22px por cima,
  claro na imagem escura e escuro (`--color-surface-dark`) na clara; a luminosidade de cada imagem é medida depois de carregar
  (`toneLockedPins`, `data-tone`). Avaliação e missão bloqueadas continuam com o ícone no miolo cinza. A concluída tem as **3 estrelas em arco em
  cima**, como na Versão C (douradas as ganhas). O atual ganha um halo pulsando. No mobile os pins ficam em 76%. Mesma dica no
  hover (desktop), bottom sheet no toque e os mesmos cliques (`openNode`) das outras versões.
- **Cores:** tokens novos `--color-module-1` a `--color-module-4` em css/tokens.css (azul, vermelho, verde e roxo fixos, com
  contraste de 4.5:1 ou mais para o texto branco). Novo tweak "Cores dos módulos": "Uma por módulo" (padrão) ou "Cor da marca"
  (todos na primária, `--color-surface-system-default`).
- Medidas em `E_SIZES` (desktop/tablet e mobile). Conferido em 360, 768 e 1440 e no tema escuro.
- Ainda não tem o "Começar/Continuar" em cima do pin atual (as outras versões têm), nem o pin da missão do fim do módulo.

### Tabuleiro: Dock recolhido volta a ser a pílula com o nome do curso (18/11/2026)

- O Dock recolhido voltou a ser a **pílula** de antes (até 296px): o anel de progresso e o nome do curso numa linha, com
  reticências (`.c-board-dock__pill-title`). Continua no canto superior direito, abaixo da app bar.
- O botão circular de expandir (28px, `chevron-down`) continua, agora no meio da borda de baixo da pílula, metade para fora.
  Ele repete a ação da pílula e fica fora do teclado e dos leitores de tela; a pílula é o controle acessível.
- A animação de recolher/abrir agora encolhe o cartão até o tamanho da pílula (296 × 56) e cresce a partir dela.

### Tabuleiro: Versão E como trilha padrão e Dock na largura do navdrawer (18/11/2026)

- `#tabuleiro` sem parâmetro abre a trilha **Versão E** (antes, a C). As outras continuam em `?trilha=a|b|c|d`. Mudança em
  `looksFromHash` (js/screens/board.js) e no `default` do tweak "Desenho da trilha" (js/data/tweaks.js).
- O **Dock** tem a largura do navdrawer (**400px**, `css/components/panel.css`) aberto e recolhido: o cartão passou de 300 para
  400 e a pílula (anel, nome do curso e botão de expandir) deixou de encolher com o título (antes até 296) e tem 400 fixos.
  Abaixo de 448 de tela, os dois ficam com a largura da tela menos 48.
- Aberto, o cartão **fica por cima da trilha** e não muda a apresentação dela: a área da trilha não perde largura, nada se
  desloca e a trilha continua visível em volta e atrás do cartão (antes ele empurrava a trilha para a esquerda e a faixa
  horizontal terminava antes dele, cortando o que vinha depois). Saiu o `DOCK_PUSH` e a animação da trilha ao abrir e recolher;
  nas trilhas horizontais (D e E), abrir ou recolher o cartão mantém a rolagem da faixa.
- A animação de recolher/abrir (clip-path) usa a nova largura da pílula (400).
- Versão E: o título do cartão do módulo (`.c-board-ecard__title`) passou de heading 20/32 (16/24 no mobile) para **body 14/20
  700**, o mesmo do título do curso no cartão de informações do Dock (`.c-board-dock__title`), em todas as larguras.
- Versão E: o cartão do módulo passou a **abraçar o conteúdo** (hug), sem sobra entre as tags e o progresso (antes 340px fixos
  no desktop e 276 no mobile). O **título aparece inteiro**, em quantas linhas precisar (sem reticências nem altura mínima), então
  cada cartão tem a sua altura. Ela é medida depois do render (`measureCardsE`, guardada em `state.eCardHs`) e a faixa entra e
  sai de cada cartão pela medida dele (`trailELayout` / `eLegPoints`); a área cresce se um cartão de baixo passar da altura
  dela. A `cardH` de `E_SIZES` (316 / 265) só vale até a primeira medida.
- **Escurecer o fundo** começa em **32%** no Tabuleiro (antes 0). O controle do tweak passou a andar de 1 em 1 (antes 5);
  `?escurecer=0` tira a camada escura.
- Versão E: a faixa entra e sai de cada cartão de módulo **sempre no centro da borda**: pelo topo ou pela base, no meio da
  largura (antes um ponto sorteado entre 20% e 80%); pelas laterais, no meio da altura de cada cartão (`eSides`, `eLegPoints`).
  O lado por onde ela entra e sai continua sorteado.
- Dock recolhido (pílula) mais baixo: **44px** de altura (antes 56), com o anel de progresso de **36px** (antes 44) e o
  percentual em 10/12; 4px de respiro em volta do anel e 8 até o título. A animação de recolher encolhe o cartão até essa altura.
- Curso concluído: no anel de progresso do Dock, o "100%" deu lugar a um **check** verde (`--color-icon-success`, 16px na pílula,
  traço 2), dentro do anel verde. O leitor de tela ouve "Curso concluído".

### Tabuleiro, Versão E: espaço mínimo entre módulos e fade do fundo pela posição do cartão (18/11/2026)

- **Espaço mínimo entre módulos:** do cartão de um módulo ao do seguinte há no mínimo a distância do Módulo 1 (o mais longo):
  **1308px** no desktop e **1032** no mobile (`minLeg` em `E_SIZES`). Os módulos com menos atividades ganham voltas na faixa até
  chegar a esse mínimo, e os pins se distribuem nela. Assim a trilha de cada módulo ocupa pelo menos uma tela e o fundo dele
  aparece inteiro antes do seguinte começar a entrar.
- **Fade do fundo nas trilhas horizontais (D e E)** pela posição do cartão do módulo, medida da borda esquerda da faixa: começa
  quando o cartão chega a **373px** e o fundo fica **100%** quando ele chega a **74px** (quase onde o cartão do Módulo 1 fica no
  início). No mobile, de 60% da largura da tela até 24px. Antes, a transição ia de 90% a 30% da tela. Função `hFade` em
  js/screens/board.js; as trilhas verticais continuam como antes.

- **Último módulo (18/11/2026):** o trecho do último módulo também tem no mínimo `minLeg` (do cartão até a bandeira de
  chegada), para o fundo dele aparecer inteiro. Depois da bandeira sobra meia faixa (`trailELayout` recebe a largura medida
  `state.dw`): no fim da rolagem a chegada fica no meio da tela.

### Tabuleiro: estrela de progresso do design system (18/11/2026)

- As estrelas dos pins concluídos (`stars` e `sideStars` em `js/screens/board.js`) trocaram o ícone Feather `star` pela
  estrela de progresso do LP-DesignSystem 4.0 (`progressStar`): preenchida = Figma `5247:21402` (corpo amarelo com brilho na
  metade direita), vazia = `5261:11062` (corpo claro, sem brilho), contorno claro de 1px. Tamanho, posição e o arco em volta
  do pin continuam os mesmos.
- Tokens novos em `css/tokens.css`: `--color-star-fill`, `--color-star-shine`, `--color-star-empty` e `--color-star-border`
  (iguais nos dois temas, porque a estrela fica sobre imagem). As cores vão inline nos `<path>` para valer por cima das regras
  de `.c-icon` de cada versão da trilha.

### Tabuleiro: trilha sempre vertical no mobile (18/11/2026)

- Abaixo de 768px a trilha é sempre a Versão C (vertical, com os pins um embaixo do outro numa linha reta), seja qual for o
  tweak "Desenho da trilha" (`looksFromHash` em `js/screens/board.js`; a dica do tweak avisa). A partir de 768 vale o tweak
  (padrão E, horizontal). Os tamanhos `E_SIZES.mobile` e o fade horizontal do mobile deixam de ser usados.

### Tabuleiro: bottom sheet do pin igual ao cartão de hover (18/11/2026)

- O bottom sheet que abre ao tocar no pin (mobile, tablet e telas de toque) agora mostra o mesmo conteúdo do cartão de hover
  do desktop: título com o ícone do tipo à esquerda, "Atividade N · X min" embaixo, a pílula de pontos e moedas e a situação.
  Os dois usam `pinCardBody` (`js/screens/board.js`); no sheet o cartão fica parado, sem caixa nem sombra
  (`.c-board-tip--sheet`), com o botão "Iniciar/Refazer …" embaixo. Saíram o ícone grande e o título de 16px do sheet
  antigo (`.c-board-sheet__head`, `__icon`, `__text`, `__title`).
- **Tablet também (18/11/2026):** a regra vale para tudo abaixo do desktop (`DESK`, 1179): mobile e tablet (768 a 1178) têm
  a trilha vertical da Versão C numa coluna reta (`trailBLayout` em modo compacto abaixo de `DESK`, não mais só abaixo de
  768). A partir de 1179 vale o tweak (padrão E, horizontal).

### Rota de aprendizagem: selos dos cursos com texto (19/11/2026)

- Nos cards dos cursos da rota (`courseCard` em `js/screens/learning-path.js`), os selos Novo, Sugerido e Obrigatório
  agora mostram ícone e nome também no desktop (antes só o ícone, com o nome no `title`). Quando não cabem na linha com o
  tempo e os módulos, o tempo desce para a linha de baixo (`.c-lp-course__top` já quebra). No mobile e no tablet eles já
  tinham texto (`mpill`).
- **Espaço entre os selos:** 4px no desktop (`.c-lp-course__pills`; antes 8), como no Figma: `cardCourse-route` e
  `cardCourse` usam `itemSpacing` 4 no grupo "pillsRight" (o card da tela Cursos já usava 4).

### Tabuleiro: Dock recolhe sozinho (19/11/2026)

- Ao entrar na tela, o cartão de informação do curso (Dock) aparece aberto e, **3000 ms** depois de a trilha carregar,
  recolhe na pílula com a mesma animação do botão (`autoCloseDock`, `DOCK_AUTO_CLOSE` em `js/screens/board.js`). Se o foco
  ou o ponteiro estiver no cartão, espera a pessoa sair dele.
- A cada scroll/swipe da pessoa na trilha (roda do mouse, toque arrastando, teclas de rolagem), o cartão recolhe, também
  depois de reaberto pela pílula. Gestos dentro do próprio cartão e a rolagem automática da tela (centralizar a atividade
  atual) não contam. O fechamento automático não move o foco.

### Tabuleiro: cartão do módulo no mobile e no tablet (19/11/2026)

- Na trilha vertical (Versão C, abaixo do desktop), o cartão do módulo mostra o título inteiro, em quantas linhas precisar
  (antes cortava em 2 com "…"), e a barra de progresso fica embaixo do título e das informações, alinhada ao texto (antes
  começava embaixo da imagem). Regras no fim de `css/screens/board.css` (`.c-board:not(.c-board--desk) .c-board-ccard`).
  No desktop nada mudou.

### Tabuleiro: trilha vertical (mobile e tablet) no visual da Versão E (19/11/2026)

- Abaixo do desktop a trilha vertical (`trailV` / `trailVLayout` em `js/screens/board.js`) usa o visual da Versão E: pins
  da E (`nodeE`: disco branco, imagem ou ícone na cor do módulo, halo no atual, estrelas em arco; 84px no tablet, 64 no
  mobile), estrada reta da E com a linha de progresso na cor de cada módulo (`--color-module-N`, tweak "Cores dos módulos")
  e **sem as setas e cadeados no trilho**. Cada trecho vai do meio de um cartão ao meio do seguinte.
- O cartão do módulo (`cardV`, `.c-board-vcard`) traz as informações do cartão da E: etiqueta "Módulo N" na cor do
  módulo, título inteiro, "N atividades · tempo" e a barra de progresso com o % na largura toda, com a imagem 16:9 do módulo no
  topo (recuada 8, como na E). O cartão tem no máximo 400px, centralizado na coluna (no tablet). A altura é medida (`measureCards`) para a trilha seguir certa.
- A trilha vertical antiga da Versão C (`trailCVertical`) fica no código, mas não é mais usada.

### Atividades: teste da tipografia LP 4.0 (19/11/2026)

- Nova opção no tweak "Tipografia" das atividades: **LP 4.0** (`#atividade?...&tipografia=c`). Liga a Versão B
  (`.c-act--type-b`) e, por cima, `.c-act--type-c` (fim de `css/screens/activity.css`), que encaixa o que ainda ficava fora
  dos estilos de texto do LP-DesignSystem 4.0 no Figma (`type/*`: caption 12/16, body 14/20, subtitle-extrabold 16/24,
  price 18/28, heading 20/32, display-sm 30/40; `type-mobile/caption` 10/12) e da escala de espaçamento (`Spacing/*`, de 4
  em 4): parágrafos 16/28 → 16/24, títulos 20/28 → 20/32, título da apresentação 24/32 800 → 20/32 700 (30/40 de 768),
  teclas e campo 16/20 → 16/24, código 14/20, vão das lacunas do Misturadinho 3 → 4, e os tamanhos fluidos (`clamp`) por
  faixa: letras do Misturadinho 20/32 (30/40 de 1180), caça-palavras 12/16 (16/24 de 768), Memória e Mosaico 10/12
  (12/16 de 768).
- Conferido nas 17 atividades em 1440 e 360: todo texto visível cai num par tamanho/altura de linha do Figma.
- No Figma, `type/subtitle` agora é 14/20 Bold, `type/display-lg` 48/44 e os estilos `type-mobile/*` mudaram (body 12/18,
  heading-area 14/18); o resumo de tipografia do CLAUDE.md está desatualizado nesses pontos.
- O padrão continua a Versão A; a LP 4.0 é só para comparar.

### Atividades: barra inferior com selo da resposta e "Explicação" (19/11/2026)

- Depois da resposta, a barra inferior (`footer` em `js/screens/activity/parts.js`) pinta o fundo do tom e mostra à
  esquerda o selo **"Correto!" / "Incorreto!"** (ou "Tempo esgotado!"): pílula com contorno de 2 e ícone na cor do tom,
  16/24 bold (14/20 no mobile). O texto do porquê saiu da barra.
- O porquê vai para o botão **"Explicação"**, que só aparece depois da resposta. Ele abre um painel que sobe da barra por
  cima da atividade (`.c-act-explain`: etiqueta "Explicação", título e o texto; até 70% da altura, com rolagem), com a
  tela escurecida atrás (clicar fora ou Esc fecha). Aberto, o botão vira "Fechar explicação" ("Fechar" no mobile). A
  explicação fecha sozinha na próxima pergunta (`state.explain` guarda a atividade + o texto da vez).
- Destaques: no acerto, "Continuar" é o botão cheio na cor de sucesso e "Explicação" é discreto; no erro, "Explicação" é o
  cheio (vermelho) e "Continuar" o discreto, até a explicação ser aberta. Botões no tom usam `--color-text-success/error`
  de fundo e a cor do fundo da página no texto (contraste AA nos dois temas).
- Usam a barra nova: Quiz (1 e 17) e This or that (11, cuja explicação saiu do card). Leitura e Slideshow mostram só o selo
  "Leitura concluída!", sem texto de pontos e sem botão de explicação.
- **Levado às outras mecânicas com resposta a conferir** (helper `verdict` em `js/screens/activity/flow.js`):
  - **No lugar (7)** e **Ordenadinho (8)**: o resultado saiu da mensagem dentro do card. Errou: selo "Incorreto!" e o que
    deu errado ("4 de 8 corretas…") no botão "Explicação"; acertou: selo "Correto!" com o resumo ao lado, que continua na
    barra (com "Continuar") depois de a atividade ser concluída.
  - **Mosaico (14)**: selo "Correto!", "Quase!" (acertou parte) ou "Incorreto!", e a explicação dos 4 princípios no botão.
  - **Emparedado (4)**: sem tentativas, selo "Emparedado!" e "A resposta era …" na Explicação (saiu o alerta do card), com
    "Tentar de novo"; acertou, selo "Correto!".
  - Ficam dentro do jogo as dicas a cada jogada (Caça-palavras, Memória, Misturadinho, Quebra-cabeça, Jogo dos 7 erros e
    as letras do Emparedado), porque não são a resposta final. Enquetes não têm certo ou errado, e a Avaliação tem a tela de
    resultado dela.
  - **Caça-palavras (3)**: ganhou tempo limite (`WS_TIME` = 180 s em `js/data/activity.js`, no relógio da barra de
    desempenho; os 5 últimos segundos ficam em vermelho, com o tique). Achou todas: selo "Concluído!" e "Continuar".
    Acabou o tempo: a grade trava e fica apagada, selo "Tempo esgotado!" (ícone de relógio), as palavras que faltaram no
    botão "Explicação" e "Tentar de novo" (nova grade, tempo cheio). O helper `verdict` aceita `icon`.

### Atividades: barra inferior, versão 2 (19/11/2026) — substitui o selo em pílula e o painel acima

- **Resultado**: em vez da pílula com contorno, uma **área de ícone** (40, radius xl, fundo da página, ícone de 24 no tom;
  36/20 no mobile) e o título no tom, 16/24 bold (14/20 no mobile): "Correto!", "Incorreto!", "Emparedado!",
  "Concluído!", "Quase!", "Tempo esgotado!", "Respondido".
- **Explicação**: botão sempre **outlined**, sem ícone, rótulo "Explicação". Abre um **modal** (`explainDialog` em
  `parts.js`, o mesmo diálogo das atividades): selo no tom, etiqueta "Explicação", título e o texto; fecha em "Fechar
  explicação" (outlined), no fundo ou com Esc, e o foco volta ao botão. "Continuar" é sempre o botão cheio, na cor do tom.
- **Texto complementar sempre na Explicação** (saiu o `note` ao lado do selo): No lugar e Ordenadinho também no acerto;
  Emparedado no acerto ("A resposta é …"); Caça-palavras no "Concluído!" (as palavras). Leitura e Slideshow seguem só com
  o selo.
- **Feedback novo, a cada jogada** (as mensagens que ficavam dentro do jogo foram para a barra; ficou só a orientação):
  - Memória (5): par certo "Correto!", par errado "Incorreto!", todos os pares "Concluído!".
  - Misturadinho (6): palavra certa "Correto!", errada "Incorreto!".
  - Quebra-cabeça (9): troca que encaixa peça "Correto!", que não encaixa "Incorreto!", imagem completa "Concluído!".
  - Jogo dos 7 erros (10): achou "Correto!", errou o lugar "Incorreto!", todos "Concluído!". "Esse você já encontrou" e a
    dica continuam dentro do jogo (`msg.tip`).
  - Enquete (12) e Enquete aberta (13): sempre positivo, "Respondido", com a confirmação na Explicação.
- O tempo do Caça-palavras (180 s) ainda será revisto.

### Rota de aprendizagem: coluna lateral com a rolagem do Curso (24/11/2026)

- A coluna lateral da Rota (card da rota, "Sobre a rota" e Categorias) agora rola como a do Curso: quando é mais alta que a
  tela, desce junto até a base encostar a 16px da base da tela e, ao rolar para cima, volta até o topo encostar abaixo da
  app bar. Antes ficava presa no topo e a parte de baixo não aparecia em telas baixas. A Rota usa a mesma função
  (`stickyAside`, agora exportada de `js/screens/course-detail.js`) com `data-sticky-aside` na coluna.
- **Chevron do card de curso só no hover (24/11/2026):** como no card de atividade do Curso (`.c-cd-tl__go`), o chevron
  da direita (`.c-lp-course__go`) não aparece nem ocupa espaço fora do hover (a barra de progresso vai até a borda); no
  hover e no foco pelo teclado ele entra e empurra a barra. No curso bloqueado não aparece. Regra no fim de
  `css/screens/learning-path.css`.

### Curso e Tabuleiro: "Materiais" vira "Materiais de apoio" (24/11/2026)

- O rótulo do botão/aba de materiais passou a ser **"Materiais de apoio"** (com o contador ao lado): abas do mobile do
  Curso (`course-detail.js`) e do Tabuleiro (`board.js`), aba do Dock e botão da barra integrada do Tabuleiro. Cabe em 360
  (abas) e no Dock de 400. A Rota de aprendizagem não tem botão de materiais.

### Curso: cabeçalho do módulo reorganizado (24/11/2026)

- No acordeão de módulos (`.c-cd-module__head`, desktop e mobile): o **título aparece inteiro** (sem corte em 2 linhas
  com "…"), indo até o chevron; o **chevron fica no topo**, com a 1ª linha do título no meio dele; e a **barra de progresso**
  fica na linha de "N atividades · tempo", **alinhada à direita do card** (sob o chevron, na mesma borda direita das
  pílulas de pontos das atividades). Grade de 3 colunas no fim de `css/screens/course-detail.css`; o HTML não mudou.

### Curso: botão do card no mobile igual ao do desktop (24/11/2026)

- O botão do card do curso no mobile (`mobileSummary` em `js/screens/course-detail.js`, também na aba "Visão geral" do
  Tabuleiro) usa o mesmo texto e ícone do desktop em cada estado: **Iniciar** e **Continuar** (play-circle, vão para a
  trilha) e **Ver certificado** (award, vai para Certificados). Saiu o "Ir para a trilha" (e a opção `trailCta`).
- **Card do curso no mobile com os componentes do desktop (24/11/2026):** abaixo da capa (selos e duração), do título e do
  autor, o card mobile (`mobileSummary`) usa o mesmo miolo do card lateral do desktop (`summaryBody`): as 4 informações com
  ícone de 16 ("Certificado de conclusão"), o progresso com "x de N atividades concluídas" (só com o curso iniciado), o
  botão do estado e os infocards de pontos e moedas (no lugar da linha "Recompensas" com pílulas). Saíram a linha
  divisória e os estilos próprios dessas partes no mobile; título e autor com recuo de 16, como o resto.
- **Card da rota no mobile com os componentes do desktop (24/11/2026):** como no Curso, abaixo da capa, do tipo e do
  título, o card mobile da Rota (`mobileSummary` em `js/screens/learning-path.js`) usa o mesmo miolo do card lateral do
  desktop (`sideBody`): as 6 informações com ícone de 16 ("Certificado de conclusão") e os infocards de pontos e moedas, no
  lugar da linha "Recompensas" com pílulas. Saiu a linha divisória.
- **Sem o "Rota de aprendizagem" acima do título no card mobile da Rota (24/11/2026):** a etiqueta saiu (e a classe
  `.c-lp-mkicker`); o card mostra direto o título. A informação segue na lista ("Rota de aprendizagem sequencial").

### Curso: lista de atividades na escala mobile (24/11/2026)

- Abaixo de 1179, a linha do tempo de atividades do módulo (`.c-cd-tl`) usa a escala mobile, coerente com o cabeçalho do
  módulo: título 12/18 700 (era 14/20), "Atividade N · X min" e estrelas 10/12 (era 11/14), pílula de pontos e moedas
  10/12 com ícones de 12 (era 12/16 com 14) e ícone do tipo de 12. No desktop nada muda; o bottom sheet do Tabuleiro, que
  reaproveita essas classes, segue com os próprios tamanhos.
- **Chevron sempre visível no mobile (24/11/2026):** abaixo de 1179 e em telas de toque (`hover: none`), o chevron do card
  de atividade do Curso (`.c-cd-tl__go`) e do card de curso da Rota (`.c-lp-course__go`) fica sempre à mostra, já que não
  há hover. No desktop com mouse continua só no hover; no curso bloqueado não aparece.
- **Chevron do card de atividade à direita no mobile (24/11/2026):** abaixo de 1179, o chevron (`.c-cd-tl__go`) vai para a
  borda direita do card (`margin-left: auto`), na linha da pílula de pontos e moedas, que segue alinhada ao título.
- **Sem hover no mobile (24/11/2026):** abaixo de 1179 e em telas de toque (`hover: none`), Curso e Rota não mudam mais
  nada no hover: fundo dos cards de atividade (linha do tempo e cards), do cabeçalho do módulo, dos materiais, das abas e
  do card de curso da Rota, a cor dos links "Voltar" e o chevron que andava 2px. O toque (`:active`) e o foco pelo teclado
  seguem com o retorno visual. Regras no fim de `course-detail.css` e `learning-path.css`; no desktop com mouse nada muda.
- **Chevron parado no toque (24/11/2026):** no mobile, o chevron do card de atividade fica sempre na borda direita, também
  no toque, no foco e no "hover" que o toque deixa preso (a regra do hover do desktop zerava a margem e o puxava para a
  esquerda). No card de curso da Rota ele também não anda mais no toque nem no foco.

### Curso e Rota: marcador atual menor e com pulse (24/11/2026)

- O marcador roxo da atividade atual (linha do tempo do Curso, `.c-cd-tl__item--current .c-cd-tl__node`) e do curso atual
  (trilho da Rota, `.c-lp-route__node.is-current`) ficou 50% menor (10 em vez de 20, centralizado no trilho) e ganhou um
  **pulse**: um anel na cor da marca sai do ponto e some a cada 2 s (`cd-node-pulse`). Com `prefers-reduced-motion`, fica
  parado com o anel claro fixo. Desktop e mobile. Regra no fim de `css/screens/course-detail.css` (vale para as duas telas).
- **Ajuste (24/11/2026):** o marcador atual voltou a ter o **círculo cinza de 20** dos outros marcadores (borda
  border/default, fundo da página), com a **bolinha roxa de 10 dentro** (`::after`), e é ela que pulsa (anel de até 6).

### Curso: trilho das atividades com o espaçamento da Rota (24/11/2026)

- O trilho da linha do tempo de atividades (`.c-cd-tl`) ficou à mesma distância da borda do card que o trilho dos cursos da
  Rota: do centro da linha à borda esquerda do card, **27 no desktop** e **19 no mobile** (eram 19 e 15; `padding-left`
  16 e 8). Da linha aos cards (atividades ou cursos), 18 nos dois, como já era.
- Conferido que marcadores e trilho são iguais nas duas telas: círculo de 20 com borda de 2 (cinza border/default; verde
  icon/success com fundo background/success na concluída), check e cadeado de 10 com traço 3, linha de 2 (verde no trecho
  feito, cinza border/default no resto) e o marcador atual (círculo cinza com a bolinha roxa de 10 que pulsa) com a mesma
  regra.

### Componente novo: trilho vertical (`rail`) — Rota e Curso com o mesmo código (24/11/2026)

- O trilho dos cursos da Rota virou componente: `rail({ status, first, last, before, after })` em
  `js/components/rail.js` + `css/components/rail.css` (importado em `css/app.css`). Cada item tem o traço de cima, o
  marcador e o traço de baixo (`.c-rail`, `.c-rail__line`, `.c-rail__node`); os traços dos itens seguidos se emendam.
  Estados do marcador: `done` (verde com check), `current` (círculo cinza com a bolinha roxa que pulsa), `locked`
  (cadeado) e `open` (liberado, vazio). `before`/`after` pintam de verde o caminho já feito; `first`/`last` escondem as
  pontas.
- A **Rota** (`coursesSection`) e a **linha do tempo de atividades do Curso** (`timelineRow`) usam o componente. No
  Curso saíram o traço desenhado em cada item (`.c-cd-tl__item::before`) e o marcador próprio (`.c-cd-tl__node`); na Rota,
  `.c-lp-route__rail/__line/__node` (fica só o recuo de 4 sobre o vão entre os cards). O visual não mudou: conferido em
  1440 e 360, com os traços contínuos, os marcadores no meio de cada card e o recuo de 27/19 da borda.

### Rota: curso bloqueado com capa colorida e cadeado (24/11/2026)

- O card do curso bloqueado mantém as **cores da capa** (saiu o cinza com 70% de opacidade).
- No lugar do chevron, um **cadeado** (`lock`, icon/tertiary): no desktop com mouse aparece no hover (como o chevron dos
  outros cards, sem fundo de hover); no mobile, tablet e telas de toque fica sempre à mostra, no mesmo lugar do chevron.
- O card continua sem ação (div com cursor de bloqueado; o toque mostra o aviso "Conclua o curso anterior…").
- **Cadeado em 16 (24/11/2026):** o cadeado é o `lock` do Feather (mesma biblioteca do chevron). Como o desenho dele enche
  quase toda a caixa (18×20 de 24) e o chevron é fino (6×12), ele fica em 16, centralizado na mesma caixa de 20 do chevron
  e na mesma borda direita, para os dois terem o mesmo peso visual.

### Curso: card de informações do curso no mobile pelo screenshot (24/11/2026) — substitui a versão com o miolo do desktop

- `mobileSummary` (`js/screens/course-detail.js`) volta a ter a escala mobile, como no screenshot: capa com selos e duração,
  título 12/16, autor (avatar 24, 10/12), linha, as 4 informações (ícones de 8, 10/12, "Certificado"), o progresso
  ("Progresso" e % 10/12 bold, barra de 8) com **"x de N atividades concluídas"** embaixo (10/12), o botão mobile de 30 e
  **dois infocards** de pontos e moedas lado a lado (`.c-cd-mbox`: borda, radius 8, padding 8; ícone de 8, "3.500 /3.500"
  12/16 e o rótulo 10/12 alinhado ao número). Recuo de 8 no card, como antes.
- O botão segue com o texto e o ícone do estado (Iniciar, Continuar ou Ver certificado), como no desktop (pedido de
  24/11/2026), no lugar do "Ir para a trilha" do screenshot.
- O card mobile da Rota continua com o miolo do card lateral do desktop; os recuos de 16 dele ficaram no modificador
  `.c-cd-mcard--side` (`learning-path.css`).
- **"Sobre o curso" no mobile (24/11/2026):** a aba "Visão geral" do mobile (Curso e Tabuleiro) ganhou o card "Sobre o
  curso" entre a Descrição e as Categorias (`mobileAbout` em `js/screens/course-detail.js`): os números (módulos,
  atividades e tempo de conteúdo) e os recursos (Atividades, Prova, Missões, Materiais de apoio, Tutor.IA), os mesmos do
  card da coluna lateral do desktop, num card de seção.
- **Escala dos números em "Sobre o curso" no mobile (24/11/2026):** os cards de módulos, atividades e tempo (`.c-cd-about-m
  .c-cd-box`) usam a mesma escala dos infocards de pontos e moedas do card do curso: valor 12/16 bold (era 14/20) e rótulo
  10/12 (era 12/16).

### Rota: card mobile com os elementos do Curso mobile (24/11/2026) — substitui o miolo do desktop no mobile

- O card da rota no mobile (`mobileSummary` em `js/screens/learning-path.js`) usa os elementos do card mobile do Curso:
  linha abaixo do título, as 6 informações em `.c-cd-mcard__facts` (ícones de 8, 10/12, "Certificado") e os infocards de
  pontos e moedas `.c-cd-mbox` (`mobileBox`, agora exportado de `course-detail.js`). Saiu o modificador
  `.c-cd-mcard--side`.
- "Sobre a rota" no mobile usa a mesma escala do "Sobre o curso" (`.c-cd-about-m`): valor 12/16 bold e rótulo 10/12.

### Tabuleiro: pulse do pin atual nos moldes da bolinha do Curso (24/11/2026)

- O pin da próxima atividade (`.c-board-enode.is-current`, Versão E no desktop e trilha vertical no mobile/tablet) trocou o
  halo fixo que respirava pelo **pulse** da bolinha roxa do Curso (`c-rail-pulse`): um anel na cor do módulo sai da borda
  do pin (45% de opacidade) e cresce até 18px sumindo, a cada 2 s, ease-out (`c-board-epulse` em `css/screens/board.css`).
  Com `prefers-reduced-motion`, sem animação (como antes).
- **Pins 50% maiores na trilha mobile (24/11/2026):** abaixo de 768, a escala dos pins da trilha vertical (`trailVLayout`,
  `s`) passou de 0,76 (64px) para 1,14 (**96px**). Estrelas, selo do número, halo e o espaçamento entre os pins acompanham
  a escala. No tablet segue 84.
- **Espaço entre os pins 50% maior na trilha mobile (24/11/2026):** abaixo de 768, o vão entre um pin e o seguinte (da borda
  de um à borda do outro) passou de 79 para **119** (`step` em `trailVLayout`: folga de 68 em vez de 28 entre o selo do
  número e as estrelas do pin seguinte). No tablet segue como antes.
- **Borda branca da trilha 2× mais grossa (24/11/2026):** na Versão E (desktop) e na trilha vertical (mobile/tablet), a
  borda branca em volta da linha de progresso passou de 1,5 para 3 de cada lado, crescendo para fora: caminho branco de
  12 (era 9) e sombra de 16 (era 13). A linha do progresso na cor do módulo segue com 6.
- **Botão "ir para a atividade atual" à direita no mobile (24/11/2026):** abaixo do desktop (trilha vertical), o botão
  (`.c-board-jump`) fica fixo na lateral direita, a 16 da borda e 96 da base (acima da navigation bar), em vez de no centro
  sobre a trilha. No mockup ele divide o canto com os botões "Tweaks" e "Catálogo", que só existem no protótipo.

### Tabuleiro: botão do bottom sheet só com o verbo (24/11/2026)

- O botão do bottom sheet do pin (`pinSheet` em `js/screens/board.js`) mostra só **"Iniciar"** (ícone `play-circle`, o
  mesmo dos botões do Curso) ou **"Refazer"** (`rotate-ccw`) na concluída; bloqueada, "Iniciar" desabilitado com o
  cadeado. Antes: "Iniciar atividade/avaliação/missão" e "Refazer …" com seta. O nome inteiro fica no `aria-label`.

### Tabuleiro: pontos e moedas do Dock nos infocards do Curso (24/11/2026)

- No card de informações do curso do Tabuleiro (Dock), pontos e moedas saíram da pílula e passaram a usar os **mesmos
  infocards do card do curso da tela Curso**: ícone na caixa, "620 /3.500" e o rótulo ("pontos disponíveis" / "moedas
  disponíveis"; "ganhos/ganhas" no curso concluído), lado a lado na largura do cartão. Helper novo `rewardBoxes(d)`
  exportado de `js/screens/course-detail.js` e usado nos dois lugares.
- **Abas do Dock à esquerda (24/11/2026):** "Sobre" e "Materiais de apoio" ficam alinhadas à esquerda, na mesma borda dos
  infocards de pontos e moedas e das informações (antes, centralizadas). Saiu também a regra da pílula de pontos antiga.

### Tabuleiro: Dock recolhido numa peça só, com "barriguinha" (24/11/2026)

- A pílula recolhida do Dock e o botão do chevron viraram uma peça única (como no rascunho): no meio da borda de baixo da
  pílula sai uma "barriguinha" de 48 × 18, na mesma cor, com os cantos de baixo arredondados e emendada por duas curvas
  côncavas de 10 (`::before`/`::after` com `radial-gradient`). O chevron fica dentro dela, e ela segue sendo o botão de
  expandir (o clique na pílula também abre).
- A silhueta inteira ganha o contorno de 1 (`--color-border-default`) e a sombra por `filter: drop-shadow` (a borda e o
  `box-shadow` próprios saíram), para não aparecer emenda entre a pílula e a barriga. Regras no fim de
  `css/screens/board.css`. O Dock aberto não mudou.
- **Totalmente arredondado (24/11/2026):** a barriguinha virou um meio círculo de 48 × 24 (antes 48 × 18, que deixava os
  cantos achatados) e as curvas da emenda passaram de 10 para 14. As pontas da pílula já eram totalmente arredondadas
  (raio de 22 na altura de 44).
- **Barriguinha também no Dock aberto (24/11/2026):** o botão de recolher (chevron para cima) do cartão aberto virou o mesmo
  meio círculo de 48 × 24 emendado no meio da borda de baixo (curvas de 14). O cartão perdeu a borda e a sombra próprias;
  a silhueta (cartão + barriga) ganha o contorno de 1 e a sombra por `drop-shadow`. A altura máxima do cartão ficou 24
  menor, para a barriga terminar acima da base da tela.

### Tabuleiro: sequência do card de informações ao carregar (24/11/2026) — substitui "Dock recolhe sozinho"

- Ao carregar a tela, o card de informações (Dock) começa **fechado** (pílula, `dockClosed: true` no estado inicial),
  **abre sozinho 1200 ms** depois (`DOCK_AUTO_OPEN`, com a animação de abrir), fica aberto **3000 ms** (`DOCK_AUTO_CLOSE`)
  e **fecha** (animação de recolher). Medido: pronto em ~1,6 s, aberto em ~3,0 s, fechado em ~6,3 s.
- Continuam: um scroll/swipe da pessoa na trilha fecha o card na hora (e, antes da abertura, cancela a sequência); o
  fechamento pelo tempo espera o foco e o ponteiro saírem do cartão; a abertura e o fechamento automáticos não movem o foco.

### Tabuleiro: Dock abre e fecha como uma peça só, crescendo de pílula para cartão (24/11/2026)

- Abrir e fechar o card de informações agora é um movimento contínuo (`morphDock` em `js/screens/board.js`, Web Animations;
  substitui a troca com `is-entering`/`is-leaving`):
  - **Abrir:** o conteúdo da pílula some (120 ms); o cartão aparece recortado no tamanho da pílula (44 de altura, cantos de
    22) e **cresce para baixo** até a altura toda (cantos de 16) em 420 ms, desacelerando; a barriguinha com o chevron desce
    junto com a borda de baixo; o conteúdo do cartão entra no fim (220 ms, a partir de 240 ms).
  - **Fechar:** o conteúdo some (120 ms); o cartão **encolhe para cima** até a pílula (380 ms), com a barriguinha subindo
    junto; a pílula volta e o conteúdo dela aparece (160 ms).
- O recorte é o `clip-path` do cartão e o contorno/sombra seguem a silhueta (`drop-shadow` no Dock). A sequência anda por
  timers, não pelo fim das animações, para o Dock nunca ficar preso com a aba em segundo plano. Com
  `prefers-reduced-motion`, a troca é direta. Medido em 1440: a parte visível do cartão vai de 44 a 772 com a barriguinha
  acompanhando a borda.
- O fechamento automático conta 3 s a partir do fim da abertura (`DOCK_AUTO_CLOSE + 540`).

### Tabuleiro: bico no cartão do pin (24/11/2026)

- O cartão que abre no hover/foco do pin (desktop, `.c-board-tip--left/--right`) ganhou um **bico** apontando para o pin:
  quadrado de 12 girado 45° (`::before`), com o fundo e a borda do cartão nos dois lados de fora, no meio da lateral voltada
  para o pin (o cartão é centralizado na altura do pin). O cartão ficou 16 além da borda do pin (era 8) para o bico caber
  com folga. O bottom sheet do toque não tem bico.
- **Bico integrado e arredondado (24/11/2026):** o bico deixou de ser um quadrado girado por cima do cartão. Agora é um
  triângulo de 10 × 20 com a ponta arredondada (`clip-path: path(...)`), na cor do cartão e emendado nele; o cartão perdeu a
  borda e a sombra próprias e a silhueta inteira (cartão + bico) ganha o contorno de 1 e a sombra por `drop-shadow`, como o
  Dock, sem emenda visível.

### Tabuleiro: fundo por módulo troca por limiar, com fade automático (24/11/2026) — substitui o fade ligado à rolagem

- O fundo do módulo N entra quando o **cartão dele chega à beira da área da trilha** (o último pin do módulo anterior já
  saiu da tela): na horizontal, a borda esquerda do cartão a **24 ou menos** da borda esquerda da faixa (`BG_EDGE_X`); na
  vertical (mobile/tablet), o topo do cartão a **160 ou menos** do topo da tela, logo abaixo das abas (`BG_EDGE_Y`). Volta ao
  fundo anterior quando o cartão passa de novo desse ponto. No fim da trilha, o último módulo com o cartão na tela entra.
- A troca é um **fade automático** (CSS em `.c-board-bg__layer`: opacidade em 900 ms e a imagem assentando de 1,08 para 1
  em 1,4 s), com duração própria — não acompanha a velocidade do scroll/swipe. Ao redesenhar a tela, as camadas vão direto
  ao estado certo, sem animar. Com `prefers-reduced-motion`, troca direto. Saiu `hFade`.
- **Divisor na base do Dock aberto (24/11/2026):** um traço (`--color-border-default`) fica fixo a 16 da borda de baixo do
  cartão; abaixo dele, uma faixa de 16 na cor do cartão, e o conteúdo rola só acima do traço. É o `::after` do cartão,
  preso na base da área de rolagem (`position: sticky; bottom: 0`, com o `padding-bottom` do cartão zerado). Sem rolagem,
  o traço fica 12 abaixo do último item.
- **Barriguinha numa curva só e seta girando (24/11/2026):**
  - A barriguinha (recolhido e aberto) deixou de ser meio círculo + duas curvas côncavas emendadas (que deixavam quebras):
    agora é um sino de 88 × 24 desenhado por `clip-path: path(...)` com duas curvas de Bézier, saindo tangente da borda e
    voltando sem nenhum canto. Com o teclado, o foco pinta a barriguinha de `--color-surface-system-subtle` (o clip-path
    cortaria o contorno de foco).
  - A seta gira meia volta junto com o movimento (`morphDock`): ao abrir, de "para baixo" a "para cima" enquanto o cartão
    cresce (420 ms); ao fechar, de "para cima" a "para baixo" enquanto encolhe (380 ms). Ela não some mais na troca.
- **Barriguinha presa à borda durante a animação (24/11/2026):** a barriguinha se soltava do cartão ao abrir e fechar
  porque o CSS dela tinha `transition` em `transform` (0,1 s), que atrasava cada passo, e porque o recorte e o deslocamento
  eram animações separadas. Agora `tweenDock` move o recorte do cartão (altura visível e raio de 22 → 16) e a barriguinha
  juntos, quadro a quadro (`requestAnimationFrame`, mesma curva), com as transições do CSS desligadas durante o movimento;
  um timer garante o estado final com a aba em segundo plano. A barriguinha também entra 4 por baixo da borda (antes 1),
  para não abrir fresta em posições de meio pixel. Medido em 1440: a barriguinha fica a −4 da borda em todos os quadros,
  abrindo e fechando.

### Card de informações do curso/rota em duas colunas no tablet (24/11/2026)

- `mobileSummary` (curso e rota) agrupa nome, linha, dados, progresso, botão e pontos/moedas em `.c-cd-mcard__info`.
- A partir de 768px (até 1179, onde o painel mobile é usado), `.c-cd-mcard` vira grid de duas colunas iguais
  (`minmax(0,1fr) minmax(0,1fr)`, gap 16): imagem 16:9 à esquerda, presa no topo; informações à direita.
- No mobile, `.c-cd-mcard__info` usa `display: contents` e o card continua em uma coluna, como antes.

### Rota de aprendizagem: missões, notícias, biblioteca e eventos nas etapas + estado "Liberada" (25/11/2026)

- A lista "O que você verá nessa rota" virou uma lista de **etapas** (`routeSteps` em `js/data/learning-path.js`): os 4 cursos
  intercalados com 1 notícia, 1 material da Biblioteca, 1 missão e 1 evento. Tipos em `stepKinds` (rótulo, ícone, área que abre).
- Todas as etapas usam o mesmo card (`stepCard`, antes `courseCard`) e o mesmo trilho (`rail`). O que muda por tipo (`stepDetails`):
  - curso: tempo e módulos, autor;
  - notícia: publicação e tempo de leitura, autor;
  - material: tipo e data, curtidas e visualizações;
  - missão: evidência/meta, escopo e período, prazo;
  - evento: modo/local e data, vagas.
  Rótulos e ícones vêm das próprias áreas (`kindLabel`/`periodLabel`, `materialInfo`, `modeInfo`).
- Miniatura: o curso usa a capa; as outras etapas usam a capa de exemplo (`c-cover`) com o ícone do tipo. Toda miniatura tem um
  selo escuro com o tipo (`.c-lp-course__kind`). O card leva à área da etapa (#curso, #feed, #biblioteca, #missoes, #eventos).
- Textos: "8 etapas · Realize as etapas em sequência", "Conclua a etapa anterior para liberar esta", aba mobile "Conteúdo 8",
  "4 Cursos e 4 conteúdos" no card da rota e "Sobre a rota" com Cursos, Conteúdos e Tempo dos cursos.
- Novo estado `liberada` (`#rota?estado=liberada`, Tweaks → Estado da rota → Liberada): nada concluído, todas as etapas abertas
  (trilho com círculos vazios, `rail` status `open`), sem cadeado, "Realize as etapas em qualquer ordem" e "Rota de aprendizagem
  liberada" no lugar de "sequencial".

### Rota: ajustes nos cards por tipo de etapa + anel do trilho (25/11/2026)

- **Notícia:** sem barra de progresso; no lugar dela vão as reações e os comentários (`24 reações · 6 comentários`).
- **Biblioteca:**
  - sem progresso; no lugar vão curtidas e visualizações (saíram do canto da linha das tags);
  - sem selo Obrigatório;
  - miniatura 1:1 (`.c-lp-course--material`). No mobile é um quadrado de 120. A partir do 768 o quadrado tem a altura das
    miniaturas 16:9, então todos os cards têm a mesma altura (130 no 768).
- **Missão:** sem selo Obrigatório. "Evidência · Individual · Único" fica à direita, na mesma linha do selo Novo
  (`.c-lp-course--missao .c-lp-course__top` sem quebra).
- **Evento:** sem selo Sugerido e sem progresso; no lugar vão as vagas (`64/100 vagas disponíveis`).
- O rodapé vem de `stepDetails().foot`. Sem `foot`, o card mostra a barra de progresso (curso e missão).
- **Trilho (`css/components/rail.css`):** o anel cinza/verde do marcador agora é `box-shadow: inset 0 0 0 2px`, não mais `border`.
  O navegador arredonda bordas para pixels inteiros da tela: com escala de 125%, os 2px viravam 1,6px e o anel ficava mais
  fino que o traço de 2. Em cores forçadas o anel volta a ser borda. Vale para a Rota e para a linha do tempo do Curso.

### Rota: imagens nas etapas que não são curso (25/11/2026)

- Notícia, material da Biblioteca, missão e evento ganharam imagem (`image` em `routeSteps`). São imagens de exemplo que já estão
  no projeto, de tema tecnologia/dados:
  - notícia: `slots/slideshow-img-3.webp`;
  - biblioteca: `slots/leitura-galeria-3.webp`;
  - missão: `slots/slideshow-img-1.webp`;
  - evento: `slots/atividade-figura-1.webp`.
- `stepCard` usa `c.image` (curso: a capa da rota). Sem imagem, cai na capa de exemplo `c-cover` com o ícone do tipo.
- A imagem da biblioteca segue 1:1 (`.c-lp-course--material .c-lp-course__media img`).

### Rota mobile: etapas no layout dos cards mobile das áreas (25/11/2026)

- Abaixo de 768, cada etapa usa `stepCardCompact`, o mesmo layout dos cards mobile de Cursos, Missões, Eventos, Feed e
  Biblioteca. Reaproveita as classes `c-course-compact` (`css/screens/courses.css`) com o modificador `c-lp-mcard`:
  - imagem recuada com cantos de 4 e selos só com ícone na borda de baixo (Novo `award`, Sugerido `zap`, Obrigatório
    `alert-circle`);
  - curso: duração no selo escuro embaixo à direita; prazo em cima à direita;
  - selo do tipo em cima à esquerda;
  - título de 2 linhas e uma linha de informação (`infoLine`, ícone de 8 e dois textos de 10);
  - rodapé: tags à esquerda e, à direita, o indicador da área mais a ação (chevron, cadeado ou check).
- Informação e indicador por tipo:
  - curso: Curso / n Módulos, donut de progresso;
  - notícia: publicação / leitura, reações e comentários;
  - biblioteca: tipo / data, imagem 1:1;
  - missão: Evidência / Individual · Único, contador n/100 (meta: donut);
  - evento: data / horário, vagas n/100.
- A partir de 768 segue o card com a miniatura ao lado (`stepCard`). A tela ganhou o breakpoint 768 (`breakpoints: [TABLET, DESK]`).
- Na rota, o título tem altura automática: nos grids a altura fixa de 36 alinha os cards, mas aqui deixava vão.

### Rota mobile: biblioteca em duas colunas (25/11/2026)

- O card compacto da biblioteca (`.c-lp-mcard--material`) fica em linha:
  - à esquerda, a imagem 1:1 de 112, recuada 8;
  - à direita, o texto (título, informação, tags e a ação).
- O card fica com 130 de altura em 360. Só CSS, em `css/screens/learning-path.css`.

### Tabuleiro: "Continuar" de volta no pin atual (25/11/2026)

- A Versão E (padrão no desktop) e a trilha vertical do mobile/tablet (que usam `nodeE`) não tinham o balão flutuante
  "Continuar"/"Começar" das outras versões. Agora têm:
  - é o mesmo `.c-board-start`, com o modificador `.c-board-enode__start`;
  - fica 14px acima do pin, fora do alcance do pulse, com a ponta para o pin e o balanço;
  - no mobile acompanha a escala do pin.
- O clique abre a atividade direto (`openNode` com `data-direct`), como antes.

### Tabuleiro → atividade: fade out da trilha e apresentação "montada" (25/11/2026)

- **Saída do Tabuleiro** (`leaveTo` em `js/screens/board.js`):
  - vale para o clique no pin, no "Continuar" e no "Iniciar" do bottom sheet;
  - a tela recebe `.is-route-leaving` e some em 320 ms; só então o endereço muda;
  - com movimento reduzido, vai direto.
- **Sem esqueleto na chegada** (`js/core/transition.js`): `skipNextSkeleton()` pede que a próxima troca de tela entre pronta;
  `app.js` consome o pedido em `go()`. O fade in da apresentação faz o papel do carregamento.
- **Apresentação com as informações da atividade** (`js/screens/activity/intro.js`):
  - ícone da mecânica num disco de 56;
  - "Módulo M · Atividade N" e o nome da atividade do curso;
  - o título;
  - pílulas com mecânica, duração, etapas (quando > 1) e pontos;
  - o texto.
  `activityHref(n)` agora leva `&atv=n` e `courseActivity(n)` (`js/data/activity.js`) devolve módulo, número, nome, minutos e
  etapas. Sem `atv` (outros caminhos), fica "Atividade N" e as pílulas de mecânica e pontos.
- **Montagem:**
  - a tela entra com fade in (400 ms);
  - cada peça entra na ordem de `--i`, a cada 90 ms a partir de 150 ms (opacidade + 16 px para cima, 550 ms);
  - o X entra em 500 ms e o rodapé com "Iniciar" sobe em 600 ms;
  - nada disso roda com movimento reduzido. CSS no fim de `css/screens/activity.css`.

### Apresentação da atividade: linhas reorganizadas (25/11/2026)

- Saiu o ícone grande do topo e a pílula da mecânica ("Quiz", "Memória").
- Nova ordem:
  1. ícone + "Módulo M · Atividade N" (ícone e rótulo do card de atividade do Curso: `edit`; missão `target` e "Missão";
     avaliação LP-Icon `challenge` e "Avaliação");
  2. pílulas de duração, etapas e pontos;
  3. título = nome da atividade do curso (o mesmo do card);
  4. o texto.
- `courseActivity(n)` passou a devolver também o `kind` da atividade.
- Kicker com o ícone "para fora" (a partir de 768): `margin-left: -22px`. O texto alinha com a borda esquerda das pílulas e do
  título (64 = 64 = 64 no 768); o ícone fica a 42. No mobile segue em linha, porque a margem lateral (16) não comporta os 22.

### Card de informações do Curso no tablet: pontos e moedas embaixo da imagem (25/11/2026)

- Os infocards de pontos e moedas (`.c-cd-mcard__boxes`) saíram de `.c-cd-mcard__info` e preenchem o vão embaixo da imagem
  (coluna 1, linha 2 do grid); as informações ocupam a coluna 2 nas duas linhas. A imagem continua 16:9.
- Resultado:
  - no 768 as colunas terminam a 19 px uma da outra;
  - no 1100 a imagem é maior e a coluna da esquerda passa a ser a mais alta, com um vão menor que antes, agora embaixo das
    informações.
- Mobile: mesma ordem de antes (os infocards já eram os últimos).
- Rota: os infocards ficam na coluna da direita. Sem progresso e sem botão, as informações dela já são mais baixas que a
  imagem, e embaixo dela o card ficaria mais alto.

### Curso → atividade com a mesma transição do Tabuleiro (25/11/2026)

- `leaveTo` foi para `js/core/transition.js` (compartilhado). A classe `.is-route-leaving` saiu do `board.css` e foi para o
  `css/shell.css`.
- Na página Curso, um clique em link `#atividade` (card de atividade, desktop e mobile) faz o fade out da página e abre a
  apresentação, sem esqueleto.
- Ctrl/Cmd/Shift + clique e o botão do meio seguem o link normal.
- O "Continuar" do card do curso vai para o Tabuleiro e não muda.

### Curso: abrir e fechar módulos com animação (25/11/2026)

- `toggleModules` em `js/screens/course-detail.js` (clique no módulo e "Expandir/Recolher"), desktop e mobile:
  - **Abrir:** a lista cresce de 0 até a altura dela (320 ms), as linhas entram em sequência (30 ms entre elas) e o chevron gira
    meia volta.
  - **Fechar:** a lista encolhe até 0 e some (260 ms) e o chevron gira de volta; no fim, o set tira a lista.
  - A lista corta o conteúdo só durante a animação.
  - Um clique durante a animação é ignorado. Com movimento reduzido, troca direto.
- O chevron do módulo agora é sempre o `chevron-down`; aberto, o CSS gira 180°.

### Apresentação → mecânica em dois tempos (25/11/2026)

- `startAct` (`js/screens/activity.js`):
  1. **Saída (600 ms):**
     - a app bar sobe e some (`data-hide-topbar` ligado já no clique);
     - ao mesmo tempo, as linhas da apresentação somem subindo 24 px, de cima para baixo, com 40 ms entre elas
       (`.c-act--intro.is-leaving`);
     - o X some e o rodapé com "Iniciar" desce.
  2. **Entrada (`is-enter`):**
     - o menu com as informações da atividade entra da esquerda e a barra desce (como antes);
     - a mecânica é montada: cada filho da seção da mecânica sobe 16 px e aparece, a 200, 270, 340… ms;
     - o rodapé sobe por último, a 450 ms.
- Um clique duplo em "Iniciar" é ignorado. Com movimento reduzido, troca direto.
- Ordem da entrada: primeiro o card lateral (600 ms) e só depois a mecânica é montada (a partir de 600 ms, 70 ms entre as peças);
  o rodapé sobe a 850 ms. Só com o card lateral à mostra (a partir de 1180 e com o menu aberto); sem ele, a montagem segue
  começando a 200 ms.
- A barra de desempenho (`.c-act-hudrow`) e o « (`.c-act-sidetoggle`) entram junto com a mecânica, não mais com o card lateral:
  a 600 ms com o card lateral; a 200 ms sem ele.

### Mecânicas: linha de informação no modelo do Figma (25/11/2026; LP-DesignSystem 4.0, node 5299:92699)

- **`head` (`js/screens/activity/head.js`):** recebe `{ mech, task, how, title, aside, before }` no lugar de `kicker`.
  - **Linha de cima** (`.c-act-head__info`, 12/16): ícone da mecânica (16, o mesmo do menu) + **nome da mecânica** · o que fazer
    · como fazer, com pontos de 2px. À direita, as pills.
  - **Progresso:** "Pergunta 1 de 3" virou a pill `stepPill` ("1 de 3", cor do sistema). Os acertos usam `hitsPill` (verde).
  - **`before`:** conteúdo entre a linha e o título. No Quiz com apoio, a linha vem primeiro, depois a imagem e o texto de apoio.
- **As 16 mecânicas foram migradas.** Exemplos:
  - Quiz: "Escolha uma alternativa · Toque numa alternativa ou use as teclas A a D" (a letra final segue o número de
    alternativas);
  - Memória: "Encontre os pares · Toque em duas cartas por vez";
  - Caça-palavras: "Encontre as palavras ocultas · Clique e arraste da primeira até a última letra da palavra".
- **Instruções que estavam embaixo e foram para a linha:**
  - This or that: saiu "Toque num card ou use as teclas A e B";
  - Enquete: a nota de baixo fica só para a escolha feita e para o voto.
- No mobile a linha quebra quando não cabe e as pills descem.

### Mecânicas: ajudas no rodapé, ao lado do Continuar (25/11/2026)

- Cada mecânica pode ter `aux: state => [{ label, icon, action, disabled, title, data }]`. A tela junta essas ajudas ao rodapé
  (`f.aux`) e `footer` (`parts.js`) as desenha como botões stroked à esquerda do Continuar.
- **Migradas:**
  - Emparedado: Dica;
  - Memória: Recomeçar;
  - Misturadinho: Dica / Mais uma letra;
  - Ordenadinho: Limpar;
  - Quebra-cabeça: Segure para espiar, Encaixar uma e Reembaralhar;
  - 7 erros: Mostrar onde.
- Os botões saíram do conteúdo e da linha das pills. O "Segure para espiar" segue funcionando pelo `[data-peek]` em qualquer
  ponto da tela.
- **Mobile (abaixo de 600):** as ajudas viram botões só com o ícone (38px; o nome fica no `aria-label` e no `title`) e o
  Continuar ocupa o resto da linha.

### Atividades: capa do curso sem a busca (25/11/2026)

- O botão de busca saiu da capa do menu de atividades (`cover` em `parts.js`). No mobile fica só o botão de mostrar/ocultar a
  lista. A lógica da busca (`toggleSearch`, `searchResults`) continua no código, sem ponto de entrada.
- **Menu lateral** (`.c-act-cover--side`): a capa deixou de ser 16:9 (sobrava uma faixa vazia em cima, onde ficava a busca).
  Agora tem a altura do conteúdo, com 20 de respiro em cima e embaixo: 144px no 1440, era cerca de 180. A imagem segue à
  direita, em 16:9 na altura toda, sob o mesmo véu.
- No mobile a capa segue 16:9.

### Mecânicas: sem os avisos de orientação (25/11/2026)

- **Saíram as pílulas cinza de orientação** (`.c-act-msg` com `toast`) entre o cabeçalho e o jogo. A linha de informação do
  cabeçalho já diz o que fazer e como.
  - Memória: "Memorize as posições: cada par errado conta uma jogada";
  - Misturadinho: "Pressione a 1ª letra e arraste até a última" e "Dica: comece pela letra destacada" (a letra destacada segue);
  - Quebra-cabeça: "Peças no lugar certo travam com ✓. Comece pelos cantos";
  - 7 erros: "Os erros podem estar em cores, formas, objetos a mais ou a menos";
  - Mosaico: "Toque nos cards para selecioná-los" e "Você pode selecionar quantos cards quiser".
- **Exceção:** no 7 erros, o aviso aparece só como resposta do "Mostrar onde" ("Olhe dentro do círculo dourado.").

### Mecânica "Leitura" removida (25/11/2026)

- **Saiu a mecânica 2 (Leitura e teoria multimídia).** Foram removidos:
  - `readingMech` e `readingView` de `js/screens/activity/reading.js`;
  - a entrada em `MECHS` (`js/screens/activity.js`);
  - a linha em `activities`, a apresentação `intros[2]` e os dados `reading` em `js/data/activity.js`.
- **Ficam:**
  - o Slideshow (16), com a conclusão pela rolagem (`trackScroll` agora só para ele);
  - os utilitários `code` e `figure`, usados pelo Quiz com apoio.
- Os grupos de atividades do curso (`activityGroups`) se redistribuem entre as 15 mecânicas restantes.
- `#atividade?item=2` é ignorado (abre a atividade atual).
- As atividades do curso do tipo "leitura" (no Curso e no Tabuleiro) são outra coisa e continuam.
- Os estilos `.c-act-read__*` que só a Leitura usava (galeria, cartão que vira, player) ficaram no CSS, sem uso.
- **Estilos da Leitura apagados:** 36 regras e 2 listas de seletores aparadas em `css/screens/activity.css`, cerca de 4,5 KB.
  - Classes: `.c-act-read__block`, `__h`, `__gallery`, `__center`, `__split`, `__reflect`, `__side`, `.c-act-figure--square`,
    `--ruled`, `.c-act-flip*`, `.c-act-pod*`, `.c-act-video` e `.c-act-placeholder--square`;
  - também as variações delas nos tweaks de tipografia (type-b, type-c).
- **Ficam** (usados pelo Slideshow e pelo Quiz com apoio): `.c-act-read`, `__intro`, `__p`, `__kicker`, `__quote`, `__accent`,
  `.c-act-figure`, `__img`, `__caption` e `.c-act-code`. A seção do CSS virou "Slideshow".

### Atividades no mobile e tablet: lista em bottom sheet (25/11/2026)

- **Abaixo de 1024** (sem o menu lateral), sai o bloco do topo da página: a capa do curso e a lista que abria embaixo dela.
- **A barra de desempenho fica entre dois botões** (buttonIcon large com contorno, como o « e o X do desktop):
  - à esquerda, o menu (ícone `menu`, ação `openTrail`), que abre a lista;
  - à direita, o fechar (`.c-act-hud__close--row`).
  - O X que ficava dentro da barra saiu.
- **Lista de atividades** (`trailSheet` em `parts.js`): bottom sheet (`panel`, mode sheet) com o título "Atividades do curso" e os
  mesmos grupos e a avaliação final do menu lateral; no estilo "Cards", o menu de cards.
  - Só a lista rola; o título fica parado.
  - Fecha pelo fundo, pelo Esc (`closeTrail`, com a animação de saída de `leavePanel`) ou ao escolher uma atividade.
- O desktop não muda.
- **Duas linhas no mobile e no tablet:** o menu e o fechar ficam na primeira linha, um em cada ponta (`order` 0 e 1). A barra de
  desempenho ocupa a linha de baixo, com a largura toda (`order: 2; flex: 1 1 100%`).
- **Vidas no mobile e no tablet:** uma pílula com o coração cheio (icon/error) e o número ("♥ 3"), `.c-act-hud__lives-count`. Com
  1 vida ou menos, o número fica em text/error. No desktop seguem os três corações.
- A lista vai direto no bottom sheet, sem o card do menu por cima: sem borda, raio, sombra ou fundo próprios em
  `.c-panel .c-act-sheet`, e sem o recuo de 8 do corpo do sheet (`.c-act-sheet__box .c-panel__body`). O título e as atividades
  ocupam a largura do sheet, e a lista segue rolando sozinha.

### Menu de atividades: contagem junto do rótulo (25/11/2026)

- No cabeçalho de cada atividade (menu lateral no desktop e bottom sheet no mobile), saiu a pílula "0/12" à direita.
- A contagem vai no rótulo: "ATIVIDADE 1 • 0/12". Usa o mesmo ponto de 3px (`c-cd-bullet`, text/secondary) do "MÓDULO 1 •
  1h 25min" acima.
- `.c-act-group__count` agora é um `span` dentro de `.c-act-group__label`, e o `title` "n de N concluídas" continua nele.
- **Chevron à direita** (desktop e mobile): no cabeçalho de cada atividade do menu, as informações ficam à esquerda e o chevron
  à direita. Fechada, ele aponta para baixo; aberta, gira 180° e aponta para cima (`.c-act-group__caret.is-open`). Antes ficava
  à esquerda e, fechado, girava -90°.
- **Abrir e fechar com animação** (`toggleGroup` em `js/screens/activity.js`, no mesmo modelo dos módulos do Curso):
  - **Abrir:** a lista cresce de 0 até a altura dela (300 ms), as linhas entram em sequência (25 ms entre elas) e o chevron gira
    meia volta.
  - **Fechar:** a lista encolhe até 0 e some (240 ms) e o chevron gira de volta.
  - Vale no menu lateral e no bottom sheet. Um clique durante a animação é ignorado. Com movimento reduzido, troca direto.
- **Só a atividade atual aberta ao entrar** (desktop e mobile): `closedExceptCurrent` (`js/screens/activity.js`) fecha todas as
  atividades do menu, menos a atual.
  - A atual é a do link (`?atv=n`, vindo do Curso ou do Tabuleiro) ou, sem ele, a primeira atividade que tem a mecânica aberta.
  - Vale no carregamento da tela. Depois, o que o usuário abre ou fecha fica como ele deixou.

### Atividades: botão "mais" no lugar do X (25/11/2026)

- **O X da barra virou o botão "mais"** (`more-vertical`, `toggleMore`). Ele abre as opções da atividade.
  - **Desktop:** menu suspenso de 280 embaixo do botão, alinhado à direita dele, no modelo do menu do perfil. Tem
    "Preferências" → "Efeitos sonoros" (chave `c-switch`, `toggleSound`) e "Sair da atividade", que abre a confirmação de
    sempre. Fecha com clique fora, com Esc ou no próprio botão.
  - **Mobile e tablet:** as mesmas opções num bottom sheet, mais "Ver atividades do curso", que troca para o sheet da lista
    (`moreTrail`). O botão de menu (hambúrguer) saiu; o "mais" fica sozinho à direita, na primeira linha.
- **Pílulas da barra** (tempo, sequência, vidas e pontos) alinhadas à direita no mobile e no tablet.
- **Linha de informação das mecânicas no mobile** (abaixo de 768): some o nome da mecânica ("Quiz") e o ponto depois dele. Fica
  "ícone · o que fazer · como fazer". O nome continua no HTML para leitor de tela (`.c-act-head__mech`, visualmente oculto).
- **Pílulas da linha de informação** (mobile e tablet, abaixo de 1024): a informação tem como base a largura do texto inteiro
  (`flex: 1 1 max-content`).
  - Se o texto não cabe numa linha ao lado das pílulas ("1 de 3", "0 acertos"), as pílulas descem para a linha de baixo,
    alinhadas à esquerda, e o texto fica sozinho em cima.
  - Se cabe, as pílulas seguem à direita.
  - Conferido: em 375 o texto fica em cima e as pílulas embaixo, à esquerda; em 600 e 768 fica tudo numa linha.
- **Pílulas de pontos com estrela** (desktop e mobile): na barra de desempenho, a pílula de pontos ("250 pts") e a de ganho
  ("+ 30 pts") trocaram o ícone `zap` (raio) pelo `star`, o mesmo ícone de pontos do Curso e da Rota.

- **Curso concluído: "Revisar" e card "Certificado recebido" (25/11/2026; desktop e mobile).** Com o curso concluído, o botão do card do curso deixou de ser "Ver certificado" e virou **Revisar** (ícone `rotate-ccw`, leva ao Tabuleiro). O certificado ganhou um card próprio, `certificateCard` em `js/screens/course-detail.js`, no modelo do "Sobre o curso": título "Certificado recebido", o certificado (selo `badge-3`, nome, "Recebido em" e carga horária, dados em `course.certificate` de `js/data/course-detail.js`) e o botão stroked **Ver certificado** (`#certificados`). Desktop: na coluna lateral, logo abaixo do card do curso. Mobile: na Visão geral, logo abaixo do card do curso. Só aparece com o curso concluído. Estilo em `css/screens/course-detail.css` (`.c-cd-cert`, `.c-cd-cert-m`).

- **Menu de atividades com módulos em card (rascunho de 25/11/2026; desktop e mobile).** Cada módulo virou um card recolhível (borda, radius 2xl, surface/elevated, 12 entre cards): o cabeçalho é um botão com "MÓDULO 1 • 1h 25min", o título do módulo (até 2 linhas) e o chevron à direita. Aberto, mostra os grupos "ATIVIDADE N • d/N" e cada mecânica num card próprio (ícone, título e pontos, andamento à direita; a atual com a borda da ação e fundo da marca suave), e a missão do módulo; fechado, só o cabeçalho. Ao entrar, só o módulo (e a atividade) atual fica aberto. Usa o mesmo mapa `closed` e a mesma animação dos grupos (chave `m<n>`; `groupParts` agora pega o elemento logo depois do cabeçalho). Marcação em `groups()` de `js/screens/activity/parts.js`; estilo no fim de `css/screens/activity.css`.

- **Estado da trilha nos tweaks da Atividade (25/11/2026).** Na seção Trilha, o switch "Desbloquear todas" virou a escolha **Estado da trilha**, com os mesmos estados do Curso: Não iniciado (padrão: só a 1ª disponível), Em andamento (as 5 primeiras concluídas e a 6ª atual), Concluído (todas concluídas) e Todas liberadas (nada concluído e qualquer atividade abre). No endereço: `estado=andamento|concluido|liberado`; o antigo `desbloquear=1` vale como liberado. Trocar o estado refaz o status e mantém a atividade aberta. `statusForState` e `firstOpen` em `js/screens/activity/flow.js`.
- **Capa do menu lateral da Atividade em 16:9 (25/11/2026).** A capa do curso no menu lateral (desktop) passou a ter proporção 16:9, com a imagem cobrindo a área toda e o texto (Curso, título e progresso) embaixo.

- **Tweaks da Atividade enxutos (25/11/2026).** Saíram o tweak "Atividade aberta" (o link `?item=` continua funcionando) e o "Estilo do menu de atividades": o menu fica só no estilo Capa. O estilo "Cards" foi apagado (`trailCards` em `js/screens/activity/parts.js`, `tw.trilha` em `js/screens/activity.js` e as 35 regras `.c-act-tcard*`/`.c-act-trail--cards` de `css/screens/activity.css`).

- **Cards de atividade com 4 estados (25/11/2026; desktop e mobile).** O tweak "Estado da trilha" agora também define o acesso a cada card de atividade do menu (`groupAccess` em `js/screens/activity/parts.js`): **Não iniciado**, só a 1ª atividade do módulo 1 liberada; **Em andamento**, até a 5ª atividade do módulo 1; **Concluído**, todas liberadas; nos dois primeiros, as demais ficam bloqueadas (cadeado no lugar do chevron, texto em text/secondary, contagem 0/N) e não abrem a lista de mecânicas. **Todas liberadas**: todas clicáveis (seta para a direita; o clique abre a 1ª mecânica da atividade), mas sem abrir a lista de mecânicas. *(26/11/2026: passou a abrir a lista, ver abaixo.)* Estilo no fim de `css/screens/activity.css`.

- **Mecânicas em lista e andamento na atividade (25/11/2026; desktop e mobile).** As mecânicas do menu deixaram de ser cards: viraram uma lista simples (ícone, título e "mecânica · pontos"), sem contorno, sem fundo e sem o andamento à direita; a atual fica com o fundo da marca suave. O andamento foi para o cabeçalho da atividade: anel de 24 (progressDonut) à esquerda do chevron, com a média do andamento das mecânicas dela. Atividade bloqueada mostra só o cadeado.

- **Rolagem do menu de atividades fora dos cards (25/11/2026; desktop e mobile).** A lista do menu reserva sempre o espaço da barra de rolagem (`scrollbar-gutter: stable`) dentro do respiro da direita (2 + 14 da barra = os 16 da esquerda). O card de módulo não muda de largura quando a rolagem aparece, e a barra fica no espaço entre o card e a borda do menu.

- **Sem anel de andamento na atividade (25/11/2026).** O anel de 24 no cabeçalho da atividade do menu saiu de vez: o cabeçalho fica com "ATIVIDADE N • d/N", o título e o chevron (ou o cadeado / a seta). As mecânicas continuam sem andamento.

- **Atividades em card no menu (25/11/2026; desktop e mobile).** Dentro do card do módulo, cada atividade virou um card de cantos arredondados (radius xl, borda border/default, fundo background/default, 8 entre um e outro), sem a linha embaixo do cabeçalho; aberta, as mecânicas ficam dentro do card. Os textos e os tamanhos não mudaram. Hover (atividade liberada): borda na cor da marca suave, fundo background/subtle e o chevron ou a seta na cor da marca; bloqueada não tem hover. CSS no fim de `css/screens/activity.css`.

- **Coluna padrão e escala do conteúdo das mecânicas (25/11/2026).** Coluna central padrão de **720px** (`--act-col` em `css/screens/activity.css`, era 792) para todas as mecânicas, com a barra de desempenho e o rodapé na mesma largura. Escala revista para o conteúdo caber em 1440 × 900 sem rolar: título 18/28 (era 20/32); imagens 16:9 (texto de apoio e slideshow) com no máximo min(320px, 36vh) de altura, recortadas; memória e mosaico em até 520px (cartas de ~121, eram 169); quebra-cabeça em até 560px; alternativas do quiz e da avaliação com respiro 12/16 e texto 14/20 (eram 16/20 e 16/24). Em 1440 × 900 só o slideshow (leitura longa) e o quiz com apoio rolam. Conferido em 1440, 768 e 360, sem rolagem lateral.

- **Texto de apoio e slideshow mais contidos (25/11/2026).** Título do tópico do Slideshow 18/28 800 (era fluido de 20 a 28); título do texto de apoio do Quiz 16/24 800, abaixo da pergunta (18/28); parágrafos de leitura 14/22 (eram 16/28); 16 entre imagem e texto (era 24) e 8 entre kicker, título e parágrafos (era 16). As variantes de tipografia dos tweaks (Versão B e LP 4.0) mantêm os próprios tamanhos.
- **"Todas liberadas" abre as mecânicas (26/11/2026; desktop e mobile).** No tweak "Estado da trilha" das Atividades, o estado **Todas liberadas** deixou de ser só clicável: cada card de atividade abre e fecha a lista de mecânicas (chevron), como as liberadas, e todas as mecânicas abrem para ver como funcionam, em qualquer ordem. Saiu a variante "só clicável" (`is-link`, seta para a direita) de `groupAccess` e do CSS.
- **Texto mínimo de 12px (26/11/2026; todas as telas, principalmente mobile).** Todo `font-size` abaixo de 12px (8, 10, 11 e o 80% da contagem regressiva do Ranking) virou 12px, e a altura de linha nesses blocos, quando menor que 16, virou 16px: 118 regras em 24 arquivos de CSS (fora o `catalog.css`). Ajustes de layout por causa disso: o título sobre a capa dos cards compactos de Cursos, Biblioteca e Missões fica em até 2 linhas, acima do selo de tempo e dos selos da borda (28px de respiro embaixo). O catálogo mostra a escala mobile em 12/16 e o CLAUDE.md registra a regra. Conferido em 375px em todas as telas do mockup: nenhum texto abaixo de 12px.
- **Ícones de informação em 12px (26/11/2026; mobile).** Com o texto mínimo de 12px, os ícones que acompanham texto (8 e 10px) ficaram pequenos e passaram a 12px, o mesmo dos ícones de pontos e moedas dos cards de atividade: linhas de informação dos cards (`infoLine`), selos com texto (`mpill` com rótulo; os selos só com ícone continuam com 8), tempo sobre a capa, lista de informações e caixas de pontos e moedas do Curso e da Rota, tipos de item (Biblioteca, Missões, Certificados, Loja, Eventos), valores do Extrato e os bottom sheets. Ficaram de fora os selos só de ícone, as estrelas de avaliação e os marcadores da trilha. Conferido em 375px: nenhum ícone ao lado de texto abaixo de 12px.
- **Espaço entre ícone e texto na lista de informações (26/11/2026; mobile).** Na lista do card do Curso e da Rota (usuários, acesso, certificado, atualização), o espaço entre o ícone e o texto passou de 2 para 4px, o mesmo das caixas de pontos e moedas. Nas caixas, o rótulo ("pontos disponíveis") passou a ter recuo de 16px (ícone de 12 + 4), alinhado com o número.
- **Selos de tempo (26/11/2026; mobile).** O espaço entre o relógio e o texto nos selos de tempo sobre a capa (`.c-course-compact__time` dos cards de Cursos e Rota, `.c-cd-mcard__time` do card do Curso e da Rota) passou de 2 para 4px, o mesmo da lista de informações.
- **Selos só com ícone (26/11/2026; mobile).** Os selos sem texto sobre as capas (`mobilePill` e `mpill` sem rótulo: Novo, Sugerido, Obrigatório, situação da missão) passaram de ícone de 8 em círculo de 12–14px para ícone de 12 em círculo de 20px, como os ícones que acompanham texto. A faixa de selos do card compacto de curso (`.c-course-compact__pills`) passou a ter 20px, metade para fora da capa.
- **Rota: dados dos cards numa linha só (26/11/2026; mobile).** Os cards compactos das etapas (curso, notícia, material, missão, evento) trocaram a linha de informação em duas linhas (`infoLine`) pela mesma linha do card do desktop (`stepDetails(...).meta`): ícone de 12 e as partes separadas por bullet, numa linha só, com reticências se não couber. Ex.: "1h 58min · 4 Módulos", "Evidência · Individual · Único", "Online · 10 Dez. 2026 · 14:00 - 16:00".
- **Rota: tipo da etapa como tag acima do título (26/11/2026; mobile).** "Curso", "Notícia", "Biblioteca", "Missão" e "Evento" saíram do selo escuro sobre a imagem e viraram uma tag (`tag()` com o ícone do tipo; `c-tag--mobile` no celular, ícone de 12) logo acima do título, em `kindTag()` de js/screens/learning-path.js. O `tag()` passou a usar ícone de 12 na versão mobile. No tablet e no desktop a tag foi retirada (o card não mostra o tipo e volta à altura de antes, 169px em 1440).
- **Certificado em andamento (26/11/2026; Curso, mobile e desktop).** O card do certificado (só com o curso concluído) ganhou um segundo estado, no tweak "Certificado" do Curso (`#curso?estado=concluido&certificado=andamento`; padrão: recebido). **Em andamento** indica que o certificado ainda não foi liberado porque o curso faz parte de um conjunto de cursos: título "Certificado em andamento", selo em cinza, o nome do certificado, "2 de 4 cursos concluídos · Este curso: +25%", a barra "Progresso do certificado" com o % e a dica de quantos cursos faltam, sem botão. Dados em `course.certificateSet` (js/data/course-detail.js; `done` já conta este curso e cada curso vale 100/total). Código em `certificateCard()` de js/screens/course-detail.js.
- **Certificado no formato de Materiais de apoio (26/11/2026; Curso, mobile e desktop).** Nos dois estados do card do certificado, o conteúdo segue o item de Materiais de apoio (`.c-cd-material__icon`, `__name`, `__meta`): ícone numa caixa de fundo background/subtle, nome em negrito numa linha e os dados separados por bullet ("Recebido em 12 out 2026 · 4h", "2 de 4 cursos concluídos · Este curso: +25%"). Fica o contorno do card (border/default; 8 de raio e 8 de respiro no mobile, 12 e 16 a partir de 1179). Os nomes perderam o prefixo: "LGPD Descomplicada" e "Especialista em LGPD". Saíram o selo redondo e as classes `c-cd-cert__seal/__text/__name/__meta`.
- **Certificado em andamento, dados (26/11/2026).** A linha de dados virou só "2/4 cursos concluídos": saíram o bullet e o "Este curso: +25%".
- **Tabuleiro: trilha parada ao trocar a aba do Dock (26/11/2026; desktop).** Clicar em "Sobre" ou "Materiais de apoio" no Dock refazia a tela e a faixa horizontal das Versões D e E voltava ao começo. Agora `onRender` guarda a posição da faixa (`ctx.dLeft`, atualizada no scroll) e a devolve depois de cada renderização, então nenhuma ação que redesenha a tela tira a pessoa do lugar na trilha. A centralização na atividade atual ao abrir continua igual.
- **Tabuleiro: esqueleto no desenho da trilha (26/11/2026; todas as larguras e versões).** O esqueleto deixou de ser uma faixa e seis círculos genéricos: agora é a própria trilha da versão escolhida (`skeleton()` em js/screens/board.js chama `trail()` dentro de `.c-board-skel`, com aria-hidden e inert), no mesmo tamanho e lugar, em cinza. Pins, estrada e os blocos do cartão do módulo (imagem, etiqueta, título, meta e progresso) ficam em background/skeleton; textos, ícones, estrelas, cadeados, números dos pins, a bolha "Continuar" e as dicas somem; o conjunto pulsa (lp-pulse, sem animação com prefers-reduced-motion). As medições dos cartões (`measureCards`, `measureCardsE`, `measureTrailB`) passaram a rodar também no esqueleto, para ele ter o mesmo desenho da trilha carregada e nada pular quando ela aparece. Saíram as classes `c-board-skeleton*`. Conferido em 1440 (Versão E) e 375 (trilha vertical).
- **Trilha liberada sem preenchimento (26/11/2026; Tabuleiro, todas as versões).** Com o tweak "Trilha liberada" (nada concluído e tudo disponível), a estrada não é mais preenchida com a cor do progresso: fica só o caminho. Antes as Versões B, C, E e a vertical do mobile pintavam a estrada inteira.
- **Card do curso no tablet: pontos e moedas na base (26/11/2026).** No layout de duas colunas do card de informações (768 a 1178), os infocards de pontos e moedas, embaixo da imagem, passaram a ficar presos à base do card, alinhados com o botão da coluna da direita (`align-self: end`; a coluna da direita perdeu o respiro de 8px embaixo, para o botão terminar na mesma linha), em vez de logo abaixo da imagem.
- **Card do curso no tablet: vãos que crescem (26/11/2026).** Quando a coluna da imagem (imagem + pontos e moedas) é mais alta que a da direita, a coluna da direita estica até a base do card (`align-self: stretch`) e o progresso fica com `margin-block: auto`: a sobra se divide igualmente entre "Última atualização" e o progresso e entre o progresso e o botão, que termina alinhado com os infocards. Em 1100px: 46 e 45px.
- **Certificado no Tabuleiro (26/11/2026; desktop e mobile).** Com o curso concluído, o card do certificado também aparece no Tabuleiro, com os mesmos dois estados e o mesmo tweak "Certificado" (agora também na seção Curso dos tweaks do Tabuleiro; `#tabuleiro?estado=concluido&certificado=andamento`). **Desktop:** integrado ao card de informações, sem moldura própria (`certificateCard(d, { inline: true })`, `.c-cd-cert-in`): abaixo dos infocards de pontos e moedas, separado por uma linha, com o título "Certificado recebido"/"Certificado em andamento", o certificado e o botão (só no recebido). Vale no Dock (dentro do bloco do curso), na coluna fixa, no float e no drawer da barra integrada (`summary(d, { certificate: true })`). **Mobile:** o card de seção do Curso (`certificateCard(d, { mobile: true })`) logo depois do card do curso, na aba "Sobre". `courseInfoData` passou a receber `certificado`.
- **Dock: divisória depois do certificado (26/11/2026).** No card do Dock com o curso concluído, uma linha (`.c-board-dock__rule`, border/default) separa o fim do certificado das abas "Sobre" e "Materiais de apoio".
- **Selos só com ícone no padrão do card do curso (26/11/2026; mobile).** Nos cards compactos da Rota e de Cursos, os selos sem texto de Novo e Sugerido trocaram os ícones Feather (award e zap) pelos dos selos com texto do card do curso: LP-Icons `badge-2` (Novo) e `bulb` (Sugerido); Obrigatório já usava `alert-circle`. `mobilePill` passou a aceitar `iconHtml`. Os demais selos "Novo" do app (Biblioteca, Missões, Eventos, Loja etc.) continuam com award.
- **Rota: espaço entre os selos e a tag do tipo (26/11/2026; mobile).** No card compacto, a tag do tipo (Curso, Notícia...) desceu 6px: ficam 8px entre ela e os selos de Novo, Sugerido e Obrigatório na borda da imagem (antes 2px).
- **Rota: tags alinhadas ao texto (26/11/2026; mobile).** Nos cards compactos de todas as etapas, as tags do rodapé ("Compliance", "+2") começam na mesma linha do texto da linha de dados ("1h 58min…"), depois do ícone: o rodapé passou de 10 para 16px de recuo (ícone de 12 + 4).
- **Rota: anel de progresso só no curso disponível (26/11/2026; mobile).** No card compacto de curso, o anel de progresso aparece só quando o curso está em andamento (ou liberado); bloqueado fica só com o cadeado e concluído só com o check.
- **Rota: pontos e moedas na base do card (26/11/2026; tablet e desktop).** No card de informações da Rota (infocards dentro da coluna da direita), a coluna ocupa só a linha da imagem e os infocards de pontos e moedas ficam presos embaixo (`margin-top: auto`), alinhados com o pé da imagem. Saiu a 2ª linha vazia da grade, que deixava 16px a mais embaixo do card (agora 9px em cima e embaixo da imagem).
- **Card do curso e da Rota (mobile e tablet): imagem limpa (26/11/2026).** Os selos (Novo, Sugerido, Obrigatório) saíram de cima da imagem e foram para cima do título (`.c-cd-mcard__pills`, 8px até ele). O selo escuro de duração virou a 1ª linha da lista de informações, em texto corrido com o relógio: "**3h 24min** de conteúdo". Saíram `.c-cd-mcard__over`, `__flags` e `__time`.
- **Card do curso e da Rota no tablet: selos em cima, imagem e título alinhados (26/11/2026).** Os selos saíram da coluna da direita e viraram uma linha própria no topo do card (`.c-cd-mcard__pills`, filho direto do card), alinhados à lateral esquerda da imagem; a imagem e o título começam na mesma altura (a coluna da direita perdeu o respiro de 4px em cima). Grade: linha 1 selos, linha 2 imagem e informações, linha 3 os infocards do Curso. No mobile os selos continuam entre a imagem e o título.
- **Certificado em andamento: botão de volta (26/11/2026).** O botão "Ver cursos do certificado" (stroked, chevron-right, leva à Rota) voltou ao fim do card, no Curso e no Tabuleiro (desktop e mobile).
- **Certificado em andamento: texto do botão (26/11/2026).** "Ver cursos do certificado" virou "Ir para certificado" (mesmo destino, a Rota).
- **Rota: tag do tipo de volta no tablet e desktop (26/11/2026).** A tag do tipo da etapa (Curso, Notícia, Biblioteca, Missão, Evento) voltou a aparecer acima do título nos cards de tablet e desktop (`kindTag`), como no mobile. O card ganha a altura da tag (178–198px em 1440).
- **Rota: selos na borda da imagem (26/11/2026; tablet e desktop).** Nos cards das etapas, os selos Novo, Sugerido e Obrigatório saíram da linha dos dados e voltaram para a borda de baixo da imagem, metade para fora, como no card compacto do mobile: só o ícone (12, círculo de 20, `c-mobile-pill`) com o nome no title e no aria-label. A imagem ganhou a moldura `.c-lp-course__frame` (posição dos selos).
- **Rota: sem a linha de dados nos cards das etapas (26/11/2026; todas as larguras).** Saiu a linha com ícone e partes separadas por bullet ("1h 58min · 4 Módulos", "Publicado há 2 dias · 4 min de leitura", "Arquivo · 12 Set. 2026", "Evidência · Individual · Único", "Online · 10 Dez. 2026 · 14:00 - 16:00") de todos os cards, no desktop e no mobile. `stepDetails().meta` continua montado, sem uso.
- **Rota: tags alinhadas ao título (26/11/2026; mobile).** Sem a linha de dados, as tags do rodapé dos cards compactos passaram a começar na lateral esquerda do título (recuo 0, antes 16).
- **Rota: sem chevron no card compacto (26/11/2026; mobile).** A etapa disponível não mostra mais o chevron-right no fim do rodapé (o card todo é o link); bloqueada continua com o cadeado e concluída com o check.
- **Rota: tipo da etapa sem tag (26/11/2026; todas as larguras).** O indicativo do tipo (Curso, Notícia, Biblioteca, Missão, Evento) deixou de ser uma tag com fundo: agora é só o ícone (12 no mobile, 16 no tablet e desktop, icon/default) e o texto em text/secondary 600 (12/16 no mobile, 14/20 a partir de 768).
- **Rota no tablet: pílula na altura do título (26/11/2026).** No card de informações da Rota (`.c-cd-mcard--rota`), a pílula "Novo" fica só na coluna da imagem, e a coluna da direita começa na 1ª linha: a pílula e o título ficam na mesma altura, e a imagem desce junto, logo abaixo da pílula. No Curso, os selos continuam numa linha própria em cima de tudo.
- **Card do Curso no tablet: selos na altura do título (26/11/2026).** Como na Rota: os selos ficam só na coluna da imagem (linha 1), e a coluna da direita começa nessa linha, então o topo dos selos e o do título ficam alinhados; a imagem vem logo abaixo dos selos. Regra única para Curso e Rota (o modificador `.c-cd-mcard--rota` continua na marcação).
- **Card do Curso no tablet: espaços iguais na coluna da imagem (26/11/2026).** Selos, imagem e infocards de pontos e moedas ficam sempre com 16px entre si (o gap do card): os infocards deixaram de ficar presos à base e vêm logo abaixo da imagem, e os selos perderam o ajuste de -8px. A coluna da direita continua esticando os vãos em volta do progresso quando a da esquerda é mais alta.
- **Card do Curso e da Rota no tablet: imagem que cresce (26/11/2026).** Para ter os dois ao mesmo tempo, espaços fixos de 16px entre selos, imagem e infocards e os infocards sempre na mesma distância da borda de baixo, a linha da imagem passou a ser a que cresce (`grid-template-rows: auto 1fr auto`; a imagem estica com `height: 100%` e `object-fit: cover`). Quando a coluna da direita é mais alta, a imagem fica mais alta que 16:9 e corta as laterais; quando é mais baixa, os vãos em volta do progresso crescem.
- **Título do card de informações em 14px (26/11/2026; Curso e Rota, mobile e tablet).** `.c-cd-mcard__title` passou de 12/16 para 14/20 (700), para se destacar das informações (12/16).
- **Padronização de arredondamento (26/11/2026).** Regra: card 8px no mobile/compactos e 16px no tablet/desktop; imagem encostada na borda segue o raio do card; imagem recuada usa máx(4, raio do card − respiro). Levantamento em 375, 1000 e 1440: os cards compactos (8 / imagem 4), os cards de capa de ponta a ponta (16 / 16) e o cartão do módulo da Versão E (16, respiro 8 / 8) já seguiam. Corrigidos: card de etapa da Rota (tablet: imagem 6 → 4; desktop: card 12 → 16 e imagem 8 → 4, inclusive a capa quadrada da biblioteca e a capa de exemplo) e a capa do Dock do Tabuleiro (12 → 4). Regra registrada no HANDOFF e no CLAUDE.md.
- **Card do Curso e da Rota no tablet: imagem sempre 16:9 e laterais iguais (26/11/2026).** A imagem deixou de esticar: fica sempre em 16:9 (a linha que cresce passou a ser a dos infocards, que seguem presos à base do card no Curso; na Rota eles seguem na base da coluna da direita). A coluna da direita perdeu o respiro extra de 8px à direita, então o card tem 8px nas duas laterais.
- **Card do Curso no tablet: vãos iguais na coluna da imagem (26/11/2026).** Selos, imagem (sempre 16:9) e infocards ficam com o mesmo espaço entre eles: a grade tem linhas de respiro `minmax(16px, 1fr)` entre os três, que dividem a sobra igualmente quando a coluna da direita é mais alta. Selos no topo (altura do título), infocards a uma distância fixa da borda de baixo. Na Rota (sem infocards na esquerda), a imagem fica no pé do card.
- **Rota mobile: mais espaço entre os cards (26/11/2026).** Abaixo de 768, os cards das etapas (curso, notícia, biblioteca, missão, evento) ficam a 16px um do outro (antes 8); o trilho continua sem falha no vão.
- **Tabuleiro no tablet: trilha vertical com as curvas da Versão E (26/11/2026; 768 a 1178).** No lugar da coluna reta, a estrada sai do meio do cartão do módulo, desce 112px e vai e volta na horizontal entre duas faixas (meia largura de até 260px), descendo 168px a cada volta, com os cantos arredondados da E (`roundedSegs`, raio 32), e entra no meio do cartão seguinte. Os pins ficam espaçados por igual ao longo do caminho (168px), cada trecho na cor do módulo, com o progresso até o pin atual (nada preenchido na trilha liberada). Código em `trailVCurvedLayout` e no ramo de tablet de `trailV` (js/screens/board.js), classe `.c-board-vtrail--curved`. O mobile continua com a coluna reta e o desktop com a E horizontal. Conferido em 768 e 900: nenhum pin encosta nos cartões nem sai da tela.
- **Rota: etapas que não são curso no formato de Materiais de apoio (26/11/2026; todas as larguras).** Notícia, biblioteca, missão e evento trocaram o card com imagem e tags por um card só com o conteúdo do item de Materiais de apoio (`stepItem` em js/screens/learning-path.js, `.c-lp-step`): ícone do tipo em caixa, título em negrito numa linha e "tipo · dado" (minutos de leitura, tipo do material, tipo da missão ou data do evento), mantendo o contorno do card (raio 8 e respiro 8 no mobile; 16 e 16 a partir do tablet). À direita: cadeado (bloqueada), check verde (concluída) ou, a partir do tablet, chevron. O card de curso não mudou.
- **Rota: espaço, notícia e bloqueadas (26/11/2026).** 16px entre os cards em todas as larguras (antes 8 no tablet e desktop). A notícia usa o ícone `globe` e mostra 3 linhas do texto (`excerpt` nos dados, com reticências) e "Continuar lendo" no estilo do Link small (é um `span`: o card todo já é o link). Etapas bloqueadas não ficam mais apagadas: textos e ícones nas cores normais, só o cadeado indica o bloqueio.
- **Rota: tipo em cima, título embaixo (26/11/2026).** Nos cards de notícia, biblioteca, missão e evento, a ordem inverteu: na 1ª linha, o ícone do tipo (sem a caixa em volta; 12 no mobile, 16 a partir do tablet) junto de "tipo · dado", como o tipo do card de curso; na 2ª, o título. Os tamanhos de fonte não mudaram.
- **Rota: 4px entre o tipo e o título (26/11/2026).** Nos cards de notícia, biblioteca, missão e evento, a linha "tipo · dado" ganhou 4px de espaço até o título (antes 0).
- **Rota: card de curso com a mesma formatação dos cards de conteúdo (26/11/2026; todas as larguras).** A linha do tipo virou "ícone + Curso · tempo" em 12/16 500 text/secondary (antes "Curso" em 600, 14/20 a partir do tablet), 4px acima do título, e o título passou a 12/16 700 text/default (antes 14/20 text/primary no tablet e desktop; 12/18 no mobile), como na notícia, biblioteca, missão e evento.
- **Rota: progresso no card de missão (26/11/2026).** O card da missão ganhou a barra de progresso do card de Missões (`progressLabeled`: "Progresso x%" e a barra), 8px abaixo do título, na largura do texto.
- **Rota: ícone da biblioteca e notícia sem chevron (26/11/2026).** O tipo Biblioteca passou a usar o ícone `file-text` (antes `bookmark`), e o card de notícia não mostra mais o chevron no canto (o "Continuar lendo" já indica a ação; cadeado e check continuam).
- **Rota: cantos, cadeado e "Continuar lendo" (26/11/2026).** Os cards de conteúdo seguem o raio do card de curso (8 até 1178, 16 a partir de 1179). O cadeado e o check ficam na base direita do card. Na notícia, "Continuar lendo" fica na base direita, sem a seta, e não aparece quando a notícia está bloqueada.
- **Rota: "Continuar lendo" no fim do texto da notícia (26/11/2026).** O link passou para a última linha do parágrafo, logo depois das reticências, com 8px entre os dois (espaçador flutuante + link flutuando dentro do bloco com line-clamp).
- **Rota: espaço antes de "Continuar lendo" (26/11/2026).** 8px no mobile e 16px a partir do tablet entre o fim do parágrafo e o link (é o espaço mínimo: as reticências só entram no fim de uma palavra, então pode sobrar um pouco mais).
- **Rota: respiro dos cards de conteúdo igual ao do card de curso (26/11/2026).** 8px até 1178 (antes 16 no tablet) e 16px a partir de 1179, como o card de curso.
- **Rota: sem selos nos conteúdos (26/11/2026; todas as larguras).** Os selos Novo, Sugerido e Obrigatório saíram dos cards de curso da lista de conteúdos (borda da imagem no desktop/tablet e no card compacto do mobile). O selo "Novo" do card de informações da Rota continua.
- **Tabuleiro: espaçamento padronizado entre os pins (26/11/2026).** Na Versão E (desktop e mobile horizontal) e na trilha vertical com curvas do tablet, os pins ficam sempre à mesma distância um do outro, medida ao longo do caminho da trilha (Versão E: `z.step`, 168px no desktop e 132px no mobile; tablet: 168px). O grupo de pins de cada módulo fica centrado no trecho, com a mesma folga até o cartão de cada ponta. Antes o passo era o trecho dividido pelo número de pins e mudava de módulo para módulo. A trilha vertical reta do mobile já tinha passo fixo.
- **Tabuleiro: pins por trecho da trilha (26/11/2026; desktop e tablet).** Substitui o passo fixo. Os pins são distribuídos pelos trechos retos do caminho (`pathSlots` em js/screens/board.js), nunca nas curvas (48px de folga até cada curva): **desktop (Versão E)**, 2 pins em cada trecho vertical e 1 em cada horizontal; **tablet (trilha vertical com curvas)**, 1 pin em cada trecho vertical e 3 em cada horizontal (menos, se o trecho for curto). Nos dois, o primeiro trecho logo depois do cartão do módulo e o último antes do cartão seguinte (ou da chegada) têm 1 pin, a 104px do cartão. A trilha ganha voltas até caber todos os pins do módulo; se sobrar vaga, saem pins dos trechos do meio, a partir do fim. No tablet, a descida ao sair e ao entrar nos cartões passou a 220px e cada volta a 200px. Mobile sem mudança. Conferido em 1440 e 900: 24 pins, nenhum encostando em cartão ou em outro pin.
- **Tabuleiro no tablet: sem pins nas descidas dos cartões e horizontais com 2 pins em terços (26/11/2026).** Os trechos verticais que saem de um cartão de módulo e entram no seguinte ficam sem pins (atividade, avaliação ou missão); os demais seguem a regra (verticais 1, horizontais 3). Trecho horizontal com 2 pins fica dividido em 3 partes iguais (pins a 1/3 e 2/3 dele). Opções `edgeFree` e `thirds` de `pathSlots`. Quando sobra vaga, sai 1 pin de cada trecho do meio a partir do fim, então as primeiras fileiras ficam completas (3 pins) e só as do fim ficam com 2 (em terços) ou vazias.
- **Tabuleiro desktop: sem tamanho mínimo de trecho (26/11/2026).** A Versão E no desktop deixou de exigir o comprimento mínimo por módulo (`z.minLeg`): cada trecho tem só as voltas necessárias para os pins do módulo, então não sobram voltas vazias antes do cartão seguinte. O mobile não muda.
- **Tabuleiro no tablet: pins por tipo de trecho (26/11/2026).** Regra fixa: as descidas que saem do cartão e entram no seguinte nunca têm pin; a meia fileira de saída e a de chegada têm 1 pin; cada trecho vertical entre fileiras tem 1; cada fileira inteira tem 2 (em terços) ou 3. O número de fileiras é o menor em que cabem os pins do módulo, então nenhum trecho fica vazio. Módulo com 1 pin: um trecho reto de 360px até o cartão seguinte, com o pin no meio.
