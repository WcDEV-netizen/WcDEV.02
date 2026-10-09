/* =========================================================
   WC DEV — motor do chat (sem API, roda 100% no navegador)
   Os conteúdos ficam em: conversa.js, python.js, html.js, css.js
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const NOMES = { python: "Python", html: "HTML", css: "CSS" };

const estado = {
  lang: null,       // linguagem que o aluno está estudando agora
  ultimo: null,     // último tema mostrado
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

function temasDa(lang) {
  return WCDEV.temas.filter(x => x.lang === lang);
}

function listarTopicos(lang) {
  const lista = temasDa(lang).map((x, i) => `- **${i + 1}.** ${x.titulo}`).join("\n");
  return {
    texto: `### Trilha de ${NOMES[lang]}\nEsses são os assuntos que eu sei ensinar. Clique num botão ou me pergunte com suas palavras:\n${lista}\n\nDica: digite {{/proximo}} para seguir a trilha em ordem.`,
    sugestoes: temasDa(lang).slice(0, 6).map(x => x.titulo),
  };
}

function proximaAula() {
  const lang = estado.lang || "python";
  const lista = temasDa(lang);
  let i = estado.ultimo && estado.ultimo.lang === lang ? lista.indexOf(estado.ultimo) + 1 : 0;
  if (i >= lista.length) {
    return { texto: `🎉 Você terminou a trilha de **${NOMES[lang]}**! Quer começar outra?`, sugestoes: ["/python", "/html", "/css"] };
  }
  return usarTema(lista[i]);
}

function usarTema(tema) {
  if (tema.lang !== "conversa") atualizarLang(tema.lang);
  estado.ultimo = tema;
  const texto = typeof tema.resposta === "function" ? tema.resposta(estado) : tema.resposta;
  let sugestoes = tema.sugestoes ? [...tema.sugestoes] : [];
  if (tema.lang !== "conversa" && !sugestoes.includes("/proximo")) sugestoes.push("/proximo");
  return { texto, sugestoes };
}

function pontuar(tema, t, langDetectada) {
  let pontos = 0;
  for (const chave of tema.chaves) {
    const c = normalizar(chave);
    if (t.includes(c)) pontos += c.trim().split(" ").length * 2 + 1;
  }
  if (normalizar(tema.titulo) === t) pontos += 20;
  if (pontos > 0) {
    const langAlvo = langDetectada || estado.lang;
    if (tema.lang === langAlvo) pontos += 3;
    else if (langDetectada && tema.lang !== "conversa") pontos -= 4;
  }
  return pontos;
}

function pensar(entrada) {
  const bruto = entrada.trim();
  const t = normalizar(bruto);

  // Comandos
  if (bruto.startsWith("/")) {
    const cmd = bruto.toLowerCase().split(" ")[0];
    if (cmd === "/python" || cmd === "/html" || cmd === "/css") {
      const lang = cmd.slice(1);
      atualizarLang(lang);
      estado.ultimo = null;
      return listarTopicos(lang);
    }
    if (cmd === "/proximo" || cmd === "/próximo") return proximaAula();
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
    estado.ultimo = null;
    return listarTopicos(lang);
  }

  if (melhor) return usarTema(melhor);

  // Não entendeu
  const sugestoes = estado.lang
    ? temasDa(estado.lang).slice(0, 4).map(x => x.titulo)
    : ["quero aprender python", "quero aprender html", "quero aprender css"];
  return {
    texto: `Hmm, não entendi muito bem 🤔\nTenta perguntar de outro jeito, tipo: **"como fazer um for em python"** ou **"como mudar a cor do texto no css"**.\nVocê também pode digitar {{/ajuda}}.`,
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

boasVindas();
