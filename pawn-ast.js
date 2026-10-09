/* =========================================================
   WC DEV — PARSER DE PAWN (tokens → árvore sintática → fluxo)

   Por que existe: regras por expressão regular olham TEXTO. Bugs de
   fluxo (um caminho do if que não retorna, um valor digitado pelo
   jogador que passa por 3 variáveis até virar índice de array, salvar
   DEPOIS de zerar) precisam da ESTRUTURA do código.

   O que tem aqui:
     tokenizar(codigo)        → tokens com linha e posição
     analisarSintaxe(codigo)  → árvore (funções, comandos, variáveis, enums...)
     sempreRetorna / terminaFluxo / percorrer / variaveisLidas / baseDe ...
     fatosDaCondicao(cond)    → o que uma condição garante (limites, conectado, não vazio)

   É tolerante: se um trecho não der pra entender (macro estranha, código
   pela metade), ele marca aquele pedaço como "desconhecido" e continua.
   Quem usa a árvore tem que respeitar isso (função com parcial=true não
   pode gerar conclusão "confirmada").
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const PawnAST = (() => {
  /* ================= TOKENS ================= */
  const OPS = [">>>=", "...", "<<=", ">>=", ">>>", "==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<", ">>", "..", "::"];
  function tokenizar(codigo) {
    const toks = [];
    const n = codigo.length;
    let i = 0, linha = 1, esp = false, nl = true;
    const push = (t, v, ini) => { toks.push({ t, v, ini, fim: i, linha: linhaIni, esp, nl }); esp = false; nl = false; };
    let linhaIni = 1;
    while (i < n) {
      const c = codigo[i], d = codigo[i + 1];
      if (c === "\n") { linha++; i++; esp = true; nl = true; continue; }
      if (c === " " || c === "\t" || c === "\r" || c === "\f" || c === "\v") { i++; esp = true; continue; }
      if (c === "/" && d === "/") { while (i < n && codigo[i] !== "\n") i++; esp = true; continue; }
      if (c === "/" && d === "*") { i += 2; while (i < n && !(codigo[i] === "*" && codigo[i + 1] === "/")) { if (codigo[i] === "\n") { linha++; nl = true; } i++; } i += 2; esp = true; continue; }
      linhaIni = linha;
      const ini = i;
      // diretiva do pré-processador: a linha inteira (com continuação "\")
      if (c === "#" && nl) {
        while (i < n && codigo[i] !== "\n") { if (codigo[i] === "\\" && codigo[i + 1] === "\n") { i += 2; linha++; continue; } if (codigo[i] === "/" && codigo[i + 1] === "/") break; if (codigo[i] === "/" && codigo[i + 1] === "*") { const f = codigo.indexOf("*/", i + 2); const fimC = f < 0 ? n : f + 2; for (let k = i; k < fimC; k++) if (codigo[k] === "\n") linha++; i = fimC; continue; } i++; }
        const v = codigo.slice(ini, i);
        push("pre", v, ini);
        toks[toks.length - 1].nome = (v.match(/^#\s*(\w+)/) || [])[1] || "";
        continue;
      }
      if (c === '"') {
        i++;
        while (i < n && codigo[i] !== '"' && codigo[i] !== "\n") { if (codigo[i] === "\\" && i + 1 < n && codigo[i + 1] !== "\n") i++; i++; }
        if (codigo[i] === '"') i++;
        push("str", codigo.slice(ini + 1, Math.max(ini + 1, i - 1)), ini);
        continue;
      }
      if (c === "'") {
        i++;
        while (i < n && codigo[i] !== "'" && codigo[i] !== "\n") { if (codigo[i] === "\\") i++; i++; }
        if (codigo[i] === "'") i++;
        push("chr", codigo.slice(ini + 1, i - 1), ini);
        continue;
      }
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(d || ""))) {
        const m = codigo.slice(i).match(/^(0x[0-9a-fA-F_]+|0b[01_]+|[0-9][0-9_]*(\.[0-9_]+)?([eE][+-]?[0-9]+)?|\.[0-9]+)/);
        i += m[0].length;
        push("num", m[0], ini);
        continue;
      }
      if (/[A-Za-z_@]/.test(c)) {
        const m = codigo.slice(i, i + 200).match(/^[A-Za-z_@][\w@]*/);
        i += m[0].length;
        push("id", m[0], ini);
        continue;
      }
      let op = null;
      for (const o of OPS) if (codigo.startsWith(o, i)) { op = o; break; }
      if (!op) op = c;
      i += op.length;
      push("op", op, ini);
    }
    toks.push({ t: "fim", v: "", ini: n, fim: n, linha, esp: true, nl: true });
    return toks;
  }

  /* ================= PARSER ================= */
  const MODIFICADORES = new Set(["public", "stock", "static", "hook", "ptask", "task", "timer", "remotefunc", "foreign", "global", "inline", "const"]);
  const PREFIXO_CMD = /^(CMD|cmd|COMMAND|command|YCMD|ycmd|CMD_|Cmd)$/;
  const PALAVRAS = new Set(["if", "else", "while", "do", "for", "foreach", "switch", "case", "default", "return", "break", "continue", "goto", "new", "static", "const", "sizeof", "tagof", "defined", "enum", "forward", "native", "public", "stock", "state", "sleep", "exit", "assert", "char"]);

  function analisarSintaxe(codigo) {
    const toks = tokenizar(codigo);
    let p = 0;
    const T = () => toks[p], P = (k = 1) => toks[Math.min(p + k, toks.length - 1)];
    const eh = (v, t) => toks[p].v === v && (!t || toks[p].t === t) && toks[p].t !== "str" && toks[p].t !== "chr";
    const ehOp = v => toks[p].t === "op" && toks[p].v === v;
    const come = v => { if (ehOp(v) || (toks[p].t === "id" && toks[p].v === v)) { p++; return true; } return false; };
    const prog = { includes: [], defines: [], enums: [], globais: [], funcoes: [], prototipos: [], diretivas: [], erros: [], solto: [], tokens: toks, codigo };
    let profFalha = 0;
    const erro = (msg, tok) => { if (prog.erros.length < 40) prog.erros.push({ msg, linha: (tok || T()).linha }); };

    // pula até o fim do comando (;) ou de um bloco balanceado, no mesmo nível
    function pular(ateBloco) {
      let prof = 0;
      while (T().t !== "fim") {
        const v = T().t === "op" ? T().v : null;
        if (v === "{" || v === "(" || v === "[") prof++;
        else if (v === "}" || v === ")" || v === "]") { if (prof === 0) return; prof--; if (prof === 0 && v === "}" && ateBloco) { p++; return; } }
        else if (v === ";" && prof === 0) { p++; return; }
        p++;
      }
    }

    /* ---------- expressões (Pratt) ---------- */
    // precedência do Pawn: os bit a bit (& ^ |) ficam ACIMA das comparações (diferente do C)
    const BIN = { "*": 12, "/": 12, "%": 12, "+": 11, "-": 11, "<<": 10, ">>": 10, ">>>": 10, "&": 9, "^": 8, "|": 7, "<": 6, "<=": 6, ">": 6, ">=": 6, "==": 5, "!=": 5, "&&": 4, "||": 3 };
    const ATRIB = new Set(["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>=", ">>>="]);
    let ternario = 0;
    function no(k, ini, extra) { return Object.assign({ k, ini: ini.ini, linha: ini.linha, fim: toks[Math.max(0, p - 1)].fim }, extra); }
    function expr(minPrec = 0) {
      const ini = T();
      let esq = prefixo();
      for (;;) {
        const t = T();
        if (t.t !== "op") break;
        const v = t.v;
        if (ATRIB.has(v) && minPrec <= 1) { p++; const dir = expr(1); esq = no("atrib", ini, { op: v, alvo: esq, valor: dir }); continue; }
        if (v === "?" && minPrec <= 2) { p++; ternario++; const a = expr(0); ternario--; come(":"); const b = expr(2); esq = no("ternario", ini, { cond: esq, sim: a, nao: b }); continue; }
        const prec = BIN[v];
        if (!prec || prec < minPrec || prec <= 2) break;
        p++;
        const dir = expr(prec + 1);
        esq = no("bin", ini, { op: v, esq, dir });
      }
      return esq;
    }
    function prefixo() {
      const t = T();
      if (t.t === "op") {
        if (["-", "+", "!", "~"].includes(t.v)) { p++; const e = expr(13); return no("un", t, { op: t.v, e }); }
        if (t.v === "++" || t.v === "--") { p++; const e = expr(13); return no("pre", t, { op: t.v, e }); }
        if (t.v === "(") { p++; const e = expr(0); come(")"); return posfixo(no("par", t, { e }), t); }
        if (t.v === "{") {   // array literal {1, 2, ...}
          p++; const itens = [];
          while (!ehOp("}") && T().t !== "fim") { if (ehOp("...")) { p++; itens.push(no("reticencias", T())); } else itens.push(expr(2)); if (!come(",")) break; }
          come("}"); return no("lista", t, { itens });
        }
        if (t.v === "...") { p++; return no("reticencias", t); }
        if (t.v === "." && P().t === "id") { p += 2; come("="); const v = expr(2); return no("nomeado", t, { nome: toks[p - 1].v, valor: v }); }
        erro(`expressão inesperada: "${t.v}"`, t);
        p++;
        return no("erro", t);
      }
      if (t.t === "num") { p++; return posfixo(no("num", t, { v: t.v, valor: numero(t.v) }), t); }
      if (t.t === "str") { p++; let v = t.v; while (T().t === "str") { v += T().v; p++; } return no("str", t, { v }); }
      if (t.t === "chr") { p++; return no("num", t, { v: "'" + t.v + "'", valor: t.v.length === 1 ? t.v.charCodeAt(0) : null }); }
      if (t.t === "id") {
        if (t.v === "sizeof" || t.v === "tagof" || t.v === "defined") {
          p++;
          const par = come("(");
          const alvo = T(); let nome = alvo.v; p++;
          let dims = 0;
          while (ehOp("[")) { p++; while (!ehOp("]") && T().t !== "fim") p++; come("]"); dims++; }
          if (ehOp(":") && P().t === "id") { p += 2; }
          if (par) come(")");
          return no(t.v, t, { nome, dims });
        }
        // tag: Float:x  (sem espaço antes do ":")
        if (P().t === "op" && P().v === ":" && !P().esp && (ternario === 0 || /^(Float|bool|File|Text|PlayerText|Text3D|PlayerText3D|DB|DBResult|_|[A-Z]\w*)$/.test(t.v)) && !(P(2).t === "op" && [")", ",", ";"].includes(P(2).v))) {
          p += 2;
          const e = expr(13);
          return no("tag", t, { tag: t.v, e });
        }
        p++;
        return posfixo(no("id", t, { nome: t.v }), t);
      }
      erro("fim inesperado", t);
      return no("erro", t);
    }
    function posfixo(e, ini) {
      for (;;) {
        if (ehOp("(") && e.k === "id") {
          p++; const args = [];
          while (!ehOp(")") && T().t !== "fim") {
            if (ehOp(",")) { args.push(no("vazio", T())); p++; continue; }   // argumento pulado: f(a, , c)
            args.push(expr(2));
            if (!come(",")) break;
          }
          come(")");
          e = no("chamada", ini, { nome: e.nome, args });
          continue;
        }
        if (ehOp("[")) { p++; const i = ehOp("]") ? null : expr(0); come("]"); e = no("indice", ini, { base: e, i }); continue; }
        if (ehOp("++") || ehOp("--")) { const op = T().v; p++; e = no("pos", ini, { op, e }); continue; }
        if (T().t === "id" && T().v === "char" && !T().nl) { p++; continue; }
        break;
      }
      return e;
    }
    function numero(v) {
      v = v.replace(/_/g, "");
      if (/^0x/i.test(v)) return parseInt(v, 16);
      if (/^0b/i.test(v)) return parseInt(v.slice(2), 2);
      return Number(v);
    }

    /* ---------- declarações de variável ---------- */
    function declaracao(estatico) {
      // depois de new/static/const
      const vars = [];
      for (;;) {
        const ini = T();
        if (eh("const", "id")) p++;
        let tag = "";
        if (T().t === "id" && P().t === "op" && P().v === ":") { tag = T().v; p += 2; }
        else if (ehOp("{")) { while (!ehOp("}") && T().t !== "fim") p++; p++; come(":"); tag = "multi"; }
        if (T().t !== "id") { erro("esperava o nome da variável", T()); pular(); return { k: "decl", vars, estatico, linha: ini.linha, ini: ini.ini, fim: T().ini }; }
        const nomeTok = T(); p++;
        const dims = [];
        while (ehOp("[")) { p++; dims.push(ehOp("]") ? null : expr(0)); come("]"); }
        let init = null;
        if (ehOp("=")) { p++; init = expr(2); }
        vars.push({ nome: nomeTok.v, tag, dims, init, linha: nomeTok.linha, ini: nomeTok.ini });
        if (!come(",")) break;
      }
      const fim = T().ini;
      if (!come(";") && !T().nl && !ehOp("}") && !ehOp(")")) erro('faltou ";" depois da declaração', T());
      return { k: "decl", vars, estatico, linha: vars[0] ? vars[0].linha : T().linha, ini: vars[0] ? vars[0].ini : fim, fim };
    }

    /* ---------- comandos (statements) ---------- */
    function bloco() {
      const ini = T();
      come("{");
      const corpo = [];
      while (!ehOp("}") && T().t !== "fim") {
        const antes = p;
        corpo.push(comando());
        if (p === antes) p++;   // nunca trava
      }
      const fimTok = T();
      come("}");
      return { k: "bloco", corpo, linha: ini.linha, ini: ini.ini, fim: fimTok.fim, linhaFim: fimTok.linha };
    }
    function condicao() { come("("); const c = ehOp(")") ? null : expr(0); come(")"); return c; }
    function fimDeComando() { if (!come(";") && !T().nl && !ehOp("}") && T().t !== "fim") { erro('faltou ";"', T()); } }
    function comando() {
      const t = T();
      if (t.t === "pre") { p++; prog.diretivas.push(t); return { k: "diretiva", v: t.v, linha: t.linha, ini: t.ini, fim: t.fim }; }
      if (t.t === "op") {
        if (t.v === "{") return bloco();
        if (t.v === ";") { p++; return { k: "vazio", linha: t.linha, ini: t.ini, fim: t.fim }; }
      }
      if (t.t === "id") {
        switch (t.v) {
          case "new": case "static": { p++; if (t.v === "static" && eh("new")) p++; return declaracao(t.v === "static"); }
          case "if": {
            p++; const cond = condicao(); const entao = comando();
            let senao = null;
            if (eh("else", "id")) { p++; senao = comando(); }
            return { k: "if", cond, entao, senao, linha: t.linha, ini: t.ini, fim: toks[p - 1].fim };
          }
          case "while": { p++; const cond = condicao(); const corpo = comando(); return { k: "while", cond, corpo, linha: t.linha, ini: t.ini, fim: toks[p - 1].fim }; }
          case "do": { p++; const corpo = comando(); come("while"); const cond = condicao(); fimDeComando(); return { k: "do", corpo, cond, linha: t.linha, ini: t.ini, fim: toks[p - 1].fim }; }
          case "for": {
            p++; come("(");
            let init = null, cond = null, passo = [];
            if (eh("new", "id")) { p++; init = declaracao(false); if (toks[p - 1].v !== ";") come(";"); }
            else { const lista = []; while (!ehOp(";") && T().t !== "fim") { lista.push(expr(2)); if (!come(",")) break; } come(";"); init = { k: "exprs", lista }; }
            if (!ehOp(";")) cond = expr(0);
            come(";");
            while (!ehOp(")") && T().t !== "fim") { passo.push(expr(2)); if (!come(",")) break; }
            come(")");
            const corpo = comando();
            return { k: "for", init, cond, passo, corpo, linha: t.linha, ini: t.ini, fim: toks[p - 1].fim };
          }
          case "foreach": {
            p++; come("("); if (eh("new", "id")) p++;
            if (T().t === "id" && P().v === ":" && P(2).t === "id" && P(3).v === ":") p += 2;   // tag
            const v = T().v; p++; come(":"); const iter = T().v; p++;
            while (!ehOp(")") && T().t !== "fim") p++;
            come(")");
            const corpo = comando();
            return { k: "foreach", var: v, iter, corpo, linha: t.linha, ini: t.ini, fim: toks[p - 1].fim };
          }
          case "switch": {
            p++; const e = condicao(); come("{");
            const casos = [];
            while (!ehOp("}") && T().t !== "fim") {
              const ct = T();
              if (eh("case", "id")) {
                p++; const valores = [];
                while (!ehOp(":") && T().t !== "fim") { const a = expr(3); if (ehOp("..")) { p++; valores.push({ k: "faixa", de: a, ate: expr(3) }); } else valores.push(a); if (!come(",")) break; }
                come(":");
                casos.push({ valores, corpo: comando(), linha: ct.linha });
              } else if (eh("default", "id")) { p++; come(":"); casos.push({ padrao: true, valores: [], corpo: comando(), linha: ct.linha }); }
              else { const antes = p; comando(); if (p === antes) p++; }
            }
            come("}");
            return { k: "switch", e, casos, linha: t.linha, ini: t.ini, fim: toks[p - 1].fim };
          }
          case "return": { p++; let e = null; if (!ehOp(";") && !ehOp("}") && !T().nl) e = expr(0); else if (!ehOp(";") && !ehOp("}") && T().nl && !(T().t === "id" && PALAVRAS.has(T().v))) e = expr(0); fimDeComando(); return { k: "return", e, linha: t.linha, ini: t.ini, fim: toks[p - 1].fim }; }
          case "break": case "continue": { p++; fimDeComando(); return { k: t.v, linha: t.linha, ini: t.ini, fim: toks[p - 1].fim }; }
          case "goto": { p++; const r = T().v; p++; fimDeComando(); return { k: "goto", rotulo: r, linha: t.linha, ini: t.ini, fim: toks[p - 1].fim }; }
          case "else": { erro('"else" sem "if"', t); p++; return { k: "desconhecido", linha: t.linha, ini: t.ini, fim: t.fim }; }
        }
        // rótulo: nome:   (só quando não é tag de expressão)
        if (P().t === "op" && P().v === ":" && P(2).nl && !/^[A-Z]/.test(t.v)) { p += 2; return { k: "rotulo", nome: t.v, linha: t.linha, ini: t.ini, fim: t.fim }; }
      }
      const ini = T();
      const antesErros = prog.erros.length;
      const e = expr(0);
      if (e.k === "erro") { pular(); return { k: "desconhecido", linha: ini.linha, ini: ini.ini, fim: toks[Math.max(0, p - 1)].fim }; }
      fimDeComando();
      return { k: "expr", e, linha: ini.linha, ini: ini.ini, fim: toks[Math.max(0, p - 1)].fim, suspeito: prog.erros.length > antesErros };
    }

    /* ---------- parâmetros de função ---------- */
    function parametros() {
      const lista = [];
      come("(");
      while (!ehOp(")") && T().t !== "fim") {
        const ini = T();
        let ref = false, tag = "", constante = false;
        if (eh("const", "id")) { constante = true; p++; }
        if (ehOp("&")) { ref = true; p++; }
        if (ehOp("{")) { while (!ehOp("}") && T().t !== "fim") p++; p++; come(":"); tag = "multi"; }
        else if (T().t === "id" && P().t === "op" && P().v === ":") { tag = T().v; p += 2; }
        if (ehOp("&")) { ref = true; p++; }
        if (ehOp("...")) { p++; lista.push({ nome: "...", variadico: true, tag, linha: ini.linha }); }
        else if (T().t === "id") {
          const nome = T().v; p++;
          let dims = 0;
          while (ehOp("[")) { p++; while (!ehOp("]") && T().t !== "fim") p++; come("]"); dims++; }
          let padrao = null;
          if (ehOp("=")) { p++; const ip = p; let prof = 0; while (T().t !== "fim" && !(prof === 0 && (ehOp(",") || ehOp(")")))) { if (ehOp("(") || ehOp("[") || ehOp("{")) prof++; if (ehOp(")") || ehOp("]") || ehOp("}")) prof--; p++; } padrao = toks.slice(ip, p).map(x => x.v).join(""); }
          lista.push({ nome, tag, ref, constante, array: dims > 0, dims, padrao, linha: ini.linha });
        } else { p++; continue; }
        if (!come(",")) break;
      }
      come(")");
      return lista;
    }

    /* ---------- nível de cima do arquivo ---------- */
    function topo() {
      const t = T();
      if (t.t === "pre") {
        p++;
        prog.diretivas.push(t);
        let m;
        if ((m = t.v.match(/^#\s*(?:include|tryinclude)\s*([<"])([^>"]+)[>"]/))) prog.includes.push({ nome: m[2].trim(), sistema: m[1] === "<", linha: t.linha, tentativa: /tryinclude/.test(t.v), ini: t.ini });
        else if ((m = t.v.match(/^#\s*define\s+([A-Za-z_@][\w@]*)(\(|\s|$)(.*)$/s))) prog.defines.push({ nome: m[1], macro: m[2] === "(" || /%\d/.test(t.v), valor: (m[3] || "").trim(), linha: t.linha });
        else if ((m = t.v.match(/^#\s*define\s+([A-Za-z_@][\w@]*):/))) prog.defines.push({ nome: m[1], macro: true, prefixo: true, valor: t.v, linha: t.linha });
        else if ((m = t.v.match(/^#\s*undef\s+([A-Za-z_@][\w@]*)/))) (prog.undefs = prog.undefs || []).push({ nome: m[1], linha: t.linha });
        return;
      }
      if (t.t === "op" && t.v === ";") { p++; return; }
      // trecho solto (o miolo de uma função colado sem o cabeçalho): vira uma função "(trecho)"
      if (pareceComandoSolto()) { const antes = p; prog.solto.push(comando()); if (p === antes) p++; return; }
      if (t.t !== "id") { erro(`"${t.v}" fora de função`, t); p++; pular(true); return; }
      if (t.v === "enum") {
        p++;
        let nome = null, tag = "";
        if (T().t === "id" && P().v === ":" ) { tag = T().v; p += 2; }
        if (T().t === "id") { nome = T().v; p++; }
        if (ehOp("(")) { while (!ehOp(")") && T().t !== "fim") p++; p++; }
        const membros = [];
        if (come("{")) {
          while (!ehOp("}") && T().t !== "fim") {
            let mtag = "";
            if (T().t === "id" && P().v === ":" && P(2).t === "id") { mtag = T().v; p += 2; }
            if (T().t === "id") {
              const mt = T(); p++;
              let tamanho = null;
              if (ehOp("[")) { p++; tamanho = ehOp("]") ? null : expr(0); come("]"); }
              if (ehOp("=")) { p++; expr(2); }
              membros.push({ nome: mt.v, tag: mtag, tamanho, linha: mt.linha });
            } else p++;
            come(",");
          }
          come("}");
        }
        come(";");
        prog.enums.push({ nome, tag, membros, linha: t.linha });
        return;
      }
      if (t.v === "forward" || t.v === "native") {
        p++;
        const ini = p;
        let tag = "";
        if (T().t === "id" && P().v === ":") { tag = T().v; p += 2; }
        const nome = T().v; p++;
        const params = ehOp("(") ? parametros() : [];
        while (!ehOp(";") && T().t !== "fim" && !T().nl) p++;
        come(";");
        prog.prototipos.push({ tipo: t.v, nome, tag, params, linha: t.linha });
        void ini;
        return;
      }
      // variáveis globais (new / static / const sem parênteses depois do nome)
      if (t.v === "new" || ((t.v === "static" || t.v === "const") && !ehFuncaoAFrente())) {
        p++;
        if (eh("const", "id")) p++;
        const d = declaracao(t.v === "static");
        d.vars.forEach(v => prog.globais.push({ ...v, estatico: t.v === "static", constante: t.v === "const" }));
        return;
      }
      // função
      const iniTok = T();
      const mods = [];
      while (T().t === "id" && MODIFICADORES.has(T().v) && !(P().v === "(" )) { mods.push(T().v); p++; }
      let tag = "", prefixo = "";
      if (T().t === "id" && P().t === "op" && P().v === ":" && P(2).t === "id") {
        if (PREFIXO_CMD.test(T().v) || /^(Dialog|dialog|DIALOG)$/.test(T().v)) prefixo = T().v; else tag = T().v;
        p += 2;
      }
      if (T().t !== "id" || !(P().t === "op" && P().v === "(")) { erro(`não entendi "${T().v}" aqui`, T()); pular(true); return; }
      const nomeTok = T(); p++;
      const params = parametros();
      if (ehOp(";")) { p++; prog.prototipos.push({ tipo: "prototipo", nome: nomeTok.v, tag, params, linha: nomeTok.linha }); return; }
      const errosAntes = prog.erros.length;
      let corpo;
      if (ehOp("{")) corpo = bloco();
      else {
        // função de um comando só: stock Dobro(n) return n * 2;
        const ini = T();
        const s = comando();
        corpo = { k: "bloco", corpo: [s], linha: ini.linha, ini: ini.ini, fim: s.fim, linhaFim: toks[Math.max(0, p - 1)].linha };
      }
      const cmd = PREFIXO_CMD.test(prefixo);
      prog.funcoes.push({
        nome: nomeTok.v, tag, prefixo, mods, params, corpo,
        tipo: cmd ? "comando" : /^dialog$/i.test(prefixo) ? "dialog" : mods.includes("public") ? "public" : mods.includes("stock") ? "stock" : mods.includes("static") ? "static" : mods.includes("hook") ? "hook" : "funcao",
        linha: iniTok.linha, linhaNome: nomeTok.linha, ini: iniTok.ini, fim: corpo.fim, linhaFim: corpo.linhaFim,
        callback: (mods.includes("public") || mods.includes("hook")) && /^On[A-Z]/.test(nomeTok.v),
        parcial: prog.erros.length > errosAntes,
      });
    }
    // no nível de cima, isso é um comando (trecho de dentro de função) e não uma declaração?
    function pareceComandoSolto() {
      const t = T();
      if (t.t === "op") return ["(", "++", "--", "!", "-"].includes(t.v);
      if (t.t !== "id") return false;
      if (/^(if|for|while|do|switch|return|foreach|else|break|continue|goto)$/.test(t.v)) return true;
      if (/^(new|static|const|enum|forward|native|public|stock|hook|ptask|task|timer|main)$/.test(t.v)) return false;
      const d = P();
      if (d.t === "op" && ["[", "=", "+=", "-=", "*=", "/=", "++", "--", "|=", "&="].includes(d.v)) return true;
      if (d.t === "op" && d.v === "(") {
        // Nome(...) seguido de ; = chamada solta; seguido de { = definição
        let k = p + 1, prof = 0;
        for (; k < toks.length; k++) { const v = toks[k].t === "op" ? toks[k].v : null; if (v === "(") prof++; else if (v === ")") { prof--; if (!prof) break; } }
        const depois = toks[k + 1] || { t: "fim" };
        if (depois.t === "op" && depois.v === ";") return true;
        if (depois.t === "op" && [".", "+", "-", "==", "!=", "&&", "||", "?"].includes(depois.v)) return true;
        return false;
      }
      return false;
    }
    function ehFuncaoAFrente() {
      // static Func(...) / static stock Func(...) / static Float:Func(...)
      let k = 1;
      while (P(k).t === "id" && MODIFICADORES.has(P(k).v)) k++;
      if (P(k).t === "id" && P(k + 1).v === ":" && P(k + 2).t === "id") k += 2;
      return P(k).t === "id" && P(k + 1).v === "(";
    }

    while (T().t !== "fim") {
      const antes = p;
      try { topo(); } catch (e) { erro("falha interna do parser: " + e.message, T()); pular(true); if (++profFalha > 50) break; }
      if (p === antes) p++;
    }
    if (prog.solto.length) {
      const a = prog.solto[0], z = prog.solto[prog.solto.length - 1];
      prog.funcoes.push({ nome: "(trecho)", tag: "", prefixo: "", mods: [], params: [], tipo: "trecho", solto: true,
        corpo: { k: "bloco", corpo: prog.solto, linha: a.linha, ini: a.ini, fim: z.fim, linhaFim: z.linha },
        linha: a.linha, linhaNome: a.linha, ini: a.ini, fim: z.fim, linhaFim: z.linha, callback: false, parcial: false });
    }
    return prog;
  }

  /* ================= UTILIDADES DE ÁRVORE ================= */
  // visita comandos e expressões. fn(no, pai) — devolver false não desce
  function percorrer(no, fn, pai = null) {
    if (!no || typeof no !== "object") return;
    if (fn(no, pai) === false) return;
    const filhos = FILHOS[no.k];
    if (!filhos) return;
    for (const f of filhos) {
      const v = no[f];
      if (Array.isArray(v)) v.forEach(x => percorrer(x, fn, no));
      else if (v) percorrer(v, fn, no);
    }
    if (no.k === "switch") no.casos.forEach(c => { c.valores.forEach(v => percorrer(v, fn, no)); percorrer(c.corpo, fn, no); });
    if (no.k === "decl") no.vars.forEach(v => { (v.dims || []).forEach(d => d && percorrer(d, fn, no)); if (v.init) percorrer(v.init, fn, no); });
  }
  const FILHOS = {
    bloco: ["corpo"], if: ["cond", "entao", "senao"], while: ["cond", "corpo"], do: ["corpo", "cond"], for: ["init", "cond", "passo", "corpo"], foreach: ["corpo"],
    switch: ["e"], return: ["e"], expr: ["e"], exprs: ["lista"], decl: [],
    atrib: ["alvo", "valor"], ternario: ["cond", "sim", "nao"], bin: ["esq", "dir"], un: ["e"], pre: ["e"], pos: ["e"], par: ["e"], tag: ["e"],
    chamada: ["args"], indice: ["base", "i"], lista: ["itens"], nomeado: ["valor"], faixa: ["de", "ate"],
  };
  // tira parênteses e tags: ((Float:x)) -> x
  function nu(e) { while (e && (e.k === "par" || e.k === "tag")) e = e.e; return e; }
  // Jogador[playerid][jXP] -> { base: "Jogador", indices: [playerid, jXP] }
  function baseDe(e) {
    e = nu(e);
    const indices = [];
    while (e && e.k === "indice") { indices.unshift(e.i); e = nu(e.base); }
    return e && e.k === "id" ? { base: e.nome, indices } : null;
  }
  function variaveisLidas(e, out = new Set()) {
    percorrer(e, n => { if (n.k === "id") out.add(n.nome); if (n.k === "chamada") { n.args.forEach(a => variaveisLidas(a, out)); return false; } });
    return out;
  }
  function texto(codigo, n) { return n ? codigo.slice(n.ini, n.fim) : ""; }
  // o comando sai da função em todos os caminhos? (pra "warning 209" e código inalcançável)
  function sempreRetorna(s) {
    if (!s) return false;
    switch (s.k) {
      case "return": return true;
      case "bloco": return s.corpo.some(sempreRetorna);
      case "if": return !!s.senao && sempreRetorna(s.entao) && sempreRetorna(s.senao);
      case "switch": return s.casos.some(c => c.padrao) && s.casos.every(c => sempreRetorna(c.corpo));
      case "while": case "for": return loopInfinito(s) && !temBreak(s.corpo);
      case "do": return sempreRetorna(s.corpo) || (constante(s.cond) === true && !temBreak(s.corpo));
      case "expr": return s.e.k === "chamada" && /^(exit|GameModeExit)$/.test(s.e.nome) && s.e.nome === "exit";
      default: return false;
    }
  }
  // o fluxo não passa desse comando pro próximo (return, break, continue, goto...)
  function terminaFluxo(s) {
    if (!s) return false;
    switch (s.k) {
      case "return": case "break": case "continue": case "goto": return true;
      case "bloco": return s.corpo.some(terminaFluxo);
      case "if": return !!s.senao && terminaFluxo(s.entao) && terminaFluxo(s.senao);
      case "switch": return s.casos.some(c => c.padrao) && s.casos.length > 0 && s.casos.every(c => terminaFluxo(c.corpo));
      case "while": case "for": return loopInfinito(s) && !temBreak(s.corpo);
      default: return false;
    }
  }
  function loopInfinito(s) { return s.k === "for" ? !s.cond || constante(s.cond) === true : constante(s.cond) === true; }
  function temBreak(s) {
    let achou = false;
    const olhar = n => {
      if (!n || achou) return;
      if (n.k === "break" || n.k === "goto" || n.k === "return") { achou = n.k === "break" || n.k === "goto"; return; }
      if (["while", "for", "do", "foreach"].includes(n.k)) return;   // break de loop de dentro não conta
      if (n.k === "bloco") n.corpo.forEach(olhar);
      else if (n.k === "if") { olhar(n.entao); olhar(n.senao); }
      else if (n.k === "switch") n.casos.forEach(c => olhar(c.corpo));
    };
    olhar(s);
    return achou;
  }
  // valor constante de uma expressão (true/false/número) ou undefined
  function constante(e, defs) {
    e = nu(e);
    if (!e) return undefined;
    if (e.k === "num") return e.valor;
    if (e.k === "id") { if (e.nome === "true") return true; if (e.nome === "false") return false; if (defs && defs.has(e.nome)) return defs.get(e.nome); return undefined; }
    if (e.k === "un" && e.op === "!") { const v = constante(e.e, defs); return v === undefined ? undefined : !v; }
    if (e.k === "un" && e.op === "-") { const v = constante(e.e, defs); return typeof v === "number" ? -v : undefined; }
    return undefined;
  }
  // todas as chamadas dentro de um nó
  function chamadas(no) { const out = []; percorrer(no, n => { if (n.k === "chamada") out.push(n); }); return out; }

  /* ================= O QUE UMA CONDIÇÃO GARANTE =================
     fatosDaCondicao(cond, verdadeira) → Map(variável → { inf, sup, conectado, naoVazio, naoZero, valido })
       inf: tem limite de baixo (ex: v >= 1)   sup: tem limite de cima (ex: v < 10)
     Exemplo: if (v < 1 || v > 100) return 0;   -> depois (condição FALSA): v tem inf e sup */
  const ID_INVALIDO = /^(INVALID_PLAYER_ID|INVALID_VEHICLE_ID|INVALID_OBJECT_ID|INVALID_\w+)$/;
  // valor(no) opcional: resolve constantes (#define, sizeof...) pra guardar o LIMITE (supV / infV)
  function fatosDaCondicao(cond, verdadeira, valor) {
    const f = new Map();
    const pega = v => { if (!f.has(v)) f.set(v, {}); return f.get(v); };
    const juntar = (a, b, modo) => {   // modo "e": soma os fatos; modo "ou": só o que vale nos dois
      const out = new Map();
      if (modo === "e") {
        for (const [k, v] of a) out.set(k, { ...v });
        for (const [k, v] of b) { const o = { ...(out.get(k) || {}), ...v }; const x = out.get(k); if (x) { if (x.supV !== undefined && v.supV !== undefined) o.supV = Math.min(x.supV, v.supV); if (x.infV !== undefined && v.infV !== undefined) o.infV = Math.max(x.infV, v.infV); } out.set(k, o); }
      } else for (const [k, v] of a) if (b.has(k)) {
        const w = b.get(k), o = {};
        for (const x of Object.keys(v)) if (v[x] !== undefined && v[x] !== false && w[x] !== undefined && w[x] !== false && !/V$/.test(x)) o[x] = true;
        if (o.sup && v.supV !== undefined && w.supV !== undefined) o.supV = Math.max(v.supV, w.supV);
        if (o.inf && v.infV !== undefined && w.infV !== undefined) o.infV = Math.min(v.infV, w.infV);
        if (Object.keys(o).length) out.set(k, o);
      }
      return out;
    };
    const e = nu(cond);
    if (!e) return f;
    if (e.k === "un" && e.op === "!") return fatosDaCondicao(e.e, !verdadeira, valor);
    if (e.k === "bin" && (e.op === "&&" || e.op === "||")) {
      const a = fatosDaCondicao(e.esq, verdadeira, valor), b = fatosDaCondicao(e.dir, verdadeira, valor);
      // (A && B) verdadeiro = A e B ; (A || B) falso = !A e !B
      return juntar(a, b, (e.op === "&&") === verdadeira ? "e" : "ou");
    }
    // nome de variável (ou campo) usado na comparação
    const nomeDe = x => { x = nu(x); if (!x) return null; if (x.k === "id") return x.nome; const b = baseDe(x); return b ? b.base + b.indices.map(i => "[" + (nu(i) && nu(i).k === "id" ? nu(i).nome : nu(i) && nu(i).k === "num" ? nu(i).v : "?") + "]").join("") : null; };
    if (e.k === "bin" && ["<", "<=", ">", ">=", "==", "!="].includes(e.op)) {
      let op = e.op, v = nomeDe(e.esq), outro = e.dir;
      const esqConst = nu(e.esq) && (nu(e.esq).k === "num" || (nu(e.esq).k === "id" && /^[A-Z_][A-Z0-9_]*$/.test(nu(e.esq).nome)));
      if (esqConst || !v) { v = nomeDe(e.dir); outro = e.esq; op = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==", "!=": "!=" }[op]; }
      if (!v) return f;
      const o = nu(outro);
      const invalido = o && o.k === "id" && ID_INVALIDO.test(o.nome);
      const zero = o && o.k === "num" && o.valor === 0;
      // a condição, do jeito que vale (verdadeira ou falsa)
      let ef = op;
      if (!verdadeira) ef = { "<": ">=", "<=": ">", ">": "<=", ">=": "<", "==": "!=", "!=": "==" }[op];
      if (invalido) { if (ef === "!=") pega(v).valido = true; return f; }
      const K = o && o.k === "num" ? o.valor : valor ? valor(outro) : null;
      const temK = typeof K === "number" && isFinite(K);
      if (ef === "<" || ef === "<=") { pega(v).sup = true; if (temK) pega(v).supV = ef === "<" ? K - 1 : K; }
      if (ef === ">" || ef === ">=") {
        pega(v).inf = true;
        if (temK) pega(v).infV = ef === ">" ? K + 1 : K;
        if (temK && ((ef === ">" && K >= 0) || (ef === ">=" && K >= 1))) pega(v).naoZero = true;
      }
      if (ef === "==") { pega(v).inf = true; pega(v).sup = true; if (temK) { pega(v).supV = K; pega(v).infV = K; } if (!zero) pega(v).naoZero = true; }
      if (ef === "!=" && zero) pega(v).naoZero = true;
      // strlen(x) > 0 / strlen(x) >= N
      const ch = nu(e.esq);
      if (ch && ch.k === "chamada" && /^strlen$/.test(ch.nome) && ch.args[0]) { const s = nomeDe(ch.args[0]); if (s && ((ef === ">" || ef === ">=" || ef === "!=") && o && o.k === "num" && (o.valor > 0 || (ef !== ">=" && o.valor === 0)))) pega(s).naoVazio = true; }
      return f;
    }
    // IsPlayerConnected(x), isnull(x), strlen(x)
    if (e.k === "chamada") {
      const a0 = e.args[0] && nomeDe(e.args[0]);
      if (!a0) return f;
      if (/^(IsPlayerConnected|IsValidVehicle|IsPlayerNPC|IsValid\w+)$/.test(e.nome) && verdadeira) { pega(a0).conectado = true; pega(a0).valido = true; pega(a0).inf = true; pega(a0).sup = true; pega(a0).infV = 0; }
      if (/^isnull$/i.test(e.nome) && !verdadeira) pega(a0).naoVazio = true;
      if (/^strlen$/.test(e.nome) && verdadeira) pega(a0).naoVazio = true;
      if (/^(clamp|min|max)$/.test(e.nome)) { /* nada */ }
      return f;
    }
    // if (x)  -> x != 0
    if (e.k === "id" && verdadeira) pega(e.nome).naoZero = true;
    return f;
  }

  return { tokenizar, analisarSintaxe, percorrer, nu, baseDe, variaveisLidas, texto, sempreRetorna, terminaFluxo, temBreak, constante, chamadas, fatosDaCondicao, loopInfinito };
})();

WCDEV.pawnAst = PawnAST;
