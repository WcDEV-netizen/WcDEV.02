/* =========================================================
   WC DEV — CSS (trilha em ordem: do básico ao avançado)
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

WCDEV.temas.push(
  {
    id: "css-intro",
    lang: "css",
    titulo: "O que é CSS e como ligar no HTML",
    chaves: ["o que e css", "pra que serve css", "ligar css", "ligar css no html", "conectar css", "link css", "stylesheet", "arquivo css", "style.css"],
    resposta: `### O que é CSS? 🎨
CSS deixa o site **bonito**: cores, tamanhos, posições, animações.

Crie um arquivo {{style.css}} e ligue no {{<head>}} do HTML:
~~~html
<link rel="stylesheet" href="style.css">
~~~
Uma regra de CSS tem esse formato:
~~~css
seletor {
  propriedade: valor;
}

h1 {
  color: blue;
  font-size: 40px;
}
~~~
⚠️ Não esqueça o {{;}} no fim de cada linha!`,
    sugestoes: ["seletores css", "cores css"],
  },
  {
    id: "css-seletores",
    lang: "css",
    titulo: "Seletores",
    chaves: ["seletor", "seletores", "selecionar", "class", "id", "classe css", "id css", "ponto", "hashtag", "estilizar class"],
    resposta: `### Seletores
Dizem **quais elementos** vão receber o estilo:
~~~css
p { color: gray; }              /* todas as tags <p> */

.card { background: black; }    /* class="card" */

#topo { height: 80px; }         /* id="topo" */

nav a { color: white; }         /* links dentro do nav */

h1, h2 { font-family: Arial; }  /* vários ao mesmo tempo */

* { margin: 0; padding: 0; }    /* todos os elementos */
~~~
Resumo: **ponto** {{.}} = class, **cerquilha** {{#}} = id.`,
    sugestoes: ["cores css", "fontes css"],
  },
  {
    id: "css-cores",
    lang: "css",
    titulo: "Cores e fundos",
    chaves: ["cor", "cores", "color", "background", "fundo", "cor de fundo", "hex", "rgb", "gradiente", "gradient", "mudar a cor", "imagem de fundo"],
    resposta: `### Cores e fundos
~~~css
h1 {
  color: #1e90ff;                 /* cor do texto (hex) */
  background-color: black;        /* cor de fundo */
}

.caixa {
  color: rgb(255, 255, 255);
  background: rgba(0, 0, 0, 0.5); /* 0.5 = meio transparente */
}

body {
  background: linear-gradient(to right, #000000, #0b3d91);
}

.banner {
  background-image: url("fundo.jpg");
  background-size: cover;
}
~~~
Formas de escrever cor: nome ({{red}}), hex ({{#ff0000}}), {{rgb(255,0,0)}}.`,
    sugestoes: ["fontes css", "box model css"],
  },
  {
    id: "css-texto",
    lang: "css",
    titulo: "Fontes e texto",
    chaves: ["fonte", "fontes", "font", "font-size", "tamanho do texto", "tamanho da letra", "google fonts", "text-align", "centralizar texto", "negrito css", "sublinhado"],
    resposta: `### Fontes e texto
~~~css
p {
  font-family: Arial, sans-serif;
  font-size: 18px;
  font-weight: bold;        /* negrito */
  font-style: italic;       /* itálico */
  text-align: center;       /* left, right, center */
  line-height: 1.6;         /* espaço entre linhas */
  text-decoration: none;    /* tira sublinhado dos links */
  text-transform: uppercase;
  letter-spacing: 2px;
}
~~~
Fontes bonitas grátis: **Google Fonts**. Escolha uma, copie o {{<link>}} pro HTML e use o nome no {{font-family}}.`,
    sugestoes: ["box model css", "display css"],
  },
  {
    id: "css-box",
    lang: "css",
    titulo: "Box model: margin, padding e border",
    chaves: ["box model", "margin", "padding", "border", "borda", "espaco", "espacamento", "width", "height", "largura", "altura", "border-radius", "arredondar", "sombra", "box-shadow"],
    resposta: `### Box model
Todo elemento é uma caixa com 4 camadas:
**conteúdo → padding → border → margin**
~~~css
.card {
  width: 300px;
  height: 200px;
  padding: 20px;              /* espaço DENTRO da caixa */
  border: 2px solid #1e90ff;  /* borda */
  margin: 30px;               /* espaço FORA da caixa */
  border-radius: 12px;        /* cantos arredondados */
  box-shadow: 0 0 15px #1e90ff88;  /* sombra/brilho */
}

* { box-sizing: border-box; }  /* largura já inclui padding e borda */
~~~
Atalhos: {{margin: 10px 20px}} = 10 em cima/baixo, 20 nos lados.`,
    sugestoes: ["display css", "flexbox"],
  },
  {
    id: "css-display",
    lang: "css",
    titulo: "Display e position",
    chaves: ["display", "block", "inline", "none", "esconder", "position", "absolute", "relative", "fixed", "sticky", "z-index", "fixar no topo"],
    resposta: `### Display e position
~~~css
.oculto { display: none; }     /* esconde */
span    { display: block; }    /* ocupa a linha toda */
a       { display: inline-block; }
~~~
**Position:**
~~~css
.pai   { position: relative; }
.selo  { position: absolute; top: 10px; right: 10px; } /* relativo ao pai */

.menu  { position: fixed; top: 0; width: 100%; }  /* fica parado ao rolar */
.topo  { position: sticky; top: 0; }               /* gruda ao rolar */
~~~
{{z-index}} decide quem fica **na frente** (maior = mais na frente).`,
    sugestoes: ["flexbox", "grid css"],
  },
  {
    id: "css-flex",
    lang: "css",
    titulo: "Flexbox (alinhar e centralizar)",
    chaves: ["flexbox", "flex", "centralizar", "centralizar uma div", "centralizar a div", "centralizar elemento", "centralizar div", "alinhar", "lado a lado", "justify-content", "align-items", "gap", "um do lado do outro"],
    resposta: `### Flexbox
A forma mais fácil de **alinhar** e **centralizar** coisas:
~~~css
.container {
  display: flex;
  justify-content: center;  /* horizontal */
  align-items: center;      /* vertical */
  gap: 20px;                /* espaço entre os itens */
}
~~~
Centralizar algo no meio da tela:
~~~css
body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
~~~
Valores úteis do {{justify-content}}: {{flex-start}}, {{center}}, {{space-between}}, {{space-around}}.
{{flex-direction: column}} coloca um **embaixo** do outro.`,
    sugestoes: ["grid css", "responsivo css"],
  },
  {
    id: "css-grid",
    lang: "css",
    titulo: "Grid (layouts em grade)",
    chaves: ["grid", "grade", "colunas", "grid-template-columns", "galeria", "cards em grade"],
    resposta: `### CSS Grid
Perfeito pra galerias e layouts em colunas:
~~~css
.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 colunas iguais */
  gap: 16px;
}

/* se ajusta sozinho ao tamanho da tela */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
~~~
{{1fr}} = uma fração do espaço disponível.`,
    sugestoes: ["responsivo css", "hover e transição"],
  },
  {
    id: "css-responsivo",
    lang: "css",
    titulo: "Site responsivo (celular)",
    chaves: ["responsivo", "responsividade", "celular", "mobile", "media query", "@media", "tela pequena", "vw", "vh", "rem", "porcentagem"],
    resposta: `### Responsivo: funcionar no celular 📱
Primeiro, no HTML, não esqueça:
~~~html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
~~~
No CSS, use **media queries**:
~~~css
.container {
  display: flex;
  gap: 20px;
}

/* telas menores que 768px */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  h1 { font-size: 28px; }
}
~~~
Medidas flexíveis: {{%}}, {{vw}}/{{vh}} (tamanho da tela), {{rem}} (relativo à fonte).`,
    sugestoes: ["hover e transição", "animações css"],
  },
  {
    id: "css-hover",
    lang: "css",
    titulo: "Hover e transição",
    chaves: ["hover", "passar o mouse", "transition", "transicao", "efeito", "efeito no botao", "botao bonito", "cursor", "estilizar botao"],
    resposta: `### Hover e transição
{{:hover}} muda o estilo quando o mouse passa por cima:
~~~css
.botao {
  background: #1e90ff;
  color: black;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;   /* muda suavemente */
}

.botao:hover {
  background: #5cb8ff;
  transform: scale(1.05);   /* aumenta um pouquinho */
  box-shadow: 0 0 20px #1e90ff;
}
~~~`,
    sugestoes: ["animações css", "projeto css"],
  },
  {
    id: "css-animacao",
    lang: "css",
    titulo: "Animações",
    chaves: ["animacao", "animacoes", "animation", "keyframes", "animar", "girar", "rotate", "piscar", "pulsar"],
    resposta: `### Animações com @keyframes
~~~css
@keyframes pulsar {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.logo {
  animation: pulsar 1.5s infinite;
}

@keyframes girar {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.carregando {
  animation: girar 1s linear infinite;
}
~~~
Formato: {{animation: nome duração repetição}}.`,
    sugestoes: ["projeto css"],
  },
  {
    id: "css-projeto",
    lang: "css",
    titulo: "Projeto: card azul e preto",
    chaves: ["projeto css", "card", "exercicio css", "tema escuro", "dark mode", "estilo wc dev"],
    resposta: `### Projeto: card no estilo WC DEV 💙🖤
HTML:
~~~html
<div class="card">
  <h2>WC DEV</h2>
  <p>Aprendendo a programar todo dia.</p>
  <button class="botao">Começar</button>
</div>
~~~
CSS:
~~~css
body {
  background: #05070d;
  color: #dbe6ff;
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.card {
  background: #0b0f1a;
  border: 1px solid #1e90ff;
  border-radius: 16px;
  padding: 30px;
  width: 300px;
  text-align: center;
  box-shadow: 0 0 25px #1e90ff44;
}

.card h2 { color: #1e90ff; }

.botao {
  margin-top: 15px;
  background: #1e90ff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}

.botao:hover { background: #5cb8ff; }
~~~`,
    sugestoes: ["/python", "/html"],
  }
);

/* =========================================================
   CSS — CONSULTA (cada item: nome, explicação, exemplo, palavras extras)
   ========================================================= */
WCDEV.refs = WCDEV.refs || [];

WCDEV.refs.push({ lang: "css", grupo: "Propriedade de texto e fonte", itens: [
  ["color", "Cor do **texto**.", `p { color: #1e90ff; }`, "cor do texto|cor da letra|cor da fonte"],
  ["font-family", "A **fonte** (tipo de letra). Coloque alternativas separadas por vírgula.", `body { font-family: "Poppins", Arial, sans-serif; }`, "tipo de letra|mudar fonte"],
  ["font-size", "**Tamanho** do texto.", `h1 { font-size: 48px; }
p  { font-size: 1.1rem; }`, "tamanho do texto|tamanho da fonte|aumentar letra"],
  ["font-weight", "**Grossura** da letra: {{normal}}, {{bold}} ou de 100 a 900.", `strong { font-weight: 700; }`, "negrito css|grossura da letra"],
  ["font-style", "Deixa em **itálico**.", `em { font-style: italic; }`, "italico css"],
  ["font", "Atalho pra várias propriedades de fonte de uma vez.", `p { font: italic bold 18px/1.5 Arial, sans-serif; }`, ""],
  ["font-variant", "Letras em **versalete** (maiúsculas pequenas).", `h2 { font-variant: small-caps; }`, ""],
  ["text-align", "**Alinha** o texto: {{left}}, {{center}}, {{right}}, {{justify}}.", `h1 { text-align: center; }`, "alinhar texto|centralizar texto|justificar"],
  ["text-decoration", "**Sublinhado** ou riscado. {{none}} tira o sublinhado dos links.", `a { text-decoration: none; }
.velho { text-decoration: line-through; }
.link { text-decoration: underline wavy #1e90ff; }`, "tirar sublinhado|sublinhado css|riscado css"],
  ["text-transform", "Muda pra **MAIÚSCULAS**, minúsculas ou Primeira Letra.", `h2 { text-transform: uppercase; }`, "maiusculas css|uppercase|capitalize"],
  ["text-shadow", "**Sombra** no texto (x, y, desfoque, cor).", `h1 { text-shadow: 0 0 10px #1e90ff; }   /* brilho neon */`, "sombra no texto|texto neon|brilho no texto"],
  ["text-indent", "**Recuo** na primeira linha do parágrafo.", `p { text-indent: 2em; }`, "recuo"],
  ["text-overflow", "Coloca **...** quando o texto não cabe.", `.titulo {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`, "reticencias|tres pontinhos|texto cortado"],
  ["line-height", "**Espaço entre as linhas**.", `p { line-height: 1.6; }`, "espaco entre linhas|entrelinha"],
  ["letter-spacing", "**Espaço entre as letras**.", `h1 { letter-spacing: 4px; }`, "espaco entre letras"],
  ["word-spacing", "**Espaço entre as palavras**.", `p { word-spacing: 6px; }`, "espaco entre palavras"],
  ["white-space", "Controla **quebra de linha** e espaços. {{nowrap}} = não quebra.", `.tag { white-space: nowrap; }
.codigo { white-space: pre; }`, "nao quebrar linha"],
  ["word-break", "Como **quebrar palavras longas**.", `p { word-break: break-word; }`, "quebrar palavra|overflow-wrap"],
  ["vertical-align", "Alinha **na vertical** elementos em linha ou células de tabela.", `img { vertical-align: middle; }`, "alinhar vertical tabela"],
  ["text-wrap", "{{balance}} deixa as linhas do título com tamanhos **equilibrados**.", `h1 { text-wrap: balance; }`, ""],
  ["-webkit-text-stroke", "**Contorno** nas letras.", `h1 {
  color: transparent;
  -webkit-text-stroke: 2px #1e90ff;
}`, "contorno no texto|borda no texto"],
  ["@font-face", "Usa uma **fonte sua** (arquivo .woff2 ou .ttf).", `@font-face {
  font-family: "MinhaFonte";
  src: url("fontes/minha.woff2") format("woff2");
}
body { font-family: "MinhaFonte", sans-serif; }`, "fonte propria|importar fonte"],
  ["Google Fonts", "Fontes **grátis**: escolha em fonts.google.com, cole o {{<link>}} no HTML e use no CSS.", `<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">

body { font-family: "Poppins", sans-serif; }`, "fonte do google|fontes gratis"],
]});

WCDEV.refs.push({ lang: "css", grupo: "Propriedade de cor e fundo", itens: [
  ["background-color", "**Cor de fundo**.", `body { background-color: #05070d; }`, "cor de fundo|fundo preto"],
  ["background", "Atalho pro fundo: cor, imagem, gradiente, posição...", `.hero { background: #000 url("fundo.jpg") center / cover no-repeat; }`, "fundo"],
  ["background-image", "**Imagem de fundo** (ou gradiente).", `.banner { background-image: url("img/fundo.png"); }`, "imagem de fundo|foto de fundo"],
  ["background-size", "Tamanho da imagem de fundo. {{cover}} cobre tudo, {{contain}} mostra inteira.", `.banner { background-size: cover; }`, "cover|contain|imagem de fundo cobrindo"],
  ["background-position", "**Posição** da imagem de fundo.", `.banner { background-position: center top; }`, ""],
  ["background-repeat", "Se a imagem de fundo **se repete**.", `.banner { background-repeat: no-repeat; }`, "no-repeat|repetir fundo"],
  ["background-attachment", "{{fixed}} deixa o fundo **parado** ao rolar (efeito parallax).", `.parallax { background-attachment: fixed; }`, "parallax|fundo fixo"],
  ["background-clip", "Com {{text}}, faz o fundo aparecer **só nas letras** (texto com gradiente).", `h1 {
  background: linear-gradient(90deg, #1e90ff, #00ffcc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}`, "texto com gradiente|texto degrade"],
  ["opacity", "**Transparência** do elemento inteiro: de 0 (invisível) a 1.", `.fantasma { opacity: 0.5; }`, "transparencia|transparente|opacidade"],
  ["linear-gradient", "**Degradê** em linha reta.", `body { background: linear-gradient(135deg, #000 0%, #0b3d91 100%); }`, "gradiente|degrade"],
  ["radial-gradient", "**Degradê** em círculo.", `.bola { background: radial-gradient(circle, #5cb8ff, #0b3d91); }`, "gradiente circular"],
  ["conic-gradient", "**Degradê** girando em volta (bom pra gráfico de pizza).", `.pizza {
  border-radius: 50%;
  background: conic-gradient(#1e90ff 0 40%, #222 40% 100%);
}`, "grafico de pizza"],
  ["cores hex", "Cor em **hexadecimal**: {{#RRGGBB}}. Com 8 dígitos tem transparência.", `.a { color: #1e90ff; }
.b { color: #1e90ff80; }   /* 50% transparente */`, "hexadecimal|#fff|codigo de cor"],
  ["rgb e rgba", "Cor por **vermelho, verde, azul** (0 a 255) e transparência.", `.a { color: rgb(30 144 255); }
.b { background: rgba(0, 0, 0, 0.6); }`, "rgb|rgba"],
  ["hsl", "Cor por **matiz, saturação e luz**. Fácil de criar tons.", `.a { color: hsl(210 100% 56%); }
.a:hover { color: hsl(210 100% 70%); }`, "hsla|tons de cor"],
  ["currentColor", "Usa a **mesma cor** do texto em outra propriedade.", `.botao { color: #1e90ff; border: 2px solid currentColor; }`, ""],
  ["transparent", "Cor **totalmente transparente**.", `.botao { background: transparent; }`, ""],
  ["accent-color", "Muda a cor de **checkbox, radio e range**.", `input { accent-color: #1e90ff; }`, "cor do checkbox"],
  ["caret-color", "Cor do **cursor piscando** nos campos.", `input { caret-color: #1e90ff; }`, "cor do cursor de texto"],
  ["filter", "**Efeitos** de imagem: desfoque, brilho, preto e branco...", `img { filter: grayscale(100%); }
img:hover { filter: none; }
.borrado { filter: blur(4px); }
.claro { filter: brightness(1.3); }`, "desfoque|blur|preto e branco|grayscale|brilho"],
  ["backdrop-filter", "Desfoca **o que está atrás** (efeito vidro fosco).", `.vidro {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}`, "vidro fosco|glassmorphism|efeito vidro"],
  ["mix-blend-mode", "Mistura as cores com o fundo (como no Photoshop).", `.texto { mix-blend-mode: difference; }`, ""],
]});

WCDEV.refs.push({ lang: "css", grupo: "Propriedade de caixa (tamanho e espaço)", itens: [
  ["width", "**Largura**.", `.card { width: 300px; }
.cheio { width: 100%; }`, "largura"],
  ["height", "**Altura**.", `.hero { height: 100vh; }`, "altura"],
  ["max-width", "Largura **máxima** (ótimo pra sites responsivos).", `.container { max-width: 1100px; margin: 0 auto; }
img { max-width: 100%; }`, "largura maxima|imagem responsiva"],
  ["min-width", "Largura **mínima**.", `.botao { min-width: 120px; }`, ""],
  ["max-height", "Altura **máxima**.", `.lista { max-height: 300px; overflow-y: auto; }`, ""],
  ["min-height", "Altura **mínima** (cresce se precisar).", `main { min-height: 100vh; }`, "altura minima"],
  ["margin", "Espaço **fora** da caixa. {{margin: 0 auto}} centraliza horizontalmente.", `.card { margin: 20px; }
.container { margin: 0 auto; }
.titulo { margin-top: 40px; margin-bottom: 10px; }`, "margem|margin-top|margin-bottom|margin-left|margin auto|centralizar com margin"],
  ["padding", "Espaço **dentro** da caixa (entre a borda e o conteúdo).", `.botao { padding: 12px 24px; }
.card { padding-top: 30px; }`, "espaco interno|preenchimento|padding-top|padding-left"],
  ["border", "**Borda**: grossura, estilo ({{solid}}, {{dashed}}, {{dotted}}) e cor.", `.card { border: 2px solid #1e90ff; }
.aviso { border-left: 4px solid red; }
.pontilhado { border: 2px dashed gray; }`, "borda|border-left|border-bottom|contorno"],
  ["border-radius", "**Arredonda** os cantos. {{50%}} faz um círculo.", `.card { border-radius: 12px; }
.avatar { border-radius: 50%; }`, "cantos arredondados|arredondar|circulo|redondo"],
  ["box-shadow", "**Sombra** da caixa (x, y, desfoque, espalhamento, cor).", `.card { box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
.neon { box-shadow: 0 0 20px #1e90ff; }
.dentro { box-shadow: inset 0 0 10px #000; }`, "sombra|sombra na caixa|brilho neon|glow"],
  ["box-sizing", "Com {{border-box}}, a largura **já inclui** padding e borda (use sempre!).", `* { box-sizing: border-box; }`, "border-box"],
  ["outline", "Contorno **fora** da borda (aparece no foco). Não ocupa espaço.", `input:focus { outline: 2px solid #1e90ff; }`, "contorno de foco"],
  ["overflow", "O que fazer quando o conteúdo **não cabe**: {{hidden}}, {{scroll}}, {{auto}}.", `.caixa { overflow: hidden; }
.lista { overflow-y: auto; }`, "barra de rolagem|scroll|conteudo vazando|overflow-x|overflow-y"],
  ["aspect-ratio", "Mantém a **proporção** (16/9, quadrado...).", `.video { width: 100%; aspect-ratio: 16 / 9; }
.quadrado { aspect-ratio: 1; }`, "proporcao|16:9|quadrado perfeito"],
  ["object-fit", "Como a **imagem preenche** a caixa sem distorcer.", `img {
  width: 200px;
  height: 200px;
  object-fit: cover;
}`, "imagem distorcida|cortar imagem|esticada"],
  ["object-position", "Qual parte da imagem aparece no {{object-fit}}.", `img { object-position: top; }`, ""],
  ["border-collapse", "Junta as bordas das **tabelas**.", `table { border-collapse: collapse; }`, "borda da tabela"],
  ["border-image", "Usa uma **imagem ou gradiente** como borda.", `.card {
  border: 4px solid;
  border-image: linear-gradient(45deg, #1e90ff, #00ffcc) 1;
}`, "borda gradiente"],
  ["resize", "Deixa o usuário **redimensionar** (textarea).", `textarea { resize: vertical; }`, ""],
  ["inset", "Atalho de {{top}}, {{right}}, {{bottom}}, {{left}}.", `.cobrir { position: absolute; inset: 0; }`, ""],
]});

WCDEV.refs.push({ lang: "css", grupo: "Propriedade de layout", itens: [
  ["display", "Como o elemento aparece: {{block}}, {{inline}}, {{inline-block}}, {{flex}}, {{grid}}, {{none}}.", `.menu { display: flex; }
.oculto { display: none; }`, "inline-block|display none|display block"],
  ["visibility", "{{hidden}} esconde mas **mantém o espaço** (diferente do {{display: none}}).", `.fantasma { visibility: hidden; }`, "esconder mantendo espaco"],
  ["position", "Posicionamento: {{static}}, {{relative}}, {{absolute}}, {{fixed}}, {{sticky}}.", `.pai { position: relative; }
.filho { position: absolute; top: 0; right: 0; }`, "posicao|posicionar"],
  ["top, right, bottom, left", "**Distância** de cada lado (usado com {{position}}).", `.botao-whats {
  position: fixed;
  bottom: 20px;
  right: 20px;
}`, "top|bottom|left|right|botao flutuante|botao fixo no canto"],
  ["z-index", "Quem fica **na frente**. Maior número = mais na frente (precisa de {{position}}).", `.modal { position: fixed; z-index: 1000; }`, "na frente|camada|sobrepor"],
  ["float", "Faz o elemento **flutuar** pro lado com o texto em volta (jeito antigo de layout).", `img { float: left; margin-right: 10px; }`, "texto em volta da imagem"],
  ["clear", "Para o efeito do {{float}}.", `.rodape { clear: both; }`, ""],
  ["flex-direction", "Direção dos itens no flex: {{row}} (lado a lado) ou {{column}} (um embaixo do outro).", `.coluna { display: flex; flex-direction: column; }`, "um embaixo do outro|row|column"],
  ["justify-content", "Alinha no **eixo principal** (horizontal no {{row}}): {{center}}, {{space-between}}, {{flex-end}}...", `nav { display: flex; justify-content: space-between; }`, "alinhar horizontal|espaco entre itens|space-between"],
  ["align-items", "Alinha no **eixo cruzado** (vertical no {{row}}).", `.linha { display: flex; align-items: center; }`, "alinhar vertical|centralizar vertical"],
  ["align-content", "Alinha as **linhas** quando o flex quebra em várias.", `.galeria { display: flex; flex-wrap: wrap; align-content: start; }`, ""],
  ["align-self", "Alinha **só um** item diferente dos outros.", `.item-especial { align-self: flex-end; }`, ""],
  ["flex-wrap", "Deixa os itens **quebrarem** pra próxima linha.", `.cards { display: flex; flex-wrap: wrap; gap: 16px; }`, "quebrar linha flex|wrap"],
  ["flex", "Quanto o item **cresce** pra ocupar o espaço. {{flex: 1}} divide igual.", `.coluna { flex: 1; }
.lateral { flex: 0 0 250px; }`, "flex 1|ocupar espaco|flex-grow|flex-shrink|flex-basis"],
  ["gap", "**Espaço entre os itens** do flex ou grid.", `.cards { display: grid; gap: 20px; }`, "espaco entre|row-gap|column-gap"],
  ["order", "Muda a **ordem** de um item no flex/grid.", `.primeiro { order: -1; }`, "mudar ordem"],
  ["place-items", "Atalho de {{align-items}} + {{justify-items}}. {{place-items: center}} centraliza tudo no grid.", `.centro { display: grid; place-items: center; height: 100vh; }`, "centralizar com grid"],
  ["grid-template-columns", "Define as **colunas** do grid.", `.layout { display: grid; grid-template-columns: 250px 1fr; }
.cards { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }`, "colunas do grid"],
  ["grid-template-rows", "Define as **linhas** do grid.", `.pagina { display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }`, "linhas do grid"],
  ["grid-template-areas", "Desenha o layout com **nomes** de áreas.", `.pagina {
  display: grid;
  grid-template-areas:
    "topo topo"
    "lado conteudo"
    "rodape rodape";
}
header { grid-area: topo; }
aside  { grid-area: lado; }`, "grid-area|areas do grid"],
  ["grid-column", "Quantas **colunas** o item ocupa.", `.destaque { grid-column: span 2; }
.cheio { grid-column: 1 / -1; }`, "ocupar colunas|span"],
  ["grid-row", "Quantas **linhas** o item ocupa.", `.alto { grid-row: span 2; }`, ""],
  ["grid-auto-flow", "Como o grid preenche sozinho. {{dense}} tapa buracos.", `.galeria { grid-auto-flow: dense; }`, ""],
  ["columns", "Divide o texto em **colunas** como jornal.", `.artigo { columns: 2; column-gap: 40px; }`, "colunas de texto|jornal"],
  ["container queries", "Estilos que mudam conforme o tamanho do **container** (não da tela).", `.card-pai { container-type: inline-size; }
@container (min-width: 400px) {
  .card { display: flex; }
}`, "@container|container-type"],
]});

WCDEV.refs.push({ lang: "css", grupo: "Propriedade de efeito e animação", itens: [
  ["transition", "Faz mudanças acontecerem **suavemente**.", `.botao { transition: background 0.3s, transform 0.3s; }
.botao:hover { transform: translateY(-3px); }`, "transicao suave|suave|transition-duration"],
  ["transform", "**Move, gira, aumenta ou inclina** o elemento.", `.a { transform: translateX(50px); }
.b { transform: rotate(45deg); }
.c { transform: scale(1.2); }
.d { transform: skewX(10deg); }`, "mover|girar|aumentar|rotate|scale|translate|translateX|skew"],
  ["transform-origin", "O **ponto** de onde o transform gira ou cresce.", `.ponteiro { transform-origin: bottom center; }`, ""],
  ["animation", "Roda uma animação {{@keyframes}}: nome, duração, tipo, repetição.", `.logo { animation: girar 2s linear infinite; }
.entrar { animation: aparecer 0.5s ease-out forwards; }`, "animation-duration|animation-delay|infinite"],
  ["@keyframes", "Define os **passos** de uma animação.", `@keyframes aparecer {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}`, "keyframe|passos da animacao"],
  ["animation-timing-function", "**Ritmo** da animação: {{ease}}, {{linear}}, {{ease-in}}, {{ease-out}}, {{steps()}}.", `.pulo { animation-timing-function: cubic-bezier(.68,-0.55,.27,1.55); }`, "ease|linear|cubic-bezier|ritmo"],
  ["animation-delay", "**Espera** antes de começar.", `.item:nth-child(2) { animation-delay: 0.2s; }`, "atraso"],
  ["animation-fill-mode", "{{forwards}} faz a animação **ficar no estado final**.", `.entrar { animation-fill-mode: forwards; }`, "forwards"],
  ["animation-play-state", "**Pausa** a animação.", `.giro:hover { animation-play-state: paused; }`, "pausar animacao"],
  ["cursor", "O **formato do mouse**: {{pointer}} (mãozinha), {{not-allowed}}, {{grab}}...", `button { cursor: pointer; }
.bloqueado { cursor: not-allowed; }`, "mãozinha|maozinha|ponteiro do mouse|cursor pointer"],
  ["pointer-events", "{{none}} faz o elemento **ignorar cliques**.", `.overlay { pointer-events: none; }`, "ignorar clique"],
  ["user-select", "Impede que o texto seja **selecionado**.", `.botao { user-select: none; }`, "nao selecionar texto"],
  ["scroll-behavior", "Rolagem **suave** ao clicar em links {{#}}.", `html { scroll-behavior: smooth; }`, "rolagem suave|scroll suave|smooth"],
  ["scroll-snap", "A rolagem **\"gruda\"** em cada item (carrossel).", `.carrossel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.slide { flex: 0 0 100%; scroll-snap-align: start; }`, "carrossel|scroll-snap-type|slider css"],
  ["clip-path", "**Recorta** o elemento em formas (triângulo, círculo, diagonal).", `.diagonal { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); }
.circulo { clip-path: circle(50%); }`, "recortar|forma|triangulo|diagonal"],
  ["will-change", "Avisa o navegador que algo **vai animar** (fica mais suave).", `.carta { will-change: transform; }`, ""],
  ["perspective", "Dá **profundidade 3D**.", `.cena { perspective: 800px; }
.carta { transform: rotateY(30deg); }`, "3d|rotatey|efeito 3d|virar carta"],
  ["backface-visibility", "Esconde o **verso** em giros 3D (cartas que viram).", `.face { backface-visibility: hidden; }`, ""],
  ["list-style", "Muda ou **tira as bolinhas** das listas.", `ul { list-style: none; padding: 0; }
ol { list-style: upper-roman; }`, "tirar bolinha da lista|list-style none|marcador"],
  ["content", "Texto ou ícone criado pelo CSS em {{::before}} e {{::after}}.", `.novo::after { content: " 🔥"; }`, ""],
  ["counter", "**Numeração automática** com CSS.", `body { counter-reset: passo; }
h3::before {
  counter-increment: passo;
  content: "Passo " counter(passo) ": ";
}`, "contador css|counter-reset|counter-increment|numerar"],
  ["appearance", "Tira o **visual padrão** do navegador (select, checkbox, botão).", `select { appearance: none; }`, ""],
  ["scrollbar", "Estiliza a **barra de rolagem**.", `::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-thumb { background: #1e90ff; border-radius: 4px; }
html { scrollbar-color: #1e90ff #05070d; }`, "barra de rolagem personalizada|scrollbar-color|::-webkit-scrollbar"],
]});

WCDEV.refs.push({ lang: "css", grupo: "Seletor", itens: [
  ["seletor de tag", "Seleciona **todas** as tags com aquele nome.", `p { color: gray; }`, "seletor de elemento"],
  ["seletor de classe (.)", "Seleciona pela **class**: ponto + nome.", `.card { padding: 20px; }`, "seletor ponto|.classe"],
  ["seletor de id (#)", "Seleciona pelo **id**: cerquilha + nome.", `#topo { height: 80px; }`, "seletor hashtag|#id"],
  ["seletor universal (*)", "Seleciona **tudo**.", `* { margin: 0; padding: 0; box-sizing: border-box; }`, "asterisco|reset css"],
  ["seletor de descendente", "Elemento **dentro** de outro (espaço entre eles).", `nav a { color: white; }`, "dentro de|descendente"],
  ["seletor de filho (>)", "Só os **filhos diretos**.", `ul > li { border-bottom: 1px solid #222; }`, "filho direto"],
  ["seletor de irmão (+ e ~)", "{{+}} pega o **próximo** irmão; {{~}} pega **todos** os próximos.", `h2 + p { font-size: 1.2em; }
h2 ~ p { color: gray; }`, "irmao|proximo elemento"],
  ["agrupar seletores (,)", "Mesmo estilo pra **vários** seletores.", `h1, h2, h3 { font-family: "Poppins"; }`, "varios seletores|virgula"],
  ["seletor de atributo", "Seleciona pelo **atributo**.", `input[type="email"] { border-color: #1e90ff; }
a[href^="https"] { color: green; }
img[alt$=".png"] { }`, "[type]|atributo css"],
  ["combinar seletores", "Sem espaço = **o mesmo elemento** com as duas coisas.", `button.primario { background: #1e90ff; }
.card.ativo { border-color: gold; }`, "duas classes"],
  ["especificidade", "Quando dois estilos brigam, ganha o **mais específico**: id > classe > tag. Se empatar, ganha o que vem **por último**.", `p { color: red; }
.texto { color: blue; }   /* ganha da tag */
#aviso { color: green; }  /* ganha de tudo acima */`, "prioridade|qual estilo ganha|css nao funciona|nao aplica"],
  ["!important", "**Força** o estilo a ganhar. Use só em último caso.", `.erro { color: red !important; }`, "important|forcar estilo"],
]});

WCDEV.refs.push({ lang: "css", grupo: "Pseudo-classe e pseudo-elemento", itens: [
  [":hover", "Quando o **mouse passa** por cima.", `a:hover { color: #5cb8ff; }`, "passar o mouse|mouse em cima"],
  [":active", "Enquanto está sendo **clicado**.", `button:active { transform: scale(0.95); }`, "clicando"],
  [":focus", "Quando o campo está **selecionado** (digitando).", `input:focus { border-color: #1e90ff; outline: none; }`, "campo selecionado|foco"],
  [":focus-visible", "Foco só quando vem do **teclado** (mais bonito que {{:focus}}).", `button:focus-visible { outline: 2px solid #1e90ff; }`, ""],
  [":visited", "Links já **visitados**.", `a:visited { color: purple; }`, "link visitado"],
  [":first-child", "O **primeiro** filho.", `li:first-child { font-weight: bold; }`, "primeiro item"],
  [":last-child", "O **último** filho (ótimo pra tirar a borda do último).", `li:last-child { border: none; }`, "ultimo item"],
  [":nth-child()", "Filho na **posição** N. {{odd}} ímpares, {{even}} pares, {{3n}} de 3 em 3.", `tr:nth-child(even) { background: #0b0f1a; }
li:nth-child(3) { color: gold; }`, "nth-child|linhas zebradas|zebrado|pares e impares"],
  [":nth-of-type()", "Igual ao {{nth-child}}, mas contando só aquele **tipo** de tag.", `p:nth-of-type(2) { color: red; }`, ""],
  [":not()", "Tudo **menos** aquilo.", `li:not(:last-child) { margin-bottom: 8px; }`, "exceto|menos"],
  [":checked", "Checkbox/radio **marcado**.", `input:checked + label { text-decoration: line-through; }`, "marcado"],
  [":disabled", "Campo **desativado**.", `button:disabled { opacity: 0.5; }`, ""],
  [":valid e :invalid", "Campo **válido ou inválido** (com {{required}}, {{type=\"email\"}}...).", `input:invalid { border-color: red; }
input:valid { border-color: green; }`, "invalid|valid|validacao css"],
  [":placeholder-shown", "Quando o campo está **vazio** mostrando o placeholder.", `input:not(:placeholder-shown) { border-color: #1e90ff; }`, ""],
  [":has()", "Seleciona o **pai** que tem algo dentro.", `.card:has(img) { padding: 0; }
form:has(input:invalid) button { opacity: .5; }`, "seletor pai|selecionar pai"],
  [":is() e :where()", "Agrupa seletores de forma curta.", `:is(h1, h2, h3):hover { color: #1e90ff; }`, ""],
  [":root", "O elemento **raiz** (html). Onde se criam as variáveis.", `:root { --azul: #1e90ff; }`, "root"],
  [":target", "O elemento cujo {{id}} está **na URL** ({{#secao}}).", `section:target { outline: 2px solid #1e90ff; }`, ""],
  ["::before", "Cria um **elemento antes** do conteúdo (precisa de {{content}}).", `.titulo::before { content: "▶ "; color: #1e90ff; }`, "before|antes"],
  ["::after", "Cria um **elemento depois** do conteúdo.", `.link::after {
  content: "";
  display: block;
  height: 2px;
  width: 0;
  background: #1e90ff;
  transition: .3s;
}
.link:hover::after { width: 100%; }`, "after|depois|sublinhado animado"],
  ["::placeholder", "Estiliza o **texto de exemplo** do campo.", `input::placeholder { color: #7d8bab; }`, "cor do placeholder"],
  ["::selection", "Cor do texto quando **selecionado** com o mouse.", `::selection { background: #1e90ff; color: #000; }`, "cor da selecao"],
  ["::first-letter", "A **primeira letra** (letra capitular).", `p::first-letter { font-size: 3em; float: left; }`, "letra capitular"],
  ["::first-line", "A **primeira linha** do texto.", `p::first-line { font-weight: bold; }`, ""],
  ["::marker", "As **bolinhas/números** das listas.", `li::marker { color: #1e90ff; }`, "cor da bolinha"],
]});

WCDEV.refs.push({ lang: "css", grupo: "Unidade de medida", itens: [
  ["px", "**Pixels**: tamanho fixo.", `.caixa { width: 200px; }`, "pixel|pixels"],
  ["porcentagem (%)", "**Porcentagem** do elemento pai.", `.metade { width: 50%; }`, "porcentagem css|por cento"],
  ["em", "Relativo ao **tamanho da fonte** do próprio elemento.", `.botao { padding: 0.5em 1em; }`, "unidade em"],
  ["rem", "Relativo à fonte do **html** (16px padrão). O mais recomendado pra fontes.", `h1 { font-size: 2.5rem; }   /* 40px */`, "unidade rem"],
  ["vw", "**% da largura da tela**. {{100vw}} = tela inteira.", `.titulo { font-size: 5vw; }`, "largura da tela"],
  ["vh", "**% da altura da tela**. {{100vh}} = tela inteira.", `.hero { height: 100vh; }`, "altura da tela|tela inteira"],
  ["dvh", "Altura da tela **real no celular** (sem a barra do navegador).", `.app { height: 100dvh; }`, "svh|lvh|altura celular"],
  ["fr", "**Fração** do espaço livre no grid.", `.grid { grid-template-columns: 1fr 2fr; }`, "fracao"],
  ["ch", "Largura de **um caractere** (bom pra limitar linhas de texto).", `p { max-width: 65ch; }`, ""],
  ["deg", "**Graus** (rotação, gradientes).", `.seta { transform: rotate(90deg); }`, "graus"],
  ["s e ms", "**Segundos** e milissegundos (animações).", `.a { transition: 0.3s; }
.b { transition: 300ms; }`, "segundos|milissegundos"],
]});

WCDEV.refs.push({ lang: "css", grupo: "Função e regra", itens: [
  ["var()", "Usa uma **variável CSS**. Crie com {{--nome}} no {{:root}}.", `:root {
  --azul: #1e90ff;
  --preto: #05070d;
}
body { background: var(--preto); }
a { color: var(--azul); }`, "variavel css|variaveis|--|custom properties"],
  ["calc()", "Faz **contas** misturando unidades.", `.conteudo { width: calc(100% - 250px); }
.alto { height: calc(100vh - 60px); }`, "calcular|conta no css"],
  ["clamp()", "Valor que **cresce com a tela** mas tem mínimo e máximo.", `h1 { font-size: clamp(1.8rem, 5vw, 3.5rem); }`, "fonte responsiva|tamanho responsivo"],
  ["min(), max()", "Escolhe o **menor ou maior** valor.", `.container { width: min(1100px, 100% - 32px); }`, ""],
  ["url()", "Caminho de um **arquivo** (imagem, fonte).", `.a { background-image: url("img/fundo.jpg"); }`, ""],
  ["repeat()", "Repete colunas no grid.", `.grid { grid-template-columns: repeat(4, 1fr); }`, ""],
  ["minmax()", "Tamanho com **mínimo e máximo** no grid.", `.grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }`, "auto-fit|auto-fill"],
  ["cubic-bezier()", "Cria um **ritmo** personalizado pra animação.", `.a { transition: transform .5s cubic-bezier(.34,1.56,.64,1); }`, "efeito elastico"],
  ["steps()", "Animação em **passos** (sprite de jogo, máquina de escrever).", `.digitando { animation: digitar 3s steps(30); }`, "maquina de escrever|sprite"],
  ["attr()", "Usa o **valor de um atributo** no {{content}}.", `a::after { content: " (" attr(href) ")"; }`, ""],
  ["@media", "Estilos que só valem em **certas telas** (responsivo).", `@media (max-width: 768px) {
  .menu { flex-direction: column; }
}
@media (prefers-color-scheme: dark) {
  body { background: #000; }
}`, "media query|responsivo|tela pequena|celular css|modo escuro"],
  ["@import", "Importa **outro arquivo CSS** ou fonte.", `@import url("botoes.css");`, "importar css"],
  ["@supports", "Aplica estilo só se o navegador **suportar** aquilo.", `@supports (display: grid) {
  .layout { display: grid; }
}`, ""],
  ["@layer", "Organiza o CSS em **camadas** de prioridade.", `@layer base, componentes;
@layer base { a { color: blue; } }`, ""],
  ["prefers-reduced-motion", "Respeita quem **desligou animações** no sistema.", `@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}`, "reduzir animacao"],
  ["@media print", "Estilos para quando a página for **impressa**.", `@media print {
  nav, footer { display: none; }
}`, "imprimir|impressao"],
]});

WCDEV.refs.push({ lang: "css", grupo: "Receita pronta", itens: [
  ["centralizar tudo", "3 jeitos de **centralizar** no meio da tela.", `/* 1. Flex */
.pai { display: flex; justify-content: center; align-items: center; height: 100vh; }
/* 2. Grid */
.pai { display: grid; place-items: center; height: 100vh; }
/* 3. Absolute */
.filho { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }`, "centralizar no meio|centralizar na tela|meio da tela"],
  ["reset CSS", "Tira os **espaços padrão** do navegador.", `* { margin: 0; padding: 0; box-sizing: border-box; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }`, "reset|normalize"],
  ["botão bonito", "Um botão moderno com hover.", `.botao {
  background: #1e90ff;
  color: #000;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: .25s;
}
.botao:hover { background: #5cb8ff; transform: translateY(-2px); box-shadow: 0 8px 20px #1e90ff55; }`, "estilizar botao|botao moderno|botao css"],
  ["menu horizontal", "Menu com links **lado a lado**.", `nav ul { display: flex; gap: 24px; list-style: none; }
nav a { color: #fff; text-decoration: none; }
nav a:hover { color: #1e90ff; }`, "menu css|navbar|barra de menu"],
  ["menu fixo no topo", "Menu que **fica no topo** ao rolar.", `header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(5, 7, 13, .8);
  backdrop-filter: blur(8px);
}`, "header fixo|navbar fixa"],
  ["cards em grade", "Cards que se **ajustam sozinhos** ao tamanho da tela.", `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
.card { background: #0b0f1a; border: 1px solid #1c2740; border-radius: 14px; padding: 20px; }`, "grade de cards|cards responsivos"],
  ["rodapé no fim da página", "Rodapé que **fica embaixo** mesmo com pouco conteúdo.", `body { min-height: 100vh; display: flex; flex-direction: column; }
main { flex: 1; }`, "footer embaixo|sticky footer"],
  ["tema escuro", "Cores escuras com **variáveis** (fácil de trocar).", `:root {
  --fundo: #05070d;
  --texto: #dbe6ff;
  --destaque: #1e90ff;
}
body { background: var(--fundo); color: var(--texto); }
a, h1 { color: var(--destaque); }`, "dark mode|modo escuro css"],
  ["texto neon", "Efeito de **luz neon**.", `h1 {
  color: #fff;
  text-shadow: 0 0 5px #1e90ff, 0 0 15px #1e90ff, 0 0 30px #1e90ff;
}`, "neon"],
  ["loader girando", "Ícone de **carregando**.", `.loader {
  width: 40px; height: 40px;
  border: 4px solid #1c2740;
  border-top-color: #1e90ff;
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}
@keyframes girar { to { transform: rotate(360deg); } }`, "carregando|spinner|loading"],
  ["imagem com zoom no hover", "A imagem **aumenta** ao passar o mouse sem sair da caixa.", `.foto { overflow: hidden; border-radius: 12px; }
.foto img { transition: transform .4s; }
.foto:hover img { transform: scale(1.1); }`, "zoom na imagem"],
  ["menu hamburguer", "No celular, esconde o menu e mostra com um checkbox (sem JavaScript).", `<input type="checkbox" id="m" hidden>
<label for="m">☰</label>
<nav class="menu">...</nav>

.menu { display: none; }
#m:checked ~ .menu { display: block; }`, "hamburguer|menu celular|menu no celular|menu mobile|menu responsivo"],
  ["truncar várias linhas", "Corta o texto depois de N linhas com **...**.", `.resumo {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`, "line-clamp|limitar linhas"],
  ["imagem redonda", "Foto de **perfil** redonda.", `.avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }`, "foto redonda|foto de perfil"],
  ["sobreposição escura", "Escurece a imagem de fundo pra o **texto aparecer**.", `.hero {
  background: linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), url("fundo.jpg") center/cover;
}`, "overlay|escurecer imagem"],
  ["tooltip", "**Dica** que aparece ao passar o mouse.", `.dica { position: relative; }
.dica::after {
  content: attr(data-dica);
  position: absolute; bottom: 120%; left: 50%;
  transform: translateX(-50%);
  background: #000; color: #fff; padding: 4px 8px; border-radius: 6px;
  opacity: 0; transition: .2s; white-space: nowrap;
}
.dica:hover::after { opacity: 1; }`, "dica no hover|balao de dica"],
]});
