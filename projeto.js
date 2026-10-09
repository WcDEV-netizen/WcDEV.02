/* =========================================================
   WC DEV — ANÁLISE DE PROJETO (vários arquivos .pwn / .inc)

   Problema que resolve: analisar um arquivo por vez faz o analisador
   achar que tudo que está em outro arquivo "não existe" (ou, pior,
   não ver que a mesma função foi criada em dois arquivos).

   Como funciona (igual ao pré-processador do Pawn):
     1. acha o(s) arquivo(s) principal(is): .pwn que ninguém inclui
     2. monta a UNIDADE DE COMPILAÇÃO: troca cada #include por um
        arquivo fornecido pelo conteúdo dele, respeitando a guarda
        (#if defined X / #endinput) — sem guarda, inclui de novo,
        exatamente como o pawncc 3.10 faz
     3. guarda um MAPA de cada linha da unidade -> arquivo e linha real
     4. roda o analisador inteiro (sintaxe, regras antigas, fluxo,
        estado, projeto) na unidade
     5. devolve cada diagnóstico no arquivo e linha certos
     6. include que não foi fornecido e não é padrão = LIMITAÇÃO
        avisada (aí nada vira "não existe" com certeza)

   Também monta o índice de símbolos (funções, comandos, variáveis,
   enums, quem chama quem) pra interface mostrar o "mapa do projeto".
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Projeto = (() => {
  // includes que todo mundo tem (não precisam ser enviados)
  const PADRAO = /^(a_samp|a_players|a_vehicles|a_objects|a_npc|a_actor|a_http|a_sampdb|core|float|string|file|time|datagram|console|args|open\.mp|omp|omp_\w+|zcmd|izcmd|sscanf2|sscanf|DOF2|dof2|dini|dutils|foreach|streamer|a_mysql|Pawn\.CMD|easyDialog|YSI_\w+|YSI\\?\/?.*|y_\w+|crashdetect|bcrypt|samp_bcrypt|sqlitei|mapandreas|colandreas|profiler|Pawn\.RakNet|strlib|requests|discord-connector|nex-ac|weapon-config|mdialog|mSelection|easy-mysql|whirlpool|SHA256|progress2|PreviewModelDialog|fixes|samp-stdlib|pawn-stdlib)$/i;
  const norm = p => String(p).replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+/g, "/").trim();
  const semExt = p => p.replace(/\.(inc|pwn|p|pawn)$/i, "");
  const base = p => norm(p).split("/").pop();

  function resolver(nome, sistema, de, arquivos) {
    const n = norm(nome);
    const dir = norm(de).split("/").slice(0, -1).join("/");
    const cands = [];
    const add = c => { c = norm(c); cands.push(c, c + ".inc", c + ".pwn"); };
    if (!sistema && dir) add(dir + "/" + n);
    add(n);
    for (const pasta of ["include", "includes", "pawno/include", "qawno/include", "inc", "gamemodes", "filterscripts"]) add(pasta + "/" + n);
    for (const c of cands) if (arquivos.has(c)) return c;
    const alvo = semExt(base(n)).toLowerCase();
    const achados = [...arquivos.keys()].filter(k => semExt(base(k)).toLowerCase() === alvo);
    return achados.length ? achados.sort((a, b) => a.length - b.length)[0] : null;
  }
  // guarda clássica: #if defined X  #endinput  #endif  #define X
  function guarda(codigo) {
    const m = codigo.match(/^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*#\s*if\s+defined\s+(\w+)\s*\n\s*#\s*endinput/);
    if (m && new RegExp("#\\s*define\\s+" + m[1] + "\\b").test(codigo)) return m[1];
    const m2 = codigo.match(/^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*#\s*if\s+!\s*defined\s+(\w+)\s*\n\s*#\s*define\s+\1\b/);   // #if !defined X / #define X ... #endif
    return m2 ? m2[1] : null;
  }

  function montarUnidade(arquivos, principal) {
    const linhas = [], mapa = [];
    const faltando = [], incluidos = [], vezes = new Map(), guardas = new Set(), avisos = [], origemInclude = new Map();
    const pilha = [];
    function incluir(nome, prof, de) {
      if (prof > 24) { avisos.push(`includes aninhados demais (mais de 24 níveis) em ${nome}`); return; }
      if (pilha.includes(nome)) { avisos.push(`${nome} se inclui em ciclo (${pilha.join(" → ")} → ${nome})`); return; }
      const cod = arquivos.get(nome);
      const g = guarda(cod);
      if (g && guardas.has(g)) return;
      if (g) guardas.add(g);
      vezes.set(nome, (vezes.get(nome) || 0) + 1);
      if (!origemInclude.has(nome)) origemInclude.set(nome, []);
      if (de) origemInclude.get(nome).push(de);
      incluidos.push(nome);
      pilha.push(nome);
      const ls = cod.split("\n");
      for (let i = 0; i < ls.length; i++) {
        const L = ls[i];
        const m = L.match(/^\s*#\s*(include|tryinclude)\s*([<"])([^>"]+)[>"]/);
        if (m) {
          const alvo = resolver(m[3], m[2] === "<", nome, arquivos);
          if (alvo && alvo !== nome) {
            linhas.push(`// [wcdev] incluído: ${alvo}`); mapa.push({ arquivo: nome, linha: i + 1 });
            incluir(alvo, prof + 1, `${nome}:${i + 1}`);
            continue;
          }
          if (!alvo && m[1] === "include" && !PADRAO.test(semExt(base(m[3])))) faltando.push({ nome: m[3], de: nome, linha: i + 1 });
        }
        linhas.push(L); mapa.push({ arquivo: nome, linha: i + 1 });
      }
      pilha.pop();
    }
    incluir(principal, 0, null);
    return { principal, codigo: linhas.join("\n"), mapa, faltando, incluidos, vezes, avisos, origemInclude };
  }

  function principaisDe(arquivos) {
    const incluidosPorAlguem = new Set();
    for (const [nome, cod] of arquivos) for (const m of cod.matchAll(/^\s*#\s*(?:try)?include\s*([<"])([^>"]+)[>"]/gm)) { const r = resolver(m[2], m[1] === "<", nome, arquivos); if (r && r !== nome) incluidosPorAlguem.add(r); }
    let p = [...arquivos.keys()].filter(k => /\.pwn$/i.test(k) && !incluidosPorAlguem.has(k));
    if (!p.length) p = [...arquivos.keys()].filter(k => !incluidosPorAlguem.has(k));
    if (!p.length) p = [[...arquivos.keys()][0]];
    return p;
  }

  // troca "linha 37" (da unidade) por "linha 5 (sistemas/xp.inc)" nos textos
  function traduzirTexto(t, u, arquivoDoAchado) {
    if (!t || typeof t !== "string") return t;
    return t.replace(/\blinha (\d+)( \([^)]*\))?/g, (x, n, par) => {
      const m = u.mapa[+n - 1];
      if (!m) return x;
      return `linha ${m.linha}${m.arquivo !== arquivoDoAchado ? ` de **${m.arquivo}**` : ""}`;
    });
  }

  function entradaParaMapa(entrada) {
    if (entrada instanceof Map) return new Map([...entrada].map(([k, v]) => [norm(k), String(v).replace(/\r\n?/g, "\n")]));
    if (Array.isArray(entrada)) return new Map(entrada.map(x => [norm(x.nome), String(x.codigo).replace(/\r\n?/g, "\n")]));
    return new Map(Object.entries(entrada).map(([k, v]) => [norm(k), String(v).replace(/\r\n?/g, "\n")]));
  }

  /* ---------- índice de símbolos (mapa do projeto) ---------- */
  function indice(u, r) {
    const ast = r.ctx && r.ctx.ast;
    if (!ast) return null;
    const onde = l => u.mapa[l - 1] || { arquivo: "?", linha: l };
    const P = WCDEV.pawnAst;
    const funcoes = ast.funcoes.filter(f => f.tipo !== "trecho").map(f => ({ nome: f.nome, tipo: f.tipo, params: f.params.map(p => p.nome), ...onde(f.linhaNome || f.linha), chama: [...new Set(P.chamadas(f.corpo).map(c => c.nome))].filter(n => ast.funcoes.some(g => g.nome === n)) }));
    const chamadaPor = {};
    for (const f of funcoes) for (const c of f.chama) (chamadaPor[c] = chamadaPor[c] || []).push(f.nome);
    funcoes.forEach(f => { f.chamadaPor = chamadaPor[f.nome] || []; });
    const porArquivo = {};
    for (const f of funcoes) (porArquivo[f.arquivo] = porArquivo[f.arquivo] || { funcoes: 0, comandos: 0, callbacks: 0, globais: 0 })[f.tipo === "comando" ? "comandos" : /^On[A-Z]/.test(f.nome) && f.tipo === "public" ? "callbacks" : "funcoes"]++;
    for (const g of ast.globais) { const o = onde(g.linha); (porArquivo[o.arquivo] = porArquivo[o.arquivo] || { funcoes: 0, comandos: 0, callbacks: 0, globais: 0 }).globais++; }
    return {
      funcoes, porArquivo,
      globais: ast.globais.map(g => ({ nome: g.nome, ...onde(g.linha) })),
      enums: ast.enums.map(e => ({ nome: e.nome, membros: e.membros.map(m => m.nome), ...onde(e.linha) })),
      includes: u.incluidos, faltando: u.faltando,
      naoUsadas: funcoes.filter(f => f.tipo === "stock" && !f.chamadaPor.length && !/^(main)$/.test(f.nome)).map(f => f.nome),
    };
  }

  /* ---------- análise ---------- */
  // entrada: { "gm.pwn": "...", "sistemas/xp.inc": "..." } (ou Map / lista {nome, codigo})
  function analisar(entrada, opcoes = {}) {
    const t0 = Date.now();
    const arquivos = entradaParaMapa(entrada);
    const principais = opcoes.principal ? [norm(opcoes.principal)] : principaisDe(arquivos);
    const diagnosticos = [], unidades = [], cobertos = new Set(), vistos = new Set(), relatorios = [];
    const add = d => { const k = `${d.arquivo}:${d.linha}:${d.regra}:${d.titulo}`; if (vistos.has(k)) return; vistos.add(k); diagnosticos.push(d); };
    for (const pronto of opcoes.principaisProntos || []) {
      pronto.diagnosticos.forEach(add); pronto.unidades.forEach(u => { unidades.push(u); }); (pronto.relatorios || []).forEach(x => { relatorios.push(x); x.u.incluidos.forEach(i => cobertos.add(i)); });
    }
    for (const p of opcoes.principaisProntos ? [] : principais) {
      if (!arquivos.has(p)) continue;
      if (opcoes.cancelado && opcoes.cancelado()) break;
      const u = montarUnidade(arquivos, p);
      u.incluidos.forEach(x => cobertos.add(x));
      const r = WCDEV.analisador.analisar(u.codigo, "pawn", {
        arquivoDe: l => (u.mapa[l - 1] || {}).arquivo || "?", faltando: u.faltando.map(f => f.nome),
        limiteTexto: opcoes.limiteTexto || 4e6, limiteTempo: opcoes.limiteTempo || 12000,
      });
      const onde = l => u.mapa[l - 1] || { arquivo: p, linha: l };
      for (const s of r.sintaxe) { const o = onde(s.linha); add({ ...o, regra: "sintaxe", nivel: s.tipo === "erro" ? "erro" : "sugestao", categoria: s.tipo === "erro" ? "compilacao" : "estilo", titulo: s.msg, trecho: (arquivos.get(o.arquivo).split("\n")[o.linha - 1] || "").trim() }); }
      for (const a of r.achados) {
        const o = onde(a.linha);
        const d = { ...a, ...o, unidade: p, linhaUnidade: a.linha };
        for (const campo of ["titulo", "porque", "consequencia", "quando", "correcao"]) d[campo] = traduzirTexto(a[campo], u, o.arquivo);
        d.evidencias = (a.evidencias || []).map(e => { const m = onde(e.linha); return { ...e, arquivo: m.arquivo, linha: m.linha, trecho: (arquivos.get(m.arquivo).split("\n")[m.linha - 1] || "").trim().slice(0, 90) }; });
        // símbolo duplicado porque o MESMO arquivo entrou duas vezes (sem guarda)
        if (a.regra === "simbolo-duplicado" && d.evidencias.length === 2 && d.evidencias[0].arquivo === d.evidencias[1].arquivo && d.evidencias[0].linha === d.evidencias[1].linha) {
          const quem = (u.origemInclude.get(o.arquivo) || []).map(x => `**${x.split(":")[0]}**`);
          d.titulo = `**${o.arquivo}** é incluído ${u.vezes.get(o.arquivo) || 2} vezes e não tem proteção`;
          d.porque = `O arquivo entra na compilação mais de uma vez (incluído por ${[...new Set(quem)].join(" e ") || "mais de um arquivo"}) e não tem a guarda {{#if defined ... #endinput}}. O pawncc **não** evita isso sozinho: tudo que está nele é criado de novo.`;
          d.correcao = `No começo de **${o.arquivo}** coloque:\n{{#if defined _${semExt(base(o.arquivo)).replace(/\W/g, "_")}_included}}\n{{    #endinput}}\n{{#endif}}\n{{#define _${semExt(base(o.arquivo)).replace(/\W/g, "_")}_included}}`;
          d.categoria = "compilacao";
        }
        add(d);
      }
      for (const f of u.faltando) add({ arquivo: f.de, linha: f.linha, regra: "include-faltando", nivel: "verificar", categoria: "info", titulo: `Não recebi o arquivo **${f.nome}**`,
        porque: `Ele é incluído aqui, mas não está entre os arquivos enviados (e não é um include padrão).`, consequencia: "Tudo que estiver declarado nele eu **não consigo ver**: referências a ele viram \"risco potencial\", nunca \"erro confirmado\".",
        correcao: "Mande esse arquivo junto pra uma análise completa.", trecho: (arquivos.get(f.de).split("\n")[f.linha - 1] || "").trim(), limites: "Limitação da análise, não é um problema do código." });
      u.avisos.forEach(x => add({ arquivo: p, linha: 1, regra: "estrutura-includes", nivel: "verificar", categoria: "info", titulo: x, porque: x, correcao: "Confira os #include.", trecho: "" }));
      unidades.push({ principal: p, arquivos: u.incluidos.length, linhas: u.mapa.length, faltando: u.faltando, tempo: r.tempo, puladas: r.puladas, cortado: r.cortado, indice: indice(u, r) });
      relatorios.push({ u, r });
    }
    // arquivos que nenhum principal inclui: analisados sozinhos (com aviso)
    for (const [nome, cod] of opcoes.semSoltos ? [] : arquivos) {
      if (cobertos.has(nome)) continue;
      const r = WCDEV.analisador.analisar(cod, "pawn", { arquivoDe: () => nome, semCache: false });
      for (const s of r.sintaxe) add({ arquivo: nome, linha: s.linha, regra: "sintaxe", nivel: s.tipo === "erro" ? "erro" : "sugestao", categoria: s.tipo === "erro" ? "compilacao" : "estilo", titulo: s.msg, trecho: (cod.split("\n")[s.linha - 1] || "").trim() });
      for (const a of r.achados) add({ ...a, arquivo: nome, sozinho: true, evidencias: (a.evidencias || []).map(e => ({ ...e, arquivo: nome })) });
      unidades.push({ principal: nome, sozinho: true, arquivos: 1, linhas: cod.split("\n").length, faltando: [], tempo: r.tempo });
    }
    const ORD = { erro: 0, provavel: 1, verificar: 2, sugestao: 3 };
    diagnosticos.sort((a, b) => ORD[a.nivel] - ORD[b.nivel] || a.arquivo.localeCompare(b.arquivo) || a.linha - b.linha);
    return { diagnosticos, unidades, principais: opcoes.principaisProntos ? opcoes.principaisProntos.flatMap(x => x.principais) : principais, arquivos: [...arquivos.keys()], faltando: unidades.flatMap(u => u.faltando || []), tempo: Date.now() - t0 + (opcoes.principaisProntos || []).reduce((s, x) => s + x.tempo, 0), relatorios };
  }

  /* ---------- correção no projeto (arquivo por arquivo, reverificando o projeto inteiro) ---------- */
  function corrigir(entrada, opcoes = {}) {
    const arquivos = entradaParaMapa(entrada);
    const antes = analisar(arquivos, opcoes);
    const serio = d => d.nivel === "erro" || d.nivel === "provavel";
    const ass = d => `${d.regra}|${d.arquivo}|${(d.trecho || "").replace(/\s+/g, " ")}`;
    const assAntes = new Set(antes.diagnosticos.filter(serio).map(ass));
    const candidatas = antes.diagnosticos.filter(d => d.correcoes && d.correcoes.length && !d.sozinho && (serio(d) || (d.seguro && opcoes.incluirSeguras !== false)));
    let atual = new Map(arquivos);
    const aplicadas = [], recusadas = [];
    const rel = new Map(antes.relatorios.map(x => [x.u.principal, x.u]));
    const aplicarLista = lista => {
      const porArquivo = new Map();
      for (const d of lista) {
        const u = rel.get(d.unidade);
        for (const c of d.correcoes) { const m = u && u.mapa[c.linha - 1]; if (!m) continue; if (!porArquivo.has(m.arquivo)) porArquivo.set(m.arquivo, []); porArquivo.get(m.arquivo).push({ ...c, linha: m.linha }); }
      }
      const novo = new Map(arquivos);
      for (const [arq, cs] of porArquivo) novo.set(arq, WCDEV.analisador.aplicar(arquivos.get(arq), cs));
      return novo;
    };
    for (const d of candidatas) {
      const teste = aplicarLista([...aplicadas, d]);
      const depois = analisar(teste, opcoes);
      const novos = depois.diagnosticos.filter(x => serio(x) && x.regra !== d.regra && !assAntes.has(ass(x)));
      if (novos.length) { recusadas.push({ diagnostico: d, motivo: `criava outro problema: ${novos[0].titulo.replace(/\{\{|\}\}|\*\*/g, "")} (${novos[0].arquivo}:${novos[0].linha})` }); continue; }
      aplicadas.push(d);
      atual = teste;
    }
    const final = aplicadas.length ? analisar(atual, opcoes) : antes;
    const mudados = [...atual].filter(([k, v]) => v !== arquivos.get(k)).map(([k]) => k);
    return { arquivos: atual, mudados, aplicadas, recusadas, antes, depois: final,
      diffs: Object.fromEntries(mudados.map(k => [k, WCDEV.analisador.diff(arquivos.get(k), atual.get(k))])) };
  }

  /* ---------- texto colado com vários arquivos ----------
     // arquivo: gm.pwn          (ou  // === gm.pwn ===   ou  // FILE: gm.pwn)
     ...
     // arquivo: sistemas/xp.inc
     ... */
  function separarColado(texto) {
    const re = /^[ \t]*\/\/\s*(?:arquivo|file|=+)\s*:?\s*([\w./\\-]+\.(?:pwn|inc|p))\s*=*\s*$/gim;
    const marcas = [...texto.matchAll(re)];
    if (marcas.length < 2) return null;
    const out = {};
    marcas.forEach((m, i) => { const ini = m.index + m[0].length + 1, fim = i + 1 < marcas.length ? marcas[i + 1].index : texto.length; out[norm(m[1])] = texto.slice(ini, fim).replace(/\s+$/, "") + "\n"; });
    return out;
  }

  /* ---------- versão sem travar a página: um arquivo principal por vez, com progresso e cancelar ---------- */
  async function analisarAsync(entrada, opcoes = {}) {
    const arquivos = entradaParaMapa(entrada);
    const principais = opcoes.principal ? [norm(opcoes.principal)] : principaisDe(arquivos);
    const passo = () => new Promise(r => setTimeout(r, 0));
    const partes = [];
    let i = 0;
    for (const p of principais) {
      if (opcoes.cancelado && opcoes.cancelado()) return { cancelado: true };
      opcoes.aoProgresso && opcoes.aoProgresso(++i, principais.length + 1, p);
      await passo();
      partes.push(analisar(arquivos, { ...opcoes, principal: p, semSoltos: true }));
    }
    if (opcoes.cancelado && opcoes.cancelado()) return { cancelado: true };
    opcoes.aoProgresso && opcoes.aoProgresso(principais.length + 1, principais.length + 1, "arquivos soltos");
    await passo();
    // junta (e analisa os arquivos que ninguém inclui)
    return analisar(arquivos, { ...opcoes, principaisProntos: partes });
  }

  /* ---------- painel (mesmo formato do analisador, com arquivo e resumo do projeto) ---------- */
  function relatorio(res, opcoes = {}) {
    const A = WCDEV.analisador;
    const sint = res.diagnosticos.filter(d => d.regra === "sintaxe" && d.nivel === "erro");
    const ach = res.diagnosticos.filter(d => d.regra !== "sintaxe");
    const porArquivo = {};
    for (const d of res.diagnosticos) { const x = porArquivo[d.arquivo] = porArquivo[d.arquivo] || { erro: 0, provavel: 0, verificar: 0, sugestao: 0 }; x[d.regra === "sintaxe" && d.nivel === "erro" ? "erro" : d.nivel]++; }
    const indice = res.unidades.find(u => u.indice) ? res.unidades.find(u => u.indice).indice : null;
    const CATS = Object.keys(A.CATEGORIAS);
    const dados = {
      curto: false, versao: A.VERSAO_REGRAS, tempo: res.tempo, regras: A.regras.pawn.length,
      linhas: res.unidades.reduce((s, u) => s + (u.linhas || 0), 0), funcoes: indice ? indice.funcoes.length : 0,
      trecho: false, cortado: res.unidades.some(u => u.cortado), puladas: res.unidades.reduce((s, u) => s + ((u.puladas || []).length), 0),
      sintaxe: sint.slice(0, 12).map(x => ({ linha: x.linha, msg: x.titulo, trecho: x.trecho, arquivo: x.arquivo })),
      avisos: [],
      achados: ach.slice(0, opcoes.max || 40).map(a => A.paraPainel(a, null)),
      total: ach.length,
      categorias: Object.fromEntries(CATS.map(k => [k, ach.filter(a => a.categoria === k).length + (k === "compilacao" ? sint.length : 0)])),
      faltando: [...new Set(res.faltando.map(f => f.nome))],
      projeto: {
        arquivos: res.arquivos, principais: res.principais, porArquivo,
        mapa: indice ? { funcoes: indice.funcoes.filter(f => f.tipo !== "comando").length, comandos: indice.funcoes.filter(f => f.tipo === "comando").length, callbacks: indice.funcoes.filter(f => /^On[A-Z]/.test(f.nome)).length, globais: indice.globais.length, enums: indice.enums.length, naoUsadas: indice.naoUsadas.slice(0, 12), porArquivo: indice.porArquivo } : null,
      },
      investigacoes: (res.relatorios || []).flatMap(x => (x.r.investigacoes || []).map(inv => ({ ...inv, titulo: inv.titulo }))).slice(0, 4),
      id: opcoes.id || "", comparacao: opcoes.comparacao || null,
    };
    let t = "~~~analise\n" + JSON.stringify(dados).replace(/~~~/g, "~ ~ ~") + "\n~~~\n";
    if (!sint.length && !ach.filter(a => a.categoria !== "info").length) t += "✅ **Sem problema identificado** no projeto, nas verificações que eu faço. Isso não prova que está perfeito: eu não executo nem compilo.\n";
    t += "\n⚙️ Eu **não compilei** o projeto (não tem compilador Pawn no navegador). Compile no Pawno/Qawno pra confirmar.";
    return t;
  }

  return { analisar, analisarAsync, corrigir, relatorio, montarUnidade, resolver, separarColado, principaisDe, guarda };
})();

WCDEV.projeto = Projeto;
