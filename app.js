/* =========================================================
   WC DEV — motor do chat (sem API, roda 100% no navegador)
   Os conteúdos ficam em: conversa.js, python.js, html.js, css.js
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };
WCDEV.refs = WCDEV.refs || [];

const NOMES = { python: "Python", html: "HTML", css: "CSS" };

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
    .replace(/\{\{(.+?)\}\}/g, '<code class="inline">$1</code>')
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
    else if (/^\u0000\d+\u0000$/.test(l)) saida.push(l);
    else saida.push(`<p>${l}</p>`);
  }
  if (lista) saida.push("</ul>");

  return saida.join("").replace(/\u0000(\d+)\u0000/g, (_, i) => {
    const b = blocos[i];
    return `<div class="codigo"><div class="codigo-topo"><span>${b.lang}</span>` +
      `<button class="copiar">copiar</button></div><pre>${escapar(b.cod)}</pre></div>`;
  });
}

/* ---------- Mensagens na tela ---------- */

function adicionarMensagem(quem, conteudoHtml, sugestoes) {
  const msg = document.createElement("div");
  msg.className = `msg ${quem}`;
  msg.innerHTML = `<div class="avatar">${quem === "bot" ? "WC" : "eu"}</div><div class="balao">${conteudoHtml}</div>`;

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

  elMensagens.appendChild(msg);
  elMensagens.scrollTop = elMensagens.scrollHeight;
  return msg;
}

function mostrarDigitando() {
  return adicionarMensagem("bot", '<div class="digitando"><span></span><span></span><span></span></div>');
}

function responder(resposta) {
  const d = mostrarDigitando();
  const tempo = Math.min(1200, 350 + resposta.texto.length * 0.6);
  setTimeout(() => {
    d.remove();
    adicionarMensagem("bot", formatar(resposta.texto), resposta.sugestoes);
  }, tempo);
}

function atualizarLang(lang) {
  estado.lang = lang;
  elLang.textContent = lang ? NOMES[lang] : "—";
}

/* ---------- Cérebro: encontra a melhor resposta ---------- */

function detectarLinguagem(t) {
  if (/ (python|py|pyton|phyton) /.test(t)) return "python";
  if (/ (html|htm|html5) /.test(t)) return "html";
  if (/ (css|css3) /.test(t)) return "css";
  return null;
}

/* ---------- Referências: transforma as listas dos arquivos em respostas ---------- */
// Palavras do português que não podem virar palavra-chave sozinhas (ex: a tag <a>)
const PALAVRAS_COMUNS = new Set(["a", "e", "o", "as", "os", "em", "do", "da", "de", "no", "na", "um", "uma", "se", "para", "com", "por", "que", "ou", "ao", "me", "eu"]);

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
        resposta: `### ${nome}\n**${bloco.grupo}** · ${NOMES[bloco.lang]}\n${desc}` +
          (exemplo ? `\n~~~${bloco.codigo || bloco.lang}\n${exemplo}\n~~~` : ""),
        sugestoes: bloco.itens.slice(i + 1, i + 4).map(botao),
      });
    });
  });
  // guarda as palavras-chave já normalizadas (deixa a busca rápida)
  WCDEV.temas.forEach(t => { t._chaves = t.chaves.map(c => normalizar(c)); t._titulo = normalizar(t.titulo); });
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
  const lista = temasDa(lang).map((x, i) => `- **${i + 1}.** ${x.titulo}`).join("\n");
  const grupos = [...gruposDe(lang)].map(([g, nomes]) =>
    `- **${g}** (${nomes.length}): ${nomes.slice(0, 6).join(", ")}${nomes.length > 6 ? "..." : ""}`).join("\n");
  return {
    texto: `### Trilha de ${NOMES[lang]}\nAulas em ordem (digite {{/proximo}} pra seguir):\n${lista}` +
      (grupos ? `\n\n### Consulta: mais ${referenciasDa(lang).length} coisas de ${NOMES[lang]}\nÉ só digitar o nome de qualquer uma:\n${grupos}\n\nDigite {{/indice}} pra ver a lista completa.` : ""),
    sugestoes: temasDa(lang).slice(0, 5).map(x => x.titulo),
  };
}

function indice(lang) {
  if (!lang) return { texto: "De qual linguagem? ", sugestoes: ["/indice python", "/indice html", "/indice css"] };
  atualizarLang(lang);
  const grupos = [...gruposDe(lang)].map(([g, nomes]) => `**${g}** (${nomes.length})\n${nomes.map(n => `{{${n}}}`).join(" · ")}`).join("\n\n");
  return { texto: `### Índice de ${NOMES[lang]} — ${totalDe(lang)} coisas\n${grupos}\n\nDigite qualquer nome pra eu explicar.` };
}

function proximaAula() {
  const lang = estado.lang || "python";
  const lista = temasDa(lang);
  const ultima = estado.ultimaAula;
  let i = ultima && ultima.lang === lang ? lista.indexOf(ultima) + 1 : 0;
  if (i >= lista.length) {
    return { texto: `🎉 Você terminou a trilha de **${NOMES[lang]}**! Quer começar outra?`, sugestoes: ["/python", "/html", "/css"] };
  }
  return usarTema(lista[i]);
}

function usarTema(tema) {
  if (tema.lang !== "conversa") atualizarLang(tema.lang);
  estado.ultimo = tema;
  if (tema.lang !== "conversa" && !tema.ref) estado.ultimaAula = tema;
  const texto = typeof tema.resposta === "function" ? tema.resposta(estado) : tema.resposta;
  let sugestoes = tema.sugestoes ? [...tema.sugestoes] : [];
  if (tema.lang !== "conversa" && !tema.ref && !sugestoes.includes("/proximo")) sugestoes.push("/proximo");
  return { texto, sugestoes };
}

function pontuar(tema, t, langDetectada) {
  if (tema.exato) return tema._chaves.includes(t) ? 10 : 0;
  let pontos = 0;
  for (const c of tema._chaves) {
    if (t.includes(c)) pontos += c.trim().split(" ").length * 2 + 1;
  }
  if (tema._titulo === t) pontos += 20;
  if (pontos > 0) {
    if (tema.ref) pontos += 1;                              // consulta é mais específica
    if (langDetectada && tema.lang === langDetectada) pontos += 3;
    else if (!langDetectada && tema.lang === estado.lang) pontos += 2;  // contexto da conversa
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

function pensar(entrada) {
  const bruto = entrada.trim();
  const t = normalizar(bruto);

  // Comandos
  if (bruto.startsWith("/")) {
    const [cmd, arg] = bruto.toLowerCase().split(/\s+/);
    if (cmd === "/python" || cmd === "/html" || cmd === "/css") {
      const lang = cmd.slice(1);
      atualizarLang(lang);
      estado.ultimaAula = null;
      return listarTopicos(lang);
    }
    if (cmd === "/proximo" || cmd === "/próximo") return proximaAula();
    if (cmd === "/indice" || cmd === "/índice") return indice(NOMES[arg] ? arg : estado.lang);
    if (cmd === "/limpar") { limparChat(); return null; }
    if (cmd === "/ajuda") return usarTema(WCDEV.temas.find(x => x.id === "ajuda"));
    return { texto: `Não conheço o comando {{${cmd}}}. Digite {{/ajuda}} para ver os comandos.` };
  }

  // "próximo", "continua", "mais"
  if (/^ (proximo|proxima|continua|continuar|mais|segue|bora|proxima aula) $/.test(t)) return proximaAula();

  const lang = detectarLinguagem(t);

  // Melhor tema por pontuação
  let melhor = null, melhorPontos = 0;
  for (const tema of WCDEV.temas) {
    const p = pontuar(tema, t, lang);
    if (p > melhorPontos) { melhor = tema; melhorPontos = p; }
  }

  // Só falou o nome da linguagem ("quero aprender python")
  if (lang && (!melhor || melhor.lang === "conversa" || melhorPontos < 4)) {
    atualizarLang(lang);
    estado.ultimaAula = null;
    return listarTopicos(lang);
  }

  if (melhor) return usarTema(melhor);

  // Talvez escreveu o nome errado
  const quis = parecidos(t, lang);
  if (quis.length) {
    return { texto: "Não achei exatamente isso. Você quis dizer:", sugestoes: quis };
  }

  // Não entendeu
  const sugestoes = estado.lang
    ? temasDa(estado.lang).slice(0, 4).map(x => x.titulo)
    : ["quero aprender python", "quero aprender html", "quero aprender css"];
  return {
    texto: `Hmm, não entendi muito bem 🤔\nTenta perguntar de outro jeito, tipo: **"como fazer um for em python"**, **"o que é append"** ou **"como usar o flexbox"**.\nVocê também pode digitar {{/indice python}} pra ver tudo que eu sei.`,
    sugestoes,
  };
}

/* ---------- Envio ---------- */

function enviar(texto) {
  texto = texto.trim();
  if (!texto) return;
  adicionarMensagem("user", escapar(texto).replace(/\n/g, "<br>"));
  elTexto.value = "";
  ajustarAltura();
  elSidebar.classList.remove("aberta");
  const resposta = pensar(texto);
  if (resposta) responder(resposta);
}

function limparChat() {
  elMensagens.innerHTML = "";
  estado.ultimo = null;
  estado.ultimaAula = null;
  atualizarLang(null);
  boasVindas();
}

function boasVindas() {
  const tema = WCDEV.temas.find(x => x.id === "boas-vindas");
  if (!tema) {
    adicionarMensagem("bot", "<p>⚠️ Faltam arquivos de conteúdo (conversa.js, python.js, html.js, css.js) na mesma pasta do index.html.</p>");
    return;
  }
  responder(usarTema(tema));
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
  setTimeout(() => (elMensagens.scrollTop = elMensagens.scrollHeight), 300);
});

// Tudo carregou: esconde o aviso de erro
const aviso = document.getElementById("avisoErro");
if (aviso) aviso.remove();

document.querySelectorAll("[data-cmd]").forEach(b => b.onclick = () => enviar(b.dataset.cmd));
document.getElementById("btnNovo").onclick = limparChat;
document.getElementById("btnMenu").onclick = () => elSidebar.classList.toggle("aberta");

// botão "copiar" dos blocos de código
elMensagens.addEventListener("click", e => {
  if (!e.target.classList.contains("copiar")) return;
  const codigo = e.target.closest(".codigo").querySelector("pre").innerText;
  navigator.clipboard.writeText(codigo).then(() => {
    e.target.textContent = "copiado!";
    setTimeout(() => (e.target.textContent = "copiar"), 1500);
  });
});

expandirReferencias();
boasVindas();
