/* =========================================================
   WC DEV — HTML (trilha em ordem: do básico ao avançado)
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

WCDEV.temas.push(
  {
    id: "html-intro",
    lang: "html",
    titulo: "O que é HTML",
    chaves: ["o que e html", "pra que serve html", "comecar html", "tag", "tags", "como abrir html"],
    resposta: `### O que é HTML? 🧱
HTML é a linguagem que monta a **estrutura** de um site: textos, imagens, botões, links.
Ele funciona com **tags**, que ficam entre {{< >}}:
~~~html
<p>Isso é um parágrafo</p>
~~~
- {{<p>}} abre a tag, {{</p>}} fecha.
- O conteúdo fica no meio.

**Como testar:** crie um arquivo {{index.html}} no Bloco de Notas ou VS Code e abra com dois cliques no navegador.`,
    sugestoes: ["estrutura básica html", "títulos e parágrafos"],
  },
  {
    id: "html-estrutura",
    lang: "html",
    titulo: "Estrutura básica de uma página",
    chaves: ["estrutura basica", "estrutura", "doctype", "head", "body", "esqueleto", "pagina basica", "modelo html", "template html"],
    resposta: `### Estrutura básica
Todo arquivo HTML começa assim:
~~~html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu Site</title>
</head>
<body>
  <h1>Bem-vindo!</h1>
  <p>Meu primeiro site.</p>
</body>
</html>
~~~
- {{<head>}}: informações da página (título da aba, acentos, CSS).
- {{<body>}}: tudo que **aparece** na tela.
- {{charset="UTF-8"}} faz os acentos funcionarem.
- Dica no VS Code: digite {{!}} e aperte **Tab** que ele cria isso sozinho.`,
    sugestoes: ["títulos e parágrafos", "links html"],
  },
  {
    id: "html-textos",
    lang: "html",
    titulo: "Títulos e parágrafos",
    chaves: ["titulo", "titulos", "h1", "h2", "paragrafo", "paragrafos", "texto", "negrito", "italico", "strong", "br", "quebra de linha"],
    resposta: `### Títulos e textos
~~~html
<h1>Título principal</h1>
<h2>Subtítulo</h2>
<h3>Título menor</h3>   <!-- vai até h6 -->

<p>Um parágrafo de texto.</p>
<p>Texto com <strong>negrito</strong> e <em>itálico</em>.</p>
<p>Primeira linha<br>Segunda linha</p>
<hr>  <!-- linha horizontal -->
~~~
- Use só **um** {{<h1>}} por página (é bom pro Google).
- {{<!-- -->}} é comentário: não aparece no site.`,
    sugestoes: ["links html", "imagens html"],
  },
  {
    id: "html-links",
    lang: "html",
    titulo: "Links",
    chaves: ["link", "links", "<a>", "href", "ancora", "nova aba", "target", "linkar"],
    resposta: `### Links
~~~html
<a href="https://www.google.com">Ir para o Google</a>

<!-- abre em nova aba -->
<a href="https://www.youtube.com" target="_blank">YouTube</a>

<!-- outra página do seu site -->
<a href="contato.html">Contato</a>

<!-- pula pra uma parte da mesma página -->
<a href="#sobre">Ver sobre</a>
<section id="sobre">...</section>
~~~
O {{href}} é o endereço pra onde o link vai.`,
    sugestoes: ["imagens html", "listas html"],
  },
  {
    id: "html-imagens",
    lang: "html",
    titulo: "Imagens e vídeos",
    chaves: ["imagem", "imagens", "img", "foto", "src", "alt", "video", "audio", "colocar imagem", "youtube embed", "iframe"],
    resposta: `### Imagens e mídia
~~~html
<img src="foto.png" alt="Minha foto" width="300">

<video src="video.mp4" controls width="400"></video>

<audio src="musica.mp3" controls></audio>
~~~
- {{src}}: caminho do arquivo (se estiver na mesma pasta, é só o nome).
- {{alt}}: texto que aparece se a imagem não carregar (importante pra acessibilidade).
- {{<img>}} **não tem** tag de fechamento.
- Vídeo do YouTube: clique em **Compartilhar → Incorporar** e cole o {{<iframe>}}.`,
    sugestoes: ["listas html", "tabelas html"],
  },
  {
    id: "html-listas",
    lang: "html",
    titulo: "Listas",
    chaves: ["listas html", "lista html", "ul", "ol", "li", "lista numerada", "lista com pontos", "menu html"],
    resposta: `### Listas
~~~html
<!-- lista com bolinhas -->
<ul>
  <li>Python</li>
  <li>HTML</li>
  <li>CSS</li>
</ul>

<!-- lista numerada -->
<ol>
  <li>Acordar</li>
  <li>Estudar</li>
  <li>Programar</li>
</ol>
~~~
- {{ul}} = não ordenada, {{ol}} = ordenada, {{li}} = cada item.
- Menus de sites geralmente são um {{<ul>}} com links dentro.`,
    sugestoes: ["tabelas html", "formulários html"],
  },
  {
    id: "html-tabelas",
    lang: "html",
    titulo: "Tabelas",
    chaves: ["tabela", "tabelas", "table", "tr", "td", "th", "linha e coluna"],
    resposta: `### Tabelas
~~~html
<table border="1">
  <tr>
    <th>Nome</th>
    <th>Nota</th>
  </tr>
  <tr>
    <td>Ana</td>
    <td>9</td>
  </tr>
  <tr>
    <td>João</td>
    <td>8</td>
  </tr>
</table>
~~~
- {{tr}} = linha, {{th}} = célula de título, {{td}} = célula normal.
- O {{border}} é só pra visualizar; depois a gente estiliza com CSS.`,
    sugestoes: ["formulários html", "div e span"],
  },
  {
    id: "html-form",
    lang: "html",
    titulo: "Formulários e botões",
    chaves: ["formulario", "formularios", "form", "input html", "botao", "button", "campo de texto", "checkbox", "select", "textarea", "login"],
    resposta: `### Formulários
~~~html
<form>
  <label for="nome">Nome:</label>
  <input type="text" id="nome" placeholder="Seu nome" required>

  <label for="email">E-mail:</label>
  <input type="email" id="email">

  <input type="password" placeholder="Senha">
  <input type="checkbox"> Aceito os termos

  <select>
    <option>Python</option>
    <option>HTML</option>
  </select>

  <textarea placeholder="Mensagem"></textarea>

  <button type="submit">Enviar</button>
</form>
~~~
Tipos de {{input}}: {{text}}, {{email}}, {{password}}, {{number}}, {{date}}, {{color}}, {{checkbox}}, {{radio}}.
{{required}} obriga o campo a ser preenchido.`,
    sugestoes: ["div e span", "html semântico"],
  },
  {
    id: "html-div",
    lang: "html",
    titulo: "div, span, class e id",
    chaves: ["div", "span", "class", "id", "classe html", "atributo", "atributos", "caixa", "container"],
    resposta: `### div, span, class e id
{{<div>}} é uma **caixa** pra agrupar coisas. {{<span>}} marca um pedacinho de texto.
~~~html
<div class="card">
  <h2>Produto</h2>
  <p>Preço: <span class="preco">R$ 20</span></p>
</div>

<div id="rodape">Feito por WC DEV</div>
~~~
- {{class}}: pode repetir em vários elementos (pra estilizar igual).
- {{id}}: nome **único** na página.
No CSS você usa {{.card}} pra classe e {{#rodape}} pro id.`,
    sugestoes: ["html semântico", "/css"],
  },
  {
    id: "html-semantico",
    lang: "html",
    titulo: "HTML semântico",
    chaves: ["semantico", "semantica", "header", "footer", "nav", "main", "section", "article", "aside"],
    resposta: `### HTML semântico
São tags com **significado**, que deixam o código organizado e ajudam o Google:
~~~html
<header>
  <nav>
    <a href="#">Início</a>
    <a href="#sobre">Sobre</a>
  </nav>
</header>

<main>
  <section id="sobre">
    <h2>Sobre mim</h2>
    <p>Estou aprendendo a programar!</p>
  </section>
</main>

<footer>© 2026 WC DEV</footer>
~~~
- {{header}} topo, {{nav}} menu, {{main}} conteúdo principal, {{section}} seção, {{footer}} rodapé.`,
    sugestoes: ["projeto html", "ligar css no html"],
  },
  {
    id: "html-projeto",
    lang: "html",
    titulo: "Projeto: página de perfil",
    chaves: ["projeto html", "site completo", "fazer um site", "criar site", "pagina de perfil", "portfolio", "exercicio html"],
    resposta: `### Projeto: sua página de perfil 🌐
~~~html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Meu Perfil</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Olá, eu sou [seu nome] 👋</h1>
    <nav>
      <a href="#projetos">Projetos</a>
      <a href="#contato">Contato</a>
    </nav>
  </header>

  <main>
    <section id="projetos">
      <h2>Meus projetos</h2>
      <ul>
        <li>Jogo no Roblox</li>
        <li>Chat que ensina programação</li>
      </ul>
    </section>

    <section id="contato">
      <h2>Contato</h2>
      <form>
        <input type="email" placeholder="Seu e-mail">
        <button>Enviar</button>
      </form>
    </section>
  </main>

  <footer>Feito com 💙 por WC DEV</footer>
</body>
</html>
~~~
Agora deixe ela bonita com CSS!`,
    sugestoes: ["/css", "ligar css no html"],
  }
);

/* =========================================================
   HTML — CONSULTA (cada item: nome, explicação, exemplo, palavras extras)
   ========================================================= */
WCDEV.refs = WCDEV.refs || [];

WCDEV.refs.push({ lang: "html", grupo: "Tag de estrutura", itens: [
  ["<!DOCTYPE html>", "Primeira linha de todo arquivo. Avisa o navegador que é **HTML5**.", `<!DOCTYPE html>`, "doctype"],
  ["<html>", "A tag **raiz**: envolve a página toda. Use {{lang=\"pt-BR\"}}.", `<html lang="pt-BR">
  ...
</html>`, ""],
  ["<head>", "Parte **invisível** com informações: título, CSS, ícone, SEO.", `<head>
  <meta charset="UTF-8">
  <title>Meu site</title>
  <link rel="stylesheet" href="style.css">
</head>`, ""],
  ["<body>", "Tudo que **aparece** na tela fica aqui dentro.", `<body>
  <h1>Olá!</h1>
</body>`, "corpo da pagina"],
  ["<title>", "O texto que aparece na **aba do navegador** e no Google.", `<title>WC DEV — Aprenda a programar</title>`, "titulo da aba|nome da aba"],
  ["<meta>", "Informações sobre a página: acentos, celular, descrição pro Google.", `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Aprenda programação do zero">`, "meta tag|viewport|charset"],
  ["<link>", "Liga **arquivos externos**: CSS, ícone (favicon), fontes.", `<link rel="stylesheet" href="style.css">
<link rel="icon" href="icone.png">`, "favicon|icone do site|ligar css"],
  ["<script>", "Coloca ou liga código **JavaScript**.", `<script src="app.js"></script>

<script>
  alert("Olá!");
</script>`, "javascript|js|ligar javascript"],
  ["<style>", "CSS escrito **dentro** do HTML.", `<style>
  body { background: black; color: white; }
</style>`, "css dentro do html"],
  ["<noscript>", "Conteúdo que aparece só se o JavaScript estiver **desligado**.", `<noscript>Ative o JavaScript!</noscript>`, ""],
  ["<base>", "Define o endereço base pra todos os links da página.", `<base href="https://meusite.com/">`, ""],
  ["<header>", "**Cabeçalho**: topo do site ou de uma seção (logo, menu).", `<header>
  <h1>WC DEV</h1>
  <nav>...</nav>
</header>`, "cabecalho|topo do site"],
  ["<nav>", "Área de **navegação** (menu de links).", `<nav>
  <a href="/">Início</a>
  <a href="/cursos">Cursos</a>
</nav>`, "menu|barra de navegacao"],
  ["<main>", "O **conteúdo principal** da página (só um por página).", `<main>
  <h2>Bem-vindo</h2>
</main>`, "conteudo principal"],
  ["<section>", "Uma **seção** de conteúdo, geralmente com título.", `<section id="sobre">
  <h2>Sobre</h2>
  <p>...</p>
</section>`, "secao"],
  ["<article>", "Conteúdo **independente** (post, notícia, card de produto).", `<article>
  <h2>Como aprender Python</h2>
  <p>...</p>
</article>`, "artigo|post"],
  ["<aside>", "Conteúdo **lateral** (barra lateral, propaganda, links relacionados).", `<aside>
  <h3>Posts populares</h3>
</aside>`, "barra lateral|sidebar"],
  ["<footer>", "**Rodapé**: direitos, contato, redes sociais.", `<footer>
  <p>© 2026 WC DEV</p>
</footer>`, "rodape"],
  ["<div>", "Uma **caixa genérica** pra agrupar elementos. A tag mais usada pra layout.", `<div class="card">
  <h3>Título</h3>
</div>`, "caixa|container|bloco"],
  ["<span>", "Marca um **pedaço de texto** pra estilizar (não quebra linha).", `<p>Preço: <span class="destaque">R$ 10</span></p>`, ""],
  ["<address>", "Informações de **contato**.", `<address>
  E-mail: <a href="mailto:contato@site.com">contato@site.com</a>
</address>`, "endereco|contato"],
  ["<details>", "Caixa que **abre e fecha** ao clicar (sem JavaScript!). Use com {{<summary>}}.", `<details>
  <summary>O que é HTML?</summary>
  <p>É a linguagem que estrutura sites.</p>
</details>`, "abrir e fechar|sanfona|accordion|faq|perguntas frequentes"],
  ["<summary>", "O **título clicável** de um {{<details>}}.", `<summary>Clique para ver</summary>`, ""],
  ["<dialog>", "Uma **janela modal** (popup).", `<dialog id="caixa">
  <p>Olá!</p>
  <button onclick="caixa.close()">Fechar</button>
</dialog>
<button onclick="caixa.showModal()">Abrir</button>`, "modal|popup|janela"],
  ["<template>", "Conteúdo **guardado** que não aparece; o JavaScript usa pra criar cópias.", `<template id="card">
  <div class="card"></div>
</template>`, ""],
]});

WCDEV.refs.push({ lang: "html", grupo: "Tag de texto", itens: [
  ["<h1>", "**Título principal** da página (use só um). Existem do {{<h1>}} até o {{<h6>}}, do maior pro menor.", `<h1>Título</h1>
<h2>Subtítulo</h2>
<h6>O menor</h6>`, "h1 a h6|h3|h4|h5|h6|titulo grande"],
  ["<p>", "Um **parágrafo** de texto.", `<p>Este é um parágrafo.</p>`, "paragrafo"],
  ["<br>", "**Quebra de linha** (não tem fechamento).", `<p>Linha 1<br>Linha 2</p>`, "pular linha html|quebra de linha html"],
  ["<hr>", "Uma **linha horizontal** separando conteúdo.", `<p>Parte 1</p>
<hr>
<p>Parte 2</p>`, "linha horizontal|separador"],
  ["<strong>", "Texto **importante** (aparece em negrito).", `<p><strong>Atenção:</strong> salve o arquivo.</p>`, "negrito html"],
  ["<b>", "**Negrito** só visual (prefira {{<strong>}} se for importante).", `<b>negrito</b>`, ""],
  ["<em>", "Texto com **ênfase** (aparece em itálico).", `<p>Eu <em>realmente</em> gosto disso.</p>`, "italico html"],
  ["<i>", "*Itálico* visual (termos estrangeiros, ícones).", `<i>software</i>`, ""],
  ["<u>", "Texto **sublinhado**.", `<u>sublinhado</u>`, "sublinhado html"],
  ["<s>", "Texto **riscado** (algo que não vale mais).", `<s>R$ 100</s> R$ 70`, "riscado|preco antigo"],
  ["<del>", "Texto **removido** (riscado). Use com {{<ins>}}.", `<del>errado</del> <ins>certo</ins>`, ""],
  ["<ins>", "Texto **inserido** (sublinhado).", `<ins>novo texto</ins>`, ""],
  ["<mark>", "Texto **marcado** como marca-texto amarelo.", `<p>A resposta é <mark>42</mark>.</p>`, "marca texto|destacar texto|grifar"],
  ["<small>", "Texto **pequeno** (avisos, direitos autorais).", `<small>Termos de uso</small>`, "texto pequeno"],
  ["<sub>", "Texto **subscrito** (embaixo).", `H<sub>2</sub>O`, "subscrito|formula quimica"],
  ["<sup>", "Texto **sobrescrito** (em cima).", `x<sup>2</sup>`, "sobrescrito|potencia html|elevado"],
  ["<code>", "Mostra **código** com fonte de computador.", `<p>Use <code>print()</code> pra mostrar.</p>`, "codigo html"],
  ["<pre>", "Texto **pré-formatado**: mantém espaços e quebras de linha.", `<pre>
for i in range(3):
    print(i)
</pre>`, "manter espacos|preformatado"],
  ["<kbd>", "Mostra **tecla** do teclado.", `Aperte <kbd>Ctrl</kbd> + <kbd>S</kbd>`, "tecla"],
  ["<blockquote>", "Uma **citação** longa (vem com recuo).", `<blockquote cite="https://...">
  Programar é pensar.
</blockquote>`, "citacao"],
  ["<q>", "Citação **curta** dentro do texto (coloca aspas sozinho).", `<p>Ele disse <q>bora codar</q>.</p>`, ""],
  ["<cite>", "Nome de uma **obra** (livro, filme, site).", `<cite>Harry Potter</cite>`, ""],
  ["<abbr>", "**Abreviação**: mostra o significado ao passar o mouse.", `<abbr title="HyperText Markup Language">HTML</abbr>`, "abreviacao|sigla"],
  ["<time>", "Marca uma **data ou hora**.", `<time datetime="2026-12-25">Natal</time>`, "data html"],
  ["<data>", "Um valor com versão legível pra máquinas.", `<data value="398">Mini Ketchup</data>`, ""],
  ["<dfn>", "Termo sendo **definido**.", `<p><dfn>HTML</dfn> é a linguagem de marcação da web.</p>`, ""],
  ["<var>", "Nome de **variável** (matemática/programação).", `<var>x</var> = 5`, ""],
  ["<samp>", "**Saída** de um programa.", `<samp>Erro: arquivo não encontrado</samp>`, ""],
  ["<bdi>", "Isola texto que pode ser em outra direção (árabe, hebraico).", `<bdi>إيان</bdi>`, ""],
  ["<wbr>", "Ponto onde uma palavra **longa pode quebrar** se precisar.", `superlongapalavra<wbr>quepodequebrar`, ""],
]});

WCDEV.refs.push({ lang: "html", grupo: "Tag de lista e tabela", itens: [
  ["<ul>", "**Lista com bolinhas** (não ordenada).", `<ul>
  <li>HTML</li>
  <li>CSS</li>
</ul>`, "lista com bolinha|lista nao ordenada"],
  ["<ol>", "**Lista numerada**. Aceita {{start}}, {{reversed}} e {{type=\"A\"}}.", `<ol type="1" start="1">
  <li>Primeiro</li>
  <li>Segundo</li>
</ol>`, "lista numerada|lista ordenada"],
  ["<li>", "Cada **item** de uma lista.", `<li>Item</li>`, "item da lista"],
  ["<dl>", "**Lista de definições** (termo + explicação).", `<dl>
  <dt>HTML</dt>
  <dd>Estrutura</dd>
  <dt>CSS</dt>
  <dd>Visual</dd>
</dl>`, "lista de definicao|glossario"],
  ["<dt>", "O **termo** numa lista de definições.", `<dt>Python</dt>`, ""],
  ["<dd>", "A **definição** do termo.", `<dd>Linguagem de programação</dd>`, ""],
  ["<table>", "Cria uma **tabela**.", `<table>
  <thead>
    <tr><th>Nome</th><th>Nota</th></tr>
  </thead>
  <tbody>
    <tr><td>Ana</td><td>9</td></tr>
  </tbody>
</table>`, "tabela html"],
  ["<tr>", "Uma **linha** da tabela.", `<tr><td>A</td><td>B</td></tr>`, "linha da tabela"],
  ["<td>", "Uma **célula** normal.", `<td>Valor</td>`, "celula"],
  ["<th>", "Uma **célula de título** (negrito e centralizada).", `<th>Nome</th>`, "cabecalho da tabela"],
  ["<thead>", "Agrupa as linhas de **título** da tabela.", `<thead><tr><th>Produto</th></tr></thead>`, ""],
  ["<tbody>", "Agrupa as linhas de **conteúdo** da tabela.", `<tbody>...</tbody>`, ""],
  ["<tfoot>", "Agrupa as linhas de **rodapé** (totais).", `<tfoot><tr><td>Total</td><td>30</td></tr></tfoot>`, "total da tabela"],
  ["<caption>", "**Título** da tabela.", `<table>
  <caption>Notas do bimestre</caption>
  ...
</table>`, ""],
  ["colspan", "Faz uma célula **ocupar várias colunas**.", `<td colspan="2">Ocupa 2 colunas</td>`, "juntar colunas|mesclar celulas"],
  ["rowspan", "Faz uma célula **ocupar várias linhas**.", `<td rowspan="3">Ocupa 3 linhas</td>`, "juntar linhas"],
  ["<colgroup>", "Estiliza **colunas inteiras**.", `<colgroup>
  <col style="background: #0b0f1a">
  <col span="2">
</colgroup>`, "col"],
]});

WCDEV.refs.push({ lang: "html", grupo: "Tag de mídia e link", itens: [
  ["<a>", "Cria um **link**. {{href}} é o destino.", `<a href="https://google.com" target="_blank">Google</a>
<a href="#contato">Ir pro contato</a>
<a href="mailto:oi@site.com">Mande e-mail</a>
<a href="tel:+5581999999999">Ligue</a>
<a href="https://wa.me/5581999999999">WhatsApp</a>`, "link html|hiperlink|link do whatsapp|link de email"],
  ["<img>", "Mostra uma **imagem**. Sempre use {{alt}}.", `<img src="logo.png" alt="Logo da WC DEV" width="200">`, "imagem html|foto html|colocar imagem"],
  ["<picture>", "Escolhe **imagens diferentes** conforme o tamanho da tela ou formato.", `<picture>
  <source srcset="foto.webp" type="image/webp">
  <source media="(max-width: 600px)" srcset="foto-pequena.jpg">
  <img src="foto.jpg" alt="Foto">
</picture>`, "imagem responsiva"],
  ["<figure>", "Agrupa uma **imagem com legenda**.", `<figure>
  <img src="grafico.png" alt="Gráfico">
  <figcaption>Vendas de 2026</figcaption>
</figure>`, "legenda da imagem"],
  ["<figcaption>", "A **legenda** de um {{<figure>}}.", `<figcaption>Foto: WC DEV</figcaption>`, ""],
  ["<video>", "Coloca um **vídeo**.", `<video src="intro.mp4" controls autoplay muted loop width="480" poster="capa.jpg"></video>`, "video html|colocar video"],
  ["<audio>", "Coloca um **áudio/música**.", `<audio src="musica.mp3" controls loop></audio>`, "audio|musica|som"],
  ["<source>", "Várias versões de um arquivo de mídia (o navegador escolhe a que suporta).", `<video controls>
  <source src="v.webm" type="video/webm">
  <source src="v.mp4" type="video/mp4">
</video>`, ""],
  ["<track>", "**Legendas** pra vídeos.", `<track src="legenda.vtt" kind="subtitles" srclang="pt" label="Português">`, "legenda de video"],
  ["<iframe>", "Mostra **outro site dentro** do seu (vídeo do YouTube, mapa).", `<iframe width="560" height="315"
  src="https://www.youtube.com/embed/ID_DO_VIDEO"
  allowfullscreen></iframe>`, "youtube|incorporar|embed|google maps|mapa"],
  ["<canvas>", "Uma **área de desenho** controlada por JavaScript (jogos, gráficos).", `<canvas id="tela" width="400" height="300"></canvas>
<script>
  const ctx = tela.getContext("2d");
  ctx.fillStyle = "#1e90ff";
  ctx.fillRect(50, 50, 100, 100);
</script>`, "desenhar html|jogo html"],
  ["<svg>", "Desenho **vetorial** (não perde qualidade ao aumentar). Ótimo pra ícones.", `<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#1e90ff" />
</svg>`, "vetor|icone svg|circulo"],
  ["<map>", "Imagem com **áreas clicáveis**. Usa {{<area>}}.", `<img src="mapa.png" usemap="#m">
<map name="m">
  <area shape="rect" coords="0,0,100,100" href="norte.html">
</map>`, "area|imagem clicavel"],
  ["<object>", "Mostra arquivos externos, como **PDF**.", `<object data="manual.pdf" width="600" height="400"></object>`, "pdf no site|mostrar pdf"],
  ["<embed>", "Coloca conteúdo externo (PDF, mídia).", `<embed src="arquivo.pdf" width="600" height="400">`, ""],
]});

WCDEV.refs.push({ lang: "html", grupo: "Tag de formulário", itens: [
  ["<form>", "Agrupa **campos** pra enviar dados. {{action}} = pra onde vai, {{method}} = GET ou POST.", `<form action="/enviar" method="post">
  <input name="email" type="email" required>
  <button>Enviar</button>
</form>`, "formulario html"],
  ["<input>", "Um **campo** de entrada. O {{type}} muda tudo: texto, senha, data, cor...", `<input type="text" name="nome" placeholder="Seu nome">`, "campo|caixa de texto"],
  ["<label>", "O **nome** de um campo. Clicando nele, o campo é selecionado.", `<label for="email">E-mail</label>
<input id="email" type="email">`, "rotulo"],
  ["<button>", "Um **botão**. {{type=\"submit\"}} envia, {{type=\"button\"}} não.", `<button type="submit">Enviar</button>
<button type="button" onclick="alert('Oi')">Clique</button>`, "botao html|criar botao"],
  ["<textarea>", "Campo de **texto grande** (várias linhas).", `<textarea rows="5" cols="40" placeholder="Sua mensagem"></textarea>`, "caixa de mensagem|texto grande"],
  ["<select>", "**Lista suspensa** de opções.", `<select name="lang">
  <option value="py">Python</option>
  <option value="html" selected>HTML</option>
</select>`, "lista suspensa|dropdown|caixa de selecao"],
  ["<option>", "Cada **opção** de um {{<select>}} ou {{<datalist>}}.", `<option value="1">Opção 1</option>`, ""],
  ["<optgroup>", "Agrupa opções do {{<select>}} com um título.", `<select>
  <optgroup label="Frutas">
    <option>Maçã</option>
  </optgroup>
</select>`, ""],
  ["<datalist>", "**Sugestões** enquanto a pessoa digita.", `<input list="linguagens">
<datalist id="linguagens">
  <option value="Python">
  <option value="JavaScript">
</datalist>`, "autocompletar|sugestoes no input"],
  ["<fieldset>", "Agrupa campos com uma **borda**. Use com {{<legend>}}.", `<fieldset>
  <legend>Dados pessoais</legend>
  <input placeholder="Nome">
</fieldset>`, "agrupar campos"],
  ["<legend>", "O **título** de um {{<fieldset>}}.", `<legend>Endereço</legend>`, ""],
  ["<output>", "Mostra o **resultado** de um cálculo.", `<form oninput="r.value = Number(a.value) + Number(b.value)">
  <input id="a" type="number"> + <input id="b" type="number"> =
  <output name="r" for="a b"></output>
</form>`, "resultado"],
  ["<progress>", "**Barra de progresso**.", `<progress value="70" max="100"></progress>`, "barra de progresso|carregamento"],
  ["<meter>", "**Medidor** de um valor (bateria, nível).", `<meter value="0.6" min="0" max="1" low="0.3" high="0.8"></meter>`, "medidor|barra de vida"],
]});

WCDEV.refs.push({ lang: "html", grupo: "Tipo de input", itens: [
  ["type text", "Campo de **texto** comum.", `<input type="text" placeholder="Nome">`, "input text"],
  ["type password", "**Senha**: esconde o que é digitado.", `<input type="password" placeholder="Senha">`, "campo de senha|input senha|input de senha|senha html"],
  ["type email", "**E-mail**: o navegador confere se tem {{@}}.", `<input type="email" required>`, "campo de email"],
  ["type number", "Só **números**, com setinhas. Aceita {{min}}, {{max}}, {{step}}.", `<input type="number" min="0" max="100" step="5">`, "campo numerico"],
  ["type tel", "**Telefone** (abre o teclado numérico no celular).", `<input type="tel" placeholder="(81) 99999-9999">`, "telefone|celular"],
  ["type url", "Endereço de **site**.", `<input type="url" placeholder="https://">`, ""],
  ["type search", "Campo de **busca** (com um X pra limpar).", `<input type="search" placeholder="Pesquisar...">`, "barra de pesquisa|busca"],
  ["type date", "Escolher **data** num calendário.", `<input type="date">`, "calendario|escolher data"],
  ["type time", "Escolher **hora**.", `<input type="time">`, "escolher hora"],
  ["type datetime-local", "Escolher **data e hora** juntas.", `<input type="datetime-local">`, ""],
  ["type month", "Escolher **mês e ano**.", `<input type="month">`, ""],
  ["type week", "Escolher uma **semana**.", `<input type="week">`, ""],
  ["type color", "Escolher uma **cor** numa paleta.", `<input type="color" value="#1e90ff">`, "seletor de cor|escolher cor"],
  ["type range", "Um **controle deslizante** (slider).", `<input type="range" min="0" max="100" value="50">`, "slider|controle deslizante|volume"],
  ["type checkbox", "**Caixinha** de marcar (pode marcar várias).", `<label><input type="checkbox" checked> Aceito os termos</label>`, "caixa de marcar|marcar varias"],
  ["type radio", "**Bolinha** de escolha (só uma por grupo, com o mesmo {{name}}).", `<label><input type="radio" name="nivel" value="1"> Fácil</label>
<label><input type="radio" name="nivel" value="2"> Difícil</label>`, "escolha unica|bolinha"],
  ["type file", "Enviar **arquivos**. Use {{accept}} pra limitar o tipo.", `<input type="file" accept="image/*" multiple>`, "upload|enviar arquivo|enviar foto"],
  ["type hidden", "Campo **invisível** que envia um valor junto.", `<input type="hidden" name="id" value="42">`, "campo escondido"],
  ["type submit", "Botão que **envia** o formulário.", `<input type="submit" value="Cadastrar">`, ""],
  ["type reset", "Botão que **limpa** o formulário.", `<input type="reset" value="Limpar">`, "limpar formulario"],
  ["type image", "Botão de envio feito com uma **imagem**.", `<input type="image" src="enviar.png" alt="Enviar">`, ""],
]});

WCDEV.refs.push({ lang: "html", grupo: "Atributo", itens: [
  ["id", "Nome **único** do elemento. Usado no CSS ({{#nome}}), JavaScript e links ({{href=\"#nome\"}}).", `<section id="contato">...</section>`, "atributo id"],
  ["class", "Nome de **grupo** pra estilizar vários elementos iguais. Pode ter várias separadas por espaço.", `<div class="card destaque">...</div>`, "atributo class|classe"],
  ["style", "CSS direto no elemento (use pouco; prefira arquivo CSS).", `<p style="color: red; font-size: 20px;">Aviso</p>`, "css inline|estilo inline"],
  ["href", "O **destino** de um link.", `<a href="pagina2.html">Próxima</a>`, ""],
  ["src", "O **caminho do arquivo** (imagem, vídeo, script).", `<img src="imagens/logo.png" alt="">`, "caminho da imagem"],
  ["alt", "**Texto alternativo** da imagem: aparece se ela não carregar e é lido por leitores de tela.", `<img src="gato.jpg" alt="Gato laranja dormindo">`, "texto alternativo"],
  ["title", "Texto que aparece ao **passar o mouse** (dica).", `<button title="Salvar arquivo">💾</button>`, "dica|tooltip"],
  ["target", "Onde o link abre. {{_blank}} = **nova aba**.", `<a href="https://site.com" target="_blank" rel="noopener">Abrir</a>`, "nova aba|_blank|abrir em outra aba"],
  ["rel", "Relação do link. Use {{rel=\"noopener\"}} com {{target=\"_blank\"}} por segurança.", `<a href="..." target="_blank" rel="noopener noreferrer">Link</a>`, "noopener"],
  ["placeholder", "**Texto de exemplo** cinza dentro do campo.", `<input placeholder="Digite seu nome">`, "texto de exemplo"],
  ["value", "**Valor** do campo ou opção.", `<input value="Texto inicial">`, ""],
  ["name", "**Nome** do campo quando o formulário é enviado.", `<input name="usuario">`, ""],
  ["required", "Torna o campo **obrigatório**.", `<input type="email" required>`, "obrigatorio|campo obrigatorio"],
  ["disabled", "**Desativa** o campo ou botão.", `<button disabled>Indisponível</button>`, "desativar|desabilitar"],
  ["readonly", "Campo que só pode ser **lido**, não editado.", `<input value="ABC123" readonly>`, "somente leitura"],
  ["checked", "Deixa checkbox/radio já **marcado**.", `<input type="checkbox" checked>`, ""],
  ["selected", "Deixa uma opção do {{<select>}} já **escolhida**.", `<option selected>Python</option>`, ""],
  ["maxlength", "**Máximo de caracteres** num campo.", `<input maxlength="20">`, "limite de caracteres"],
  ["min e max", "Valores **mínimo e máximo** (number, date, range).", `<input type="number" min="1" max="10">`, "min|max"],
  ["pattern", "Exige um **formato** (expressão regular).", `<input pattern="[0-9]{5}-[0-9]{3}" placeholder="CEP 00000-000">`, "validar formato|cep"],
  ["autofocus", "O campo já começa **selecionado**.", `<input autofocus>`, ""],
  ["autocomplete", "Liga/desliga o **preenchimento automático**.", `<input name="email" autocomplete="email">
<input autocomplete="off">`, "preenchimento automatico"],
  ["multiple", "Permite escolher **vários** (arquivos, opções).", `<input type="file" multiple>`, ""],
  ["for", "Liga o {{<label>}} ao campo com aquele {{id}}.", `<label for="nome">Nome</label>
<input id="nome">`, "atributo for"],
  ["width e height", "**Largura e altura** (imagens, vídeos, canvas).", `<img src="a.png" width="300" height="200" alt="">`, "tamanho da imagem"],
  ["controls", "Mostra os **botões** de play/pause em vídeo e áudio.", `<video src="v.mp4" controls></video>`, ""],
  ["autoplay", "Toca **sozinho** (navegadores só deixam se tiver {{muted}}).", `<video src="v.mp4" autoplay muted loop></video>`, "tocar sozinho"],
  ["loop", "Repete a mídia **sem parar**.", `<audio src="m.mp3" loop controls></audio>`, ""],
  ["download", "O link **baixa** o arquivo em vez de abrir.", `<a href="apostila.pdf" download>Baixar apostila</a>`, "baixar arquivo|link de download"],
  ["loading", "{{loading=\"lazy\"}} carrega a imagem **só quando aparecer** (site mais rápido).", `<img src="foto.jpg" loading="lazy" alt="">`, "lazy|lazy loading|carregamento preguicoso"],
  ["hidden", "**Esconde** o elemento.", `<p hidden>Não aparece</p>`, "esconder elemento"],
  ["tabindex", "Ordem de foco ao apertar **Tab**.", `<div tabindex="0">Focável</div>`, ""],
  ["contenteditable", "Deixa o texto **editável** direto na página.", `<p contenteditable="true">Clique e edite!</p>`, "texto editavel"],
  ["draggable", "Permite **arrastar** o elemento.", `<img src="a.png" draggable="true">`, "arrastar"],
  ["data-*", "Guarda **dados personalizados** no elemento (o JavaScript lê com {{dataset}}).", `<button data-produto="42" data-preco="19.90">Comprar</button>`, "data atributo|dataset|atributo personalizado"],
  ["lang", "Diz o **idioma** do conteúdo.", `<html lang="pt-BR">`, "idioma"],
  ["dir", "Direção do texto: {{ltr}} ou {{rtl}}.", `<p dir="rtl">مرحبا</p>`, ""],
  ["onclick", "Roda **JavaScript** quando clica (eventos: {{onclick}}, {{onchange}}, {{oninput}}, {{onsubmit}}...).", `<button onclick="alert('Clicou!')">Clique</button>`, "evento|clicar|onchange|oninput"],
  ["aria-label", "Nome do elemento para **leitores de tela** (acessibilidade).", `<button aria-label="Fechar menu">✕</button>`, "aria|acessibilidade"],
  ["role", "Diz o **papel** do elemento pra acessibilidade.", `<div role="alert">Erro ao salvar!</div>`, ""],
  ["accept", "Tipos de arquivo aceitos num {{type=\"file\"}}.", `<input type="file" accept=".pdf,image/*">`, ""],
  ["action e method", "Pra **onde** e **como** o formulário envia os dados.", `<form action="https://formspree.io/f/SEU_ID" method="POST">
  <input name="email" type="email">
  <button>Enviar</button>
</form>`, "enviar formulario|method post|get"],
  ["srcset", "Várias versões da imagem pra telas diferentes.", `<img src="p.jpg" srcset="p.jpg 480w, g.jpg 1080w" alt="">`, ""],
  ["poster", "**Capa** do vídeo antes de dar play.", `<video src="v.mp4" poster="capa.jpg" controls></video>`, "capa do video|thumbnail"],
]});

WCDEV.refs.push({ lang: "html", grupo: "Símbolo especial (entidade)", itens: [
  ["&lt; e &gt;", "Mostra **< e >** na tela sem virar tag.", `<p>Use &lt;p&gt; para parágrafos</p>`, "menor que|maior que|mostrar tag na tela"],
  ["&amp;", "Mostra o símbolo **&**.", `<p>Tom &amp; Jerry</p>`, "e comercial"],
  ["&nbsp;", "**Espaço** que não quebra linha (e não some quando são vários).", `<p>R$&nbsp;10,00</p>`, "espaco|varios espacos|espaco em branco"],
  ["&copy;", "Símbolo de **direitos autorais** ©.", `<footer>&copy; 2026 WC DEV</footer>`, "copyright|direitos autorais"],
  ["&reg; e &trade;", "Marca **registrada** ® e ™.", `WC DEV&reg;`, "marca registrada"],
  ["&quot;", "Mostra **aspas** dentro de atributos.", `<input value="Ele disse &quot;oi&quot;">`, "aspas"],
  ["&hearts;", "Símbolos prontos: &hearts; ♥, &star;... e também **emojis** direto no texto 😀.", `<p>Feito com &hearts;</p>
<p>Ou com emoji 💙</p>`, "coracao|emoji|simbolos"],
  ["&rarr;", "**Setas**: &rarr; →, &larr; ←, &uarr; ↑, &darr; ↓.", `<a href="#">Próximo &rarr;</a>`, "seta|setas"],
  ["&times; e &divide;", "Sinais de **vezes ×** e **dividido ÷**.", `<p>2 &times; 3 = 6</p>`, "vezes|multiplicacao"],
  ["&deg;", "Símbolo de **grau** °.", `<p>32&deg;C</p>`, "grau|temperatura"],
]});

WCDEV.refs.push({ lang: "html", grupo: "Conceito", itens: [
  ["comentário HTML", "Texto que **não aparece** no site.", `<!-- Isto é um comentário -->`, "comentario html|<!--"],
  ["elemento de bloco e de linha", "**Bloco** ({{div}}, {{p}}, {{h1}}) ocupa a linha toda. **Em linha** ({{span}}, {{a}}, {{strong}}) fica no meio do texto.", `<div>Bloco</div>
<span>Em linha</span> <span>lado a lado</span>`, "block|inline|bloco e inline"],
  ["tag que não fecha", "Algumas tags **não têm fechamento**: {{<br>}}, {{<hr>}}, {{<img>}}, {{<input>}}, {{<meta>}}, {{<link>}}.", `<img src="a.png" alt="">
<br>`, "tag vazia|tag sem fechamento|self closing"],
  ["aninhamento", "Tags dentro de tags devem **fechar na ordem certa**: a última aberta fecha primeiro.", `<!-- certo -->
<p><strong>texto</strong></p>
<!-- errado -->
<p><strong>texto</p></strong>`, "tag dentro de tag|ordem das tags"],
  ["caminhos de arquivo", "{{foto.png}} = mesma pasta. {{img/foto.png}} = dentro da pasta img. {{../foto.png}} = pasta de cima.", `<img src="img/logo.png" alt="">
<link rel="stylesheet" href="../css/style.css">`, "caminho relativo|imagem nao aparece|pasta"],
  ["SEO", "Deixar o site fácil de achar no **Google**: título bom, {{meta description}}, um {{h1}}, tags semânticas, {{alt}} nas imagens.", `<title>Curso de Python Grátis | WC DEV</title>
<meta name="description" content="Aprenda Python do zero com exemplos.">`, "google|aparecer no google|otimizar site"],
  ["acessibilidade", "Fazer o site funcionar pra **todo mundo** (inclusive quem usa leitor de tela): {{alt}}, {{label}}, contraste, tags semânticas.", `<label for="busca">Buscar</label>
<input id="busca">
<img src="a.png" alt="Descrição da imagem">`, "acessivel"],
  ["Open Graph", "Tags que deixam o link **bonito** quando compartilhado no WhatsApp e redes sociais.", `<meta property="og:title" content="WC DEV">
<meta property="og:description" content="Aprenda a programar">
<meta property="og:image" content="https://meusite.com/capa.png">`, "og|preview do link|compartilhar whatsapp"],
  ["viewport", "Essencial pro site funcionar **no celular**.", `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, "site no celular"],
  ["favicon", "O **iconezinho** na aba do navegador.", `<link rel="icon" type="image/png" href="icone.png">`, "icone da aba"],
  ["formulário que envia e-mail", "HTML sozinho **não envia e-mail**. Use um serviço como Formspree no {{action}}.", `<form action="https://formspree.io/f/SEU_ID" method="POST">
  <input name="email" type="email" required>
  <textarea name="mensagem"></textarea>
  <button>Enviar</button>
</form>`, "enviar email|formulario de contato"],
  ["publicar site", "Pra colocar seu site na internet grátis: **GitHub Pages**, **Netlify** ou **Vercel**. O arquivo inicial deve se chamar {{index.html}}.", ``, "hospedar|hospedagem|colocar site no ar|github pages|netlify"],
  ["validar HTML", "Confira erros no seu HTML em **validator.w3.org**.", ``, "validador|verificar html"],
  ["ligar JavaScript", "Coloque o {{<script>}} no fim do {{<body>}} ou use {{defer}} no {{<head>}}.", `<head>
  <script src="app.js" defer></script>
</head>`, "defer|onde colocar script"],
  ["menu de navegação", "Um menu é um {{<nav>}} com uma lista de links.", `<nav>
  <ul>
    <li><a href="#inicio">Início</a></li>
    <li><a href="#sobre">Sobre</a></li>
    <li><a href="#contato">Contato</a></li>
  </ul>
</nav>`, "criar menu|menu html"],
  ["botão que é link", "Use {{<a>}} estilizado como botão com CSS.", `<a href="cadastro.html" class="botao">Cadastre-se</a>`, "link com cara de botao"],
  ["voltar ao topo", "Link para o **topo** da página.", `<body id="topo">
...
<a href="#topo">↑ Voltar ao topo</a>`, "ir para o topo"],
  ["HTML5", "A versão atual do HTML, com tags semânticas, {{<video>}}, {{<audio>}}, {{<canvas>}} e novos inputs.", ``, "versao do html"],
]});

/* =========================================================
   HTML — EXERCÍCIOS DO MODO TREINO (/treinar html)
   O resultado aparece numa pré-visualização dentro do chat.
   ========================================================= */
WCDEV.exercicios = WCDEV.exercicios || [];

WCDEV.exercicios.push(
  {
    lang: "html", nivel: 1,
    titulo: "Título e parágrafo",
    enunciado: "Crie um título {{<h1>}} escrito **Meu Site** e um parágrafo {{<p>}} embaixo, com qualquer texto.",
    dica: "{{<h1>Meu Site</h1>}} e {{<p>Texto aqui</p>}}. Não esqueça de fechar as tags!",
    testes: [
      { re: /<h1[^>]*>\s*Meu Site\s*<\/h1>/i, falta: "Crie o título: {{<h1>Meu Site</h1>}}" },
      { re: /<p[^>]*>[^<]+<\/p>/i, falta: "Crie um parágrafo com texto: {{<p>...</p>}}" },
    ],
    solucao: `<h1>Meu Site</h1>
<p>Bem-vindo ao meu primeiro site!</p>`,
  },
  {
    lang: "html", nivel: 1,
    titulo: "Link em nova aba",
    enunciado: "Crie um link pro **https://www.google.com** escrito **Google** que abra em **nova aba**.",
    dica: "{{<a href=\"...\" target=\"_blank\">Google</a>}}",
    testes: [
      { re: /<a\s[^>]*href\s*=\s*["']https:\/\/www\.google\.com\/?["']/i, falta: "Use {{href=\"https://www.google.com\"}} dentro do {{<a>}}." },
      { re: /<a\s[^>]*target\s*=\s*["']_blank["']/i, falta: "Pra abrir em nova aba: {{target=\"_blank\"}}" },
      { re: />\s*Google\s*<\/a>/i, falta: "O texto do link deve ser **Google**, e feche com {{</a>}}." },
    ],
    solucao: `<a href="https://www.google.com" target="_blank">Google</a>`,
  },
  {
    lang: "html", nivel: 1,
    titulo: "Imagem com alt",
    enunciado: "Coloque uma imagem {{foto.png}} com o texto alternativo **Minha foto** e largura de **200**.",
    dica: "{{<img src=\"foto.png\" alt=\"Minha foto\" width=\"200\">}} (a img não tem fechamento).",
    testes: [
      { re: /<img\s[^>]*src\s*=\s*["']foto\.png["']/i, falta: "Use {{src=\"foto.png\"}}" },
      { re: /<img\s[^>]*alt\s*=\s*["']Minha foto["']/i, falta: "Coloque o texto alternativo: {{alt=\"Minha foto\"}}" },
      { re: /<img\s[^>]*width\s*=\s*["']?200/i, falta: "Defina a largura: {{width=\"200\"}}" },
    ],
    solucao: `<img src="foto.png" alt="Minha foto" width="200">`,
  },
  {
    lang: "html", nivel: 2,
    titulo: "Lista de linguagens",
    enunciado: "Crie uma **lista com bolinhas** com 3 itens: **Python**, **HTML** e **CSS**.",
    dica: "{{<ul>}} por fora e cada item com {{<li>...</li>}}.",
    testes: [
      { re: /<ul[^>]*>[\s\S]*<\/ul>/i, falta: "Use {{<ul>}} e feche com {{</ul>}}." },
      { re: /<li[^>]*>\s*Python\s*<\/li>/i, falta: "Faltou o item {{<li>Python</li>}}" },
      { re: /<li[^>]*>\s*HTML\s*<\/li>/i, falta: "Faltou o item {{<li>HTML</li>}}" },
      { re: /<li[^>]*>\s*CSS\s*<\/li>/i, falta: "Faltou o item {{<li>CSS</li>}}" },
    ],
    solucao: `<ul>
  <li>Python</li>
  <li>HTML</li>
  <li>CSS</li>
</ul>`,
  },
  {
    lang: "html", nivel: 2,
    titulo: "Formulário de contato",
    enunciado: "Crie um {{<form>}} com um campo de **e-mail obrigatório** e um **botão Enviar**.",
    dica: "{{<input type=\"email\" required>}} e {{<button>Enviar</button>}} dentro do form.",
    testes: [
      { re: /<form[^>]*>[\s\S]*<\/form>/i, falta: "Coloque tudo dentro de {{<form>...</form>}}." },
      { re: /<input\s[^>]*type\s*=\s*["']email["']/i, falta: "Use {{<input type=\"email\">}}" },
      { re: /<input\s[^>]*required/i, falta: "Deixe obrigatório com {{required}}." },
      { re: /<button[^>]*>\s*Enviar\s*<\/button>|<input\s[^>]*type\s*=\s*["']submit["'][^>]*value\s*=\s*["']Enviar["']/i, falta: "Crie o botão: {{<button>Enviar</button>}}" },
    ],
    solucao: `<form>
  <label for="email">E-mail:</label>
  <input type="email" id="email" required>
  <button>Enviar</button>
</form>`,
  },
  {
    lang: "html", nivel: 2,
    titulo: "Tabela de notas",
    enunciado: "Crie uma tabela com cabeçalho **Nome | Nota** e uma linha **Ana | 9**.",
    dica: "{{<table>}}, linhas com {{<tr>}}, títulos com {{<th>}} e células com {{<td>}}.",
    testes: [
      { re: /<table[^>]*>[\s\S]*<\/table>/i, falta: "Use {{<table>...</table>}}" },
      { re: /<th[^>]*>\s*Nome\s*<\/th>\s*<th[^>]*>\s*Nota\s*<\/th>/i, falta: "Cabeçalho: {{<th>Nome</th><th>Nota</th>}}" },
      { re: /<td[^>]*>\s*Ana\s*<\/td>\s*<td[^>]*>\s*9\s*<\/td>/i, falta: "Linha: {{<td>Ana</td><td>9</td>}}" },
      { re: /<tr[^>]*>[\s\S]*<\/tr>[\s\S]*<tr/i, falta: "Cada linha precisa do seu {{<tr>}}." },
    ],
    solucao: `<table border="1">
  <tr><th>Nome</th><th>Nota</th></tr>
  <tr><td>Ana</td><td>9</td></tr>
</table>`,
  },
  {
    lang: "html", nivel: 3,
    titulo: "Página semântica",
    enunciado: "Monte uma página com {{<header>}} (com um {{<h1>}}), {{<main>}} (com um {{<p>}}) e {{<footer>}}.",
    dica: "As três tags uma embaixo da outra, cada uma com seu conteúdo.",
    testes: [
      { re: /<header[^>]*>[\s\S]*<h1[^>]*>[\s\S]*<\/h1>[\s\S]*<\/header>/i, falta: "Coloque um {{<h1>}} dentro do {{<header>}}." },
      { re: /<main[^>]*>[\s\S]*<p[^>]*>[\s\S]*<\/p>[\s\S]*<\/main>/i, falta: "Coloque um {{<p>}} dentro do {{<main>}}." },
      { re: /<footer[^>]*>[\s\S]*<\/footer>/i, falta: "Faltou o {{<footer>...</footer>}}." },
    ],
    solucao: `<header>
  <h1>WC DEV</h1>
</header>
<main>
  <p>Aprendendo HTML semântico.</p>
</main>
<footer>© 2026 WC DEV</footer>`,
  }
);
