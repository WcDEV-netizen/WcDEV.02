/* =========================================================
   WC DEV — MOTOR (como a IA pensa, em etapas)

   1. recebe a mensagem            5. busca na base local (com sinônimos)
   2. normaliza / corrige          6. usa o contexto da conversa
   3. identifica a intenção        7. monta a resposta
   4. identifica linguagem/assunto 8. valida (revisor) e organiza

   Este arquivo cuida de:
   - MEMÓRIA da conversa (último código, quem escreveu, último pedido)
   - REFERÊNCIAS: "esse código", "agora corrige", "faz igual pro colete"
   - SINÔNIMOS: "personagem subir de level" = "jogador subir de nível"
   - CONFIANÇA: se a base não cobre o assunto, admite em vez de inventar
   - FUNÇÕES DESCONHECIDAS: não inventa o que uma função faz
   - RASTRO: /porque mostra as etapas que a IA seguiu na última resposta
   Tudo roda no aparelho. Nada é enviado pra internet.
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Motor = {
  turno: 0,
  rastro: [],
  ultimoRastro: [],

  /* ================= RASTRO (transparência) ================= */
  comecar(bruto) {
    this.turno++;
    this.rastro = [];
    this.passo("Mensagem", bruto.length > 60 ? bruto.slice(0, 60).replace(/\n/g, " ") + "…" : bruto.replace(/\n/g, " "));
  },
  passo(etapa, info) { this.rastro.push([etapa, info]); },
  terminar(resposta) {
    // o código que apareceu nesta resposta vira o "último código" da conversa
    const seu = estado.ultimoCodigo;
    if (seu && !seu.turno) seu.turno = this.turno;
    if (resposta && resposta.texto && !resposta._semMemoria && !(seu && seu.turno === this.turno)) {
      const m = resposta.texto.match(/~~~(\w+)\n([\s\S]*?)~~~/);
      if (m && NOMES[m[1]]) estado.codigoDaAula = { codigo: m[2].replace(/\n$/, ""), lang: m[1], turno: this.turno };
    }
    if (this.rastro.length > 1) this.ultimoRastro = this.rastro;
  },
  explicarRastro() {
    const r = this.ultimoRastro;
    if (!r || r.length < 2) return { texto: "Ainda não respondi nada nesta conversa pra eu te mostrar como pensei. 🙂" };
    return {
      texto: "### 🧠 Como eu cheguei na última resposta\n" + r.map(([e, i], n) => `- **${n + 1}. ${e}:** ${i}`).join("\n") +
        "\n\nEu funciono **direto no seu aparelho**, sem internet e sem API: entendo a frase, procuro na minha base de conhecimento, uso o que a gente já conversou e reviso o código antes de te mostrar.",
      sugestoes: ["/ajuda"],
      _semMemoria: true,
    };
  },

  /* ================= MEMÓRIA ================= */
  // o código mais recente da conversa (o seu ou o que eu mostrei)
  codigoRecente() {
    const seu = estado.ultimoCodigo, aula = estado.codigoDaAula;
    if (seu && aula) return (aula.turno || 0) > (seu.turno || 0) ? { ...aula, origem: "aula" } : { ...seu, origem: seu.origem || "conversa" };
    if (seu) return { ...seu, origem: seu.origem || "conversa" };
    if (aula) return { ...aula, origem: "aula" };
    const ed = document.getElementById("editorCodigo");
    if (ed && ed.value && ed.value.trim()) return { codigo: ed.value, lang: document.getElementById("editorLang").value, origem: "editor" };
    return null;
  },
  limpar() {
    estado.ultimoCodigo = null;
    estado.codigoDaAula = null;
    estado.ultimoPedido = null;
    estado.ultimo = null;
    estado.ultimaAula = null;
    estado.quiz = null;
    this.ultimoRastro = [];
  },

  /* ================= REFERÊNCIAS ("agora corrige", "esse código") ================= */
  RE_CORRIGIR: /^ (agora |entao |pode |por favor |pfv |ai |e )*(corrige|corrija|corrigir|conserta|consertar|conserte|arruma|arrumar|arrume|ajeita|ajeitar|resolve|resolva|resolver|fix|fixa|corrige ai|da um jeito)( (isso|isso ai|esse codigo|esse|essa|ele|o codigo|meu codigo|pra mim|ai|ae|por favor|pfv|tudo|os erros|o erro|esses erros|ele ai|la|pfvr))* $/,
  RE_EXPLICAR: /^ (agora |entao |pode |me |por favor |e )*(explica|explique|explicar|me explica|detalha|comenta)( (isso|esse codigo|esse|ele|o codigo|meu codigo|linha por linha|cada linha|tudo|pra mim|o que faz|ai|ae|por favor|direitinho|parte por parte))+ $|^ (o que|oque|que) (esse|este|isso|o) (codigo )?(faz|fez|significa) $|^ (linha por linha|explica linha a linha|explica linha por linha) $/,
  RE_REVISAR: /^ (agora |e )*(revisa|revise|revisar|confere|conferir|ve se|olha se|analisa|analise)( (isso|esse codigo|ele|o codigo|meu codigo|pra mim|se ta certo|se esta certo|ai|por favor))* $|^ (ta|esta|isso ta|isso esta|esse codigo ta|esse codigo esta|o codigo ta) (certo|errado|correto|bom|ok) $|^ tem (algum )?erro (nisso|aqui|ai|nesse codigo|no codigo)? ?$/,
  RE_IGUAL: /( igual| mesma coisa| mesmo esquema| parecido| igualzinho| igual ao anterior| do mesmo jeito)/,

  referencia(t0, bruto) {
    const corrigir = this.RE_CORRIGIR.test(t0), explicar = this.RE_EXPLICAR.test(t0), revisar = this.RE_REVISAR.test(t0);
    if (!corrigir && !explicar && !revisar) return null;
    const c = this.codigoRecente();
    if (!c) return {
      texto: "Qual código? 🤔 Ainda não tenho nenhum código nesta conversa.\nCola ele aqui no chat (ou escreve no **editor**) que eu " + (corrigir ? "conserto" : explicar ? "explico" : "reviso") + " pra você.",
      sugestoes: ["/editor"],
    };
    const quem = { aula: "do exemplo que eu te mostrei", gerado: "que eu acabei de montar", gerador: "que eu acabei de montar", editor: "que está no editor", conversa: "que está na conversa" }[c.origem] || "anterior";
    this.passo("Referência", `"${t0.trim()}" → usei o código ${quem} (${NOMES[c.lang] || c.lang})`);
    if (corrigir) return corrigirCodigo(c.codigo, c.lang);
    if (explicar) return explicarCodigo(c.codigo, c.lang);
    return revisarCodigo(c.codigo, c.lang);
  },

  /* ================= MAIS REFERÊNCIAS À CONVERSA ================= */
  // "explica a linha 20"
  linhaN(t0) {
    const m = t0.match(/^ (?:me |pode |agora |e )*(?:explica|explique|explicar|o que faz|oque faz|o que e|oque e|que faz|pra que serve|qual o problema d[ao]|ta errad[ao]|esta errad[ao]) (?:a |na |da )?linha (\d+)(?: d[oe] codigo)? ?\?? $/) || t0.match(/^ (?:e )?a linha (\d+) $/);
    if (!m) return null;
    const c = this.codigoRecente();
    if (!c) return { texto: "De qual código? 🤔 Cola ele aqui (ou escreve no **editor**) que eu explico a linha.", sugestoes: ["/editor"] };
    const n = +m[1], linhas = c.codigo.split("\n");
    if (n < 1 || n > linhas.length) return { texto: `O código que eu tenho aqui tem **${linhas.length} linhas**, então não existe a linha ${n}. Quer que eu explique ele inteiro?`, sugestoes: ["explica esse código"] };
    const l = linhas[n - 1];
    if (!l.trim()) return { texto: `A linha ${n} está **vazia** (só serve pra separar as partes e deixar mais fácil de ler).` };
    this.passo("Referência", `"linha ${n}" → peguei a linha ${n} do código ${c.origem === "aula" ? "do exemplo" : "da conversa"} (${NOMES[c.lang] || c.lang})`);
    const exp = WCDEV.explicador ? WCDEV.explicador.explicar(l, c.lang, { semTitulo: true }) : "";
    let texto = `> 🧠 Peguei a linha ${n} do último código${c.origem === "aula" ? " (do exemplo que eu mostrei)" : ""}.\n### 📍 Linha ${n}\n~~~${c.lang}\n${l.trim()}\n~~~\n${exp.replace(/^- \*\*Linha 1\*\* \{\{.*?\}\} → /m, "**O que faz:** ")}`;
    // o que a análise achou NESSA linha
    if (c.lang === "pawn" && WCDEV.analisador) {
      const a = WCDEV.analisador.analisar(c.codigo, "pawn");
      const aqui = a.achados.filter(x => x.linha === n).concat(a.sintaxe.filter(x => x.linha === n).map(x => ({ nivel: "erro", titulo: x.msg })));
      if (aqui.length) texto += "\n\n**⚠️ Nessa linha eu também achei:**\n" + aqui.map(x => `- ${x.titulo.replace(/\*\*/g, "")}${x.correcao ? ` ${x.correcao}` : ""}`).join("\n");
    }
    const vizinhas = [n - 1, n + 1].filter(k => k >= 1 && k <= linhas.length && linhas[k - 1].trim());
    return { texto, sugestoes: vizinhas.map(k => `explica a linha ${k}`).concat(["explica esse código"]) };
  },

  // "faz a mesma coisa em python"
  mesmaCoisaEmOutra(t0) {
    const m = t0.match(/ (?:faz|faca|fazer|mostra|cria|crie|quero|como fica|como seria|passa|converte|traduz)\s+(?:a |o )?(?:mesma coisa|isso|esse codigo|esse sistema|igual|esse comando)\s+(?:em|pra|para|no)\s+(python|javascript|js|pawn|html|css)\b/);
    if (!m) return null;
    const lang = m[1] === "js" ? "javascript" : m[1];
    const c = this.codigoRecente();
    // 1) se fui eu que gerei, gero de novo na outra linguagem
    if (estado.ultimoPedido && WCDEV.gerador) {
      const r = WCDEV.gerador.tentar(estado.ultimoPedido + " em " + NOMES[lang].toLowerCase(), normalizar(estado.ultimoPedido + " em " + lang), lang);
      if (r && r.texto.includes("~~~" + lang)) { this.passo("Contexto", `refiz o último pedido em ${NOMES[lang]}`); r.texto = `> 🧠 Refiz o último pedido em **${NOMES[lang]}**.\n` + r.texto.replace(/^> 🧠[^\n]*\n/, ""); return r; }
    }
    // 2) o mesmo assunto na outra linguagem
    const assunto = estado.ultimo && estado.ultimo.lang !== "conversa" ? estado.ultimo : null;
    const tema = assunto ? buscaPorPalavras(assunto.titulo + " " + (assunto.chaves || []).slice(0, 6).join(" "), lang) : null;
    const pawnPra = c && c.lang === "pawn" && lang !== "pawn";
    let texto = `> 🧠 ${c ? `O último código é de ${NOMES[c.lang] || c.lang}.` : ""} Converter código automaticamente de uma linguagem pra outra eu **não faço**, porque ia sair errado: ${pawnPra ? "o Pawn roda dentro do servidor de GTA (com playerid, callbacks...), coisa que não existe em " + NOMES[lang] + "." : "cada linguagem tem um jeito próprio."}\n`;
    if (tema && tema.lang === lang) { this.passo("Contexto", `mostrei "${tema.titulo}" em ${NOMES[lang]}, que é a mesma ideia`); const r = usarTema(tema); r.texto = texto + `Mas a **mesma ideia** em ${NOMES[lang]} é assim 👇\n\n` + r.texto; return r; }
    return { texto: texto + `Me diz **o que** você quer fazer em ${NOMES[lang]} (ex: "cria uma calculadora em ${NOMES[lang].toLowerCase()}") que eu monto do zero.`, sugestoes: ["/" + lang] };
  },

  // "o erro continua", "ainda dá erro", "não resolveu"
  erroContinua(t0) {
    if (!/ (o )?(erro|problema|bug) (continua|ainda|persiste|nao saiu|voltou)| (continua|ainda) (dando|da|com|aparecendo|acontecendo)( o)? (erro|problema|bug)| nao resolveu| nao funcionou ainda| continua nao funcionando| ainda nao funciona| mesmo erro /.test(t0)) return null;
    // o erro é do código DELE (ou do que eu montei), não de um exemplo de aula
    const u = estado.ultimoCodigo;
    const c = u ? { ...u, origem: u.origem || "conversa" } : this.codigoRecente();
    if (!c || c.origem === "aula") return { texto: "Pra eu ver o que está acontecendo, me manda o **código atual** (do jeito que está agora) e a **mensagem de erro** exata. 🙂", sugestoes: ["/editor"] };
    this.passo("Contexto", "o erro continua: reanalisei o código mais recente e pedi a mensagem exata");
    const r = revisarCodigo(c.codigo, c.lang) || { texto: "", sugestoes: [] };
    r.texto = `> 🧠 Analisei de novo o código mais recente da conversa (${c.codigo.split("\n").length} linhas de ${NOMES[c.lang] || c.lang}).\n` +
      "Se o erro continua, três perguntas pra gente achar rápido:\n- Você **compilou de novo** depois de mudar? (o servidor usa o .amx, não o .pwn)\n- Qual é a **mensagem exata** (com o número da linha)? Cola ela aqui.\n- O código que está rodando é **esse mesmo** que eu tenho? Se mudou, cola a versão nova.\n\n" + r.texto;
    return r;
  },

  // resumo da conversa atual (pra conversas longas)
  resumo() {
    const c = typeof Historico !== "undefined" && Historico.atualId ? Historico.pegar(Historico.atualId) : null;
    if (!c || !c.msgs.length) return { texto: "Essa conversa ainda está vazia: nada pra resumir. 🙂" };
    const msgs = c.msgs;
    const minhas = msgs.filter(m => m.q === "user");
    const codigos = minhas.filter(m => m.codigo || /[;{}]\s*$/m.test(m.t)).length;
    const assuntos = [...new Set(msgs.filter(m => m.q === "bot").map(m => (m.t.match(/^### (.+)$/m) || [])[1]).filter(Boolean).map(x => x.replace(/[*{}]/g, "").replace(/^[^\wÀ-ú]+/, "").trim()))];
    const desafios = msgs.filter(m => m.q === "bot" && /### ✅ (Desafio vencido|Missão completa|.*Entrou na cabeça|Mandou|Perfeito|Acertou|Show|Isso aí)/.test(m.t)).length;
    const perguntas = minhas.filter(m => !m.t.startsWith("/") && !/[;{}]/.test(m.t)).map(m => m.t.split("\n")[0].slice(0, 70));
    const linhas = [`**${msgs.length} mensagens** (${minhas.length} suas)`];
    if (assuntos.length) linhas.push(`**Assuntos:** ${assuntos.slice(-10).join(" · ")}`);
    if (perguntas.length) linhas.push(`**Suas últimas perguntas:**\n${perguntas.slice(-5).map(p => "- " + p).join("\n")}`);
    if (codigos) linhas.push(`**Códigos que você mandou:** ${codigos}`);
    if (desafios) linhas.push(`**Desafios vencidos aqui:** ${desafios} ✅`);
    const atual = this.codigoRecente();
    if (atual) linhas.push(`**Código em memória agora:** ${atual.codigo.split("\n").length} linhas de ${NOMES[atual.lang] || atual.lang}${atual.origem === "aula" ? " (exemplo meu)" : ""}`);
    return { texto: "### 🧾 Resumo desta conversa\n" + linhas.join("\n\n") + "\n\nPra começar do zero sem apagar nada, toque no balão **🧠** lá em cima (eu esqueço o contexto).", sugestoes: ["continuar de onde parei", "/boletim"], _semMemoria: true };
  },

  /* "faz igual mas pro colete" / "agora coloca só pra admin" */
  TROCAS_API: [
    { nome: "vida", palavras: ["vida", "hp", "cura", "curar", "heal"], set: "SetPlayerHealth", get: "GetPlayerHealth", texto: ["Vida", "vida"], adj: ["cheia", "cheia"] },
    { nome: "colete", palavras: ["colete", "armadura", "armour", "armor"], set: "SetPlayerArmour", get: "GetPlayerArmour", texto: ["Colete", "colete"], adj: ["cheio", "cheio"] },
    { nome: "score", palavras: ["score", "pontos", "pontuacao"], set: "SetPlayerScore", get: "GetPlayerScore", texto: ["Score", "score"] },
    { nome: "procurado", palavras: ["procurado", "estrelas", "wanted", "nivel de procurado"], set: "SetPlayerWantedLevel", get: "GetPlayerWantedLevel", texto: ["Procurado", "procurado"] },
    { nome: "skin", palavras: ["skin", "roupa", "personagem"], set: "SetPlayerSkin", get: "GetPlayerSkin", texto: ["Skin", "skin"] },
  ],
  FAMILIAS: [["vida", "colete"], ["score", "procurado", "skin"]],

  fazIgual(t0, bruto) {
    const c = this.codigoRecente();
    if (!c) return null;
    const igual = this.RE_IGUAL.test(t0) && / (faz|faca|fazer|cria|crie|criar|quero|agora|mas|so que|pro|pra|para|com) /.test(t0);
    const agora = /^ (agora|e agora|tambem|mas|so que) /.test(t0) && estado.ultimoPedido && c.origem !== "aula";
    if (!igual && !agora) return null;

    // 1) se o último código foi eu que gerei, gero de novo com o pedido novo
    if (estado.ultimoPedido && WCDEV.gerador) {
      const alvo = this.TROCAS_API.find(x => x.palavras.some(p => t0.includes(" " + p + " ")));
      let pedido = estado.ultimoPedido;
      if (alvo) {
        const antigo = this.TROCAS_API.find(x => x !== alvo && x.palavras.some(p => normalizar(pedido).includes(" " + p + " ")));
        if (antigo) antigo.palavras.forEach(p => (pedido = pedido.replace(new RegExp("\\b" + p + "\\b", "gi"), alvo.palavras[0])));
        else pedido += " " + alvo.palavras[0];
        pedido = pedido.replace(/\/(\w+)/, "/" + alvo.nome);
      } else {
        pedido += " " + bruto.replace(/^(agora|e agora|tamb[eé]m|mas|s[oó] que)\s*/i, "");
      }
      const anterior = c.codigo;
      const r = WCDEV.gerador.tentar(pedido, normalizar(pedido), c.lang);
      if (r && estado.ultimoCodigo && estado.ultimoCodigo.codigo === anterior) { estado.ultimoCodigo = { ...c }; }
      else if (r) {
        this.passo("Contexto", `peguei o último pedido ("${estado.ultimoPedido.slice(0, 50)}") e apliquei a mudança`);
        estado.ultimoPedido = pedido;
        r.texto = `> 🧠 Peguei o código anterior e refiz com a sua mudança, mantendo o resto igual.\n` + r.texto.replace(/^> 🧠[^\n]*\n/, "");
        return r;
      }
    }
    // 2) senão, troco as funções no próprio código (ex: vida -> colete)
    if (!igual) return null;
    const alvo = this.TROCAS_API.find(x => x.palavras.some(p => t0.includes(" " + p + " ")));
    if (!alvo) return { texto: "Faço sim! Só me diz **o que muda** em relação ao código anterior. Ex: **\"faz igual pro colete\"**, **\"igual mas só pra admin\"**.", sugestoes: ["faz igual pro colete", "faz igual pro score"] };
    const familia = this.FAMILIAS.find(f => f.includes(alvo.nome));
    const origem = this.TROCAS_API.find(x => x !== alvo && familia && familia.includes(x.nome) && (c.codigo.includes(x.set + "(") || c.codigo.includes(x.get + "(")));
    if (!origem) return { texto: `Não achei no código anterior nada que dê pra trocar por **${alvo.nome}** do mesmo jeito. Me diz o que você quer que eu faça (ex: **"cria um comando que dá 100 de ${alvo.nome}"**).`, sugestoes: [`cria um comando que dá ${alvo.nome}`] };
    let novo = c.codigo.split(origem.set + "(").join(alvo.set + "(").split(origem.get + "(").join(alvo.get + "(");
    if (origem.adj && alvo.adj) novo = novo.replace(new RegExp(origem.texto[0] + " " + origem.adj[0], "g"), alvo.texto[0] + " " + alvo.adj[0]).replace(new RegExp(origem.texto[1] + " " + origem.adj[1], "g"), alvo.texto[1] + " " + alvo.adj[1]);
    novo = novo.replace(new RegExp("\\b" + origem.texto[0] + "\\b", "g"), alvo.texto[0]).replace(new RegExp("\\b" + origem.texto[1] + "\\b", "g"), alvo.texto[1]);
    novo = novo.replace(/CMD:(\w+)/, (m, n) => n.toLowerCase() === origem.nome || origem.palavras.includes(n.toLowerCase()) ? "CMD:" + alvo.nome : m);
    const linhasMudadas = novo.split("\n").filter((l, i) => l !== c.codigo.split("\n")[i]).length;
    estado.ultimoCodigo = { codigo: novo, lang: c.lang, origem: "conversa", turno: this.turno };
    this.passo("Contexto", `usei o código anterior e troquei ${origem.set} → ${alvo.set}`);
    return {
      texto: `> 🧠 Peguei o código anterior e troquei **${origem.nome}** por **${alvo.nome}**. Mudei só ${linhasMudadas} linha(s); o resto ficou igual.\n### ✅ Mesmo código, agora pro ${alvo.nome}\n~~~${c.lang}\n${novo}\n~~~\n- {{${origem.set}}} virou {{${alvo.set}}}\n⚠️ Eu não compilo código aqui: compile no Pawno/Qawno pra confirmar.`,
      sugestoes: ["/explicar", "colocar no editor"],
    };
  },

  /* ================= SINÔNIMOS ================= */
  // cada grupo: [palavra principal, ...jeitos de falar]. A busca entende todos como a mesma coisa.
  SINONIMOS: [
    ["jogador", "personagem", "player", "boneco", "char", "playerid", "usuario no servidor"],
    ["nivel", "level", "lvl", "upar", "upa", "subir de level", "subir de nivel", "level up", "evoluir", "evolucao", "progressao"],
    ["xp", "experiencia", "exp", "pontos de experiencia"],
    ["dinheiro", "grana", "money", "cash", "bufunfa", "real", "reais", "moeda", "saldo"],
    ["organizacao", "org", "faccao", "gangue", "gang", "corporacao", "clan"],
    ["inventario", "mochila", "itens", "item", "bolsa", "bag"],
    ["emprego", "trampo", "job", "profissao", "trabalho", "servico", "caminhoneiro", "taxista", "entregador", "pizzaboy"],
    ["textdraw", "hud", "td", "texto na tela", "interface na tela"],
    ["salvar", "gravar", "guardar", "salvamento", "persistencia", "nao perder"],
    ["conta", "registro", "cadastro", "registrar", "logar"],
    ["veiculo", "carro", "moto", "viatura", "nave"],
    ["depuracao", "debugar", "debug", "depurar", "achar o erro", "encontrar erro", "rastrear erro", "breakpoint", "pdb", "traceback"],
    ["overflow", "saindo da tela", "estourando", "vazando", "passando da tela", "ultrapassando", "barra de rolagem lateral", "rolagem horizontal", "scroll horizontal"],
    ["centralizar", "centro", "no meio", "meio da tela"],
    ["ver", "pegar", "pega", "obter", "consultar", "checar", "saber quanto", "quanto tem"],
    ["responsivo", "celular", "mobile", "tela pequena"],
    ["comando", "cmd", "comandos"],
  ],
  mapa: null,
  prepararSinonimos() {
    this.mapa = [];
    for (const g of this.SINONIMOS) for (const s of g.slice(1)) this.mapa.push([" " + s + " ", g[0]]);
    this.mapa.sort((a, b) => b[0].length - a[0].length);
  },
  // acrescenta a palavra principal no fim da frase (sem apagar o que a pessoa escreveu)
  expandir(t) {
    if (!this.mapa) this.prepararSinonimos();
    const extras = new Set();
    for (const [s, principal] of this.mapa) if (t.includes(s) && !t.includes(" " + principal + " ")) extras.add(principal);
    return extras.size ? t + [...extras].join(" ") + " " : t;
  },
  principal(p) {
    if (!this.mapa) this.prepararSinonimos();
    const achado = this.mapa.find(([s]) => s === " " + p + " ");
    return achado ? achado[1] : p;
  },

  /* ================= CONFIANÇA (não inventar) ================= */
  GENERICAS: new Set(("como faco fazer criar crio cria usar uso usa quero queria preciso ajuda ajudar sistema sistemas codigo codigos programa " +
    "programar jeito forma pawn samp sa-mp python html css servidor server gamemode script coisa algo tipo bom boa melhor certo funciona funcionar " +
    "pra para com sem mais muito pouco aqui ali isso esse essa esta este meu minha seu sua dele dela quando onde porque qual quais quem voce " +
    "pode posso consigo tem ter tenho faz feito exemplo mostra mostrar ensina ensinar aprender explica explicar duvida simples facil rapido " +
    "jogador jogadores linguagem sobre tudo todo toda todos todas fica ficar deixar deixa coloca colocar botar bota rpg").split(" ")),

  palavrasDoAssunto(t) {
    return [...new Set(palavras(t))].filter(p => p.length >= 3 && !this.GENERICAS.has(p) && !/^\d+$/.test(p));
  },
  // a resposta encontrada fala mesmo do assunto da pergunta?
  cobre(tema, t) {
    if (!tema || tema.lang === "conversa") return true;
    const qs = this.palavrasDoAssunto(t);
    if (!qs.length) return true;
    const alvo = tema._palavras || new Set(palavras(tema.titulo + " " + (tema.chaves || []).join(" ")));
    const corpo = normalizar(typeof tema.resposta === "string" ? tema.resposta.slice(0, 700) : "");
    return qs.some(q => {
      const p = this.principal(q);
      if (alvo.has(q) || alvo.has(p)) return true;
      if (q.length >= 5 && [...alvo].some(w => w.length >= 5 && (w.startsWith(q.slice(0, 5)) || q.startsWith(w.slice(0, 5))))) return true;
      return corpo.includes(" " + q + " ") || corpo.includes(" " + p + " ");
    });
  },
  naoSei(t, lang) {
    const qs = this.palavrasDoAssunto(t);
    const assunto = qs.slice(0, 3).join(" ") || "isso";
    this.passo("Confiança", `nenhuma aula da base fala de "${assunto}": preferi não inventar`);
    const perto = [];
    for (const q of qs) {
      const r = buscaPorPalavras(" " + q + " ", lang);
      if (r && !perto.includes(r.botao || r.titulo)) perto.push(r.botao || r.titulo);
    }
    return {
      texto: `> 🧠 Procurei **"${assunto}"** na minha base${lang ? ` de ${NOMES[lang]}` : ""} e não achei nada que fale disso de verdade.\n` +
        `Ainda não tenho conteúdo sobre **${assunto}**, e prefiro te falar isso do que inventar uma resposta errada. 😅\n\n` +
        `O que dá pra fazer:\n- Me pergunte de outro jeito (com outras palavras)\n- Veja o **/indice** pra ver tudo que eu sei\n` +
        (perto.length ? `- Ou veja o que eu tenho de mais parecido 👇` : ""),
      sugestoes: [...perto.slice(0, 3), "/indice", ...(WCDEV.modeloLocal && WCDEV.modeloLocal.ativo() ? ["/ia " + t.trim().slice(0, 80)] : [])],
    };
  },

  /* ================= LINGUAGEM/TECNOLOGIA QUE NÃO ESTÁ NA BASE ================= */
  FORA: [
    [/ (rust) /, "Rust"], [/ (java) /, "Java"], [/ (react|vue|angular|typescript|ts|next.js|nextjs) /, "frameworks de JavaScript (React/Vue/Angular/TypeScript)"],
    [/ (c#|c sharp|csharp) /, "C#"], [/ (c\+\+|cpp) /, "C++"], [/ (linguagem c|em c|no c|codigo c) /, "C"], [/ (php|laravel) /, "PHP"],
    [/ (golang|em go|linguagem go) /, "Go"], [/ (kotlin) /, "Kotlin"], [/ (swift) /, "Swift"], [/ (lua|roblox|luau) /, "Lua/Roblox"],
    [/ (ruby|rails) /, "Ruby"], [/ (flutter|dart) /, "Flutter/Dart"], [/ (nginx|apache) /, "servidor web (Nginx/Apache)"],
    [/ (docker) /, "Docker"], [/ (kubernetes|k8s|helm) /, "Kubernetes"], [/ (terraform|ansible) /, "Terraform/infraestrutura"], [/ (postgres|postgresql) /, "PostgreSQL"], [/ (aws|azure|gcp|google cloud) /, "nuvem (AWS/Azure/GCP)"], [/ (unity|unreal|godot) /, "motores de jogo (Unity/Unreal/Godot)"], [/ (excel|vba) /, "Excel/VBA"],
    [/ (assembly|assembler) /, "Assembly"], [/ (kotlin|android studio) /, "Android"],
  ],
  foraDaBase(t, bruto) {
    const achado = this.FORA.find(([re]) => re.test(t));
    if (!achado) return null;
    // "como colocar javascript no html": isso eu sei (o básico que liga JS na página)
    // "lua" pode ser "a lua do jogo"... só conta se parecer pergunta de programação
    if (achado[1] === "Lua/Roblox" && !/ (codigo|script|programar|programacao|linguagem|funcao|studio|roblox|luau|em lua) /.test(t)) return null;
    if (/ (java|javascript|js) /.test(t) && / (diferenca|diferente|igual|mesma coisa) /.test(t) && / java / .test(t) && / (javascript|js) /.test(t)) { /* deixa a visão geral responder abaixo */ }
    if (/ (em c|no c) /.test(t) && !/ (linguagem|programar|codigo|compilar|printf|ponteiro|struct) /.test(t)) return null;
    const nossa = detectarLinguagem(t);
    // pergunta geral ("diferença entre java e javascript", "roblox usa que linguagem"): tenho uma visão geral
    const geral = melhorTema(t, null);
    if (geral.tema && geral.tema.lang === "conversa" && geral.pontos >= 5 && !/^(fora|duvida)/.test(geral.tema.id) &&
        achado[0].test(normalizar(geral.tema.titulo + " " + (geral.tema.chaves || []).join(" ")))) {
      this.passo("Busca", `achei uma visão geral: "${geral.tema.titulo}"`);
      const r = usarTema(geral.tema);
      r.texto += `\n\nℹ️ Isso é uma **visão geral**. Aulas completas de **${achado[1]}** eu não tenho, então não vou além disso pra não te ensinar errado.`;
      return r;
    }
    this.passo("Confiança", `"${achado[1]}" não está na minha base: preferi não inventar`);
    const equivalente = nossa ? `Sobre a parte de **${NOMES[nossa]}**, eu sei sim: me pergunta só ela que eu explico.` :
      achado[1] === "Lua/Roblox" || achado[1] === "C" || achado[1] === "C++" ? "Se for pra servidor de GTA, o **Pawn** é parecido com C e eu ensino ele inteiro." :
      "Se quiser, eu te mostro a mesma ideia em **Python**, que é ótimo pra começar.";
    return {
      texto: `> 🧠 Você perguntou sobre **${achado[1]}**. Procurei na minha base e não tenho aulas confiáveis sobre isso.\n` +
        `Eu fui feito pra ensinar **Pawn, Python, HTML, CSS e JavaScript**. Sobre **${achado[1]}** eu prefiro te falar a verdade do que inventar uma resposta que pode estar errada. 😅\n\n${equivalente}`,
      sugestoes: nossa ? ["/" + nossa, "/indice " + nossa] : ["/python", "/pawn", "/indice"],
    };
  },

  /* ================= DIAGNÓSTICO POR SINTOMA (base problemas.js) ================= */
  SINAIS: / (nao funciona|nao funcionou|nao aparece|nao apareceu|nao salva|nao salvou|perde|perdeu|perdendo|some|sumiu|somem|trava|travou|travando|crash|crasha|crashou|caiu|cai|bug|bugou|bugado|da erro|deu erro|aparece|aparecendo|nao chega|nao carrega|nao roda|nao executa|nao acha|nao sobe|nao upa|errado|errada|duplicando|dobro|duas vezes|infinito|do nada|qualquer um|qualquer senha|vazia|negativo|zerad|lento|lag|nao faz nada|nao mostra|entrou com|veio com|herdou|qualquer um|nan|is not defined|out of bounds|unknown command|cannot read|failed|fatal error|error 100|typeerror|indexerror|indentationerror|filenotfounderror) /,
  _probs: null,
  prepararProblemas() {
    this._probs = (WCDEV.problemas || []).map(p => ({ p, sint: p.sintomas.map(x => normalizar(x)), palavras: new Set(p.sintomas.join(" ").split(/\W+/).map(w => normalizar(w).trim()).filter(w => w.length >= 4 && !this.GENERICAS.has(w))) }));
  },
  diagnosticar(t, lang) {
    if (!WCDEV.problemas) return null;
    if (!this._probs) this.prepararProblemas();
    const temSinal = this.SINAIS.test(t);
    const tExp = this.expandir(t);
    const qs = new Set(tExp.split(" ").filter(w => w.length >= 4 && !this.GENERICAS.has(w)));
    let melhor = null, pts = 0, segundo = null, pts2 = 0;
    for (const item of this._probs) {
      let s = 0;
      for (const frase of item.sint) if (tExp.includes(frase)) s = Math.max(s, 6 + frase.trim().split(" ").length * 2);
      if (!s && !temSinal) continue;   // sem frase de sintoma igual e sem cara de problema: não é diagnóstico
      let comuns = 0;
      for (const w of qs) if (item.palavras.has(w)) comuns++;
      s += comuns * 1.5;
      if (lang && item.p.lang !== lang && !(lang === "html" && item.p.lang === "css") && !(lang === "css" && item.p.lang === "html")) s -= 4;
      if (!lang && estado.lang && item.p.lang === estado.lang) s += 1;
      if (s > pts) { segundo = melhor; pts2 = pts; melhor = item.p; pts = s; } else if (s > pts2) { segundo = item.p; pts2 = s; }
    }
    if (!melhor || pts < 6) return null;
    const p = melhor;
    this.passo("Diagnóstico", `o que você descreveu bate com "${p.titulo}" (${Math.round(pts)} pontos)`);
    if (p.lang && NOMES[p.lang]) atualizarLang(p.lang);
    const lista = xs => xs.map((x, i) => `- ${i === 0 ? "**Mais comum:** " : ""}${x}`).join("\n");
    let texto = `> 🩺 Pelo que você descreveu, parece **${p.titulo.replace(/\*\*/g, "")}**. Sem ver o código eu não tenho certeza, então vou te passar as causas da mais comum pra menos comum.\n### 🩺 ${p.titulo}\n`;
    texto += `**Causas prováveis:**\n${lista(p.causas)}\n\n**Como resolver:**\n${p.correcoes.map(x => "- " + x).join("\n")}\n`;
    if (p.errado) texto += `\n**Assim dá problema:**\n~~~${p.lang}\n${p.errado}\n~~~\n`;
    if (p.certo) texto += `\n**Assim funciona:**\n~~~${p.lang}\n${p.certo}\n~~~\n`;
    texto += `\n**Vale pra:** ${p.compat} · **Confiança:** ${p.confianca}${p.origem ? ` (${p.origem})` : ""}`;
    texto += `\n\n👉 **Cola o código** que eu analiso e te digo **qual** dessas causas é a sua${p.regras && p.regras.length ? " (eu tenho regras que procuram exatamente isso)" : ""}.`;
    const sug = ["/editor"];
    if (segundo && pts2 >= 6 && segundo !== p) { sug.push(segundo.titulo.replace(/["*]/g, "").slice(0, 60)); texto += `\n\nSe não for isso, pode ser: **${segundo.titulo.replace(/\*\*/g, "")}**.`; }
    return { texto, sugestoes: sug, _semMemoria: true };
  },

  /* ================= PEDIDO SEM DETALHE: PERGUNTA ANTES ================= */
  faltaDetalhe(t) {
    const pedido = t.match(/^ (?:(?:eu )?(?:quero|queria|preciso|me|pode|consegue|voce pode) )?(?:que (?:voce )?)?(?:cria|crie|criar|faz|faca|fazer|gera|gere|gerar|monta|monte|montar|escreve|escreva|programa|da|de)(?: pra mim)? (?:um|uma|o|a)? ?(sistema|codigo|script|programa|comando|site|pagina|funcao|gamemode|gm|jogo|projeto)(?: (?:ai|ae|pra mim|por favor|pfv|completo|bom|top|dahora|massa))* $/);
    if (!pedido) return null;
    const oque = pedido[1];
    const lang = detectarLinguagem(t) || estado.lang;
    this.passo("Pergunta", `pediu "${oque}" sem dizer qual/como: perguntei antes de gerar`);
    const P = {
      sistema: ["Que **sistema** você quer? Me diz o nome e, se der, o que ele precisa ter.", lang === "python" ? ["cria um sistema de login em python", "cria uma calculadora em python"] : ["cria um sistema de level com XP, salvamento e aviso", "sistema de inventário", "sistema de payday de 500 a cada 30 minutos", "sistema de organizações"]],
      comando: ["O que o **comando** vai fazer? Me fala o nome e a ação (e se é só pra admin).", ["cria um comando /cura que dá 100 de vida", "cria um comando /kick só pra admin", "cria um comando /carro que cria um infernus"]],
      site: ["Site **de quê**? (portfólio, loja, página de perfil, landing page...). Me diz também as cores se quiser.", ["cria uma página de perfil", "cria um site de loja azul e preto", "cria uma landing page"]],
      pagina: ["Página **de quê**? (perfil, loja, formulário de contato...)", ["cria uma página de perfil", "cria um formulário de contato"]],
      gamemode: ["Que **estilo** de servidor? Cada um tem uma estrutura diferente.", ["quero fazer um servidor rpg", "quero fazer um servidor dm", "quero fazer um servidor de corrida"]],
      jogo: ["Que **jogo**? E em qual linguagem? Em Python eu consigo fazer jogos de texto (e te explico o pygame).", ["cria um jogo de adivinhação em python", "quero fazer um jogo em python"]],
    };
    P.gm = P.gamemode; P.projeto = P.sistema;
    const [pergunta, sug] = P[oque] || [`Em qual **linguagem** e pra fazer **o quê**? Quanto mais detalhe, melhor o código que eu monto.`, ["cria um comando /cura que dá 100 de vida", "cria uma calculadora em python", "cria uma página de perfil"]];
    const nomeBonito = { codigo: "código", pagina: "página", funcao: "função", gm: "gamemode" }[oque] || oque;
    return { texto: `> 🧠 Você pediu um${/^(pagina|funcao)$/.test(oque) ? "a" : ""} ${nomeBonito}, mas não disse qual. Prefiro perguntar do que montar uma coisa que você não queria.\n### 🤔 Só me fala uma coisa\n${pergunta}\n\nPode escrever do seu jeito, ou tocar num exemplo 👇`, sugestoes: sug, _semMemoria: true };
  },

  /* "deu erro" / "não compila" sem colar nada: usa o último código ou pede o código */
  semCodigo(t) {
    if (!/ (deu erro|da erro|ta dando erro|esta dando erro|nao compila|nao compilar|nao compilou|nao ta compilando|nao esta compilando|nao funciona|nao ta funcionando|bugou|ta bugado|ta bugando|esta bugado|crashou) /.test(t)) return null;
    if (t.split(" ").length > 12) return null;
    // "z-index não funciona" é pergunta de assunto, não "meu código deu erro"
    const resto = t.replace(/ (deu erro|da erro|ta dando erro|esta dando erro|nao compila|nao compilar|nao compilou|nao funciona|nao ta funcionando|bugou|ta bugado|ta bugando|esta bugado|crashou) /, " ");
    if (this.palavrasDoAssunto(resto).some(p => !/^(codigo|script|gamemode|gm|programa|meu|minha|aqui|isso|ajuda|ajude|socorro|help|ele|nada|me|pfv|pf|favor|mano|cara)$/.test(p))) return null;
    if (/ (servidor|server) (ta |esta )?(crashando|caindo|crashou)/.test(t)) return null;
    const c = this.codigoRecente();
    if (c && c.origem !== "aula") {
      this.passo("Referência", `"${t.trim()}" → revisei o último código da conversa (${NOMES[c.lang] || c.lang})`);
      const r = revisarCodigo(c.codigo, c.lang);
      if (r) { r.texto = "> 🧠 Você disse que deu problema: revisei o último código que está na conversa.\n" + r.texto.replace(/^> 🧠[^\n]*\n/, "") + "\n\n💡 Se o compilador mostrou alguma mensagem (tipo {{error 017}}), cola ela aqui que eu explico exatamente a linha."; return r; }
    }
    return {
      texto: "> 🧠 Pra achar o problema eu preciso ver o código.\n### 🔎 Me manda duas coisas\n- O **código** (cola aqui no chat ou no **editor**)\n- A **mensagem de erro**, se tiver (do compilador ou do console)\n\nCom isso eu te digo a linha exata e conserto sem mexer no resto.",
      sugestoes: ["/editor"], _semMemoria: true,
    };
  },

  /* ================= FUNÇÃO QUE NÃO EXISTE NA BASE ================= */
  conhecidos: null,
  prepararConhecidos() {
    this.conhecidos = new Set();
    for (const t of WCDEV.temas) {
      if (t.ref) this.conhecidos.add(t.titulo.replace(/\(.*$/, "").toLowerCase());
      const txt = typeof t.resposta === "string" ? t.resposta : "";
      for (const m of txt.matchAll(/~~~\w*\n([\s\S]*?)~~~/g)) for (const w of m[1].match(/[A-Za-z_][\w.]{3,}/g) || []) this.conhecidos.add(w.toLowerCase());
    }
  },
  funcaoDesconhecida(bruto, t) {
    if (!/ (usar|uso|usa|funciona|serve|faz|o que e|oque e|que e|significa|como chamar|explica|explique|parametros|sintaxe) /.test(t)) return null;
    if (/ (criar|cria|crie|fazer|faca|faz um|faz uma|escrever|gerar) /.test(t) && !/ o que faz /.test(t)) return null;
    if (!this.conhecidos) this.prepararConhecidos();
    // nomes com cara de função: SetPlayerSuperPower, mysql_tquery, random.choice
    const nomes = (bruto.match(/\b([A-Z][a-z]+(?:[A-Z][a-z0-9]*)+|[a-z]+_[a-z_]+[a-z]|[a-z]+\.[a-z_]+)\b/g) || [])
      .filter(n => n.length >= 6 && !/^(sa_mp|open\.mp|a_samp)$/i.test(n));
    const desconhecido = nomes.find(n => !this.conhecidos.has(n.toLowerCase()));
    if (!desconhecido) return null;
    const lang = detectarLinguagem(t) || (/^[A-Z]/.test(desconhecido) ? "pawn" : estado.lang) || "pawn";
    this.passo("Confiança", `"${desconhecido}" não está na minha base: não vou inventar o que faz`);
    const parecidas = [...this.conhecidos].filter(k => distancia(k, desconhecido.toLowerCase()) <= 2).slice(0, 3);
    const prefixo = desconhecido.match(/^(Set|Get|Give|Is|Create|Destroy|Show|Hide|Reset|Remove|Add)[A-Z]?[a-z]*/);
    const mesmaFamilia = prefixo ? WCDEV.temas.filter(x => x.ref && x.lang === "pawn" && x.titulo.startsWith(prefixo[0])).slice(0, 4).map(x => x.titulo) : [];
    const sugestoes = [...new Set([...parecidas.map(p => (WCDEV.temas.find(x => x.ref && x.titulo.toLowerCase() === p) || {}).titulo).filter(Boolean), ...mesmaFamilia])].slice(0, 4);
    let texto = `> 🧠 Procurei **${desconhecido}** em tudo que eu sei e não achei.\n### 🤔 Não conheço ${desconhecido}\n`;
    texto += lang === "pawn"
      ? `Ela não está na minha lista de funções do SA-MP, e **não vou inventar** como ela funciona. Ela pode ser:\n- **De um include ou plugin**: abra os arquivos {{.inc}} e procure por {{native ${desconhecido}(}} ou {{stock ${desconhecido}(}}\n- **Criada no seu gamemode**: use Ctrl+F e procure {{${desconhecido}(}} no seu .pwn\n- **Escrita diferente**: maiúsculas e minúsculas importam em Pawn\n`
      : `Não está na minha base, e **não vou inventar** como ela funciona. Ela pode ser de uma biblioteca, criada no seu código, ou estar com o nome diferente. Dica: no Python, {{help(${desconhecido})}} mostra a documentação de qualquer coisa importada.\n`;
    if (sugestoes.length) texto += `\nTalvez você esteja procurando uma destas 👇`;
    else texto += `\nSe você me colar o código onde ela é criada, eu te explico linha por linha.`;
    return { texto, sugestoes: sugestoes.length ? sugestoes : ["/explicar", "/indice " + lang] };
  },
};

WCDEV.motor = Motor;
