/* =========================================================
   WC DEV — AULAS EXTRAS (Python, HTML e CSS)
   Depuração, POO na prática, acessibilidade, CSS+JS no HTML
   e como consertar problemas visuais.
   Pra adicionar mais aulas: copie um bloco, troque id/lang/
   titulo/chaves/resposta. O motor encontra sozinho.
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

WCDEV.temas.push(
  /* ===================== PYTHON ===================== */
  {
    id: "py-debug",
    lang: "python",
    titulo: "Depurando: achando erros no Python",
    chaves: ["depurar", "depuracao", "debug", "debugar", "debug python", "achar erro python", "encontrar erro", "breakpoint", "pdb", "traceback", "ler traceback", "logging", "assert", "por que nao funciona python", "codigo nao funciona"],
    resposta: `### Achando erros no Python 🐛
**1) Leia o Traceback de baixo pra cima.** A última linha diz **o tipo do erro**, e a linha com {{File ..., line N}} diz **onde**:
~~~
Traceback (most recent call last):
  File "jogo.py", line 4, in <module>
    total = pontos + bonus
TypeError: unsupported operand type(s) for +: 'int' and 'str'
~~~
Aqui: linha 4, tentou somar **número com texto** ({{bonus}} veio de um {{input()}} e não foi convertido).

**2) Print pra espiar os valores** (o jeito mais rápido):
~~~python
bonus = input("Bônus: ")
print("DEBUG bonus =", repr(bonus), type(bonus))   # mostra '10' <class 'str'>
~~~
**3) Pausar o programa e investigar** com {{breakpoint()}} (Python 3.7+):
~~~python
def calcular(precos):
    total = 0
    for p in precos:
        breakpoint()   # o programa para aqui
        total += p
    return total
~~~
No terminal que abrir: {{p total}} mostra a variável, {{n}} vai pra próxima linha, {{c}} continua, {{q}} sai.

**4) assert: trava cedo se algo estiver errado**
~~~python
def dividir(a, b):
    assert b != 0, "b não pode ser zero"
    return a / b
~~~
**5) logging** pra programas maiores (dá pra desligar depois sem apagar nada):
~~~python
import logging
logging.basicConfig(level=logging.DEBUG)
logging.debug("valor recebido: %s", 42)
~~~
💡 Me cole o Traceback inteiro que eu te explico o que aconteceu.`,
    sugestoes: ["Erros e try/except", "TypeError", "NameError"],
  },
  {
    id: "py-poo",
    lang: "python",
    titulo: "Orientação a objetos na prática (herança)",
    chaves: ["orientacao a objetos", "poo", "poo python", "programacao orientada a objetos", "heranca", "herdar classe", "super", "metodo", "atributo", "encapsulamento", "polimorfismo", "__str__", "classe filha", "classe pai"],
    resposta: `### POO na prática
Você junta **dados** (atributos) e **ações** (métodos) numa classe. Com **herança**, uma classe reaproveita outra.
~~~python
class Personagem:
    def __init__(self, nome, vida=100):
        self.nome = nome
        self.vida = vida

    def levar_dano(self, dano):
        self.vida = max(0, self.vida - dano)
        print(f"{self.nome} levou {dano} de dano. Vida: {self.vida}")

    def __str__(self):          # como o objeto aparece no print
        return f"{self.nome} ({self.vida} HP)"


class Guerreiro(Personagem):    # herda tudo de Personagem
    def __init__(self, nome):
        super().__init__(nome, vida=150)   # chama o __init__ do pai
        self.escudo = 20

    def levar_dano(self, dano):            # polimorfismo: muda o comportamento
        super().levar_dano(max(0, dano - self.escudo))


heroi = Guerreiro("Ana")
heroi.levar_dano(50)    # Ana levou 30 de dano. Vida: 120
print(heroi)            # Ana (120 HP)
~~~
**Resumo:**
- {{self}} é o próprio objeto.
- {{super()}} acessa a classe pai.
- Reescrever um método na filha muda o comportamento só dela.
- Nome com {{_}} na frente ({{self._senha}}) avisa: "não mexa nisso de fora" (encapsulamento por convenção).`,
    sugestoes: ["Classes e objetos", "super", "__init__"],
  },

  /* ===================== HTML ===================== */
  {
    id: "html-acessibilidade",
    lang: "html",
    titulo: "Acessibilidade (site pra todo mundo)",
    chaves: ["acessibilidade", "acessivel", "site acessivel", "leitor de tela", "aria", "aria-label", "alt da imagem", "texto alternativo", "contraste", "navegacao por teclado", "tabindex", "a11y", "deficiencia visual"],
    resposta: `### Acessibilidade
Site acessível funciona pra quem usa **leitor de tela**, só **teclado**, ou enxerga pouco. E de quebra ajuda no Google.
~~~html
<!DOCTYPE html>
<html lang="pt-BR">   <!-- o leitor de tela fala com sotaque certo -->
<head>
    <meta charset="UTF-8">
    <title>Loja WC</title>
</head>
<body>
    <a href="#conteudo" class="pular">Pular para o conteúdo</a>

    <header>
        <nav aria-label="Menu principal">
            <a href="/">Início</a>
            <a href="/produtos">Produtos</a>
        </nav>
    </header>

    <main id="conteudo">
        <h1>Produtos</h1>
        <img src="camiseta.jpg" alt="Camiseta azul com o logo WC DEV">

        <form>
            <label for="email">E-mail</label>
            <input id="email" type="email" required>
            <button type="submit">Assinar</button>
        </form>

        <button aria-label="Fechar aviso">✕</button>
    </main>
</body>
</html>
~~~
**Regras de ouro:**
- Toda {{<img>}} tem {{alt}} descrevendo a imagem ({{alt=""}} se for só enfeite).
- Todo {{<input>}} tem um {{<label>}} ligado pelo {{for}}/{{id}}.
- Use {{<button>}} pra ações e {{<a>}} pra navegar. **Não** use {{<div onclick>}}: não funciona no teclado.
- Títulos em ordem: um {{<h1>}}, depois {{<h2>}}, {{<h3>}}...
- Botão só com ícone precisa de {{aria-label}}.
- Contraste bom entre texto e fundo, e nunca tire o contorno de foco sem colocar outro.
💡 Teste: navegue no seu site só com **Tab** e **Enter**. Se travar em algum lugar, tem problema.`,
    sugestoes: ["HTML semântico", "alt", "aria-label"],
  },
  {
    id: "html-css-js",
    lang: "html",
    titulo: "Ligando CSS e JavaScript no HTML",
    chaves: ["ligar css", "ligar javascript", "ligar js", "colocar javascript", "script no html", "javascript no html", "js no html", "link css", "importar css", "arquivo css separado", "arquivo js", "defer", "addeventlistener", "clicar no botao", "evento de clique", "integrar css e js"],
    resposta: `### HTML + CSS + JavaScript juntos
Cada um tem um papel: **HTML** = estrutura, **CSS** = aparência, **JavaScript** = comportamento.
~~~html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Contador</title>
    <link rel="stylesheet" href="style.css">   <!-- CSS: no <head> -->
    <script src="script.js" defer></script>    <!-- JS: defer = roda depois do HTML carregar -->
</head>
<body>
    <h1 id="titulo">Cliques: 0</h1>
    <button id="botao" class="botao">Clique aqui</button>
</body>
</html>
~~~
**style.css**
~~~css
.botao {
    background: #1e90ff;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 18px;
}
~~~
**script.js** (o básico de JavaScript que conversa com o HTML):
~~~
let cliques = 0;
const botao = document.getElementById("botao");
const titulo = document.getElementById("titulo");

botao.addEventListener("click", () => {
    cliques++;
    titulo.textContent = "Cliques: " + cliques;
});
~~~
**Erros comuns:**
- Caminho errado: se o {{style.css}} está numa pasta, use {{href="css/style.css"}}.
- JS sem {{defer}} no {{<head>}} roda **antes** do botão existir → {{null}}. Use {{defer}} ou coloque o {{<script>}} no fim do {{<body>}}.
- Abra o **Console** (F12) pra ver os erros de JavaScript.
ℹ️ Eu ensino **HTML e CSS** a fundo; de JavaScript eu sei esse básico que liga o JS na página.`,
    sugestoes: ["O que é CSS e como ligar no HTML", "Formulários e botões", "div, span, class e id"],
  },

  /* ===================== CSS ===================== */
  {
    id: "css-problemas",
    lang: "css",
    titulo: "Consertando problemas visuais",
    chaves: ["problema visual", "problemas visuais", "layout quebrado", "layout bugado", "css nao funciona", "css bugado", "scroll horizontal", "rolagem horizontal", "site saindo da tela", "overflow", "imagem estourando", "imagem saindo da div", "elemento por cima", "z-index nao funciona", "nao centraliza", "div nao centraliza", "espaco em branco", "margin estranha", "box-sizing", "corrigir css"],
    resposta: `### Consertando problemas visuais 🔧
**Truque nº 1: enxergue as caixas.** Cole isso no fim do CSS e veja onde cada elemento está (depois apague):
~~~css
* { outline: 1px solid red; }
~~~
**Site com rolagem pro lado (overflow horizontal)**: algo está mais largo que a tela.
~~~css
img, video { max-width: 100%; height: auto; }   /* imagem não estoura */
* { box-sizing: border-box; }                    /* padding não aumenta a largura */
~~~
E evite {{width: 100vw}} (conta a barra de rolagem). Use {{width: 100%}}.

**Não centraliza:**
~~~css
.pai {
    display: flex;
    justify-content: center;   /* na horizontal */
    align-items: center;       /* na vertical (o pai precisa ter altura!) */
    min-height: 100vh;
}
~~~
**{{z-index}} não funciona**: ele só vale em elemento com {{position}} diferente de {{static}}.
~~~css
.menu { position: relative; z-index: 10; }
~~~
**Espaço estranho entre elementos:**
- Margem do {{<body>}}: coloque {{margin: 0}} no {{body}}.
- Margens de cima/baixo de dois blocos **se juntam** (margin collapse): use {{padding}} ou {{gap}} no flex/grid.
- Espaço embaixo de imagem: coloque {{display: block}} na {{img}}.

**O CSS não pega de jeito nenhum:**
- Confira o {{<link>}} e o caminho do arquivo (F12 → aba Network).
- Outra regra mais **específica** está ganhando: veja no F12 → Elements → Styles (a regra riscada perdeu).
- Erro de digitação: um ponto e vírgula ou uma chave faltando invalida o que vem depois.`,
    sugestoes: ["Box model: margin, padding e border", "Flexbox (alinhar e centralizar)", "Site responsivo (celular)"],
  },
);
