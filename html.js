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
