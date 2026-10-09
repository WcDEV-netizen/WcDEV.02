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
Sou um assistente que te ensina a programar do zero, passo a passo.
Eu sei ensinar **Python**, **HTML** e **CSS**, e também dá pra bater um papo.
Por onde você quer começar?`,
    sugestoes: ["quero aprender python", "quero aprender html", "quero aprender css", "por onde eu começo?"],
  },
  {
    id: "ajuda",
    lang: "conversa",
    titulo: "ajuda",
    chaves: ["ajuda", "help", "comandos", "o que voce sabe", "o que voce faz", "como funciona", "como usar"],
    resposta: `### Como me usar
Pergunte do seu jeito, por exemplo: **"como criar uma lista em python"** ou **"como centralizar uma div"**.

Comandos:
- {{/python}} mostra a trilha de Python
- {{/html}} mostra a trilha de HTML
- {{/css}} mostra a trilha de CSS
- {{/proximo}} vai para a próxima aula da trilha
- {{/limpar}} começa uma conversa nova`,
    sugestoes: ["/python", "/html", "/css"],
  },
  {
    id: "oi",
    lang: "conversa",
    titulo: "oi",
    chaves: ["oi", "ola", "eae", "e ai", "salve", "opa", "bom dia", "boa tarde", "boa noite", "hello", "hey", "fala"],
    resposta: sortear([
      "Olá! 😄 Bora aprender programação hoje? Escolhe uma linguagem:",
      "E aí! Tudo certo? Qual linguagem você quer estudar agora?",
      "Salve! Pronto pra codar? Me diz o que você quer aprender.",
    ]),
    sugestoes: ["Python", "HTML", "CSS"],
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
Funciono direto no seu navegador, sem internet e sem API: tudo que eu sei está guardado nos meus arquivos de Python, HTML e CSS.
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
    sugestoes: ["Python", "HTML", "CSS"],
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
