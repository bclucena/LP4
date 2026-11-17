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
