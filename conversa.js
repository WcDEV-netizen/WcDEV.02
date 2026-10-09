/* =========================================================
   WC DEV — CONVERSA (bate-papo, dúvidas gerais, motivação)
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

// escolhe uma frase aleatória
const sortear = lista => () => lista[Math.floor(Math.random() * lista.length)];

WCDEV.temas.push(
  {
    id: "boas-vindas",
    lang: "conversa",
    titulo: "boas-vindas",
    chaves: [],
    resposta: `### Olá! Eu sou o WC DEV 👋
Sou um assistente que te ensina a programar do zero, passo a passo, em **Python**, **HTML**, **CSS** e **Pawn** (servidores de GTA SA-MP).
O que eu sei fazer:
- **Explicar**: pergunte do seu jeito, até com erro de digitação
- **Gerar código**: "cria um comando /cura que dá 100 de vida"
- **Corrigir**: cole um código e eu conserto e explico cada erro
- **Treinar**: {{/desafio pawn}} inventa desafios novos toda vez
- **Aprender**: me ensine respostas novas com {{/ensinar}}
Por onde você quer começar?`,
    sugestoes: ["quero aprender pawn", "quero aprender python", "quero aprender html", "/treinar"],
  },
  {
    id: "ajuda",
    lang: "conversa",
    titulo: "ajuda",
    chaves: ["ajuda", "help", "comandos", "o que voce sabe", "o que voce faz", "como funciona", "como usar"],
    resposta: `### Como me usar
Pergunte do seu jeito, por exemplo: **"como criar um comando no samp"**, **"como fazer um for em python"** ou **"como centralizar uma div"**.

**Aprender**
- {{/pawn}} {{/python}} {{/html}} {{/css}}: mostra a trilha de aulas
- {{/proximo}}: próxima aula da trilha
- {{/indice pawn}}: tudo que eu sei de uma linguagem

**Treinar**
- {{/treinar pawn}}: exercícios em ordem (também python, html, css)
- {{/desafio pawn}}: desafio novo, inventado na hora (nunca acaba!)
- {{/desafio sobre SetPlayerHealth}}: desafio sobre qualquer assunto
- {{/missao pawn}}: projeto maior com checklist
- {{/dica}}, {{/resposta}}, {{/pular}}, {{/sair}}: dentro do treino
- {{/progresso}}: quantos exercícios você já fez
- Cole qualquer código e eu **reviso**; depois {{/corrigir}} conserta e {{/explicar}} explica linha por linha

**Gerar código**
- Peça do seu jeito: **"cria um comando /cura que dá 100 de vida só pra admin"**, **"faz um programa de calculadora em python"**, **"cria uma página de login"**

**Conversar**
- **"explica melhor"**, **"outro exemplo"**, **"diferença entre for e while"**, **"e em pawn?"**

**Me ensinar**
- {{/ensinar pergunta = resposta}}: eu aprendo uma resposta nova
- {{/aprendidos}} e {{/esquecer pergunta}}

- {{/limpar}}: começa uma conversa nova`,
    sugestoes: ["/pawn", "/treinar", "/python"],
  },
  {
    id: "oi",
    lang: "conversa",
    titulo: "oi",
    chaves: ["oi", "ola", "eae", "e ai", "salve", "opa", "bom dia", "boa tarde", "boa noite", "hello", "hey", "fala"],
    resposta: () => {
      const nome = typeof Conta !== "undefined" && Conta.atual ? ", " + Conta.atual.nome : "";
      const h = new Date().getHours();
      const sauda = h < 5 ? "Opa, tá acordado até tarde" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
      return sortear([
        `${sauda}${nome}! 😄 Bora aprender alguma coisa hoje?`,
        `E aí${nome}! Tudo certo? O que vamos estudar agora?`,
        `Salve${nome}! Pronto pra codar? Me diz o que você quer aprender.`,
        `${sauda}${nome}! Tava te esperando. 😄 Qual a missão de hoje?`,
      ])();
    },
    sugestoes: ["continuar de onde parei", "Pawn", "Python", "teste rápido"],
  },
  {
    id: "tudo-bem",
    lang: "conversa",
    titulo: "tudo bem",
    chaves: ["tudo bem", "como vai", "como voce esta", "tudo certo", "suave", "beleza", "blz", "td bem"],
    resposta: sortear([
      "Tudo ótimo por aqui, rodando liso que nem código sem bug 😎 E você? Vamos estudar o quê?",
      "Tô bem! Sempre pronto pra ensinar. E aí, qual a dúvida de hoje?",
    ]),
    sugestoes: ["quero aprender python", "por onde eu começo?"],
  },
  {
    id: "quem-e",
    lang: "conversa",
    titulo: "quem é você",
    chaves: ["quem e voce", "quem e vc", "seu nome", "qual seu nome", "o que voce e", "voce e uma ia", "quem te criou", "quem criou voce"],
    resposta: `Eu sou o **WC DEV**, um assistente feito pra ensinar programação 💙🖤
Funciono direto no seu navegador, sem internet e sem API: tudo que eu sei está guardado nos meus arquivos de Python, HTML, CSS e Pawn. Eu também corrijo exercícios, reviso códigos e aprendo coisas novas que você me ensinar.
Fui criado pela **WC DEV** pra ajudar quem está começando.`,
    sugestoes: ["o que você sabe fazer?", "por onde eu começo?"],
  },
  {
    id: "obrigado",
    lang: "conversa",
    titulo: "obrigado",
    chaves: ["obrigado", "obrigada", "valeu", "vlw", "brigado", "agradeco", "tmj", "show", "top", "massa", "entendi"],
    resposta: sortear([
      "Tamo junto! 💙 Quer continuar? Digite {{/proximo}}.",
      "De nada! Se ficou alguma dúvida, é só perguntar.",
      "Boa! Mandou bem. Bora pra próxima?",
    ]),
    sugestoes: ["/proximo"],
  },
  {
    id: "tchau",
    lang: "conversa",
    titulo: "tchau",
    chaves: ["tchau", "ate mais", "falou", "flw", "adeus", "ate logo", "fui"],
    resposta: "Até mais! Lembra: programar é treino, um pouquinho todo dia já faz diferença. 🚀",
  },
  {
    id: "por-onde-comecar",
    lang: "conversa",
    titulo: "por onde eu começo?",
    chaves: ["por onde comeco", "por onde eu comeco", "como comecar", "comecar a programar", "sou iniciante", "nunca programei", "qual linguagem", "qual aprender primeiro", "o que aprender primeiro"],
    resposta: `Ótima pergunta! Depende do seu objetivo:
- Quer **criar sites**? Comece com **HTML** (a estrutura) e depois **CSS** (o visual).
- Quer aprender **lógica de programação**, automações, jogos ou IA? Comece com **Python**.

Minha dica: se você nunca programou, **Python** é a mais fácil de ler. Mas HTML dá resultado visual rápido, o que motiva muito!`,
    sugestoes: ["quero aprender python", "quero aprender html"],
  },
  {
    id: "o-que-e-programar",
    lang: "conversa",
    titulo: "o que é programação",
    chaves: ["o que e programacao", "o que e programar", "o que e codigo", "o que e um programa", "o que e algoritmo", "algoritmo"],
    resposta: `**Programar** é escrever instruções para o computador seguir, passo a passo.
Um **algoritmo** é essa sequência de passos. Tipo uma receita de bolo:
- pegue os ovos
- misture com a farinha
- se a massa estiver mole, coloque mais farinha
- asse por 40 minutos

O computador é muito rápido, mas não adivinha nada: você precisa explicar tudo certinho. Para isso usamos **linguagens de programação**, como Python.`,
    sugestoes: ["quero aprender python", "por onde eu começo?"],
  },
  {
    id: "diferenca",
    lang: "conversa",
    titulo: "diferença entre as linguagens",
    chaves: ["diferenca entre", "qual a diferenca", "html e css", "html e python", "html ou python"],
    resposta: `Cada uma tem um papel:
- **HTML** é o esqueleto de um site: textos, imagens, botões.
- **CSS** é a roupa: cores, tamanhos, posições, animações.
- **Python** é uma linguagem de programação de verdade: faz contas, toma decisões, repete tarefas, cria jogos, bots e IAs.

HTML e CSS andam juntos para fazer sites. Python é usado para lógica e muitas outras coisas.`,
    sugestoes: ["/html", "/css", "/python"],
  },
  {
    id: "piada",
    lang: "conversa",
    titulo: "piada",
    chaves: ["piada", "me faz rir", "conta uma", "algo engracado", "humor"],
    resposta: sortear([
      "Por que o programador foi ao médico? Porque estava com um **bug** no estômago. 🐛",
      "Quantos programadores precisa pra trocar uma lâmpada? Nenhum, isso é problema de **hardware**. 💡",
      "Por que o HTML terminou com o CSS? Porque ele não tinha **estilo** nenhum sem ela. 💔",
      "O Python não briga com ninguém... ele só **indenta** as diferenças. 🐍",
    ]),
    sugestoes: ["outra piada", "bora estudar"],
  },
  {
    id: "desanimo",
    lang: "conversa",
    titulo: "motivação",
    chaves: ["desistir", "dificil", "nao consigo", "nao entendo nada", "to perdido", "estou perdido", "desanimado", "burro", "motivacao", "cansado"],
    resposta: sortear([
      "Ei, calma! Todo programador já se sentiu assim, inclusive os melhores. Errar faz parte: cada erro que você resolve te deixa mais forte. 💪 Vamos com calma, um passo de cada vez?",
      "Programar é difícil no começo mesmo, é como aprender um idioma novo. Mas você está aqui tentando, e isso já é metade do caminho. Que tal revisar o último assunto com calma?",
    ]),
    sugestoes: ["por onde eu começo?", "/proximo"],
  },
  {
    id: "estudar",
    lang: "conversa",
    titulo: "bora estudar",
    chaves: ["bora estudar", "quero estudar", "quero aprender", "me ensina", "ensina", "quero programar", "aprender programacao"],
    resposta: "Bora! 🚀 Qual linguagem você quer aprender?",
    sugestoes: ["Pawn", "Python", "HTML", "CSS"],
  },
  {
    id: "erro",
    lang: "conversa",
    titulo: "deu erro",
    chaves: ["deu erro", "esta dando erro", "nao funciona", "nao funcionou", "bug", "meu codigo"],
    resposta: `Erros são normais! Algumas dicas pra resolver:
- **Leia a mensagem de erro** com calma, ela geralmente diz a linha do problema.
- Confira se fechou todos os parênteses, colchetes, chaves, aspas e tags.
- Em Python, veja se a **indentação** (os espaços no começo da linha) está certa.
- Em HTML/CSS, veja se não esqueceu um {{;}} ou um {{>}}.
- Teste por partes: comente um pedaço e veja se o resto funciona.

Me diz qual linguagem e o que o erro fala, que eu te explico o tema certo.`,
    sugestoes: ["erros em python", "/html", "/css"],
  }
);

/* =========================================================
   CONVERSA — dúvidas gerais sobre programação e carreira
   ========================================================= */
const tema = (id, titulo, chaves, resposta, sugestoes) =>
  WCDEV.temas.push({ id, lang: "conversa", titulo, chaves, resposta, sugestoes });

tema("como-estudar", "como estudar programação",
  ["como estudar", "dicas de estudo", "como aprender rapido", "aprender mais rapido", "melhor jeito de aprender", "rotina de estudo"],
  `Dicas que funcionam de verdade:
- **Pratique todo dia**, nem que seja 20 minutos. Constância vale mais que maratona.
- **Digite os códigos** em vez de só ler ou copiar.
- **Faça projetos pequenos**: uma calculadora, um jogo da velha, uma página de perfil.
- **Erre sem medo**: ler a mensagem de erro é metade do aprendizado.
- **Explique pra alguém** o que aprendeu (ou pra mim!).
- Quando travar, **quebre o problema** em pedaços menores.`,
  ["ideias de projetos", "quanto tempo leva pra aprender"]);

tema("tempo-aprender", "quanto tempo leva pra aprender",
  ["quanto tempo", "quanto tempo leva", "em quanto tempo", "demora pra aprender", "quanto tempo pra aprender"],
  `Depende do tanto que você pratica, mas uma ideia geral estudando um pouco todo dia:
- **HTML e CSS básicos**: 2 a 4 semanas pra fazer páginas simples.
- **Python básico** (variáveis, if, for, funções): 1 a 2 meses.
- **Fazer projetos sozinho**: uns 3 a 6 meses.
- **Trabalhar na área**: geralmente 1 ano ou mais de estudo e projetos.

O segredo não é velocidade, é **não parar**. 🐢 > 🐇`,
  ["como estudar programação", "por onde eu começo?"]);

tema("ideias-projetos", "ideias de projetos",
  ["ideia de projeto", "ideias de projetos", "o que posso fazer", "o que criar", "projeto para iniciante", "projetos para praticar", "o que programar"],
  `Projetos pra praticar, do mais fácil pro mais difícil:
**Python**
- Calculadora no terminal
- Jogo de adivinhar o número
- Pedra, papel e tesoura contra o computador
- Lista de tarefas que salva num arquivo
- Gerador de senhas
- Jogo da velha
- Jogo com {{pygame}}

**HTML + CSS**
- Página de perfil / currículo
- Página de uma loja ou lanchonete
- Cardápio online
- Landing page de um jogo
- Portfólio com seus projetos`,
  ["projeto em python", "projeto html"]);

tema("javascript", "o que é JavaScript",
  ["javascript", "js", "o que e javascript", "java script", "aprender javascript"],
  `**JavaScript** é a linguagem que dá **vida** aos sites: botões que fazem coisas, jogos no navegador, animações, formulários inteligentes.
O trio da web é:
- **HTML** → estrutura
- **CSS** → visual
- **JavaScript** → comportamento

Eu ensino Python, HTML e CSS. Depois de dominar HTML e CSS, JavaScript é o próximo passo natural! Pra começar, você pode colocar no HTML:
~~~html
<button onclick="alert('Olá!')">Clique</button>
~~~`,
  ["/html", "diferença entre java e javascript"]);

tema("java-vs-js", "diferença entre java e javascript",
  ["java e javascript", "java ou javascript", "diferenca entre java"],
  `Apesar do nome parecido, **são linguagens totalmente diferentes**! É tipo "carro" e "carpete" 😄
- **Java**: usada em sistemas de empresas, apps Android antigos, Minecraft (versão Java).
- **JavaScript**: usada principalmente em **sites**, rodando no navegador.`,
  ["o que é JavaScript"]);

tema("lua-roblox", "programar no Roblox",
  ["roblox", "lua", "luau", "roblox studio", "script roblox"],
  `O Roblox usa a linguagem **Luau** (uma versão do Lua). A lógica é parecida com Python:
~~~lua
local pontos = 0
if pontos >= 10 then
    print("Você ganhou!")
end

for i = 1, 5 do
    print(i)
end
~~~
Quem aprende **Python** primeiro entende Luau muito rápido, porque os conceitos (variáveis, if, for, funções) são os mesmos!`,
  ["quero aprender python", "o que é lógica de programação"]);

tema("logica", "o que é lógica de programação",
  ["logica", "logica de programacao", "raciocinio logico", "pensar como programador"],
  `**Lógica de programação** é saber organizar os passos pra resolver um problema, antes mesmo de escrever código.
Ela se resume a 3 coisas:
- **Sequência**: fazer as coisas na ordem certa.
- **Decisão**: {{if}}/{{else}} (se acontecer X, faça Y).
- **Repetição**: {{for}}/{{while}} (faça isso várias vezes).

A melhor linguagem pra treinar lógica é **Python**, porque o código parece português em inglês.`,
  ["if else python", "for em python"]);

tema("ia", "o que é inteligência artificial",
  ["inteligencia artificial", "o que e ia", "como fazer uma ia", "criar ia", "machine learning", "aprendizado de maquina", "chatgpt", "como voce funciona"],
  `**Inteligência artificial** é quando um programa aprende padrões com dados pra tomar decisões ou gerar coisas.
Eu, o WC DEV, sou uma IA **simples**: procuro palavras-chave na sua pergunta e escolho a melhor resposta da minha base. IAs como o Claude são muito mais complexas: aprenderam com enormes quantidades de texto.
Pra criar IAs de verdade, o caminho é:
- Aprender **Python** muito bem
- Matemática básica (estatística, álgebra)
- Bibliotecas como {{numpy}}, {{pandas}} e {{scikit-learn}}`,
  ["quero aprender python", "numpy", "pandas"]);

tema("git", "o que é Git e GitHub",
  ["git", "github", "versionamento", "controle de versao", "commit", "repositorio"],
  `**Git** guarda o **histórico** do seu código: dá pra voltar no tempo se algo quebrar.
**GitHub** é um site pra guardar seus projetos na nuvem e mostrar seu portfólio.
Comandos básicos:
~~~bash
git init                     # começa a controlar a pasta
git add .                    # prepara os arquivos
git commit -m "primeira versão"
git push                     # envia pro GitHub
~~~
Dica: com o **GitHub Pages** dá pra publicar seu site de HTML/CSS de graça!`,
  ["publicar site"]);

tema("terminal", "o que é terminal",
  ["terminal", "prompt de comando", "cmd", "powershell", "linha de comando", "console"],
  `O **terminal** é onde você conversa com o computador por texto. Comandos úteis:
~~~bash
cd pasta        # entra numa pasta
cd ..           # volta uma pasta
ls              # lista arquivos (no Windows: dir)
python app.py   # roda um programa Python
~~~
No Windows: aperte **Win + R**, digite {{cmd}} e Enter. No VS Code: menu **Terminal → Novo Terminal**.`,
  ["O que é Python e como instalar"]);

tema("vscode", "o que é VS Code",
  ["vs code", "visual studio code", "editor de codigo", "qual editor", "onde escrever codigo", "ide"],
  `O **VS Code** é o editor de código mais usado do mundo, e é grátis.
Extensões que eu recomendo:
- **Python** (da Microsoft)
- **Live Server**: atualiza seu site sozinho quando você salva
- **Prettier**: organiza o código
- **Portuguese Language Pack**: deixa em português

No celular, dá pra programar com apps como **Pydroid 3** (Python) ou **Acode** (HTML/CSS).`,
  ["programar no celular"]);

tema("celular", "programar no celular",
  ["programar no celular", "pelo celular", "no celular", "android", "sem computador", "nao tenho computador", "nao tenho pc"],
  `Dá sim pra começar pelo celular! 📱
- **Python**: app **Pydroid 3** (Android) ou o site **Programiz**.
- **HTML/CSS**: app **Acode** ou o site **CodePen**.
- **Replit**: site que roda várias linguagens no navegador.

É mais lento de digitar, mas pra aprender lógica e testar códigos funciona muito bem.`,
  ["quero aprender python", "quero aprender html"]);

tema("emprego", "trabalhar com programação",
  ["emprego", "trabalhar com programacao", "carreira", "salario", "ganhar dinheiro", "trabalho", "profissao", "freelancer", "ser programador"],
  `Algumas áreas pra trabalhar com programação:
- **Front-end**: faz a parte visual dos sites (HTML, CSS, JavaScript).
- **Back-end**: faz a parte do servidor e banco de dados (Python, Java, Node...).
- **Dados e IA**: analisa dados e cria modelos (Python).
- **Jogos**: Roblox (Luau), Unity (C#), Godot.
- **Freelancer**: faz sites e sistemas pra clientes.

O mais importante pra começar: **portfólio**. Projetos seus, publicados, mostram mais que qualquer certificado.`,
  ["ideias de projetos", "o que é Git e GitHub"]);

tema("binario", "o que é binário",
  ["o que e binario", "zeros e uns", "0 e 1", "como o computador entende"],
  `O computador só entende **0 e 1** (desligado e ligado). Isso é o **binário**.
Cada 0 ou 1 é um **bit**; 8 bits formam um **byte**.
~~~
0 = 0       3 = 11
1 = 1       4 = 100
2 = 10      5 = 101
~~~
As linguagens de programação existem pra gente não precisar escrever em 0 e 1! Em Python: {{bin(5)}} mostra {{'0b101'}}.`,
  ["bin", "o que é programação"]);

tema("variavel-geral", "o que é variável",
  ["o que e variavel", "o que e uma variavel", "pra que serve variavel"],
  `Uma **variável** é uma caixinha com nome onde você guarda um valor pra usar depois. Exemplo da vida real: um pote escrito "açúcar".
Em Python:
~~~python
pontos = 10
pontos = pontos + 5
~~~`,
  ["variáveis em python"]);

tema("api-geral", "o que é API",
  ["o que e api", "api", "o que e uma api"],
  `Uma **API** é um jeito de um programa **conversar com outro**. Por exemplo: um app de clima pede os dados a uma API de meteorologia e recebe a resposta pronta.
Em Python, você usa APIs com a biblioteca {{requests}}.
Eu, o WC DEV, **não uso API**: tudo que sei está nos meus arquivos, por isso funciono offline!`,
  ["requests"]);

tema("frontend-backend", "front-end e back-end",
  ["front end", "frontend", "back end", "backend", "full stack", "fullstack"],
  `- **Front-end**: tudo que você **vê** num site (HTML, CSS, JavaScript).
- **Back-end**: o que roda **no servidor**: login, banco de dados, pagamentos (Python, Node, PHP...).
- **Full stack**: quem faz os dois.

Com o que eu ensino: HTML e CSS = front-end; Python ({{flask}}, {{django}}) = back-end.`,
  ["flask", "/html"]);

tema("hackear", "hacker",
  ["hacker", "hackear", "invadir", "hack"],
  `Dá pra trabalhar com **segurança da informação** de forma legal: protegendo sistemas, achando falhas pra corrigir (e até ganhando recompensa por isso, nos programas de "bug bounty").
Invadir contas ou sistemas dos outros é **crime**, e eu não ensino isso.
O caminho certo começa com: programação (Python), redes, Linux, e depois cursos e plataformas de prática **legais**, como TryHackMe.`,
  ["quero aprender python", "o que é terminal"]);

tema("nome-wc", "o que significa WC DEV",
  ["wc dev", "o que significa wc", "wcdev"],
  `**WC DEV** é a marca que me criou! Eu sou o assistente que ensina programação de graça e funciona até sem internet 💙🖤`,
  ["quem é você", "o que você sabe fazer?"]);

tema("idade-ia", "quantos anos você tem",
  ["quantos anos voce tem", "sua idade", "quando voce nasceu"],
  `Sou bem novinho! Nasci como um monte de arquivos .js 😄 Mas já sei centenas de coisas sobre Python, HTML e CSS.`,
  ["o que você sabe fazer?"]);

tema("gosta", "você gosta de programar",
  ["voce gosta", "qual sua linguagem favorita", "linguagem preferida", "qual a melhor linguagem"],
  `Se eu tivesse que escolher, diria **Python** 🐍: é simples de ler e dá pra fazer quase tudo com ela. Mas **não existe melhor linguagem**, existe a melhor pra cada objetivo: HTML/CSS pra sites, Python pra lógica e IA, Luau pro Roblox.`,
  ["diferença entre as linguagens"]);

tema("sabe-fazer", "o que você sabe fazer?",
  ["o que voce sabe fazer", "o que voce ensina", "quantas coisas voce sabe", "o que sabe"],
  () => {
    const n = l => WCDEV.temas.filter(x => x.lang === l).length;
    return `Eu sei ensinar **${n("pawn")} coisas de Pawn (SA-MP)**, **${n("python")} de Python**, **${n("html")} de HTML** e **${n("css")} de CSS**, tenho **${(WCDEV.exercicios || []).length} exercícios** pra você treinar, e reviso o código que você colar.
Tem as **aulas da trilha** (em ordem) e a **consulta**: é só digitar o nome de qualquer função, tag ou propriedade, tipo {{append}}, {{<table>}} ou {{flexbox}}.
Digite {{/indice pawn}} (ou python, html, css) pra ver tudo.`;
  },
  ["/indice pawn", "/indice python", "/treinar"]);

tema("sim", "sim",
  ["sim", "quero", "pode ser", "claro", "com certeza", "ok", "bora sim"],
  "Show! Me diz o que você quer aprender ou digite {{/proximo}} pra seguir a aula.",
  ["/proximo", "Python", "HTML", "CSS"]);

tema("nao", "não",
  ["nao", "nao quero", "agora nao", "depois"],
  "Sem problemas! Quando quiser, é só chamar. 😉",
  ["piada", "ideias de projetos"]);

tema("lol", "risada",
  ["kkk", "kkkk", "haha", "hahaha", "rsrs", "kkkkk", "lol"],
  "😂 Programar também é divertido! Quer outra piada ou bora estudar?",
  ["piada", "bora estudar"]);

tema("elogio", "elogio",
  ["voce e bom", "voce e legal", "gostei", "muito bom", "perfeito", "incrivel", "voce e top", "te amo"],
  "Valeu! 💙 Fico feliz em ajudar. Bora continuar aprendendo?",
  ["/proximo", "ideias de projetos"]);

tema("xingamento", "calma",
  ["idiota", "lixo", "inutil", "voce e ruim", "voce e burro"],
  "Poxa, desculpa se não ajudei direito 😅 Eu funciono por palavras-chave, então às vezes erro. Tenta perguntar com o nome do comando, tipo **\"o que é append\"** ou **\"como usar flexbox\"**.",
  ["o que você sabe fazer?", "/ajuda"]);

// Estas só respondem quando a mensagem é EXATAMENTE a palavra (ex: "sim"),
// pra não atrapalhar frases como "não funciona".
// conversa de gente
tema("consegui", "consegui",
  ["consegui", "funcionou", "deu certo", "compilou", "rodou", "agora foi", "foi agora", "aprendi", "entendi tudo", "consegui fazer"],
  sortear([
    "Aêêê! 🎉 Viu só? Você consegue! Esse sentimento de ver o código funcionando é o melhor da programação.",
    "Boa demais! 💙 Cada coisa que funciona é um degrau a mais. Bora pro próximo?",
    "Isso aí! 👏 Agora que funcionou, tenta mudar alguma coisa nele pra ver o que acontece: é assim que se aprende de verdade.",
  ]),
  ["/proximo", "teste rápido", "/desafio"]);

tema("humano", "você é humano?",
  ["voce e humano", "voce e uma pessoa", "voce e real", "voce pensa", "voce e robo", "voce e um robo", "voce tem sentimentos", "e uma ia", "voce e o chatgpt", "voce e o claude"],
  "Sendo sincero: não sou humano, sou uma IA feita pela **WC DEV** 🤖 Eu funciono por regras que me ensinaram, não penso igual a uma pessoa. " +
  "Mas fui feito pra ensinar do jeito que um professor paciente ensinaria: explicando, dando exemplo, corrigindo seu código e te testando. 💙",
  ["o que você sabe fazer?", "teste rápido"]);

tema("duvida", "tenho uma dúvida",
  ["tenho uma duvida", "to com duvida", "estou com duvida", "posso perguntar", "me ajuda", "preciso de ajuda", "socorro", "help me"],
  sortear([
    "Claro, manda! 🙂 Pode perguntar do seu jeito, até com erro de digitação que eu entendo.",
    "Tô aqui pra isso! Qual é a dúvida? Se for um código, pode colar ele aqui.",
  ]),
  ["/editor", "/ajuda"]);

tema("pausa", "vou parar",
  ["vou parar", "vou descansar", "chega por hoje", "vou dormir", "depois eu volto", "ja volto", "boa noite vou dormir"],
  sortear([
    "Descansa sim! 😴 O cérebro aprende muito enquanto você dorme. Quando voltar, é só tocar em **continuar de onde parei**.",
    "Tranquilo! Parar também faz parte. Tá tudo salvo, amanhã a gente continua. 💙",
  ]),
  []);

["sim", "nao", "lol"].forEach(id => { WCDEV.temas.find(x => x.id === id).exato = true; });

/* =========================================================
   FORA DO ASSUNTO
   Se a pessoa falar de algo que não é programação, a IA avisa
   que foi feita pra ensinar. Edite as listas à vontade.
   ========================================================= */
WCDEV.foraDoAssunto = {
  // assuntos que NÃO são de programação
  palavras: [
    "futebol", "flamengo", "corinthians", "palmeiras", "vasco", "gremio", "santos", "sport", "nautico", "neymar", "messi",
    "cristiano ronaldo", "copa do mundo", "brasileirao", "campeonato", "gol",
    "receita", "bolo", "comida", "cozinhar", "almoco", "janta", "lanche", "pizza",
    "namorada", "namorado", "namorar", "crush", "beijo", "beijar", "casamento", "ficante", "paquera", "sexo", "amor da minha vida",
    "politica", "presidente", "eleicao", "eleicoes", "lula", "bolsonaro", "partido", "deputado", "governo",
    "religiao", "deus", "igreja", "biblia", "pastor",
    "filme", "filmes", "serie", "series", "novela", "anime", "netflix", "desenho animado",
    "cantor", "cantora", "funk", "sertanejo", "letra da musica", "musica favorita", "qual musica",
    "previsao do tempo", "vai chover", "noticia", "noticias", "fofoca", "famoso", "famosa", "celebridade",
    "horoscopo", "signo", "dever de casa", "licao de casa", "redacao", "historia do brasil", "geografia", "biologia", "quimica",
    "doenca", "remedio", "medico", "dor de", "dieta", "emagrecer", "engordar",
    "aposta", "apostar", "bet", "tigrinho", "bitcoin", "investir", "acoes da bolsa",
    "free fire", "fortnite", "minecraft", "valorant", "clash", "skin do free fire",
  ],
  // se a mensagem tiver uma dessas, é programação (não recusa)
  sinaisDeProgramacao: [
    "codigo", "programar", "programacao", "programador", "script", "funcao", "variavel", "comando", "site", "pagina",
    "servidor", "gamemode", "filterscript", "compilar", "compilador", "erro", "bug", "linguagem", "python", "html", "css",
    "pawn", "samp", "sa-mp", "open.mp", "javascript", "tag", "classe", "lista", "loop", "api", "banco de dados", "app",
    "aplicativo", "criar um jogo", "fazer um jogo", "programa", "algoritmo", "logica", "computador", "terminal", "github",
    "include", "plugin", "dialog", "textdraw", "callback", "flexbox", "div", "print", "input", "json", "roblox", "lua",
  ],
  respostas: [
    "Eu sou programado pra **ensinar programação**, não pra conversar sobre isso 😅\nMas se quiser, te ensino **Pawn**, **Python**, **HTML** ou **CSS**!",
    "Esse assunto foge do que eu sei! 🤖 Eu fui feito pra **ensinar a programar**. Bora aprender algo novo?",
    "Opa, aí não é comigo 😄 Meu trabalho é **ensinar programação**. Que tal treinar um pouco? Digite {{/treinar}}.",
  ],
};
