# Cor primária: regra da plataforma

Fonte da verdade: o gerador (`src/theme.ts`), definido na conversa "Variação de cor primária".
Os tokens do Figma (`tokens.css`) continuam como referência histórica; onde divergem, vale o gerador.

## Regra

- **Entrada:** um hexadecimal por cliente (a semente). Aceita 3 ou 6 dígitos.
- **Escala:** 11 passos (50 a 950) em OKLCH, mantendo o matiz. A semente entra no passo de luminosidade mais próxima.
- **Tokens semânticos** (componentes usam estes, nunca o passo direto, exceto nas regras de layout por passo):

| Token | Regra |
|---|---|
| `brand` | cor exata da semente |
| `on-brand` | branco ou passo 950, o que tiver mais contraste |
| `action` | brand escurecida até 4.5:1 com branco |
| `on-action` | branco ou passo 950 |
| `action-hover` / `action-active` | action com L ±0.06 e ±0.12 |
| `ui` | brand até 3:1 com branco |
| `strong` | brand até 7:1 com branco |
| `subtle` | passo 50 |
| `border` | passo 200 |

- Sucesso, erro e aviso são fixos e não derivam da primária.

## Ligação com os tokens do Figma

| Token do Figma | Agora |
|---|---|
| `surface/system-subtle` | brand-50 |
| `surface/system-light` | brand-100 |
| `surface/system-soft` | brand-200 |
| `surface/system-muted` | brand-400 |
| `surface/system-accent` | action |
| `surface/system-default` | action |
| `surface/system-strong` | action-hover |
| `surface/system-emphasis` | brand-900 |

## O que muda para a semente #7b2fbe

Distância perceptual ΔE (OKLab ×100): abaixo de 2 quase não se vê; de 2 a 5 é leve; acima de 5 é visível.

| Token | Figma | Gerador | ΔE |
|---|---|---|---|
| system-subtle | `#F7F1FD` | `#F9F5FF` | 1.0 |
| system-light | `#EFE3FB` | `#E7D7FF` | 3.6 |
| system-soft | `#D9B5F7` | `#D6BAFE` | 1.4 |
| system-muted | `#A35CEA` | `#B086E5` | 10.1 |
| system-accent | `#8E3FD1` | `#7B2FBE` | 5.5 |
| system-default | `#7B2FBE` | `#7B2FBE` | 0.0 |
| system-strong | `#5A1AA0` | `#6A15AA` | 3.5 |
| system-emphasis | `#3B0D68` | `#3E0568` | 1.1 |

Mudanças de estrutura:

- A semente é o passo **700** (no Figma era o 600).
- A escala tem **11** passos; o Figma tinha 10. O passo 950 é novo.
- `accent` e `default` viram a mesma cor (`action`), para garantir contraste nos links.
- Hover e pressed dos botões preenchidos usam `action-hover` e `action-active`.
- Texto sobre botão usa `on-action`, não mais `#f8f8f8` fixo.
- As rampas gray, red, yellow, green e blue não mudam.

## Verificação

```bash
node scripts/theme-check.ts
```

Roda 7 cores fixas e 1000 aleatórias (contraste mínimo de `on-action`, `action`, `ui` e `strong`) e imprime a comparação com a rampa do Figma.
