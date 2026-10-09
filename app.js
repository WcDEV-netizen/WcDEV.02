/* =========================================================
   WC DEV — motor do chat (sem API, roda 100% no navegador)
   Conteúdo: conversa.js, python.js, html.js, css.js, pawn.js
   Extras:   revisor.js (revisa código), treino.js (exercícios e "ensinar"),
             conta.js (login, planos, conversas salvas), editor.js (editor de código)
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };
WCDEV.refs = WCDEV.refs || [];

const NOMES = { python: "Python", html: "HTML", css: "CSS", pawn: "Pawn", javascript: "JavaScript" };

const estado = {
  lang: null,        // linguagem que o aluno está estudando agora
  ultimo: null,      // último tema mostrado
  ultimaAula: null,  // última aula da trilha (pro /proximo)
};

const elMensagens = document.getElementById("mensagens");
const elForm = document.getElementById("formulario");
const elTexto = document.getElementById("texto");
const elLang = document.getElementById("langAtual");
const elSidebar = document.getElementById("sidebar");

/* ---------- Utilidades de texto ---------- */

// minúsculas, sem acento, sem pontuação
function normalizar(t) {
  return " " + t.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9#<>/+\-*.= ]/g, " ")
    .replace(/\s+/g, " ")
    .trim() + " ";
}

function escapar(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Mini-formatador: ~~~lang bloco~~~, {{código}}, **negrito**, ### título, - lista
function formatar(texto) {
  const blocos = [];
  texto = texto.replace(/~~~(\w*)\n([\s\S]*?)~~~/g, (_, lang, cod) => {
    blocos.push({ lang: lang || "código", cod: cod.replace(/\n$/, "") });
    return `\u0000${blocos.length - 1}\u0000`;
  });

  let html = escapar(texto.trim())
    .replace(/\{\{(.+?)\}\}(?!\})/g, '<code class="inline">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const saida = [];
  let lista = false;
  for (const linha of html.split("\n")) {
    const l = linha.trim();
    if (l.startsWith("- ")) {
      if (!lista) { saida.push("<ul>"); lista = true; }
      saida.push(`<li>${l.slice(2)}</li>`);
      continue;
    }
    if (lista) { saida.push("</ul>"); lista = false; }
    if (!l) continue;
    if (l.startsWith("### ")) saida.push(`<h3>${l.slice(4)}</h3>`);
    else if (l.startsWith("&gt; ")) saida.push(`<div class="pensamento">${l.slice(5)}</div>`);
    else if (/^\u0000\d+\u0000$/.test(l)) saida.push(l);
    else saida.push(`<p>${l}</p>`);
  }
  if (lista) saida.push("</ul>");

  return saida.join("").replace(/\u0000(\d+)\u0000/g, (_, i) => {
    const b = blocos[i];
    if (b.lang === "analise") return desenharAnalise(b.cod);
    if (b.lang === "diff") return desenharDiff(b.cod);
    return `<div class="codigo"><div class="codigo-topo"><span>${b.lang}</span>` +
      `<button class="copiar">copiar</button></div><pre>${WCDEV.cores ? WCDEV.cores.colorir(b.cod, b.lang) : escapar(b.cod)}</pre></div>`;
  });
}

/* ---------- Painel de análise de código e comparação ---------- */
function escAttr(t) { return escapar(String(t == null ? "" : t)).replace(/"/g, "&quot;"); }
function inlineSeguro(t) {
  return escapar(String(t || "")).replace(/\{\{(.+?)\}\}(?!\})/g, '<code class="inline">$1</code>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
function desenharAnalise(json) {
  let d;
  try { d = JSON.parse(json); } catch (e) { return `<pre>${escapar(json)}</pre>`; }
  const c = { erro: 0, provavel: 0, verificar: 0, sugestao: 0 };
  d.achados.forEach(a => c[a.nivel]++);
  const CATS = { compilacao: ["⛔", "Compilação"], logica: ["🐞", "Bug confirmado"], possivel: ["❓", "Possível bug"], seguranca: ["🔒", "Segurança"], desempenho: ["🐢", "Desempenho"], integracao: ["🔗", "Integração"], estilo: ["🎨", "Estilo"], info: ["ℹ️", "Informativo"] };
  const cats = d.categorias || {};
  if (!d.categorias) { cats.compilacao = d.sintaxe.length; d.achados.forEach(a => { const k = a.categoria || ({ erro: "logica", provavel: "possivel", verificar: "possivel", sugestao: "estilo" })[a.nivel]; cats[k] = (cats[k] || 0) + 1; }); }
  const linha = (n, txt, arq) => `<div class="an-linha"><span class="an-n">${arq ? `<small>${escapar(arq)}</small> ` : ""}${n}</span><code>${WCDEV.cores ? WCDEV.cores.colorir(txt || "", "pawn") : escapar(txt || "")}</code></div>`;
  const id = escapar(d.id || "");
  let h = `<div class="analise" role="region" aria-label="Análise do código" data-id="${escAttr(d.id || "")}">`;
  h += `<div class="an-topo"><span class="an-titulo">🔬 ${d.projeto ? `Análise do projeto (${d.projeto.arquivos.length} arquivos)` : "Análise do código"}</span><span class="an-meta">${d.linhas} linhas · ${d.regras} regras (v${escapar(d.versao || "")}) · ${d.tempo} ms${d.arvore === false ? " · sem árvore sintática (código incompleto)" : ""}</span></div>`;
  // resumo de gravidade (certeza) + filtros por categoria (o que é)
  h += `<div class="an-grav" aria-label="Resumo de gravidade"><span class="g-e">❌ ${c.erro + d.sintaxe.length} confirmado(s)</span><span class="g-p">⚠️ ${c.provavel} provável(is)</span><span class="g-v">🔍 ${c.verificar} risco(s) potencial(is)</span><span class="g-s">💡 ${c.sugestao} melhoria(s)</span></div>`;
  h += `<div class="an-chips" role="group" aria-label="Filtrar por categoria"><button class="an-chip on" data-an="filtro" data-cat="" aria-pressed="true">Todos</button>${Object.entries(CATS).filter(([k]) => cats[k]).map(([k, [ic, nome]]) => `<button class="an-chip ${k}" data-an="filtro" data-cat="${k}" aria-pressed="false">${ic} ${cats[k]} ${nome}</button>`).join("")}</div>`;
  if (d.comparacao) {
    const cp = d.comparacao;
    h += `<div class="an-comp" role="note"><b>Comparando com a análise anterior</b> (${escapar(WCDEV.analiseHistorico ? WCDEV.analiseHistorico.quandoTexto(cp.quando) : "")}): <span class="ok">✅ ${cp.resolvidos.length} resolvido(s)</span> · <span class="novo">🆕 ${cp.novos.length} novo(s)</span> · ${cp.continuam} continua(m)` +
      (cp.resolvidos.length ? `<ul class="an-res">${cp.resolvidos.slice(0, 5).map(t => `<li>✅ ${escapar(t)}</li>`).join("")}</ul>` : "") + (cp.novos.length ? `<ul class="an-res">${cp.novos.slice(0, 5).map(t => `<li>🆕 ${escapar(t)}</li>`).join("")}</ul>` : "") + `</div>`;
  }
  if (d.cortado || d.puladas) h += `<div class="an-nota">⚠️ ${d.cortado ? "O código era muito grande: analisei só a primeira parte. " : ""}${d.puladas ? `${d.puladas} regra(s) não rodaram pra não travar.` : ""}</div>`;
  if (d.preproc && (d.preproc.inativas.length || d.preproc.incertas.length)) {
    const pp = d.preproc, faixa = b => b.ini === b.fim ? `linha ${b.ini}` : `linhas ${b.ini}–${b.fim}`;
    h += `<div class="an-nota">🧩 <b>Compilação condicional:</b> ` +
      (pp.inativas.length ? `${pp.inativas.map(b => `${faixa(b)} (${escapar(b.motivo)})`).slice(0, 4).join("; ")} <b>não são compiladas</b> nesta configuração, então não analisei como código ativo (em outra configuração elas podem valer). ` : "") +
      (pp.incertas.length ? `${pp.incertas.map(b => `${faixa(b)} (<code class="inline">#if ${escapar(b.cond)}</code>)`).slice(0, 4).join("; ")} dependem de algo que eu não vejo: analisei esse ramo, mas nada ali é dado como certo.` : "") + `</div>`;
  }
  if (d.trecho) h += `<div class="an-nota">📎 Você mandou um <b>trecho</b> (sem o arquivo inteiro): o que está declarado em outro lugar vira <b>risco potencial</b>, nunca "erro confirmado". Pra uma análise completa, mande o arquivo inteiro ou o projeto (<b>/projeto</b>).</div>`;
  if (d.faltando && d.faltando.length) h += `<div class="an-nota">📎 Faltaram arquivos: ${d.faltando.map(f => `<code class="inline">${escapar(f)}</code>`).join(", ")}. O que estiver neles eu não vejo, então nada que dependa deles é dado como certo.</div>`;
  if (d.projeto) {
    const pa = Object.entries(d.projeto.porArquivo || {});
    h += `<details class="an-card an-proj"><summary><span class="an-tag">🗂 Arquivos</span> ${d.projeto.arquivos.length} arquivo(s), principal: ${d.projeto.principais.map(p => `<code class="inline">${escapar(p)}</code>`).join(", ")}</summary><table class="an-arqs"><thead><tr><th>Arquivo</th><th>❌</th><th>⚠️</th><th>🔍</th></tr></thead><tbody>` +
      d.projeto.arquivos.map(f => { const x = (d.projeto.porArquivo || {})[f] || {}; return `<tr><td><code>${escapar(f)}</code></td><td>${x.erro || ""}</td><td>${x.provavel || ""}</td><td>${x.verificar || ""}</td></tr>`; }).join("") + `</tbody></table>` +
      (d.projeto.mapa ? `<p class="an-leg">Mapa: ${d.projeto.mapa.funcoes} funções · ${d.projeto.mapa.comandos} comandos · ${d.projeto.mapa.callbacks} callbacks · ${d.projeto.mapa.globais} variáveis globais · ${d.projeto.mapa.enums} enums${d.projeto.mapa.naoUsadas.length ? ` · stock nunca usadas (o compilador nem olha): ${d.projeto.mapa.naoUsadas.map(n => `<code class="inline">${escapar(n)}</code>`).join(", ")}` : ""}</p>` : "") + `</details>`;
    void pa;
  }
  for (const x of d.sintaxe) h += `<div class="an-card sintaxe" data-cat="compilacao"><div class="an-cab"><span class="an-tag">⛔ Erro de sintaxe</span> <span class="an-l">${x.arquivo ? escapar(x.arquivo) + " · " : ""}Linha ${x.linha}</span> <button class="an-mini" data-an="ir" data-linha="${x.linha}" data-arquivo="${escAttr(x.arquivo || "")}" aria-label="Ir para a linha ${x.linha}">↪ ir</button></div>${x.trecho ? linha(x.linha, x.trecho) : ""}<p>${inlineSeguro(x.msg)}</p></div>`;
  const ICONE = { erro: "❌", provavel: "⚠️", verificar: "🔍", sugestao: "💡" };
  for (const a of d.achados) {
    const cat = a.categoria || "";
    h += `<details class="an-card ${a.nivel}" data-cat="${escapar(cat)}"${d.curto ? "" : (a.nivel === "erro" || a.nivel === "provavel" ? " open" : "")}><summary><span class="an-tag">${ICONE[a.nivel]} ${escapar(a.rotulo)}</span>${a.icone ? `<span class="an-cat ${escapar(cat)}">${a.icone} ${escapar(a.rotuloCategoria || "")}</span>` : ""} <span class="an-l">${a.arquivo ? escapar(a.arquivo) + " · " : ""}Linha ${a.linha}</span> ${inlineSeguro(a.titulo)}</summary>`;
    h += linha(a.linha, a.trecho);
    h += `<dl><dt>Por quê</dt><dd>${inlineSeguro(a.porque)}</dd>`;
    if (a.consequencia) h += `<dt>Consequência</dt><dd>${inlineSeguro(a.consequencia)}</dd>`;
    if (a.quando) h += `<dt>Quando acontece</dt><dd>${inlineSeguro(a.quando)}</dd>`;
    h += `<dt>Como corrigir</dt><dd>${inlineSeguro(a.correcao)}</dd>`;
    if (a.teste) h += `<dt>Como confirmar</dt><dd>${inlineSeguro(a.teste)}</dd>`;
    h += `<dt>Confiança e limites</dt><dd>${inlineSeguro(a.limites || a.confianca)}${a.compilador ? ` <span class="an-comp-tag">compilador: ${escapar(a.compilador)}</span>` : ""}</dd></dl>`;
    if (a.evidencias && a.evidencias.length > 1) h += `<div class="an-ev"><b>Evidências (o caminho do problema):</b>${a.evidencias.map((e, i) => `<div class="an-ev-l"><span class="an-ev-n">${i + 1}</span><button class="an-mini" data-an="ir" data-linha="${e.linha}" data-arquivo="${escAttr(e.arquivo || a.arquivo || "")}">${e.arquivo ? escapar(e.arquivo) + ":" : "linha "}${e.linha}</button> ${escapar(e.texto || "")}${e.trecho ? ` <code>${escapar(e.trecho)}</code>` : ""}</div>`).join("")}</div>`;
    if (a.exemplo) h += `<pre class="an-ex">${WCDEV.cores ? WCDEV.cores.colorir(a.exemplo, "pawn") : escapar(a.exemplo)}</pre>`;
    h += `<div class="an-acoes"><button class="an-mini" data-an="ir" data-linha="${a.linha}" data-arquivo="${escAttr(a.arquivo || "")}">↪ Ir pra linha</button><button class="an-mini" data-an="copiar" data-texto="${escAttr(a.exemplo || ((a.correcao || "").match(/\{\{(.+?)\}\}(?!\})/) || [])[1] || a.correcao || "")}">📋 Copiar correção</button></div>`;
    h += `</details>`;
  }
  if (d.total && d.total > d.achados.length) h += `<div class="an-nota">… e mais ${d.total - d.achados.length} item(ns) menores. Corrija os de cima e analise de novo.</div>`;
  for (const inv of d.investigacoes || []) {
    const IC = { ok: "✅", atencao: "⚠️", depende: "❓" };
    h += `<div class="an-card investigacao" data-cat="info"><div class="an-cab"><span class="an-tag">🧭 Investigação</span> ${inlineSeguro(inv.titulo)}</div><ul class="an-check">${inv.itens.map(([s, t]) => `<li class="${s}"><span>${IC[s]}</span><span>${inlineSeguro(t)}</span></li>`).join("")}</ul><p class="an-leg">✅ ok · ⚠️ atenção · ❓ depende do que você quer pro seu servidor</p></div>`;
  }
  if (d.avisos && d.avisos.length) h += `<div class="an-card sugestao" data-cat="estilo"><div class="an-cab"><span class="an-tag">📝 Avisos do revisor</span></div><ul>${d.avisos.map(x => `<li>Linha ${x.linha}: ${inlineSeguro(x.msg)}</li>`).join("")}</ul></div>`;
  if (!d.curto) h += `<div class="an-rodape"><button class="an-mini" data-an="reanalisar">🔁 Analisar de novo</button><button class="an-mini" data-an="historico">🕘 Histórico</button>${c.erro + c.provavel + d.sintaxe.length ? `<button class="an-mini" data-an="corrigir">🔧 Corrigir</button>` : ""}</div>`;
  return h + "</div>";
}

/* ações dos painéis (um ouvinte só, pra todos os painéis do chat) */
function acaoAnalise(b) {
  const painel = b.closest(".analise");
  const acao = b.dataset.an;
  if (acao === "filtro") {
    const cat = b.dataset.cat;
    painel.querySelectorAll(".an-chip").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
    painel.querySelectorAll(".an-card[data-cat]").forEach(card => { card.hidden = !!cat && card.dataset.cat !== cat; });
    return;
  }
  if (acao === "copiar") {
    navigator.clipboard.writeText(b.dataset.texto || "").then(() => { const t = b.textContent; b.textContent = "✔ Copiado"; setTimeout(() => (b.textContent = t), 1500); }).catch(() => {});
    return;
  }
  const H = WCDEV.analiseHistorico;
  const reg = painel && painel.dataset.id && H ? H.pegar(painel.dataset.id) : null;
  if (acao === "ir") {
    const n = +b.dataset.linha, arq = b.dataset.arquivo;
    if (arq && WCDEV.editor && WCDEV.editor.projeto && WCDEV.editor.projeto.arquivos.has(arq)) { WCDEV.editor.abrir("pawn"); WCDEV.editor.trocarArquivo(arq); WCDEV.editor.irParaLinha(n); return; }
    const codigo = reg && reg.codigo && !reg.projeto ? reg.codigo : estado.ultimoCodigo && !arq ? estado.ultimoCodigo.codigo : null;
    if (!codigo) { adicionarMensagem("bot", formatar(arq ? `Pra ir até **${arq}**, abra o projeto no editor (**📁 Projeto**) que eu te levo direto na linha ${n}.` : "Não tenho mais esse código guardado. Cole de novo que eu analiso.")); return; }
    WCDEV.editor.abrir("pawn");
    if (WCDEV.editor.area.value !== codigo) WCDEV.editor.colocar(codigo, "pawn");
    WCDEV.editor.irParaLinha(n);
    return;
  }
  if (acao === "reanalisar" || acao === "corrigir") {
    // o código atual do editor, se for a continuação deste; senão o código guardado da análise
    const ed = WCDEV.editor && WCDEV.editor.area && WCDEV.editor.area.value;
    const doProjeto = reg && reg.projeto && WCDEV.editor && WCDEV.editor.projeto;
    if (doProjeto) { WCDEV.editor.salvarArquivoAtual && WCDEV.editor.salvarArquivoAtual(); enviar(acao === "corrigir" ? "/projeto corrigir" : "/projeto analisar"); return; }
    let codigo = reg && reg.codigo ? reg.codigo : estado.ultimoCodigo && estado.ultimoCodigo.codigo;
    if (ed && codigo && WCDEV.analiseHistorico.parecido(ed, codigo) >= 0.4) codigo = ed;
    if (!codigo) return;
    estado.ultimoCodigo = { codigo, lang: "pawn" };
    enviar(acao === "corrigir" ? "/corrigir" : "/reanalisar");
    return;
  }
  if (acao === "historico") { enviar("/analises"); return; }
}
document.addEventListener("click", e => { const b = e.target.closest("[data-an]"); if (b && b.closest(".analise")) acaoAnalise(b); });

function desenharDiff(txt) {
  const linhas = txt.split("\n");
  let a = 0, b = 0;
  const html = linhas.map(l => {
    const tipo = l.startsWith("+ ") ? "add" : l.startsWith("- ") ? "del" : "igual";
    const corpo = l.slice(2);
    if (tipo !== "add") a++;
    if (tipo !== "del") b++;
    return `<div class="df ${tipo}"><span class="df-n">${tipo === "add" ? "" : a}</span><span class="df-n">${tipo === "del" ? "" : b}</span><span class="df-s">${tipo === "add" ? "+" : tipo === "del" ? "−" : ""}</span><code>${WCDEV.cores ? WCDEV.cores.colorir(corpo, "pawn") : escapar(corpo)}</code></div>`;
  }).join("");
  const add = linhas.filter(l => l.startsWith("+ ")).length, del = linhas.filter(l => l.startsWith("- ")).length;
  return `<details class="diff" open><summary>🔀 Comparar original × corrigido <span class="df-add">+${add}</span> <span class="df-del">−${del}</span></summary><div class="df-corpo">${html}</div></details>`;
}

/* ---------- Mensagens na tela ---------- */

/* ---------- rolagem do chat ----------
   guarda se você está lá embaixo (lendo o fim) ou lá em cima (lendo algo antigo).
   Se estiver lendo lá em cima, não te puxo pra baixo: aparece o botão "↓ nova mensagem". */
const rolagem = {
  noFim: true,
  botao: null,
  calcular() { return elMensagens.scrollHeight - elMensagens.scrollTop - elMensagens.clientHeight < 80; },
  para(y) { elMensagens.scrollTop = Math.max(0, y); this.noFim = this.calcular(); },
  descer() { elMensagens.scrollTop = elMensagens.scrollHeight; this.noFim = true; this.esconderBotao(); },
  avisarNova() {
    if (!this.botao) {
      this.botao = document.createElement("button");
      this.botao.className = "btn-descer";
      this.botao.textContent = "↓ nova mensagem";
      this.botao.onclick = () => this.descer();
      elMensagens.parentNode.appendChild(this.botao);
    }
    this.botao.hidden = false;
  },
  esconderBotao() { if (this.botao) this.botao.hidden = true; },
};
elMensagens.addEventListener("scroll", () => {
  rolagem.noFim = rolagem.calcular();
  if (rolagem.noFim) rolagem.esconderBotao();
}, { passive: true });
// se o tamanho do chat muda (teclado do celular abriu, girou a tela) e você estava no fim, continua no fim
if (typeof ResizeObserver !== "undefined") {
  let estavaNoFim = true;
  elMensagens.addEventListener("scroll", () => (estavaNoFim = rolagem.noFim), { passive: true });
  new ResizeObserver(() => { if (estavaNoFim) elMensagens.scrollTop = elMensagens.scrollHeight; }).observe(elMensagens);
}

function adicionarMensagem(quem, conteudoHtml, sugestoes, preview, animar) {
  const perto = rolagem.noFim;
  const msg = document.createElement("div");
  msg.className = `msg ${quem}`;
  msg.innerHTML = `<div class="avatar">${quem === "bot" ? "WC" : "eu"}</div><div class="balao">${conteudoHtml}</div>`;

  // pré-visualização de HTML/CSS (sem scripts, por segurança)
  if (preview) {
    const box = document.createElement("div");
    box.className = "preview";
    box.innerHTML = '<div class="preview-topo">resultado</div>';
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "");
    frame.addEventListener("load", () => { if (rolagem.noFim) rolagem.descer(); });
    frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui,sans-serif;margin:12px;color:#111;background:#fff}</style></head><body>${preview}</body></html>`;
    box.appendChild(frame);
    msg.querySelector(".balao").appendChild(box);
  }

  if (sugestoes && sugestoes.length) {
    const box = document.createElement("div");
    box.className = "sugestoes";
    sugestoes.forEach(s => {
      const b = document.createElement("button");
      b.className = "sugestao";
      b.textContent = s;
      b.onclick = () => enviar(s);
      box.appendChild(b);
    });
    msg.querySelector(".balao").appendChild(box);
  }

  // 👍 / 👎: vira sugestão pra revisão (não muda o que a IA sabe)
  if (quem === "bot" && animar && WCDEV.aprendizagem && !/class="digitando"/.test(conteudoHtml)) {
    const fb = document.createElement("div");
    fb.className = "fb";
    fb.innerHTML = '<button class="fb-b" data-t="bom" aria-label="Resposta boa" title="Resposta boa">👍</button><button class="fb-b" data-t="ruim" aria-label="Resposta ruim" title="Resposta ruim">👎</button>';
    fb.addEventListener("click", e => {
      const b = e.target.closest(".fb-b");
      if (!b) return;
      const anterior = msg.previousElementSibling;
      const pergunta = anterior && anterior.classList.contains("user") ? anterior.innerText : "";
      const resposta = msg.querySelector(".balao").innerText;
      if (b.dataset.t === "bom") { WCDEV.aprendizagem.registrarFeedback("bom", resposta, pergunta); fb.innerHTML = '<span class="fb-ok">Valeu! 💙</span>'; return; }
      fb.innerHTML = '<input class="fb-in" maxlength="300" placeholder="O que estava errado? (opcional)" aria-label="O que estava errado"><button class="fb-env">Enviar</button>';
      const enviarFb = () => { WCDEV.aprendizagem.registrarFeedback("ruim", resposta, pergunta, fb.querySelector(".fb-in").value); fb.innerHTML = '<span class="fb-ok">Anotado pra revisão. Isso não muda o que eu sei sozinho, mas ajuda a melhorar a base. 🙏</span>'; };
      fb.querySelector(".fb-env").onclick = enviarFb;
      fb.querySelector(".fb-in").addEventListener("keydown", ev => { if (ev.key === "Enter") enviarFb(); });
      fb.querySelector(".fb-in").focus();
    });
    msg.querySelector(".balao").appendChild(fb);
  }

  // a resposta aparece em partes, como alguém falando (só efeito visual, bem leve)
  if (animar) {
    [...msg.querySelector(".balao").children].forEach((filho, i) => {
      filho.classList.add("surge");
      filho.style.animationDelay = Math.min(i * 70, 560) + "ms";
    });
  }

  elMensagens.appendChild(msg);
  // rolagem: mensagem minha sempre desce; resposta longa vai pro começo dela, pra ler de cima
  if (quem === "user" || perto) {
    if (quem === "bot" && msg.offsetHeight > elMensagens.clientHeight * 0.8) rolagem.para(msg.offsetTop - 12);
    else rolagem.descer();
  } else if (quem === "bot" && !msg.querySelector(".digitando")) {
    rolagem.avisarNova();
  }
  return msg;
}

function mostrarDigitando() {
  return adicionarMensagem("bot", '<div class="digitando" role="status" aria-label="WC DEV está pensando"><span></span><span></span><span></span></div>');
}

function responder(resposta, naoSalvar) {
  const d = mostrarDigitando();
  const tempo = Math.min(850, 280 + resposta.texto.length * 0.3);
  const conversa = Historico.atualId;
  if (!naoSalvar) Historico.adicionar({ q: "bot", t: resposta.texto, s: resposta.sugestoes || [], p: resposta.preview || null }, conversa);
  setTimeout(() => {
    d.remove();
    if (Historico.atualId !== conversa) return;   // trocou de conversa no meio
    adicionarMensagem("bot", formatar(resposta.texto), resposta.sugestoes, resposta.preview, true);
    if (typeof atualizarMemoria === "function") atualizarMemoria();
  }, tempo);
}

function atualizarLang(lang) {
  estado.lang = lang;
  elLang.textContent = lang ? (typeof Treino !== "undefined" && Treino.ativo ? "Treino · " : "Prof. ") + NOMES[lang] : "—";
}

/* ---------- Cérebro: encontra a melhor resposta ---------- */

// sem dizer a linguagem, mas falando de jogador/skin/colete... é Pawn
// assunto de aparência (cor, centralizar, piscar...) é CSS, mesmo quando a pessoa fala "div" ou "html"
const ASSUNTO_CSS = / (centraliz\w*|piscar|piscando|fundo|cor de fundo|cor do texto|fonte|borda|sombra|estourando|estoura|vazando|responsiv\w*|espacamento|margem|arredondad\w*) /;
function langProvavel(t) {
  if (/ (jogador|jogadores|playerid|skin|colete|veiculo|veiculos|viatura|kickar|banir|gamemode|filterscript|textdraw|dialog|checkpoint|pickup|interior|mundo virtual|rcon|server.cfg|callback|zcmd|sscanf|dof2|payday|teleportar) /.test(t)) return "pawn";
  if (ASSUNTO_CSS.test(t) && estado.lang !== "pawn") return "css";
  if (/ (div|tag|pagina html|<\w+>) /.test(t)) return "html";
  if (/ (console.log|addeventlistener|queryselector|getelementbyid|dom|arrow function|=>|promise|async|await|fetch|localstorage|json.parse|json.stringify|let|const) /.test(t)) return "javascript";
  return null;
}

function detectarLinguagem(t) {
  if (/ (python|py|pyton|phyton) /.test(t)) return "python";
  if (/ (html|htm|html5) /.test(t)) return "html";
  if (/ (css|css3) /.test(t)) return "css";
  if (/ (javascript|js|java script|ecmascript|node|nodejs|node js) /.test(t)) return "javascript";
  if (/ (pawn|samp|sa-mp|sa mp|open.mp|openmp|omp|pwn|gta samp|gamemode|filterscript) /.test(t)) return "pawn";
  return null;
}

/* ---------- Referências: transforma as listas dos arquivos em respostas ---------- */
// Palavras do português que não podem virar palavra-chave sozinhas (ex: a tag <a>)
const PALAVRAS_COMUNS = new Set(["a", "e", "o", "as", "os", "em", "do", "da", "de", "no", "na", "um", "uma", "se", "para", "com", "por", "que", "ou", "ao", "me", "eu"]);

// de onde vem uma função do Pawn: nativa, include, plugin ou feita por você
function origemPawn(nome, grupo) {
  const n = nome.toLowerCase();
  const de = [
    [/^dof2/, "🧩 include DOF2"], [/^(sscanf|unformat)/, "🔌 plugin sscanf"], [/^(mysql|cache_)/, "🔌 plugin MySQL"],
    [/^(createdynamic|streamer)|^streamer$/, "🔌 plugin streamer"], [/^bcrypt/, "🔌 plugin bcrypt"], [/^crashdetect/, "🔌 plugin crashdetect"],
    [/^(zcmd|cmd:)/, "🧩 include zcmd"], [/^pawn\.cmd/, "🔌 plugin Pawn.CMD"], [/^(foreach|iter_)/, "🧩 include foreach"],
    [/^(y_ini|dini|easydialog)/, "🧩 include"], [/^isnull/, "🧩 macro (vem no zcmd, ou você cria com #define)"],
  ].find(([re]) => re.test(n));
  if (de) return " · " + de[1];
  if (grupo === "Sistema pronto") return " · ✍️ código pronto (funções criadas por você)";
  if (/^(Callback|Função de jogador|Função de veículo|Função de servidor e mundo|Objeto, pickup e texto 3D|Dialog e textdraw|Constante)$/.test(grupo)) return " · ✅ nativa do SA-MP/open.mp";
  if (grupo === "Texto, número e arquivo") return n === "sha256_passhash" ? " · ✅ nativa do SA-MP (0.3.7 R2+)" : /^(min, max|vectorsize)/.test(n) ? "" : " · ✅ nativa do Pawn";
  return "";
}

function expandirReferencias() {
  (WCDEV.refs || []).forEach((bloco, b) => {
    bloco.itens.forEach((item, i) => {
      const [nome, desc, exemplo, extras] = item;
      const base = nome.replace(/^<|>$/g, "");          // "<p>" -> "p"
      const n = normalizar(base).trim();
      const comum = PALAVRAS_COMUNS.has(n) || n.length < 2;
      const chaves = [`${base} ${bloco.lang}`, `${bloco.lang} ${base}`];
      if (nome !== base) chaves.push(nome);   // "<p>"
      if (!comum) chaves.push(base);          // "append", "flexbox"...
      if (bloco.lang === "html") chaves.push(`tag ${base}`, `elemento ${base}`, `atributo ${base}`);
      // "random.randint" também responde por "randint"
      if (nome.includes(".")) {
        const fim = nome.split(".").pop().replace(/\(.*$/, "");
        if (fim.length > 2 && !PALAVRAS_COMUNS.has(fim)) chaves.push(fim);
      }
      if (extras) chaves.push(...extras.split("|").filter(Boolean));
      if (/[a-z][A-Z]/.test(base)) chaves.push(base.replace(/([a-z])([A-Z])/g, "$1 $2"));
      // descarta palavras-chave que viraram vazias ou só o nome da linguagem
      const chavesBoas = chaves.filter(c => {
        const nc = normalizar(c).trim();
        return nc.length >= 2 && nc !== bloco.lang && !PALAVRAS_COMUNS.has(nc);
      });

      // texto do botão de sugestão (nomes curtos ganham a linguagem junto)
      const botao = x => {
        const nb = normalizar(x[0]).trim();
        return (PALAVRAS_COMUNS.has(nb) || nb.length < 2) ? `${x[0]} ${bloco.lang}` : x[0];
      };

      WCDEV.temas.push({
        id: `ref-${bloco.lang}-${b}-${i}`,
        lang: bloco.lang,
        ref: true,
        grupo: bloco.grupo,
        titulo: nome,
        botao: botao(item),
        chaves: chavesBoas,
        resposta: `### ${nome}\n**${bloco.grupo}** · ${NOMES[bloco.lang]}${bloco.lang === "pawn" ? origemPawn(nome, bloco.grupo) : ""}\n${desc}` +
          (exemplo ? `\n~~~${bloco.codigo || bloco.lang}\n${exemplo}\n~~~` : ""),
        sugestoes: bloco.itens.slice(i + 1, i + 4).map(botao),
      });
    });
  });
  // guarda as palavras-chave já normalizadas (deixa a busca rápida)
  WCDEV.temas.forEach(prepararTema);
  montarIndice();
}

/* ---------- Busca por palavras (quando a frase não bate exata) ---------- */
const PARADAS = new Set(("a o e as os um uma uns umas de do da dos das em no na nos nas por pra pro para com sem que qual quais " +
  "como faz faco fazer fazendo eu voce vc me te se ser e eh sao ta to tem ter isso esse essa este esta aqui ali la ja mais muito " +
  "pode posso consigo quero queria preciso sei saber usar uso usa coloco colocar criar crio cria mostrar mostra ver vejo funciona " +
  "serve algum alguma ele ela meu minha seu sua nao sim so mas ou ate quando onde porque pq oq o que tipo ai entao").split(" "));

function raiz(p) {
  if (p.length > 5 && p.endsWith("oes")) return p.slice(0, -3) + "ao";
  if (p.length > 4 && p.endsWith("es") && !p.endsWith("ies")) return p.slice(0, -2);
  if (p.length > 3 && p.endsWith("s")) return p.slice(0, -1);
  return p;
}
function palavras(texto) {
  return normalizar(texto).trim().split(" ").filter(p => p.length > 1 && !PARADAS.has(p)).map(raiz);
}

let INDICE = { df: {}, total: 1 };
function montarIndice() {
  const df = {};
  WCDEV.temas.forEach(t => {
    t._palavras = new Set(palavras(t.titulo + " " + t.chaves.join(" ")));
    t._palavras.forEach(p => (df[p] = (df[p] || 0) + 1));
  });
  INDICE = { df, total: WCDEV.temas.length };
}

function buscaPorPalavras(t, lang) {
  const qs = [...new Set(palavras(t))];
  if (!qs.length) return null;
  let melhor = null, melhorPts = 0;
  for (const tema of WCDEV.temas) {
    if (lang && tema.lang !== lang && tema.lang !== "conversa") continue;
    if (!tema._palavras) continue;
    let pts = 0, achou = 0, forte = 0;
    for (const q of qs) {
      if (tema._palavras.has(q)) {
        pts += Math.log(INDICE.total / (INDICE.df[q] || 1)); achou++;
        if (!WCDEV.motor || !WCDEV.motor.GENERICAS.has(q)) forte++;
      }
    }
    if (!achou || !forte) continue;   // só "samp" ou "criar" em comum não conta
    pts *= achou / qs.length + 0.5;        // vale mais quando bate mais palavras da pergunta
    if (tema.lang === (lang || estado.lang)) pts += 0.8;
    if (pts > melhorPts) { melhorPts = pts; melhor = tema; }
  }
  return melhorPts >= 3.2 ? melhor : null;
}

// "tirar as armas" e "tirar armas" viram a mesma coisa
const ARTIGOS = / (o|a|os|as|um|uma|uns|umas|do|da|dos|das|de|no|na|nos|nas|pro|pra|pros|pras|ao|aos|meu|minha|seu|sua) /g;
// verbos conjugados viram infinitivo ("muda" = "mudar"), pra "muda a skin" achar "mudar skin"
const VERBOS = { muda: "mudar", mude: "mudar", tira: "tirar", tire: "tirar", coloca: "colocar", coloque: "colocar", bota: "botar",
  cria: "criar", crie: "criar", usa: "usar", use: "usar", troca: "trocar", troque: "trocar", pega: "pegar", pegue: "pegar",
  manda: "mandar", mande: "mandar", deixa: "deixar", deixe: "deixar", liga: "ligar", desliga: "desligar", apaga: "apagar",
  salva: "salvar", abre: "abrir", fecha: "fechar", mostra: "mostrar", mostre: "mostrar", centraliza: "centralizar",
  teleporta: "teleportar", congela: "congelar", kicka: "kickar", bane: "banir", faz: "fazer", faco: "fazer", conserta: "consertar",
  repara: "reparar", cura: "curar", ganha: "ganhar", compra: "comprar", vende: "vender", soma: "somar", ordena: "ordenar",
  junta: "juntar", separa: "separar", converte: "converter", arredonda: "arredondar", sorteia: "sortear", repete: "repetir",
  espera: "esperar", escreve: "escrever", le: "ler", da: "da", dou: "dar", ativa: "ativar", desativa: "desativar", remove: "remover",
  adiciona: "adicionar", esconde: "esconder", aparece: "aparecer", toca: "tocar", cancela: "cancelar", conecta: "conectar" };
function semArtigos(t) {
  let r = t, antes;
  do { antes = r; r = r.replace(ARTIGOS, " "); } while (r !== antes);
  // verbo no infinitivo e palavra no singular (dos dois lados: frase e palavra-chave)
  r = r.trim().split(" ").map(p => raiz(VERBOS[p] || p)).join(" ");
  return " " + r.replace(/\s+/g, " ").trim() + " ";
}
const SO_LINGUAGEM = new Set(["samp", "sa-mp", "pawn", "python", "html", "css", "open.mp", "openmp", "py", "js", "javascript"]);
function prepararTema(t) {
  t._chaves = t.chaves.map(c => normalizar(c));
  // versão sem artigos; descarta se sobrar só o nome da linguagem (ex: "a_samp" -> "samp")
  t._chaves2 = t._chaves.map(c => {
    const s = semArtigos(c);
    const limpo = s.trim();
    return (limpo.length < 3 || SO_LINGUAGEM.has(limpo)) ? "" : s;
  });
  t._titulo = normalizar(t.titulo);
}

function temasDa(lang) {            // só as aulas da trilha
  return WCDEV.temas.filter(x => x.lang === lang && !x.ref);
}
function referenciasDa(lang) {      // itens de consulta
  return WCDEV.temas.filter(x => x.lang === lang && x.ref);
}
function totalDe(lang) {
  return WCDEV.temas.filter(x => x.lang === lang).length;
}

function gruposDe(lang) {
  const grupos = new Map();
  referenciasDa(lang).forEach(x => {
    if (!grupos.has(x.grupo)) grupos.set(x.grupo, []);
    grupos.get(x.grupo).push(x.titulo);
  });
  return grupos;
}

function listarTopicos(lang) {
  const ok = (Treino.progresso && Treino.progresso._aulasOk) || [];
  const lista = temasDa(lang).map((x, i) => `- ${ok.includes(x.id) ? "✅" : "**" + (i + 1) + ".**"} ${x.titulo}`).join("\n");
  const grupos = [...gruposDe(lang)].map(([g, nomes]) =>
    `- **${g}** (${nomes.length}): ${nomes.slice(0, 6).join(", ")}${nomes.length > 6 ? "..." : ""}`).join("\n");
  return {
    texto: `### Trilha de ${NOMES[lang]}\n**Como funciona:** eu te ensino uma aula, no final te passo um **desafio** sobre ela, e só quando você acertar a gente vai pro **próximo passo**. Assim o conteúdo entra na cabeça de verdade. 🧠\n\nAulas em ordem:\n${lista}` +
      (grupos ? `\n\n### Consulta: mais ${referenciasDa(lang).length} coisas de ${NOMES[lang]}\nÉ só digitar o nome de qualquer uma:\n${grupos}\n\nDigite {{/indice}} pra ver a lista completa.` : ""),
    sugestoes: ["▶ começar a trilha", ...temasDa(lang).slice(0, 4).map(x => x.titulo)],
  };
}

function indice(lang) {
  if (!lang) return { texto: "De qual linguagem? ", sugestoes: ["/indice pawn", "/indice python", "/indice html", "/indice css"] };
  atualizarLang(lang);
  const grupos = [...gruposDe(lang)].map(([g, nomes]) => `**${g}** (${nomes.length})\n${nomes.map(n => `{{${n}}}`).join(" · ")}`).join("\n\n");
  return { texto: `### Índice de ${NOMES[lang]} — ${totalDe(lang)} coisas\n${grupos}\n\nDigite qualquer nome pra eu explicar.` };
}

function proximaAula() {
  const lang = estado.lang || "python";
  const P = WCDEV.professor;
  // aula guiada: só vai pro próximo passo depois do desafio da aula atual
  if (P) {
    const portao = P.portaoDaAula();
    if (portao) return portao;
  }
  const lista = temasDa(lang);
  const ultima = estado.ultimaAula;
  let i = ultima && ultima.lang === lang ? lista.indexOf(ultima) + 1 : 0;
  if (i >= lista.length) {
    return { texto: `🎉 Você terminou a trilha de **${NOMES[lang]}**! Quer começar outra?`, sugestoes: ["/pawn", "/python", "/html", "/css", `/treinar ${lang}`] };
  }
  const aula = usarTema(lista[i]);
  return P ? P.aulaComDesafio(lista[i], aula, i + 1, lista.length) : aula;
}

function usarTema(tema, ctx) {
  if (tema.lang !== "conversa") atualizarLang(tema.lang);
  estado.ultimo = tema;
  if (tema.lang !== "conversa" && !tema.ref) {
    estado.ultimaAula = tema;
    if (Treino.progresso && Treino.progresso._ultima !== tema.id) { Treino.progresso._ultima = tema.id; Treino.salvarProgresso(); }
    if (WCDEV.professor) WCDEV.professor.marcarVista(tema);
  }
  if (ctx && WCDEV.cerebro) {
    const v = WCDEV.cerebro.vestir(tema, ctx);
    if (tema.lang !== "conversa" && !tema.ref && WCDEV.desafiosAula && WCDEV.desafiosAula[tema.id] && !Treino.ativo) v.sugestoes.unshift("🎯 desafio desta aula");
    if (tema.lang !== "conversa" && !tema.ref && !v.sugestoes.includes("/proximo")) v.sugestoes.push("/proximo");
    return v;
  }
  const texto = typeof tema.resposta === "function" ? tema.resposta(estado) : tema.resposta;
  let sugestoes = tema.sugestoes ? [...tema.sugestoes] : [];
  if (tema.lang !== "conversa" && !tema.ref && !sugestoes.includes("/proximo")) sugestoes.push("/proximo");
  return { texto, sugestoes };
}

function pontuar(tema, t, langDetectada, t2) {
  if (tema.exato) return tema._chaves.includes(t) ? 10 : 0;
  let pontos = 0;
  t2 = t2 || semArtigos(t);
  const contadas = new Set();   // "skin" e "skins" não contam duas vezes
  tema._chaves.forEach((c, i) => {
    const c2 = tema._chaves2[i];
    const forma = c2.trim() || c.trim();
    if (contadas.has(forma)) return;
    if (t.includes(c) || (c2.trim() && t2.includes(c2))) {
      contadas.add(forma);
      pontos += c.trim().split(" ").length * 2 + 1;
    }
  });
  if (tema._titulo === t) pontos += 20;
  if (pontos > 0) {
    if (tema.ref) pontos += 1;                              // consulta é mais específica
    if (langDetectada && tema.lang === langDetectada) pontos += 3;
    else if (!langDetectada && tema.lang === estado.lang) pontos += 3;  // contexto da conversa
    else if (langDetectada && tema.lang !== "conversa") pontos -= 4;
  }
  return pontos;
}

/* ---------- "Você quis dizer...?" (nomes digitados errado) ---------- */
function distancia(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

function parecidos(t, lang) {
  const palavras = t.trim().split(" ").filter(p => p.length >= 4);
  const achados = [];
  for (const tema of WCDEV.temas) {
    if (tema.lang === "conversa" || (lang && tema.lang !== lang)) continue;
    // compara com o título e com as palavras-chave de uma palavra só
    const nomes = [tema._titulo, ...tema._chaves].map(x => x.trim()).filter(x => !x.includes(" ") && x.length >= 4);
    let melhor = 9;
    for (const nome of nomes)
      for (const p of palavras)
        melhor = Math.min(melhor, distancia(p, nome) <= (nome.length > 7 ? 2 : 1) ? distancia(p, nome) : 9);
    if (melhor < 9) achados.push({ tema, dist: melhor });
  }
  const vistos = new Set();
  return achados.sort((a, b) => a.dist - b.dist || (b.tema.ref ? 1 : 0) - (a.tema.ref ? 1 : 0))
    .map(x => x.tema.botao || x.tema.titulo)
    .filter(n => !vistos.has(n) && vistos.add(n))
    .slice(0, 4);
}

/* ---------- Pequenas habilidades extras ---------- */
function calcular(t) {
  const m = t.match(/^ (?:quanto e|quanto da|calcula|calcule|conta|resultado de|qual o resultado de)?\s*([\d\s+\-*/().,x^%]+?)\s*=?\s*$/);
  if (!m || !/\d\s*[+\-*/x^%]\s*\d/.test(m[1])) return null;
  const expr = m[1].replace(/x/g, "*").replace(/\^/g, "**").replace(/,/g, ".");
  if (!/^[\d\s+\-*/().%]+$/.test(expr)) return null;
  try {
    const r = Function(`"use strict"; return (${expr});`)();
    if (typeof r !== "number" || !isFinite(r)) return null;
    const bonito = Number.isInteger(r) ? r : Math.round(r * 10000) / 10000;
    return { texto: `🧮 ${m[1].trim()} = **${bonito}**\nSabia que dá pra fazer essa conta em Python? {{print(${expr.trim()})}}` };
  } catch (e) { return null; }
}

function horaOuData(t) {
  const agora = new Date();
  if (/ (que horas sao|que hora e|horas agora|me fala a hora) /.test(t))
    return { texto: `🕐 Agora são **${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}**.\nEm Pawn você pega a hora com {{gettime(h, m, s);}} 😉`, sugestoes: ["gettime"] };
  if (/ (que dia e hoje|data de hoje|qual a data|que dia e) /.test(t))
    return { texto: `📅 Hoje é **${agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}**.`, sugestoes: ["datetime.now"] };
  return null;
}

// "e em pawn?" depois de uma explicação: procura o mesmo assunto na outra linguagem
function mesmaCoisaEm(t, lang) {
  if (!estado.ultimo || estado.ultimo.lang === "conversa" || estado.ultimo.lang === lang) return null;
  if (t.trim().split(" ").length > 6) return null;
  if (!/^ (e|e no|e na|e em|e pra|e para|e com|como fica|como seria|e no caso do|agora|faz|mostra|mesma coisa)\b/.test(t)) return null;
  const assunto = estado.ultimo.titulo + " " + estado.ultimo.chaves.slice(0, 6).join(" ");
  return buscaPorPalavras(assunto, lang);
}

function foraDoAssunto(t) {
  const fa = WCDEV.foraDoAssunto;
  if (!fa) return null;
  const tem = lista => lista.some(p => t.includes(" " + normalizar(p).trim() + " "));
  if (tem(fa.sinaisDeProgramacao) || detectarLinguagem(t)) return null;
  if (!tem(fa.palavras)) return null;
  return { texto: fa.respostas[Math.floor(Math.random() * fa.respostas.length)], sugestoes: ["/treinar", "quero aprender pawn", "quero aprender python"] };
}

function pareceProgramacao(t) {
  const fa = WCDEV.foraDoAssunto;
  return !!detectarLinguagem(t) || /[{}();<>=]/.test(t) ||
    (fa && fa.sinaisDeProgramacao.some(p => t.includes(" " + normalizar(p).trim() + " ")));
}

/* ---------- Revisão de código colado ---------- */
function revisarCodigo(codigo, langEscolhida) {
  const proj = Projeto_doTexto(codigo);
  if (proj) return analisarProjetoChat(proj);
  const lang0 = langEscolhida || (WCDEV.revisor && WCDEV.revisor.detectar(codigo));
  if (lang0 === "pawn" && WCDEV.analisador) return analisarPawn(codigo);
  const r = WCDEV.revisor && WCDEV.revisor.analisar(codigo, langEscolhida);
  if (!r) return null;
  atualizarLang(r.lang);
  const erros = r.problemas.filter(p => p.tipo === "erro");
  const outros = r.problemas.filter(p => p.tipo !== "erro");
  let texto = `### 🔎 Revisei seu código ${NOMES[r.lang]}\n`;
  if (r.resumo) texto += r.resumo + "\n";
  if (!r.problemas.length) {
    texto += "✅ **Não achei erros comuns.** Boa!\n(Eu confiro os erros mais frequentes, mas não executo o código: teste também no " +
      ({ pawn: "compilador", python: "Python", html: "navegador", css: "navegador", javascript: "navegador (Console, F12)" })[r.lang] + ".)";
  } else {
    if (erros.length) texto += `\n**Erros (${erros.length}):**\n${erros.slice(0, 10).map(e => `- **Linha ${e.linha}:** ${e.msg}`).join("\n")}\n`;
    if (outros.length) texto += `\n**Avisos e dicas (${outros.length}):**\n${outros.slice(0, 8).map(e => `- **Linha ${e.linha}:** ${e.msg}`).join("\n")}\n`;
  }
  estado.ultimoCodigo = { codigo, lang: r.lang };
  if (erros.length) texto += "\nQuer que eu **conserte pra você**? Toque em **/corrigir**. Ou peça **/explicar** pra eu explicar linha por linha.";
  else texto += "\nQuer que eu explique o que cada linha faz? Toque em **/explicar**.";
  const preview = r.lang === "html" ? codigo : r.lang === "css" ? `<div class="card botao menu caixa">Exemplo</div><h1>Título</h1><p>Parágrafo</p><style>${codigo}</style>` : null;
  const botoes = erros.length ? ["/corrigir", "/explicar"] : ["/explicar"];
  return { texto, sugestoes: botoes.concat(r.usados).slice(0, 8), preview };
}

/* ---------- Análise estática completa (Pawn) ---------- */
function resumoAnalise(a) {
  const c = { erro: 0, provavel: 0, verificar: 0, sugestao: 0 };
  a.achados.forEach(x => c[x.nivel]++);
  c.sintaxe = a.sintaxe.filter(x => x.tipo === "erro").length;
  return c;
}
function analisarPawn(codigo, nomeArquivo) {
  const A = WCDEV.analisador;
  const a = A.analisar(codigo, "pawn");
  atualizarLang("pawn");
  estado.ultimoCodigo = { codigo, lang: "pawn" };
  const c = resumoAnalise(a);
  if (WCDEV.motor) WCDEV.motor.passo("Análise", `revisor de sintaxe + ${A.regras.pawn.length} regras de lógica/segurança: ${c.sintaxe} de sintaxe, ${c.erro} confirmado(s), ${c.provavel} provável(is), ${c.verificar} pra verificar, ${c.sugestao} sugestão(ões)`);
  const hist = WCDEV.analiseHistorico ? WCDEV.analiseHistorico.registrar({ nome: nomeArquivo || "trecho", codigo, achados: a.achados, sintaxe: a.sintaxe, hash: A.hash(codigo) }) : {};
  let texto = A.relatorio(a, { id: hist.id, comparacao: hist.comparacao });
  const temCoisa = c.sintaxe + c.erro + c.provavel + c.verificar;
  texto += temCoisa ? "\n\nQuer que eu **aplique as correções**? Toque em **/corrigir** (eu mexo só nas linhas com problema e te mostro cada mudança)." : "\n\nQuer que eu explique o que cada linha faz? Toque em **/explicar**.";
  const botoes = temCoisa ? ["/corrigir", "explica linha por linha"] : ["explica linha por linha", "/desafio pawn"];
  return { texto, sugestoes: botoes.concat((WCDEV.revisor.analisar(codigo, "pawn") || { usados: [] }).usados).slice(0, 7) };
}
function corrigirPawn(original, r) {
  const A = WCDEV.analisador;
  const c = A.corrigir(r.codigo, "pawn");
  const final = c.codigo;
  const intencao = c.aplicadas.filter(x => x.suposicao);
  const pendentes = c.puladas.filter(x => x.nivel !== "sugestao" && x.regra !== "nao-declarado" && x.regra !== "dados-salvos");
  const contexto = c.puladas.filter(x => x.regra === "nao-declarado" || x.regra === "dados-salvos");
  const restantesSintaxe = (WCDEV.revisor.analisar(final, "pawn") || { problemas: [] }).problemas.filter(p => p.tipo === "erro");
  if (WCDEV.motor) WCDEV.motor.passo("Correção", `${r.mudancas.length} de sintaxe + ${c.aplicadas.length} de lógica/segurança, cada uma revalidada no revisor`);
  atualizarLang("pawn");
  if (!r.mudancas.length && !c.aplicadas.length) {
    const a = c.analise;
    if (!a.achados.length && !restantesSintaxe.length) return { texto: "> 🧠 Analisei sintaxe, lógica e segurança.\n✅ **Não achei nada pra corrigir.** Se mesmo assim não funciona, me conta o que acontece (ou cola a mensagem de erro) que eu te ajudo.\n⚙️ Não compilei (não tem compilador aqui no navegador).", sugestoes: ["explica linha por linha"] };
    return { texto: "> 🧠 Não apliquei nenhuma mudança automática: os pontos abaixo dependem de uma decisão sua.\n### 🔬 O que eu achei\n" + A.relatorio(a), sugestoes: ["explica linha por linha", "/editor"] };
  }
  estado.ultimoCodigo = { codigo: final, lang: "pawn" };
  const rv = c.resumoVerificacao || {};
  let texto = `> 🧠 Fiz ${r.mudancas.length ? `**${r.mudancas.length}** correção(ões) de sintaxe e ` : ""}**${c.aplicadas.length}** correção(ões) de lógica/segurança. Mexi **só nas linhas com problema**: o resto do seu código ficou igual.\n`;
  texto += `> 🔁 Depois de cada mudança eu **analisei tudo de novo** (não só a sintaxe): problemas sérios ${rv.antes ?? "?"} → **${rv.depois ?? "?"}**, ${rv.novos ? `**${rv.novos} novo(s)** (confira abaixo)` : "nenhum problema novo criado"}.${(c.recusadas || []).length ? ` Recusei ${c.recusadas.length} correção(ões) que criavam outro problema.` : ""}\n`;
  texto += `### 🔧 Código corrigido\n~~~pawn\n${final}\n~~~\n`;
  const df = A.diff(original, final);
  if (df) texto += "~~~diff\n" + df.replace(/~~~/g, "~ ~ ~") + "\n~~~\n";
  if (r.mudancas.length) texto += "**Sintaxe:**\n" + r.mudancas.sort((a, b) => a.n - b.n).map(m => `- **Linha ${m.n}:** ${m.o}. ${m.porque.charAt(0).toUpperCase() + m.porque.slice(1)}`).join("\n") + "\n";
  if (c.aplicadas.length) texto += "\n**Lógica e segurança:**\n" + c.aplicadas.map(x => `- **Linha ${x.linha}** (${x.suposicao ? "mudança de comportamento" : { erro: "erro confirmado", provavel: "problema provável", verificar: "proteção extra", sugestao: "melhoria" }[x.nivel]}): ${x.titulo.replace(/\*\*/g, "")} ${x.correcao}`).join("\n") + "\n";
  if (intencao.length) texto += "\n**⚠️ O que eu assumi (confira se é o que você quer):**\n" + intencao.map(x => `- ${x.suposicao.charAt(0).toUpperCase() + x.suposicao.slice(1)}.`).join("\n") + "\n";
  if (pendentes.length) texto += "\n**Não corrigi sozinho (precisa da sua decisão):**\n" + pendentes.slice(0, 6).map(x => `- **Linha ${x.linha}:** ${x.titulo.replace(/\*\*/g, "")} ${x.correcao}`).join("\n") + "\n";
  if (contexto.length) texto += "\n**Fora deste trecho (confira no resto do gamemode):**\n" + contexto.map(x => `- ${x.titulo.replace(/\*\*/g, "")}`).join("\n") + "\n";
  if (restantesSintaxe.length) texto += `\n**Ainda tem erro de sintaxe:**\n${restantesSintaxe.map(e => `- **Linha ${e.linha}:** ${e.msg}`).join("\n")}\n`;
  if ((c.recusadas || []).length) texto += "\n**Não apliquei (a correção criava outro problema):**\n" + c.recusadas.map(x => `- **Linha ${x.achado.linha}:** ${x.achado.titulo.replace(/\*\*/g, "")} — ${x.motivo}`).join("\n") + "\n";
  texto += "\n⚙️ Eu **não compilei** (não tem compilador Pawn no navegador): compile no Pawno/Qawno pra confirmar.";
  return { texto, sugestoes: ["colocar no editor", "explica linha por linha"] };
}

/* ---------- Suporte pelo WhatsApp (o único canal de contato) ----------
   Só manda o que a pessoa escreveu: código, conversas e análises NÃO vão junto.
   O app só abre a conversa com a mensagem pronta; o envio é a pessoa que faz no WhatsApp. */
function suporteWhatsApp(texto) {
  if (typeof WhatsApp === "undefined" || !WhatsApp.valido()) return { texto: "O contato pelo WhatsApp não está configurado neste app." };
  const msg = adicionarMensagem("bot", `<div class="zap-box"><b>💬 Falar com o suporte no WhatsApp</b>
    <span class="zap-st">Escreva a mensagem. Só vai o que você escrever aqui (nenhum código ou conversa vai junto). O WhatsApp abre com o texto pronto e <b>você</b> envia.</span>
    <textarea maxlength="1000" aria-label="Mensagem pro suporte">${escapar(texto || "")}</textarea>
    <button class="btn-primario btn-zap" type="button">Abrir o WhatsApp</button><span class="zap-st zap-res" role="status"></span></div>`);
  const ta = msg.querySelector("textarea"), res = msg.querySelector(".zap-res");
  msg.querySelector(".btn-zap").onclick = () => {
    const t = ta.value.trim();
    if (!t) { res.textContent = "Escreva a mensagem primeiro."; return; }
    const ref = "suporte:" + t.slice(0, 60);
    if (WhatsApp.repetido(ref)) { res.textContent = "Você abriu essa mesma mensagem agora há pouco. Se não enviou, confira a aba do WhatsApp."; return; }
    const r = WhatsApp.abrir(`[WC DEV - suporte] ${Conta.atual ? Conta.atual.nome + ": " : ""}${t}`, ref, "suporte");
    res.innerHTML = !r.ok ? "❌ " + escapar(r.erro) : r.bloqueado ? `O navegador bloqueou a aba. <a href="${WhatsApp.link(t)}" target="_blank" rel="noopener">Abrir o WhatsApp</a> (ainda <b>não foi enviada</b>).` : "WhatsApp aberto com a mensagem. Ela só é enviada quando você tocar em enviar lá.";
  };
  ta.focus();
  return null;
}

/* ---------- Projeto com vários arquivos ---------- */
// texto colado com "// arquivo: nome.inc" separando os arquivos -> { nome: código }
function Projeto_doTexto(t) { return WCDEV.projeto && typeof t === "string" ? WCDEV.projeto.separarColado(t) : null; }
function textoDoProjeto(arquivos) { return Object.entries(arquivos).map(([k, v]) => `// arquivo: ${k}\n${v.replace(/\n+$/, "")}`).join("\n\n"); }
function analisarProjetoChat(arquivos, res) {
  const P = WCDEV.projeto;
  res = res || P.analisar(arquivos);
  atualizarLang("pawn");
  estado.ultimoCodigo = { codigo: textoDoProjeto(arquivos), lang: "pawn", arquivos };
  const hist = WCDEV.analiseHistorico ? WCDEV.analiseHistorico.registrar({ nome: "projeto:" + res.principais.join("+"), arquivos, achados: res.diagnosticos.filter(d => d.regra !== "sintaxe"), sintaxe: res.diagnosticos.filter(d => d.regra === "sintaxe" && d.nivel === "erro").map(d => ({ tipo: "erro" })), hash: WCDEV.analisador.hash(textoDoProjeto(arquivos)) }) : {};
  const n = res.diagnosticos.filter(d => d.nivel === "erro" || d.nivel === "provavel").length;
  if (WCDEV.motor) WCDEV.motor.passo("Projeto", `${res.arquivos.length} arquivo(s), principal ${res.principais.join(", ")}, ${res.faltando.length} include(s) faltando, ${res.diagnosticos.length} diagnóstico(s)`);
  let texto = `> 🧠 Juntei os ${res.arquivos.length} arquivos como o compilador faz (seguindo os {{#include}}) e analisei tudo junto: assim eu vejo o que um arquivo usa do outro.\n` + P.relatorio(res, { id: hist.id, comparacao: hist.comparacao });
  texto += n ? "\n\nQuer que eu **aplique as correções seguras**? Toque em **/corrigir** (eu mostro o antes/depois de cada arquivo e reverifico o projeto inteiro)." : "";
  return { texto, sugestoes: n ? ["/corrigir", "/projeto"] : ["/projeto"] };
}
function corrigirProjetoChat(arquivos) {
  const P = WCDEV.projeto;
  const c = P.corrigir(arquivos);
  atualizarLang("pawn");
  if (!c.aplicadas.length) return { texto: "> 🧠 Analisei o projeto inteiro e **não apliquei nada automático**: o que sobrou depende de uma decisão sua (veja o painel).\n" + P.relatorio(c.antes), sugestoes: ["/projeto"] };
  const novo = Object.fromEntries(c.arquivos);
  estado.ultimoCodigo = { codigo: textoDoProjeto(novo), lang: "pawn", arquivos: novo };
  const versao = WCDEV.analiseHistorico ? WCDEV.analiseHistorico.guardarVersao("antes de corrigir o projeto", { tipo: "projeto", arquivos }) : null;
  const serio = d => d.nivel === "erro" || d.nivel === "provavel";
  let texto = `> 🧠 Apliquei **${c.aplicadas.length}** correção(ões) em **${c.mudados.length}** arquivo(s) e analisei o **projeto inteiro de novo** depois de cada uma: ${c.depois.diagnosticos.filter(serio).length} problema(s) sério(s) agora (antes: ${c.antes.diagnosticos.filter(serio).length}).${c.recusadas.length ? ` Recusei ${c.recusadas.length} que criavam outro problema.` : ""}\n`;
  for (const arq of c.mudados) texto += `### 📄 ${arq}\n~~~diff\n${c.diffs[arq].replace(/~~~/g, "~ ~ ~")}\n~~~\n`;
  texto += "**O que mudou:**\n" + c.aplicadas.map(d => `- **${d.arquivo}, linha ${d.linha}:** ${d.titulo.replace(/\*\*/g, "")}`).join("\n") + "\n";
  if (c.recusadas.length) texto += "\n**Não apliquei (criava outro problema):**\n" + c.recusadas.map(x => `- ${x.diagnostico.arquivo}:${x.diagnostico.linha} ${x.diagnostico.titulo.replace(/\*\*/g, "")} — ${x.motivo}`).join("\n") + "\n";
  texto += `\n${versao ? `💾 Guardei a versão de antes (**/versoes**) pra você voltar se quiser. ` : ""}Nada foi salvo no seu PC: copie ou baixe os arquivos corrigidos.\n⚙️ Não compilei (sem compilador no navegador).`;
  return { texto, sugestoes: ["/projeto", "/versoes"] };
}
function comandoProjeto(resto) {
  const E = WCDEV.editor;
  const temProjeto = E && E.projeto && E.projeto.arquivos.size;
  if (temProjeto && /^(analisar|analisa|revisar)?$/i.test(resto.trim())) {
    E.salvarArquivoAtual();
    const arquivos = Object.fromEntries(E.projeto.arquivos);
    const msg = adicionarMensagem("bot", `<div class="an-progresso" role="status"><span>🔬 Analisando o projeto (${E.projeto.arquivos.size} arquivos)…</span> <progress max="1" value="0"></progress> <button class="an-mini an-cancelar">⏹ Cancelar</button></div>`);
    let cancelou = false;
    msg.querySelector(".an-cancelar").onclick = () => { cancelou = true; };
    WCDEV.projeto.analisarAsync(arquivos, {
      cancelado: () => cancelou,
      aoProgresso: (i, n, nome) => { const pr = msg.querySelector("progress"); if (pr) { pr.max = n; pr.value = i - 1; } const sp = msg.querySelector("span"); if (sp) sp.textContent = `🔬 Analisando ${nome} (${i}/${n})…`; },
    }).then(res => {
      if (res.cancelado) { msg.querySelector(".balao").innerHTML = formatar("⏹ Análise do projeto **cancelada**."); return; }
      const r = analisarProjetoChat(arquivos, res);
      msg.querySelector(".balao").innerHTML = formatar(r.texto);
      if (typeof Historico !== "undefined") Historico.adicionar({ q: "bot", t: r.texto, s: r.sugestoes || [] });
    }).catch(e => { msg.querySelector(".balao").innerHTML = formatar("Não consegui analisar o projeto: " + e.message); });
    return null;
  }
  if (temProjeto && /^corrig/i.test(resto.trim())) { E.salvarArquivoAtual(); return corrigirProjetoChat(Object.fromEntries(E.projeto.arquivos)); }
  return { texto: `### 🗂 Analisar um projeto inteiro (vários arquivos)
Quando o gamemode está dividido em vários arquivos ({{.pwn}} + {{.inc}}), eu junto tudo **como o compilador faz** (seguindo os {{#include}}) e analiso junto. Assim eu acho coisas que um arquivo sozinho não mostra: função criada duas vezes, variável usada antes de existir, comando repetido, dinheiro mudado de um jeito num arquivo e de outro jeito em outro, campo que não é salvo...

**Jeito 1 (PC e celular):** abra o **editor** e toque em **📁 Projeto** → escolha os arquivos (ou a pasta {{gamemodes}}). Depois toque em **🔬 Analisar projeto**.
**Jeito 2:** cole aqui todos os arquivos, cada um começando com uma linha assim:
~~~pawn
// arquivo: gamemode.pwn
#include <a_samp>
#include "sistemas/xp.inc"
...
// arquivo: sistemas/xp.inc
stock DarXP(playerid, xp) { ... }
~~~
Se faltar um arquivo que é incluído, eu aviso e **não** dou nada que dependa dele como certo.${temProjeto ? `\n\nVocê tem um projeto aberto no editor com **${E.projeto.arquivos.size}** arquivo(s).` : ""}`, sugestoes: temProjeto ? ["/projeto analisar", "/projeto corrigir"] : ["/editor"] };
}
function listarAnalises(resto) {
  const H = WCDEV.analiseHistorico;
  if (!H) return null;
  if (/apagar|limpar/i.test(resto || "")) { H.apagarTudo(); return { texto: "🗑 Apaguei o histórico de análises (só deste aparelho)." }; }
  const l = H.lista().slice().reverse();
  if (!l.length) return { texto: "Ainda não tem análise guardada. Cole um código Pawn que eu analiso (e da próxima vez comparo o antes e o depois)." };
  const c = x => `❌ ${x.contagens.erro + x.contagens.sintaxe} · ⚠️ ${x.contagens.provavel} · 🔍 ${x.contagens.verificar}`;
  return { texto: `### 🕘 Últimas análises (guardadas só neste aparelho)\n` + l.slice(0, 12).map((x, i) => `- **${i + 1}.** ${x.projeto ? "🗂 " : ""}${x.nome.replace(/^projeto:/, "projeto ")} — ${H.quandoTexto(x.quando)} — ${c(x)}`).join("\n") +
    "\n\nQuando você analisa o **mesmo código de novo** (mesmo arquivo, ou o código corrigido), o painel mostra o que foi **resolvido**, o que é **novo** e o que **continua**.", sugestoes: ["/analises apagar", "/versoes"] };
}
function listarVersoes() {
  const H = WCDEV.analiseHistorico;
  const v = H ? H.versoes().slice().reverse() : [];
  if (!v.length) return { texto: "Ainda não tem versão guardada. Eu guardo a versão anterior sempre que uma correção é aplicada no editor ou no projeto." };
  return { texto: "### 💾 Versões guardadas (as mais novas primeiro)\n" + v.map(x => `- **${x.id}** — ${H.quandoTexto(x.quando)} — ${x.motivo} (${x.conteudo.tipo === "projeto" ? Object.keys(x.conteudo.arquivos).length + " arquivos" : (x.conteudo.codigo || "").split("\n").length + " linhas"})`).join("\n") + "\n\nPra voltar: {{/voltar versao ID}} (vai pro editor; nada é apagado).", sugestoes: [] };
}
function voltarVersao(id) {
  const H = WCDEV.analiseHistorico, E = WCDEV.editor;
  const v = H && id ? H.versao(id) : null;
  if (!v) return { texto: "Não achei essa versão. Veja a lista em **/versoes**." };
  if (v.conteudo.tipo === "projeto") { E.abrirProjeto(v.conteudo.arquivos, "versão " + id); return { texto: `↩ Abri a versão **${id}** do projeto no editor (${Object.keys(v.conteudo.arquivos).length} arquivos).` }; }
  E.abrir(v.conteudo.lang || "pawn"); E.colocar(v.conteudo.codigo, v.conteudo.lang || "pawn");
  return { texto: `↩ Coloquei a versão **${id}** no editor.` };
}

/* ---------- Corrigir e explicar código ---------- */
function corrigirCodigo(codigo, lang) {
  const proj = Projeto_doTexto(codigo);
  if (proj) return corrigirProjetoChat(proj);
  const r = WCDEV.corretor && WCDEV.corretor.corrigir(codigo, lang);
  if (!r) return { texto: "Não consegui descobrir a linguagem desse código. Abra o **editor**, escolha a linguagem e toque em **🔧 Corrigir**.", sugestoes: ["/editor"] };
  if (r.lang === "pawn" && WCDEV.analisador) return corrigirPawn(codigo, r);
  atualizarLang(r.lang);
  if (!r.mudancas.length) {
    if (!r.antes) return { texto: `> 🧠 Revisei o código ${NOMES[r.lang]} inteiro.\n✅ **Não achei nada pra corrigir.** Se mesmo assim não funciona, me conta o que acontece (ou a mensagem de erro) que eu te ajudo.`, sugestoes: ["/explicar"] };
    return { texto: `> 🧠 Achei ${r.antes} erro(s), mas eles precisam de uma decisão sua (não dá pra eu adivinhar o que você queria):\n` +
      r.restantes.map(e => `- **Linha ${e.linha}:** ${e.msg}`).join("\n"), sugestoes: ["/explicar", "/editor"] };
  }
  estado.ultimoCodigo = { codigo: r.codigo, lang: r.lang };
  r.mudancas.sort((a, b) => a.n - b.n);
  let texto = `> 🧠 Li o código, fiz ${r.mudancas.length} correção(ões) e revisei de novo: ${r.restantes.length ? `ainda sobrou ${r.restantes.length} ponto(s) pra você olhar.` : "agora está **sem erros**."}\n`;
  texto += `### 🔧 Código corrigido\n~~~${r.lang}\n${r.codigo}\n~~~\n**O que eu mudei e por quê:**\n`;
  texto += r.mudancas.map(m => `- **Linha ${m.n}:** ${m.o}. Por quê? ${m.porque.charAt(0).toUpperCase() + m.porque.slice(1)}`).join("\n");
  if (r.restantes.length) texto += `\n\n**Ainda precisa da sua atenção:**\n${r.restantes.map(e => `- **Linha ${e.linha}:** ${e.msg}`).join("\n")}`;
  texto += "\n\nCompare com o seu código pra aprender o que mudou. 😉";
  return { texto, sugestoes: ["colocar no editor", "/explicar"] };
}

function explicarCodigo(codigo, lang) {
  if (!WCDEV.explicador) return null;
  lang = lang || (WCDEV.revisor && WCDEV.revisor.detectar(codigo)) || estado.lang || "pawn";
  atualizarLang(lang);
  estado.ultimoCodigo = { codigo, lang };
  const r = WCDEV.revisor ? WCDEV.revisor.analisar(codigo, lang) : null;
  const erros = r ? r.problemas.filter(p => p.tipo === "erro").length : 0;
  let texto = `> 🧠 Li o seu código ${NOMES[lang]} e vou explicar o que cada parte faz, em português.\n`;
  let achouPawn = 0;
  if (lang === "pawn" && WCDEV.analisador) {
    // antes de explicar, a análise: se tem bug, a pessoa precisa saber ANTES de aprender com o código
    const a = WCDEV.analisador.analisar(codigo, "pawn");
    const c = resumoAnalise(a);
    achouPawn = c.sintaxe + c.erro + c.provavel;
    if (WCDEV.motor) WCDEV.motor.passo("Análise", `antes de explicar: ${c.sintaxe} de sintaxe, ${c.erro} confirmado(s), ${c.provavel} provável(is), ${c.verificar} pra verificar`);
    if (c.sintaxe + c.erro + c.provavel + c.verificar) {
      texto = `> 🧠 Antes de explicar, analisei o código (sintaxe, lógica e segurança).\n### 🔬 Antes de tudo: o que eu achei\n` + WCDEV.analisador.relatorio(a, { curto: true }) +
        "\n\nPra ver o **porquê** e a **correção** de cada um, peça **\"revisa esse código\"**. Agora a explicação 👇\n";
    } else texto = "> 🧠 Analisei o código antes (sintaxe, lógica e segurança) e não achei problemas. Agora a explicação 👇\n";
  }
  texto += WCDEV.explicador.explicar(codigo, lang);
  if (r && r.resumo) texto += "\n\n**Resumindo:** " + r.resumo;
  if (erros && lang !== "pawn") texto += `\n\n⚠️ Também achei **${erros} erro(s)** nesse código. Toque em **/corrigir** que eu conserto e explico.`;
  const temProblema = erros || achouPawn;
  return { texto, sugestoes: temProblema ? ["/corrigir", "revisa esse código", "/editor"] : ["/editor", `/desafio ${lang}`] };
}

// o código mais recente: do chat, ou o que está no editor
function codigoAtual() {
  const doEditor = document.getElementById("editorCodigo");
  if (estado.ultimoCodigo) return estado.ultimoCodigo;
  if (doEditor && doEditor.value.trim()) return { codigo: doEditor.value, lang: document.getElementById("editorLang").value };
  return null;
}

// tira frases tipo "corrige isso:" do começo de um código colado
function separarCodigo(bruto) {
  const linhas = bruto.split("\n");
  const pedido = [];
  while (linhas.length > 1 && /^[a-zà-ú0-9\s,!?.'"-]+:?\s*$/i.test(linhas[0].trim()) && !/[;{}()<>=]/.test(linhas[0])) pedido.push(linhas.shift());
  separarCodigo.pedido = pedido.join(" ");
  return linhas.join("\n");
}

/* ---------- acha o melhor tema pra uma frase ---------- */
function melhorTema(t, lang, soDaLinguagem) {
  let melhor = null, pontos = 0, segundo = null, pontos2 = 0;
  const t2 = semArtigos(t);
  for (const tema of WCDEV.temas) {
    if (soDaLinguagem && lang && tema.lang !== lang) continue;
    const p = pontuar(tema, t, lang, t2);
    if (p > pontos) { segundo = melhor; pontos2 = pontos; melhor = tema; pontos = p; }
    else if (p > pontos2 && tema !== melhor) { segundo = tema; pontos2 = p; }
  }
  return { tema: melhor, pontos, segundo, pontos2 };
}
function buscarTema(t, lang) {
  if (lang) {   // primeiro dentro da linguagem pedida
    const r1 = melhorTema(t, lang, true);
    if (r1.tema && r1.pontos >= 3) return r1.tema;
  }
  const r = melhorTema(t, lang);
  if (r.tema && r.pontos >= 3) return r.tema;
  return buscaPorPalavras(t, lang);
}
function acharPorNome(nome) {
  const n = normalizar(nome);
  return WCDEV.temas.find(x => x._titulo === n && x.lang !== "conversa") || buscarTema(n, estado.lang);
}

/* ---------- O cérebro ---------- */
function pensar(entrada) {
  const M = WCDEV.motor;
  if (M) M.comecar(entrada.trim());
  const r = pensarInterno(entrada);
  if (M) M.terminar(r);
  return r;
}

function pensarInterno(entrada) {
  const M = WCDEV.motor;
  const bruto = entrada.trim();
  const t0 = normalizar(bruto);

  // ===== Comandos =====
  // caça ao bug em andamento: a resposta (número da linha, /dica, desisto) é pra ela
  if (estado.caca && WCDEV.professorAdaptativo) { const r = WCDEV.professorAdaptativo.responderCaca(bruto); if (r) return r; }
  // vários arquivos colados ("// arquivo: x.pwn" ...): é um projeto, não um comando
  const projetoColado = Projeto_doTexto(bruto);
  if (projetoColado && Object.keys(projetoColado).some(k => /\.(pwn|inc|p)$/i.test(k))) return analisarProjetoChat(projetoColado);
  if (bruto.startsWith("/") && !bruto.startsWith("//") && !bruto.startsWith("/*")) {
    const [cmd, arg] = bruto.toLowerCase().split(/\s+/);
    const resto = bruto.slice(cmd.length).trim();
    const langArg = NOMES[arg] ? arg : null;
    if (cmd === "/js") return pensar("/javascript");
    if (["/python", "/html", "/css", "/pawn", "/javascript"].includes(cmd)) {
      const lang = cmd.slice(1);
      atualizarLang(lang);
      estado.ultimaAula = null;
      return listarTopicos(lang);
    }
    if (cmd === "/proximo" || cmd === "/próximo") return proximaAula();
    if (cmd === "/indice" || cmd === "/índice") return indice(langArg || estado.lang);
    if (cmd === "/limpar") { limparChat(); return null; }
    if (cmd === "/ajuda") return usarTema(WCDEV.temas.find(x => x.id === "ajuda"));
    if (cmd === "/treinar" || cmd === "/treino") return Treino.iniciar(langArg || estado.lang);
    if (cmd === "/desafio" || cmd === "/desafios") {
      if (/^(da |desta |dessa )?aula$/i.test(resto) && WCDEV.professor) return WCDEV.professor.abrirDesafioDaAula(estado.ultimaAula);
      if (/^sobre\s+/i.test(resto)) {
        const d = WCDEV.desafios.sobre(acharPorNome(resto.replace(/^sobre\s+/i, "")));
        return d ? Treino.abrir(d) : { texto: "Não achei esse assunto pra montar um desafio. Tente {{/desafio pawn}}." };
      }
      const l = langArg || estado.lang || "pawn";
      const nivel = parseInt((resto.match(/\d/) || [])[0], 10) || (WCDEV.professor ? WCDEV.professor.nivelAdaptado(l) : null);
      const r = Treino.abrir(WCDEV.desafios.gerar(l, nivel));
      if (r && r.texto && WCDEV.professor && !/\d/.test(resto)) r.texto = `> 🧠 Escolhi o nível ${WCDEV.professor.explicarNivel(l)} pelo seu desempenho.\n` + r.texto;
      return r;
    }
    if (cmd === "/missao" || cmd === "/missão" || cmd === "/missoes") return Treino.abrir(WCDEV.desafios.missao(langArg || estado.lang || "pawn"));
    if (cmd === "/corrigir" || cmd === "/explicar") {
      const c = resto && resto.length > 8 ? { codigo: resto, lang: null } : codigoAtual();
      if (!c) return { texto: `Cole o código aqui no chat (ou escreva no **editor**) e depois use **${cmd}**.`, sugestoes: ["/editor"] };
      return cmd === "/corrigir" ? corrigirCodigo(c.codigo, c.lang) : explicarCodigo(c.codigo, c.lang);
    }
    if (cmd === "/noeditor") {
      const c = estado.ultimoCodigo;
      if (!c) return { texto: "Ainda não tenho nenhum código pra colocar no editor." };
      Editor.colocar(c.codigo, c.lang);
      return { texto: "Coloquei o código no **editor** ✍️ Agora é só testar e mudar o que quiser." };
    }
    if (cmd === "/dica") return Treino.dica();
    if (cmd === "/resposta" || cmd === "/solucao") return Treino.resposta();
    if (cmd === "/pular") return Treino.pular();
    if (cmd === "/sair") return Treino.sair();
    if (cmd === "/zerar") return Treino.zerar(langArg);
    if (cmd === "/porque" || cmd === "/pensamento") return M ? M.explicarRastro() : null;
    if (cmd === "/resumo") return M ? M.resumo() : null;
    if (cmd === "/suporte" || cmd === "/whatsapp" || cmd === "/zap") return suporteWhatsApp(resto);
    if (cmd === "/modelo") return WCDEV.modeloLocal ? WCDEV.modeloLocal.painel() : null;
    if (cmd === "/reanalisar") { const c = codigoAtual(); if (!c) return { texto: "Não tenho código pra analisar de novo. Cole aqui ou abra no editor." }; return Projeto_doTexto(c.codigo) ? analisarProjetoChat(Projeto_doTexto(c.codigo)) : analisarPawn(c.codigo); }
    if (cmd === "/analises" || cmd === "/análises") return listarAnalises(resto);
    if (cmd === "/versoes" || cmd === "/versões") return listarVersoes();
    if (cmd === "/voltar" && /^vers/i.test(resto)) return voltarVersao(resto.split(/\s+/)[1]);
    if (cmd === "/projeto") return comandoProjeto(resto);
    const PA = WCDEV.professorAdaptativo;
    if (PA && cmd === "/modo") return PA.modos(resto);
    if (PA && (cmd === "/caca" || cmd === "/caça")) return PA.caca();
    if (PA && (cmd === "/revisao" || cmd === "/revisão")) return PA.revisao(langArg);
    if (PA && cmd === "/reiniciar") return PA.reiniciar(resto);
    if (cmd === "/ia") {
      if (!WCDEV.modeloLocal) return null;
      if (!resto) return { texto: "Escreva a pergunta depois: {{/ia como faço um sistema de casas?}}", sugestoes: ["/modelo"] };
      if (!WCDEV.modeloLocal.ativo()) return { texto: "O modelo local está **desligado**. Veja como ligar em **/modelo** (precisa de um modelo rodando no seu PC).", sugestoes: ["/modelo"] };
      WCDEV.modeloLocal.perguntar(resto);   // assíncrono: a resposta vai aparecendo sozinha
      return null;
    }
    const AP = WCDEV.aprendizagem;
    if (AP) {
      if (cmd === "/importar") return AP.abrirSeletor();
      if (cmd === "/importados") return AP.listarImportados();
      if (cmd === "/desfazer" && /^importa/i.test(resto)) return AP.desfazer();
      if (cmd === "/apagar" && /^importa\S*\s+\S+/i.test(resto)) return AP.desfazer(resto.split(/\s+/)[1]);
      if (cmd === "/apagar" && /^regra\s+\S+/i.test(resto)) return AP.apagarRegra(resto.split(/\s+/)[1]);
      if (cmd === "/regra") return AP.criarRegra(bruto);
      if (cmd === "/regras") return AP.listarRegras();
      if (cmd === "/feedback") return /export/i.test(resto) ? AP.exportarFeedback() : AP.listarFeedback();
      if (cmd === "/aprendizado" || cmd === "/aprendizagem") return AP.comoAprendo();
      if (cmd === "/base" && /verific/i.test(resto)) return AP.verificarBase();
      if (cmd === "/obsoleto") return AP.marcarObsoleto(resto.split(/\s+/)[0]);
      if (cmd === "/verificar" && /^importad/i.test(resto)) return AP.marcarVerificado(resto.split(/\s+/)[1]);
    }
    if (cmd === "/progresso" || cmd === "/boletim") return WCDEV.professor ? WCDEV.professor.boletim() : Treino.status();
    if (cmd === "/ensinar") return Aprendizado.ensinar(bruto);
    if (cmd === "/esquecer") return Aprendizado.esquecer(bruto);
    if (cmd === "/aprendidos") return Aprendizado.listar();
    if (cmd === "/revisar" || cmd === "/editor") {
      Editor.abrir(langArg || estado.lang || "pawn");
      return { texto: cmd === "/editor"
        ? "Abri o **editor** ✍️ Escreva seu código lá: dá pra **Revisar**, **Corrigir**, **Explicar** ou **Enviar resposta** (no treino)."
        : "Abri o **editor** 🔎 Cole ou escreva seu código lá e toque em **Revisar**. Também dá pra colar o código direto aqui no chat." };
    }
    return { texto: `Não conheço o comando {{${cmd}}}. Digite {{/ajuda}} para ver os comandos.` };
  }

  if (t0 === " colocar no editor ") return pensar("/noeditor");
  if (/^ (caca ao bug|caça ao bug|cacar bug|achar o bug|treinar revisao de codigo) $/.test(t0)) return pensar("/caca");
  if (/^ (modos?|como quero estudar|modo de estudo) $/.test(t0)) return pensar("/modo");
  if (/^ (desafio desta aula|desafio da aula|fazer o desafio|fazer o desafio da aula|quero o desafio) $/.test(t0)) return pensar("/desafio da aula");
  if (/^ (como (voce|vc) aprende|voce aprende|vc aprende|voce e treinada|voce treina|como funciona seu aprendizado|voce aprende sozinha|voce aprende com a gente) ?$/.test(t0)) return pensar("/aprendizado");
  if (/^ (resume|resumo|resuma|faz um resumo|me da um resumo)( d[ae])?( (a|essa|esta|nossa))?( conversa| papo| que a gente fez| que fizemos)? $|^ o que a gente (fez|viu)( ate agora)? $/.test(t0)) return pensar("/resumo");
  if (/^ (proximo passo|ir pro proximo passo|proxima aula|bora pro proximo|bora|proximo) $/.test(t0) && !Treino.ativo) return pensar("/proximo");
  if (/^ (proximo passo|ir pro proximo passo|proxima aula|comecar|comecar a trilha|comecar do comeco|bora comecar|comecar a aula 1) $/.test(t0)) return pensar("/proximo");

  // ===== Teste rápido =====
  if (estado.quiz) {
    const r = WCDEV.cerebro.responderQuiz(bruto);
    if (r) return r;
    estado.quiz = null;   // falou de outra coisa: esquece a pergunta
  }
  if (/^ (teste rapido|outra pergunta|me testa|me testa ai|me faz uma pergunta|me pergunta|quiz|quero um teste|faz uma pergunta) $/.test(t0) || t0 === " /quiz ") {
    const q = WCDEV.cerebro.quiz(estado.ultimo && estado.ultimo.lang !== "conversa" ? estado.ultimo : estado.ultimaAula);
    return q || { texto: "Primeiro me pergunta alguma coisa (ou escolhe uma trilha) que depois eu te testo! 😄", sugestoes: ["/pawn", "/python"] };
  }
  if (/^ (continuar de onde parei|continuar|continua de onde parei|onde parei) $/.test(t0)) {
    const id = Treino.progresso && Treino.progresso._ultima;
    const aula = id && WCDEV.temas.find(x => x.id === id);
    if (aula) { estado.ultimaAula = aula; atualizarLang(aula.lang); return proximaAula(); }
  }

  if (M && /^ (como (voce|vc) (pensou|chegou nisso|chegou nessa resposta)|por que (voce )?respondeu isso|porque respondeu isso|como pensou) $/.test(t0)) return M.explicarRastro();

  // ===== Referências ao que já foi conversado ("agora corrige", "explica esse código", "faz igual pro colete") =====
  if (M && !bruto.includes("\n")) {
    const ref = M.linhaN(t0) || M.erroContinua(t0) || M.mesmaCoisaEmOutra(t0) || M.referencia(t0, bruto) || M.fazIgual(t0, bruto);
    if (ref) return ref;
  }

  // ===== Mensagem de erro do compilador / Python colada =====
  if (WCDEV.professor && WCDEV.professor.ehMensagemDeErro(bruto)) {
    const r = WCDEV.professor.explicarErros(bruto);
    if (r) return r;
  }
  if (/^ (meu progresso|boletim|meu boletim|meu nivel|qual meu nivel|como estou|como eu to|quanto eu aprendi) $/.test(t0)) return pensar("/boletim");

  // ===== "explica fácil" / "faz uma comparação" (sozinho ou com o assunto: "explica fácil o que é array") =====
  const FACIL = / (facil|mais facil|de um jeito facil|pra leigo|como se eu tivesse \d+ anos|como se eu fosse crianca|de forma simples|simplifica|com uma comparacao|faz uma comparacao|exemplo da vida real|exemplo do dia a dia|com analogia|uma analogia) /;
  if (WCDEV.professor && FACIL.test(t0) && t0.split(" ").length < 16 && !bruto.includes("\n") &&
      /^ (me )?(explica|explique|explicar|pode explicar|o que e|oque e|faz|da|com|de um jeito|facil|mais facil|simplifica|traduz) /.test(t0)) {
    const resto = t0.replace(FACIL, " ").replace(/ (explica|explique|me|explicar|de|um|uma|jeito|o|a|que|e|eh|sobre|pra|mim|mais|da|faz|com|exemplo) /g, " ").replace(/ (explica|explique|me|explicar|de|um|uma|jeito|o|a|que|e|eh|sobre|pra|mim|mais|da|faz|com|exemplo) /g, " ").trim();
    const ultimo = estado.ultimo && estado.ultimo.lang !== "conversa" ? estado.ultimo : (estado.ultimaAula || estado.ultimo);
    const alvo = resto.length > 2 ? (buscarTema(normalizar(resto), estado.lang) || { titulo: resto, chaves: [resto] }) : ultimo;
    const a = alvo && (WCDEV.professor.analogia(" " + normalizar(resto) + " ") || WCDEV.professor.analogia(alvo));
    if (a) {
      if (alvo.id) estado.ultimo = alvo;
      return { texto: `> 🧠 Bora sem termo técnico, com uma comparação do dia a dia.\n### 💡 Explicando fácil${alvo.titulo ? ": " + alvo.titulo : ""}\n${a}\n\nFez sentido? Se quiser, eu te mostro **um exemplo** em código ou te faço um **teste rápido**.`, sugestoes: alvo.id ? ["outro exemplo", "teste rápido", "/proximo"] : ["/pawn", "/python"] };
    }
    if (ultimo && !resto && WCDEV.cerebro) { const r = WCDEV.cerebro.continuar("melhor", ultimo); if (r) return r; }
    if (!alvo) return { texto: "Claro! Me fala **qual assunto** você quer que eu explique fácil, tipo: **\"explica fácil o que é variável\"** ou **\"explica fácil callback\"**.", sugestoes: ["explica fácil variável", "explica fácil callback", "explica fácil loop"] };
  }

  // ===== Código colado no chat =====
  const codigo = separarCodigo(bruto);
  if (WCDEV.revisor && WCDEV.revisor.pareceCodigo(codigo)) {
    const pedido = normalizar(separarCodigo.pedido || "");
    if (/ (explica|explique|o que faz|oque faz|entender|entendo|significa)/.test(pedido)) return explicarCodigo(codigo);
    if (/ (corrig|arrum|consert|resolv|ajeit|fix|conserta|erro|bug)/.test(pedido)) return corrigirCodigo(codigo);
    if (Treino.ativo) return Treino.corrigir(codigo);
    const r = revisarCodigo(codigo);
    if (r) return r;
  }

  // ===== Nome exato de algo que eu sei (ex: botões) =====
  // primeiro o nome escrito igualzinho (":checked", "&copy;"), depois sem acento/símbolo, preferindo a linguagem atual
  const exato = WCDEV.temas.find(x => x.lang !== "conversa" && (x.botao === bruto || x.titulo === bruto)) ||
    WCDEV.temas.find(x => x._titulo === t0 && !x.exato && x.lang !== "conversa" && x.lang === estado.lang) ||
    WCDEV.temas.find(x => x._titulo === t0 && !x.exato && x.lang !== "conversa");
  if (exato) { if (M) M.passo("Busca", `nome exato: "${exato.titulo}"`); return usarTema(exato, { intent: "geral", correcoes: [] }); }
  if (M) { const fd = M.funcaoDesconhecida(bruto, t0); if (fd) return fd; }

  // ===== Entender a frase =====
  const pre = WCDEV.cerebro ? WCDEV.cerebro.preprocessar(bruto) : { texto: t0, correcoes: [] };
  const t = pre.texto;
  const intent = WCDEV.cerebro ? WCDEV.cerebro.intencao(t) : "geral";
  const langDita0 = detectarLinguagem(t);
  const langDita = langDita0 === "html" && ASSUNTO_CSS.test(t) ? "css" : langDita0;
  const lang = langDita;
  const provavel = !langDita ? langProvavel(t) : null;
  if (M) {
    if (pre.correcoes.length) M.passo("Correção", pre.correcoes.map(([a, b]) => `"${a}" → "${b}"`).join(", "));
    const pedeCodigo = / (cria|crie|criar|faz|faca|gera|gere|monta|monte|escreve|escreva) /.test(t) && / (sistema|comando|codigo|script|funcao|pagina|site|programa|cmd) /.test(t);
    if (pedeCodigo) M.passo("Intenção", "quer que eu escreva código"); else M.passo("Intenção", { comparar: "comparar duas coisas", melhor: "explicar melhor", outroExemplo: "outro exemplo", desafio: "quer praticar", definicao: "quer saber o que é", exemplo: "quer um exemplo", erro: "tem um erro/problema", como: "quer saber como fazer", geral: "pergunta geral" }[intent] || intent);
    M.passo("Linguagem", langDita ? `${NOMES[langDita]} (você falou)` : provavel ? `${NOMES[provavel]} (pelo assunto)` : estado.lang ? `${NOMES[estado.lang]} (da conversa)` : "não definida");
  }

  if (/^ (proximo|proxima|continua|continuar|mais|segue|bora|proxima aula) $/.test(t)) return proximaAula();

  // tecnologia que eu não ensino / pedido sem detalhe / "deu erro" sem código
  if (M) {
    const r = M.foraDaBase(t, bruto) || M.diagnosticar(t, lang) || M.faltaDetalhe(t) || M.semCodigo(t);
    if (r) return r;
  }

  // continuação do último assunto ("explica melhor", "outro exemplo", "não entendi")
  if (estado.ultimo && WCDEV.cerebro && WCDEV.cerebro.ehContinuacao(t) && !lang) {
    const tipo = ["como", "exemplo", "erro"].includes(intent) ? "melhor" : intent;
    const r = WCDEV.cerebro.continuar(tipo, estado.ultimo);
    if (r) return r;
  }

  // quer construir um projeto: monta o roteiro de estudo
  if (WCDEV.professor) {
    const r = WCDEV.professor.roteiro(t);
    if (r) return r;
  }

  // pediu desafio / missão
  if (intent === "desafio" && WCDEV.desafios) {
    const l = lang || estado.lang || "pawn";
    if (/ (missao|missoes|projeto) /.test(t)) return Treino.abrir(WCDEV.desafios.missao(l));
    return Treino.abrir(WCDEV.desafios.gerar(l, / (facil|iniciante) /.test(t) ? 1 : / (dificil|avancado) /.test(t) ? 3 : (WCDEV.professor ? WCDEV.professor.nivelAdaptado(l) : null)));
  }

  // pediu pra eu escrever um código
  if (WCDEV.gerador) {
    const g = WCDEV.gerador.tentar(bruto, t, lang || provavel);
    if (g) {
      if (lang) atualizarLang(lang);
      estado.ultimoPedido = bruto;
      if (estado.ultimoCodigo) estado.ultimoCodigo.origem = "gerador";
      if (M) M.passo("Geração", "montei o código a partir do seu pedido e passei no revisor");
      return g;
    }
  }

  // comparação ("diferença entre for e while")
  if (intent === "comparar" && WCDEV.cerebro) {
    const r = WCDEV.cerebro.comparar(t, lang || estado.lang, buscarTema);
    if (r) return r;
  }

  const conta = calcular(t0);
  if (conta) return conta;
  const hora = horaOuData(t);
  if (hora) return hora;

  // "e em pawn?" -> mesmo assunto em outra linguagem
  if (lang) {
    const mesmo = mesmaCoisaEm(t, lang);
    if (mesmo) return usarTema(mesmo, { intent, correcoes: pre.correcoes, textoOriginal: t });
  }

  const fora = foraDoAssunto(t);
  if (fora) return fora;

  // compara a frase corrigida com a original e fica com a que entende melhor (as duas com sinônimos)
  const tExp = M ? M.expandir(t) : t;
  if (M && tExp !== t) M.passo("Sinônimos", "também procurei por: " + tExp.slice(t.length).trim().split(" ").join(", "));
  // primeiro procura com as palavras da pessoa; os sinônimos só ganham se acharem algo claramente melhor
  let achado = melhorTema(t, lang || provavel);
  if (tExp !== t) {
    const comSinonimos = melhorTema(tExp, lang || provavel);
    if (comSinonimos.tema && (achado.pontos < 5 || comSinonimos.pontos >= achado.pontos + 3)) achado = comSinonimos;
  }
  if (t !== t0) {
    const semCorrigir = melhorTema(t0, lang || provavel);
    if (semCorrigir.pontos > achado.pontos) { achado = semCorrigir; pre.correcoes = []; }
  }
  // achou algo, mas com pouca certeza e sem falar do assunto da pergunta? melhor admitir do que inventar
  if (M && achado.tema && achado.pontos < 7 && !M.cobre(achado.tema, tExp)) {
    M.passo("Busca", `"${achado.tema.titulo}" teve só ${achado.pontos} ponto(s) e não fala do assunto: descartei`);
    achado = { tema: null, pontos: 0, segundo: null, pontos2: 0 };
  }
  const { tema: melhor, pontos: melhorPontos, segundo, pontos2 } = achado;
  const ctx = {
    intent, correcoes: pre.correcoes, textoOriginal: t, porAssunto: !!(provavel && melhor && melhor.lang === provavel),
    langPorContexto: !!(melhor && !lang && !provavel && estado.lang && melhor.lang === estado.lang && melhor.lang !== "conversa"),
    relacionado: intent === "como" && segundo && pontos2 >= 6 && pontos2 >= melhorPontos * 0.7 && melhor && segundo.lang === melhor.lang &&
      segundo.lang !== "conversa" && segundo.titulo !== melhor.titulo ? segundo : null,
  };

  // só falou o nome da linguagem ("quero aprender python")
  if (lang && (!melhor || melhor.lang === "conversa" || melhorPontos < 4) && !(melhor && melhor.aprendido)) {
    const porPalavra = buscaPorPalavras(t, lang);
    if (porPalavra && porPalavra.lang === lang && t.trim().split(" ").length > 2 + (/(aprender|estudar|ensina)/.test(t) ? 9 : 0)) return usarTema(porPalavra, ctx);
    atualizarLang(lang);
    estado.ultimaAula = null;
    return listarTopicos(lang);
  }

  if (melhor) {
    if (M) {
      M.passo("Busca", `achei "${melhor.titulo}" (${NOMES[melhor.lang] || "conversa"}) com ${melhorPontos} pontos` + (ctx.relacionado ? ` + juntei "${ctx.relacionado.titulo}"` : ""));
      if (ctx.langPorContexto) M.passo("Contexto", `a pergunta não dizia a linguagem: segui em ${NOMES[melhor.lang]}, que é o que estávamos vendo`);
    }
    return usarTema(melhor, ctx);
  }

  const porPalavra = buscaPorPalavras(tExp, lang || provavel);
  if (porPalavra && (!M || M.cobre(porPalavra, tExp))) {
    if (M) M.passo("Busca", `achei "${porPalavra.titulo}" pelas palavras-chave`);
    return usarTema(porPalavra, { ...ctx, langPorContexto: !lang && porPalavra.lang === estado.lang });
  }

  const quis = parecidos(t, lang);
  if (quis.length) return { texto: "> 🧠 Não achei exatamente isso, mas achei coisas com nome parecido.\nVocê quis dizer:", sugestoes: quis };

  if (!pareceProgramacao(t) && t.trim().split(" ").length >= 3) {
    const fa = WCDEV.foraDoAssunto;
    if (fa) return { texto: fa.respostas[0], sugestoes: ["/treinar", "quero aprender pawn", "/ajuda"] };
  }
  // é de programação, mas eu não tenho isso na base: falo a verdade
  if (M && M.palavrasDoAssunto(t).length) return M.naoSei(t, lang || provavel);

  const sugestoes = estado.lang
    ? temasDa(estado.lang).slice(0, 4).map(x => x.titulo)
    : ["quero aprender pawn", "quero aprender python", "/treinar"];
  return {
    texto: `Hmm, não entendi muito bem 🤔\nTenta perguntar de outro jeito, tipo: **"como criar comando no samp"**, **"o que é append"** ou **"cria um comando /cura que dá 100 de vida"**.\nVocê também pode colar um código pra eu revisar, corrigir ou explicar.`,
    sugestoes,
  };
}

/* ---------- Envio ---------- */

function enviar(texto) {
  texto = texto.trim();
  if (!texto) return;
  if (!Historico.atualId) Historico.nova();
  adicionarMensagem("user", escapar(texto).replace(/\n/g, "<br>"));
  Historico.adicionar({ q: "user", t: texto });
  elTexto.value = "";
  ajustarAltura();
  elSidebar.classList.remove("aberta");
  const resposta = pensar(texto);
  if (resposta) responder(resposta);
}

// código que vem do editor: aparece no chat como bloco de código
function enviarCodigo(codigo, lang, modo) {
  if (!Historico.atualId) Historico.nova();
  const bloco = `~~~${lang}\n${codigo}\n~~~`;
  adicionarMensagem("user", formatar(bloco));
  Historico.adicionar({ q: "user", t: bloco, codigo: true, titulo: `Código ${NOMES[lang]}` });
  atualizarLang(lang);
  estado.ultimoCodigo = { codigo, lang };
  const resposta = modo === "treino" && Treino.ativo ? Treino.corrigir(codigo)
    : modo === "corrigir" ? corrigirCodigo(codigo, lang)
    : modo === "explicar" ? explicarCodigo(codigo, lang)
    : (revisarCodigo(codigo, lang) || { texto: "Não consegui analisar esse código. Escolha a linguagem certa no editor." });
  responder(resposta);
}

function limparChat() {
  elMensagens.innerHTML = "";
  if (WCDEV.motor) WCDEV.motor.limpar();
  Treino.ativo = null;
  Editor.fecharExercicio();
  atualizarLang(null);
  Historico.nova();
  marcarConversaAtiva();
  boasVindas();
  atualizarMemoria();
}

function boasVindas() {
  const tema = WCDEV.temas.find(x => x.id === "boas-vindas");
  if (!tema) {
    adicionarMensagem("bot", "<p>⚠️ Faltam arquivos de conteúdo (conversa.js, python.js, html.js, css.js, pawn.js) na mesma pasta do index.html.</p>");
    return;
  }
  let r = usarTema(tema);
  const nome = typeof Conta !== "undefined" && Conta.atual ? Conta.atual.nome : null;
  const ultima = Treino.progresso && Treino.progresso._ultima && WCDEV.temas.find(x => x.id === Treino.progresso._ultima);
  if (nome && ultima) {
    const hora = new Date().getHours();
    const sauda = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    const q = Treino.progresso._quiz;
    r = {
      texto: `### ${sauda}, ${nome}! Que bom te ver de novo 😄\nDa última vez você estava estudando **${ultima.titulo}** em ${NOMES[ultima.lang]}.` +
        (q && q.total ? ` E nos testes rápidos você já acertou **${q.certas} de ${q.total}**.` : "") +
        "\nQuer continuar de onde parou ou fazer outra coisa hoje?",
      sugestoes: ["continuar de onde parei", `/desafio ${ultima.lang}`, "teste rápido", "/ajuda"],
    };
    estado.ultimaAula = ultima;
  } else if (nome) r.texto = r.texto.replace("### Olá! Eu sou o WC DEV 👋", `### Olá, ${nome}! Eu sou o WC DEV 👋`);
  responder(r, true);   // a mensagem de boas-vindas não é salva
}

/* ---------- conversas salvas ---------- */
function abrirConversa(id) {
  const c = Historico.pegar(id);
  if (!c) return;
  elMensagens.innerHTML = "";
  if (WCDEV.motor) WCDEV.motor.limpar();
  Treino.ativo = null;
  Editor.fecharExercicio();
  atualizarLang(null);
  Historico.atualId = id;
  c.msgs.forEach(m => {
    if (m.q === "user") adicionarMensagem("user", m.codigo ? formatar(m.t) : escapar(m.t).replace(/\n/g, "<br>"));
    else adicionarMensagem("bot", formatar(m.t), m.s, m.p);
  });
  // recupera o contexto da conversa salva: o último código e a linguagem
  for (let i = c.msgs.length - 1; i >= 0; i--) {
    const m = (c.msgs[i].t || "").match(/~~~(\w+)\n([\s\S]*?)~~~/);
    if (m && NOMES[m[1]]) { estado.ultimoCodigo = { codigo: m[2].replace(/\n$/, ""), lang: m[1], origem: "conversa", turno: WCDEV.motor ? WCDEV.motor.turno : 0 }; atualizarLang(m[1]); break; }
  }
  elSidebar.classList.remove("aberta");
  marcarConversaAtiva();
  atualizarMemoria();
}

function listarConversas() {
  const el = document.getElementById("listaConversas");
  if (!el) return;
  const lista = Historico.todas();
  el.innerHTML = lista.length ? "" : '<div class="sem-conversas">Suas conversas aparecem aqui.</div>';
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const grupoDe = c => {
    const d = c.atualizado || c.criado || 0;
    if (d >= hoje.getTime()) return "Hoje";
    if (d >= hoje.getTime() - 86400000) return "Ontem";
    if (d >= hoje.getTime() - 7 * 86400000) return "Últimos 7 dias";
    return "Mais antigas";
  };
  let grupoAtual = null;
  lista.forEach(c => {
    const g = grupoDe(c);
    if (g !== grupoAtual && lista.length > 3) {
      grupoAtual = g;
      const t = document.createElement("div");
      t.className = "conversa-grupo";
      t.textContent = g;
      el.appendChild(t);
    }
    const item = document.createElement("div");
    item.className = "conversa" + (c.id === Historico.atualId ? " ativa" : "");
    const n = (c.msgs || []).length;
    item.innerHTML = `<button class="conversa-abrir" title="${escapar(c.titulo)} (${n} mensagens)"${c.id === Historico.atualId ? ' aria-current="true"' : ""}>${escapar(c.titulo)}</button><button class="conversa-apagar" title="Apagar conversa" aria-label="Apagar a conversa ${escapar(c.titulo)}">✕</button>`;
    item.querySelector(".conversa-abrir").onclick = () => abrirConversa(c.id);
    item.querySelector(".conversa-apagar").onclick = () => {
      if (!confirm(`Apagar a conversa "${c.titulo}"?`)) return;
      const eraAtual = c.id === Historico.atualId;
      Historico.apagar(c.id);
      if (eraAtual) limparChat(); else listarConversas();
    };
    el.appendChild(item);
  });
  if (lista.length > 1) {
    const b = document.createElement("button");
    b.className = "conversas-limpar";
    b.textContent = "Apagar todas as conversas";
    b.onclick = () => {
      if (!confirm("Apagar TODAS as conversas salvas neste aparelho? Isso não dá pra desfazer.")) return;
      Historico.todas().forEach(c => Historico.apagar(c.id));
      limparChat();
    };
    el.appendChild(b);
  }
}
function marcarConversaAtiva() { listarConversas(); }
WCDEV.aoMudarHistorico = listarConversas;

/* ---------- caixa do usuário (nome, dias, sair) ---------- */
function atualizarUsuario(st) {
  const el = document.getElementById("caixaUsuario");
  if (!el || !Conta.atual) return;
  const dias = st && st.ok ? st.dias : 0;
  el.innerHTML = `<div class="usuario-nome">👤 ${escapar(Conta.atual.nome)}</div>
    <div class="usuario-plano ${dias <= 2 ? "acabando" : ""}">${dias} dia${dias === 1 ? "" : "s"} restante${dias === 1 ? "" : "s"} · até ${st && st.expira ? Util.dataHora(st.expira) : "-"}</div>
    <div class="usuario-botoes"><button id="btnPlanos">Planos</button><button id="btnSair">Sair</button></div>`;
  el.querySelector("#btnPlanos").onclick = () => TelaConta.planos("Quer mais tempo? Escolha um plano:", true);
  el.querySelector("#btnSair").onclick = () => {
    Conta.sair();
    usuarioCarregado = null;
    elMensagens.innerHTML = "";
    TelaConta.checar();
  };
}
WCDEV.aoAtualizarLicenca = atualizarUsuario;

// chamado quando o login + plano estão ok
let usuarioCarregado = null;
function aoEntrar(st, acabouDeAtivar) {
  atualizarUsuario(st);
  if (usuarioCarregado === Conta.atual.u && !acabouDeAtivar) return;
  usuarioCarregado = Conta.atual.u;
  Treino.carregarUsuario();
  Aprendizado.carregar();
  if (WCDEV.aprendizagem) { WCDEV.aprendizagem.carregar(); WCDEV.aprendizagem.aplicarRegrasUsuario(); }
  Editor.carregarRascunho();
  limparChat();
  if (acabouDeAtivar) responder({ texto: `✅ **Plano ativado!** Você tem **${st.dias} dias** de acesso (até ${Util.dataHora(st.expira)}). Bons estudos! 🚀` }, true);
}

/* ---------- Eventos ---------- */

elForm.addEventListener("submit", e => { e.preventDefault(); enviar(elTexto.value); });

// Enter envia (Shift+Enter pula linha)
let shiftApertado = false;
elTexto.addEventListener("keydown", e => {
  shiftApertado = e.shiftKey;
  if ((e.key === "Enter" || e.keyCode === 13) && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    enviar(elTexto.value);
  }
});
elTexto.addEventListener("keyup", e => { shiftApertado = e.shiftKey; });

// Alguns teclados de celular não avisam o "keydown" do Enter: pega a quebra de linha aqui
elTexto.addEventListener("beforeinput", e => {
  if (shiftApertado) return;
  if (e.inputType === "insertLineBreak" || e.inputType === "insertParagraph") {
    e.preventDefault();
    enviar(elTexto.value);
  }
});

// A caixa cresce conforme você escreve mais linhas
function ajustarAltura() {
  elTexto.style.height = "auto";
  elTexto.style.height = Math.min(elTexto.scrollHeight, 160) + "px";
  elTexto.style.overflowY = elTexto.scrollHeight > 160 ? "auto" : "hidden";
}
elTexto.addEventListener("input", ajustarAltura);

// No celular, quando o teclado abre, rola até a última mensagem
elTexto.addEventListener("focus", () => {
  setTimeout(() => rolagem.descer(), 300);
});

// Tudo carregou: esconde o aviso de erro
const aviso = document.getElementById("avisoErro");
if (aviso) aviso.remove();

document.querySelectorAll("[data-cmd]").forEach(b => b.onclick = () => enviar(b.dataset.cmd));
document.getElementById("btnNovo").onclick = () => { limparChat(); elSidebar.classList.remove("aberta"); };
document.getElementById("btnMenu").onclick = () => elSidebar.classList.toggle("aberta");

// botão "copiar" dos blocos de código: copia tudo, ou só o trecho que você selecionou
function trechoSelecionado(pre) {
  const sel = window.getSelection && window.getSelection();
  if (!sel || sel.isCollapsed || !pre.contains(sel.anchorNode) || !pre.contains(sel.focusNode)) return "";
  return sel.toString();
}
elMensagens.addEventListener("mousedown", e => { if (e.target.classList.contains("copiar")) e.preventDefault(); });   // não perde a seleção
elMensagens.addEventListener("click", e => {
  if (!e.target.classList.contains("copiar")) return;
  const pre = e.target.closest(".codigo").querySelector("pre");
  const trecho = trechoSelecionado(pre);
  const texto = trecho || pre.innerText;
  const botao = e.target;
  const pronto = ok => {
    botao.textContent = ok ? (trecho ? "✓ trecho copiado" : "✓ copiado") : "não deu pra copiar";
    botao.classList.toggle("ok", ok);
    setTimeout(() => { botao.textContent = "copiar"; botao.classList.remove("ok"); }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(() => pronto(true), () => pronto(false));
  else pronto(false);
});
// selecionou um pedaço do código? o botão vira "copiar trecho"
let _selTimer = null;
document.addEventListener("selectionchange", () => {
  clearTimeout(_selTimer);
  _selTimer = setTimeout(() => {
    elMensagens.querySelectorAll(".codigo").forEach(b => {
      const botao = b.querySelector(".copiar");
      if (!botao || botao.classList.contains("ok")) return;
      botao.textContent = trechoSelecionado(b.querySelector("pre")) ? "copiar trecho" : "copiar";
    });
  }, 120);
});

/* ---------- memória visível: o que eu estou lembrando desta conversa ---------- */
const elMemoria = document.getElementById("chipMemoria");
function atualizarMemoria() {
  if (!elMemoria) return;
  const partes = [], detalhes = [];
  if (estado.lang) { partes.push(NOMES[estado.lang]); detalhes.push("Linguagem: " + NOMES[estado.lang]); }
  const c = WCDEV.motor ? WCDEV.motor.codigoRecente() : estado.ultimoCodigo;
  if (c && c.origem !== "editor") {
    const n = c.codigo.split("\n").length;
    partes.push("código");
    detalhes.push(`Último código: ${n} linha${n > 1 ? "s" : ""} de ${NOMES[c.lang] || c.lang}` + (c.origem === "aula" ? " (exemplo meu)" : /^gerad/.test(c.origem || "") ? " (eu montei)" : ""));
  }
  const assunto = estado.ultimo && estado.ultimo.lang !== "conversa" ? estado.ultimo.titulo : null;
  if (assunto) detalhes.push("Assunto: " + assunto);
  elMemoria.hidden = !partes.length && !assunto;
  elMemoria.innerHTML = `🧠 <span>${escapar(partes.join(" · ") || "assunto")}</span>`;
  elMemoria.title = "Estou lembrando nesta conversa:\n" + detalhes.join("\n") + "\n\nToque pra eu esquecer (as mensagens continuam salvas).";
  elMemoria.setAttribute("aria-label", "Memória da conversa: " + detalhes.join(", ") + ". Ativar pra esquecer.");
}
if (elMemoria) elMemoria.onclick = () => {
  if (WCDEV.motor) WCDEV.motor.limpar();
  Treino.ativo = null;
  atualizarLang(null);
  atualizarMemoria();
  adicionarMensagem("bot", formatar("🧹 Pronto, **esqueci o contexto** desta conversa: a linguagem, o último código e o último assunto. A próxima pergunta começa do zero.\nAs mensagens continuam salvas aqui; pra apagar a conversa, use o **✕** na lista da esquerda."), [], null, true);
};

/* ---------- teclado ---------- */
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); elTexto.focus(); }
  if (e.key === "Escape" && elSidebar.classList.contains("aberta")) { elSidebar.classList.remove("aberta"); document.getElementById("btnMenu").focus(); }
});

expandirReferencias();
if (WCDEV.cerebro) WCDEV.cerebro.iniciar();
Editor.iniciar();
TelaConta.iniciar(aoEntrar);   // mostra login/planos; quando liberar, chama aoEntrar
