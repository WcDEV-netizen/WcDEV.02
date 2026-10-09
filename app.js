/* =========================================================
   WC DEV — motor do chat (sem API, roda 100% no navegador)
   Conteúdo: conversa.js, python.js, html.js, css.js, pawn.js
   Extras:   revisor.js (revisa código), treino.js (exercícios e "ensinar")
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };
WCDEV.refs = WCDEV.refs || [];

const NOMES = { python: "Python", html: "HTML", css: "CSS", pawn: "Pawn" };

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

function adicionarMensagem(quem, conteudoHtml, sugestoes, preview) {
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
    adicionarMensagem("bot", formatar(resposta.texto), resposta.sugestoes, resposta.preview);
  }, tempo);
}

function atualizarLang(lang) {
  estado.lang = lang;
  elLang.textContent = lang ? (typeof Treino !== "undefined" && Treino.ativo ? "Treino · " : "") + NOMES[lang] : "—";
}

/* ---------- Cérebro: encontra a melhor resposta ---------- */

function detectarLinguagem(t) {
  if (/ (python|py|pyton|phyton) /.test(t)) return "python";
  if (/ (html|htm|html5) /.test(t)) return "html";
  if (/ (css|css3) /.test(t)) return "css";
  if (/ (pawn|samp|sa-mp|sa mp|open.mp|openmp|omp|pwn|gta samp|gamemode|filterscript) /.test(t)) return "pawn";
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
        resposta: `### ${nome}\n**${bloco.grupo}** · ${NOMES[bloco.lang]}\n${desc}` +
          (exemplo ? `\n~~~${bloco.codigo || bloco.lang}\n${exemplo}\n~~~` : ""),
        sugestoes: bloco.itens.slice(i + 1, i + 4).map(botao),
      });
    });
  });
  // guarda as palavras-chave já normalizadas (deixa a busca rápida)
  WCDEV.temas.forEach(t => { t._chaves = t.chaves.map(c => normalizar(c)); t._titulo = normalizar(t.titulo); });
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
    let pts = 0, achou = 0;
    for (const q of qs) {
      if (tema._palavras.has(q)) { pts += Math.log(INDICE.total / (INDICE.df[q] || 1)); achou++; }
    }
    if (!achou) continue;
    pts *= achou / qs.length + 0.5;        // vale mais quando bate mais palavras da pergunta
    if (tema.lang === (lang || estado.lang)) pts += 0.8;
    if (pts > melhorPts) { melhorPts = pts; melhor = tema; }
  }
  return melhorPts >= 3.2 ? melhor : null;
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
  if (!lang) return { texto: "De qual linguagem? ", sugestoes: ["/indice pawn", "/indice python", "/indice html", "/indice css"] };
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
    return { texto: `🎉 Você terminou a trilha de **${NOMES[lang]}**! Quer começar outra?`, sugestoes: ["/pawn", "/python", "/html", "/css", `/treinar ${lang}`] };
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
function revisarCodigo(codigo) {
  const r = WCDEV.revisor && WCDEV.revisor.analisar(codigo);
  if (!r) return null;
  atualizarLang(r.lang);
  const erros = r.problemas.filter(p => p.tipo === "erro");
  const outros = r.problemas.filter(p => p.tipo !== "erro");
  let texto = `### 🔎 Revisei seu código ${NOMES[r.lang]}\n`;
  if (r.resumo) texto += r.resumo + "\n";
  if (!r.problemas.length) {
    texto += "✅ **Não achei erros comuns.** Boa!\n(Eu confiro os erros mais frequentes, mas não executo o código: teste também no " +
      ({ pawn: "compilador", python: "Python", html: "navegador", css: "navegador" })[r.lang] + ".)";
  } else {
    if (erros.length) texto += `\n**Erros (${erros.length}):**\n${erros.slice(0, 10).map(e => `- **Linha ${e.linha}:** ${e.msg}`).join("\n")}\n`;
    if (outros.length) texto += `\n**Avisos e dicas (${outros.length}):**\n${outros.slice(0, 8).map(e => `- **Linha ${e.linha}:** ${e.msg}`).join("\n")}\n`;
  }
  if (r.usados.length) texto += "\nToque num nome abaixo pra ver a explicação:";
  const preview = r.lang === "html" ? codigo : r.lang === "css" ? `<div class="card botao menu caixa">Exemplo</div><h1>Título</h1><p>Parágrafo</p><style>${codigo}</style>` : null;
  return { texto, sugestoes: r.usados, preview };
}

// tira frases tipo "corrige isso:" do começo de um código colado
function separarCodigo(bruto) {
  const linhas = bruto.split("\n");
  while (linhas.length > 1 && /^[a-zà-ú0-9\s,!?.'"-]+:?\s*$/i.test(linhas[0].trim()) && !/[;{}()<>=]/.test(linhas[0])) linhas.shift();
  return linhas.join("\n");
}

function marcarModoTreino(ligado) {
  document.body.classList.toggle("modo-treino", ligado);
  elTexto.placeholder = ligado ? "Escreva seu código aqui... (➤ ou Ctrl+Enter envia)" : "Pergunte algo ou cole um código...";
  elLang.textContent = ligado && estado.lang ? `Treino · ${NOMES[estado.lang]}` : (estado.lang ? NOMES[estado.lang] : "—");
  ajustarAltura();
}

/* ---------- O cérebro ---------- */
function pensar(entrada) {
  const bruto = entrada.trim();
  const t = normalizar(bruto);

  // Comandos
  if (bruto.startsWith("/")) {
    const [cmd, arg] = bruto.toLowerCase().split(/\s+/);
    const langArg = NOMES[arg] ? arg : null;
    if (["/python", "/html", "/css", "/pawn"].includes(cmd)) {
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
    if (cmd === "/dica") return Treino.dica();
    if (cmd === "/resposta" || cmd === "/solucao") return Treino.resposta();
    if (cmd === "/pular") return Treino.pular();
    if (cmd === "/sair") return Treino.sair();
    if (cmd === "/zerar") return Treino.zerar(langArg);
    if (cmd === "/progresso") return Treino.status();
    if (cmd === "/ensinar") return Aprendizado.ensinar(bruto);
    if (cmd === "/esquecer") return Aprendizado.esquecer(bruto);
    if (cmd === "/aprendidos") return Aprendizado.listar();
    if (cmd === "/revisar") return { texto: "Cole o seu código aqui na conversa (Pawn, Python, HTML ou CSS) que eu procuro os erros. 🔎" };
    return { texto: `Não conheço o comando {{${cmd}}}. Digite {{/ajuda}} para ver os comandos.` };
  }

  // No modo treino, tudo que chega é a resposta do exercício
  if (Treino.ativo) return Treino.corrigir(bruto);

  // Código colado? Revisa.
  const codigo = separarCodigo(bruto);
  if (WCDEV.revisor && WCDEV.revisor.pareceCodigo(codigo)) {
    const r = revisarCodigo(codigo);
    if (r) return r;
  }

  // "próximo", "continua", "mais"
  if (/^ (proximo|proxima|continua|continuar|mais|segue|bora|proxima aula) $/.test(t)) return proximaAula();

  const conta = calcular(t);
  if (conta) return conta;
  const hora = horaOuData(t);
  if (hora) return hora;

  const lang = detectarLinguagem(t);

  // "e em pawn?" -> mesmo assunto em outra linguagem
  if (lang) {
    const mesmo = mesmaCoisaEm(t, lang);
    if (mesmo) return usarTema(mesmo);
  }

  // Assunto que não é programação
  const fora = foraDoAssunto(t);
  if (fora) return fora;

  // Melhor tema por pontuação
  let melhor = null, melhorPontos = 0;
  for (const tema of WCDEV.temas) {
    const p = pontuar(tema, t, lang);
    if (p > melhorPontos) { melhor = tema; melhorPontos = p; }
  }

  // Só falou o nome da linguagem ("quero aprender python")
  if (lang && (!melhor || melhor.lang === "conversa" || melhorPontos < 4) && !(melhor && melhor.aprendido)) {
    const porPalavra = buscaPorPalavras(t, lang);
    if (porPalavra && porPalavra.lang === lang && t.trim().split(" ").length > 2 + (/(aprender|estudar|ensina)/.test(t) ? 9 : 0)) return usarTema(porPalavra);
    atualizarLang(lang);
    estado.ultimaAula = null;
    return listarTopicos(lang);
  }

  if (melhor) return usarTema(melhor);

  // Busca por palavras soltas ("dar vida pro jogador no samp")
  const porPalavra = buscaPorPalavras(t, lang);
  if (porPalavra) return usarTema(porPalavra);

  // Talvez escreveu o nome errado
  const quis = parecidos(t, lang);
  if (quis.length) {
    return { texto: "Não achei exatamente isso. Você quis dizer:", sugestoes: quis };
  }

  // Não tem nada a ver com programação
  if (!pareceProgramacao(t) && t.trim().split(" ").length >= 3) {
    const fa = WCDEV.foraDoAssunto;
    if (fa) return { texto: fa.respostas[0], sugestoes: ["/treinar", "quero aprender pawn", "/ajuda"] };
  }

  // Não entendeu
  const sugestoes = estado.lang
    ? temasDa(estado.lang).slice(0, 4).map(x => x.titulo)
    : ["quero aprender pawn", "quero aprender python", "/treinar"];
  return {
    texto: `Hmm, não entendi muito bem 🤔\nTenta perguntar de outro jeito, tipo: **"como criar comando no samp"**, **"o que é append"** ou **"como usar o flexbox"**.\nVocê também pode colar um código pra eu revisar, ou digitar {{/indice pawn}} pra ver tudo que eu sei.`,
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
  Treino.ativo = null;
  atualizarLang(null);
  marcarModoTreino(false);
  boasVindas();
}

function boasVindas() {
  const tema = WCDEV.temas.find(x => x.id === "boas-vindas");
  if (!tema) {
    adicionarMensagem("bot", "<p>⚠️ Faltam arquivos de conteúdo (conversa.js, python.js, html.js, css.js, pawn.js) na mesma pasta do index.html.</p>");
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
  if ((e.key === "Enter" || e.keyCode === 13) && !e.isComposing) {
    // no modo treino: Enter pula linha, Ctrl+Enter envia
    if (Treino.ativo && !e.ctrlKey && !e.metaKey) return;
    if (e.shiftKey && !e.ctrlKey) return;
    e.preventDefault();
    enviar(elTexto.value);
  }
});
elTexto.addEventListener("keyup", e => { shiftApertado = e.shiftKey; });

// Alguns teclados de celular não avisam o "keydown" do Enter: pega a quebra de linha aqui
elTexto.addEventListener("beforeinput", e => {
  if (shiftApertado || Treino.ativo) return;
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
if (WCDEV.aprendizado) WCDEV.aprendizado.carregar();
boasVindas();
