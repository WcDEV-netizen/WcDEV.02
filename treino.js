/* =========================================================
   WC DEV — MODO TREINO e MODO ENSINAR
   /treinar pawn  -> exercícios corrigidos pela IA
   /ensinar pergunta = resposta  -> a IA aprende (fica salvo no navegador)
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

/* ---------- guardar no navegador (com proteção se não puder) ---------- */
const Guardar = {
  ler(chave, padrao) {
    try { const v = localStorage.getItem(chave); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; }
  },
  salvar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; } catch (e) { return false; }
  },
};

/* =========================================================
   TREINO
   ========================================================= */
const Treino = {
  ativo: null,                                   // exercício aberto agora
  progresso: Guardar.ler("wcdev_treino", {}),    // { pawn: [titulos feitos] }

  lista(lang) {
    return (WCDEV.exercicios || []).filter(e => e.lang === lang).sort((a, b) => a.nivel - b.nivel);
  },

  feitos(lang) { return this.progresso[lang] || []; },

  iniciar(lang) {
    if (!lang) {
      return { texto: "Bora treinar! 💪 Qual linguagem?", sugestoes: ["/treinar pawn", "/treinar python", "/treinar html", "/treinar css"] };
    }
    const lista = this.lista(lang);
    if (!lista.length) return { texto: `Ainda não tenho exercícios de ${NOMES[lang]}.` };
    const feitos = this.feitos(lang);
    let ex = lista.find(e => !feitos.includes(e.titulo));
    if (!ex) {
      return {
        texto: `🏆 Você já fez **todos os ${lista.length} exercícios** de ${NOMES[lang]}! Quer refazer do começo ou treinar outra linguagem?`,
        sugestoes: [`/zerar ${lang}`, "/treinar pawn", "/treinar python", "/treinar html", "/treinar css"].filter(s => s !== `/treinar ${lang}`),
      };
    }
    return this.abrir(ex);
  },

  abrir(ex) {
    this.ativo = ex;
    atualizarLang(ex.lang);
    marcarModoTreino(true);
    const lista = this.lista(ex.lang);
    const n = lista.indexOf(ex) + 1;
    const estrelas = "⭐".repeat(ex.nivel);
    return {
      texto: `### 🏋️ Treino de ${NOMES[ex.lang]} — ${n}/${lista.length}: ${ex.titulo} ${estrelas}\n${ex.enunciado}\n\nEscreva seu código e envie. No modo treino o **Enter pula linha**; pra enviar toque em **➤** (ou **Ctrl+Enter**).` +
        (ex.base ? `\n\nO seu CSS vai ser aplicado neste HTML:\n~~~html\n${ex.base}\n~~~` : ""),
      sugestoes: ["/dica", "/pular", "/sair"],
    };
  },

  corrigir(codigo) {
    const ex = this.ativo;
    const falhas = ex.testes.filter(t => !t.re.test(codigo));
    const analise = WCDEV.revisor ? WCDEV.revisor.analisar(codigo, ex.lang) : null;
    const erros = analise ? analise.problemas.filter(p => p.tipo === "erro") : [];
    const avisos = analise ? analise.problemas.filter(p => p.tipo !== "erro") : [];
    const certos = ex.testes.length - falhas.length;
    const preview = this.preview(ex, codigo);

    if (!falhas.length && !erros.length) {
      const feitos = this.feitos(ex.lang);
      if (!feitos.includes(ex.titulo)) feitos.push(ex.titulo);
      this.progresso[ex.lang] = feitos;
      Guardar.salvar("wcdev_treino", this.progresso);
      const lang = ex.lang;
      this.ativo = null;
      marcarModoTreino(false);
      const total = this.lista(lang).length;
      const elogios = ["Mandou muito bem!", "Perfeito!", "Isso aí, programador(a)!", "Acertou de primeira? 😎", "Código limpo!"];
      return {
        texto: `### ✅ ${elogios[Math.floor(Math.random() * elogios.length)]}\nVocê completou **${ex.titulo}**. Progresso em ${NOMES[lang]}: **${feitos.length}/${total}** exercícios.` +
          (avisos.length ? `\n\nSó umas dicas pra ficar ainda melhor:\n${avisos.map(a => `- Linha ${a.linha}: ${a.msg}`).join("\n")}` : ""),
        sugestoes: [`/treinar ${lang}`, "/sair"],
        preview,
      };
    }

    let texto = `### 🔧 Quase lá! ${certos}/${ex.testes.length} partes certas\n`;
    if (falhas.length) texto += `O que falta:\n${falhas.map(f => `- ❌ ${f.falta}`).join("\n")}\n`;
    if (erros.length) texto += `\nErros que achei no código:\n${erros.slice(0, 6).map(e => `- **Linha ${e.linha}:** ${e.msg}`).join("\n")}\n`;
    texto += "\nArrume e envie de novo. Se travar, peça uma {{/dica}} ou veja a {{/resposta}}.";
    return { texto, sugestoes: ["/dica", "/resposta", "/pular"], preview };
  },

  preview(ex, codigo) {
    if (ex.lang === "html") return codigo;
    if (ex.lang === "css") return `${ex.base || ""}<style>${codigo}</style>`;
    return null;
  },

  dica() {
    if (!this.ativo) return { texto: "Você não está num exercício agora. Digite {{/treinar}} pra começar." };
    return { texto: `💡 **Dica:** ${this.ativo.dica}`, sugestoes: ["/resposta", "/pular"] };
  },

  resposta() {
    if (!this.ativo) return { texto: "Você não está num exercício agora. Digite {{/treinar}} pra começar." };
    return {
      texto: `Aqui está uma solução:\n~~~${this.ativo.lang}\n${this.ativo.solucao}\n~~~\nCopie, entenda cada linha e **digite você mesmo** (não cole!) pra fixar. Depois envie pra eu corrigir.`,
      sugestoes: ["/pular", "/sair"],
    };
  },

  pular() {
    if (!this.ativo) return this.iniciar(estado.lang);
    const lang = this.ativo.lang;
    const lista = this.lista(lang);
    const prox = lista[(lista.indexOf(this.ativo) + 1) % lista.length];
    return this.abrir(prox);
  },

  sair() {
    this.ativo = null;
    marcarModoTreino(false);
    return { texto: "Saiu do modo treino. Quando quiser voltar é só digitar {{/treinar}}. 😉", sugestoes: ["/treinar", "/ajuda"] };
  },

  zerar(lang) {
    if (lang) delete this.progresso[lang]; else this.progresso = {};
    Guardar.salvar("wcdev_treino", this.progresso);
    return { texto: `Progresso ${lang ? "de " + NOMES[lang] + " " : ""}zerado. Bora de novo!`, sugestoes: [lang ? `/treinar ${lang}` : "/treinar"] };
  },

  status() {
    const linhas = ["pawn", "python", "html", "css"].map(l => `- **${NOMES[l]}:** ${this.feitos(l).length}/${this.lista(l).length}`);
    return { texto: `### Seu progresso no treino\n${linhas.join("\n")}`, sugestoes: ["/treinar"] };
  },
};

/* =========================================================
   ENSINAR: o próprio aluno ensina respostas novas à IA
   ========================================================= */
const Aprendizado = {
  itens: Guardar.ler("wcdev_aprendido", []),

  carregar() {
    WCDEV.temas = WCDEV.temas.filter(t => !t.aprendido);
    this.itens.forEach((it, i) => {
      const tema = {
        id: "aprendido-" + i, lang: "conversa", aprendido: true,
        titulo: it.p, chaves: [it.p], resposta: it.r + "\n\n(resposta que você me ensinou 🧠)",
      };
      tema._chaves = tema.chaves.map(c => normalizar(c));
      tema._titulo = normalizar(tema.titulo);
      WCDEV.temas.unshift(tema);   // aprendidas têm prioridade
    });
  },

  ensinar(texto) {
    const corpo = texto.replace(/^\/ensinar\s*/i, "");
    const i = corpo.indexOf("=");
    if (i < 1 || !corpo.slice(i + 1).trim()) {
      return { texto: "Pra me ensinar algo, escreva assim:\n~~~\n/ensinar qual o ip do servidor = O IP é 127.0.0.1:7777\n~~~\nA parte antes do **=** é a pergunta, e depois é a minha resposta. Fica salvo neste navegador." };
    }
    const p = corpo.slice(0, i).trim(), r = corpo.slice(i + 1).trim();
    const existente = this.itens.findIndex(x => normalizar(x.p) === normalizar(p));
    if (existente >= 0) this.itens[existente].r = r; else this.itens.push({ p, r });
    const salvou = Guardar.salvar("wcdev_aprendido", this.itens);
    this.carregar();
    return {
      texto: `🧠 Aprendi! Quando perguntarem **"${p}"**, vou responder:\n${r}` +
        (salvou ? "" : "\n\n⚠️ Seu navegador não deixou salvar, então eu esqueço quando a página fechar."),
      sugestoes: [p, "/aprendidos"],
    };
  },

  esquecer(texto) {
    const p = texto.replace(/^\/esquecer\s*/i, "").trim();
    if (!p) return { texto: "Diga o que esquecer: {{/esquecer pergunta}}. Veja a lista com {{/aprendidos}}." };
    const antes = this.itens.length;
    this.itens = this.itens.filter(x => normalizar(x.p) !== normalizar(p));
    Guardar.salvar("wcdev_aprendido", this.itens);
    this.carregar();
    return { texto: antes !== this.itens.length ? `Pronto, esqueci **"${p}"**.` : `Não achei **"${p}"** no que você me ensinou.`, sugestoes: ["/aprendidos"] };
  },

  listar() {
    if (!this.itens.length) return { texto: "Você ainda não me ensinou nada. Experimente:\n~~~\n/ensinar regras do servidor = Sem cheat, sem flood e respeite todos.\n~~~" };
    return {
      texto: `### O que você me ensinou (${this.itens.length})\n${this.itens.map(x => `- **${x.p}** → ${x.r}`).join("\n")}\n\nPra apagar: {{/esquecer pergunta}}`,
      sugestoes: this.itens.slice(0, 4).map(x => x.p),
    };
  },
};

WCDEV.treino = Treino;
WCDEV.aprendizado = Aprendizado;
