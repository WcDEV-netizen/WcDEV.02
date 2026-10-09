/* =========================================================
   WC DEV — ANÁLISE DE FLUXO, ESTADO E PROJETO (Pawn / SA-MP)

   Usa a árvore do pawn-ast.js (não expressão regular) pra:
     • FLUXO        código que nunca roda, caminho que termina sem return,
                    condição impossível, else-if repetido, case repetido
     • ENTRADA DO JOGADOR (rastreio)
                    o que o jogador digita (params, inputtext, listitem,
                    sscanf, strval) é seguido variável por variável até
                    virar índice de array, dinheiro, divisão, formato de
                    texto ou consulta SQL — e eu confiro se algum if
                    no caminho garante o limite certo
     • ESTADO / SEQUÊNCIA (SA-MP)
                    dados herdados por quem entra no mesmo id, salvar
                    depois de zerar, mensagem antes do Kick, usar o
                    jogador depois do Kick, timer por jogador que nunca
                    morre, recompensa repetida em checkpoint, estado que
                    fica preso depois da morte
     • PROJETO      símbolo duplicado (error 021), usado antes de declarar
                    (error 017), campo que não existe no enum, função do
                    projeto chamada com argumentos errados (warning 202 /
                    error 035), dinheiro do servidor x dinheiro do GTA,
                    campo que muda e não é salvo
     • TEXTO / DESEMPENHO
                    texto que não cabe no array do format, strcmp com
                    texto vazio, strlen dentro do for, trabalho pesado no
                    OnPlayerUpdate / timer rápido

   Cada regra diz a CATEGORIA (o que é) e o NÍVEL (o quanto eu tenho
   certeza) separados, e um TESTE que confirma ou desmente.
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const AnaliseFluxo = (() => {
  const P = () => WCDEV.pawnAst;
  const CONST_SAMP = { MAX_PLAYERS: 1000, MAX_PLAYER_NAME: 24, MAX_VEHICLES: 2000, MAX_OBJECTS: 1000, MAX_PICKUPS: 4096, MAX_TEXT_DRAWS: 2048, MAX_PLAYER_TEXT_DRAWS: 256, MAX_GANG_ZONES: 1024, MAX_ACTORS: 1000, MAX_CHATBUBBLE_LENGTH: 144, INVALID_PLAYER_ID: 65535, INVALID_VEHICLE_ID: 65535, cellbits: 32, EOS: 0, true: 1, false: 0 };
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /* ================= TABELA DE SÍMBOLOS ================= */
  function numeroDe(txt) {
    if (txt == null) return null;
    const t = String(txt).trim().replace(/^\((.*)\)$/, "$1").trim();
    if (/^-?\d+$/.test(t)) return +t;
    if (/^0x[0-9a-f]+$/i.test(t)) return parseInt(t, 16);
    return null;
  }
  function simbolos(ctx) {
    if (ctx._sim) return ctx._sim;
    const prog = ctx.ast;
    const sim = { defines: new Map(), enums: new Map(), membros: new Map(), globais: new Map(), funcoes: new Map(), prototipos: new Map(), dupGlobais: [], prog };
    for (const d of prog.defines) sim.defines.set(d.nome, { valor: d.macro ? null : numeroDe(d.valor), texto: d.valor, macro: d.macro, linha: d.linha });
    for (const e of prog.enums) {
      let tam = 0;
      for (const m of e.membros) { const t = m.tamanho ? (valorConst(m.tamanho, sim) || 1) : 1; sim.membros.set(m.nome, { enum: e.nome, linha: m.linha, tamanho: m.tamanho ? t : null }); tam += t; }
      if (e.nome) sim.enums.set(e.nome, { membros: e.membros.map(m => m.nome), tamanho: tam, linha: e.linha });
    }
    for (const g of prog.globais) {
      const info = { ...g, tamanhos: tamanhosDe(g, sim), enumDims: (g.dims || []).map(d => { const n = d && P().nu(d); return n && n.k === "id" && sim.enums.has(n.nome) ? n.nome : null; }) };
      if (sim.globais.has(g.nome)) sim.dupGlobais.push(info); else sim.globais.set(g.nome, info);
    }
    for (const f of prog.funcoes) { if (!sim.funcoes.has(f.nome)) sim.funcoes.set(f.nome, []); sim.funcoes.get(f.nome).push(f); }
    for (const p of prog.prototipos) sim.prototipos.set(p.nome, p);
    ctx._sim = sim;
    return sim;
  }
  // valor de uma expressão constante (#define, sizeof, enum, MAX_PLAYERS...) ou null
  function valorConst(e, sim, prof = 0) {
    e = P().nu(e);
    if (!e || prof > 12) return null;
    switch (e.k) {
      case "num": return typeof e.valor === "number" ? e.valor : null;
      case "id": {
        if (sim.defines.has(e.nome)) {
          const d = sim.defines.get(e.nome);
          if (d.valor !== null) return d.valor;
          if (!d.macro && d.texto) { try { const pr = P().analisarSintaxe("new __x = " + d.texto + ";"); const g = pr.globais[0]; return g && g.init ? valorConst(g.init, sim, prof + 1) : null; } catch (x) { return null; } }
          return null;
        }
        if (e.nome in CONST_SAMP) return CONST_SAMP[e.nome];
        if (sim.enums.has(e.nome)) return sim.enums.get(e.nome).tamanho;
        return null;
      }
      case "sizeof": {
        const g = sim.globais.get(e.nome) || (sim._locais && sim._locais.get(e.nome));
        return g && g.tamanhos ? g.tamanhos[e.dims || 0] : null;
      }
      case "un": { const v = valorConst(e.e, sim, prof + 1); return v === null ? null : e.op === "-" ? -v : e.op === "~" ? ~v : e.op === "!" ? +!v : v; }
      case "bin": {
        const a = valorConst(e.esq, sim, prof + 1), b = valorConst(e.dir, sim, prof + 1);
        if (a === null || b === null) return null;
        switch (e.op) { case "+": return a + b; case "-": return a - b; case "*": return a * b; case "/": return b ? Math.trunc(a / b) : null; case "%": return b ? a % b : null; case "<<": return a << b; case ">>": return a >> b; case "&": return a & b; case "|": return a | b; default: return null; }
      }
      default: return null;
    }
  }
  function tamanhosDe(decl, sim) {
    return (decl.dims || []).map((d, i) => {
      if (d) return valorConst(d, sim);
      if (i === 0 && decl.init) {
        const v = P().nu(decl.init);
        if (v.k === "lista") return v.itens.some(x => x.k === "reticencias") ? null : v.itens.length;
        if (v.k === "str") return v.v.replace(/\\./g, "x").length + 1;
      }
      return null;
    });
  }
  function locaisDe(f, sim) {
    if (f._locais) return f._locais;
    const m = new Map();
    for (const p of f.params) m.set(p.nome, { nome: p.nome, param: true, array: p.array, tamanhos: p.array ? [null] : [], tag: p.tag });
    P().percorrer(f.corpo, n => {
      if (n.k === "decl") for (const v of n.vars) { const prev = sim._locais; sim._locais = m; m.set(v.nome, { ...v, tamanhos: tamanhosDe(v, sim), enumDims: (v.dims || []).map(d => { const x = d && P().nu(d); return x && x.k === "id" && sim.enums.has(x.nome) ? x.nome : null; }) }); sim._locais = prev; }
      if (n.k === "foreach") m.set(n.var, { nome: n.var, tamanhos: [] });
      if (n.k === "for" && n.init && n.init.k === "decl") for (const v of n.init.vars) m.set(v.nome, { ...v, tamanhos: [] });
    });
    f._locais = m;
    return m;
  }
  const infoVar = (nome, f, sim) => (f && locaisDe(f, sim).get(nome)) || sim.globais.get(nome) || null;
  const nomeSimples = x => { x = P().nu(x); return x && x.k === "id" ? x.nome : null; };
  const txt = (ctx, n) => P().texto(ctx.codigo, n).replace(/\s+/g, " ").trim();
  // chave usada pelos "fatos" (igual à do pawn-ast): Jogador[playerid][jXP]
  const chaveDe = x => { const b = P().baseDe(x); if (!b) return null; return b.base + b.indices.map(i => { const n = P().nu(i); return "[" + (n && n.k === "id" ? n.nome : n && n.k === "num" ? n.v : "?") + "]"; }).join(""); };

  // especificadores do sscanf: "ui" -> ["u","i"]; "s[24]i" -> ["s","i"]
  function especSscanf(fmt) { return [...fmt.replace(/\[[^\]]*\]|\([^)]*\)|'[^']*'|<[^>]*>|\{[^}]*\}/g, "").replace(/[^A-Za-z]/g, "")]; }
  // especificadores do format: "%s tem %d" -> ["s","d"]
  function especFormat(fmt) { const out = []; for (const m of fmt.matchAll(/%(%|[-+ #0]*(?:\d+|\*)?(?:\.(?:\d+|\*))?([a-zA-Z]))/g)) if (m[1] !== "%") out.push(m[2]); return out; }

  /* ================= EXECUÇÃO SIMBÓLICA (fluxo + rastreio) =================
     Anda pelos comandos na ordem em que rodam, guardando:
       fatos: o que os ifs garantem sobre cada variável (limite de baixo/cima, conectado, não vazio, não zero)
       taint: variáveis com valor que veio do jogador (e de onde)
       sql:   textos montados com coisa do jogador sem escapar
     e chama "ganchos" nos pontos perigosos. */
  const FONTES_CALLBACK = {
    OnDialogResponse: { inputtext: ["str", "o texto que o jogador digitou no dialog ({{inputtext}})"], listitem: ["listitem", "a opção escolhida no dialog ({{listitem}})"] },
    OnPlayerText: { text: ["str", "o texto que o jogador mandou no chat ({{text}})"] },
    OnPlayerCommandText: { cmdtext: ["str", "o comando digitado ({{cmdtext}})"] },
  };
  function sementes(f) {
    const t = new Map();
    if (f.tipo === "comando" && f.params[1]) t.set(f.params[1].nome, { tipo: "str", origem: `o que o jogador digitou depois do comando ({{${f.params[1].nome}}})`, linha: f.linha, cadeia: [] });
    if (f.tipo === "dialog") { if (f.params[3]) t.set(f.params[3].nome, { tipo: "str", origem: `o texto digitado no dialog ({{${f.params[3].nome}}})`, linha: f.linha, cadeia: [] }); if (f.params[2]) t.set(f.params[2].nome, { tipo: "int", listitem: true, origem: `a opção escolhida ({{${f.params[2].nome}}})`, linha: f.linha, cadeia: [] }); }
    const fo = f.callback && FONTES_CALLBACK[f.nome];
    if (fo) for (const p of f.params) if (fo[p.nome]) t.set(p.nome, { tipo: fo[p.nome][0] === "listitem" ? "int" : fo[p.nome][0], listitem: fo[p.nome][0] === "listitem", origem: fo[p.nome][1], linha: f.linha, cadeia: [] });
    return t;
  }

  function executar(f, ctx, g, extra = {}) {
    const sim = simbolos(ctx);
    const valor = no => valorConst(no, sim);
    const novo = () => ({ fatos: new Map(), taint: new Map([...sementes(f), ...(extra.sementes || [])]), sql: new Map(), kick: null, msgs: [] });
    const clone = e => ({ fatos: new Map([...e.fatos].map(([k, v]) => [k, { ...v }])), taint: new Map(e.taint), sql: new Map(e.sql), kick: e.kick, talvezKick: e.talvezKick, msgs: e.msgs.slice() });
    const juntar = (a, b) => {
      if (!a) return b; if (!b) return a;
      const o = clone(a);
      o.fatos = new Map();
      for (const [k, v] of a.fatos) if (b.fatos.has(k)) {
        const w = b.fatos.get(k), r = {};
        for (const x of Object.keys(v)) if (!/V$/.test(x) && v[x] && w[x]) r[x] = true;
        if (r.sup && v.supV !== undefined && w.supV !== undefined) r.supV = Math.max(v.supV, w.supV);
        if (r.inf && v.infV !== undefined && w.infV !== undefined) r.infV = Math.min(v.infV, w.infV);
        o.fatos.set(k, r);
      }
      for (const [k, v] of b.taint) if (!o.taint.has(k)) o.taint.set(k, v);
      for (const [k, v] of b.sql) if (!o.sql.has(k)) o.sql.set(k, v);
      o.kick = a.kick && b.kick ? a.kick : null;
      o.talvezKick = a.kick || b.kick || a.talvezKick || b.talvezKick || null;
      o.msgs = a.msgs.filter(m => b.msgs.includes(m));
      return o;
    };
    const aplicarFatos = (e, cond, v) => { for (const [k, fa] of P().fatosDaCondicao(cond, v, valor)) { const atual = e.fatos.get(k) || {}; const o = { ...atual, ...fa }; if (atual.supV !== undefined && fa.supV !== undefined) o.supV = Math.min(atual.supV, fa.supV); if (atual.infV !== undefined && fa.infV !== undefined) o.infV = Math.max(atual.infV, fa.infV); e.fatos.set(k, o); } };
    const matar = (e, nome) => { for (const k of [...e.fatos.keys()]) if (k === nome || k.startsWith(nome + "[")) e.fatos.delete(k); };

    function taintDe(x, e) {
      x = P().nu(x);
      if (!x || !e) return null;
      switch (x.k) {
        case "id": return e.taint.get(x.nome) || null;
        case "chamada":
          if (/^(strval|floatstr|floatround)$/.test(x.nome) && x.args[0]) { const t = taintDe(x.args[0], e); return t ? { ...t, tipo: x.nome === "floatstr" ? "float" : "int", cadeia: [...(t.cadeia || []), { linha: x.linha, txt: x.nome + "(...)" }] } : null; }
          return null;
        case "bin": return ["+", "-", "*", "/", "%"].includes(x.op) ? (taintDe(x.esq, e) || taintDe(x.dir, e)) : null;
        case "un": return x.op === "-" ? taintDe(x.e, e) : null;
        case "ternario": return taintDe(x.sim, e) || taintDe(x.nao, e);
        default: return null;
      }
    }
    function chamada(x, e) {
      const n = x.nome, a = x.args;
      if (n === "sscanf" || n === "unformat") {
        const src = a[0], fmtNo = a[1] && P().nu(a[1]);
        const t = taintDe(src, e);
        const esp = fmtNo && fmtNo.k === "str" ? especSscanf(fmtNo.v) : [];
        esp.forEach((sp, i) => {
          const v = nomeSimples(a[2 + i]);
          if (!v) return;
          matar(e, v);
          if (t) e.taint.set(v, { tipo: /[uUrRqQ]/.test(sp) ? "jogador" : /[sSzZ]/.test(sp) ? "str" : /[fFgG]/.test(sp) ? "float" : "int", origem: `o que o jogador digitou (sscanf {{"${sp}"}})`, linha: x.linha, cadeia: [{ linha: x.linha, txt: `sscanf → ${v}` }] });
        });
      }
      if (/^(mysql_escape_string|mysql_real_escape_string|SQL_EscapeString)$/.test(n)) { const d = nomeSimples(a[1]); if (d) { e.taint.delete(d); e.sql.delete(d); } }
      if (n === "format" || n === "mysql_format") {
        const off = n === "format" ? 0 : 1;
        const dst = nomeSimples(a[off]), fArg = a[off + 2], fNo = P().nu(fArg);
        if (fNo && fNo.k !== "str") { const t = taintDe(fArg, e); if (t && t.tipo === "str") g.sink && g.sink("formato", x, e, t, fArg); }
        if (fNo && fNo.k === "str") {
          const esp = especFormat(fNo.v);
          let sujo = null, txtT = null;
          esp.forEach((sp, i) => {
            const arg = a[off + 3 + i], t = arg && taintDe(arg, e);
            if (!t) return;
            if (t.tipo === "str") { txtT = t; if (sp === "s") sujo = sujo || { ...t, espec: sp, arg: txt(ctx, arg), linha: x.linha }; }
          });
          if (dst) {
            matar(e, dst);
            if (sujo && /\b(SELECT|INSERT|UPDATE|DELETE|REPLACE)\b/i.test(fNo.v)) e.sql.set(dst, { ...sujo, linhaFormat: x.linha, funcao: n }); else e.sql.delete(dst);
            if (txtT) e.taint.set(dst, { tipo: "str", formatado: true, origem: txtT.origem, linha: x.linha, cadeia: txtT.cadeia || [] }); else e.taint.delete(dst);
          }
        }
        g.format && g.format(x, e, off);
      }
      if (/^(mysql_query|mysql_tquery|mysql_pquery|db_query|mysql_function_query)$/.test(n)) {
        for (const arg of a) {
          const v = nomeSimples(arg);
          if (v && e.sql.has(v)) g.sink && g.sink("sql", x, e, e.sql.get(v), arg);
          else { const t = taintDe(arg, e); if (t && t.tipo === "str" && !t.formatado) g.sink && g.sink("sql", x, e, t, arg); }
        }
      }
      if (n === "strcmp") g.strcmp && g.strcmp(x, e, taintDe);
      g.chamada && g.chamada(x, e, taintDe);
      if (/^(Kick|Ban|BanEx)$/.test(n)) g.kick && g.kick(x, e);
      if (/^(SendClientMessage|GameTextForPlayer|ShowPlayerDialog|SendPlayerMessageToPlayer|PlayerTextDrawShow|TextDrawShowForPlayer)$/.test(n) && a[0]) { const alvo = txt(ctx, a[0]); e.msgs.push({ alvo, linha: x.linha, nome: n }); }
    }
    function ex(x, e) {
      if (!x || !e) return;
      switch (x.k) {
        case "atrib": {
          if (x.op !== "=") ex(x.alvo, e);
          else { const b = P().nu(x.alvo); if (b && b.k === "indice") { ex(b.base, e); ex(b.i, e); g.indice && g.indice(b, e, taintDe, true); } }
          ex(x.valor, e);
          const t = taintDe(x.valor, e);
          const b = P().baseDe(x.alvo);
          if (b && !b.indices.length) {
            matar(e, b.base);
            if (x.op === "=") { if (t) e.taint.set(b.base, { ...t, linha: x.linha, cadeia: [...(t.cadeia || []), { linha: x.linha, txt: `${b.base} = ${txt(ctx, x.valor)}` }] }); else e.taint.delete(b.base); e.sql.delete(b.base); }
            else if (t) e.taint.set(b.base, t);
          } else { const k = chaveDe(x.alvo); if (k) matar(e, k); }
          g.atrib && g.atrib(x, e, t, taintDe);
          return;
        }
        case "chamada": x.args.forEach(a => ex(a, e)); chamada(x, e); return;
        case "indice": ex(x.base, e); ex(x.i, e); g.indice && g.indice(x, e, taintDe, false); return;
        case "bin":
          if (x.op === "&&" || x.op === "||") { ex(x.esq, e); const e2 = clone(e); aplicarFatos(e2, x.esq, x.op === "&&"); ex(x.dir, e2); for (const [k, v] of e2.taint) if (!e.taint.has(k)) e.taint.set(k, v); return; }
          ex(x.esq, e); ex(x.dir, e);
          if (x.op === "/" || x.op === "%") g.divisao && g.divisao(x, e, taintDe);
          return;
        case "pre": case "pos": { ex(x.e, e); const b = P().baseDe(x.e); if (b && !b.indices.length) matar(e, b.base); else { const k = chaveDe(x.e); if (k) matar(e, k); } g.incremento && g.incremento(x, e); return; }
        case "un": case "par": case "tag": ex(x.e, e); return;
        case "ternario": { ex(x.cond, e); const a = clone(e); aplicarFatos(a, x.cond, true); ex(x.sim, a); const b = clone(e); aplicarFatos(b, x.cond, false); ex(x.nao, b); for (const [k, v] of [...a.taint, ...b.taint]) if (!e.taint.has(k)) e.taint.set(k, v); return; }
        case "lista": x.itens.forEach(i => ex(i, e)); return;
        case "nomeado": ex(x.valor, e); return;
        default: return;
      }
    }
    // devolve o estado depois do comando, ou null se o fluxo não passa (return/break/...)
    function cmd(s, e) {
      if (!s || !e) return e;
      g.comando && g.comando(s, e);
      switch (s.k) {
        case "bloco": {
          let atual = e, ultimo = null;
          const pp = [];   // pilha de #if: o código de cada ramo é alternativo, não sequencial
          for (let i = 0; i < s.corpo.length; i++) {
            const c = s.corpo[i];
            if (c.k === "diretiva") {
              const d = (c.v.match(/^#\s*(\w+)/) || [])[1] || "";
              if (/^if/.test(d)) pp.push({ antes: atual ? clone(atual) : null, fins: [] });
              else if (/^(else|elseif|elif)$/.test(d) && pp.length) { const t = pp[pp.length - 1]; t.fins.push(atual); atual = t.antes ? clone(t.antes) : null; }
              else if (d === "endif" && pp.length) { const t = pp.pop(); atual = t.fins.reduce((a, b) => juntar(a, b), atual); }
              continue;
            }
            if (["vazio", "rotulo"].includes(c.k)) { if (c.k === "rotulo" && !atual) atual = clone(e); continue; }
            if (!atual) {
              // ainda pode existir um #else/#endif mais pra frente que reabre o fluxo
              const prox = s.corpo.slice(i).findIndex(x => x.k === "diretiva" && /^#\s*(else|elif|elseif|endif)/.test(x.v));
              if (pp.length && prox >= 0) continue;
              g.inalcancavel && g.inalcancavel(c, ultimo);
              return null;
            }
            atual = cmd(c, atual);
            ultimo = c;
          }
          return atual;
        }
        case "decl":
          for (const v of s.vars) {
            matar(e, v.nome); e.taint.delete(v.nome); e.sql.delete(v.nome);
            (v.dims || []).forEach(d => ex(d, e));
            if (v.init) { ex(v.init, e); const t = taintDe(v.init, e); if (t) e.taint.set(v.nome, { ...t, linha: v.linha, cadeia: [...(t.cadeia || []), { linha: v.linha, txt: `new ${v.nome} = ${txt(ctx, v.init)}` }] }); }
          }
          return e;
        case "expr": ex(s.e, e); return e;
        case "if": {
          ex(s.cond, e);
          const a = clone(e); aplicarFatos(a, s.cond, true);
          const b = clone(e); aplicarFatos(b, s.cond, false);
          const ra = cmd(s.entao, a), rb = s.senao ? cmd(s.senao, b) : b;
          return juntar(ra, rb);
        }
        case "while": case "for": {
          if (s.k === "for" && s.init) { if (s.init.k === "decl") cmd(s.init, e); else (s.init.lista || []).forEach(x => ex(x, e)); }
          if (s.cond) ex(s.cond, e);
          const dentro = clone(e); if (s.cond) aplicarFatos(dentro, s.cond, true);
          g.loop && g.loop(s, dentro, taintDe);
          const fim = cmd(s.corpo, dentro);
          if (s.k === "for" && fim) (s.passo || []).forEach(x => ex(x, fim));
          if (P().loopInfinito(s) && !P().temBreak(s.corpo)) return null;
          const fora = clone(e); if (s.cond) aplicarFatos(fora, s.cond, false);
          if (fim) for (const [k, v] of fim.taint) if (!fora.taint.has(k)) fora.taint.set(k, v);
          return fora;
        }
        case "foreach": { const fim = cmd(s.corpo, clone(e)); if (fim) for (const [k, v] of fim.taint) if (!e.taint.has(k)) e.taint.set(k, v); return e; }
        case "do": { const fim = cmd(s.corpo, e) || clone(e); ex(s.cond, fim); const fora = clone(fim); aplicarFatos(fora, s.cond, false); return fora; }
        case "switch": {
          ex(s.e, e);
          let r = s.casos.some(c => c.padrao) ? null : clone(e);
          for (const c of s.casos) r = juntar(r, cmd(c.corpo, clone(e)));
          return r;
        }
        case "return": if (s.e) ex(s.e, e); g.retorno && g.retorno(s, e); return null;
        case "break": case "continue": case "goto": return null;
        default: return e;
      }
    }
    const fim = cmd(f.corpo, novo());
    return { fim };
  }

  /* ================= RESUMOS ENTRE FUNÇÕES =================
     Pra cada função do projeto: o que acontece se um parâmetro vier do jogador
     sem conferir (vira índice? dinheiro? divisão?). Quem chama com valor do
     jogador herda o problema. */
  function resumos(ctx) {
    if (ctx._resumos) return ctx._resumos;
    const sim = simbolos(ctx);
    const res = new Map();
    ctx._resumos = res;
    const lista = ctx.ast.funcoes.filter(f => f.params.length && !f.callback && f.tipo !== "comando" && !f.parcial && f.tipo !== "trecho");
    for (let rodada = 0; rodada < 3; rodada++) {
      for (const f of lista) {
        const exige = [];
        const sem = f.params.map((p, i) => [p.nome, { tipo: "param", idx: i, origem: `o parâmetro {{${p.nome}}} de ${f.nome}`, linha: f.linha, cadeia: [] }]);
        const ganchos = ganchosDeRisco(ctx, f, (req) => { if (!exige.some(x => x.idx === req.idx && x.tipo === req.tipo)) exige.push(req); }, true);
        try { executar(f, ctx, ganchos, { sementes: sem }); } catch (e) { /* função estranha: sem resumo */ }
        res.set(f.nome, exige);
      }
    }
    void sim;
    return res;
  }

  /* ================= GANCHOS DE RISCO (entrada do jogador) ================= */
  const CAMPO_DINHEIRO = /(Dinheiro|dinheiro|Money|money|Grana|grana|Banco|banco|Cash|cash|Saldo|saldo|Gold|gold|Coins?|coins?|Diamante|diamante)/;
  const CAMPO_QTD = /(Dinheiro|dinheiro|Money|money|Grana|grana|Banco|banco|Cash|cash|Saldo|saldo|XP|Xp|xp|Exp|exp|Score|score|Pontos|pontos|Qtd|qtd|Quant|quant|Municao|municao|Ammo|ammo|Item|item|Coins?|coins?|Gold|gold)/;
  // param=true: estou montando o RESUMO de uma função (o valor ainda não é do jogador)
  function ganchosDeRisco(ctx, f, reportar, param) {
    const sim = simbolos(ctx);
    const ehReal = t => t && t.tipo !== "param";
    const emit = (tipo, no, t, dados) => {
      if (!t) return;
      if (t.tipo === "param") { if (param) reportar({ tipo, idx: t.idx, linha: no.linha, funcao: f.nome, ...dados }); return; }
      if (!param) reportar({ tipo, no, t, ...dados });
    };
    return {
      indice(x, e, taintDe) {
        const idx = P().nu(x.i);
        if (!idx) return;
        const t = taintDe(idx, e);
        if (!t || t.tipo === "str" || t.tipo === "float") return;
        const b = P().baseDe(x);
        if (!b) return;
        const pos = b.indices.length - 1;   // dimensão que este [ ] acessa
        const info = infoVar(b.base, f, sim);
        if (!info || !info.tamanhos) return;
        const tam = info.tamanhos[pos];
        const k = nomeSimples(idx) || chaveDe(idx);
        const fa = (k && e.fatos.get(k)) || {};
        if (t.tipo === "jogador") { if (fa.valido || fa.conectado || (fa.inf && fa.sup)) return; }
        else if (t.listitem) return;   // listitem tem regra própria (tamanho da lista do dialog)
        const faltaSup = !fa.sup || (tam && fa.supV !== undefined && fa.supV > tam - 1);
        const faltaInf = !fa.inf || (fa.infV !== undefined && fa.infV < 0);
        if (!faltaSup && !faltaInf) return;
        emit("indice", x, t, { array: b.base, tamanho: tam, faltaSup, faltaInf, supV: fa.supV, idxTxt: txt(ctx, idx) });
      },
      atrib(x, e, t, taintDe) {
        if (!t || x.op === "=") { if (!(x.op === "=" && t)) return; }
        const alvo = txt(ctx, x.alvo);
        if (!CAMPO_QTD.test(alvo)) return;
        const v = P().nu(x.valor);
        const k = v && (nomeSimples(v) || chaveDe(v));
        const fa = (k && e.fatos.get(k)) || {};
        if (x.op === "+=" || x.op === "-=") { if (!fa.inf) emit("negativo", x, t, { alvo, op: x.op, valorTxt: txt(ctx, x.valor) }); }
      },
      chamada(x, e, taintDe) {
        if (/^(GetPlayer\w+|SetPlayer\w+|GivePlayer\w+|ResetPlayer\w+|SpawnPlayer|TogglePlayer\w+|PutPlayerInVehicle|Kick|Ban|BanEx|SendClientMessage|GameTextForPlayer|ShowPlayerDialog)$/.test(x.nome) && x.args[0]) {
          const a0 = P().nu(x.args[0]); const t = taintDe(a0, e);
          const k = a0 && (nomeSimples(a0) || chaveDe(a0));
          const fa = (k && e.fatos.get(k)) || {};
          if (t && (t.tipo === "int" || t.tipo === "param") && !t.listitem && !(fa.conectado || fa.valido || (fa.inf && fa.sup))) emit("idJogador", x, t, { nativa: x.nome, idTxt: txt(ctx, x.args[0]) });
        }
        if (x.nome === "GivePlayerMoney" && x.args[1]) {
          const v = P().nu(x.args[1]); const t = taintDe(v, e);
          const k = nomeSimples(v && v.k === "un" ? v.e : v) || chaveDe(v && v.k === "un" ? v.e : v);
          const fa = (k && e.fatos.get(k)) || {};
          if (t && !fa.inf) emit("negativo", x, t, { alvo: "GivePlayerMoney", op: v.k === "un" ? "-" : "+", valorTxt: txt(ctx, x.args[1]) });
        }
        // função do projeto que exige o parâmetro conferido
        const rs = ctx._resumos && ctx._resumos.get(x.nome);
        if (rs && rs.length) for (const r of rs) {
          const arg = x.args[r.idx];
          if (!arg) continue;
          const t = taintDe(arg, e);
          if (!t) continue;
          const semSinal = P().nu(arg) && P().nu(arg).k === "un" ? P().nu(arg).e : arg;   // -valor: o que importa é se "valor" foi conferido
          const k = nomeSimples(semSinal) || chaveDe(semSinal);
          const fa = (k && e.fatos.get(k)) || {};
          if (r.tipo === "negativo" && fa.inf) continue;
          if (r.tipo === "indice" && ((fa.inf && fa.sup && !(r.tamanho && fa.supV !== undefined && fa.supV > r.tamanho - 1)) || (t.tipo === "jogador" && (fa.valido || fa.conectado)))) continue;
          if (r.tipo === "indice" && t.listitem) continue;
          if (r.tipo === "divisao" && fa.naoZero) continue;
          if (r.tipo === "idJogador" && (t.tipo === "jogador" || t.tipo === "str" || fa.conectado || fa.valido || (fa.inf && fa.sup))) continue;
          emit(r.tipo, x, t, { ...r, viaFuncao: x.nome, linhaDentro: r.linha, idx: undefined, argTxt: txt(ctx, arg) });
        }
      },
      nativaJogador(x, e, taintDe) {},
      divisao(x, e, taintDe) {
        const d = P().nu(x.dir);
        const t = taintDe(d, e);
        if (!t || t.tipo === "str") return;
        const k = nomeSimples(d) || chaveDe(d);
        if (k && (e.fatos.get(k) || {}).naoZero) return;
        if (valorConst(d, sim) !== null) return;
        emit("divisao", x, t, { divisor: txt(ctx, d) });
      },
      sink(tipo, x, e, t, arg) { emit(tipo, x, t, { argTxt: arg ? txt(ctx, arg) : "" }); },
      strcmp(x, e, taintDe) {
        for (const [i, a] of x.args.slice(0, 2).entries()) {
          const t = taintDe(a, e);
          if (!ehReal(t) || t.tipo !== "str") continue;
          const k = nomeSimples(a);
          if (k && (e.fatos.get(k) || {}).naoVazio) continue;
          const outro = x.args[1 - i];
          if (!outro || P().nu(outro).k === "str") continue;   // comparar com texto fixo ("/ajuda") não tem esse problema de senha
          const senha = /senha|pass|pwd|key|chave|codigo|code/i.test(txt(ctx, outro));
          emit("strcmpVazio", x, t, { senha, outro: txt(ctx, outro), var: txt(ctx, a) });
        }
      },
      loop(s, e, taintDe) {
        if (!s.cond) return;
        const c = P().nu(s.cond);
        if (c.k !== "bin" || !["<", "<="].includes(c.op)) return;
        const t = taintDe(c.dir, e);
        const k = nomeSimples(c.dir);
        if (t && t.tipo !== "str" && !(k && (e.fatos.get(k) || {}).sup)) emit("loop", s, t, { limite: txt(ctx, c.dir) });
      },
    };
  }

  /* ================= REGRAS ================= */
  const R = [];
  const regra = (id, modulo, categoria, verificar) => R.push({ id, modulo, categoria, verificar(ctx) { if (!ctx.ast) return []; return verificar(ctx) || []; } });
  const funcoesOk = ctx => ctx.ast.funcoes.filter(f => !f.parcial);
  const ev = (linha, texto) => ({ linha, texto });

  /* ---------- FLUXO ---------- */
  regra("codigo-inalcancavel", "fluxo", "logica", ctx => {
    const out = [];
    for (const f of funcoesOk(ctx)) executar(f, ctx, {
      inalcancavel(s, antes) {
        if (out.some(o => o.linha === s.linha)) return;
        const motivo = antes ? txt(ctx, antes).split("\n")[0].slice(0, 50) : "return";
        out.push({ nivel: "erro", linha: s.linha, titulo: "Esse código **nunca roda**",
          porque: `Ele vem logo depois de {{${motivo}}}, que sai ${/^return/.test(motivo) ? "da função" : "do bloco"} antes. Nada depois disso, no mesmo bloco, é executado.`,
          consequencia: `O que está aqui (ex: {{${txt(ctx, s).slice(0, 60)}}}) não acontece nunca. O compilador só avisa (**warning 225: unreachable code**) e compila.`,
          quando: "Sempre.", correcao: "Mova essas linhas pra **antes** do {{return}} (ou apague, se sobrou de um teste).",
          evidencias: [ev(antes ? antes.linha : s.linha, "o fluxo sai aqui"), ev(s.linha, "esta linha nunca é alcançada")], compilador: "warning 225",
          teste: "Coloque um {{print(\"chegou\");}} nessa linha: ele nunca aparece no console." });
      },
    });
    return out;
  });

  // termina sem return em algum caminho? (usado pela regra retorno-inconsistente do analisador.js)
  function chegaNoFimSemRetorno(ctx, f) { try { return !!executar(f, ctx, {}).fim; } catch (e) { return null; } }

  regra("case-duplicado", "fluxo", "compilacao", ctx => {
    const out = [], sim = simbolos(ctx);
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "switch") return;
      const vistos = new Map();
      for (const c of n.casos) for (const v of c.valores) {
        const val = v.k === "faixa" ? null : valorConst(v, sim);
        const chave = val !== null ? "n" + val : v.k === "faixa" ? null : "t" + txt(ctx, v);
        if (chave === null) continue;
        if (vistos.has(chave)) out.push({ nivel: "erro", linha: c.linha, titulo: `{{case ${txt(ctx, v)}}} aparece **duas vezes** no mesmo switch`,
          porque: `Esse valor já tem um {{case}} na linha ${vistos.get(chave)}.`, consequencia: "O compilador para com **error 040: duplicate \"case\" label** (se a função for usada).",
          quando: "Ao compilar.", correcao: "Junte os dois cases num só ou troque o valor de um deles.", compilador: "error 040",
          evidencias: [ev(vistos.get(chave), "primeiro case"), ev(c.linha, "repetido")], teste: "Compile: aparece error 040." });
        else vistos.set(chave, c.linha);
      }
    });
    return out;
  });

  regra("condicao-impossivel", "fluxo", "logica", ctx => {
    const out = [], sim = simbolos(ctx);
    const comparacoes = (e, op, lista = []) => { e = P().nu(e); if (e && e.k === "bin" && e.op === op) { comparacoes(e.esq, op, lista); comparacoes(e.dir, op, lista); } else if (e) lista.push(e); return lista; };
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (!["if", "while"].includes(n.k) || !n.cond) return;
      for (const op of ["&&", "||"]) {
        const partes = comparacoes(n.cond, op);
        const por = new Map();
        for (const p of partes) {
          if (p.k !== "bin" || !["<", "<=", ">", ">=", "=="].includes(p.op)) continue;
          let v = txt(ctx, p.esq), k = valorConst(p.dir, sim), o = p.op;
          if (k === null) { k = valorConst(p.esq, sim); v = txt(ctx, p.dir); o = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==" }[o]; }
          if (k === null || /\(/.test(v)) continue;
          if (!por.has(v)) por.set(v, []);
          por.get(v).push({ o, k });
        }
        for (const [v, cs] of por) {
          if (cs.length < 2) continue;
          let lo = -Infinity, hi = Infinity;
          const faixa = c => c.o === ">" ? [c.k + 1, Infinity] : c.o === ">=" ? [c.k, Infinity] : c.o === "<" ? [-Infinity, c.k - 1] : c.o === "<=" ? [-Infinity, c.k] : [c.k, c.k];
          if (op === "&&") {
            for (const c of cs) { const [a, b] = faixa(c); lo = Math.max(lo, a); hi = Math.min(hi, b); }
            if (lo > hi) out.push({ nivel: "erro", linha: n.linha, titulo: "Condição que **nunca** é verdadeira",
              porque: `{{${txt(ctx, n.cond)}}}: não existe valor de {{${v}}} que satisfaça tudo ao mesmo tempo.`, consequencia: "O bloco desse if **nunca roda**.",
              quando: "Sempre.", correcao: `Provavelmente era {{||}} (ou) em vez de {{&&}} (e), ou os números estão trocados.`, teste: `Teste com vários valores de ${v}: nenhum entra no if.` });
          } else {
            // A || B cobre tudo? (ex: x > 5 || x < 10)
            const fs = cs.map(faixa).sort((a, b) => a[0] - b[0]);
            let cobre = fs[0][0] === -Infinity, ate = fs[0][1];
            for (const [a, b] of fs.slice(1)) { if (a <= ate + 1) ate = Math.max(ate, b); }
            if (cobre && ate === Infinity) out.push({ nivel: "erro", linha: n.linha, titulo: "Condição que é **sempre** verdadeira",
              porque: `{{${txt(ctx, n.cond)}}}: qualquer valor de {{${v}}} satisfaz pelo menos uma das partes.`, consequencia: "O if não filtra nada: o bloco roda sempre.",
              quando: "Sempre.", correcao: "Provavelmente era {{&&}} (e) em vez de {{||}} (ou).", teste: `Teste com um valor fora da faixa que você queria: ele entra no if mesmo assim.` });
          }
        }
      }
      // x == x
      P().percorrer(n.cond, c => { if (c.k === "bin" && ["==", "!=", "<", ">"].includes(c.op) && txt(ctx, c.esq) === txt(ctx, c.dir) && !/\(/.test(txt(ctx, c.esq))) out.push({ nivel: "erro", linha: n.linha, titulo: `Compara {{${txt(ctx, c.esq)}}} com ele mesmo`, porque: "Os dois lados são iguais: o resultado é sempre o mesmo.", correcao: "Confira se um dos lados devia ser outra variável.", teste: "Troque o valor: o resultado não muda." }); });
    });
    return out;
  });

  regra("elseif-repetido", "fluxo", "logica", ctx => {
    const out = [];
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "if" || n._visto) return;
      const conds = [];
      let atual = n;
      while (atual && atual.k === "if") { atual._visto = true; conds.push(atual); atual = atual.senao; }
      const vistos = new Map();
      for (const c of conds) {
        const t = txt(ctx, c.cond);
        if (/\b(\w+\s*\(|\+\+|--)/.test(t) && !/^[!\s]*(IsPlayer\w+|strcmp|isnull)\b/.test(t)) { vistos.set(t, vistos.get(t) || null); continue; }
        if (vistos.has(t) && vistos.get(t)) out.push({ nivel: "erro", linha: c.linha, titulo: "Esse {{else if}} **nunca roda**",
          porque: `A condição {{${t}}} já foi testada na linha ${vistos.get(t)}. Se ela fosse verdadeira, o primeiro bloco já teria rodado.`,
          consequencia: "O código desse ramo nunca é executado.", correcao: "Confira o valor: provavelmente era outro número/condição.",
          evidencias: [ev(vistos.get(t), "mesma condição antes"), ev(c.linha, "repetida")], teste: "Teste com um valor que satisfaz a condição: sempre cai no primeiro if." });
        else vistos.set(t, c.linha);
      }
    });
    return out;
  });

  /* ---------- ENTRADA DO JOGADOR ---------- */
  regra("entrada-do-jogador", "rastreio de entrada", "seguranca", ctx => {
    const out = [];
    resumos(ctx);
    for (const f of funcoesOk(ctx)) {
      const achados = [];
      try { executar(f, ctx, ganchosDeRisco(ctx, f, r => achados.push(r), false)); } catch (e) { continue; }
      for (const r of achados) {
        const L = r.no.linha;
        const cadeia = [ev(r.t.linha, "a entrada: " + r.t.origem.replace(/\{\{|\}\}/g, "").replace(/^(do|da|de) /, "")), ...(r.t.cadeia || []).map(c => ev(c.linha, c.txt))];
        if (r.viaFuncao) cadeia.push(ev(L, `passa pra ${r.viaFuncao}(...)`), ev(r.linhaDentro, `dentro de ${r.viaFuncao}: usado sem conferir`));
        else cadeia.push(ev(L, "usado aqui sem conferir"));
        const via = r.viaFuncao ? ` (dentro de {{${r.viaFuncao}}}, linha ${r.linhaDentro})` : "";
        // "vem de o que..." -> "vem do que..."
        r.t = { ...r.t, origem: r.t.origem.replace(/^o /, "do ").replace(/^a /, "da ").replace(/^(?!do |da )/, "de ") };
        if (r.viaFuncao && r.argTxt) { r.valorTxt = r.argTxt; r.idxTxt = r.argTxt; r.divisor = r.argTxt; }
        const base = { linha: L, evidencias: cadeia.filter((x, i, a) => x.linha && a.findIndex(y => y.linha === x.linha && y.texto === x.texto) === i) };
        if (r.tipo === "indice") {
          const lim = r.tamanho ? `de 0 a ${r.tamanho - 1}` : "do tamanho do array";
          const pouco = !r.faltaInf && r.faltaSup && r.supV !== undefined;
          out.push({ ...base, nivel: r.tamanho || r.t.tipo === "jogador" ? "provavel" : "verificar", categoria: "seguranca",
            titulo: pouco ? `O limite conferido deixa {{${r.idxTxt}}} passar do array` : `{{${r.array}[${r.idxTxt}]}}: posição escolhida pelo jogador, sem conferir o limite${via}`,
            porque: pouco ? `O if confere até **${r.supV}**, mas {{${r.array}}} vai ${lim}. O valor ${r.supV} passa na checagem e estoura o array (erro de "um a mais").`
              : `{{${r.idxTxt}}} vem ${r.t.origem} e vira posição de {{${r.array}}} (${lim})${r.faltaInf && r.faltaSup ? " sem nenhum if conferindo" : r.faltaSup ? " conferindo só o limite de baixo" : " conferindo só o limite de cima"}.`,
            consequencia: `Um número fora ${lim} dá **array index out of bounds**: o comando para no meio (e o jogador pode repetir isso de propósito).`,
            quando: `Quando o jogador digita ${r.faltaSup ? `um número maior que ${r.tamanho ? r.tamanho - 1 : "o tamanho"}` : "um número negativo"}.`,
            correcao: r.t.tipo === "jogador" ? `Confira antes: {{if (!IsPlayerConnected(${r.idxTxt})) return ...;}}` : `Confira os dois lados antes de usar: {{if (${r.idxTxt} < 0 || ${r.idxTxt} >= ${r.tamanho ? `sizeof(${r.array})` : "TAMANHO"}) return ...;}}`,
            teste: `Use o comando com ${r.faltaSup ? (r.tamanho || 999) : -1}: o console mostra "array index out of bounds".` });
        } else if (r.tipo === "negativo") {
          out.push({ ...base, nivel: "provavel", categoria: "seguranca", titulo: `Valor digitado pelo jogador pode ser **negativo**${via}`,
            porque: `{{${r.valorTxt}}} vem ${r.t.origem} e entra direto em ${r.alvo === "GivePlayerMoney" ? "{{GivePlayerMoney}}" : `{{${r.alvo}}}`} sem um if garantindo que é maior que zero.`,
            consequencia: `Digitando um número negativo (ex: {{-50000}}), ${r.op === "-" || r.op === "-=" ? "\"tirar\" vira **dar**: o jogador ganha em vez de pagar" : "\"dar\" vira **tirar**"}. É brecha clássica de dinheiro/itens.`,
            quando: "Quando alguém digita um valor negativo.", correcao: `Antes de usar: {{if (${(r.argTxt || r.valorTxt || "valor").replace(/^-/, "")} < 1) return SendClientMessage(playerid, -1, "Valor invalido.");}}`,
            teste: "Use o comando/dialog com -1000 e veja o dinheiro aumentar." });
        } else if (r.tipo === "divisao") {
          out.push({ ...base, nivel: "provavel", categoria: "logica", titulo: `Divisão por um número que o jogador escolhe (pode ser **0**)${via}`,
            porque: `O divisor {{${r.divisor || r.argTxt}}} vem ${r.t.origem} e nada confere se ele é diferente de zero.`,
            consequencia: "Dividir por 0 é **erro de execução** no Pawn: a função para ali e o resto não roda.",
            quando: "Quando o jogador digita 0.", correcao: `{{if (${r.divisor || r.argTxt} == 0) return SendClientMessage(playerid, -1, "Nao pode ser 0.");}}`, teste: "Use o comando com 0 e veja o erro no console." });
        } else if (r.tipo === "formato") {
          out.push({ ...base, nivel: "erro", categoria: "seguranca", titulo: "Texto do jogador usado como **formato** do format",
            porque: `{{${r.argTxt}}} vem ${r.t.origem} e está na posição do **formato** (onde ficam os {{%s}}, {{%d}}). O format vai interpretar o que o jogador digitou.`,
            consequencia: "Se ele digitar {{%s%s%s}}, o format lê memória que não existe: texto lixo ou **crash do servidor**.",
            quando: "Quando o texto tem um {{%}}.", correcao: `Use um formato fixo: {{format(msg, sizeof(msg), "%s", ${r.argTxt});}}`,
            correcoes: [{ tipo: "trocar", linha: L, de: new RegExp(`(format\\s*\\(\\s*\\w+\\s*,\\s*[^,]+,\\s*)${esc(r.argTxt)}\\s*\\)`), para: `$1"%s", ${r.argTxt})` }], seguro: true,
            teste: "Mande o texto %s%s%s%s no dialog/chat." });
        } else if (r.tipo === "sql") {
          out.push({ ...base, nivel: "erro", categoria: "seguranca", titulo: "**SQL injection**: texto do jogador direto na consulta",
            porque: `${r.t.origem.replace(/^./, c => c.toUpperCase())} entra na consulta com {{%s}}${r.t.funcao === "mysql_format" || r.funcao === "mysql_format" ? " (o {{%e}} é que escapa)" : ""}, sem escapar as aspas.`,
            consequencia: "Digitando {{' OR '1'='1}} (ou {{'; DROP TABLE contas; --}}) o jogador muda a consulta: entra em contas dos outros ou apaga dados.",
            quando: "Quando o texto tem aspas simples.", correcao: "No {{mysql_format}} troque {{%s}} por {{%e}} nesse valor (ou escape com {{mysql_escape_string}} antes).",
            evidencias: [...base.evidencias, ...(r.t.linhaFormat ? [ev(r.t.linhaFormat, "a consulta é montada aqui com %s")] : [])],
            correcoes: r.t.linhaFormat && r.t.funcao === "mysql_format" ? [{ tipo: "trocar", linha: r.t.linhaFormat, de: /%s/, para: "%e" }] : [], seguro: false,
            teste: "Digite ' OR '1'='1 no campo: se logar, está vulnerável." });
        } else if (r.tipo === "strcmpVazio") {
          out.push({ ...base, nivel: "provavel", categoria: r.senha ? "seguranca" : "logica", titulo: r.senha ? "Senha **vazia** passa no strcmp" : "{{strcmp}} com texto vazio dá \"igual\"",
            porque: `O {{strcmp}} devolve **0 (igual)** quando um dos textos está vazio. {{${r.var}}} vem ${r.t.origem} e pode vir vazio${r.senha ? " — o jogador só aperta Enter" : ""}.`,
            consequencia: r.senha ? "Quem confirma o dialog **sem digitar nada** entra na conta de qualquer um." : "Texto vazio é tratado como se fosse igual ao outro.",
            quando: "Quando o texto vem vazio.", correcao: `Confira antes: {{if (isnull(${r.var})) return ...;}} (ou {{!strlen(${r.var})}}).`, teste: "Abra o dialog e confirme sem digitar nada." });
        } else if (r.tipo === "idJogador") {
          if (out.some(o => o.linha === L)) continue;
          out.push({ ...base, nivel: "provavel", categoria: "logica", titulo: `{{${r.idTxt || r.argTxt}}} vem do que o jogador digitou e é usado como **id de jogador** sem conferir${via}`,
            porque: `{{${r.idTxt || r.argTxt}}} vem ${r.t.origem} e vai direto pro {{${r.nativa}}}, sem {{IsPlayerConnected}}.`,
            consequencia: `Com um id de alguém offline (ou texto, que vira 0), o {{${r.nativa}}} não faz nada ou devolve zeros${/^GetPlayerPos/.test(r.nativa) ? " (ex: posição 0,0,0: o jogador é teleportado pro meio do mapa)" : ""}, sem avisar ninguém.`,
            quando: "Quando o id digitado não é de ninguém online.", correcao: `Antes: {{if (!IsPlayerConnected(${r.idTxt || r.argTxt})) return SendClientMessage(playerid, -1, "Jogador offline.");}}`,
            teste: "Use o comando com um id que não está online." });
        } else if (r.tipo === "loop") {
          out.push({ ...base, nivel: "verificar", categoria: "desempenho", titulo: "Loop com tamanho escolhido pelo jogador",
            porque: `O loop vai até {{${r.limite}}}, que vem ${r.t.origem}, sem limite máximo.`, consequencia: "Um número enorme (ex: 99999999) faz o loop rodar bilhões de vezes e **trava o servidor**.",
            quando: "Quando o jogador digita um número gigante.", correcao: `Limite antes: {{if (${r.limite} > 100) return ...;}}`, teste: "Use o comando com 100000000." });
        }
      }
    }
    return out;
  });

  // listitem maior que o array (compara com o número de opções do ShowPlayerDialog)
  regra("listitem-fora-da-lista", "sistemas SA-MP", "logica", ctx => {
    const out = [], sim = simbolos(ctx);
    const opcoes = new Map();   // dialogid (texto ou número) -> { itens, linha }
    for (const f of funcoesOk(ctx)) for (const c of P().chamadas(f.corpo)) {
      if (c.nome !== "ShowPlayerDialog" || c.args.length < 5) continue;
      const estilo = txt(ctx, c.args[2]), lista = P().nu(c.args[4]);
      if (!/LIST/.test(estilo) || !lista || lista.k !== "str") continue;
      let n = lista.v.split("\\n").filter((x, i, a) => !(i === a.length - 1 && x === "")).length;
      if (/HEADERS/.test(estilo)) n--;
      const id = valorConst(c.args[1], sim);
      opcoes.set(id !== null ? "n" + id : "t" + txt(ctx, c.args[1]), { itens: n, linha: c.linha });
    }
    if (!opcoes.size) return out;
    for (const f of funcoesOk(ctx).filter(f => f.nome === "OnDialogResponse" || f.tipo === "dialog")) {
      const li = f.tipo === "dialog" ? (f.params[2] || {}).nome : (f.params[3] || {}).nome;
      const di = (f.params[1] || {}).nome;
      if (!li) continue;
      const visitar = (s, dialogo) => P().percorrer(s, n => {
        if (n.k === "if" && di) {
          let d = dialogo;
          P().percorrer(n.cond, c => { if (c.k === "bin" && c.op === "==" && (txt(ctx, c.esq) === di || txt(ctx, c.dir) === di)) { const o = txt(ctx, c.esq) === di ? c.dir : c.esq; const v = valorConst(o, sim); d = v !== null ? "n" + v : "t" + txt(ctx, o); } });
          if (d !== dialogo) { visitar(n.entao, d); if (n.senao) visitar(n.senao, dialogo); return false; }
        }
        if (n.k === "indice" && nomeSimples(n.i) === li) {
          const b = P().baseDe(n); const info = b && infoVar(b.base, f, sim);
          const tam = info && info.tamanhos ? info.tamanhos[b.indices.length - 1] : null;
          const op = dialogo && opcoes.get(dialogo);
          if (tam && op && op.itens > tam && !new RegExp(`${esc(li)}\\s*(<|>=|>|<=)`).test(txt(ctx, f.corpo))) out.push({ nivel: "erro", linha: n.linha, titulo: `A lista do dialog tem **${op.itens}** opções e {{${b.base}}} só **${tam}**`,
            porque: `O dialog (linha ${op.linha}) mostra ${op.itens} opções; o {{${li}}} vai de 0 a ${op.itens - 1}. {{${b.base}}} vai só de 0 a ${tam - 1}.`,
            consequencia: `Escolher a opção ${tam + 1} dá **array index out of bounds**: o comando para e o jogador não recebe nada.`,
            quando: `Quando o jogador escolhe a opção ${tam + 1}${op.itens > tam + 1 ? " em diante" : ""}.`, correcao: `Deixe a lista e o array com o mesmo número de itens (e confira {{if (${li} >= sizeof(${b.base})) return 1;}}).`,
            evidencias: [ev(op.linha, `o dialog com ${op.itens} opções`), ev(n.linha, `${b.base} tem ${tam}`)], teste: `Abra o dialog e escolha a opção ${tam + 1}.` });
        }
      });
      visitar(f.corpo, null);
    }
    return out;
  });

  /* ---------- PROJETO (compilação entre arquivos) ---------- */
  // nome de verdade de uma função: depois de "#define OnPlayerConnect XP_OnPlayerConnect" (hook ALS),
  // o "public OnPlayerConnect" que vem depois vira XP_OnPlayerConnect
  function nomeEfetivo(prog, nome, linha, prof = 0) {
    if (prof > 8) return nome;
    const d = prog.defines.filter(x => x.nome === nome && !x.macro && /^[A-Za-z_@][\w@]*$/.test(x.valor) && x.linha < linha).pop();
    if (!d) return nome;
    const desfeito = (prog.undefs || []).some(u => u.nome === nome && u.linha > d.linha && u.linha < linha);
    return desfeito ? nome : nomeEfetivo(prog, d.valor, linha, prof + 1);
  }
  regra("simbolo-duplicado", "projeto", "compilacao", ctx => {
    const out = [], sim0 = simbolos(ctx);
    const sim = { ...sim0, funcoes: new Map() };
    for (const f of ctx.ast.funcoes) { const n = nomeEfetivo(ctx.ast, f.nome, f.linha); if (!sim.funcoes.has(n)) sim.funcoes.set(n, []); sim.funcoes.get(n).push(f); }
    for (const [nome, fs] of sim.funcoes) {
      const reais = fs.filter(f => f.tipo !== "hook" && f.tipo !== "trecho" && !f.mods.includes("hook"));
      if (reais.length < 2) continue;
      for (const f of reais.slice(1)) {
        const cmd = f.tipo === "comando";
        out.push({ nivel: "erro", linha: f.linhaNome || f.linha, titulo: `${cmd ? `O comando {{/${nome}}}` : `{{${nome}}}`} foi criado **duas vezes**`,
          porque: `Já existe ${cmd ? "um comando" : "uma função"} com esse nome na linha ${reais[0].linhaNome || reais[0].linha}${ctx.arquivoDe ? ` (${ctx.arquivoDe(reais[0].linhaNome || reais[0].linha)})` : ""}.`,
          consequencia: "O compilador para com **error 021: symbol already defined**." + (f.callback ? " Callbacks só podem existir uma vez (pra ter em vários arquivos, use hooks: y_hooks ou ALS)." : ""),
          quando: "Ao compilar.", correcao: f.callback ? "Junte o código dos dois callbacks num só, ou use {{hook}} (y_hooks)." : "Renomeie uma delas ou apague a cópia.",
          compilador: "error 021", categoria: "compilacao", evidencias: [ev(reais[0].linhaNome || reais[0].linha, "primeira"), ev(f.linhaNome || f.linha, "de novo")], teste: "Compile: error 021." });
      }
    }
    const trecho = !ctx.ast.funcoes.some(f => f.tipo !== "trecho");   // sem nenhuma função: é um pedaço solto (pode juntar coisas de lugares diferentes)
    for (const g of sim0.dupGlobais) {
      const prim = sim0.globais.get(g.nome);
      out.push({ nivel: trecho ? "verificar" : "erro", linha: g.linha, titulo: `A variável {{${g.nome}}} foi criada **duas vezes**`, porque: `Já existe {{new ${g.nome}}} na linha ${prim.linha}.`,
        consequencia: "O compilador para com **error 021: symbol already defined**.", quando: "Ao compilar.", correcao: "Apague uma das declarações (deixe só uma, num arquivo que todos incluem).",
        compilador: "error 021", evidencias: [ev(prim.linha, "primeira"), ev(g.linha, "de novo")], teste: "Compile: error 021." });
    }
    return out;
  });

  regra("usado-antes-de-declarar", "projeto", "compilacao", ctx => {
    const out = [], sim = simbolos(ctx);
    const posDecl = new Map();
    for (const g of ctx.ast.globais) if (!posDecl.has(g.nome)) posDecl.set(g.nome, { pos: g.ini, linha: g.linha, tipo: "variável" });
    for (const e of ctx.ast.enums) for (const m of e.membros) if (!posDecl.has(m.nome)) posDecl.set(m.nome, { pos: ctx.ast.tokens.find(t => t.linha === m.linha && t.v === m.nome)?.ini ?? Infinity, linha: m.linha, tipo: "campo do enum" });
    const avisados = new Set();
    for (const f of funcoesOk(ctx)) {
      const locais = locaisDe(f, sim);
      P().percorrer(f.corpo, n => {
        if (n.k === "chamada") { n.args.forEach(a => P().percorrer(a, m => { if (m.k === "id") olhar(m); })); return false; }
        if (n.k === "id") olhar(n);
      });
      function olhar(n) {
        if (locais.has(n.nome) || avisados.has(n.nome)) return;
        const d = posDecl.get(n.nome);
        if (!d || d.pos <= n.ini) return;
        avisados.add(n.nome);
        out.push({ nivel: "erro", linha: n.linha, titulo: `{{${n.nome}}} é usado **antes** de ser declarado`,
          porque: `A ${d.tipo} {{${n.nome}}} só é criada na linha ${d.linha}${ctx.arquivoDe ? ` (${ctx.arquivoDe(d.linha)})` : ""}, que o compilador lê **depois** desta. Funções podem ser usadas antes, mas variáveis e campos de enum não.`,
          consequencia: "O compilador para com **error 017: undefined symbol** (mesmo ela existindo mais pra baixo).",
          quando: "Ao compilar.", correcao: "Mova a declaração (ou o {{#include}} que tem ela) pra **antes** do arquivo que usa. Ex: declare as variáveis num arquivo próprio e inclua ele primeiro.",
          compilador: "error 017", evidencias: [ev(n.linha, "usado aqui"), ev(d.linha, "declarado só aqui")], teste: "Compile: error 017 apontando esta linha." });
      }
    }
    return out;
  });

  regra("campo-fora-do-enum", "projeto", "compilacao", ctx => {
    const out = [], sim = simbolos(ctx);
    if (!sim.enums.size) return out;
    const vistos = new Set();
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "indice") return;
      const b = P().baseDe(n);
      if (!b) return;
      const info = infoVar(b.base, f, sim);
      const pos = b.indices.length - 1;
      if (!info || !info.enumDims || !info.enumDims[pos]) return;
      const campo = nomeSimples(b.indices[pos]);
      if (!campo || campo === b.base) return;
      const en = sim.enums.get(info.enumDims[pos]);
      if (!en || en.membros.includes(campo) || locaisDe(f, sim).has(campo) || vistos.has(campo)) return;
      if (sim.globais.has(campo) || sim.defines.has(campo)) return;
      vistos.add(campo);
      const outro = sim.membros.get(campo);
      out.push({ nivel: outro ? "provavel" : (ctx.faltando && ctx.faltando.length ? "verificar" : "erro"), linha: n.linha, categoria: outro ? "logica" : "compilacao",
        titulo: outro ? `{{${campo}}} é de **outro enum** ({{${outro.enum}}}), não de {{${en ? info.enumDims[pos] : ""}}}` : `{{${campo}}} não existe no enum {{${info.enumDims[pos]}}}`,
        porque: outro ? `{{${b.base}}} foi criado com o enum {{${info.enumDims[pos]}}}, mas {{${campo}}} pertence a {{${outro.enum}}}. A posição de memória é outra.` : `O enum {{${info.enumDims[pos]}}} (linha ${en.linha}${ctx.arquivoDe ? `, ${ctx.arquivoDe(en.linha)}` : ""}) tem: ${en.membros.slice(0, 8).map(m => `{{${m}}}`).join(", ")}${en.membros.length > 8 ? "..." : ""}. Não tem {{${campo}}}.`,
        consequencia: outro ? "Compila com **warning 213 (tag mismatch)** e lê/grava o campo **errado**." : "O compilador para com **error 017: undefined symbol**.",
        quando: "Ao compilar.", correcao: outro ? `Use um campo de {{${info.enumDims[pos]}}}, ou crie {{${campo}}} nele.` : `Adicione {{${campo}}} dentro do enum {{${info.enumDims[pos]}}}.`,
        compilador: outro ? "warning 213" : "error 017", evidencias: [ev(n.linha, "usado"), ev(en.linha, "enum " + info.enumDims[pos])], teste: "Compile e veja a linha apontada." });
    });
    return out;
  });

  regra("argumentos-funcao-propria", "projeto", "integracao", ctx => {
    const out = [], sim = simbolos(ctx);
    for (const f of funcoesOk(ctx)) for (const c of P().chamadas(f.corpo)) {
      const defs = sim.funcoes.get(c.nome);
      if (!defs || defs.length !== 1 || defs[0].tipo === "trecho") continue;
      const d = defs[0];
      if (d.params.some(p => p.variadico)) continue;
      const min = d.params.filter(p => p.padrao === null || p.padrao === undefined).length, max = d.params.length;
      const n = c.args.length;
      const outroArq = ctx.arquivoDe && ctx.arquivoDe(d.linha) !== ctx.arquivoDe(c.linha);
      // texto fixo num parâmetro que não é array -> error 035
      const errTipo = c.args.findIndex((a, i) => d.params[i] && !d.params[i].array && P().nu(a) && P().nu(a).k === "str");
      if (errTipo >= 0) {
        out.push({ nivel: "erro", linha: c.linha, categoria: "compilacao", titulo: `Texto passado no lugar de um número em {{${c.nome}}} (argumento ${errTipo + 1})`,
          porque: `{{${c.nome}}} (linha ${d.linhaNome}${outroArq ? `, ${ctx.arquivoDe(d.linha)}` : ""}) espera {{${d.params.map(p => p.nome + (p.array ? "[]" : "")).join(", ")}}}: o argumento ${errTipo + 1} é {{${d.params[errTipo].nome}}}, que é um número.`,
          consequencia: "O compilador para com **error 035: argument type mismatch**.", quando: "Ao compilar.",
          correcao: `Confira a ordem: {{${c.nome}(${d.params.map(p => p.nome).join(", ")})}}.`, compilador: "error 035", evidencias: [ev(c.linha, "chamada"), ev(d.linhaNome, "definição")], teste: "Compile: error 035." });
        continue;
      }
      if (n < min || n > max) out.push({ nivel: "erro", linha: c.linha, categoria: outroArq ? "integracao" : "logica", titulo: `{{${c.nome}}} chamada com ${n} argumento(s); ela recebe ${min === max ? min : `${min} a ${max}`}`,
        porque: `A definição (linha ${d.linhaNome}${outroArq ? `, ${ctx.arquivoDe(d.linha)}` : ""}) é {{${c.nome}(${d.params.map(p => p.nome).join(", ")})}}.`,
        consequencia: "O compilador só avisa (**warning 202**) e compila: os parâmetros recebem valores **trocados ou zero** quando o jogo roda.",
        quando: "Toda vez que essa linha roda.", correcao: `Passe os ${max} valores na ordem da definição.`, compilador: "warning 202", evidencias: [ev(c.linha, "chamada"), ev(d.linhaNome, "definição")], teste: "Compile: warning 202 nesta linha." });
    }
    return out;
  });

  /* ---------- ESTADO E SEQUÊNCIA (SA-MP) ---------- */
  // o que cada função faz (incluindo as que ela chama): zera, salva, lê campos, mata timer...
  function efeitos(ctx) {
    if (ctx._efeitos) return ctx._efeitos;
    const sim = simbolos(ctx);
    const mapa = new Map();
    const SALVA = /^(DOF2_Set\w*|DOF2_SaveFile|INI_Write\w*|INI_Save|dini_\w*Set|dini_Set\w*|dini_Int\w*|fwrite|db_query|mysql_tquery|mysql_query|mysql_pquery|yoshi_\w+)$/;
    for (const f of ctx.ast.funcoes) {
      const e = { zera: new Map(), atribui: new Map(), le: new Map(), escreve: new Map(), salva: false, chama: new Set(), mataTimer: new Set(), desativaCP: false, dinheiroGTA: false, campoDinheiro: new Set(), kick: false, sincroniza: false };
      const marca = (m, base, campo) => { if (!m.has(base)) m.set(base, new Set()); m.get(base).add(campo); };
      // "zerar" = colocar um valor FIXO (0, 1, false, "", INVALID_..., array vazio): é o que reinicia o dado
      const ehZero = v => { v = P().nu(v); if (!v) return false; if (v.k === "num") return true; if (v.k === "str") return true; if (v.k === "un" && P().nu(v.e) && P().nu(v.e).k === "num") return true; if (v.k === "id") { if (/^(false|true|EOS|INVALID_\w+|NO_TEAM)$/.test(v.nome) || /^[A-Z][A-Z0-9_]+$/.test(v.nome)) return true; const l = locaisDe(f, sim).get(v.nome) || sim.globais.get(v.nome); return !!(l && l.dims && l.dims.length && !l.init); } return valorConst(v, sim) !== null; };
      const visitar = n => {
        if (n.k === "atrib") {
          const b = P().baseDe(n.alvo);
          if (b && b.indices.length) {
            const campo = b.indices.length >= 2 ? (nomeSimples(b.indices[1]) || "?") : "*";
            if (n.op === "=" && ehZero(n.valor)) marca(e.zera, b.base, campo);
            if (n.op === "=") marca(e.atribui, b.base, campo);
            marca(e.escreve, b.base, campo);   // escrever um valor fixo também é escrever (ex: jAdmin = 5)
            if (CAMPO_DINHEIRO.test(campo) || CAMPO_DINHEIRO.test(b.base)) e.campoDinheiro.add(b.base + (campo !== "*" ? "." + campo : ""));
          }
        }
        if (n.k === "pre" || n.k === "pos") { const b = P().baseDe(n.e); if (b && b.indices.length) marca(e.escreve, b.base, b.indices.length >= 2 ? (nomeSimples(b.indices[1]) || "?") : "*"); }
        if (n.k === "for" && n.corpo) { /* for (new i; i < E; i++) X[p][i] = 0 */ P().percorrer(n.corpo, m => { if (m.k === "atrib" && ehZero(m.valor)) { const b = P().baseDe(m.alvo); if (b && b.indices.length >= 2 && nomeSimples(b.indices[1]) && !sim.membros.has(nomeSimples(b.indices[1]))) marca(e.zera, b.base, "*"); } }); }
        if (n.k === "indice") {
          // só o acesso de fora (Jogador[p][jXP]); o de dentro (Jogador[p]) não é "ler o array inteiro"
          const b = P().baseDe(n);
          if (b && b.indices.length) marca(e.le, b.base, b.indices.length >= 2 ? (nomeSimples(b.indices[1]) || "?") : "*");
          if (b) { b.indices.forEach(i => i && P().percorrer(i, visitar)); return false; }
        }
        if (n.k === "chamada") {
          e.chama.add(n.nome);
          if (SALVA.test(n.nome)) e.salva = true;
          if ((n.nome === "format" || n.nome === "mysql_format") && n.args.some(a => P().nu(a) && P().nu(a).k === "str" && /\b(UPDATE|INSERT)\b/i.test(P().nu(a).v))) e.salva = true;
          if (n.nome === "KillTimer" && n.args[0]) { const b = P().baseDe(n.args[0]); if (b) e.mataTimer.add(b.base); }
          if (/^(DisablePlayerCheckpoint|DisablePlayerRaceCheckpoint|SetPlayerCheckpoint|SetPlayerRaceCheckpoint|DestroyPickup|DestroyDynamicPickup|DestroyDynamicCP|DestroyDynamicRaceCP|TogglePlayerDynamicCP)$/.test(n.nome)) e.desativaCP = true;
          if (n.nome === "GivePlayerMoney" || n.nome === "ResetPlayerMoney") e.dinheiroGTA = true;
          if (n.nome === "GivePlayerMoney" && n.args[1] && CAMPO_DINHEIRO.test(P().texto(ctx.codigo, n.args[1])) && /\[/.test(P().texto(ctx.codigo, n.args[1]))) e.sincronizaDireto = true;
          if (/^(Kick|Ban|BanEx)$/.test(n.nome)) e.kick = true;
          // static const vazio[E]; Jogador[playerid] = vazio;  já tratado em atrib
        }
      };
      P().percorrer(f.corpo, visitar);
      if ((e.dinheiroGTA && e.campoDinheiro.size) || e.sincronizaDireto) e.sincroniza = true;
      mapa.set(f.nome, e);
    }
    // fecha: o que a função chama também conta (até 4 níveis)
    const total = new Map();
    const juntar = (nome, prof, visto) => {
      const e = mapa.get(nome);
      if (!e) return null;
      if (prof > 4 || visto.has(nome)) return e;
      visto.add(nome);
      const t = { atribui: new Map([...e.atribui].map(([k, v]) => [k, new Set(v)])), zera: new Map([...e.zera].map(([k, v]) => [k, new Set(v)])), le: new Map([...e.le].map(([k, v]) => [k, new Set(v)])), escreve: e.escreve, salva: e.salva, mataTimer: new Set(e.mataTimer), desativaCP: e.desativaCP, dinheiroGTA: e.dinheiroGTA, campoDinheiro: new Set(e.campoDinheiro), kick: e.kick, sincroniza: e.sincroniza, chama: e.chama };
      for (const c of e.chama) {
        const s = juntar(c, prof + 1, visto);
        if (!s) continue;
        for (const [k, v] of s.zera) { if (!t.zera.has(k)) t.zera.set(k, new Set()); v.forEach(x => t.zera.get(k).add(x)); }
        for (const [k, v] of s.atribui) { if (!t.atribui.has(k)) t.atribui.set(k, new Set()); v.forEach(x => t.atribui.get(k).add(x)); }
        for (const [k, v] of s.le) { if (!t.le.has(k)) t.le.set(k, new Set()); v.forEach(x => t.le.get(k).add(x)); }
        s.mataTimer.forEach(x => t.mataTimer.add(x));
        t.salva = t.salva || s.salva; t.desativaCP = t.desativaCP || s.desativaCP; t.dinheiroGTA = t.dinheiroGTA || s.dinheiroGTA; t.kick = t.kick || s.kick; t.sincroniza = t.sincroniza || s.sincroniza;
        s.campoDinheiro.forEach(x => t.campoDinheiro.add(x));
      }
      visto.delete(nome);
      return t;
    };
    for (const nome of mapa.keys()) total.set(nome, juntar(nome, 0, new Set()));
    ctx._efeitos = { direto: mapa, total };
    return ctx._efeitos;
  }
  // arrays por jogador: primeira dimensão MAX_PLAYERS
  function arraysPorJogador(sim) {
    return [...sim.globais.values()].filter(g => g.dims && g.dims[0] && /MAX_PLAYERS/.test(P().texto(sim.prog.codigo, g.dims[0])) && !g.constante);
  }
  const TRANSITORIO = /(Logado|logado|Tentativa|tentativa|Timer|timer|Spawn|spawn|Morto|morto|Afk|afk|Anim|anim|Ultim|ultim|Tick|tick|Cooldown|cooldown|Spec|spec|Digitando|Carregado|carregado|Cache|cache|Selecion|selecion|TD|Td|Dialog|dialog)/;

  regra("dados-herdados", "estado do jogador", "logica", ctx => {
    const sim = simbolos(ctx), ef = efeitos(ctx);
    const fs = funcoesOk(ctx);
    const con = fs.find(f => f.nome === "OnPlayerConnect"), des = fs.find(f => f.nome === "OnPlayerDisconnect");
    if (!con && !des && !(ctx.completo && fs.some(f => f.callback))) return [];
    const zerados = new Map();
    // inicializar = zerar, ou dar um valor com "=" (ex: carregar da conta) no caminho do OnPlayerConnect / Disconnect
    for (const f of [con, des].filter(Boolean)) { const t = ef.total.get(f.nome) || { zera: new Map(), atribui: new Map() }; for (const m of [t.zera, f === con ? t.atribui : new Map()]) for (const [k, v] of m) { if (!zerados.has(k)) zerados.set(k, new Set()); v.forEach(x => zerados.get(k).add(x)); } }
    const problemas = [];
    for (const g of arraysPorJogador(sim)) {
      if (zerados.has(g.nome) && zerados.get(g.nome).has("*")) continue;
      // campos escritos FORA do connect (durante o jogo) e nunca zerados
      const escritos = new Set();
      for (const f of fs) {
        if (f === con) continue;
        const e = ef.direto.get(f.nome);
        if (e && e.escreve.has(g.nome)) e.escreve.get(g.nome).forEach(c => escritos.add(c));
      }
      const faltam = [...escritos].filter(c => !(zerados.get(g.nome) || new Set()).has(c) && c !== "?");
      if (!faltam.length) continue;
      problemas.push({ g, faltam });
    }
    if (!problemas.length) return [];
    const alvo = con || des;
    const L = alvo ? alvo.linhaNome || alvo.linha : problemas[0].g.linha;
    const lista = problemas.map(p => p.faltam.includes("*") ? `{{${p.g.nome}[playerid]}}` : p.faltam.slice(0, 5).map(c => `{{${p.g.nome}[playerid][${c}]}}`).join(", ")).join("; ");
    const sensivel = problemas.some(p => p.faltam.some(c => /admin|Admin|Adm|adm|Vip|vip|VIP|Dinheiro|dinheiro|Banco|banco|Logado|logado|Nivel|nivel|Level|level|Cargo|cargo|Lider|lider/.test(c + p.g.nome)));
    // vendo o OnPlayerConnect/Disconnect e ele não zera = provável; sem eles no código = depende do resto do gamemode
    return [{ nivel: con || des ? "provavel" : "verificar", linha: L, categoria: sensivel ? "seguranca" : "logica", titulo: "Quem entrar no mesmo id **herda os dados** de quem saiu",
      porque: `Esses dados mudam durante o jogo e ${con || des ? `nem o ${[con && "OnPlayerConnect", des && "OnPlayerDisconnect"].filter(Boolean).join(" nem o ")} zeram` : "não vi nenhum OnPlayerConnect/OnPlayerDisconnect zerando (se eles existem em outro arquivo, confira lá)"}: ${lista}. O SA-MP reaproveita o id de quem saiu pro próximo que entra.`,
      consequencia: sensivel ? "O próximo jogador nesse id pode entrar **já logado, com admin, VIP ou o dinheiro** do anterior." : "O próximo jogador começa com valores do anterior.",
      quando: "Quando alguém sai e outro entra no mesmo id (acontece o tempo todo).",
      correcao: "Zere tudo no {{OnPlayerConnect}}. Jeito fácil pra enum: {{static const vazio[E_JOGADOR]; Jogador[playerid] = vazio;}}",
      evidencias: [ev(L, alvo ? `${alvo.nome} não zera` : "sem reset"), ...problemas.slice(0, 3).map(p => ev(p.g.linha, `${p.g.nome} declarado aqui`))],
      teste: "Entre com um admin, saia, entre com outra conta no mesmo id e use um comando de admin." }];
  });

  regra("salvar-depois-de-zerar", "estado do jogador", "logica", ctx => {
    const out = [], ef = efeitos(ctx);
    for (const f of funcoesOk(ctx)) {
      // sequência de comandos de nível de cima (e dentro de ifs, na ordem)
      const zerou = new Map();   // array -> linha
      P().percorrer(f.corpo, n => {
        if (n.k !== "chamada" && n.k !== "atrib") return;
        if (n.k === "atrib") { const b = P().baseDe(n.alvo); const e = ef.direto.get(f.nome); if (b && b.indices.length && e && e.zera.has(b.base)) { const v = P().nu(n.valor); if (v && (v.k === "num" && v.valor === 0)) zerou.set(b.base, zerou.get(b.base) || n.linha); } return; }
        const t = ef.total.get(n.nome);
        if (!t) return false;
        if (t.salva) {
          for (const [arr, campos] of t.le) {
            if (!zerou.has(arr)) continue;
            out.push({ nivel: "erro", linha: n.linha, titulo: `{{${n.nome}}} salva **depois** que os dados foram zerados`,
              porque: `Na linha ${zerou.get(arr)} os dados de {{${arr}}} são zerados; só depois {{${n.nome}}} grava ${[...campos].filter(c => c !== "*" && c !== "?").slice(0, 4).map(c => `{{${c}}}`).join(", ") || "esses dados"}.`,
              consequencia: "O arquivo/banco recebe **tudo zerado**: o jogador perde dinheiro, nível e o resto da conta ao sair.",
              quando: "Toda vez que essa função roda (normalmente quando o jogador sai).", correcao: `Inverta a ordem: primeiro {{${n.nome}(...)}}, depois zere.`,
              evidencias: [ev(zerou.get(arr), "zera aqui"), ev(n.linha, "salva aqui (já zerado)")], teste: "Saia do servidor com dinheiro e veja o arquivo da conta: vai estar 0." });
            break;
          }
        }
        for (const [arr] of t.zera) if (!zerou.has(arr)) zerou.set(arr, n.linha);
        return false;
      });
    }
    return out;
  });

  regra("kick-e-mensagem", "sequência de eventos", "logica", ctx => {
    const out = [];
    for (const f of funcoesOk(ctx)) {
      const avisados = new Set();
      executar(f, ctx, {
        kick(x, e) {
          const alvo = txt(ctx, x.args[0] || x);
          const msg = e.msgs.filter(m => m.alvo === alvo && m.nome !== "ShowPlayerDialog").pop();
          if (msg && !avisados.has(x.linha)) {
            avisados.add(x.linha);
            out.push({ nivel: "provavel", linha: x.linha, titulo: `A mensagem antes do {{${x.nome}}} **não chega** pro jogador`,
              porque: `No SA-MP 0.3.7 o {{${x.nome}}} desconecta **na hora**, antes do servidor mandar o que ficou na fila. A mensagem da linha ${msg.linha} é perdida.`,
              consequencia: "O jogador é desconectado sem ver o motivo.", quando: "Sempre que essa linha roda (no open.mp isso pode já estar resolvido: confira a versão do seu servidor).",
              correcao: `Atrase o kick com um timer: {{SetTimerEx("KickAtrasado", 200, false, "i", ${alvo});}} e no {{public KickAtrasado(playerid)}} faça o {{Kick}}.`,
              evidencias: [ev(msg.linha, "mensagem"), ev(x.linha, x.nome + " logo depois")], teste: "Use o comando em outro jogador e peça pra ele dizer se viu a mensagem." });
          }
          e.kick = { alvo, linha: x.linha };
        },
        chamada(x, e) {
          const k = e.kick || e.talvezKick;
          if (!k || /^(Kick|Ban|BanEx)$/.test(x.nome) || avisados.has(x.linha)) return;
          const usa = x.args.some(a => txt(ctx, a) === k.alvo);
          if (!usa || !/^(SetTimerEx|SendClientMessage|GameTextForPlayer|ShowPlayerDialog|SetPlayer\w+|GivePlayer\w+|SpawnPlayer|TogglePlayer\w+|PlayerPlaySound|Salvar\w*|Save\w*)$/.test(x.nome)) return;
          avisados.add(x.linha);
          out.push({ nivel: "provavel", linha: x.linha, titulo: e.kick ? `Usa o jogador **depois** do ${"Kick"}` : "Depois do Kick o código **continua** (faltou {{return}})",
            porque: e.kick ? `Na linha ${k.linha} {{${k.alvo}}} foi desconectado; esta linha ainda age em cima dele.` : `O {{Kick}} da linha ${k.linha} está dentro de um {{if}} sem {{return}} depois: quando ele acontece, o código segue e chega aqui com um jogador que **já saiu**.`,
            consequencia: x.nome === "SetTimerEx" ? "O timer vai rodar pro id dele daqui a pouco, quando o id pode já ser de **outro jogador**." : "A ação vai pra um id vazio (ou pro próximo que entrar nele).",
            quando: "Quando o Kick acontece.", correcao: `Coloque {{return 1;}} logo depois do {{Kick(${k.alvo})}}.`,
            correcoes: !e.kick ? [{ tipo: "inserirDepois", linha: k.linha, linhas: [(ctx.linhas[k.linha - 1].match(/^\s*/) || [""])[0] + "return 1;"] }] : [], seguro: !e.kick,
            evidencias: [ev(k.linha, "Kick"), ev(x.linha, "continua usando o jogador")], teste: "Faça o Kick acontecer e coloque um print aqui: ele aparece." });
        },
        atrib(x, e) {
          if (!e.kick) return;
          const b = P().baseDe(x.alvo);
          if (!b || !b.indices.length || txt(ctx, b.indices[0]) !== e.kick.alvo || avisados.has(x.linha)) return;
          avisados.add(x.linha);
          out.push({ nivel: "provavel", linha: x.linha, titulo: "Mexe nos dados do jogador **depois** do Kick",
            porque: `Na linha ${e.kick.linha} o jogador {{${e.kick.alvo}}} foi desconectado (o {{OnPlayerDisconnect}} já rodou). Esta linha muda os dados de um id que **já está livre**.`,
            consequencia: "Se o OnPlayerDisconnect salvou/zerou os dados, essa mudança vai pro **próximo jogador** que entrar nesse id (ou se perde).",
            quando: "Toda vez que o kick acontece por aqui.", correcao: "Faça as mudanças **antes** do Kick (ou atrase o Kick com timer).",
            evidencias: [ev(e.kick.linha, "Kick"), ev(x.linha, "mexe depois")], teste: "Coloque um print no OnPlayerDisconnect e outro nesta linha: o do disconnect aparece primeiro." });
        },
      });
    }
    return out;
  });

  regra("timer-por-jogador", "sequência de eventos", "logica", ctx => {
    const out = [], ef = efeitos(ctx), fs = funcoesOk(ctx);
    const des = fs.find(f => f.nome === "OnPlayerDisconnect");
    const mortosNoDisc = des ? (ef.total.get(des.nome) || { mataTimer: new Set() }).mataTimer : new Set();
    const mortosEmAlgumLugar = new Set();
    for (const [, e] of ef.direto) e.mataTimer.forEach(x => mortosEmAlgumLugar.add(x));
    for (const f of fs) P().percorrer(f.corpo, n => {
      if (n.k !== "atrib" || n.op !== "=") return;
      const v = P().nu(n.valor);
      if (!v || v.k !== "chamada" || v.nome !== "SetTimerEx" || !v.args[2]) return;
      const rep = valorConst(v.args[2], simbolos(ctx));
      if (rep !== 1 && txt(ctx, v.args[2]) !== "true") return;
      const b = P().baseDe(n.alvo);
      if (!b || !b.indices.length) return;
      const nunca = !mortosEmAlgumLugar.has(b.base);
      if (!nunca && (mortosNoDisc.has(b.base) || !des && !ctx.completo)) return;
      // recriado sem matar o anterior na mesma função?
      out.push({ nivel: "provavel", linha: n.linha, titulo: nunca ? `O timer {{${b.base}}} repete pra sempre e **nunca é desligado**` : `O timer {{${b.base}}} não é desligado quando o jogador **sai**`,
        porque: nunca ? `{{SetTimerEx}} com repetição ({{true}}) e nenhum {{KillTimer(${b.base}[...])}} no código.` : `Existe {{KillTimer(${b.base}[...])}}, mas ele não roda no {{OnPlayerDisconnect}}.`,
        consequencia: "Depois que o jogador sai o timer **continua rodando** pro id dele (e afeta quem entrar no lugar). Se a função que cria o timer roda de novo (ex: a cada spawn), nasce **outro timer** e eles se acumulam.",
        quando: "Quando o jogador sai, ou quando o timer é criado mais de uma vez.",
        correcao: `No {{OnPlayerDisconnect}}: {{KillTimer(${txt(ctx, n.alvo)});}}. E antes de criar de novo, mate o anterior.`,
        evidencias: [ev(n.linha, "timer criado"), ...(des ? [ev(des.linhaNome || des.linha, "OnPlayerDisconnect sem KillTimer")] : [])], teste: "Coloque um print dentro do timer, saia do servidor e veja se continua imprimindo." });
    });
    return out;
  });

  regra("recompensa-repetida", "sequência de eventos", "logica", ctx => {
    const out = [], ef = efeitos(ctx);
    const REPETE = /^(OnPlayerEnterCheckpoint|OnPlayerEnterRaceCheckpoint|OnPlayerPickUpPickup|OnPlayerPickUpDynamicPickup|OnPlayerEnterDynamicCP|OnPlayerEnterDynamicRaceCP)$/;
    for (const f of funcoesOk(ctx).filter(f => REPETE.test(f.nome))) {
      const e = ef.total.get(f.nome) || {};
      if (e.desativaCP) continue;
      // tem um if com uma variável de estado que também muda aqui (flag) ou cooldown?
      const corpo = txt(ctx, f.corpo);
      if (/gettime|GetTickCount|tickcount/.test(corpo)) continue;
      let flag = false;
      P().percorrer(f.corpo, n => { if (n.k === "if") { const vars = [...P().variaveisLidas(n.cond)]; P().percorrer(f.corpo, m => { if (m.k === "atrib") { const b = P().baseDe(m.alvo); if (b && vars.includes(b.base)) flag = true; } }); } });
      if (flag) continue;
      let premio = null;
      P().percorrer(f.corpo, n => {
        if (premio) return false;
        if (n.k === "chamada" && n.nome === "GivePlayerMoney" && n.args[1] && !(P().nu(n.args[1]).k === "un")) premio = n;
        if (n.k === "chamada" && /^(Dar|Give|Pagar|Recompens|Premi)/.test(n.nome) && n.nome !== "GivePlayerWeapon") premio = n;
        if (n.k === "atrib" && (n.op === "+=") && CAMPO_QTD.test(txt(ctx, n.alvo))) premio = n;
      });
      if (!premio) continue;
      const pickup = /Pickup/.test(f.nome);
      out.push({ nivel: pickup ? "verificar" : "provavel", linha: premio.linha, titulo: pickup ? "Pegar o pickup de novo **paga de novo**?" : "Entrar de novo no checkpoint **paga de novo**",
        porque: `${pickup ? "O pickup" : "O checkpoint"} continua ${pickup ? "ali (dependendo do tipo, ele volta)" : "ativo"} depois do prêmio: nada desativa ele ({{${pickup ? "DestroyPickup" : "DisablePlayerCheckpoint"}}}) e não tem uma variável de controle (ex: {{EmEntrega[playerid]}}) nem tempo de espera.`,
        consequencia: "O jogador sai e entra várias vezes e ganha o prêmio **infinitamente** (farm de dinheiro/XP).", quando: "Toda vez que ele entra de novo.",
        correcao: pickup ? "Destrua o pickup ou guarde que o jogador já pegou." : "Logo no começo: {{DisablePlayerCheckpoint(playerid);}} (e use uma variável pra saber se ele estava numa entrega).",
        correcoes: pickup ? [] : [{ tipo: "inserirAntes", linha: premio.linha, linhas: [(ctx.linhas[premio.linha - 1].match(/^\s*/) || [""])[0] + "DisablePlayerCheckpoint(playerid);"] }], seguro: !pickup,
        evidencias: [ev(f.linhaNome || f.linha, f.nome), ev(premio.linha, "prêmio sem desativar")], teste: "Entre no checkpoint, saia e entre de novo." });
    }
    return out;
  });

  regra("estado-preso", "estado do jogador", "logica", ctx => {
    const out = [], sim = simbolos(ctx), fs = funcoesOk(ctx), ef = efeitos(ctx);
    const morte = fs.find(f => f.nome === "OnPlayerDeath"), des = fs.find(f => f.nome === "OnPlayerDisconnect");
    if (!morte && !des) return out;
    void sim;
    const ESTADO = /(Evento|evento|Corrida|corrida|Duelo|duelo|Arena|arena|Trabalh|trabalh|Algemad|algemad|Missao|missao|Entrega|entrega|Pescando|pescando|Minerando|EmServico|Sequestr|Assalt|assalt|Roubando|roubando|Paintball|paintball|DM|Dm)/;
    for (const g of arraysPorJogador(sim)) {
      const campos = new Set();
      for (const f of fs) { const e = ef.direto.get(f.nome); if (e && e.escreve.has(g.nome)) e.escreve.get(g.nome).forEach(c => { if (ESTADO.test(c === "*" ? g.nome : c)) campos.add(c); }); }
      // campo de estado conferido num if (ligado em algum lugar, talvez em outro arquivo)
      for (const f of fs) { const e = ef.direto.get(f.nome); if (e && e.le.has(g.nome)) e.le.get(g.nome).forEach(c => { if (c !== "*" && c !== "?" && /Algemad|algemad|Evento|evento|Corrida|Duelo|Arena|Missao|Entrega/.test(c)) campos.add(c); }); }
      for (const c of campos) {
        const limpaMorte = morte && (ef.total.get(morte.nome).zera.get(g.nome) || new Set()).has(c);
        const limpaSai = des && (ef.total.get(des.nome).zera.get(g.nome) || new Set()).has(c);
        // é conferido num if (bloqueia ação)?
        const nome = c === "*" ? g.nome : c;
        const conferido = new RegExp(`if\\s*\\([^)]*\\b${esc(nome)}\\b`).test(ctx.limpo || ctx.codigo);
        if (!conferido) continue;
        if (morte && !limpaMorte && ESTADO.test(nome) && !/Preso|preso|Cadeia|cadeia/.test(nome)) {
          out.push({ nivel: "provavel", linha: morte.linhaNome || morte.linha, titulo: `{{${c === "*" ? g.nome + "[playerid]" : c}}} continua ligado depois que o jogador **morre**`,
            porque: `Esse estado é ligado durante o jogo e conferido em ifs, mas o {{OnPlayerDeath}} não volta ele pra 0.`,
            consequencia: "Quem morre no meio do evento/atividade fica **preso** nesse estado (não consegue entrar de novo, ou continua recebendo como se estivesse lá).",
            quando: "Quando o jogador morre durante a atividade.", correcao: `No {{OnPlayerDeath}}: zere {{${c === "*" ? g.nome + "[playerid]" : g.nome + "[playerid][" + c + "]"}}} (e tire ele da atividade).`,
            evidencias: [ev(morte.linhaNome || morte.linha, "OnPlayerDeath não limpa")], teste: "Entre na atividade, morra e tente entrar de novo." });
        } else if (des && !limpaSai && !morte) {
          out.push({ nivel: "verificar", linha: des.linhaNome || des.linha, titulo: `{{${nome}}} não é limpo quando o jogador sai`, porque: "Esse estado é ligado durante o jogo e não é zerado no {{OnPlayerDisconnect}}.",
            consequencia: "Quem entrar no id pode já começar \"dentro\" da atividade.", correcao: `Zere no {{OnPlayerDisconnect}} (ou no {{OnPlayerConnect}}).`, teste: "Entre na atividade, saia e entre de novo no mesmo id." });
        }
      }
    }
    return out;
  });

  regra("dinheiro-dessincronizado", "integração entre sistemas", "integracao", ctx => {
    const out = [], ef = efeitos(ctx);
    const sincros = [...ef.direto].filter(([, e]) => e.sincroniza).map(([n]) => n);
    if (!sincros.length) return out;   // o projeto não usa dinheiro próprio + GTA juntos
    for (const f of funcoesOk(ctx)) {
      if (sincros.includes(f.nome)) continue;
      const t = ef.total.get(f.nome);
      if (t && t.sincroniza) continue;
      for (const c of P().chamadas(f.corpo)) {
        if (c.nome !== "GivePlayerMoney") continue;
        const v = txt(ctx, c.args[1] || c);
        if (CAMPO_DINHEIRO.test(v)) continue;
        out.push({ nivel: "provavel", linha: c.linha, titulo: "Muda só o dinheiro **do GTA**, não o do servidor",
          porque: `O projeto guarda o dinheiro numa variável própria e sincroniza em {{${sincros[0]}}}${ctx.arquivoDe ? ` (${ctx.arquivoDe((ctx.ast.funcoes.find(x => x.nome === sincros[0]) || {}).linha || 1)})` : ""}. Aqui é usado {{GivePlayerMoney}} direto, sem mexer nessa variável.`,
          consequencia: `O dinheiro aparece na tela, mas **some** na próxima vez que ${sincros[0]} rodar (ou não é salvo). E o anti-cheat pode achar que é hack.`,
          quando: "Na próxima sincronização / ao sair.", correcao: `Use {{${sincros[0]}(playerid, ${v})}} em vez de {{GivePlayerMoney}}.`,
          evidencias: [ev(c.linha, "GivePlayerMoney direto"), ev((ctx.ast.funcoes.find(x => x.nome === sincros[0]) || {}).linhaNome || 1, `${sincros[0]}: o jeito do projeto`)], teste: "Ganhe dinheiro por aqui e depois use algo que chama a função do projeto: o valor some." });
      }
    }
    return out;
  });

  regra("campo-nao-salvo", "integração entre sistemas", "integracao", ctx => {
    const out = [], ef = efeitos(ctx), sim = simbolos(ctx);
    const salvadoras = [...ef.total].filter(([n, e]) => e && e.salva && ef.direto.get(n).salva);
    if (!salvadoras.length) return out;
    const lidos = new Map();
    for (const [, e] of salvadoras) for (const [arr, cs] of e.le) { if (!lidos.has(arr)) lidos.set(arr, new Set()); cs.forEach(c => lidos.get(arr).add(c)); }
    const avisados = new Set();
    for (const f of funcoesOk(ctx)) {
      if (salvadoras.some(([n]) => n === f.nome) || /^(OnPlayerConnect|OnPlayerDisconnect)$/.test(f.nome)) continue;
      P().percorrer(f.corpo, n => {
        const alvo = n.k === "atrib" && n.op !== "=" ? n.alvo : (n.k === "pre" || n.k === "pos") ? n.e : n.k === "atrib" && !P().constante(n.valor) && P().nu(n.valor).k !== "id" ? n.alvo : null;
        if (!alvo) return;
        const b = P().baseDe(alvo);
        if (!b || b.indices.length < 2 || !lidos.has(b.base)) return;
        const campo = nomeSimples(b.indices[1]);
        if (!campo || !sim.membros.has(campo) || lidos.get(b.base).has(campo) || lidos.get(b.base).has("*") || TRANSITORIO.test(campo) || avisados.has(campo)) return;
        avisados.add(campo);
        out.push({ nivel: "verificar", linha: n.linha, titulo: `{{${campo}}} muda durante o jogo mas **não é salvo**`,
          porque: `A função de salvar ({{${salvadoras[0][0]}}}${ctx.arquivoDe ? `, ${ctx.arquivoDe(ctx.ast.funcoes.find(x => x.nome === salvadoras[0][0]).linha)}` : ""}) grava outros campos de {{${b.base}}}, mas não {{${campo}}}.`,
          consequencia: `Se {{${campo}}} deveria continuar depois que o jogador sai, ele **volta ao início** a cada login.`,
          quando: "Quando o jogador sai e entra de novo.", correcao: `Grave {{${campo}}} na função de salvar (e carregue no login). Se é temporário de propósito, pode ignorar.`,
          evidencias: [ev(n.linha, "muda aqui"), ev(ctx.ast.funcoes.find(x => x.nome === salvadoras[0][0]).linhaNome, "salvar não grava")], teste: "Mude o valor, saia, entre e confira." });
      });
    }
    return out;
  });

  regra("contador-sem-teto", "estado do jogador", "logica", ctx => {
    const out = [], sim = simbolos(ctx);
    const codigo = ctx.limpo || ctx.codigo;
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "indice") return;
      let idx = P().nu(n.i);
      if (idx && idx.k === "bin" && (idx.op === "-" || idx.op === "+") && P().nu(idx.dir) && P().nu(idx.dir).k === "num") idx = P().nu(idx.esq);   // Nivel[p] - 1
      if (!idx || (idx.k !== "indice" && idx.k !== "id")) return;
      const chave = txt(ctx, idx);
      const b = P().baseDe(n), info = b && infoVar(b.base, f, sim);
      const tam = info && info.tamanhos ? info.tamanhos[b.indices.length - 1] : null;
      if (!tam || tam > 64) return;
      const bi = P().baseDe(idx);
      if (!bi || !sim.globais.has(bi.base)) return;
      const campo = bi.indices.length >= 2 ? txt(ctx, bi.indices[1]) : null;
      const padrao = campo ? `${esc(bi.base)}\\s*\\[[^\\]]*\\]\\s*\\[\\s*${esc(campo)}\\s*\\]` : `${esc(bi.base)}\\s*\\[[^\\]]*\\]`;
      const sobe = new RegExp(`(${padrao})\\s*(\\+\\+|\\+=)|(\\+\\+)\\s*(${padrao})`).test(codigo);
      const teto = new RegExp(`(${padrao})\\s*(<|<=|>=|>|==)|(<|<=|>=|>)\\s*(${padrao})|clamp\\s*\\(\\s*(${padrao})|MAX_(NIVEL|LEVEL|LVL)`).test(codigo);
      if (!sobe || teto) return;
      out.push({ nivel: "provavel", linha: n.linha, titulo: `{{${b.base}[${txt(ctx, n.i)}]}}: {{${chave}}} sobe sem limite e {{${b.base}}} tem só ${tam} posições`,
        porque: `{{${chave}}} só aumenta ({{++}} / {{+=}}) e nenhum if do código impede ele de passar de ${tam - 1}.`,
        consequencia: `Quando chegar em ${tam}, {{${b.base}[${chave}]}} dá **array index out of bounds** (a função para no meio).`,
        quando: `Quando {{${chave}}} chegar em ${tam}.`, correcao: `Coloque um teto antes de subir: {{if (${chave} < sizeof(${b.base}) - 1) ${chave}++;}}`,
        evidencias: [ev(n.linha, `usa como posição de ${b.base}`)], teste: `Coloque {{${chave}}} em ${tam} e chame a função.` });
    });
    return out;
  });

  // divisão por um contador que começa em 0 (ex: Kills / Mortes)
  regra("divisao-por-contador", "fluxo", "logica", ctx => {
    const out = [], codigo = ctx.limpo || ctx.codigo;
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "bin" || (n.op !== "/" && n.op !== "%")) return;
      const d = P().nu(n.dir);
      if (!d || (d.k !== "indice" && d.k !== "id") || valorConst(d, simbolos(ctx)) !== null) return;
      const b = P().baseDe(d);
      if (!b || !simbolos(ctx).globais.has(b.base)) return;
      const campo = b.indices.length >= 2 ? txt(ctx, b.indices[1]) : null;
      const pad = campo ? `${esc(b.base)}\\s*\\[[^\\]]*\\]\\s*\\[\\s*${esc(campo)}\\s*\\]` : `${esc(b.base)}\\s*\\[[^\\]]*\\]`;
      const contador = new RegExp(`(${pad})\\s*(\\+\\+|\\+=)|\\+\\+\\s*(${pad})`).test(codigo);
      const iniciaNaoZero = new RegExp(`(${pad})\\s*=\\s*[1-9]`).test(codigo);
      const confere = new RegExp(`(${pad})\\s*(!=|>|>=|==)\\s*0|if\\s*\\(\\s*!?\\s*(${pad})\\s*\\)|(${pad})\\s*(<|<=)\\s*0|max\\s*\\(\\s*1\\s*,\\s*(${pad})`).test(txt(ctx, f.corpo));
      const algumaAtribuicao = new RegExp(`(${pad})\\s*(=(?!=)|\\+=|-=|\\+\\+|--)`).test(codigo) || new RegExp(`\\w+\\s*\\([^;]*\\b${esc(b.base)}\\b`).test(codigo);
      if (!(contador || !algumaAtribuicao) || iniciaNaoZero || confere) return;
      out.push({ nivel: "provavel", linha: n.linha, titulo: `Divide por {{${txt(ctx, d)}}}, que começa em **0**`,
        porque: `{{${txt(ctx, d)}}} é um contador (só aumenta com {{++}}/{{+=}}) e começa em 0. Nada aqui confere se ele já é maior que zero.`,
        consequencia: "Pra quem ainda não tem nenhum (ex: nunca morreu), dividir por 0 é **erro de execução**: a função para no meio.",
        quando: "Enquanto o contador for 0.", correcao: `Confira antes: {{${txt(ctx, n.esq)} / (${txt(ctx, d)} > 0 ? ${txt(ctx, d)} : 1)}} ou trate o 0 à parte.`,
        evidencias: [ev(n.linha, "divide pelo contador")], teste: "Use com um jogador novo (contador 0)." });
    });
    return out;
  });

  // SetTimerEx("f", ms, rep, "ii", a) -> o formato pede 2 valores, só 1 foi passado
  regra("settimerex-formato", "sistemas SA-MP", "logica", ctx => {
    const out = [], sim = simbolos(ctx);
    for (const f of funcoesOk(ctx)) for (const c of P().chamadas(f.corpo)) {
      if (!/^(SetTimerEx|CallLocalFunction|CallRemoteFunction)$/.test(c.nome)) continue;
      const iF = c.nome === "SetTimerEx" ? 3 : 1;
      const fmt = c.args[iF] && P().nu(c.args[iF]);
      if (!fmt || fmt.k !== "str") continue;
      const esperados = fmt.v.replace(/[^a-zA-Z]/g, "").length, passados = c.args.length - iF - 1;
      const nomeF = P().nu(c.args[0]);
      const alvo = nomeF && nomeF.k === "str" ? (sim.funcoes.get(nomeF.v) || [])[0] : null;
      const params = alvo ? alvo.params.length : null;
      if (esperados !== passados) out.push({ nivel: "erro", linha: c.linha, titulo: `{{${c.nome}}}: o formato {{"${fmt.v}"}} pede **${esperados}** valor(es), mas foram passados **${passados}**`,
        porque: "Cada letra do formato (i, d, s, f...) corresponde a um valor depois dele. O compilador **não confere** isso.",
        consequencia: passados < esperados ? "Os valores que faltam são lidos de lugar nenhum: a função recebe **lixo** (ou o servidor dá erro)." : "Os valores a mais são ignorados (provavelmente não era isso que você queria).",
        quando: "Toda vez que o timer/função é chamado.", correcao: `Deixe o formato com uma letra por valor${params !== null ? ` (a função {{${nomeF.v}}} recebe ${params})` : ""}.`, teste: "Imprima os parâmetros dentro da função chamada." });
      else if (params !== null && params !== esperados && !alvo.params.some(p => p.variadico)) out.push({ nivel: "provavel", linha: c.linha, titulo: `{{${nomeF.v}}} recebe ${params} parâmetro(s), mas o ${c.nome} manda ${esperados}`,
        porque: `A função (linha ${alvo.linhaNome}) tem ${params} parâmetro(s).`, consequencia: "Os parâmetros chegam trocados ou zerados.", correcao: "Iguale o formato aos parâmetros da função.", teste: "Imprima os parâmetros dentro da função." });
    }
    return out;
  });

  // if sem chaves com a linha de baixo "parecendo" que está dentro dele
  regra("if-sem-chaves-enganoso", "fluxo", "logica", ctx => {
    const out = [];
    const recuo = l => (ctx.linhas[l - 1] || "").match(/^\s*/)[0].replace(/\t/g, "    ").length;
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (!["if", "while", "for"].includes(n.k)) return;
      const corpo = n.k === "if" ? n.entao : n.corpo;
      if (!corpo || corpo.k === "bloco" || n.senao) return;
      const prox = (() => { let achou = null; P().percorrer(f.corpo, b => { if (b.k === "bloco") { const i = b.corpo.indexOf(n); if (i >= 0) achou = b.corpo[i + 1] || null; } }); return achou; })();
      if (!prox || prox.k === "bloco" || corpo.linha === n.linha) return;
      if (recuo(corpo.linha) > recuo(n.linha) && recuo(prox.linha) === recuo(corpo.linha) && prox.linha === corpo.linha + 1) out.push({ nivel: "provavel", linha: prox.linha, titulo: `Essa linha **não** faz parte do {{${n.k}}} (faltam as chaves)`,
        porque: `Sem {{{ }}}, o {{${n.k}}} da linha ${n.linha} controla **só** a linha ${corpo.linha}. A linha ${prox.linha} está com o mesmo recuo, parecendo que está dentro, mas roda **sempre**.`,
        consequencia: "O que devia acontecer só quando a condição é verdadeira acontece toda vez.", quando: "Sempre que a função roda.",
        correcao: `Coloque as chaves: {{${n.k} (...) { linha ${corpo.linha}; linha ${prox.linha}; }}}`, evidencias: [ev(n.linha, n.k + " sem chaves"), ev(corpo.linha, "só esta pertence a ele"), ev(prox.linha, "esta roda sempre")],
        teste: "Chame com a condição falsa e veja esta linha rodar mesmo assim." });
    });
    return out;
  });

  // porcentagem com divisão inteira antes de multiplicar: (xp / total) * 100 dá 0 até completar
  regra("porcentagem-divisao-inteira", "fluxo", "logica", ctx => {
    const out = [];
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "bin" || n.op !== "*") return;
      const [a, b] = [P().nu(n.esq), P().nu(n.dir)];
      const div = a && a.k === "bin" && a.op === "/" ? a : b && b.k === "bin" && b.op === "/" ? b : null;
      const cem = div === a ? b : a;
      if (!div || !cem || cem.k !== "num" || cem.valor !== 100) return;
      if (/Float|float|\./.test(txt(ctx, n))) return;
      out.push({ nivel: "provavel", linha: n.linha, titulo: "Porcentagem com divisão **inteira** antes de multiplicar",
        porque: `{{${txt(ctx, div)}}} é divisão de números inteiros: o resultado é cortado (ex: 30 / 100 = **0**). Multiplicar por 100 depois não recupera.`,
        consequencia: "A porcentagem fica **0%** até chegar no total, e aí pula pra 100%.", quando: "Sempre que o primeiro número é menor que o segundo.",
        correcao: `Multiplique antes: {{(${txt(ctx, div.esq)} * 100) / ${txt(ctx, div.dir)}}}.`, teste: "Calcule com 30 de 100: dá 0." });
    });
    return out;
  });

  // if (x = CONSTANTE): atribuição no lugar de comparação (warning 211)
  regra("atribuicao-na-condicao", "fluxo", "logica", ctx => {
    const out = [], sim = simbolos(ctx);
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (!["if", "while"].includes(n.k) || !n.cond) return;
      P().percorrer(n.cond, c => {
        if (c.k === "chamada") return false;
        if (c.k !== "atrib" || c.op !== "=") return;
        const v = P().nu(c.valor);
        if (!v || !(v.k === "num" || (v.k === "id" && (sim.defines.has(v.nome) || /^[A-Z_][A-Z0-9_]+$/.test(v.nome))))) return;   // if ((x = Funcao())) é de propósito
        out.push({ nivel: "provavel", linha: n.linha, titulo: `{{${txt(ctx, c)}}} **atribui** em vez de comparar`,
          porque: `Um {{=}} só guarda ${txt(ctx, c.valor)} em {{${txt(ctx, c.alvo)}}}; pra comparar é {{==}}.`,
          consequencia: `A condição vale o próprio valor atribuído (${valorConst(v, sim) === 0 ? "0: **nunca** entra" : "diferente de 0: **sempre** entra"}), e {{${txt(ctx, c.alvo)}}} ainda é alterado. O compilador só avisa (**warning 211**).`,
          quando: "Sempre que essa linha roda.", correcao: `Troque por {{${txt(ctx, c.alvo)} == ${txt(ctx, c.valor)}}}.`, compilador: "warning 211",
          correcoes: [{ tipo: "trocar", linha: n.linha, de: new RegExp(`(${esc(txt(ctx, c.alvo))})\\s*=\\s*(${esc(txt(ctx, c.valor))})(?!=)`), para: "$1 == $2" }], seguro: true,
          teste: "Compile: warning 211. E teste com outro valor: entra no if mesmo assim." });
      });
    });
    return out;
  });

  // timer repetido criado em callback que roda várias vezes (spawn, entrar em veículo...) sem guardar o id
  regra("timer-empilhado", "sequência de eventos", "logica", ctx => {
    const out = [];
    const REPETE = /^(OnPlayerSpawn|OnPlayerStateChange|OnPlayerEnterVehicle|OnPlayerDeath|OnPlayerEnterCheckpoint|OnPlayerKeyStateChange|OnDialogResponse|OnPlayerText|OnPlayerCommandText)$/;
    for (const f of funcoesOk(ctx)) {
      if (!REPETE.test(f.nome) && f.tipo !== "comando") continue;
      P().percorrer(f.corpo, n => {
        if (n.k !== "expr") return;
        const c = P().nu(n.e);
        if (!c || c.k !== "chamada" || !/^SetTimer(Ex)?$/.test(c.nome) || !c.args[2]) return;
        const rep = valorConst(c.args[2], simbolos(ctx));
        if (rep !== 1 && txt(ctx, c.args[2]) !== "true") return;
        out.push({ nivel: "provavel", linha: n.linha, titulo: `Timer **repetido** criado a cada ${f.tipo === "comando" ? `/${f.nome}` : f.nome.replace(/^On/, "")} e o id dele não é guardado`,
          porque: `O {{${c.nome}}} repete pra sempre ({{true}}) e o número do timer não vai pra nenhuma variável: ninguém consegue dar {{KillTimer}} nele. E ${f.tipo === "comando" ? "cada uso do comando" : `cada ${f.nome}`} cria **mais um**.`,
          consequencia: "Os timers se acumulam: depois de N vezes, a função roda N vezes por intervalo (ex: N salários por minuto) e continua depois que o jogador sai.",
          quando: `A partir da segunda vez que ${f.tipo === "comando" ? "o comando é usado" : "o callback roda"}.`, correcao: "Guarde o id ({{TimerX[playerid] = SetTimerEx(...)}}), dê {{KillTimer}} antes de criar outro e no {{OnPlayerDisconnect}}.",
          teste: "Coloque um print no timer e dê spawn 3 vezes: ele imprime 3 vezes por intervalo." });
      });
    }
    return out;
  });

  /* ---------- TEXTO ---------- */  /* ---------- TEXTO ---------- */
  regra("strcmp-texto-vazio", "texto", "logica", ctx => {
    const out = [];
    for (const f of funcoesOk(ctx)) for (const c of P().chamadas(f.corpo)) {
      if (c.nome !== "strcmp" || c.args.length < 2) continue;
      const vazio = c.args.slice(0, 2).findIndex(a => P().nu(a) && P().nu(a).k === "str" && P().nu(a).v === "");
      if (vazio < 0) continue;
      const outro = txt(ctx, c.args[1 - vazio]);
      out.push({ nivel: "erro", linha: c.linha, titulo: "{{strcmp}} com **texto vazio** sempre dá \"igual\"",
        porque: "No Pawn o {{strcmp}} devolve **0** sempre que um dos textos está vazio, não importa o outro.",
        consequencia: `{{strcmp(${outro}, "")}} vale 0 com {{${outro}}} vazio **ou cheio**: o if não consegue diferenciar.`,
        quando: "Sempre.", correcao: `Pra saber se está vazio use {{isnull(${outro})}} ou {{!strlen(${outro})}}.`,
        correcoes: [{ tipo: "trocar", linha: c.linha, de: new RegExp(`!\\s*strcmp\\s*\\(\\s*${esc(outro)}\\s*,\\s*""\\s*\\)`), para: `!strlen(${outro})` }], seguro: true,
        teste: "Use o comando COM texto: ele cai no mesmo if de quando está vazio." });
    }
    return out;
  });

  regra("texto-com-igual", "texto", "compilacao", ctx => {
    const out = [], sim = simbolos(ctx);
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "bin" || (n.op !== "==" && n.op !== "!=")) return;
      const [a, b] = [P().nu(n.esq), P().nu(n.dir)];
      const str = a && a.k === "str" ? a : b && b.k === "str" ? b : null;
      if (!str) return;
      const outro = str === a ? n.dir : n.esq;
      const v = nomeSimples(outro);
      const info = v && infoVar(v, f, sim);
      if (v && info && !(info.array || (info.dims && info.dims.length))) return;
      out.push({ nivel: "erro", linha: n.linha, titulo: "Texto comparado com {{" + n.op + "}}",
        porque: "Em Pawn texto é um array de letras: {{==}} não compara o conteúdo.", consequencia: "O compilador para com **error 033: array must be indexed**.",
        quando: "Ao compilar.", correcao: `Use {{${n.op === "==" ? "!" : ""}strcmp(${txt(ctx, outro)}, "${str.v}")}} (o strcmp devolve 0 quando são iguais).`, compilador: "error 033",
        correcoes: [{ tipo: "trocar", linha: n.linha, de: new RegExp(`${esc(txt(ctx, outro))}\\s*${n.op}\\s*"${esc(str.v)}"|"${esc(str.v)}"\\s*${n.op}\\s*${esc(txt(ctx, outro))}`), para: `${n.op === "==" ? "!" : ""}strcmp(${txt(ctx, outro)}, "${str.v}")` }],
        teste: "Compile: error 033." });
    });
    return out;
  });

  regra("format-nao-cabe", "texto", "logica", ctx => {
    const out = [], sim = simbolos(ctx);
    const TAM = { d: 11, i: 11, x: 8, h: 8, c: 1, b: 32, f: 12, o: 11, u: 10 };
    for (const f of funcoesOk(ctx)) for (const c of P().chamadas(f.corpo)) {
      if (c.nome !== "format" || c.args.length < 3) continue;
      const fmt = P().nu(c.args[2]);
      if (!fmt || fmt.k !== "str") continue;
      const dst = nomeSimples(c.args[0]);
      const info = dst && infoVar(dst, f, sim);
      const tam = info && info.tamanhos && info.tamanhos[0];
      if (!tam) continue;
      const fixo = fmt.v.replace(/\\./g, "x").replace(/%%/g, "x").replace(/%[-+ #0]*\d*(\.\d+)?[a-zA-Z]/g, "").length;
      if (fixo >= tam) continue;   // a regra antiga (format-tamanho) já fala desse caso
      let total = fixo, desconhecido = false;
      const partes = [];
      especFormat(fmt.v).forEach((sp, i) => {
        const arg = c.args[3 + i];
        if (sp === "s") {
          const v = arg && nomeSimples(arg), iv = v && infoVar(v, f, sim);
          const t = iv && iv.tamanhos ? iv.tamanhos[0] : null;
          if (t) { total += t - 1; partes.push(`{{${v}}} até ${t - 1}`); } else desconhecido = true;
        } else if (TAM[sp.toLowerCase()]) { const m = sp === "f" ? 8 : TAM[sp.toLowerCase()]; total += m; partes.push(`{{%${sp}}} até ${m}`); }
      });
      if (total <= tam - 1) continue;
      // estimativa "normal": nome de ~16 letras, números de 4 dígitos, float com 2 casas
      const larguras = [...fmt.v.matchAll(/%[-+ #0]*(\d*)(?:\.\d+)?([a-zA-Z])/g)].map(m => +m[1] || 0);
      const realista = fixo + especFormat(fmt.v).reduce((s, sp, i) => s + (larguras[i] || 0) + (larguras[i] ? 0 : sp === "s" ? (() => { const v = nomeSimples(c.args[3 + i]); const iv = v && infoVar(v, f, sim); return iv && iv.tamanhos && iv.tamanhos[0] ? Math.min(iv.tamanhos[0] - 1, 16) : 0; })() : /[diu]/.test(sp) ? 4 : sp === "f" ? 6 : 1), 0);
      // só os números no pior caso (ex: -2147483648) não bastam pra avisar: precisa de um texto (%s) grande ou do caso normal já não caber
      const sGrande = especFormat(fmt.v).some((sp, i) => { if (sp !== "s") return false; const v = nomeSimples(c.args[3 + i]); const iv = v && infoVar(v, f, sim); return iv && iv.tamanhos && iv.tamanhos[0] && fixo + iv.tamanhos[0] - 1 > tam - 1; });
      if (realista <= tam - 1 && !sGrande) continue;
      out.push({ nivel: realista > tam - 1 ? "provavel" : "verificar", linha: c.linha, titulo: `{{${dst}[${tam}]}} pode ser **pequeno** pra esse texto`,
        porque: `O texto fixo tem ${fixo} letras${partes.length ? ` e os valores podem ocupar mais (${partes.slice(0, 4).join(", ")})` : ""}: até **${total}** letras${desconhecido ? " (sem contar textos de tamanho desconhecido)" : ""}, e {{${dst}}} guarda ${tam - 1}.`,
        consequencia: "O format não estoura (ele respeita o tamanho), mas a mensagem sai **cortada** no final.",
        quando: realista > tam - 1 ? "Com valores normais (nomes e números comuns)." : "Com nomes compridos ou números grandes.",
        correcao: `Aumente: {{new ${dst}[${Math.min(144, Math.ceil((total + 1) / 16) * 16)}]}}.`, teste: "Teste com um nome de 24 letras e dinheiro alto." });
    }
    return out;
  });

  /* ---------- DESEMPENHO ---------- */
  // funções "quentes": rodam muitas vezes por segundo
  function quentes(ctx) {
    const sim = simbolos(ctx);
    const q = new Map([["OnPlayerUpdate", "a cada atualização do jogador (~30x por segundo por jogador)"]]);
    for (const f of funcoesOk(ctx)) for (const c of P().chamadas(f.corpo)) {
      if (!/^SetTimer(Ex)?$/.test(c.nome) || c.args.length < 3) continue;
      const nome = P().nu(c.args[0]), ms = valorConst(c.args[1], sim), rep = valorConst(c.args[2], sim);
      if (nome && nome.k === "str" && ms !== null && ms <= 1000 && rep === 1) q.set(nome.v, `a cada ${ms} ms (timer)`);
    }
    return q;
  }
  regra("trabalho-pesado-em-callback-rapido", "desempenho", "desempenho", ctx => {
    const out = [], ef = efeitos(ctx), q = quentes(ctx);
    for (const f of funcoesOk(ctx)) {
      const freq = q.get(f.nome);
      if (!freq) continue;
      for (const c of P().chamadas(f.corpo)) {
        const t = ef.total.get(c.nome);
        if (/^(DOF2_SaveFile|DOF2_Set\w*|fopen|fwrite|fread|db_query|mysql_query|INI_Open|INI_Write\w*|dini_\w+)$/.test(c.nome) || (t && t.salva && c.nome !== f.nome)) {
          out.push({ nivel: "provavel", linha: c.linha, titulo: `Lê/grava arquivo ou banco ${freq}`,
            porque: `{{${c.nome}}} mexe no disco/banco e está dentro de {{${f.nome}}}, que roda ${freq}.`, consequencia: "Com vários jogadores isso vira centenas de gravações por segundo: o servidor **trava** (lag geral).",
            quando: "Sempre que o servidor tem jogadores.", correcao: "Guarde na variável e salve só quando precisa (ao sair, num timer de minutos, ou quando o valor muda de verdade).", teste: "Com 20 jogadores, meça o tempo do OnPlayerUpdate (ou veja o lag subir)." });
          break;
        }
      }
      P().percorrer(f.corpo, n => {
        if (!["for", "foreach"].includes(n.k)) return;
        const ehTodos = s => s.k === "foreach" ? /Player/.test(s.iter) : s.cond && /MAX_PLAYERS|GetPlayerPoolSize|GetMaxPlayers/.test(txt(ctx, s.cond));
        if (!ehTodos(n)) return;
        let dentro = null;
        P().percorrer(n.corpo, m => { if (!dentro && ["for", "foreach"].includes(m.k) && ehTodos(m)) dentro = m; });
        if (!dentro && f.nome === "OnPlayerUpdate") { out.push({ nivel: "provavel", linha: n.linha, titulo: "Loop de **todos os jogadores** dentro do {{OnPlayerUpdate}}",
          porque: "O {{OnPlayerUpdate}} roda ~30 vezes por segundo **pra cada jogador**. Um loop por todos os jogadores aqui vira jogadores × jogadores × 30 por segundo.",
          consequencia: "Com o servidor cheio, isso consome a CPU toda (lag geral). Mandar mensagens/GameText daqui também inunda os jogadores.",
          quando: "Sempre que tem jogadores online.", correcao: "Mova isso pra um timer (ex: a cada 1 s) ou faça só pro próprio {{playerid}}.", teste: "Meça o tempo do OnPlayerUpdate com vários jogadores." }); return false; }
        if (dentro) { out.push({ nivel: "provavel", linha: dentro.linha, titulo: `Loop de todos os jogadores **dentro** de outro, ${freq}`,
          porque: `São dois loops de jogadores um dentro do outro (jogadores × jogadores) rodando ${freq}.`, consequencia: "Com MAX_PLAYERS = 1000 são até **1 milhão** de voltas a cada vez: o servidor engasga.",
          quando: "Sempre que o timer/callback roda.", correcao: "Use {{foreach (new i : Player)}} (só quem está online), diminua a frequência do timer, ou use áreas (streamer) em vez de comparar todo mundo com todo mundo.", teste: "Meça quanto tempo a função leva (GetTickCount antes/depois)." }); return false; }
      });
    }
    return out;
  });

  regra("strlen-no-loop", "desempenho", "desempenho", ctx => {
    const out = [], q = quentes(ctx);
    for (const f of funcoesOk(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "for" || !n.cond) return;
      const c = P().chamadas(n.cond).find(x => x.nome === "strlen");
      if (!c) return;
      const s = txt(ctx, c.args[0] || c);
      let muda = false;
      P().percorrer(n.corpo, m => { if (m.k === "chamada" && /^(strdel|strins|strcat|format|strmid|strpack|strunpack)$/.test(m.nome) && m.args[0] && txt(ctx, m.args[0]) === s) muda = true; });
      if (muda) return;
      const quente = q.get(f.nome) || (/^(OnPlayerText|OnPlayerCommandText)$/.test(f.nome) ? "a cada mensagem/comando" : null);
      out.push({ nivel: quente ? "provavel" : "verificar", linha: n.linha, titulo: "{{strlen}} é recalculado a **cada volta** do loop",
        porque: `A condição do for chama {{strlen(${s})}}, que conta as letras do começo ao fim **toda volta**.${quente ? ` E isso roda ${quente}.` : ""}`,
        consequencia: "Um texto de 100 letras faz 100 × 100 = 10 mil passos em vez de 100. É desperdício que cresce rápido.",
        quando: quente ? "Sempre." : "Com textos grandes.", correcao: `Guarde antes: {{for (new i = 0, tam = strlen(${s}); i < tam; i++)}}`,
        correcoes: [{ tipo: "trocar", linha: n.linha, de: new RegExp(`for\\s*\\(\\s*new\\s+(\\w+)\\s*=\\s*0\\s*;\\s*\\1\\s*<\\s*strlen\\s*\\(\\s*${esc(s)}\\s*\\)\\s*;`), para: `for (new $1 = 0, tam_${s.replace(/\W/g, "")} = strlen(${s}); $1 < tam_${s.replace(/\W/g, "")};` }], seguro: true,
        teste: "Meça com GetTickCount um texto de 128 letras." });
    });
    return out;
  });

  /* ================= INVESTIGAÇÃO: SISTEMAS DO JOGADOR (checklist) ================= */
  function investigarEstado(ctx) {
    if (!ctx.ast) return null;
    const sim = simbolos(ctx), ef = efeitos(ctx), fs = funcoesOk(ctx);
    const arrs = arraysPorJogador(sim);
    if (!arrs.length) return null;
    const con = fs.find(f => f.nome === "OnPlayerConnect"), des = fs.find(f => f.nome === "OnPlayerDisconnect"), morte = fs.find(f => f.nome === "OnPlayerDeath");
    const itens = [];
    const zeraCon = con && ef.total.get(con.nome).zera, zeraDes = des && ef.total.get(des.nome).zera;
    itens.push(con || des ? ([...arrs].every(g => (zeraCon && zeraCon.has(g.nome)) || (zeraDes && zeraDes.has(g.nome))) ? ["ok", "Os dados por jogador são zerados ao entrar/sair."] : ["atencao", "Nem todos os dados por jogador são zerados ao entrar/sair (veja **dados herdados**)."]) : ["depende", "Não vi {{OnPlayerConnect}}/{{OnPlayerDisconnect}} neste código."]);
    const salva = [...ef.direto].filter(([, e]) => e.salva).map(([n]) => n);
    itens.push(salva.length ? ["ok", `Tem salvamento: ${salva.slice(0, 3).map(n => `{{${n}}}`).join(", ")}.`] : ["depende", "Não vi salvamento (DOF2/MySQL/INI) neste código."]);
    if (des) itens.push((ef.total.get(des.nome) || {}).salva ? ["ok", "Salva quando o jogador sai."] : ["depende", "O {{OnPlayerDisconnect}} não salva (talvez salve em outro lugar, ou num timer)."]);
    itens.push(morte ? ["ok", "Trata a morte ({{OnPlayerDeath}})."] : ["depende", "Não vi {{OnPlayerDeath}}: estados de atividade podem ficar presos se o jogador morrer."]);
    const timers = [];
    for (const f of fs) P().percorrer(f.corpo, n => { if (n.k === "atrib" && P().nu(n.valor) && P().nu(n.valor).k === "chamada" && P().nu(n.valor).nome === "SetTimerEx") timers.push(n); });
    if (timers.length) itens.push(des && timers.every(t => { const b = P().baseDe(t.alvo); return b && ef.total.get(des.nome).mataTimer.has(b.base); }) ? ["ok", "Os timers por jogador são desligados quando ele sai."] : ["atencao", "Tem timer por jogador que não é desligado quando ele sai."]);
    return { titulo: "Ciclo de vida do jogador (entrar → jogar → morrer → sair)", linha: (con || des || arrs[0]).linha || 1, itens };
  }

  return { regras: R, chegaNoFimSemRetorno, simbolos, valorConst, executar, resumos, efeitos, investigarEstado, especFormat, especSscanf };
})();

WCDEV.analiseFluxo = AnaliseFluxo;
// as regras novas entram na mesma lista do analisador (mesma validação, relatório e correção)
if (WCDEV.analisador) WCDEV.analisador.regras.pawn.push(...AnaliseFluxo.regras);
