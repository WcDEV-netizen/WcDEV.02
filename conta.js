/* =========================================================
   WC DEV — CONTA, PLANOS E CONVERSAS SALVAS
   - Login com nome e senha (salvo neste aparelho)
   - Planos: o cliente gera um pedido, paga o PIX e manda o comprovante
   - O dono confere no PAINEL DE ADMIN e envia um código de ativação
   - O código é assinado: só o painel do dono consegue criar um válido
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const CONFIG = {
  pix: "wadellencesar4@gmail.com",               // chave PIX
  recebedor: "Wadillen Cesar da Silva",          // nome que aparece no comprovante
  contato: "wadellencesar2@gmail.com",           // pra onde o cliente manda o comprovante
  whatsapp: "",                                  // opcional: seu WhatsApp com DDI+DDD, só números (ex: "5511987654321")
  planos: [
    { id: "p10", nome: "10 dias", dias: 10, valor: 30 },
    { id: "p20", nome: "20 dias", dias: 20, valor: 60 },
    { id: "p30", nome: "1 mês", dias: 30, valor: 100, destaque: true },
  ],
  // chave PÚBLICA: só confere códigos. A privada fica no painel de admin.
  chavePublica: { kty: "EC", crv: "P-256", x: "hqVjTJTmZ0BcxQpDLK20GwAAsZxO0AuqFF_8ugeu_oc", y: "mt2DQCcF7hL_dLJcv4914v0P3smJnBAtzJG4jX0g5E0" },
};

/* ---------- utilidades ---------- */
const Util = {
  b64url(texto) {
    const bytes = new TextEncoder().encode(texto);
    let bin = "";
    bytes.forEach(b => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  deB64url(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const bin = atob(s);
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  },
  bytesDeB64url(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return Uint8Array.from(atob(s), c => c.charCodeAt(0));
  },
  async sha256(texto) {
    const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
    return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("");
  },
  usuario(nome) {   // forma "padrão" do nome (sem acento, minúsculo)
    return nome.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
  },
  esc(t) { return String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); },
  dinheiro(v) { return "R$ " + Number(v).toFixed(2).replace(".", ","); },
  dataHora(ms) { return new Date(ms).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); },
  cripto() { return !!(window.crypto && crypto.subtle); },
};

/* ---------- guardar por usuário ---------- */
function chaveDoUsuario(nome) {
  return "wcdev_" + (Conta.atual ? Conta.atual.u : "anonimo") + "_" + nome;
}

/* =========================================================
   CONTA
   ========================================================= */
const Conta = {
  atual: null,   // { u, nome }
  contas() { return Guardar.ler("wcdev_contas", {}); },

  async cadastrar(nome, senha) {
    nome = nome.trim();
    if (nome.length < 3 || nome.length > 20) return "O nome precisa ter de 3 a 20 letras.";
    if (senha.length < 4) return "A senha precisa ter pelo menos 4 caracteres.";
    const u = Util.usuario(nome);
    const contas = this.contas();
    if (contas[u]) return "Já existe uma conta com esse nome neste aparelho. Use \"Entrar\".";
    const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
    contas[u] = { nome, salt, hash: await Util.sha256(salt + ":" + senha), criadoEm: Date.now() };
    if (!Guardar.salvar("wcdev_contas", contas)) return "Seu navegador não deixou salvar a conta.";
    this.logar(u, nome);
    return null;
  },

  async entrar(nome, senha) {
    const u = Util.usuario(nome);
    const conta = this.contas()[u];
    if (!conta) return "Conta não encontrada neste aparelho. Crie uma em \"Criar conta\".";
    if ((await Util.sha256(conta.salt + ":" + senha)) !== conta.hash) return "Senha errada.";
    this.logar(u, conta.nome);
    return null;
  },

  logar(u, nome) {
    this.atual = { u, nome };
    Guardar.salvar("wcdev_sessao", u);
  },

  restaurarSessao() {
    const u = Guardar.ler("wcdev_sessao", null);
    const conta = u && this.contas()[u];
    if (conta) this.atual = { u, nome: conta.nome };
    return !!this.atual;
  },

  sair() {
    Historico.gravar();
    Historico._cache = null;
    this.atual = null;
    try { localStorage.removeItem("wcdev_sessao"); } catch (e) {}
  },
};

/* =========================================================
   LICENÇA (tempo de uso)
   ========================================================= */
const Licenca = {
  async verificarCodigo(codigo) {
    codigo = codigo.trim().replace(/\s+/g, "");
    const m = codigo.match(/^WC1-([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/);
    if (!m) return { erro: "Código em formato inválido. Ele começa com WC1- e tem um ponto no meio." };
    let dados;
    try { dados = JSON.parse(Util.deB64url(m[1])); } catch (e) { return { erro: "Código inválido." }; }
    try {
      const chave = await crypto.subtle.importKey("jwk", CONFIG.chavePublica, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
      const ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, chave, Util.bytesDeB64url(m[2]), new TextEncoder().encode(m[1]));
      if (!ok) return { erro: "Código inválido (assinatura não confere)." };
    } catch (e) { return { erro: "Não consegui conferir o código neste navegador." }; }
    if (dados.u !== Conta.atual.u) return { erro: `Esse código foi gerado pra outra conta (${Util.esc(dados.u)}). Entre com a conta certa.` };
    return { dados, codigo };
  },

  async ativar(codigo) {
    const r = await this.verificarCodigo(codigo);
    if (r.erro) return r.erro;
    if (r.dados.e <= Date.now()) return "Esse código já venceu.";
    const atual = Guardar.ler(chaveDoUsuario("licenca"), null);
    if (!atual || r.dados.e > atual.e) Guardar.salvar(chaveDoUsuario("licenca"), { codigo: r.codigo, e: r.dados.e, d: r.dados.d, i: r.dados.i });
    Guardar.salvar(chaveDoUsuario("pedido"), null);
    return null;
  },

  // { ok, dias, expira, motivo }
  async status() {
    const lic = Guardar.ler(chaveDoUsuario("licenca"), null);
    const agora = Date.now();
    // relógio do aparelho voltou no tempo?
    const visto = Guardar.ler(chaveDoUsuario("relogio"), 0);
    if (agora + 10 * 60000 < visto) return { ok: false, motivo: "relogio" };
    Guardar.salvar(chaveDoUsuario("relogio"), Math.max(visto, agora));
    if (!lic) return { ok: false, motivo: "sem" };
    const r = await this.verificarCodigo(lic.codigo);
    if (r.erro) return { ok: false, motivo: "invalida" };
    if (r.dados.e <= agora) return { ok: false, motivo: "vencida", expira: r.dados.e };
    return { ok: true, expira: r.dados.e, dias: Math.ceil((r.dados.e - agora) / 86400000) };
  },
};

/* =========================================================
   PEDIDO (cliente escolhe plano e paga)
   ========================================================= */
const Pedido = {
  criar(plano) {
    const p = {
      i: "WC-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase(),
      u: Conta.atual.u, n: Conta.atual.nome, pl: plano.nome, d: plano.dias, v: plano.valor, c: Date.now(),
    };
    Guardar.salvar(chaveDoUsuario("pedido"), p);
    return p;
  },
  atual() { return Guardar.ler(chaveDoUsuario("pedido"), null); },
  codigo(p) { return "PED-" + Util.b64url(JSON.stringify(p)); },
};

/* =========================================================
   TELAS (login, planos, pagamento)
   ========================================================= */
const TelaConta = {
  el: null,
  aoLiberar: null,

  mostrar(html) {
    this.el.innerHTML = `<div class="cartao-conta">${html}</div>`;
    this.el.hidden = false;
    document.body.classList.add("bloqueado");
  },
  esconder() {
    this.el.hidden = true;
    document.body.classList.remove("bloqueado");
  },
  logo() {
    return `<div class="conta-logo"><span class="logo-icone">&gt;_</span><span class="logo-texto">WC <b>DEV</b></span></div>`;
  },

  login(modo = "entrar", erro = "") {
    const criar = modo === "criar";
    this.mostrar(`${this.logo()}
      <p class="conta-sub">Aprenda Pawn, Python, HTML, CSS e JavaScript</p>
      <div class="abas">
        <button class="aba ${criar ? "" : "ativa"}" data-modo="entrar">Entrar</button>
        <button class="aba ${criar ? "ativa" : ""}" data-modo="criar">Criar conta</button>
      </div>
      <form id="formConta" autocomplete="on">
        <label>Nome<input id="contaNome" maxlength="20" autocomplete="username" required placeholder="Seu nome de usuário"></label>
        <label>Senha<input id="contaSenha" type="password" autocomplete="${criar ? "new-password" : "current-password"}" required placeholder="Sua senha"></label>
        ${criar ? '<label>Repita a senha<input id="contaSenha2" type="password" autocomplete="new-password" required></label>' : ""}
        <p class="conta-erro">${Util.esc(erro)}</p>
        <button class="btn-primario" type="submit">${criar ? "Criar conta" : "Entrar"}</button>
      </form>
      <p class="conta-nota">Sua conta e suas conversas ficam salvas <b>neste aparelho</b>.</p>`);
    this.el.querySelectorAll(".aba").forEach(b => (b.onclick = () => this.login(b.dataset.modo)));
    this.el.querySelector("#formConta").onsubmit = async e => {
      e.preventDefault();
      const nome = this.el.querySelector("#contaNome").value;
      const senha = this.el.querySelector("#contaSenha").value;
      if (criar && senha !== this.el.querySelector("#contaSenha2").value) return this.login("criar", "As senhas não são iguais.");
      const err = criar ? await Conta.cadastrar(nome, senha) : await Conta.entrar(nome, senha);
      if (err) return this.login(modo, err);
      this.checar();
    };
    // só põe o foco no nome se a pessoa (ou o preenchimento automático) ainda não estiver digitando em outro campo
    setTimeout(() => { const a = document.activeElement; if (!(a && a.tagName === "INPUT" && this.el.contains(a))) this.el.querySelector("#contaNome").focus(); }, 50);
  },

  planos(aviso = "", podeVoltar = false) {
    const cards = CONFIG.planos.map(p => `
      <button class="plano ${p.destaque ? "destaque" : ""}" data-plano="${p.id}">
        ${p.destaque ? '<span class="selo">Mais tempo</span>' : ""}
        <span class="plano-nome">${p.nome}</span>
        <span class="plano-valor">${Util.dinheiro(p.valor)}</span>
        <span class="plano-dias">${p.dias} dias de acesso</span>
      </button>`).join("");
    const pend = Pedido.atual();
    this.mostrar(`${this.logo()}
      <p class="conta-sub">Olá, <b>${Util.esc(Conta.atual.nome)}</b>! ${aviso || "Escolha um plano pra liberar o WC DEV."}</p>
      <div class="planos">${cards}</div>
      ${pend ? `<button class="btn-link" id="verPedido">Tenho um pedido aberto (${Util.esc(pend.i)}) →</button>` : ""}
      <details class="ja-tenho">
        <summary>Já tenho um código de ativação</summary>
        ${this.formAtivar()}
      </details>
      ${podeVoltar ? '<button class="btn-link" id="voltarChat">← Voltar pro chat</button>' : ""}
      <button class="btn-link" id="sairConta">Sair da conta</button>`);
    if (podeVoltar) this.el.querySelector("#voltarChat").onclick = () => this.checar();
    this.el.querySelectorAll(".plano").forEach(b => (b.onclick = () => {
      const plano = CONFIG.planos.find(p => p.id === b.dataset.plano);
      this.pagamento(Pedido.criar(plano), podeVoltar);
    }));
    if (pend) this.el.querySelector("#verPedido").onclick = () => this.pagamento(pend, podeVoltar);
    this.ligarAtivar();
    this.el.querySelector("#sairConta").onclick = () => { Conta.sair(); document.getElementById("mensagens").innerHTML = ""; this.login(); };
  },

  pagamento(p, podeVoltar = false) {
    const codigoPedido = Pedido.codigo(p);
    const assunto = encodeURIComponent(`Comprovante WC DEV - ${p.i}`);
    const corpo = encodeURIComponent(
      `Olá! Segue o comprovante do PIX.\n\nUsuário: ${p.n}\nPlano: ${p.pl} (${Util.dinheiro(p.v)})\nPedido: ${p.i}\nCriado em: ${Util.dataHora(p.c)}\n\nCódigo do pedido:\n${codigoPedido}\n\n(anexe o comprovante neste e-mail)`);
    this.mostrar(`${this.logo()}
      <h2 class="conta-titulo">Pagamento via PIX</h2>
      <div class="resumo-pedido">
        <div><span>Plano</span><b>${Util.esc(p.pl)}</b></div>
        <div><span>Valor</span><b>${Util.dinheiro(p.v)}</b></div>
        <div><span>Pedido</span><b>${Util.esc(p.i)}</b></div>
        <div><span>Gerado em</span><b>${Util.dataHora(p.c)}</b></div>
      </div>
      <ol class="passos">
        <li>Pague <b>exatamente ${Util.dinheiro(p.v)}</b> pra chave PIX:
          <div class="copiavel"><code id="chavePix">${Util.esc(CONFIG.pix)}</code><button data-copiar="${Util.esc(CONFIG.pix)}">copiar</button></div>
          Confira se o recebedor é <b>${Util.esc(CONFIG.recebedor)}</b>.</li>
        <li>Anexe o <b>comprovante</b> e envie (o código do pedido vai junto automaticamente):
          <label class="anexo" id="anexo">
            <input type="file" id="arqComprovante" accept="image/*,application/pdf" hidden>
            <span class="anexo-vazio">📎 <b>Toque pra escolher o comprovante</b><small>foto, print ou PDF</small></span>
          </label>
          <div class="envio" id="envio" hidden>
            <button class="btn-primario" id="btnCompartilhar" type="button">📤 Enviar comprovante</button>
            ${CONFIG.whatsapp ? '<a class="btn-secundario" id="btnZap" target="_blank" rel="noopener">💬 WhatsApp</a>' : ""}
            <a class="btn-secundario" id="btnEmail" href="mailto:${Util.esc(CONFIG.contato)}?subject=${assunto}&body=${corpo}">✉️ Por e-mail</a>
          </div>
          <p class="envio-nota" id="envioNota"></p>
          <details class="cod-manual"><summary>Ver código do pedido</summary>
            <div class="copiavel"><code class="cod-pedido">${Util.esc(codigoPedido)}</code><button data-copiar="${Util.esc(codigoPedido)}">copiar</button></div>
          </details>
          ${p.env ? `<p class="envio-ok">✅ Comprovante enviado em ${Util.dataHora(p.env)}. Agora é só aguardar o código de ativação.</p>` : ""}</li>
        <li>Quando o pagamento for confirmado você recebe um <b>código de ativação</b>. Cole aqui:
          ${this.formAtivar()}</li>
      </ol>
      <button class="btn-link" id="voltarPlanos">← Escolher outro plano</button>
      ${podeVoltar ? '<button class="btn-link" id="voltarChat">← Voltar pro chat</button>' : ""}`);
    if (podeVoltar) this.el.querySelector("#voltarChat").onclick = () => this.checar();
    // mostra no histórico do pedido a hora certa em que foi gerado (o dono confere isso)
    this.el.querySelectorAll("[data-copiar]").forEach(b => (b.onclick = () => {
      navigator.clipboard.writeText(b.dataset.copiar).then(() => { b.textContent = "copiado!"; setTimeout(() => (b.textContent = "copiar"), 1500); });
    }));
    this.ligarComprovante(p, codigoPedido);
    this.ligarAtivar();
    this.el.querySelector("#voltarPlanos").onclick = () => this.planos("", podeVoltar);
  },

  // escolher o comprovante e mandar pro dono (WhatsApp, e-mail, Telegram... o que o aparelho tiver)
  ligarComprovante(p, codigoPedido) {
    const $ = s => this.el.querySelector(s);
    const input = $("#arqComprovante"), anexo = $("#anexo"), envio = $("#envio"), nota = $("#envioNota");
    const texto = `Comprovante WC DEV\nUsuário: ${p.n}\nPlano: ${p.pl} (${Util.dinheiro(p.v)})\nPedido: ${p.i}\n\n${codigoPedido}`;
    let arquivo = null, url = null;
    const marcarEnviado = () => {
      p.env = Date.now();
      Guardar.salvar(chaveDoUsuario("pedido"), p);
      nota.innerHTML = "✅ Pronto! Assim que o pagamento for conferido você recebe o <b>código de ativação</b>. Cole ele no passo 3.";
    };
    input.onchange = () => {
      arquivo = input.files && input.files[0];
      if (!arquivo) return;
      if (arquivo.size > 15 * 1024 * 1024) { nota.textContent = "Esse arquivo é muito grande (máx. 15 MB). Tire um print do comprovante."; return; }
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(arquivo);
      const img = arquivo.type.startsWith("image/");
      anexo.classList.add("cheio");
      anexo.querySelector(".anexo-vazio").innerHTML = (img ? `<img src="${url}" alt="comprovante">` : `<span class="anexo-pdf">PDF</span>`) +
        `<span class="anexo-info"><b>${Util.esc(arquivo.name.slice(0, 40))}</b><small>${(arquivo.size / 1024).toFixed(0)} KB · toque pra trocar</small></span>`;
      envio.hidden = false;
      const podeCompartilhar = navigator.canShare && navigator.canShare({ files: [arquivo] });
      $("#btnCompartilhar").hidden = !podeCompartilhar;
      nota.innerHTML = podeCompartilhar
        ? "Toque em <b>Enviar comprovante</b> e escolha o WhatsApp ou o e-mail. O código do pedido já vai junto."
        : "Neste aparelho o envio é pelo e-mail: o texto já vai pronto, só <b>anexe o comprovante</b> que você escolheu antes de enviar.";
    };
    $("#btnCompartilhar").onclick = async () => {
      try {
        await navigator.share({ files: [arquivo], title: "Comprovante WC DEV", text: texto });
        marcarEnviado();
      } catch (e) {
        if (e && e.name !== "AbortError") nota.innerHTML = "Não consegui abrir o compartilhamento. Use o botão de <b>e-mail</b>.";
      }
    };
    const zap = $("#btnZap");
    if (zap) {
      zap.href = `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
      zap.onclick = () => { marcarEnviado(); nota.innerHTML += "<br>No WhatsApp, <b>anexe o comprovante</b> na conversa junto com a mensagem."; };
    }
    $("#btnEmail").onclick = () => setTimeout(marcarEnviado, 500);
  },

  formAtivar() {
    return `<form class="form-ativar"><textarea class="campo-codigo" rows="3" placeholder="WC1-..." required></textarea>
      <p class="conta-erro"></p><button class="btn-primario" type="submit">Ativar</button></form>`;
  },
  ligarAtivar() {
    this.el.querySelectorAll(".form-ativar").forEach(f => (f.onsubmit = async e => {
      e.preventDefault();
      const erro = await Licenca.ativar(f.querySelector(".campo-codigo").value);
      if (erro) { f.querySelector(".conta-erro").innerHTML = erro; return; }
      this.checar(true);
    }));
  },

  bloqueioRelogio() {
    this.mostrar(`${this.logo()}
      <h2 class="conta-titulo">⏰ Data do aparelho alterada</h2>
      <p class="conta-sub">A data ou hora deste aparelho está atrasada. Ajuste pra data e hora certas (automática) e abra o WC DEV de novo.</p>
      <button class="btn-primario" id="tentar">Tentar de novo</button>`);
    this.el.querySelector("#tentar").onclick = () => this.checar();
  },

  semCripto() {
    this.mostrar(`${this.logo()}
      <h2 class="conta-titulo">Navegador sem suporte</h2>
      <p class="conta-sub">Abra o WC DEV pelo arquivo direto no aparelho ou por um link <b>https://</b> (Chrome, Edge, Firefox ou Safari atualizados).</p>`);
  },

  // decide o que mostrar
  async checar(acabouDeAtivar) {
    if (!Util.cripto()) return this.semCripto();
    if (!Conta.atual) return this.login();
    const st = await Licenca.status();
    if (st.ok) {
      this.esconder();
      if (this.aoLiberar) this.aoLiberar(st, acabouDeAtivar);
      return;
    }
    if (st.motivo === "relogio") return this.bloqueioRelogio();
    if (st.motivo === "vencida") return this.planos("Seu plano venceu em " + Util.dataHora(st.expira) + ". Renove pra continuar:");
    const pend = Pedido.atual();
    if (pend) return this.pagamento(pend);
    this.planos();
  },

  iniciar(aoLiberar) {
    this.el = document.getElementById("telaConta");
    this.aoLiberar = aoLiberar;
    Conta.restaurarSessao();
    this.checar();
    // confere o vencimento de minuto em minuto
    setInterval(async () => {
      if (!Conta.atual || !this.el.hidden) return;
      const st = await Licenca.status();
      if (!st.ok) this.checar();
      else if (WCDEV.aoAtualizarLicenca) WCDEV.aoAtualizarLicenca(st);
    }, 60000);
  },
};

/* =========================================================
   CONVERSAS SALVAS (por usuário, neste aparelho)
   ========================================================= */
const Historico = {
  atualId: null,
  _cache: null, _dono: null, _timer: null,
  // guarda na memória e só grava no aparelho depois de um tempinho (deixa tudo mais leve)
  todas() {
    const chave = chaveDoUsuario("conversas");
    if (this._cache && this._dono === chave) return this._cache;
    this._dono = chave;
    this._cache = Guardar.ler(chave, []);
    return this._cache;
  },
  salvarTodas(lista) {
    this._cache = lista.slice(0, 40);
    this._dono = chaveDoUsuario("conversas");
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.gravar(), 400);
  },
  gravar() {
    if (!this._cache || !this._dono) return;
    clearTimeout(this._timer);
    // se encher o armazenamento, apaga as conversas mais antigas
    const lista = this._cache;
    while (!Guardar.salvar(this._dono, lista) && lista.length > 1) lista.pop();
  },
  nova() {
    this.atualId = "c" + Date.now().toString(36);
    return this.atualId;
  },
  adicionar(msg, id) {
    if (!Conta.atual) return;
    id = id || this.atualId || this.nova();
    const lista = this.todas();
    let c = lista.find(x => x.id === id);
    if (!c) {
      c = { id, titulo: "Nova conversa", criado: Date.now(), msgs: [] };
      lista.unshift(c);
    }
    const titulo = msg.titulo; delete msg.titulo;
    c.msgs.push(msg);
    if (c.msgs.length > 300) c.msgs.splice(0, c.msgs.length - 300);
    if (c.titulo === "Nova conversa" && msg.q === "user" && !msg.t.startsWith("/")) c.titulo = (titulo || msg.t.split("\n")[0]).slice(0, 40);
    c.atualizado = Date.now();
    lista.sort((a, b) => (b.atualizado || b.criado) - (a.atualizado || a.criado));
    this.salvarTodas(lista);
    if (WCDEV.aoMudarHistorico) { clearTimeout(this._tLista); this._tLista = setTimeout(WCDEV.aoMudarHistorico, 120); }
  },
  pegar(id) { return this.todas().find(x => x.id === id); },
  apagar(id) {
    this.salvarTodas(this.todas().filter(x => x.id !== id));
    if (this.atualId === id) this.atualId = null;
  },
};

// grava tudo se a pessoa fechar ou trocar de aba
window.addEventListener("pagehide", () => Historico.gravar());
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") Historico.gravar(); });

WCDEV.conta = { Conta, Licenca, Pedido, TelaConta, Historico, CONFIG, Util };
