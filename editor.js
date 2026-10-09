/* =========================================================
   WC DEV — EDITOR DE CÓDIGO
   - cores no código (Pawn, Python, HTML, CSS)
   - autocompletar com as funções que a IA conhece (+ modelos prontos)
   - erros marcados na linha enquanto você digita
   - formatar, comentar, duplicar linha, abrir/baixar arquivo
   - barra de símbolos no celular
   Tudo leve, sem biblioteca.
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Editor = {
  painel: null, area: null, linhas: null, cores: null, lang: null, exercicio: null, preview: null,
  auto: null, status: {}, problemas: [], linhaAtual: -1, fonte: 14,
  BASE_CSS: `<h1>Título</h1><p>Um parágrafo de exemplo.</p><button class="botao">Botão</button><div class="caixa card">Caixa</div>`,
  EXT: { pawn: "pwn", python: "py", html: "html", css: "css", javascript: "js" },

  /* ================= MODELOS PRONTOS ================= */
  // $0 = onde o cursor fica depois de inserir
  MODELOS: {
    pawn: [
      ["gm", "Gamemode base", "#include <a_samp>\n#include <zcmd>\n#include <sscanf2>\n\nmain() {}\n\npublic OnGameModeInit()\n{\n    SetGameModeText(\"Meu GM\");\n    AddPlayerClass(0, 1958.33, 1343.12, 15.36, 269.15, 0, 0, 0, 0, 0, 0);\n    $0\n    return 1;\n}\n\npublic OnPlayerConnect(playerid)\n{\n    SendClientMessage(playerid, 0x1E90FFFF, \"Bem-vindo ao servidor!\");\n    return 1;\n}\n"],
      ["cmd", "Comando zcmd", "CMD:$[nome](playerid, params[])\n{\n    \n    return 1;\n}"],
      ["cmdid", "Comando com alvo (sscanf)", "CMD:$[nome](playerid, params[])\n{\n    new alvo;\n    if (sscanf(params, \"u\", alvo)) return SendClientMessage(playerid, -1, \"Use: /nome [id]\");\n    if (!IsPlayerConnected(alvo)) return SendClientMessage(playerid, -1, \"Jogador não conectado.\");\n    \n    return 1;\n}"],
      ["for", "Loop nos jogadores", "for (new i = 0; i < MAX_PLAYERS; i++)\n{\n    if (!IsPlayerConnected(i)) continue;\n    $0\n}"],
      ["foreach", "foreach (y_iterate)", "foreach (new i : Player)\n{\n    $0\n}"],
      ["if", "if / else", "if ($0)\n{\n    \n}\nelse\n{\n    \n}"],
      ["timer", "Timer repetindo", "forward MeuTimer();\npublic MeuTimer()\n{\n    $0\n    return 1;\n}\n\n// no OnGameModeInit:\n// SetTimer(\"MeuTimer\", 60000, true);"],
      ["dialog", "Dialog de lista", "#define DIALOG_MENU 1\n\nShowPlayerDialog(playerid, DIALOG_MENU, DIALOG_STYLE_LIST, \"Menu\", \"Opção 1\\nOpção 2\", \"Escolher\", \"Fechar\");\n\npublic OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])\n{\n    if (dialogid == DIALOG_MENU && response)\n    {\n        switch (listitem)\n        {\n            case 0: $0SendClientMessage(playerid, -1, \"Opção 1\");\n            case 1: SendClientMessage(playerid, -1, \"Opção 2\");\n        }\n        return 1;\n    }\n    return 0;\n}"],
      ["enum", "Dados do jogador (enum)", "enum E_JOGADOR\n{\n    pNivel,\n    pDinheiro,\n    bool:pLogado$0\n}\nnew Jogador[MAX_PLAYERS][E_JOGADOR];"],
      ["stock", "Função stock", "stock $[NomeDaFuncao](playerid)\n{\n    \n    return 1;\n}"],
      ["nome", "Pegar nome do jogador", "new nome[MAX_PLAYER_NAME];\nGetPlayerName(playerid, nome, sizeof(nome));$0"],
      ["format", "Mensagem com format", "new msg[144];\nformat(msg, sizeof(msg), \"%s$0\", nome);\nSendClientMessage(playerid, -1, msg);"],
    ],
    python: [
      ["def", "Função", "def $[nome](parametro):\n    \n    return parametro"],
      ["class", "Classe", "class $[Nome]:\n    def __init__(self, valor):\n        self.valor = valor\n\n    def mostrar(self):\n        print(self.valor)"],
      ["for", "for em range", "for i in range($[10]):\n    print(i)"],
      ["forl", "for em lista", "for item in $[lista]:\n    print(item)"],
      ["if", "if / elif / else", "if $0:\n    pass\nelif :\n    pass\nelse:\n    pass"],
      ["while", "while", "while $0True:\n    break"],
      ["try", "try / except", "try:\n    $0\nexcept ValueError:\n    print(\"Valor inválido\")"],
      ["main", "if __name__", "def main():\n    $0\n\n\nif __name__ == \"__main__\":\n    main()"],
      ["input", "Ler número", "numero = int(input(\"Digite um número: \"))$0"],
      ["with", "Abrir arquivo", "with open(\"$0arquivo.txt\", \"r\", encoding=\"utf-8\") as f:\n    conteudo = f.read()"],
    ],
    html: [
      ["html", "Página base", "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Meu site</title>\n    <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n    $0\n</body>\n</html>"],
      ["a", "Link", "<a href=\"$0\"></a>"],
      ["img", "Imagem", "<img src=\"$0\" alt=\"\">"],
      ["ul", "Lista", "<ul>\n    <li>$0</li>\n    <li></li>\n</ul>"],
      ["nav", "Menu", "<nav>\n    <a href=\"#\">Início</a>\n    <a href=\"#sobre\">Sobre</a>\n    <a href=\"#contato\">Contato</a>$0\n</nav>"],
      ["form", "Formulário", "<form>\n    <label>Nome <input type=\"text\" name=\"nome\" required></label>\n    <label>E-mail <input type=\"email\" name=\"email\"></label>\n    <button type=\"submit\">Enviar</button>$0\n</form>"],
      ["table", "Tabela", "<table>\n    <tr><th>Nome</th><th>Nível</th></tr>\n    <tr><td>$0</td><td></td></tr>\n</table>"],
      ["btn", "Botão", "<button class=\"botao\">$0</button>"],
    ],
    javascript: [
      ["log", "console.log", "console.log($0);"],
      ["fn", "Função", "function $[nome](parametro) {\n    \n    return parametro;\n}"],
      ["af", "Arrow function", "const $[nome] = (x) => $0;"],
      ["for", "for de 0 a N", "for (let i = 0; i < $[10]; i++) {\n    \n}"],
      ["forof", "for...of", "for (const item of $[lista]) {\n    console.log(item);\n}"],
      ["if", "if / else", "if ($0) {\n    \n} else {\n    \n}"],
      ["clique", "Evento de clique", "document.querySelector(\"$[#botao]\").addEventListener(\"click\", () => {\n    \n});"],
      ["async", "Função async", "async function $[carregar]() {\n    try {\n        \n    } catch (erro) {\n        console.log(erro.message);\n    }\n}"],
      ["try", "try / catch", "try {\n    $0\n} catch (erro) {\n    console.log(erro.message);\n}"],
    ],
    css: [
      ["flex", "Centralizar com flex", "display: flex;\njustify-content: center;\nalign-items: center;$0"],
      ["grid", "Grid de cards", ".grade {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n    gap: 16px;$0\n}"],
      ["card", "Card azul e preto", ".card {\n    background: #0b0f1a;\n    color: #dbe6ff;\n    border: 1px solid #1e90ff;\n    border-radius: 12px;\n    padding: 16px;$0\n}"],
      ["btn", "Botão com hover", ".botao {\n    background: #1e90ff;\n    color: #fff;\n    border: none;\n    border-radius: 8px;\n    padding: 10px 18px;\n    cursor: pointer;\n    transition: background .2s;\n}\n.botao:hover {\n    background: #0b3d91;$0\n}"],
      ["media", "Celular (media query)", "@media (max-width: 600px) {\n    $0\n}"],
      ["anim", "Animação", "@keyframes surgir {\n    from { opacity: 0; transform: translateY(10px); }\n    to { opacity: 1; transform: none; }\n}\n.elemento {\n    animation: surgir .4s ease;$0\n}"],
    ],
  },

  // callbacks: escolher depois de "public " já monta o bloco inteiro
  CALLBACKS: {
    OnGameModeInit: "", OnGameModeExit: "", OnPlayerConnect: "playerid", OnPlayerDisconnect: "playerid, reason",
    OnPlayerSpawn: "playerid", OnPlayerDeath: "playerid, killerid, reason", OnPlayerText: "playerid, text[]",
    OnPlayerCommandText: "playerid, cmdtext[]", OnPlayerRequestClass: "playerid, classid",
    OnDialogResponse: "playerid, dialogid, response, listitem, inputtext[]", OnPlayerEnterCheckpoint: "playerid",
    OnPlayerStateChange: "playerid, newstate, oldstate", OnPlayerKeyStateChange: "playerid, newkeys, oldkeys",
    OnVehicleDeath: "vehicleid, killerid", OnPlayerEnterVehicle: "playerid, vehicleid, ispassenger",
    OnPlayerExitVehicle: "playerid, vehicleid", OnPlayerTakeDamage: "playerid, issuerid, Float:amount, weaponid, bodypart",
    OnPlayerGiveDamage: "playerid, damagedid, Float:amount, weaponid, bodypart", OnPlayerUpdate: "playerid",
    OnPlayerClickPlayer: "playerid, clickedplayerid, source", OnRconLoginAttempt: "ip[], password[], success",
  },

  iniciar() {
    const $ = id => document.getElementById(id);
    this.painel = $("editor");
    this.area = $("editorCodigo");
    this.linhas = $("editorLinhas");
    this.cores = $("editorCores");
    this.lang = $("editorLang");
    this.exercicio = $("editorExercicio");
    this.preview = $("editorPreview");
    this.auto = $("edAuto");
    this.status = { problemas: $("edProblemas"), pos: $("edPos"), info: $("edInfo"), msg: $("edProblemaMsg"), arquivo: $("editorArquivo") };

    $("btnEditor").onclick = () => this.alternar();
    $("editorFechar").onclick = () => this.fechar();
    $("editorGrande").onclick = () => document.body.classList.toggle("editor-grande");
    $("btnRevisar").onclick = () => this.enviar("revisar");
    $("btnEnviarResposta").onclick = () => this.enviar("treino");
    $("btnCorrigirCod").onclick = () => this.enviar("corrigir");
    $("btnExplicarCod").onclick = () => this.enviar("explicar");
    $("btnVer").onclick = () => (this.preview.hidden ? this.verResultado() : this.esconderPreview());
    $("btnLimparCod").onclick = () => { this.selecionarTudo(); this.inserir(""); this.area.focus(); };
    $("btnCopiarCod").onclick = e => {
      navigator.clipboard.writeText(this.area.value).then(() => this.aviso("📋 Código copiado!"));
    };
    $("edFormatar").onclick = () => this.formatar();
    $("edModelos").onclick = e => { e.stopPropagation(); this.menuModelos(); };
    $("edAbrir").onclick = () => $("edArquivo").click();
    $("edArquivo").onchange = e => this.abrirArquivo(e.target.files[0]);
    $("edBaixar").onclick = () => this.baixar();
    // projeto (vários arquivos)
    $("edProjeto").onclick = e => { e.stopPropagation(); const m = $("edMenuProjeto"); m.hidden = !m.hidden; m.querySelector('[data-p="fechar"]').hidden = !this.projeto; };
    $("edMenuProjeto").addEventListener("click", e => {
      const b = e.target.closest("[data-p]"); if (!b) return;
      $("edMenuProjeto").hidden = true;
      if (b.dataset.p === "arquivos") $("edProjArqs").click();
      if (b.dataset.p === "pasta") $("edProjPasta").click();
      if (b.dataset.p === "fechar") this.fecharProjeto();
    });
    $("edProjArqs").onchange = e => { this.lerArquivosProjeto(e.target.files); e.target.value = ""; };
    $("edProjPasta").onchange = e => { this.lerArquivosProjeto(e.target.files); e.target.value = ""; };
    $("edAbas").addEventListener("click", e => { const b = e.target.closest("[data-arq]"); if (b) this.trocarArquivo(b.dataset.arq); });
    $("btnAnalisarProj").onclick = () => { this.salvarArquivoAtual(); enviar("/projeto analisar"); };
    $("btnCorrigirProj").onclick = () => { this.salvarArquivoAtual(); enviar("/projeto corrigir"); };
    $("edMenor").onclick = () => this.mudarFonte(-1);
    $("edMaior").onclick = () => this.mudarFonte(1);
    this.status.problemas.onclick = () => this.irProProblema();
    document.addEventListener("click", e => {
      if (!e.target.closest("#edMenuModelos")) $("edMenuModelos").hidden = true;
      if (!e.target.closest("#edMenuProjeto") && e.target.id !== "edProjeto") $("edMenuProjeto").hidden = true;
      if (!e.target.closest("#edAuto") && e.target !== this.area) this.fecharAuto();
    });

    // barra de símbolos (celular)
    $("edTeclas").addEventListener("mousedown", e => e.preventDefault());   // não tira o foco do código
    $("edTeclas").addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.k === "tab") this.inserir("    ");
      else if (b.dataset.k === "desfazer") { this.area.focus(); document.execCommand("undo"); }
      else this.digitarPar(b.dataset.k || b.textContent);
      this.area.focus();
    });

    this.lang.onchange = () => { this.carregarRascunho(); this.atualizarBotoes(); };
    this.area.addEventListener("input", () => { this.atualizar(); this.salvarRascunho(); if (!this._inserindo) this.sugerir(); });
    this.area.addEventListener("scroll", () => this.sincronizarRolagem(), { passive: true });
    this.area.addEventListener("keydown", e => this.teclas(e));
    this.area.addEventListener("keyup", e => { if (!/^(Arrow|Home|End|Page)/.test(e.key) && e.key !== "Shift") return; this.mostrarPosicao(); });
    this.area.addEventListener("click", () => { this.mostrarPosicao(); this.fecharAuto(); });
    this.area.addEventListener("blur", () => setTimeout(() => { if (document.activeElement !== this.area) this.fecharAuto(); }, 150));
    this.auto.addEventListener("mousedown", e => {
      e.preventDefault();
      const li = e.target.closest("[data-i]");
      if (li) { this.autoSel = +li.dataset.i; this.aceitarAuto(); }
    });

    this.carregarProjetoSalvo();
    this.fonte = +(Guardar.ler("wcdev_editor_fonte", 14)) || 14;
    this.aplicarFonte();
    this.atualizarBotoes();
    this.atualizar();
  },

  /* ================= ABRIR / FECHAR ================= */
  abrir(lang) {
    if (lang && lang !== this.lang.value) { this.lang.value = lang; this.carregarRascunho(); }
    document.body.classList.add("editor-aberto");
    this.painel.setAttribute("aria-hidden", "false");
    this.atualizarBotoes();
    this.atualizar();
    if (!this.noCelular()) setTimeout(() => this.area.focus(), 60);
  },
  fechar() {
    document.body.classList.remove("editor-aberto", "editor-grande");
    this.painel.setAttribute("aria-hidden", "true");
    this.fecharAuto();
  },
  alternar() { document.body.classList.contains("editor-aberto") ? this.fechar() : this.abrir(estado.lang); },
  noCelular() { return window.innerWidth <= 760; },

  /* ================= TREINO ================= */
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
    // desafio da aula no celular: deixa ler a aula primeiro (o editor abre quando tocar em ✍️ Editor)
    if (ex.daAula && this.noCelular()) { this.atualizarBotoes(); return; }
    this.abrir(ex.lang);
  },
  fecharExercicio() {
    this.exercicio.hidden = true;
    this.exercicio.innerHTML = "";
    this.atualizarBotoes();
  },

  /* ================= ENVIAR PRO CHAT ================= */
  enviar(modo) {
    const codigo = this.area.value.replace(/\s+$/, "");
    if (!codigo.trim()) { this.aviso("Escreva algum código primeiro ✍️"); this.area.focus(); return; }
    const lang = this.lang.value;
    enviarCodigo(codigo, lang, modo === "treino" && Treino.ativo ? "treino" : (modo === "corrigir" || modo === "explicar") ? modo : "revisar");
    if (this.noCelular()) this.fechar();
  },

  // coloca um código pronto no editor (ex: o código que a IA corrigiu)
  colocar(codigo, lang) {
    const atual = this.area.value;
    if (atual.trim() && atual !== codigo) {
      // não substitui sem guardar: a versão de antes vai pra /versoes
      if (this.projeto && typeof confirm === "function" && !confirm(`Colocar esse código no arquivo ${this.projeto.atual}? A versão de agora fica guardada em /versoes.`)) return;
      if (WCDEV.analiseHistorico) WCDEV.analiseHistorico.guardarVersao(`antes de colocar código no editor${this.projeto ? " (" + this.projeto.atual + ")" : ""}`, { tipo: "codigo", codigo: atual, lang: this.lang.value });
    }
    if (lang && NOMES[lang]) this.lang.value = lang;
    this.area.value = codigo;
    this.atualizar();
    this.salvarRascunho();
    this.atualizarBotoes();
    this.abrir(this.lang.value);
  },

  /* ---------- rodar JavaScript ISOLADO ----------
     Sem DOM: roda num Web Worker (outra thread) com tempo limite: loop infinito não trava a página.
     Com DOM (document/window): roda num iframe sandbox SEM acesso à página do WC DEV. */
  executarJs() {
    const codigo = this.area.value;
    this.preview.hidden = false;
    document.getElementById("btnVer").textContent = "🙈 Esconder resultado";
    const frame = this.preview.querySelector("iframe");
    const usaPagina = /\b(document|window|alert|localStorage)\b/.test(codigo);
    const htmlBase = (Treino.ativo && Treino.ativo.htmlBase) || '<h1 id="titulo">Título</h1><p class="texto">Parágrafo</p><button id="btn">Botão</button><ul id="lista"></ul>';
    const mostrar = (linhas, aviso) => {
      frame.setAttribute("sandbox", "");
      frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font:13px/1.5 ui-monospace,Consolas,monospace;margin:10px;background:#0b0f1a;color:#cfe1ff}.e{color:#ff8fa3}.a{color:#ffd27a}.n{color:#7d8bab}</style></head><body>${aviso ? `<div class="a">${aviso}</div>` : ""}${linhas.map(l => `<div class="${l.t}">${l.s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</div>`).join("") || '<div class="n">(nada foi mostrado no console)</div>'}</body></html>`;
    };
    if (usaPagina) {
      // console no fim da página de teste, dentro do iframe isolado
      frame.setAttribute("sandbox", "allow-scripts");
      const ponte = `<script>(function(){const box=document.createElement('pre');box.id='__console';box.style.cssText='background:#0b0f1a;color:#cfe1ff;padding:8px;border-radius:8px;font:12px ui-monospace,monospace;white-space:pre-wrap;margin-top:12px';const f=v=>{try{return typeof v==='object'?JSON.stringify(v):String(v)}catch(e){return String(v)}};const add=(t,c)=>{if(!box.isConnected)document.body.appendChild(box);const d=document.createElement('div');d.textContent=t;if(c)d.style.color=c;box.appendChild(d)};console.log=(...a)=>add(a.map(f).join(' '));console.error=(...a)=>add(a.map(f).join(' '),'#ff8fa3');console.assert=(ok,...a)=>{if(!ok)add('Assertion failed: '+a.map(f).join(' '),'#ff8fa3')};window.onerror=(m,s,l)=>{add('❌ '+m+' (linha '+(l-1)+')','#ff8fa3');return true};})();<\/script>`;
      frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui,sans-serif;margin:12px;color:#111;background:#fff}</style>${ponte}</head><body>${htmlBase}<script>\n${codigo.replace(/<\/script/gi, "<\\/script")}\n<\/script></body></html>`;
      return;
    }
    if (typeof Worker === "undefined" || typeof Blob === "undefined") return mostrar([], "Este navegador não consegue rodar o código isolado.");
    if (this._worker) this._worker.terminate();
    const prelude = `const __f=v=>{try{return typeof v==='object'&&v!==null?JSON.stringify(v):String(v)}catch(e){return String(v)}};const __o=(t)=>(...a)=>postMessage({t,s:a.map(__f).join(' ')});console.log=__o('');console.info=__o('');console.warn=__o('a');console.error=__o('e');console.assert=(ok,...a)=>{if(!ok)postMessage({t:'e',s:'Assertion failed: '+a.map(__f).join(' ')})};self.fetch=()=>Promise.reject(new Error('fetch está desligado aqui (o código roda isolado, sem internet)'));self.addEventListener('unhandledrejection',e=>postMessage({t:'e',s:'❌ '+(e.reason&&e.reason.message||e.reason)}));`;
    const fonte = prelude + "\ntry {\n" + codigo + "\n} catch (e) { postMessage({ t: 'e', s: '❌ ' + e.name + ': ' + e.message }); }\nsetTimeout(() => postMessage({ t: '__fim' }), 0);";
    let url;
    try { url = URL.createObjectURL(new Blob([fonte], { type: "text/javascript" })); } catch (e) { return mostrar([], "Não consegui preparar a execução."); }
    const w = new Worker(url);
    this._worker = w;
    const linhas = [];
    let fim = null;
    const encerrar = aviso => { clearTimeout(fim); w.terminate(); URL.revokeObjectURL(url); if (this._worker === w) this._worker = null; mostrar(linhas, aviso); };
    w.onmessage = e => { if (e.data.t === "__fim") { clearTimeout(fim); fim = setTimeout(() => encerrar(), 1200); return; } if (linhas.length < 500) linhas.push(e.data); };
    w.onerror = e => { linhas.push({ t: "e", s: "❌ " + e.message + (e.lineno ? ` (linha ${e.lineno - 2})` : "") }); e.preventDefault(); encerrar(); };
    fim = setTimeout(() => encerrar("⏱️ Parei depois de 3 segundos: o código pode ter um loop infinito (ou estava esperando algo demorado)."), 3000);
    mostrar([], "▶ Rodando...");
  },

  verResultado() {
    const lang = this.lang.value;
    const codigo = this.area.value;
    if (lang === "javascript") return this.executarJs();
    let html = codigo;
    if (lang === "css") html = ((Treino.ativo && Treino.ativo.base) || this.BASE_CSS) + `<style>${codigo}</style>`;
    this.preview.hidden = false;
    document.getElementById("btnVer").textContent = "🙈 Esconder resultado";
    const frame = this.preview.querySelector("iframe");
    frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui,sans-serif;margin:12px;color:#111;background:#fff}</style></head><body>${html}</body></html>`;
  },
  esconderPreview() {
    this.preview.hidden = true;
    const b = document.getElementById("btnVer");
    if (b) b.textContent = "👁 Ver resultado";
  },

  atualizarBotoes() {
    const l = this.lang.value;
    const visual = ["html", "css", "javascript"].includes(l);
    document.getElementById("btnVer").hidden = !visual;
    if (!this.preview || this.preview.hidden) document.getElementById("btnVer").textContent = l === "javascript" ? "▶ Executar" : "👁 Ver resultado";
    document.getElementById("btnEnviarResposta").hidden = !Treino.ativo;
    if (!visual) this.esconderPreview();
    this.area.placeholder = {
      pawn: "// escreva seu código Pawn aqui\n// dica: digite \"cmd\" e aperte Tab ✨",
      python: "# escreva seu código Python aqui\n# dica: digite \"def\" e aperte Tab ✨",
      html: "<!-- escreva seu HTML aqui -->\n<!-- dica: digite \"html\" e aperte Tab ✨ -->",
      css: "/* escreva seu CSS aqui */\n/* dica: digite \"card\" e aperte Tab ✨ */",
      javascript: "// escreva seu JavaScript aqui e toque em ▶ Executar\n// dica: digite \"log\" e aperte Tab ✨",
    }[l];
    this.status.arquivo.textContent = "main." + this.EXT[l];
    this.status.info.textContent = NOMES[l];
    this._dic = null;   // refaz a lista do autocompletar
    this.atualizar();
  },

  /* ================= CORES + LINHAS + ERROS ================= */
  atualizar() {
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      const v = this.area.value;
      // o "\n " no fim deixa a altura igual à do textarea
      this.cores.innerHTML = (WCDEV.cores ? WCDEV.cores.colorir(v, this.lang.value) : Util.esc(v)) + "\n ";
      const n = Math.max(1, v.split("\n").length);
      if (n !== this._n || this._marcas !== this._marcasDesenhadas) {
        const marcas = this._mapaProblemas || {};
        let t = "";
        for (let i = 1; i <= n; i++) t += marcas[i] ? `<span class="${marcas[i]}">${i}</span>\n` : `<span>${i}</span>\n`;
        this.linhas.innerHTML = t + " ";
        this._n = n;
        this._marcasDesenhadas = this._marcas;
        this.linhaAtual = -1;
      }
      this.sincronizarRolagem();
      this.mostrarPosicao();
      if (!this.preview.hidden && this.lang.value !== "javascript") { clearTimeout(this._tp); this._tp = setTimeout(() => this.verResultado(), 500); }
    });
    clearTimeout(this._tl);
    this._tl = setTimeout(() => this.checarErros(), 800);
  },
  sincronizarRolagem() {
    this.cores.scrollTop = this.area.scrollTop;
    this.cores.scrollLeft = this.area.scrollLeft;
    this.linhas.scrollTop = this.area.scrollTop;
    if (!this.auto.hidden) this.posicionarAuto();
  },
  posicaoCursor() {
    const ate = this.area.value.slice(0, this.area.selectionStart);
    const linha = ate.split("\n").length;
    const col = ate.length - ate.lastIndexOf("\n");
    return { linha, col };
  },
  mostrarPosicao() {
    const { linha, col } = this.posicaoCursor();
    this.status.pos.textContent = `Ln ${linha}, Col ${col}`;
    if (linha !== this.linhaAtual) {
      const filhos = this.linhas.children;
      if (filhos[this.linhaAtual - 1]) filhos[this.linhaAtual - 1].classList.remove("atual");
      if (filhos[linha - 1]) filhos[linha - 1].classList.add("atual");
      this.linhaAtual = linha;
      const p = this.problemas.find(x => x.linha === linha);
      this.mostrarMsgProblema(p);
    }
  },
  checarErros() {
    const v = this.area.value;
    if (!WCDEV.revisor || !v.trim() || v.length > 60000) { this.problemas = []; }
    else {
      const r = WCDEV.revisor.analisar(v, this.lang.value);
      this.problemas = r ? r.problemas : [];
      // Pawn: também a análise de lógica/segurança (só o que é confirmado ou provável, pra não poluir)
      if (this.lang.value === "pawn" && WCDEV.analisador) {
        const a = WCDEV.analisador.analisar(v, "pawn");
        a.achados.filter(x => x.nivel === "erro" || x.nivel === "provavel").forEach(x => {
          if (!this.problemas.some(p => p.linha === x.linha)) this.problemas.push({ linha: x.linha, tipo: x.nivel === "erro" ? "erro" : "aviso", msg: `${x.titulo}. ${x.correcao}` });
        });
        this.problemas.sort((a, b) => a.linha - b.linha);
      }
    }
    const mapa = {};
    this.problemas.forEach(p => { if (mapa[p.linha] !== "erro") mapa[p.linha] = p.tipo === "erro" ? "erro" : "aviso"; });
    this._mapaProblemas = mapa;
    this._marcas = JSON.stringify(mapa);
    const erros = this.problemas.filter(p => p.tipo === "erro").length, avisos = this.problemas.length - erros;
    const b = this.status.problemas;
    b.className = "ed-prob " + (erros ? "tem-erro" : avisos ? "tem-aviso" : "ok");
    b.textContent = !v.trim() ? "✔ Pronto" : erros ? `✖ ${erros} erro${erros > 1 ? "s" : ""}${avisos ? ` · ⚠ ${avisos}` : ""}` : avisos ? `⚠ ${avisos} aviso${avisos > 1 ? "s" : ""}` : "✔ Sem problemas";
    if (this._marcas !== this._marcasDesenhadas) { this._n = -1; this.atualizar(); clearTimeout(this._tl); }
    this.linhaAtual = -1;
    this.mostrarPosicao();
  },
  mostrarMsgProblema(p) {
    const el = this.status.msg;
    if (!p) { el.hidden = true; return; }
    el.hidden = false;
    el.className = "ed-problema " + (p.tipo === "erro" ? "erro" : "aviso");
    el.innerHTML = `<b>Linha ${p.linha}:</b> ${formatar(p.msg).replace(/^<p>|<\/p>$/g, "")}`;
  },
  irProProblema() {
    if (!this.problemas.length) return;
    const atual = this.posicaoCursor().linha;
    const p = this.problemas.find(x => x.linha > atual) || this.problemas[0];
    this.irParaLinha(p.linha);
  },
  irParaLinha(n) {
    const linhas = this.area.value.split("\n");
    let pos = 0;
    for (let i = 0; i < n - 1 && i < linhas.length; i++) pos += linhas[i].length + 1;
    this.area.focus();
    this.area.setSelectionRange(pos, pos + (linhas[n - 1] || "").length);
    const alturaLinha = this.fonte * 1.6;
    this.area.scrollTop = Math.max(0, (n - 4) * alturaLinha);
    this.mostrarPosicao();
  },

  /* ================= EDIÇÃO (com Ctrl+Z funcionando) ================= */
  inserir(texto, ini = this.area.selectionStart, fim = this.area.selectionEnd) {
    const a = this.area;
    a.focus();
    a.setSelectionRange(ini, fim);
    // execCommand mantém o "desfazer" do navegador; se não der, usa o jeito normal
    let ok = false;
    this._inserindo = true;
    try { ok = document.execCommand("insertText", false, texto); } catch (e) { ok = false; }
    if (!ok || a.value.slice(ini, ini + texto.length) !== texto) {
      a.setRangeText(texto, ini, fim, "end");
      a.dispatchEvent(new Event("input"));
    }
    this._inserindo = false;
  },
  selecionarTudo() { this.area.setSelectionRange(0, this.area.value.length); },
  // insere um modelo: $0 marca onde o cursor fica; cada linha ganha o recuo da linha atual
  inserirModelo(modelo, ini, fim) {
    const v = this.area.value;
    const comeco = v.lastIndexOf("\n", ini - 1) + 1;
    const recuo = (v.slice(comeco, ini).match(/^\s*/) || [""])[0];
    let txt = modelo.replace(/\n/g, "\n" + recuo);
    // $[nome] = já deixa "nome" selecionado pra você só digitar por cima
    const marca = txt.match(/\$\[([^\]]*)\]/);
    let selIni, selFim;
    if (marca) {
      selIni = marca.index; selFim = marca.index + marca[1].length;
      txt = txt.replace(marca[0], marca[1]);
    } else {
      const cursor = txt.indexOf("$0");
      txt = txt.replace("$0", "");
      selIni = selFim = cursor >= 0 ? cursor : txt.length;
    }
    this.inserir(txt, ini, fim);
    this.area.setSelectionRange(ini + selIni, ini + selFim);
    this.mostrarPosicao();
  },
  digitarPar(k) {
    const pares = { "{": "}", "(": ")", "[": "]", '"': '"' };
    const a = this.area, ini = a.selectionStart, fim = a.selectionEnd;
    if (pares[k]) {
      const sel = a.value.slice(ini, fim);
      this.inserir(k + sel + pares[k], ini, fim);
      a.setSelectionRange(ini + 1, ini + 1 + sel.length);
    } else this.inserir(k);
  },

  linhasSelecionadas() {
    const a = this.area, v = a.value;
    const ini = v.lastIndexOf("\n", a.selectionStart - 1) + 1;
    let fim = v.indexOf("\n", a.selectionEnd - (a.selectionEnd > a.selectionStart && v[a.selectionEnd - 1] === "\n" ? 1 : 0));
    if (fim < 0) fim = v.length;
    return { ini, fim, texto: v.slice(ini, fim) };
  },
  comentar() {
    const marca = { pawn: "//", python: "#", css: null, html: null, javascript: "//" }[this.lang.value];
    const { ini, fim, texto } = this.linhasSelecionadas();
    let novo;
    if (marca) {
      const linhas = texto.split("\n");
      const todas = linhas.filter(l => l.trim()).every(l => l.trim().startsWith(marca));
      novo = linhas.map(l => !l.trim() ? l : todas ? l.replace(new RegExp("^(\\s*)" + marca.replace(/\//g, "\\/") + " ?"), "$1") : l.replace(/^(\s*)/, `$1${marca} `)).join("\n");
    } else {
      const [abre, fecha] = this.lang.value === "css" ? ["/* ", " */"] : ["<!-- ", " -->"];
      const t = texto.trim();
      novo = t.startsWith(abre.trim()) && t.endsWith(fecha.trim())
        ? texto.replace(abre.trim() + " ", "").replace(abre.trim(), "").replace(" " + fecha.trim(), "").replace(fecha.trim(), "")
        : texto.replace(/^(\s*)([\s\S]*)$/, `$1${abre}$2${fecha}`);
    }
    this.inserir(novo, ini, fim);
    this.area.setSelectionRange(ini, ini + novo.length);
  },
  duplicar() {
    const { fim, texto } = this.linhasSelecionadas();
    const col = this.area.selectionStart;
    this.inserir("\n" + texto, fim, fim);
    const p = col + texto.length + 1;
    this.area.setSelectionRange(p, p);
  },
  moverLinha(dir) {
    const a = this.area, v = a.value;
    const { ini, fim, texto } = this.linhasSelecionadas();
    const cIni = a.selectionStart - ini, cFim = a.selectionEnd - ini;
    if (dir < 0) {
      if (ini === 0) return;
      const iniAnt = v.lastIndexOf("\n", ini - 2) + 1;
      const ant = v.slice(iniAnt, ini - 1);
      this.inserir(texto + "\n" + ant, iniAnt, fim);
      a.setSelectionRange(iniAnt + cIni, iniAnt + cFim);
    } else {
      if (fim >= v.length) return;
      let fimProx = v.indexOf("\n", fim + 1);
      if (fimProx < 0) fimProx = v.length;
      const prox = v.slice(fim + 1, fimProx);
      this.inserir(prox + "\n" + texto, ini, fimProx);
      const novoIni = ini + prox.length + 1;
      a.setSelectionRange(novoIni + cIni, novoIni + cFim);
    }
  },

  /* ================= FORMATAR (arrumar recuo) ================= */
  formatar() {
    const l = this.lang.value, v = this.area.value;
    if (!v.trim()) return;
    let saida;
    if (l === "python") {
      // em Python o recuo faz parte da lógica: só troca TAB por 4 espaços e limpa espaços no fim
      saida = v.split("\n").map(x => x.replace(/\t/g, "    ").replace(/\s+$/, "")).join("\n");
    } else if (l === "html") {
      const VAZIAS = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr|!doctype)$/i;
      let prof = 0;
      saida = v.split("\n").map(bruta => {
        const x = bruta.trim();
        if (!x) return "";
        const abre = [...x.matchAll(/<([a-zA-Z!][\w-]*)[^>]*?(\/?)>/g)].filter(m => !VAZIAS.test(m[1]) && !m[2] && !m[1].startsWith("!")).length;
        const fecha = (x.match(/<\/[\w-]+\s*>/g) || []).length;
        const comecaFechando = /^<\//.test(x);
        if (comecaFechando) prof = Math.max(0, prof - 1);
        const linha = "    ".repeat(prof) + x;
        prof = Math.max(0, prof + abre - fecha + (comecaFechando ? 1 : 0));
        return linha;
      }).join("\n");
    } else {
      // Pawn e CSS: recuo pelas chaves { }
      let prof = 0, emComentario = false;
      saida = v.split("\n").map(bruta => {
        const x = bruta.trim();
        if (!x) return "";
        if (/^#/.test(x)) return x;   // #include, #define ficam no começo
        let limpo = x.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""');
        if (emComentario) { if (limpo.includes("*/")) { emComentario = false; limpo = limpo.slice(limpo.indexOf("*/") + 2); } else return "    ".repeat(prof) + x; }
        limpo = limpo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/, "");
        if (/\/\*/.test(limpo)) { emComentario = true; limpo = limpo.slice(0, limpo.indexOf("/*")); }
        const fechaAntes = (limpo.match(/^[}\]]+/) || [""])[0].length;
        prof = Math.max(0, prof - fechaAntes);
        const extra = /^case\b|^default\b/.test(x) ? 0 : 0;
        const linha = "    ".repeat(prof + extra) + x;
        const abre = (limpo.match(/[{\[]/g) || []).length, fecha = (limpo.match(/[}\]]/g) || []).length - fechaAntes;
        prof = Math.max(0, prof + abre - fecha);
        return linha;
      }).join("\n");
    }
    if (saida === v) { this.aviso("✨ O código já está arrumadinho!"); return; }
    const pos = this.area.selectionStart;
    this.selecionarTudo();
    this.inserir(saida);
    this.area.setSelectionRange(Math.min(pos, saida.length), Math.min(pos, saida.length));
    this.aviso("✨ Código formatado!");
  },

  /* ================= MODELOS ================= */
  menuModelos() {
    const menu = document.getElementById("edMenuModelos");
    if (!menu.hidden) { menu.hidden = true; return; }
    const lista = this.MODELOS[this.lang.value] || [];
    menu.innerHTML = `<div class="ed-menu-titulo">Modelos de ${NOMES[this.lang.value]} <small>(ou digite o atalho + Tab)</small></div>` +
      lista.map(([atalho, nome], i) => `<button data-i="${i}"><span>${Util.esc(nome)}</span><kbd>${atalho}</kbd></button>`).join("");
    menu.hidden = false;
    menu.querySelectorAll("button").forEach(b => (b.onclick = () => {
      menu.hidden = true;
      const [, , modelo] = lista[+b.dataset.i];
      const a = this.area;
      this.inserirModelo(modelo, a.selectionStart, a.selectionEnd);
    }));
  },

  /* ================= AUTOCOMPLETAR ================= */
  dicionario() {
    if (this._dic && this._dicLang === this.lang.value) return this._dic;
    const l = this.lang.value;
    const itens = new Map();
    const add = (nome, tipo, desc, extra) => { if (nome && !itens.has(nome)) itens.set(nome, { nome, tipo, desc: desc || "", extra }); };
    (this.MODELOS[l] || []).forEach(([atalho, nome, modelo]) => add(atalho, "modelo", nome, modelo));
    WCDEV.temas.forEach(t => {
      if (!t.ref || t.lang !== l) return;
      let nome = t.titulo;
      if (l === "html") { const m = nome.match(/^<([\w-]+)>$/); if (!m) return; nome = m[1]; }
      else if (l === "python") nome = nome.replace(/\(.*$/, "");
      if (!/^[A-Za-z_@-][\w.@-]*$/.test(nome) || nome.length < 2) return;
      const desc = WCDEV.cerebro ? WCDEV.cerebro.frase(t).replace(/\*\*|\{\{|\}\}/g, "") : "";
      add(nome, /^On[A-Z]/.test(nome) ? "callback" : l === "css" ? "propriedade" : l === "html" ? "tag" : "função", desc);
    });
    const kws = {
      pawn: "new static const stock public forward enum if else for while switch case default return break continue sizeof true false MAX_PLAYERS INVALID_PLAYER_ID Float bool",
      python: "def class return import from while for if elif else try except finally with as lambda True False None print input range len self",
      html: "div span section header footer main article nav p h1 h2 h3 a img ul ol li button form input label table",
      css: "display position color background margin padding border width height font-size flex grid justify-content align-items gap",
      javascript: "const let function return if else for while switch case break continue async await try catch new class true false null undefined console document addEventListener querySelector getElementById textContent length push map filter forEach reduce JSON localStorage setTimeout",
    }[l].split(" ");
    kws.forEach(k => add(k, "palavra", ""));
    this._dic = [...itens.values()];
    this._dicLang = l;
    return this._dic;
  },
  palavraAtual(paraModelo) {
    const a = this.area, v = a.value, fim = a.selectionStart;
    if (a.selectionStart !== a.selectionEnd) return null;
    const re = paraModelo ? /\w+$/ : this.lang.value === "css" ? /[\w-]+$/ : this.lang.value === "pawn" ? /[\w@]+$/ : /[\w.]+$/;
    const m = v.slice(Math.max(0, fim - 60), fim).match(re);
    if (!m) return null;
    if (paraModelo) return { texto: m[0], ini: fim - m[0].length, fim };
    if (this.lang.value === "html" && !/<\/?[\w-]*$/.test(v.slice(Math.max(0, fim - 60), fim))) return null;
    return { texto: m[0], ini: fim - m[0].length, fim };
  },
  sugerir(forcar) {
    const p = this.palavraAtual();
    if (!p || (!forcar && p.texto.length < 2) || /^\d/.test(p.texto)) return this.fecharAuto();
    // não sugere dentro de comentário ou texto
    const linha = this.area.value.slice(this.area.value.lastIndexOf("\n", p.ini - 1) + 1, p.ini);
    if (/\/\/|#\s|(^|[^\\])"[^"]*$/.test(linha) && this.lang.value !== "css") return this.fecharAuto();
    const busca = p.texto.toLowerCase();
    const dic = this.dicionario();
    // palavras que você já escreveu no código também entram
    const doCodigo = new Set((this.area.value.match(/[A-Za-z_][\w]{2,}/g) || []).slice(0, 3000));
    doCodigo.delete(p.texto);
    const achados = [];
    for (const it of dic) {
      const n = it.nome.toLowerCase();
      if (n === busca) continue;
      if (n.startsWith(busca)) achados.push([it, 0 + (it.tipo === "modelo" ? -1 : 0)]);
      else if (busca.length >= 3 && n.includes(busca)) achados.push([it, 2]);
    }
    doCodigo.forEach(w => { const n = w.toLowerCase(); if (n.startsWith(busca) && n !== busca && !dic.some(d => d.nome === w)) achados.push([{ nome: w, tipo: "seu código", desc: "" }, 1]); });
    achados.sort((a, b) => a[1] - b[1] || a[0].nome.length - b[0].nome.length);
    const lista = achados.slice(0, 8).map(x => x[0]);
    if (!lista.length) return this.fecharAuto();
    this.autoLista = lista; this.autoSel = 0; this.autoPalavra = p;
    this.desenharAuto();
  },
  desenharAuto() {
    const icone = { "modelo": "🧩", "função": "ƒ", "callback": "⚡", "propriedade": "◆", "tag": "‹›", "palavra": "◇", "seu código": "✎" };
    const it = this.autoLista[this.autoSel];
    this.auto.innerHTML = `<ul>${this.autoLista.map((x, i) => `<li data-i="${i}" class="${i === this.autoSel ? "sel" : ""}"><i>${icone[x.tipo] || "·"}</i><b>${Util.esc(x.nome)}</b><small>${x.tipo === "modelo" ? Util.esc(x.desc) : x.tipo}</small></li>`).join("")}</ul>` +
      (it && it.desc && it.tipo !== "modelo" ? `<div class="ed-auto-desc">${Util.esc(it.desc.slice(0, 150))}</div>` : "") +
      `<div class="ed-auto-dica">Tab/Enter escolhe · Esc fecha</div>`;
    this.auto.hidden = false;
    this.posicionarAuto();
  },
  posicionarAuto() {
    const { linha, col } = this.posicaoCursor();
    const alt = this.fonte * 1.6, larg = this.larguraLetra();
    let top = 14 + linha * alt - this.area.scrollTop + 4;
    let left = 14 + (col - 1 - (this.autoPalavra ? this.autoPalavra.texto.length : 0)) * larg - this.area.scrollLeft;
    const campo = this.area.clientWidth, altura = this.area.clientHeight;
    left = Math.max(4, Math.min(left, campo - 270));
    if (top + 200 > altura && top - alt - 210 > 0) top = top - alt - 214;
    this.auto.style.transform = `translate(${left}px, ${top}px)`;
  },
  larguraLetra() {
    if (this._larg && this._largFonte === this.fonte) return this._larg;
    const s = document.createElement("span");
    s.className = "ed-medida";
    s.textContent = "0".repeat(50);
    this.cores.parentNode.appendChild(s);
    this._larg = (s.getBoundingClientRect().width / 50) || this.fonte * 0.6;
    this._largFonte = this.fonte;
    s.remove();
    return this._larg;
  },
  fecharAuto() { if (this.auto && !this.auto.hidden) { this.auto.hidden = true; this.autoLista = null; } },
  aceitarAuto() {
    const it = this.autoLista && this.autoLista[this.autoSel];
    if (!it) return false;
    const p = this.autoPalavra;
    this.fecharAuto();
    if (it.tipo === "modelo") { this.inserirModelo(it.extra, p.ini, p.fim); return true; }
    const v = this.area.value;
    const antes = v.slice(v.lastIndexOf("\n", p.ini - 1) + 1, p.ini);
    const depois = v[p.fim] || "";
    // callback depois de "public": monta o bloco todo
    if (this.lang.value === "pawn" && it.tipo === "callback" && /^\s*(public|forward)\s+$/.test(antes) && this.CALLBACKS[it.nome] !== undefined) {
      const forward = /forward\s+$/.test(antes);
      this.inserirModelo(forward ? `${it.nome}(${this.CALLBACKS[it.nome]});$0` : `${it.nome}(${this.CALLBACKS[it.nome]})\n{\n    $0\n    return 1;\n}`, p.ini, p.fim);
      return true;
    }
    if (it.tipo === "função" && depois !== "(" && this.lang.value !== "css") { this.inserirModelo(it.nome + "($0)", p.ini, p.fim); return true; }
    if (it.tipo === "propriedade" && depois !== ":") { this.inserirModelo(it.nome + ": $0;", p.ini, p.fim); return true; }
    if (it.tipo === "tag" && this.lang.value === "html" && /<$/.test(antes)) {
      const vazia = /^(img|br|hr|input|meta|link|source)$/.test(it.nome);
      this.inserirModelo(vazia ? `${it.nome} $0>` : `${it.nome}>$0</${it.nome}>`, p.ini, p.fim);
      return true;
    }
    this.inserir(it.nome, p.ini, p.fim);
    return true;
  },

  /* ================= TECLADO ================= */
  teclas(e) {
    const a = this.area;
    const ini = a.selectionStart, fim = a.selectionEnd, v = a.value;
    const ctrl = e.ctrlKey || e.metaKey;

    // autocompletar aberto
    if (!this.auto.hidden && this.autoLista) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const n = this.autoLista.length;
        this.autoSel = (this.autoSel + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
        this.desenharAuto();
        return;
      }
      if ((e.key === "Tab" || e.key === "Enter") && !e.shiftKey && !ctrl) { e.preventDefault(); this.aceitarAuto(); return; }
      if (e.key === "Escape") { e.preventDefault(); this.fecharAuto(); return; }
    }

    if (ctrl && e.key === "Enter") { e.preventDefault(); this.enviar(Treino.ativo ? "treino" : "revisar"); return; }
    if (ctrl && (e.key === " " || e.code === "Space")) { e.preventDefault(); this.sugerir(true); return; }
    if (ctrl && (e.key === "/" || e.code === "Slash")) { e.preventDefault(); this.comentar(); return; }
    if (ctrl && e.key.toLowerCase() === "d") { e.preventDefault(); this.duplicar(); return; }
    if (ctrl && e.key.toLowerCase() === "s") { e.preventDefault(); this.salvarRascunho(true); this.aviso("💾 Rascunho salvo neste aparelho"); return; }
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === "f") { e.preventDefault(); this.formatar(); return; }
    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); this.moverLinha(e.key === "ArrowUp" ? -1 : 1); return; }
    if (e.key === "Escape" && this.noCelular()) { this.fechar(); return; }

    if (e.key === "Tab") {
      e.preventDefault();
      // atalho de modelo: "cmd" + Tab
      if (!e.shiftKey && ini === fim) {
        const p = this.palavraAtual(true);
        const mod = p && (this.MODELOS[this.lang.value] || []).find(m => m[0] === p.texto);
        if (mod) { this.inserirModelo(mod[2], p.ini, p.fim); return; }
      }
      const varias = v.slice(ini, fim).includes("\n");
      if (e.shiftKey || varias) {
        const { ini: li, fim: lf, texto } = this.linhasSelecionadas();
        const novo = texto.split("\n").map(l => e.shiftKey ? l.replace(/^( {1,4}|\t)/, "") : "    " + l).join("\n");
        this.inserir(novo, li, lf);
        a.setSelectionRange(li, li + novo.length);
      } else {
        this.inserir("    ");
      }
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !ctrl && !e.altKey) {
      e.preventDefault();
      const comeco = v.lastIndexOf("\n", ini - 1) + 1;
      const linha = v.slice(comeco, ini);
      const recuo = linha.match(/^\s*/)[0];
      const antes = linha.trimEnd();
      const depois = v.slice(fim, fim + 1);
      const abreBloco = /[{(\[:]$/.test(antes) || /<([a-z][\w-]*)[^/>]*>$/i.test(antes) && !/^(img|br|hr|input|meta|link)$/i.test((antes.match(/<([a-z][\w-]*)[^>]*>$/i) || [])[1] || "");
      if (abreBloco) {
        const extra = recuo + "    ";
        const fechaJunto = (antes.endsWith("{") && depois === "}") || (antes.endsWith("(") && depois === ")") || (antes.endsWith("[") && depois === "]") || (antes.endsWith(">") && v.slice(fim, fim + 2) === "</");
        if (fechaJunto) {
          this.inserir("\n" + extra + "\n" + recuo, ini, fim);
          a.setSelectionRange(ini + 1 + extra.length, ini + 1 + extra.length);
        } else {
          this.inserir("\n" + extra, ini, fim);
        }
      } else {
        this.inserir("\n" + recuo, ini, fim);
      }
      return;
    }
    // apagar par vazio: (|) -> apaga os dois
    if (e.key === "Backspace" && ini === fim && ini > 0) {
      const par = v[ini - 1] + (v[ini] || "");
      if (["()", "[]", "{}", '""', "''"].includes(par)) { e.preventDefault(); this.inserir("", ini - 1, ini + 1); return; }
      // apaga 4 espaços de uma vez no recuo
      const linha = v.slice(v.lastIndexOf("\n", ini - 1) + 1, ini);
      if (linha.length >= 4 && /^ +$/.test(linha)) { e.preventDefault(); const tira = linha.length % 4 || 4; this.inserir("", ini - tira, ini); return; }
    }
    // fecha chaves/parênteses/aspas automaticamente (e envolve a seleção)
    const pares = { "{": "}", "(": ")", "[": "]", '"': '"' };
    if (pares[e.key] && !ctrl) {
      const prox = v[ini] || "";
      if (e.key === '"' && prox === '"' && ini === fim) { e.preventDefault(); a.setSelectionRange(ini + 1, ini + 1); return; }
      if (ini !== fim || e.key !== '"' || !/\w/.test(v[ini - 1] || "")) {
        if (ini === fim && /\w/.test(prox)) return;   // antes de uma palavra, não fecha
        e.preventDefault();
        this.digitarPar(e.key);
      }
      return;
    }
    if ([")", "]", "}"].includes(e.key) && v[ini] === e.key && ini === fim) {
      e.preventDefault();
      a.setSelectionRange(ini + 1, ini + 1);
      return;
    }
    // HTML: ao fechar "<div>" já escreve o "</div>"
    if (e.key === ">" && ini === fim && this.lang.value === "html") {
      const m = v.slice(Math.max(0, ini - 200), ini).match(/<([a-zA-Z][\w-]*)(\s[^<>]*)?$/);
      if (m && !/\/$/.test(m[0]) && !/^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i.test(m[1]) && v.slice(ini, ini + m[1].length + 2) !== "</" + m[1]) {
        e.preventDefault();
        this.inserir("></" + m[1] + ">", ini, fim);
        this.area.setSelectionRange(ini + 1, ini + 1);
        return;
      }
    }
    // "}" numa linha só com espaços: volta o recuo
    if (e.key === "}" && ini === fim) {
      const comeco = v.lastIndexOf("\n", ini - 1) + 1;
      const linha = v.slice(comeco, ini);
      if (/^ {4,}$/.test(linha)) { e.preventDefault(); this.inserir(linha.slice(4) + "}", comeco, ini); }
    }
  },

  /* ================= ARQUIVOS ================= */
  abrirArquivo(arq) {
    if (!arq) return;
    if (arq.size > 2 * 1024 * 1024) { this.aviso("Arquivo grande demais (máx. 2 MB)"); return; }
    const ext = (arq.name.split(".").pop() || "").toLowerCase();
    const lang = { pwn: "pawn", inc: "pawn", p: "pawn", py: "python", html: "html", htm: "html", css: "css", js: "javascript", mjs: "javascript" }[ext];
    const leitor = new FileReader();
    leitor.onload = () => {
      if (lang) this.lang.value = lang;
      this.atualizarBotoes();
      this.selecionarTudo();
      this.inserir(String(leitor.result).replace(/\r\n/g, "\n"));
      this.area.setSelectionRange(0, 0);
      this.area.scrollTop = 0;
      this.status.arquivo.textContent = arq.name;
      this.aviso(`📂 ${arq.name} aberto`);
    };
    leitor.readAsText(arq);
    document.getElementById("edArquivo").value = "";
  },
  baixar() {
    const v = this.area.value;
    if (!v.trim()) { this.aviso("Não tem código pra baixar ainda"); return; }
    const nome = /\.\w+$/.test(this.status.arquivo.textContent) ? this.status.arquivo.textContent : "main." + this.EXT[this.lang.value];
    const url = URL.createObjectURL(new Blob([v], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = nome;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    this.aviso(`💾 Baixando ${nome}`);
  },

  /* ================= PROJETO (vários arquivos) ================= */
  projeto: null,   // { nome, arquivos: Map(caminho -> código), atual }
  lerArquivosProjeto(lista) {
    const arqs = [...(lista || [])].filter(f => /\.(pwn|inc|p)$/i.test(f.name));
    if (!arqs.length) { this.aviso("Nenhum .pwn/.inc nessa seleção"); return; }
    const total = arqs.reduce((s, f) => s + f.size, 0);
    if (total > 8 * 1024 * 1024) { this.aviso("Projeto grande demais (máx. 8 MB)"); return; }
    // caminho relativo: tira a pasta de cima ("gamemodes/") pra os #include "x/y.inc" baterem
    const caminhos = arqs.map(f => (f.webkitRelativePath || f.name).replace(/\\/g, "/"));
    const topo = caminhos.every(c => c.includes("/")) && new Set(caminhos.map(c => c.split("/")[0])).size === 1 ? caminhos[0].split("/")[0] + "/" : "";
    Promise.all(arqs.map((f, i) => new Promise(ok => { const r = new FileReader(); r.onload = () => ok([caminhos[i].slice(topo.length), String(r.result).replace(/\r\n?/g, "\n")]); r.onerror = () => ok(null); r.readAsText(f); })))
      .then(pares => this.abrirProjeto(Object.fromEntries(pares.filter(Boolean)), topo.replace(/\/$/, "") || "projeto"));
  },
  abrirProjeto(arquivos, nome) {
    const mapa = new Map(Object.entries(arquivos));
    if (!mapa.size) return;
    this.projeto = { nome: nome || "projeto", arquivos: mapa, atual: null };
    const principal = WCDEV.projeto ? WCDEV.projeto.principaisDe(mapa)[0] : [...mapa.keys()][0];
    this.lang.value = "pawn";
    this.atualizarBotoes();
    this.trocarArquivo(principal || [...mapa.keys()][0]);
    this.desenharAbas();
    this.salvarProjeto();
    this.aviso(`📁 ${mapa.size} arquivo(s) abertos`);
  },
  desenharAbas() {
    const el = document.getElementById("edAbas");
    const p = this.projeto;
    el.hidden = !p;
    document.getElementById("btnAnalisarProj").hidden = !p;
    document.getElementById("btnCorrigirProj").hidden = !p;
    if (!p) { el.innerHTML = ""; return; }
    el.innerHTML = [...p.arquivos.keys()].sort().map(k => `<button role="tab" aria-selected="${k === p.atual}" class="ed-aba${k === p.atual ? " on" : ""}" data-arq="${k.replace(/"/g, "&quot;")}" title="${k.replace(/"/g, "&quot;")}">${k.split("/").pop().replace(/</g, "&lt;")}</button>`).join("");
  },
  salvarArquivoAtual() { if (this.projeto && this.projeto.atual) { this.projeto.arquivos.set(this.projeto.atual, this.area.value); this.salvarProjeto(); } },
  trocarArquivo(nome) {
    const p = this.projeto;
    if (!p || !p.arquivos.has(nome)) return;
    if (p.atual && p.atual !== nome) p.arquivos.set(p.atual, this.area.value);
    p.atual = nome;
    this._carregandoProjeto = true;
    this.area.value = p.arquivos.get(nome);
    this._carregandoProjeto = false;
    this.status.arquivo.textContent = nome;
    this.area.setSelectionRange(0, 0); this.area.scrollTop = 0;
    this.atualizar();
    this.desenharAbas();
  },
  fecharProjeto() {
    if (!this.projeto) return;
    this.salvarArquivoAtual();
    this.projeto = null;
    try { localStorage.removeItem(chaveDoUsuario("projeto")); } catch (e) { /* sem armazenamento */ }
    this.desenharAbas();
    this.status.arquivo.textContent = "main." + this.EXT[this.lang.value];
    this.carregarRascunho();
    this.aviso("Projeto fechado (os arquivos do seu PC não foram mexidos)");
  },
  salvarProjeto() {
    clearTimeout(this._tp);
    this._tp = setTimeout(() => {
      if (!this.projeto) return;
      const obj = { nome: this.projeto.nome, atual: this.projeto.atual, arquivos: Object.fromEntries(this.projeto.arquivos) };
      try { const j = JSON.stringify(obj); if (j.length < 1500000) localStorage.setItem(chaveDoUsuario("projeto"), j); } catch (e) { /* projeto grande: fica só nesta sessão */ }
    }, 500);
  },
  carregarProjetoSalvo() {
    try { const j = JSON.parse(localStorage.getItem(chaveDoUsuario("projeto")) || "null"); if (j && j.arquivos) { this.abrirProjeto(j.arquivos, j.nome); if (j.atual) this.trocarArquivo(j.atual); } } catch (e) { /* nada salvo */ }
  },

  /* ================= LETRA / AVISOS ================= */
  mudarFonte(d) {
    this.fonte = Math.max(11, Math.min(22, this.fonte + d));
    Guardar.salvar("wcdev_editor_fonte", this.fonte);
    this.aplicarFonte();
  },
  aplicarFonte() {
    document.getElementById("editorArea").style.setProperty("--ed-fonte", this.fonte + "px");
    this._larg = null;
  },
  aviso(texto) {
    const el = document.getElementById("edAviso");
    el.textContent = texto;
    el.classList.add("mostrar");
    clearTimeout(this._ta);
    this._ta = setTimeout(() => el.classList.remove("mostrar"), 1800);
  },

  /* ================= RASCUNHO (salvo por linguagem) ================= */
  salvarRascunho(agora) {
    if (Treino.ativo) return;   // rascunho do treino não precisa ficar
    if (this.projeto) { if (!this._carregandoProjeto) { this.projeto.arquivos.set(this.projeto.atual, this.area.value); this.salvarProjeto(); } return; }
    clearTimeout(this._t);
    const gravar = () => {
      const r = Guardar.ler(chaveDoUsuario("rascunhos"), {});
      r[this.lang.value] = this.area.value;
      Guardar.salvar(chaveDoUsuario("rascunhos"), r);
    };
    if (agora === true) gravar(); else this._t = setTimeout(gravar, 400);
  },
  carregarRascunho() {
    const r = Guardar.ler(chaveDoUsuario("rascunhos"), {});
    this.area.value = r[this.lang.value] || "";
    this.atualizar();
    this.esconderPreview();
  },
};

WCDEV.editor = Editor;
