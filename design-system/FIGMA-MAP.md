# Mapa do Figma: LP-DesignSystem 4.0

- Arquivo: https://www.figma.com/design/3NRrDyxpWYIJD52LwuoysG/LP-DesignSystem-4.0
- fileKey: `3NRrDyxpWYIJD52LwuoysG`
- Título interno das páginas de fundamentos: "LUDOS PRO DESIGN SYSTEM, AGOSTO 2026"

## Páginas (node ids)

| Grupo | Página | Node id |
|---|---|---|
| Base | Capa | 0:1 |
| Base | Foundations (color, typography, size e spacing, effects) | 1993:63904 |
| Base | Icones | 191:676 |
| Base | Itens | 57:2195 |
| Base | Logo | 754:1472 |
| Base | Tipografia | 1823:48777 |
| Componentes | Buttons | 1927:46267 |
| Componentes | Avatar | 1909:37184 |
| Componentes | Chips | 1982:47848 |
| Componentes | Interaction icons | 1948:17414 |
| Componentes | Link | 1993:68422 |
| Componentes | Pagination | 1993:78381 |
| Componentes | Pills | 1962:53307 |
| Componentes | Tags | 1982:39388 |
| Componentes | Tooltips | 1982:13748 |
| Componentes | componentes mobile | 2525:26275 |
| Telas | B.Gestores | 4694:17004 |
| Telas | LayoutDesign | 1741:47455 |
| Telas | X.Login | 1664:63475 |
| Telas | X.Tela de introdução | 2906:124017 |
| Telas | X.Termometro Emocional | 1655:46975 |
| Telas | X.Mecânicas | 1132:3912 |
| Telas | X.Home | 717:5636 |
| Telas | X.Search | 3007:19083 |
| Telas | 3.1. Cursos - Interna | 1741:21440 |
| Telas | --->MOBILE (separador) | 2093:75653 |
| Lixo | Trash can | 57:2196 |

## Frames de Foundations

- color: 1995:347 (ramps gray, red, yellow, green, blue, purple, black e white, mais semânticos text, background, border, icon e surface)
- typography: 1995:66756
- size e spacing: 1995:66878
- effects: 1995:67138

Os tokens extraídos estão em `tokens.css`.

## Pendências e inconsistências no Figma

1. **Tipografia, rótulo vs. render.** Em alguns estilos o rótulo diverge do tamanho renderizado: `display-lg` diz 48/48 mas renderiza 36px, `heading` diz 20/32 mas tem line-height 26, e a escala primitiva mostra `4xl (36px)` renderizado em 32px e `5xl (48px)` também em 32px. O `tokens.css` seguiu os rótulos. É preciso confirmar com o design.
2. **Fonte.** A página diz "Plus Jakarta Sans". As anotações da página (títulos, rótulos) usam Inter, que é só o estilo do documento de apresentação.
3. **Sombras.** `shadow-lg` e `shadow-xl` têm valores idênticos no Figma.
4. **Variáveis de tipografia, spacing e effects.** O Figma só expôs variáveis de cor. Os demais tokens foram lidos do desenho, não de variáveis.
5. **Escala de spacing.** São 35 tokens e o Figma lista de 1px a 384px nesta página. A descrição diz "0 a 256px".
6. **Cor do roxo de apresentação.** As barras de preview usam #8f59d9, que não existe nas ramps (purple-500 é #8e3fd1).
