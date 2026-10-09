/* =========================================================
   WC DEV — motor do chat (sem API, roda 100% no navegador)
   Conteúdo: conversa.js, python.js, html.js, css.js, pawn.js
   Extras:   revisor.js (revisa código), treino.js (exercícios e "ensinar"),
             conta.js (login, planos, conversas salvas), editor.js (editor de código)
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
    else if (l.startsWith("&gt; ")) saida.push(`<div class="pensamento">${l.slice(5)}</div>`);
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

function adicionarMensagem(quem, conteudoHtml, sugestoes, preview, animar) {
  const perto = elMensagens.scrollHeight - elMensagens.scrollTop - elMensagens.clientHeight < 160;
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
    if (quem === "bot" && msg.offsetHeight > elMensagens.clientHeight * 0.8) elMensagens.scrollTop = msg.offsetTop - 12;
    else elMensagens.scrollTop = elMensagens.scrollHeight;
  }
  return msg;
}

function mostrarDigitando() {
  return adicionarMensagem("bot", '<div class="digitando"><span></span><span></span><span></span></div>');
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
  }, tempo);
}

function atualizarLang(lang) {
  estado.lang = lang;
  elLang.textContent = lang ? (typeof Treino !== "undefined" && Treino.ativo ? "Treino · " : "Prof. ") + NOMES[lang] : "—";
}

/* ---------- Cérebro: encontra a melhor resposta ---------- */

// sem dizer a linguagem, mas falando de jogador/skin/colete... é Pawn
function langProvavel(t) {
  if (/ (jogador|jogadores|playerid|skin|colete|veiculo|veiculos|viatura|kickar|banir|gamemode|filterscript|textdraw|dialog|checkpoint|pickup|interior|mundo virtual|rcon|server.cfg|callback|zcmd|sscanf|dof2|payday|teleportar) /.test(t)) return "pawn";
  if (/ (div|tag|pagina html|<\w+>) /.test(t)) return "html";
  return null;
}

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
const SO_LINGUAGEM = new Set(["samp", "sa-mp", "pawn", "python", "html", "css", "open.mp", "openmp", "py", "js"]);
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

function usarTema(tema, ctx) {
  if (tema.lang !== "conversa") atualizarLang(tema.lang);
  estado.ultimo = tema;
  if (tema.lang !== "conversa" && !tema.ref) {
    estado.ultimaAula = tema;
    if (Treino.progresso && Treino.progresso._ultima !== tema.id) { Treino.progresso._ultima = tema.id; Treino.salvarProgresso(); }
  }
  if (ctx && WCDEV.cerebro) {
    const v = WCDEV.cerebro.vestir(tema, ctx);
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
  const r = WCDEV.revisor && WCDEV.revisor.analisar(codigo, langEscolhida);
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
  estado.ultimoCodigo = { codigo, lang: r.lang };
  if (erros.length) texto += "\nQuer que eu **conserte pra você**? Toque em **/corrigir**. Ou peça **/explicar** pra eu explicar linha por linha.";
  else texto += "\nQuer que eu explique o que cada linha faz? Toque em **/explicar**.";
  const preview = r.lang === "html" ? codigo : r.lang === "css" ? `<div class="card botao menu caixa">Exemplo</div><h1>Título</h1><p>Parágrafo</p><style>${codigo}</style>` : null;
  const botoes = erros.length ? ["/corrigir", "/explicar"] : ["/explicar"];
  return { texto, sugestoes: botoes.concat(r.usados).slice(0, 8), preview };
}

/* ---------- Corrigir e explicar código ---------- */
function corrigirCodigo(codigo, lang) {
  const r = WCDEV.corretor && WCDEV.corretor.corrigir(codigo, lang);
  if (!r) return { texto: "Não consegui descobrir a linguagem desse código. Abra o **editor**, escolha a linguagem e toque em **🔧 Corrigir**.", sugestoes: ["/editor"] };
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
  texto += WCDEV.explicador.explicar(codigo, lang);
  if (r && r.resumo) texto += "\n\n**Resumindo:** " + r.resumo;
  if (erros) texto += `\n\n⚠️ Também achei **${erros} erro(s)** nesse código. Toque em **/corrigir** que eu conserto e explico.`;
  return { texto, sugestoes: erros ? ["/corrigir", "/editor"] : ["/editor", `/desafio ${lang}`] };
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
  const bruto = entrada.trim();
  const t0 = normalizar(bruto);

  // ===== Comandos =====
  if (bruto.startsWith("/")) {
    const [cmd, arg] = bruto.toLowerCase().split(/\s+/);
    const resto = bruto.slice(cmd.length).trim();
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
    if (cmd === "/desafio" || cmd === "/desafios") {
      if (/^sobre\s+/i.test(resto)) {
        const d = WCDEV.desafios.sobre(acharPorNome(resto.replace(/^sobre\s+/i, "")));
        return d ? Treino.abrir(d) : { texto: "Não achei esse assunto pra montar um desafio. Tente {{/desafio pawn}}." };
      }
      const nivel = parseInt((resto.match(/\d/) || [])[0], 10) || null;
      return Treino.abrir(WCDEV.desafios.gerar(langArg || estado.lang || "pawn", nivel));
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
    if (cmd === "/progresso") return Treino.status();
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
  if (exato) return usarTema(exato, { intent: "geral", correcoes: [] });

  // ===== Entender a frase =====
  const pre = WCDEV.cerebro ? WCDEV.cerebro.preprocessar(bruto) : { texto: t0, correcoes: [] };
  const t = pre.texto;
  const intent = WCDEV.cerebro ? WCDEV.cerebro.intencao(t) : "geral";
  const langDita = detectarLinguagem(t);
  const lang = langDita;
  const provavel = !langDita ? langProvavel(t) : null;

  if (/^ (proximo|proxima|continua|continuar|mais|segue|bora|proxima aula) $/.test(t)) return proximaAula();

  // continuação do último assunto ("explica melhor", "outro exemplo", "não entendi")
  if (estado.ultimo && WCDEV.cerebro && WCDEV.cerebro.ehContinuacao(t) && !lang) {
    const tipo = ["como", "exemplo", "erro"].includes(intent) ? "melhor" : intent;
    const r = WCDEV.cerebro.continuar(tipo, estado.ultimo);
    if (r) return r;
  }

  // pediu desafio / missão
  if (intent === "desafio" && WCDEV.desafios) {
    const l = lang || estado.lang || "pawn";
    if (/ (missao|missoes|projeto) /.test(t)) return Treino.abrir(WCDEV.desafios.missao(l));
    return Treino.abrir(WCDEV.desafios.gerar(l, / (facil|iniciante) /.test(t) ? 1 : / (dificil|avancado) /.test(t) ? 3 : null));
  }

  // pediu pra eu escrever um código
  if (WCDEV.gerador) {
    const g = WCDEV.gerador.tentar(bruto, t, lang || provavel);
    if (g) { if (lang) atualizarLang(lang); return g; }
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

  // compara a frase corrigida com a original e fica com a que entende melhor
  let achado = melhorTema(t, lang || provavel);
  if (t !== t0) {
    const semCorrigir = melhorTema(t0, lang || provavel);
    if (semCorrigir.pontos > achado.pontos) { achado = semCorrigir; pre.correcoes = []; }
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

  if (melhor) return usarTema(melhor, ctx);

  const porPalavra = buscaPorPalavras(t, lang || provavel);
  if (porPalavra) return usarTema(porPalavra, { ...ctx, langPorContexto: !lang && porPalavra.lang === estado.lang });

  const quis = parecidos(t, lang);
  if (quis.length) return { texto: "> 🧠 Não achei exatamente isso, mas achei coisas com nome parecido.\nVocê quis dizer:", sugestoes: quis };

  if (!pareceProgramacao(t) && t.trim().split(" ").length >= 3) {
    const fa = WCDEV.foraDoAssunto;
    if (fa) return { texto: fa.respostas[0], sugestoes: ["/treinar", "quero aprender pawn", "/ajuda"] };
  }

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
  estado.ultimo = null;
  estado.ultimaAula = null;
  Treino.ativo = null;
  Editor.fecharExercicio();
  atualizarLang(null);
  Historico.nova();
  marcarConversaAtiva();
  boasVindas();
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
  estado.ultimo = null;
  estado.ultimaAula = null;
  Treino.ativo = null;
  Editor.fecharExercicio();
  atualizarLang(null);
  Historico.atualId = id;
  c.msgs.forEach(m => {
    if (m.q === "user") adicionarMensagem("user", m.codigo ? formatar(m.t) : escapar(m.t).replace(/\n/g, "<br>"));
    else adicionarMensagem("bot", formatar(m.t), m.s, m.p);
  });
  elSidebar.classList.remove("aberta");
  marcarConversaAtiva();
}

function listarConversas() {
  const el = document.getElementById("listaConversas");
  if (!el) return;
  const lista = Historico.todas();
  el.innerHTML = lista.length ? "" : '<div class="sem-conversas">Suas conversas aparecem aqui.</div>';
  lista.forEach(c => {
    const item = document.createElement("div");
    item.className = "conversa" + (c.id === Historico.atualId ? " ativa" : "");
    item.innerHTML = `<button class="conversa-abrir" title="${escapar(c.titulo)}">${escapar(c.titulo)}</button><button class="conversa-apagar" title="Apagar">✕</button>`;
    item.querySelector(".conversa-abrir").onclick = () => abrirConversa(c.id);
    item.querySelector(".conversa-apagar").onclick = () => {
      if (!confirm(`Apagar a conversa "${c.titulo}"?`)) return;
      const eraAtual = c.id === Historico.atualId;
      Historico.apagar(c.id);
      if (eraAtual) limparChat(); else listarConversas();
    };
    el.appendChild(item);
  });
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
  setTimeout(() => (elMensagens.scrollTop = elMensagens.scrollHeight), 300);
});

// Tudo carregou: esconde o aviso de erro
const aviso = document.getElementById("avisoErro");
if (aviso) aviso.remove();

document.querySelectorAll("[data-cmd]").forEach(b => b.onclick = () => enviar(b.dataset.cmd));
document.getElementById("btnNovo").onclick = () => { limparChat(); elSidebar.classList.remove("aberta"); };
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
if (WCDEV.cerebro) WCDEV.cerebro.iniciar();
Editor.iniciar();
TelaConta.iniciar(aoEntrar);   // mostra login/planos; quando liberar, chama aoEntrar
