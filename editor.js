/* =========================================================
   WC DEV — EDITOR DE CÓDIGO
   Painel próprio pra escrever código, revisar e fazer os treinos.
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Editor = {
  painel: null, area: null, linhas: null, lang: null, exercicio: null, preview: null,
  BASE_CSS: `<h1>Título</h1><p>Um parágrafo de exemplo.</p><button class="botao">Botão</button><div class="caixa card">Caixa</div>`,

  iniciar() {
    this.painel = document.getElementById("editor");
    this.area = document.getElementById("editorCodigo");
    this.linhas = document.getElementById("editorLinhas");
    this.lang = document.getElementById("editorLang");
    this.exercicio = document.getElementById("editorExercicio");
    this.preview = document.getElementById("editorPreview");

    document.getElementById("btnEditor").onclick = () => this.alternar();
    document.getElementById("editorFechar").onclick = () => this.fechar();
    document.getElementById("btnRevisar").onclick = () => this.enviar("revisar");
    document.getElementById("btnEnviarResposta").onclick = () => this.enviar("treino");
    document.getElementById("btnCorrigirCod").onclick = () => this.enviar("corrigir");
    document.getElementById("btnExplicarCod").onclick = () => this.enviar("explicar");
    document.getElementById("btnVer").onclick = () => this.verResultado();
    document.getElementById("btnLimparCod").onclick = () => { this.area.value = ""; this.atualizar(); this.area.focus(); };
    document.getElementById("btnCopiarCod").onclick = e => {
      navigator.clipboard.writeText(this.area.value).then(() => {
        e.target.textContent = "Copiado!";
        setTimeout(() => (e.target.textContent = "Copiar"), 1500);
      });
    };
    this.lang.onchange = () => { this.carregarRascunho(); this.atualizarBotoes(); };

    this.area.addEventListener("input", () => { this.atualizar(); this.salvarRascunho(); });
    this.area.addEventListener("scroll", () => (this.linhas.scrollTop = this.area.scrollTop));
    this.area.addEventListener("keydown", e => this.teclas(e));
    this.atualizarBotoes();
  },

  /* ---------- abrir / fechar ---------- */
  abrir(lang) {
    if (lang && lang !== this.lang.value) { this.lang.value = lang; this.carregarRascunho(); }
    document.body.classList.add("editor-aberto");
    this.painel.setAttribute("aria-hidden", "false");
    this.atualizarBotoes();
    setTimeout(() => this.area.focus(), 60);
  },
  fechar() {
    document.body.classList.remove("editor-aberto");
    this.painel.setAttribute("aria-hidden", "true");
  },
  alternar() { document.body.classList.contains("editor-aberto") ? this.fechar() : this.abrir(estado.lang); },
  noCelular() { return window.innerWidth <= 760; },

  /* ---------- treino ---------- */
  abrirExercicio(ex) {
    this.exercicio.hidden = false;
    this.exercicio.innerHTML = `<div class="ex-titulo">🏋️ ${Util.esc(ex.titulo)} ${"⭐".repeat(ex.nivel)}</div>
      <div class="ex-texto">${formatar(ex.enunciado)}</div>
      <div class="ex-botoes">
        <button data-cmd="/dica">💡 Dica</button><button data-cmd="/resposta">Ver resposta</button>
        <button data-cmd="/pular">Pular</button><button data-cmd="/sair">Sair do treino</button>
      </div>`;
    this.exercicio.querySelectorAll("[data-cmd]").forEach(b => (b.onclick = () => {
      enviar(b.dataset.cmd);
      if (this.noCelular()) this.fechar();
    }));
    this.lang.value = ex.lang;
    this.area.value = "";
    this.atualizar();
    this.esconderPreview();
    this.abrir(ex.lang);
  },
  fecharExercicio() {
    this.exercicio.hidden = true;
    this.exercicio.innerHTML = "";
    this.atualizarBotoes();
  },

  /* ---------- enviar código pro chat ---------- */
  enviar(modo) {
    const codigo = this.area.value.replace(/\s+$/, "");
    if (!codigo.trim()) { this.area.focus(); return; }
    const lang = this.lang.value;
    enviarCodigo(codigo, lang, modo === "treino" && Treino.ativo ? "treino" : (modo === "corrigir" || modo === "explicar") ? modo : "revisar");
    if (this.noCelular()) this.fechar();
  },

  // coloca um código pronto no editor (ex: o código que a IA corrigiu)
  colocar(codigo, lang) {
    if (lang && NOMES[lang]) this.lang.value = lang;
    this.area.value = codigo;
    this.atualizar();
    this.salvarRascunho();
    this.atualizarBotoes();
    this.abrir(this.lang.value);
  },

  verResultado() {
    const lang = this.lang.value;
    const codigo = this.area.value;
    let html = codigo;
    if (lang === "css") html = ((Treino.ativo && Treino.ativo.base) || this.BASE_CSS) + `<style>${codigo}</style>`;
    this.preview.hidden = false;
    const frame = this.preview.querySelector("iframe");
    frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui,sans-serif;margin:12px;color:#111;background:#fff}</style></head><body>${html}</body></html>`;
  },
  esconderPreview() { this.preview.hidden = true; },

  atualizarBotoes() {
    const visual = ["html", "css"].includes(this.lang.value);
    document.getElementById("btnVer").hidden = !visual;
    document.getElementById("btnEnviarResposta").hidden = !Treino.ativo;
    if (!visual) this.esconderPreview();
    this.area.placeholder = {
      pawn: "// escreva seu código Pawn aqui\npublic OnPlayerConnect(playerid)\n{\n    return 1;\n}",
      python: "# escreva seu código Python aqui\nprint(\"Olá!\")",
      html: "<!-- escreva seu HTML aqui -->\n<h1>Olá!</h1>",
      css: "/* escreva seu CSS aqui */\nh1 {\n    color: #1e90ff;\n}",
    }[this.lang.value];
  },

  /* ---------- números de linha ---------- */
  atualizar() {
    const n = Math.max(1, this.area.value.split("\n").length);
    let t = "";
    for (let i = 1; i <= n; i++) t += i + "\n";
    this.linhas.textContent = t;
    this.linhas.scrollTop = this.area.scrollTop;
  },

  /* ---------- Tab, Enter com recuo, fechar chaves ---------- */
  teclas(e) {
    const a = this.area;
    const ini = a.selectionStart, fim = a.selectionEnd, v = a.value;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.enviar(Treino.ativo ? "treino" : "revisar");
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {   // tira 4 espaços do começo da linha
        const comeco = v.lastIndexOf("\n", ini - 1) + 1;
        const tira = (v.slice(comeco).match(/^ {1,4}/) || [""])[0].length;
        a.value = v.slice(0, comeco) + v.slice(comeco + tira);
        a.selectionStart = a.selectionEnd = Math.max(comeco, ini - tira);
      } else {
        a.setRangeText("    ", ini, fim, "end");
      }
      this.atualizar(); this.salvarRascunho();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const comeco = v.lastIndexOf("\n", ini - 1) + 1;
      const linha = v.slice(comeco, ini);
      let recuo = linha.match(/^\s*/)[0];
      const antes = linha.trimEnd();
      const depois = v.slice(fim, fim + 1);
      if (/[{(\[:]$/.test(antes) || /<[a-z][^/>]*>$/i.test(antes)) {
        const extra = recuo + "    ";
        if ((antes.endsWith("{") && depois === "}") || (antes.endsWith("(") && depois === ")") || (antes.endsWith("[") && depois === "]")) {
          a.setRangeText("\n" + extra + "\n" + recuo, ini, fim, "start");
          a.selectionStart = a.selectionEnd = ini + 1 + extra.length;
        } else {
          a.setRangeText("\n" + extra, ini, fim, "end");
        }
      } else {
        a.setRangeText("\n" + recuo, ini, fim, "end");
      }
      this.atualizar(); this.salvarRascunho();
      return;
    }
    // fecha chaves/parênteses/aspas automaticamente
    const pares = { "{": "}", "(": ")", "[": "]", '"': '"' };
    if (pares[e.key] && ini === fim && !e.ctrlKey && !e.metaKey) {
      const prox = v[ini] || "";
      if (e.key === '"' && prox === '"') { e.preventDefault(); a.selectionStart = a.selectionEnd = ini + 1; return; }
      if (e.key !== '"' || !/\w/.test(v[ini - 1] || "")) {
        e.preventDefault();
        a.setRangeText(e.key + pares[e.key], ini, fim, "start");
        a.selectionStart = a.selectionEnd = ini + 1;
        this.atualizar(); this.salvarRascunho();
      }
      return;
    }
    if ([")", "]", "}"].includes(e.key) && v[ini] === e.key && ini === fim) {
      e.preventDefault();
      a.selectionStart = a.selectionEnd = ini + 1;
    }
  },

  /* ---------- rascunho salvo por linguagem ---------- */
  salvarRascunho() {
    if (Treino.ativo) return;   // rascunho do treino não precisa ficar
    clearTimeout(this._t);
    this._t = setTimeout(() => {
      const r = Guardar.ler(chaveDoUsuario("rascunhos"), {});
      r[this.lang.value] = this.area.value;
      Guardar.salvar(chaveDoUsuario("rascunhos"), r);
    }, 400);
  },
  carregarRascunho() {
    const r = Guardar.ler(chaveDoUsuario("rascunhos"), {});
    this.area.value = r[this.lang.value] || "";
    this.atualizar();
    this.esconderPreview();
  },
};

WCDEV.editor = Editor;
