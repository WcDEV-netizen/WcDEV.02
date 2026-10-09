/* =========================================================
   WC DEV — JAVASCRIPT
   Trilha em ordem + consulta + desafio de cada aula.
   (O JavaScript do editor roda isolado: num Worker com tempo
   limite, ou num iframe sandbox quando mexe na página.)
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

WCDEV.temas.push(
  {
    id: "js-intro", lang: "javascript", titulo: "O que é JavaScript e onde ele roda",
    chaves: ["o que e javascript", "o que e js", "pra que serve javascript", "aprender javascript", "comecar javascript", "javascript", "js do zero", "console.log"],
    resposta: `### O que é JavaScript? ⚡
**JavaScript (JS)** é a linguagem que dá **comportamento** às páginas: clicar num botão e algo acontecer, validar formulário, jogos no navegador, mudar a página sem recarregar.
- **HTML** = estrutura · **CSS** = aparência · **JavaScript** = comportamento
- Roda **no navegador** (todo navegador já tem) e também fora dele com o **Node.js** (servidores, bots).

Seu primeiro código: abra o navegador, aperte **F12** → aba **Console** e digite:
~~~javascript
console.log("Olá, mundo!");
console.log(2 + 3);
~~~
{{console.log}} mostra coisas no **Console**: é o "print" do JavaScript e a sua principal ferramenta pra achar erros.
💡 Aqui no WC DEV: abra o **editor**, escolha **JavaScript** e toque em **▶ Executar**.`,
    sugestoes: ["variáveis em javascript", "/proximo"],
  },
  {
    id: "js-variaveis", lang: "javascript", titulo: "Variáveis: let, const e tipos",
    chaves: ["variavel javascript", "variaveis javascript", "let", "const", "var", "let e const", "diferenca entre let e const", "tipos em javascript", "typeof", "tipos de dados javascript"],
    resposta: `### Variáveis: let e const
~~~javascript
const nome = "Cesar";     // const: não muda mais
let pontos = 0;           // let: pode mudar
pontos = pontos + 10;

console.log(nome, pontos);   // Cesar 10
~~~
**Regra prática:** use {{const}} sempre; troque pra {{let}} só quando o valor precisar mudar. Evite o {{var}} (é o jeito antigo e tem regras de escopo confusas).

**Tipos principais:**
~~~javascript
const texto = "oi";          // string
const numero = 42.5;         // number (inteiro e decimal são o mesmo tipo)
const ligado = true;         // boolean
const nada = null;           // "vazio" de propósito
let semValor;                // undefined: ainda não recebeu valor
console.log(typeof numero);  // "number"
~~~
⚠️ {{const}} não deixa **trocar** a variável: {{nome = "outro"}} dá **TypeError: Assignment to constant variable**.`,
    sugestoes: ["operadores javascript", "typeof", "/proximo"],
  },
  {
    id: "js-operadores", lang: "javascript", titulo: "Operadores, comparação e conversão",
    chaves: ["operadores javascript", "comparacao javascript", "=== e ==", "diferenca entre == e ===", "number()", "converter texto em numero javascript", "parseint", "nan", "soma javascript"],
    resposta: `### Operadores e comparações
~~~javascript
const a = 10, b = 3;
console.log(a + b, a - b, a * b, a / b);  // 13 7 30 3.333...
console.log(a % b);   // 1 (resto)
console.log(a ** 2);  // 100 (potência)
~~~
**Compare sempre com {{===}}** (valor **e** tipo iguais):
~~~javascript
console.log(5 === 5);     // true
console.log(5 === "5");   // false  (número x texto)
console.log(5 == "5");    // true   (o == converte sozinho: evite!)
~~~
**Texto vira número com {{Number()}}:**
~~~javascript
console.log("2" + "2");            // "22"  (junta textos!)
console.log(Number("2") + 2);      // 4
console.log(Number("abc"));        // NaN (não é número)
~~~
Lógicos: {{&&}} (e), {{||}} (ou), {{!}} (não).`,
    sugestoes: ["if else javascript", "Number", "/proximo"],
  },
  {
    id: "js-if", lang: "javascript", titulo: "if, else e switch",
    chaves: ["if javascript", "else javascript", "if else javascript", "condicao javascript", "switch javascript", "operador ternario javascript", "decisao javascript"],
    resposta: `### Decisões
~~~javascript
const idade = 17;

if (idade >= 18) {
  console.log("Pode dirigir");
} else if (idade >= 16) {
  console.log("Pode votar, mas não dirigir");
} else {
  console.log("Ainda não");
}
~~~
**Ternário** (if de uma linha):
~~~javascript
const status = idade >= 18 ? "adulto" : "menor";
~~~
**switch** pra muitos casos do mesmo valor:
~~~javascript
const dia = "sab";
switch (dia) {
  case "sab":
  case "dom":
    console.log("Fim de semana!");
    break;
  default:
    console.log("Dia útil");
}
~~~
⚠️ Esquecer o {{break}} faz o switch "cair" no próximo case.`,
    sugestoes: ["loops javascript", "/proximo"],
  },
  {
    id: "js-loops", lang: "javascript", titulo: "Loops: for, while e for...of",
    chaves: ["loop javascript", "for javascript", "while javascript", "for of", "repetir javascript", "laco javascript", "for in javascript"],
    resposta: `### Repetições
~~~javascript
for (let i = 1; i <= 5; i++) {
  console.log("Volta", i);
}

let vidas = 3;
while (vidas > 0) {
  console.log("Vidas:", vidas);
  vidas--;            // sem isso, o loop nunca para!
}
~~~
**Percorrer listas:** use {{for...of}}
~~~javascript
const frutas = ["maçã", "uva", "manga"];
for (const fruta of frutas) {
  console.log(fruta);
}
~~~
{{break}} sai do loop; {{continue}} pula pra próxima volta.
⚠️ Loop infinito trava a aba do navegador.`,
    sugestoes: ["arrays javascript", "/proximo"],
  },
  {
    id: "js-funcoes", lang: "javascript", titulo: "Funções e arrow functions",
    chaves: ["funcao javascript", "funcoes javascript", "function", "arrow function", "=>", "return javascript", "parametro javascript", "criar funcao javascript"],
    resposta: `### Funções
~~~javascript
function dobro(n) {
  return n * 2;
}
console.log(dobro(21));   // 42
~~~
**Arrow function** (jeito curto):
~~~javascript
const triplo = (n) => n * 3;
const saudar = (nome = "visitante") => {
  return "Olá, " + nome + "!";
};
console.log(triplo(5), saudar());   // 15 "Olá, visitante!"
~~~
- O {{return}} devolve o resultado e **encerra** a função.
- Sem {{return}}, a função devolve {{undefined}}.
- {{nome = "visitante"}} é um valor **padrão** do parâmetro.`,
    sugestoes: ["arrays javascript", "/proximo"],
  },
  {
    id: "js-arrays", lang: "javascript", titulo: "Arrays e seus métodos (push, map, filter)",
    chaves: ["array javascript", "arrays javascript", "lista javascript", "push", "map", "filter", "find", "reduce", "length", "metodos de array"],
    resposta: `### Arrays (listas)
~~~javascript
const nomes = ["Ana", "Bia"];
nomes.push("Cesar");            // adiciona no fim
console.log(nomes.length);      // 3
console.log(nomes[0]);          // "Ana" (começa no 0)
~~~
**Os métodos mais usados:**
~~~javascript
const precos = [10, 25, 40];

const comDesconto = precos.map(p => p * 0.9);       // transforma cada item
const caros = precos.filter(p => p > 20);           // fica só com os que passam
const primeiroCaro = precos.find(p => p > 20);      // o primeiro que passa
const total = precos.reduce((soma, p) => soma + p, 0);   // junta tudo num valor

console.log(comDesconto, caros, primeiroCaro, total);
~~~
{{map}} e {{filter}} devolvem um **array novo** (não mexem no original).`,
    sugestoes: ["objetos javascript", "map", "filter", "/proximo"],
  },
  {
    id: "js-objetos", lang: "javascript", titulo: "Objetos e JSON",
    chaves: ["objeto javascript", "objetos javascript", "json javascript", "json.stringify", "json.parse", "propriedade", "chave e valor javascript"],
    resposta: `### Objetos
Agrupam dados com **nome: valor**:
~~~javascript
const jogador = {
  nome: "Cesar",
  nivel: 3,
  itens: ["espada", "poção"],
};

jogador.nivel++;                  // muda
console.log(jogador.nome);        // "Cesar"
console.log(jogador["nivel"]);    // 4
jogador.vip = true;               // cria propriedade nova
~~~
**Percorrer:**
~~~javascript
for (const [chave, valor] of Object.entries(jogador)) {
  console.log(chave, valor);
}
~~~
**JSON** é texto no formato de objeto (pra salvar ou mandar pela internet):
~~~javascript
const texto = JSON.stringify(jogador);   // objeto -> texto
const deVolta = JSON.parse(texto);       // texto -> objeto
~~~`,
    sugestoes: ["strings javascript", "JSON.parse", "/proximo"],
  },
  {
    id: "js-strings", lang: "javascript", titulo: "Strings e template literals",
    chaves: ["string javascript", "texto javascript", "template string", "template literal", "crase javascript", "${", "touppercase", "includes", "split", "trim"],
    resposta: `### Textos (strings)
**Template literal** (crase) é o jeito mais fácil de montar texto:
~~~javascript
const nome = "Cesar", nivel = 7;
console.log(\`O \${nome} está no nível \${nivel}!\`);
~~~
**Métodos úteis:**
~~~javascript
const s = "  WC Dev  ";
console.log(s.trim());                 // "WC Dev"
console.log(s.toUpperCase());          // "  WC DEV  "
console.log("banana".includes("nan")); // true
console.log("a,b,c".split(","));       // ["a", "b", "c"]
console.log("oi".length);              // 2
~~~
Strings **não mudam**: os métodos devolvem um texto novo.`,
    sugestoes: ["DOM javascript", "/proximo"],
  },
  {
    id: "js-dom", lang: "javascript", titulo: "DOM: mexendo na página",
    chaves: ["dom", "dom javascript", "getelementbyid", "queryselector", "mudar texto da pagina", "textcontent", "innerhtml", "classlist", "pegar elemento", "alterar html com javascript"],
    resposta: `### DOM: o JavaScript mexendo no HTML
O **DOM** é a página vista pelo JavaScript: cada tag vira um objeto que dá pra ler e mudar.
~~~html
<h1 id="titulo">Olá</h1>
<p class="aviso">Carregando...</p>
~~~
~~~javascript
const titulo = document.getElementById("titulo");
titulo.textContent = "Bem-vindo!";           // troca o texto

const aviso = document.querySelector(".aviso");   // seletor igual ao do CSS
aviso.classList.add("destaque");              // adiciona classe
aviso.style.color = "#1e90ff";

const item = document.createElement("li");   // cria um elemento novo
item.textContent = "Novo item";
document.body.appendChild(item);
~~~
⚠️ Prefira {{textContent}} a {{innerHTML}} quando o texto vem do usuário ({{innerHTML}} executa HTML e abre brecha de segurança).
⚠️ O script precisa rodar **depois** do HTML existir: use {{<script src="..." defer>}}.`,
    sugestoes: ["eventos javascript", "querySelector", "/proximo"],
  },
  {
    id: "js-eventos", lang: "javascript", titulo: "Eventos: clique, teclado e formulário",
    chaves: ["evento javascript", "eventos javascript", "addeventlistener", "click javascript", "onclick", "clicar no botao", "submit javascript", "preventdefault", "tecla javascript", "keydown"],
    resposta: `### Eventos
O código roda **quando algo acontece** (clique, tecla, envio):
~~~javascript
const botao = document.querySelector("#contar");
let cliques = 0;

botao.addEventListener("click", () => {
  cliques++;
  botao.textContent = \`Cliques: \${cliques}\`;
});
~~~
**Formulário** sem recarregar a página:
~~~javascript
const form = document.querySelector("form");
form.addEventListener("submit", (evento) => {
  evento.preventDefault();               // não recarrega
  const email = form.querySelector("input").value;
  console.log("Enviou:", email);
});
~~~
Eventos comuns: {{click}}, {{input}}, {{change}}, {{submit}}, {{keydown}}, {{load}}.`,
    sugestoes: ["async javascript", "addEventListener", "/proximo"],
  },
  {
    id: "js-erros", lang: "javascript", titulo: "Erros: try/catch e o Console",
    chaves: ["erro javascript", "try catch javascript", "try catch", "throw", "console javascript", "debug javascript", "depurar javascript", "referenceerror", "typeerror javascript"],
    resposta: `### Lidando com erros
~~~javascript
function dividir(a, b) {
  if (b === 0) throw new Error("Não dá pra dividir por zero");
  return a / b;
}

try {
  console.log(dividir(10, 0));
} catch (erro) {
  console.log("Deu ruim:", erro.message);
} finally {
  console.log("Isso roda sempre");
}
~~~
**Erros mais comuns no Console (F12):**
- **ReferenceError: x is not defined** → usou uma variável que não existe (ou com outro nome).
- **TypeError: Cannot read properties of null** → o elemento não foi achado ({{getElementById}} devolveu {{null}}).
- **TypeError: Assignment to constant variable** → tentou mudar um {{const}}.
💡 O Console mostra **arquivo e linha**: clique nele pra ir direto no erro.`,
    sugestoes: ["async javascript", "/proximo"],
  },
  {
    id: "js-async", lang: "javascript", titulo: "Assíncrono: setTimeout, Promise e async/await",
    chaves: ["async", "await", "async await", "promise", "promises", "settimeout", "setinterval", "assincrono", "fetch", "esperar javascript", "api javascript"],
    resposta: `### Código que espera
Algumas coisas **demoram** (timer, internet). O JavaScript não trava esperando: ele continua e volta depois.
~~~javascript
console.log("1");
setTimeout(() => console.log("3 (depois de 1 segundo)"), 1000);
console.log("2");
~~~
**Promise + async/await** (o jeito moderno):
~~~javascript
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function contagem() {
  for (let i = 3; i > 0; i--) {
    console.log(i);
    await esperar(1000);   // pausa só esta função
  }
  console.log("Já!");
}
contagem();
~~~
**API como conceito:** {{fetch(url)}} pede dados a um servidor e devolve uma Promise:
~~~javascript
async function buscarUsuario() {
  try {
    const resposta = await fetch("https://exemplo.com/usuario.json");
    if (!resposta.ok) throw new Error("HTTP " + resposta.status);
    const dados = await resposta.json();
    console.log(dados);
  } catch (erro) {
    console.log("Falhou:", erro.message);
  }
}
~~~
(No editor do WC DEV o {{fetch}} não sai pra internet: o código roda isolado.)`,
    sugestoes: ["módulos javascript", "Promise", "/proximo"],
  },
  {
    id: "js-modulos", lang: "javascript", titulo: "Módulos: import e export",
    chaves: ["modulo javascript", "modulos javascript", "import javascript", "export javascript", "export default", "type module", "separar arquivos javascript"],
    resposta: `### Separando o código em arquivos
**matematica.js**
~~~javascript
export function somar(a, b) {
  return a + b;
}
export const PI = 3.14159;
~~~
**principal.js**
~~~javascript
import { somar, PI } from "./matematica.js";
console.log(somar(2, 3), PI);
~~~
No HTML, avise que é módulo:
~~~html
<script type="module" src="principal.js"></script>
~~~
- {{export default}} exporta uma coisa principal: {{import qualquerNome from "./arquivo.js"}}
- Módulos só funcionam abrindo o site por um **servidor** (http://), não clicando duas vezes no arquivo.`,
    sugestoes: ["testes javascript", "/proximo"],
  },
  {
    id: "js-testes", lang: "javascript", titulo: "Testando seu código",
    chaves: ["teste javascript", "testes javascript", "console.assert", "testar funcao javascript", "teste automatizado javascript", "jest"],
    resposta: `### Testes: o código conferindo o código
Um teste chama sua função e confere se o resultado é o esperado:
~~~javascript
function dobro(n) {
  return n * 2;
}

function testar(nome, recebido, esperado) {
  const ok = recebido === esperado;
  console.log(ok ? "✅" : "❌", nome, ok ? "" : \`(veio \${recebido}, esperava \${esperado})\`);
}

testar("dobro de 2", dobro(2), 4);
testar("dobro de 0", dobro(0), 0);
testar("dobro de -3", dobro(-3), -6);
~~~
Teste os **casos especiais**: zero, negativo, vazio, texto no lugar de número.
Em projetos grandes, ferramentas como o **Jest** ou o **Vitest** fazem isso automaticamente.`,
    sugestoes: ["projeto javascript", "/proximo"],
  },
  {
    id: "js-projeto", lang: "javascript", titulo: "Projeto: lista de tarefas",
    chaves: ["projeto javascript", "lista de tarefas javascript", "todo list", "to do list", "projeto web javascript"],
    resposta: `### Projeto: lista de tarefas ✅
Junta DOM, eventos, arrays e localStorage:
~~~html
<form id="form"><input id="tarefa" placeholder="Nova tarefa" required> <button>Adicionar</button></form>
<ul id="lista"></ul>
~~~
~~~javascript
const form = document.querySelector("#form");
const campo = document.querySelector("#tarefa");
const lista = document.querySelector("#lista");
let tarefas = JSON.parse(localStorage.getItem("tarefas") || "[]");

function desenhar() {
  lista.innerHTML = "";
  tarefas.forEach((texto, i) => {
    const li = document.createElement("li");
    li.textContent = texto + " ";
    const apagar = document.createElement("button");
    apagar.textContent = "✕";
    apagar.addEventListener("click", () => {
      tarefas.splice(i, 1);
      salvar();
    });
    li.appendChild(apagar);
    lista.appendChild(li);
  });
}

function salvar() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  desenhar();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  tarefas.push(campo.value.trim());
  campo.value = "";
  salvar();
});

desenhar();
~~~
Desafio extra: marcar tarefa como feita (risquinho) ao clicar no texto.`,
    sugestoes: ["/desafio javascript", "/missao javascript"],
  },
);

/* ---------------- consulta rápida ---------------- */
WCDEV.refs = WCDEV.refs || [];
WCDEV.refs.push({ lang: "javascript", grupo: "Básico", itens: [
  ["console.log", "Mostra valores no **Console** (F12).", `console.log("Pontos:", 10);`],
  ["typeof", "Diz o **tipo** de um valor.", `console.log(typeof 42);   // "number"`],
  ["Number", "Converte texto em **número** ({{NaN}} se não der).", `const n = Number("42");`, "converter para numero"],
  ["parseInt", "Pega o **inteiro** do começo de um texto.", `parseInt("42px");   // 42`],
  ["String", "Converte em **texto**.", `String(42);   // "42"`],
  ["Math.random", "Número aleatório entre 0 e 1.", `const dado = Math.floor(Math.random() * 6) + 1;`, "sortear numero javascript|numero aleatorio javascript"],
  ["Math.floor", "Arredonda **pra baixo**.", `Math.floor(4.9);   // 4`],
  ["Math.round", "Arredonda pro mais perto.", `Math.round(4.5);   // 5`],
  ["isNaN", "Confere se **não é número**.", `Number.isNaN(Number("abc"));   // true`],
  ["null e undefined", "{{null}} = vazio de propósito; {{undefined}} = ainda sem valor.", `let a;            // undefined\nconst b = null;`],
] });
WCDEV.refs.push({ lang: "javascript", grupo: "Texto e array", itens: [
  ["template literal", "Texto com **crase** e variáveis dentro.", "const msg = `Olá, ${nome}!`;", "crase|template string"],
  ["includes", "Confere se texto/array **contém** algo.", `"banana".includes("na");   // true`],
  ["split", "Quebra um texto num **array**.", `"a,b".split(",");   // ["a", "b"]`],
  ["trim", "Tira espaços das pontas.", `"  oi  ".trim();`],
  ["push", "Adiciona no **fim** do array.", `lista.push("novo");`],
  ["pop", "Tira o **último** item.", `const ultimo = lista.pop();`],
  ["map", "Cria um array novo **transformando** cada item.", `const dobros = [1, 2].map(n => n * 2);`],
  ["filter", "Cria um array novo só com os itens que **passam no teste**.", `const pares = [1, 2, 3, 4].filter(n => n % 2 === 0);`],
  ["find", "Devolve o **primeiro** item que passa no teste.", `const u = usuarios.find(u => u.id === 3);`],
  ["reduce", "**Junta** o array num valor só.", `const soma = [1, 2, 3].reduce((t, n) => t + n, 0);`],
  ["forEach", "Roda uma função pra **cada item**.", `nomes.forEach(n => console.log(n));`],
  ["splice", "Remove/insere itens no meio do array.", `lista.splice(1, 1);   // remove o item da posição 1`],
  ["sort", "Ordena o array (pra números, passe a comparação).", `numeros.sort((a, b) => a - b);`],
  ["length", "Quantidade de itens/letras.", `[1, 2, 3].length;   // 3`],
] });
WCDEV.refs.push({ lang: "javascript", grupo: "Objetos e dados", itens: [
  ["Object.keys", "Array com as **chaves** do objeto.", `Object.keys({ a: 1, b: 2 });   // ["a", "b"]`],
  ["Object.entries", "Array de pares [chave, valor].", `for (const [k, v] of Object.entries(obj)) console.log(k, v);`],
  ["JSON.stringify", "Objeto → **texto** JSON.", `const txt = JSON.stringify({ nivel: 3 });`],
  ["JSON.parse", "Texto JSON → **objeto**.", `const obj = JSON.parse('{"nivel":3}');`],
  ["localStorage", "Guarda texto **no navegador** (continua depois de fechar).", `localStorage.setItem("nome", "Cesar");\nconst n = localStorage.getItem("nome");`, "salvar no navegador"],
  ["desestruturação", "Tira valores de objetos/arrays em variáveis.", `const { nome, nivel } = jogador;\nconst [primeiro, segundo] = lista;`, "destructuring"],
  ["spread", "Espalha os itens ({{...}}).", `const todos = [...lista1, ...lista2];\nconst copia = { ...jogador };`, "operador spread|tres pontinhos"],
  ["class", "Molde de objetos (POO).", `class Animal {\n  constructor(nome) { this.nome = nome; }\n  falar() { console.log(this.nome + " fez um som"); }\n}\nnew Animal("Rex").falar();`, "classe javascript"],
] });
WCDEV.refs.push({ lang: "javascript", grupo: "Página (DOM e eventos)", itens: [
  ["document.getElementById", "Pega o elemento pelo **id**.", `const t = document.getElementById("titulo");`, "getelementbyid"],
  ["document.querySelector", "Pega o **primeiro** elemento que bate com o seletor CSS.", `const b = document.querySelector(".botao");`, "queryselector"],
  ["querySelectorAll", "Pega **todos** os elementos do seletor.", `document.querySelectorAll("li").forEach(li => li.remove());`],
  ["textContent", "Lê/troca o **texto** do elemento (seguro).", `titulo.textContent = "Novo título";`],
  ["innerHTML", "Lê/troca o **HTML** de dentro (cuidado com texto do usuário!).", `caixa.innerHTML = "<b>oi</b>";`],
  ["classList", "Adiciona/remove/alterna classes CSS.", `menu.classList.toggle("aberto");`],
  ["createElement", "Cria um elemento novo.", `const li = document.createElement("li");\nlista.appendChild(li);`],
  ["addEventListener", "Roda uma função **quando o evento acontece**.", `botao.addEventListener("click", () => console.log("clicou"));`, "evento de clique|onclick"],
  ["preventDefault", "Cancela o comportamento padrão (ex: formulário recarregar a página).", `form.addEventListener("submit", e => e.preventDefault());`],
  ["value", "O texto digitado num {{<input>}} (sempre string!).", `const idade = Number(campo.value);`],
] });
WCDEV.refs.push({ lang: "javascript", grupo: "Tempo e assíncrono", itens: [
  ["setTimeout", "Roda uma função **uma vez** depois de X ms.", `setTimeout(() => console.log("1s depois"), 1000);`],
  ["setInterval", "Roda **repetindo** a cada X ms (pare com clearInterval).", `const id = setInterval(() => console.log("tic"), 1000);\nclearInterval(id);`],
  ["Promise", "Representa um valor que **vai chegar depois**.", `const p = new Promise(resolve => setTimeout(() => resolve("pronto"), 500));\np.then(v => console.log(v));`],
  ["async e await", "Escreve código assíncrono como se fosse normal.", `async function f() {\n  const r = await fetch("/dados.json");\n  return r.json();\n}`, "async await"],
  ["fetch", "Pede dados a um servidor (devolve uma Promise).", `fetch("/dados.json").then(r => r.json()).then(d => console.log(d));`],
  ["try e catch", "Pega erros sem quebrar o programa.", `try {\n  JSON.parse("{errado");\n} catch (e) {\n  console.log("JSON inválido");\n}`, "try catch javascript"],
] });

/* ---------------- desafio de cada aula ---------------- */
WCDEV.desafiosAula = WCDEV.desafiosAula || {};
(function () {
  const A = (id, nivel, enunciado, dica, testes, solucao, extra) => {
    WCDEV.desafiosAula[id] = { aula: id, nivel, enunciado, dica, testes: testes.map(([re, falta]) => ({ re, falta })), solucao, ...(extra || {}) };
  };
  A("js-intro", 1, "Mostre **Olá, mundo!** e o resultado de **7 * 6** no Console, com dois {{console.log}}.", "{{console.log(\"Olá, mundo!\");}} e {{console.log(7 * 6);}}",
    [[/console\.log\s*\(\s*["'`][^"'`]*mundo[^"'`]*["'`]\s*\)/i, "Mostre {{console.log(\"Olá, mundo!\");}}."], [/console\.log\s*\(\s*7\s*\*\s*6\s*\)/, "Mostre {{console.log(7 * 6);}}."]],
    `console.log("Olá, mundo!");\nconsole.log(7 * 6);`);
  A("js-variaveis", 1, "Crie {{const nome}} com seu nome e {{let pontos}} valendo 0. Some **10** em {{pontos}} e mostre os dois.", "{{pontos = pontos + 10;}} (ou {{pontos += 10;}})",
    [[/const\s+nome\s*=\s*["'`]/, "Crie {{const nome = \"...\";}}."], [/let\s+pontos\s*=\s*0/, "Crie {{let pontos = 0;}}."], [/pontos\s*(\+=\s*10|=\s*pontos\s*\+\s*10)/, "Some 10: {{pontos += 10;}}."], [/console\.log\s*\(/, "Mostre com {{console.log}}."]],
    `const nome = "Cesar";\nlet pontos = 0;\npontos += 10;\nconsole.log(nome, pontos);`);
  A("js-operadores", 1, "O texto {{\"20\"}} veio de um formulário. Converta com {{Number()}}, some **5** e mostre **25**. Depois mostre se {{25 === \"25\"}}.", "{{const total = Number(\"20\") + 5;}}",
    [[/Number\s*\(\s*["'`]20["'`]\s*\)/, "Converta com {{Number(\"20\")}}."], [/\+\s*5/, "Some {{+ 5}}."], [/25\s*===\s*["'`]25["'`]/, "Mostre {{25 === \"25\"}} (vai dar false)."]],
    `const total = Number("20") + 5;\nconsole.log(total);\nconsole.log(25 === "25");`);
  A("js-if", 1, "Com {{const nota = 7;}}: mostre **\"Aprovado\"** se for 7 ou mais, **\"Recuperação\"** se for 5 ou mais, senão **\"Reprovado\"**.", "{{if (nota >= 7) ... else if (nota >= 5) ... else ...}}",
    [[/if\s*\(\s*nota\s*>=\s*7\s*\)/, "Faltou {{if (nota >= 7)}}."], [/else\s+if\s*\(\s*nota\s*>=\s*5\s*\)/, "Faltou {{else if (nota >= 5)}}."], [/\belse\s*\{/, "Faltou o {{else}} final."]],
    `const nota = 7;\nif (nota >= 7) {\n  console.log("Aprovado");\n} else if (nota >= 5) {\n  console.log("Recuperação");\n} else {\n  console.log("Reprovado");\n}`);
  A("js-loops", 1, "Com um {{for}}, mostre a **tabuada do 3** (3 x 1 = 3 até 3 x 10 = 30).", "{{for (let i = 1; i <= 10; i++)}} e um template literal.",
    [[/for\s*\(\s*let\s+(\w+)\s*=\s*1\s*;\s*\1\s*<=\s*10\s*;\s*\1\s*\+\+\s*\)/, "Use {{for (let i = 1; i <= 10; i++)}}."], [/3\s*\*\s*\w+|\w+\s*\*\s*3/, "Multiplique por 3."], [/console\.log\s*\(/, "Mostre com {{console.log}}."]],
    "for (let i = 1; i <= 10; i++) {\n  console.log(`3 x ${i} = ${3 * i}`);\n}");
  A("js-funcoes", 1, "Crie a arrow function {{media}} que recebe **a** e **b** e retorna a média. Mostre {{media(8, 6)}}.", "{{const media = (a, b) => (a + b) / 2;}}",
    [[/const\s+media\s*=\s*\(\s*a\s*,\s*b\s*\)\s*=>/, "Crie {{const media = (a, b) => ...}}."], [/\(\s*a\s*\+\s*b\s*\)\s*\/\s*2/, "A média é {{(a + b) / 2}}."], [/media\s*\(\s*8\s*,\s*6\s*\)/, "Mostre {{media(8, 6)}}."]],
    `const media = (a, b) => (a + b) / 2;\nconsole.log(media(8, 6));`);
  A("js-arrays", 2, "Com {{const precos = [5, 12, 30, 8];}}: use {{filter}} pra pegar os **maiores que 10** e {{reduce}} pra somar **todos**. Mostre os dois.", "{{precos.filter(p => p > 10)}} e {{precos.reduce((t, p) => t + p, 0)}}",
    [[/precos\.filter\s*\(/, "Use {{precos.filter(...)}}."], [/>\s*10/, "O filtro é {{> 10}}."], [/precos\.reduce\s*\(/, "Use {{precos.reduce(...)}}."]],
    `const precos = [5, 12, 30, 8];\nconst caros = precos.filter(p => p > 10);\nconst total = precos.reduce((t, p) => t + p, 0);\nconsole.log(caros, total);`);
  A("js-objetos", 2, "Crie o objeto {{jogador}} com {{nome}} e {{nivel}}. Aumente o nível em 1 e transforme o objeto em texto com {{JSON.stringify}}.", "{{jogador.nivel++;}} e {{JSON.stringify(jogador)}}",
    [[/const\s+jogador\s*=\s*\{/, "Crie {{const jogador = { ... };}}."], [/nome\s*:/, "Precisa da propriedade {{nome}}."], [/jogador\.nivel\s*(\+\+|\+=\s*1)/, "Aumente: {{jogador.nivel++;}}."], [/JSON\.stringify\s*\(\s*jogador\s*\)/, "Use {{JSON.stringify(jogador)}}."]],
    `const jogador = { nome: "Cesar", nivel: 1 };\njogador.nivel++;\nconsole.log(JSON.stringify(jogador));`);
  A("js-strings", 1, "Com {{const nome = \"  wc dev  \"}}: tire os espaços, deixe MAIÚSCULO e mostre {{\"Bem-vindo, WC DEV!\"}} usando **template literal**.", "{{nome.trim().toUpperCase()}} dentro de crases.",
    [[/\.trim\s*\(\s*\)/, "Use {{.trim()}}."], [/\.toUpperCase\s*\(\s*\)/, "Use {{.toUpperCase()}}."], [/`[^`]*\$\{[^}]+\}[^`]*`/, "Monte o texto com crase e {{${...}}}."]],
    "const nome = \"  wc dev  \";\nconsole.log(`Bem-vindo, ${nome.trim().toUpperCase()}!`);");
  A("js-dom", 2, "Pegue o elemento com id **titulo** e troque o texto dele para **\"Página nova\"**, usando {{textContent}}.", "{{document.getElementById(\"titulo\").textContent = \"Página nova\";}}",
    [[/document\.(getElementById\s*\(\s*["'`]titulo["'`]|querySelector\s*\(\s*["'`]#titulo["'`])/, "Pegue com {{document.getElementById(\"titulo\")}}."], [/\.textContent\s*=\s*["'`]P[aá]gina nova["'`]/i, "Troque com {{.textContent = \"Página nova\"}}."]],
    `const titulo = document.getElementById("titulo");\ntitulo.textContent = "Página nova";`, { htmlBase: `<h1 id="titulo">Título antigo</h1>` });
  A("js-eventos", 2, "Quando o botão {{#btn}} for clicado, mostre **\"Clicou!\"** no Console. Use {{addEventListener}}.", "{{document.querySelector(\"#btn\").addEventListener(\"click\", () => ...)}}",
    [[/querySelector\s*\(\s*["'`]#btn["'`]\s*\)|getElementById\s*\(\s*["'`]btn["'`]\s*\)/, "Pegue o botão: {{document.querySelector(\"#btn\")}}."], [/addEventListener\s*\(\s*["'`]click["'`]/, "Use {{addEventListener(\"click\", ...)}}."], [/Clicou/, "Mostre {{\"Clicou!\"}}."]],
    `const btn = document.querySelector("#btn");\nbtn.addEventListener("click", () => {\n  console.log("Clicou!");\n});`, { htmlBase: `<button id="btn">Clique</button>` });
  A("js-erros", 2, "Use {{try/catch}} pra ler o texto {{\"{quebrado\"}} com {{JSON.parse}}. No {{catch}}, mostre **\"JSON inválido\"**.", "{{try { JSON.parse(\"{quebrado\"); } catch (e) { ... }}}",
    [[/try\s*\{/, "Faltou o {{try { }}}."], [/JSON\.parse\s*\(/, "Use {{JSON.parse(...)}}."], [/catch\s*\(\s*\w+\s*\)\s*\{/, "Faltou o {{catch (erro) { }}}."], [/JSON inv[aá]lido/i, "Mostre {{\"JSON inválido\"}}."]],
    `try {\n  JSON.parse("{quebrado");\n} catch (erro) {\n  console.log("JSON inválido");\n}`);
  A("js-async", 3, "Crie {{const esperar = (ms) => new Promise(...)}} e uma função {{async}} que mostra **\"a\"**, espera 500 ms com {{await}}, e mostra **\"b\"**.", "{{new Promise(resolve => setTimeout(resolve, ms))}}",
    [[/new\s+Promise\s*\(/, "Crie a Promise: {{new Promise(resolve => setTimeout(resolve, ms))}}."], [/async\s+(function|\(|\w+\s*=>)/, "A função precisa ser {{async}}."], [/await\s+esperar\s*\(\s*500\s*\)/, "Espere com {{await esperar(500)}}."]],
    `const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));\n\nasync function rodar() {\n  console.log("a");\n  await esperar(500);\n  console.log("b");\n}\nrodar();`);
  A("js-modulos", 2, "Escreva o **export** de uma função {{somar(a, b)}} e, embaixo, a linha de **import** que traz ela de {{\"./matematica.js\"}}.", "{{export function somar(a, b) { ... }}} e {{import { somar } from \"./matematica.js\";}}",
    [[/export\s+(function\s+somar|const\s+somar)/, "Exporte: {{export function somar(a, b)}}."], [/import\s*\{\s*somar\s*\}\s*from\s*["'`]\.\/matematica\.js["'`]/, "Importe: {{import { somar } from \"./matematica.js\";}}"]],
    `export function somar(a, b) {\n  return a + b;\n}\n\n// em outro arquivo:\nimport { somar } from "./matematica.js";`, { semExecutar: true });
  A("js-testes", 2, "Crie a função {{ehPar(n)}} e teste com {{console.assert}}: {{ehPar(4)}} deve ser {{true}} e {{ehPar(3)}} deve ser {{false}}.", "{{const ehPar = n => n % 2 === 0;}} e {{console.assert(ehPar(4) === true, \"4 é par\");}}",
    [[/ehPar\s*=|function\s+ehPar/, "Crie a função {{ehPar}}."], [/%\s*2\s*===\s*0/, "Par: {{n % 2 === 0}}."], [/console\.assert\s*\(\s*ehPar\s*\(\s*4\s*\)/, "Teste {{ehPar(4)}} com {{console.assert}}."], [/console\.assert\s*\(\s*(!\s*ehPar\s*\(\s*3\s*\)|ehPar\s*\(\s*3\s*\)\s*===\s*false)/, "Teste {{ehPar(3)}} (deve ser false)."]],
    `const ehPar = (n) => n % 2 === 0;\nconsole.assert(ehPar(4) === true, "4 deveria ser par");\nconsole.assert(ehPar(3) === false, "3 não deveria ser par");\nconsole.log("testes rodaram");`);
  A("js-projeto", 3, "Mini lista: com {{const tarefas = [];}}, crie {{adicionar(texto)}} que faz {{push}} e {{listar()}} que mostra cada tarefa com o número (1. ..., 2. ...). Adicione duas e liste.", "{{tarefas.forEach((t, i) => console.log(`${i + 1}. ${t}`))}}",
    [[/const\s+tarefas\s*=\s*\[\s*\]/, "Crie {{const tarefas = [];}}."], [/tarefas\.push\s*\(/, "{{adicionar}} usa {{tarefas.push(texto)}}."], [/(forEach|for\s*\()/, "{{listar}} percorre as tarefas."], [/adicionar\s*\([^)]*\)[\s\S]*adicionar\s*\(/, "Adicione **duas** tarefas."]],
    "const tarefas = [];\n\nfunction adicionar(texto) {\n  tarefas.push(texto);\n}\n\nfunction listar() {\n  tarefas.forEach((t, i) => console.log(`${i + 1}. ${t}`));\n}\n\nadicionar(\"Estudar JS\");\nadicionar(\"Fazer o desafio\");\nlistar();");
})();
