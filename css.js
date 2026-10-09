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
