# HughMoney — site de pré-lançamento

Site institucional estático (HTML, CSS e JavaScript puros, sem build) para captar interessados enquanto o aplicativo é construído.

## Estrutura

```
index.html          página única com todas as seções
css/styles.css      estilos (tokens de cor, modo claro/escuro, responsivo)
js/main.js          menu mobile, calculadora de juros compostos, formulário da lista de espera
assets/favicon.svg  ícone
```

## Como rodar localmente

Abra `index.html` direto no navegador, ou sirva a pasta:

```
npx serve .
```

## Seções da página

Público-alvo desta primeira fase, que o texto inteiro mira: qualquer pessoa (18+, residente nos EUA) que quer construir patrimônio no próprio ritmo mas **não tem renda fixa**: freelancers, motoristas e entregadores de app, quem vive de gorjeta, autônomos, estudantes com bicos. Em segundo plano, quem aprende sobre dinheiro em redes sociais e nunca teve uma ferramenta que coubesse na sua vida.

Slogan oficial (em inglês no site): **"Investing for people without a steady paycheck. Build wealth at your own pace. HughMoney understands how you earn and invests accordingly."** Está no título do hero, no título da aba, nas meta tags e no rodapé.

1. **Hero** com o slogan como título e subtítulo, chamada para lista de espera e mockup do app mostrando "payout recebido → 5% investido" e "semana fraca → pulada sem penalidade".
2. **Faixa de fatos** ($1 basta para investir, zero depósitos fixos obrigatórios, zero saldo mínimo, 18+).
3. **Para quem é**: comparação "o que a maioria dos apps assume" (salário fixo quinzenal, débito automático em data fixa, saldo mínimo) vs. "em torno do que a HughMoney é construída" (renda que varia, investir quando o dinheiro chega, pausar sem penalidade).
4. **Por que o seu ritmo funciona** com calculadora interativa (aporte **médio** mensal, padrão $20, com equivalente semanal): compara começar na idade X vs. 10 anos depois, com gráfico, tooltip e versão em tabela.
5. **Como vai funcionar** (abrir conta sem comprovação de renda fixa → dizer como você recebe → ir no seu ritmo).
6. **O que estamos construindo** (6 recursos: ações fracionadas, investir quando recebe, round-ups e toque de sobra, orientação sem hype, metas que acompanham a renda, aposentadoria sem empregador via Roth IRA).
7. **Segurança** (texto no futuro, pois o custodiante ainda não foi contratado).
8. **Roadmap** (Agora: construindo → Beta privado → Lançamento público).
9. **FAQ** incluindo "o app já existe?", "quando lança?", "minha renda muda todo mês", "tem mês que não consigo investir nada", "devo investir sem reserva de emergência?" e "como isso é diferente do TikTok/YouTube?".
10. **Lista de espera** e rodapé com disclosures.

O site não menciona preço nem modelo de cobrança de propósito: o modelo ainda não foi definido.

## O que você precisa ajustar antes de publicar

- **Lista de espera:** hoje o formulário só valida o e-mail e guarda uma cópia no `localStorage` do navegador. Para receber os e-mails de verdade, adicione `data-endpoint="https://sua-api/waitlist"` na tag `<form id="waitlist-form">`. O script faz um `POST` JSON com `{ email, source }`. Serviços simples que funcionam com isso: Formspree, Getform, Basin, ou uma função serverless (Vercel/Netlify/Cloudflare) que grava no seu banco ou no Mailchimp/Beehiiv.
- **Disclosures do rodapé:** os textos `[Partner Broker-Dealer, LLC]` e `[Partner Bank]` são placeholders. Só afirme filiação FINRA/SIPC e cobertura FDIC depois de fechar contrato com o parceiro, e peça revisão de um advogado de securities. Nos EUA, promessas sobre retorno e proteção são regulamentadas.
- **Links legais:** Privacy policy, Terms of use e Disclosures apontam para `#`. Crie as páginas.
- **E-mail:** `hello@hughmoney.com` no rodapé.
- **Idade/estados:** o texto diz "18+ e residente nos EUA". Ajuste se o plano mudar.
- **Datas do roadmap:** propositalmente sem datas. Se tiver uma previsão pública, adicione nos cards da seção `#roadmap`.

## Tema de cores

Creme, branco e amarelo, com o amarelo usado só como destaque (escolha do fundador). Regras que o CSS segue:

- Fundo da página creme `#FBF6E9`, cards brancos, seções alternadas em creme mais escuro `#F4ECD8`.
- Texto e ícones em quase-preto quente `#1A1611`. Amarelo nunca é usado como cor de texto sobre creme ou branco (contraste insuficiente).
- Amarelo `#FFC928` em botões (sempre com texto escuro), badges, bordas de destaque e no "marca-texto" sob o trecho em evidência do slogan.
- Textos pequenos coloridos (eyebrows, links, dicas) usam âmbar escuro `#9A6B00`, legível sobre creme.
- O site é fixado no modo claro pelo atributo `data-theme="light"` na tag `<html>`, mesmo para visitantes com o sistema em modo escuro (decisão do fundador). O CSS do modo escuro continua no arquivo; para voltar a seguir o sistema, basta remover o atributo.
- Todos os tokens estão no topo de `css/styles.css`. Para ajustar o tom de amarelo, mude `--primary`, `--primary-hover` e `--primary-soft`.

## Calculadora

- Aporte mensal, idade inicial e retorno anual assumido são ajustáveis; aposentadoria fixa em 65.
- Fórmula: capitalização mensal, aporte ao fim de cada mês, sem taxas nem impostos (está escrito no aviso do rodapé).
- Cores das duas séries (âmbar e azul) foram validadas para daltonismo e contraste sobre o creme e sobre o fundo escuro.

## Publicação

Qualquer hospedagem estática serve: Vercel, Netlify, Cloudflare Pages, GitHub Pages. Aponte o domínio, suba a pasta inteira e pronto.
