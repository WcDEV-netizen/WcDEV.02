/* =========================================================
   WC DEV — CÉREBRO
   Deixa a IA mais esperta:
   - corrige erros de digitação e entende gírias ("comado", "vc", "grana")
   - descobre a INTENÇÃO (o que é / como faz / exemplo / diferença / erro)
   - entende continuação ("explica melhor", "outro exemplo", "não entendi")
   - responde com jeito de professor e mostra como pensou
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Cerebro = {
  vocab: new Map(),     // palavra -> quantas vezes aparece no conteúdo

  /* ---------- abreviações, gírias e erros comuns ---------- */
  TROCAS: {
    vc: "voce", vcs: "voces", voce: "voce", pq: "por que", porq: "por que", oq: "o que", q: "que", qq: "qualquer",
    cm: "como", cmo: "como", tb: "tambem", tbm: "tambem", mt: "muito", mto: "muito", msm: "mesmo", hj: "hoje",
    pfv: "por favor", pf: "por favor", obg: "obrigado", vlw: "valeu", blz: "beleza", n: "nao", nn: "nao", s: "sim",
    qnd: "quando", qndo: "quando", qdo: "quando", cd: "cade", tava: "estava", ta: "esta", to: "estou", pra: "pra",
    fasso: "faco", faso: "faco", fassa: "faca", fazê: "fazer", fase: "faz", fais: "faz", cria: "cria", criu: "criou",
    msg: "mensagem", msgs: "mensagens", txt: "texto", func: "funcao", funcs: "funcoes", var: "variavel", vars: "variaveis",
    cmd: "comando", cmds: "comandos", comado: "comando", comandu: "comando", comano: "comando", komando: "comando",
    player: "jogador", players: "jogadores", plr: "jogador", playerid: "playerid", jogadô: "jogador",
    grana: "dinheiro", money: "dinheiro", cash: "dinheiro", dinhero: "dinheiro", dinheru: "dinheiro", dimdim: "dinheiro",
    hp: "vida", health: "vida", life: "vida", armor: "colete", armour: "colete", gun: "arma", weapon: "arma", weapons: "armas",
    car: "carro", veh: "veiculo", vehicle: "veiculo", tp: "teleportar", teleport: "teleportar",
    server: "servidor", sv: "servidor", gm: "gamemode", fs: "filterscript", td: "textdraw", tds: "textdraws",
    kickar: "kickar", kika: "kickar", kikar: "kickar", bane: "banir", bani: "banir",
    num: "numero", nums: "numeros", qtd: "quantidade", qnt: "quantidade", aleatorio: "aleatorio", random: "random",
    erro: "erro", eror: "erro", dah: "dar", lvl: "level", lv: "level", upar: "upar", exp: "xp", inv: "inventario", org: "organizacao", fac: "faccao", erroo: "erro", bug: "bug", bugado: "bugado", bugou: "bugou",
  },

  // palavras comuns que NÃO devem ser "corrigidas"
  COMUNS: new Set(("quero queria queremos preciso precisava gostaria posso pode podia consigo consegue sei saber sabe " +
    "fazer faco faz fiz feito criar crio cria criei usar uso usa usei colocar coloco coloca botar boto mudar mudo muda " +
    "aprender aprendo ensinar ensina explicar explica explicando entender entendi entendo funciona funcionar funcionou " +
    "jogador jogadores servidor codigo programa programar exemplo exemplos melhor pior outro outra mesmo mesma " +
    "agora depois antes sempre nunca tudo nada algo alguem alguma algum todos todas cada quando onde porque como " +
    "obrigado valeu beleza certo errado igual diferente diferenca entre sobre dentro fora junto ajuda ajudar " +
    "estava estou esta estao sendo tenho temos tinha jogo jogos site pagina tela texto numero numeros lista").split(" ")),

  iniciar() {
    this.vocab = new Map();
    for (const t of WCDEV.temas) {
      const texto = (t.titulo + " " + (t.chaves || []).join(" ")).toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ");
      for (const p of texto.split(/\s+/)) if (p.length >= 4) this.vocab.set(p, (this.vocab.get(p) || 0) + 1);
    }
  },

  /* ---------- 1. limpar a frase ---------- */
  // devolve { texto (normalizado, com espaços nas pontas), correcoes: [[de, para]] }
  preprocessar(bruto) {
    const correcoes = [];
    const palavras = normalizar(bruto).trim().split(" ");
    const saida = palavras.map(p => {
      if (this.TROCAS[p] !== undefined) {
        const novo = this.TROCAS[p];
        if (novo !== p && p.length > 2 && !["pra", "ta", "to"].includes(p)) correcoes.push([p, novo]);
        return novo;
      }
      if (p.length < 5 || /\d/.test(p) || this.COMUNS.has(p) || this.vocab.has(p) || /[<>/#.=*+-]/.test(p)) return p;
      const certo = this.corrigirPalavra(p);
      if (certo) { correcoes.push([p, certo]); return certo; }
      return p;
    });
    return { texto: " " + saida.join(" ").replace(/\s+/g, " ").trim() + " ", correcoes };
  },

  corrigirPalavra(p) {
    let melhor = null, menor = 9, freq = 0;
    for (const [v, f] of this.vocab) {
      if (Math.abs(v.length - p.length) > 1 || v[0] !== p[0] || f < 2) continue;
      const d = distancia(p, v);
      if (d < menor || (d === menor && f > freq)) { menor = d; melhor = v; freq = f; }
    }
    const limite = p.length >= 8 ? 2 : 1;
    return menor <= limite ? melhor : null;
  },

  /* ---------- 2. intenção ---------- */
  intencao(t) {
    if (/ (diferenca entre|qual a diferenca|diferenca de|comparar| versus | vs | x ou | melhor usar)/.test(t)) return "comparar";
    if (/ (nao entendi|nao entendo|como assim|explica melhor|explica de novo|explique melhor|mais detalhes|detalha|explica direito|ficou confuso|nao ficou claro)/.test(t)) return "melhor";
    if (/ (outro exemplo|mais um exemplo|outros exemplos|exemplo diferente)/.test(t)) return "outroExemplo";
    if (/ (desafio|me desafia|desafie|exercicio|exercicios|missao|missoes|tarefa|tarefas|quero treinar|quero praticar)/.test(t)) return "desafio";
    if (/ (o que e|o que sao|que e|oque e|o que significa|significa|pra que serve|para que serve|serve pra|serve para)/.test(t)) return "definicao";
    if (/ (exemplo|mostra um codigo|mostre um codigo|me da um codigo|me mostra|mostra como)/.test(t)) return "exemplo";
    if (/ (erro|bug|bugado|bugou|nao funciona|nao ta funcionando|nao esta funcionando|deu ruim|problema|crash|travando|warning|nao compila)/.test(t)) return "erro";
    if (/ (como|faco|fazer|criar|crio|usar|uso|coloco|colocar|mudo|mudar|dou|dar|tiro|tirar)/.test(t)) return "como";
    return "geral";
  },

  // é uma pergunta de continuação sobre o último assunto? (mensagem curta, sem assunto novo)
  ehContinuacao(t) {
    const m = t.match(/^ (e |nao entendi|nao entendo|como assim|explica|explique|mais|outro|outra|me da|me mostra|mostra|pra que|para que|quando uso|quando usar|e como|como uso|como usa|serio|exemplo)/);
    if (!m || t.trim().split(" ").length > 7) return false;
    // se sobrou um assunto novo ("como uso o websocket"), não é continuação: é pergunta nova
    const LEVES = /^(isso|isto|ele|ela|esse|essa|este|esta|aquilo|ai|ae|entao|o|a|os|as|um|uma|de|do|da|no|na|em|pra|para|por|com|me|mim|ne|la|mesmo|tambem|melhor|direito|direitinho|devagar|denovo|novo|nova|exemplo|exemplos|outro|outra|mais|detalhe|detalhes|explica|explique|explicar|mostra|faz|isso ai|uso|usa|usar|como|assim|quando|que|serve|e|nao|entendi|entendo|pfv|por favor|favor|ainda|parte|codigo|linha|cada|ou|seja|pq|porque|serio|sim|beleza|certo|simples|facil|facilzinho|completo|pratico|real)$/;
    const sobra = t.slice(m[0].length).trim().split(" ").filter(w => w && !LEVES.test(w));
    return sobra.length === 0;
  },

  /* ---------- 3. respostas de continuação ---------- */
  continuar(intent, ultimo) {
    if (!ultimo || ultimo.lang === "conversa") return null;
    const nome = ultimo.titulo;
    const exemplo = this.primeiroCodigo(ultimo);
    if (intent === "melhor") {
      let texto = `Beleza, vou explicar **${nome}** de outro jeito, devagar. 🙂\n`;
      texto += `> 🧠 Você pediu pra explicar melhor o último assunto (${nome}). Vou pegar o exemplo e explicar cada linha.\n`;
      if (ultimo.ref) texto += `**Em uma frase:** ${this.frase(ultimo)}\n`;
      if (exemplo && WCDEV.explicador) texto += "\n" + WCDEV.explicador.explicar(exemplo.codigo, exemplo.lang, { semTitulo: true });
      else texto += "\n" + (typeof ultimo.resposta === "string" ? ultimo.resposta : "");
      texto += `\nAinda ficou alguma dúvida? Me pergunta do seu jeito, ou pratique com um desafio.`;
      return { texto, sugestoes: [`/desafio sobre ${nome}`, "outro exemplo", ...(ultimo.sugestoes || []).slice(0, 2)] };
    }
    if (intent === "outroExemplo") {
      const extra = WCDEV.gerador && WCDEV.gerador.exemploCompleto(ultimo);
      if (extra) return {
        texto: `Claro! Aqui vai **${nome}** num exemplo mais completo, do jeito que você usaria de verdade:\n~~~${ultimo.lang}\n${extra}\n~~~\nQuer que eu explique linha por linha? Toque em **explica melhor**.`,
        sugestoes: ["explica melhor", `/desafio sobre ${nome}`],
      };
      // aula da trilha: mostra o próximo exemplo da própria aula (um de cada vez)
      if (!ultimo.ref && typeof ultimo.resposta === "string") {
        const blocos = [...ultimo.resposta.matchAll(/~~~(\w*)\n([\s\S]*?)~~~/g)];
        if (blocos.length > 1) {
          ultimo._exemplo = ((ultimo._exemplo || 0) + 1) % blocos.length;
          const b = blocos[ultimo._exemplo];
          const expl = WCDEV.explicador ? WCDEV.explicador.explicar(b[2].replace(/\n$/, ""), b[1] || ultimo.lang, { semTitulo: true }) : "";
          return {
            texto: `> 🧠 Você pediu outro exemplo de **${nome}**. Peguei o exemplo ${ultimo._exemplo + 1} de ${blocos.length} da aula e expliquei cada linha.\n### 📌 ${nome}: exemplo ${ultimo._exemplo + 1}\n~~~${b[1] || ultimo.lang}\n${b[2]}~~~\n` + expl,
            sugestoes: ["outro exemplo", "teste rápido", "/desafio sobre " + nome],
          };
        }
        // só um exemplo: mostra uma função que aparece nele
        const usadas = (this.primeiroCodigo(ultimo) || { codigo: "" }).codigo.match(/[A-Za-z_]\w{3,}(?=\()/g) || [];
        const ref = usadas.map(n => WCDEV.temas.find(x => x.ref && x.lang === ultimo.lang && x.titulo === n)).find(Boolean);
        if (ref) return { texto: `Olha um exemplo de **${ref.titulo}**, que aparece em **${nome}**:\n` + ref.resposta, sugestoes: ["outro exemplo", nome] };
      }
      const vizinho = this.vizinho(ultimo);
      if (vizinho) return {
        texto: `Olha um exemplo parecido, com **${vizinho.titulo}** (do mesmo grupo de **${nome}**):\n` + vizinho.resposta,
        sugestoes: [nome, "explica melhor"],
      };
    }
    if (intent === "definicao" || intent === "geral") {
      return { texto: `**${nome}**: ${this.frase(ultimo)}\n` + (this.dica(ultimo) ? `\n💡 **Dica de professor:** ${this.dica(ultimo)}` : ""), sugestoes: ["outro exemplo", "explica melhor"] };
    }
    return null;
  },

  primeiroCodigo(tema) {
    const txt = typeof tema.resposta === "string" ? tema.resposta : "";
    const m = txt.match(/~~~(\w*)\n([\s\S]*?)~~~/);
    return m ? { lang: m[1] || tema.lang, codigo: m[2].replace(/\n$/, "") } : null;
  },
  frase(tema) {
    const txt = (typeof tema.resposta === "string" ? tema.resposta : "").split("\n").slice(2).join(" ");
    return (txt.match(/^[^~]*?[.!?](\s|$)/) || [txt.slice(0, 160)])[0].trim();
  },
  vizinho(tema) {
    if (!tema.ref) return null;
    const grupo = WCDEV.temas.filter(x => x.ref && x.grupo === tema.grupo && x.lang === tema.lang && x !== tema);
    return grupo.length ? grupo[Math.floor(Math.random() * grupo.length)] : null;
  },

  /* ---------- 4. comparar duas coisas ---------- */
  comparar(t, lang, buscar) {
    const m = t.match(/(?:diferenca entre|diferenca de|comparar|qual a diferenca entre|qual a diferenca de)\s+(.+?)\s+(?:e|com|x|vs|versus|ou)\s+(.+?)\s*$/) ||
              t.match(/(?:melhor usar)\s+(.+?)\s+(?:ou)\s+(.+?)\s*$/) ||
              t.match(/^\s*(.+?)\s+(?:vs|versus|x)\s+(.+?)\s*$/);
    if (!m) return null;
    const limpar = s => " " + s.replace(/\b(o|a|os|as|no|na|em|do|da|de|pawn|python|html|css|samp)\b/g, " ").trim() + " ";
    const a = buscar(limpar(m[1]), lang), b = buscar(limpar(m[2]), lang);
    if (!a || !b || a === b) return null;
    const bloco = x => {
      const ex = this.primeiroCodigo(x);
      return `### ${x.titulo}${x.lang !== "conversa" ? ` · ${NOMES[x.lang] || ""}` : ""}\n${this.frase(x)}` + (ex ? `\n~~~${ex.lang}\n${ex.codigo.split("\n").slice(0, 8).join("\n")}\n~~~` : "");
    };
    return {
      texto: `> 🧠 Você quer comparar **${a.titulo}** com **${b.titulo}**. Vou mostrar os dois lado a lado.\n` +
        `${bloco(a)}\n${bloco(b)}\n**Resumindo:** use **${a.titulo}** quando precisar de: ${this.frase(a).replace(/\*\*/g, "").toLowerCase()} E **${b.titulo}** pra: ${this.frase(b).replace(/\*\*/g, "").toLowerCase()}`,
      sugestoes: [a.botao || a.titulo, b.botao || b.titulo],
    };
  },

  /* ---------- 5. responder como professor ---------- */
  /* ---------- falar como gente ---------- */
  sorteia(lista) { return lista[Math.floor(Math.random() * lista.length)]; },

  // devolve acentos às palavras mais comuns (o texto normalizado vem sem acento)
  ACENTOS: { variavel: "variável", variaveis: "variáveis", funcao: "função", funcoes: "funções", codigo: "código", numero: "número",
    numeros: "números", pagina: "página", veiculo: "veículo", veiculos: "veículos", nao: "não", voce: "você", posicao: "posição",
    botao: "botão", botoes: "botões", animacao: "animação", condicao: "condição", repeticao: "repetição", dialogo: "diálogo",
    informacao: "informação", ate: "até", ja: "já", tambem: "também", facil: "fácil", dificil: "difícil", rapido: "rápido",
    aleatorio: "aleatório", mensagem: "mensagem", proximo: "próximo", maximo: "máximo", minimo: "mínimo", grafico: "gráfico",
    transicao: "transição", formulario: "formulário", usuario: "usuário", previsao: "previsão", sao: "são", esta: "está",
    tres: "três", indice: "índice", ultimo: "último", ultima: "última", caractere: "caractere", imagem: "imagem", audio: "áudio",
    video: "vídeo", horario: "horário", servico: "serviço", conteudo: "conteúdo", titulo: "título", paragrafo: "parágrafo" },

  // tira "como faço pra" / "o que é" e deixa só o objetivo: "dar dinheiro pro jogador"
  objetivo(t) {
    let o = t.trim()
      .replace(/^(oi|ola|ei|eai|e ai|opa|professor|prof|wc dev|ia|cara|mano|ae|por favor)\s+/, "")
      .replace(/^(eu\s+)?(quero|queria|preciso|gostaria de|to querendo|estou querendo)\s+(saber|aprender|entender)?\s*/, "")
      .replace(/^(me\s+)?(ensina|ensine|explica|explique|mostra|mostre|fala|diz)\s+(como\s+)?/, "")
      .replace(/^(como|de que jeito|qual o jeito de|qual a forma de)\s+(eu\s+|que\s+|se\s+)?(faco|fazer|faz|posso|consigo|da|da pra|consegue|usar|uso)?\s*(?:(?:pra|para|p|um|uma|o|a)\s+)?/, "")
      .replace(/^(o que e|o que sao|oque e|que e|pra que serve|para que serve)\s+(o|a|os|as|um|uma)?\s*/, "")
      .replace(/\s+(no|na|em|do|da|com)\s+(samp|sa-mp|pawn|python|html|css|open.mp|gta|servidor)\s*$/, "")
      .replace(/\s+(por favor|pfv|pf|ai|ae|mano|cara)\s*$/, "")
      .trim();
    if (o.length < 4 || o.length > 60 || o.split(" ").length > 9) return null;
    return o.split(" ").map(p => this.ACENTOS[p] || p).join(" ");
  },

  ABERTURAS: {
    como: ["Entendi, você quer **{o}**. Pra isso a gente usa **{t}** 👇", "Boa! Pra **{o}**, o caminho é o **{t}**. Olha só:",
      "Bora lá: pra **{o}** você usa **{t}**.", "Fácil! **{o}** se faz com **{t}**:"],
    definicao: ["Boa pergunta! **{t}** é mais simples do que parece:", "Vou te explicar **{t}** do jeito mais fácil:",
      "Bora entender o **{t}**:", "Olha, **{t}** é assim:"],
    exemplo: ["Claro! Olha um exemplo de **{t}**:", "Bora ver **{t}** funcionando:"],
    erro: ["Calma, isso acontece com todo mundo, a gente resolve! 🔧", "Relaxa, esse é um dos erros mais comuns. Olha:"],
    geral: ["Olha só o que eu sei sobre **{t}**:", "Bora lá, **{t}**:", "Sobre **{t}**:"],
  },
  FECHAMENTOS: ["Fez sentido? Se quiser, eu te faço uma **pergunta rápida** pra ver se ficou na cabeça. 😉",
    "Quer testar se entendeu? Toca em **teste rápido** que eu te pergunto.",
    "Pra fixar de verdade, tenta usar isso num código seu. Ou faz o **teste rápido** aqui embaixo.",
    "Ficou alguma dúvida? Pode perguntar do seu jeito, sem vergonha. 🙂", ""],
  INTRO_DICA: ["💡 **Dica de professor:**", "💡 **Fica a dica:**", "💡 **Uma coisa que ajuda muito:**", "⚠️ **Cuidado com isso:**"],

  DICAS: {
    "Função de jogador": "sempre confira {{IsPlayerConnected}} antes de usar um ID que veio de comando, senão o código mexe num jogador que nem existe.",
    "Callback": "o callback é chamado pelo servidor sozinho. Copie o cabeçalho **exatamente** igual (mesmos parâmetros), senão dá error 025.",
    "Função de veículo": "guarde o ID do veículo numa variável quando criar, pra conseguir apagar ou mexer nele depois.",
    "Função de servidor e mundo": "coisas de configuração geral vão no {{OnGameModeInit}}.",
    "Objeto, pickup e texto 3D": "com muitos objetos use o plugin **streamer**: o SA-MP sozinho tem limite.",
    "Dialog e textdraw": "use {{#define}} pra dar nome aos IDs dos dialogs. Dois dialogs com o mesmo ID dão confusão.",
    "Texto, número e arquivo": "em Pawn texto é array: sempre use {{sizeof}} pra não passar do tamanho.",
    "Linguagem Pawn": "compile sempre que mudar algo: é mais fácil achar o erro quando você mexeu em pouca coisa.",
    "Include e plugin": "o plugin vai na pasta **plugins** e no **server.cfg**; o .inc vai em **pawno/include**.",
    "Erro do compilador": "leia o **número da linha** que o compilador mostra: o erro está nela ou na linha de cima.",
    "Sistema pronto": "copie, teste, e depois mude um pedaço de cada vez pra entender como funciona.",
    "Função embutida": "use {{help(nome)}} no Python pra ver a ajuda de qualquer função.",
    "Método de texto (str)": "texto em Python não muda: os métodos devolvem um texto **novo**, então guarde o resultado numa variável.",
    "Método de lista": "{{append}}, {{sort}} e {{reverse}} mudam a própria lista e devolvem {{None}}. Não faça {{lista = lista.sort()}}!",
    "Conceito": "teste os conceitos no terminal do Python (digite {{python}} e Enter) pra ver o resultado na hora.",
    "Erro (exceção)": "a última linha da mensagem de erro diz o **tipo**; a linha com o número diz **onde** foi.",
    "Tag de estrutura": "use tags semânticas ({{header}}, {{main}}, {{footer}}): o Google e os leitores de tela agradecem.",
    "Atributo": "atributo sempre vai na tag de **abertura**, com aspas no valor.",
    "Propriedade de layout": "pra alinhar coisas hoje em dia, quase sempre a resposta é **flexbox** ou **grid**.",
    "Seletor": "se o estilo não pega, provavelmente outro seletor mais específico está ganhando (veja **especificidade**).",
    "Receita pronta": "copie, depois troque as cores e tamanhos pra deixar com a sua cara.",
  },

  // monta a resposta final de um tema com jeito humano
  vestir(tema, ctx) {
    const base = typeof tema.resposta === "function" ? tema.resposta(estado) : tema.resposta;
    if (tema.lang === "conversa" || tema.aprendido) return { texto: base, sugestoes: tema.sugestoes ? [...tema.sugestoes] : [] };

    const partes = [];
    const nomeCurto = tema.titulo.replace(/\s*\(.*\)\s*$/, "");
    // o "raciocínio" só aparece quando eu precisei adivinhar algo (erro de digitação, linguagem)
    const notas = [];
    const comAcento = p => p.split(" ").map(x => ({ faco: "faço", faca: "faça", voce: "você", nao: "não", ...this.ACENTOS })[x] || x).join(" ");
    if (ctx.correcoes && ctx.correcoes.length) notas.push(`entendi ${ctx.correcoes.slice(0, 3).map(([a, b]) => `"${a}" como "${comAcento(b)}"`).join(", ")}`);
    if (ctx.langPorContexto) notas.push(`segui em ${NOMES[tema.lang]}, que é o que você estava estudando`);
    if (ctx.porAssunto) notas.push(`pelo assunto, é ${NOMES[tema.lang]}`);
    if (notas.length) partes.push("> 🧠 " + notas.join("; ").replace(/^./, c => c.toUpperCase()) + ".");

    const o = ctx.textoOriginal ? this.objetivo(ctx.textoOriginal) : null;
    let pool = this.ABERTURAS[ctx.intent] || this.ABERTURAS.geral;
    if (ctx.intent === "como" && !o) pool = this.ABERTURAS.geral;
    const abertura = this.sorteia(pool).replace("{o}", o || "").replace("{t}", nomeCurto);
    // a explicação já começa com "### Nome": pra não repetir o nome, tiro o título quando a abertura já falou dele
    partes.push(abertura);
    partes.push(base);

    if (tema.ref && this.DICAS[tema.grupo] && Math.random() < 0.6) partes.push(`${this.sorteia(this.INTRO_DICA)} ${this.DICAS[tema.grupo]}`);
    if (ctx.relacionado) partes.push(`🔗 Junto com isso você provavelmente vai usar **${ctx.relacionado.titulo}**: ${this.frase(ctx.relacionado)}`);
    const fecho = this.sorteia(this.FECHAMENTOS);
    if (fecho) partes.push(fecho);

    const sugestoes = ["teste rápido", "explica melhor", ...(tema.sugestoes || [])];
    if (ctx.relacionado) sugestoes.push(ctx.relacionado.botao || ctx.relacionado.titulo);
    sugestoes.push(`/desafio sobre ${tema.titulo}`);
    return { texto: partes.join("\n"), sugestoes: [...new Set(sugestoes)].slice(0, 6) };
  },

  /* ---------- teste rápido (pergunta de múltipla escolha) ---------- */
  // escolhe sobre o que perguntar: o próprio item, ou algo que aparece no código da aula
  alvoDoQuiz(tema) {
    if (tema && tema.ref && tema.lang !== "conversa") return tema;
    const refs = WCDEV.temas.filter(x => x.ref && x.lang === (tema ? tema.lang : estado.lang || "pawn") && this.frase(x).length > 12);
    if (tema && typeof tema.resposta === "string") {
      const achado = refs.find(r => /^[A-Za-z_][\w.]{3,}$/.test(r.titulo) && new RegExp(`\\b${r.titulo.split(".").pop()}\\b`).test(tema.resposta));
      if (achado) return achado;
    }
    return refs.length ? this.sorteia(refs) : null;
  },

  quiz(tema) {
    const alvo = this.alvoDoQuiz(tema);
    if (!alvo) return null;
    const limpa = d => d.replace(/\*\*/g, "").replace(/\{\{|\}\}/g, "").replace(/\.$/, "");
    const colegas = WCDEV.temas.filter(x => x.ref && x.lang === alvo.lang && x !== alvo && (x.grupo === alvo.grupo || Math.random() < 0.02) &&
      limpa(this.frase(x)) !== limpa(this.frase(alvo)) && this.frase(x).length > 12);
    if (colegas.length < 2) return null;
    const errados = [];
    while (errados.length < 2) { const c = this.sorteia(colegas); if (!errados.includes(c)) errados.push(c); }
    const tipo = Math.random() < 0.5 ? "serve" : "qual";
    const opcoesTemas = [alvo, ...errados].sort(() => Math.random() - 0.5);
    const rotulo = x => tipo === "serve" ? limpa(this.frase(x)).slice(0, 70) : x.titulo;
    const letras = ["A", "B", "C"];
    const opcoes = opcoesTemas.map((x, i) => `${letras[i]}) ${rotulo(x)}`);
    const certa = letras[opcoesTemas.indexOf(alvo)];
    estado.quiz = { alvo, certa, opcoes, temas: opcoesTemas };
    const pergunta = tipo === "serve"
      ? `Pra que serve o {{${alvo.titulo}}}?`
      : `Qual destes ${limpa(this.frase(alvo)).replace(/^./, c => c.toLowerCase())}?`;
    const intro = this.sorteia(["Bora ver se ficou na cabeça! 🧠", "Teste rápido, sem pressão:", "Pergunta rápida pra fixar:", "Valendo nada, mas valendo muito: 😄"]);
    return { texto: `${intro}\n**Pergunta:** ${pergunta}\n${opcoes.map(x => "- " + x).join("\n")}\nToca na resposta que você acha certa.`, sugestoes: opcoes };
  },

  // confere a resposta do teste rápido
  responderQuiz(bruto) {
    const q = estado.quiz;
    if (!q) return null;
    // vale: a letra sozinha ("b", "B)", "letra b") ou o texto do botão
    const m = bruto.trim().match(/^(?:letra\s+)?([abc])\s*[).]?$/i);
    const botao = q.opcoes.find(o => o === bruto.trim());
    if (!m && !botao) return null;
    const letra = (m ? m[1] : botao[0]).toUpperCase();
    estado.quiz = null;
    const p = (Treino.progresso._quiz = Treino.progresso._quiz || { certas: 0, total: 0, seguidas: 0 });
    p.total++;
    const alvo = q.alvo;
    const explica = `**${alvo.titulo}**: ${this.frase(alvo)}`;
    if (letra === q.certa) {
      p.certas++; p.seguidas++;
      Treino.salvarProgresso();
      const festa = p.seguidas >= 3 ? ` Você já acertou **${p.seguidas} seguidas**! 🔥` : "";
      return { texto: `${this.sorteia(["Isso aí! 🎉", "Acertou! ✅", "Mandou bem! 💙", "Exatamente! 👏"])}${festa}\n${explica}`,
        sugestoes: ["outra pergunta", `/desafio sobre ${alvo.titulo}`, ...(alvo.sugestoes || []).slice(0, 2)] };
    }
    p.seguidas = 0;
    Treino.salvarProgresso();
    const escolhido = q.temas[["A", "B", "C"].indexOf(letra)];
    return {
      texto: `${this.sorteia(["Quase! 😅", "Não foi dessa vez, mas tá tudo bem!", "Opa, essa não. Errar faz parte!"])} A certa era a **${q.certa}**.\n${explica}` +
        (escolhido ? `\nA que você marcou (**${escolhido.titulo}**) serve pra outra coisa: ${this.frase(escolhido)}` : "") +
        "\nQuer tentar outra?",
      sugestoes: ["outra pergunta", alvo.botao || alvo.titulo],
    };
  },

};

WCDEV.cerebro = Cerebro;
