/* =========================================================
   WC DEV — PROFESSOR ADAPTATIVO

   1. DOMÍNIO COM EVIDÊNCIAS
      Cada aula guarda as tentativas (acertou? precisou de dica/resposta?
      quando?). Estados:
        visto       leu a aula
        praticando  acertou, mas ainda é pouco pra dizer que sabe
        dominado    2+ acertos, pelo menos 1 SEM ajuda, em momentos
                    diferentes (6 h+ entre eles) e ≥ 70% de acerto
        revisar     já sabia, mas faz tempo (revisão espaçada: 1, 3, 7, 14 dias)
      Uma resposta certa NUNCA vira "dominado" sozinha.
   2. MODOS: aprender do zero, praticar, desafios, analisar código
      (caça ao bug), criar projetos, revisar pra avaliação.
   3. CAÇA AO BUG: pego um código CERTO das aulas, coloco um defeito
      que o meu analisador confirma, e o aluno tem que achar a linha.
   4. Objetivo, pré-requisito e critério pra avançar de cada aula.
   5. Reiniciar uma trilha (com confirmação).
   Tudo fica no progresso do usuário (no aparelho).
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const ProfessorAdaptativo = (() => {
  const HORA = 3600e3, DIA = 24 * HORA;
  const INTERVALOS = [1, 3, 7, 14, 30];   // dias até a próxima revisão, conforme os acertos
  const prog = () => (typeof Treino !== "undefined" && Treino.progresso) || {};
  const salvar = () => { if (typeof Treino !== "undefined") Treino.salvarProgresso(); };

  /* ---------------- 1. domínio ---------------- */
  function registrar(aulaId, lang, ok, extra = {}) {
    if (!aulaId) return;
    const p = prog();
    const ev = (p._evidencias = p._evidencias || {});
    const l = (ev[aulaId] = ev[aulaId] || []);
    l.push({ t: Date.now(), ok: !!ok, ajuda: extra.ajuda || 0, tipo: extra.tipo || "desafio", lang });
    if (l.length > 12) l.splice(0, l.length - 12);
    salvar();
  }
  function estadoAula(aulaId) {
    const p = prog();
    const l = (p._evidencias || {})[aulaId] || [];
    const vista = (p._vistas || []).includes(aulaId);
    const oks = l.filter(x => x.ok);
    if (!oks.length) return { estado: vista ? "visto" : "nao-visto", acertos: 0, tentativas: l.length };
    const ultimas = l.slice(-5);
    const taxa = ultimas.filter(x => x.ok).length / ultimas.length;
    const semAjuda = oks.some(x => !x.ajuda);
    const espacados = oks.length >= 2 && oks[oks.length - 1].t - oks[0].t >= 6 * HORA;
    const dominado = oks.length >= 2 && semAjuda && espacados && taxa >= 0.7;
    const intervalo = INTERVALOS[Math.min(oks.length - 1, INTERVALOS.length - 1)] * DIA;
    const ultimoOk = oks[oks.length - 1].t;
    const devida = Date.now() - ultimoOk >= intervalo;
    return { estado: devida ? "revisar" : dominado ? "dominado" : "praticando", dominado, acertos: oks.length, tentativas: l.length, taxa, semAjuda, proximaRevisao: ultimoOk + intervalo };
  }
  const ROTULO = { "nao-visto": "⬜ não vista", visto: "👀 vista", praticando: "🌱 praticando", dominado: "✅ dominada", revisar: "🔁 hora de revisar" };
  function porQue(e) {
    if (e.estado === "dominado") return "acertou em momentos diferentes, sem ajuda";
    if (e.estado === "praticando") return !e.semAjuda ? "acertou, mas com dica/resposta" : e.acertos < 2 ? "1 acerto ainda não prova que fixou" : "falta acertar de novo outro dia";
    if (e.estado === "revisar") return "faz tempo: uma revisão agora fixa de vez";
    return "";
  }
  const aulasDe = lang => (typeof temasDa === "function" ? temasDa(lang) : WCDEV.temas.filter(t => t.lang === lang && !t.ref));
  function devidas(lang) {
    const langs = lang ? [lang] : ["pawn", "python", "html", "css", "javascript"];
    return langs.flatMap(l => aulasDe(l).map(a => ({ a, e: estadoAula(a.id) }))).filter(x => x.e.estado === "revisar" || (x.e.estado === "praticando" && Date.now() - ((prog()._evidencias || {})[x.a.id] || []).slice(-1)[0].t > 6 * HORA));
  }

  /* ---------------- 4. objetivo / pré-requisito / critério ---------------- */
  function cabecalhoAula(aula) {
    const lista = aulasDe(aula.lang);
    const i = lista.findIndex(x => x.id === aula.id);
    const d = WCDEV.desafiosAula && WCDEV.desafiosAula[aula.id];
    const linhas = [];
    if (d && d.enunciado) linhas.push(`🎯 **Objetivo:** no fim você consegue: ${d.enunciado.replace(/\n[\s\S]*$/, "").replace(/\*\*/g, "").slice(0, 160)}`);
    if (i > 0) {
      const ant = lista[i - 1];
      const e = estadoAula(ant.id);
      const feita = WCDEV.professor && WCDEV.professor.aulaFeita(ant.id);
      linhas.push(`📌 **Pré-requisito:** ${ant.titulo}${feita || e.acertos ? " ✔" : " (você ainda não fez o desafio dela: se travar aqui, volte nela)"}`);
    }
    if (d) linhas.push("✅ **Pra avançar:** passar no desafio do fim (eu confiro o código automaticamente). Pra ficar **dominada**, acerte de novo outro dia, sem dica.");
    return linhas.length ? "> " + linhas.join("\n> ") + "\n" : "";
  }

  /* ---------------- 2. modos ---------------- */
  const MODOS = {
    zero: ["🌱 Aprender do zero", "Aula por aula, na ordem, com desafio no fim de cada uma. A próxima só libera quando você passa.", l => `/${l}`],
    praticar: ["🏋️ Praticar", "Exercícios no seu nível (ele sobe quando você vence e segura quando precisa de ajuda).", l => `/treinar ${l}`],
    desafios: ["🎲 Desafios", "Desafios novos inventados na hora, no nível que você está.", l => `/desafio ${l}`],
    analisar: ["🔎 Analisar código (caça ao bug)", "Eu te mostro um código com UM defeito escondido e você acha a linha. Treina o olho pra revisar.", () => "/caca"],
    projetos: ["🏗️ Criar projetos", "Missões maiores com checklist e roteiros de projeto (RPG, site...).", l => `/missao ${l}`],
    revisao: ["📝 Revisar pra avaliação", "Só o que está na hora de revisar (revisão espaçada) e o que você ainda não fixou.", () => "/revisao"],
  };
  function modos(resto) {
    const l = estado.lang && NOMES[estado.lang] ? estado.lang : "pawn";
    const k = (resto || "").trim().toLowerCase().replace(/^(do zero|zero|aprender)$/, "zero").replace(/^(praticar|pratica|prática)$/, "praticar").replace(/^(desafio|desafios)$/, "desafios").replace(/^(analisar|caça|caca|bug)$/, "analisar").replace(/^(projeto|projetos)$/, "projetos").replace(/^(revisar|revisão|revisao|prova|avaliação)$/, "revisao");
    if (MODOS[k]) { prog()._modo = k; salvar(); return { texto: `Modo **${MODOS[k][0]}** ligado. ${MODOS[k][1]}`, sugestoes: [MODOS[k][2](l)] }; }
    const atual = prog()._modo;
    return { texto: "### 🧭 Como você quer estudar agora?\n" + Object.entries(MODOS).map(([key, [n, d]]) => `- **${n}**${atual === key ? " _(atual)_" : ""}: ${d}`).join("\n") + `\n\nEscolha com {{/modo praticar}}, {{/modo analisar}}... (linguagem atual: **${NOMES[l]}**)`, sugestoes: Object.values(MODOS).map(m => m[2](l)) };
  }

  /* ---------------- 3. caça ao bug ---------------- */
  // cada mutação quebra o código de um jeito que o meu analisador/revisor CONFIRMA na linha certa
  const MUTACOES = [
    { nome: "for que passa do limite", re: /(for\s*\(\s*new\s+(\w+)\s*=\s*0\s*;\s*\2\s*)<(\s*MAX_PLAYERS)/, para: "$1<=$3", regra: "loop-passa-do-limite", explica: "Com `<=` o loop chega em MAX_PLAYERS, que não existe no array (vai de 0 a MAX_PLAYERS - 1)." },
    { nome: "ponto e vírgula depois do if", re: /^(\s*if\s*\(.+\))\s*$/m, para: "$1;", regra: "if-com-ponto-e-virgula", explica: "O `;` depois do `if (...)` vira um comando vazio: o Pawn nem compila (error 036)." },
    { nome: "comparação virou atribuição", re: /(if\s*\([^=!<>]*?\w)\s*==\s*/, para: "$1 = ", sintaxe: true, explica: "`=` dentro do if ATRIBUI em vez de comparar (o compilador avisa com warning 211)." },
    { nome: "comando sem return", re: /^(\s*)return 1;(\s*\n\s*\}\s*)$/m, para: "$2", regra: "comando-sem-return", soComando: true, explica: "Sem `return 1;` o jogador vê \"SERVER: Unknown command\"." },
    { nome: "faltou o ponto e vírgula", re: /^(\s*(?:SendClientMessage|SetPlayer\w+|GivePlayer\w+)\([^;\n]*\));\s*$/m, para: "$1", sintaxe: true, explica: "Toda instrução termina com `;`." },
    { nome: "id sem conferir", re: /^\s*if\s*\(\s*!IsPlayerConnected\((\w+)\)\)[^\n]*\n/m, para: "", regras: ["sscanf-id-sem-validar", "playerid-sem-validar", "entrada-do-jogador"], explica: "Tirei a checagem `IsPlayerConnected`: um id de alguém offline quebra o código." },
  ];
  function fontesPawn() {
    const out = [];
    for (const [id, d] of Object.entries(WCDEV.desafiosAula || {})) if (/^pawn/.test(id) && d.solucao && !d.semRevisor && d.solucao.split("\n").length >= 5) out.push({ codigo: d.solucao, aula: id });
    for (const t of WCDEV.temas) if (t.lang === "pawn" && !t.ref && typeof t.resposta === "string") for (const m of t.resposta.matchAll(/~~~pawn\n([\s\S]*?)~~~/g)) if (m[1].split("\n").length >= 5 && !/errado|erro:/i.test(m[1])) out.push({ codigo: m[1].replace(/\n$/, ""), aula: t.id });
    return out;
  }
  function gerarCaca() {
    const A = WCDEV.analisador;
    const fontes = fontesPawn().sort(() => Math.random() - 0.5);
    for (const f of fontes.slice(0, 60)) {
      const base = A.analisar(f.codigo, "pawn");
      const antes = new Set(base.achados.filter(a => a.nivel !== "sugestao").map(a => a.regra + ":" + a.linha));
      const sintAntes = base.sintaxe.filter(s => s.tipo === "erro").length;
      for (const mu of MUTACOES.slice().sort(() => Math.random() - 0.5)) {
        if (mu.soComando && !/CMD:/.test(f.codigo)) continue;
        const m = f.codigo.match(mu.re);
        if (!m) continue;
        const novo = f.codigo.replace(mu.re, mu.para);
        if (novo === f.codigo) continue;
        const linhaBug = f.codigo.slice(0, m.index).split("\n").length + (mu.nome === "comando sem return" ? 0 : 0);
        const r = A.analisar(novo, "pawn", { semCache: true });
        // o defeito tem que aparecer (na linha da mudança, ±1) e ser NOVO
        const achou = mu.sintaxe
          ? r.sintaxe.some(s => Math.abs(s.linha - linhaBug) <= 1) && (r.sintaxe.filter(s => s.tipo === "erro").length > sintAntes || r.sintaxe.length > base.sintaxe.length)
          : r.achados.some(a => (mu.regra ? a.regra === mu.regra : mu.regras.includes(a.regra)) && !antes.has(a.regra + ":" + a.linha) && Math.abs(a.linha - linhaBug) <= 2);
        if (!achou) continue;
        const linhaFinal = mu.nome === "id sem conferir" ? linhaBug : linhaBug;
        return { codigo: novo, linha: linhaFinal, mutacao: mu, aula: f.aula, original: f.codigo };
      }
    }
    return null;
  }
  function caca() {
    const c = gerarCaca();
    if (!c) return { texto: "Não consegui montar uma caça ao bug agora. Tente {{/desafio pawn}}." };
    estado.caca = { ...c, tentativas: 0 };
    const numerado = c.codigo.split("\n").map((l, i) => `${String(i + 1).padStart(2)}| ${l}`).join("\n");
    return { texto: `### 🔎 Caça ao bug\nEsse código **tinha** tudo certo, até eu esconder **um defeito** nele. Ache a linha!\n~~~pawn\n${numerado}\n~~~\nResponda só o número da linha (ex: **7**). Se travar: **/dica**.`, sugestoes: ["/dica", "desisto"] };
  }
  function responderCaca(bruto) {
    const c = estado.caca;
    if (!c) return null;
    const t = normalizar(bruto);
    if (/^ ?\/dica ?$/.test(t) || t.trim() === "/dica") { c.dica = true; return { texto: `💡 Pista: procure por **${c.mutacao.nome}**.` }; }
    if (/desisto|resposta|nao sei/.test(t)) { estado.caca = null; registrar(c.aula, "pawn", false, { tipo: "caca" }); return { texto: `Era a **linha ${c.linha}**: ${c.mutacao.nome}. ${c.mutacao.explica}\n\nO certo era:\n~~~pawn\n${c.original.split("\n")[c.linha - 1] || ""}\n~~~`, sugestoes: ["/caca", "/modo"] }; }
    const n = parseInt((bruto.match(/\d+/) || [])[0], 10);
    if (!n) return null;
    c.tentativas++;
    if (Math.abs(n - c.linha) <= (c.mutacao.nome === "comando sem return" ? 1 : 0)) {
      estado.caca = null;
      registrar(c.aula, "pawn", true, { tipo: "caca", ajuda: c.dica ? 1 : 0 });
      return { texto: `### ✅ Achou! Linha ${c.linha}\n**${c.mutacao.nome}**: ${c.mutacao.explica}\n\nCorrigindo:\n~~~pawn\n${c.original.split("\n")[c.linha - 1] || ""}\n~~~\n${c.tentativas > 1 ? `(na ${c.tentativas}ª tentativa)` : "De primeira! 👏"}`, sugestoes: ["/caca", "/modo"] };
    }
    if (c.tentativas >= 3) { estado.caca = null; registrar(c.aula, "pawn", false, { tipo: "caca" }); return { texto: `Não foi dessa vez. Era a **linha ${c.linha}** (${c.mutacao.nome}). ${c.mutacao.explica}`, sugestoes: ["/caca"] }; }
    return { texto: `Linha ${n} está ok. ${3 - c.tentativas} tentativa(s) ainda. ${c.tentativas === 2 ? `Pista: **${c.mutacao.nome}**.` : ""}`, sugestoes: ["/dica", "desisto"] };
  }

  /* ---------------- revisão pra avaliação ---------------- */
  function revisao(lang) {
    const lista = devidas(lang).slice(0, 6);
    if (!lista.length) {
      const fracas = ["pawn", "python", "html", "css", "javascript"].flatMap(l => aulasDe(l).map(a => ({ a, e: estadoAula(a.id) }))).filter(x => x.e.tentativas && x.e.taxa < 0.7).slice(0, 4);
      if (!fracas.length) return { texto: "Nada pra revisar agora 🎉 Tudo que você praticou está em dia. Quer um **/desafio** ou uma **/caca** ao bug?", sugestoes: ["/caca", "/desafio"] };
      return { texto: "Nada vencido, mas estes você erra mais (vale reforçar):\n" + fracas.map(x => `- **${x.a.titulo}** (${Math.round(x.e.taxa * 100)}% de acerto)`).join("\n"), sugestoes: fracas.map(x => x.a.titulo).slice(0, 4) };
    }
    const prim = lista[0].a;
    const d = WCDEV.professor && WCDEV.professor.montarDesafio(prim);
    let texto = "### 📝 Revisão (revisão espaçada)\nNa hora de revisar:\n" + lista.map(x => `- **${x.a.titulo}** — ${ROTULO[x.e.estado]} (${porQue(x.e)})`).join("\n");
    if (d) { const r = Treino.abrir({ ...d, revisao: true }); texto += `\n\nComeçando por **${prim.titulo}** 👇\n\n` + r.texto; return { texto, sugestoes: r.sugestoes }; }
    return { texto, sugestoes: lista.map(x => x.a.titulo).slice(0, 4) };
  }

  /* ---------------- 5. reiniciar trilha ---------------- */
  function reiniciar(resto) {
    const partes = (resto || "").trim().split(/\s+/);
    const lang = NOMES[partes[0]] ? partes[0] : null;
    if (!lang) return { texto: "Qual trilha? Ex: {{/reiniciar pawn}}" };
    if (partes[1] !== "confirmar") return { texto: `Isso apaga o seu progresso da trilha de **${NOMES[lang]}** (aulas vistas, desafios feitos e o histórico de acertos dela). As outras trilhas não mudam.\n\nPra confirmar: {{/reiniciar ${lang} confirmar}}`, sugestoes: [`/reiniciar ${lang} confirmar`] };
    const p = prog();
    const ids = new Set(aulasDe(lang).map(a => a.id));
    p._vistas = (p._vistas || []).filter(x => !ids.has(x));
    p._aulasOk = (p._aulasOk || []).filter(x => !ids.has(x));
    p._aulasPuladas = (p._aulasPuladas || []).filter(x => !ids.has(x));
    for (const id of ids) if (p._evidencias) delete p._evidencias[id];
    if (p._desafios) p._desafios[lang] = 0;
    if (p._ajuda) p._ajuda[lang] = 0;
    p[lang] = [];
    salvar();
    return { texto: `🔄 Trilha de **${NOMES[lang]}** reiniciada. Bora do começo!`, sugestoes: [`/${lang}`] };
  }

  /* ---------------- boletim com domínio ---------------- */
  function dominioDaTrilha(lang) {
    const aulas = aulasDe(lang);
    const c = { dominado: 0, praticando: 0, revisar: 0, visto: 0, "nao-visto": 0 };
    aulas.forEach(a => { c[estadoAula(a.id).estado]++; });
    return c;
  }

  return { registrar, estadoAula, ROTULO, porQue, devidas, cabecalhoAula, modos, caca, responderCaca, revisao, reiniciar, dominioDaTrilha, gerarCaca, MUTACOES };
})();

WCDEV.professorAdaptativo = ProfessorAdaptativo;
