/* =========================================================
   WC DEV — CORES (destaque de sintaxe)
   Leve e sem biblioteca: Pawn, Python, HTML e CSS.
   Usado no editor e nos blocos de código do chat.
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Cores = (() => {
  const esc = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const sp = (c, t) => `<span class="c-${c}">${esc(t)}</span>`;
  const conjunto = s => new Set(s.split(" "));

  const KW = {
    pawn: conjunto("new static const stock public forward native enum if else for while do switch case default return break continue goto sizeof tagof state defined true false char operator"),
    python: conjunto("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case self"),
  };
  const PY_BUILTIN = conjunto("print input len range int float str bool list dict set tuple type open abs min max sum sorted reversed enumerate zip map filter round isinstance super any all format id hash chr ord iter next help dir vars getattr setattr hasattr")
  const PAWN_CONST = /^(MAX_PLAYERS|INVALID_PLAYER_ID|INVALID_VEHICLE_ID|DIALOG_STYLE_\w+|PLAYER_STATE_\w+|KEY_\w+|COLOR_\w+|[A-Z][A-Z0-9_]{2,})$/;

  /* ---------- Pawn (e C-like) ---------- */
  const RE_PAWN = /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(^[ \t]*#\w+)|(\b(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b)|(\b[A-Z]\w*:(?!:))|([A-Za-z_@][\w@]*)(?=(\s*\()?)/gm;
  function pawn(cod) {
    let out = "", ult = 0, m;
    RE_PAWN.lastIndex = 0;
    while ((m = RE_PAWN.exec(cod))) {
      if (m[0] === "") { RE_PAWN.lastIndex++; continue; }
      out += esc(cod.slice(ult, m.index));
      if (m[1]) out += sp("com", m[1]);
      else if (m[2]) out += sp("str", m[2]);
      else if (m[3]) out += sp("pre", m[3]);
      else if (m[4]) out += sp("num", m[4]);
      else if (m[5]) out += sp("tipo", m[5]);
      else {
        const w = m[6];
        if (KW.pawn.has(w)) out += sp("kw", w);
        else if (m[7]) out += sp(/^On[A-Z]/.test(w) ? "cb" : "fn", w);
        else if (/^On[A-Z]/.test(w)) out += sp("cb", w);
        else if (PAWN_CONST.test(w)) out += sp("const", w);
        else out += esc(w);
      }
      ult = RE_PAWN.lastIndex;
    }
    return out + esc(cod.slice(ult));
  }

  /* ---------- Python ---------- */
  const RE_PY = /(#[^\n]*)|([rRbBfFuU]{0,2}(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?))|(^[ \t]*@[\w.]+)|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_]\w*)(?=(\s*\()?)/gm;
  function python(cod) {
    let out = "", ult = 0, m, antes = "";
    RE_PY.lastIndex = 0;
    while ((m = RE_PY.exec(cod))) {
      if (m[0] === "") { RE_PY.lastIndex++; continue; }
      out += esc(cod.slice(ult, m.index));
      if (m[1]) out += sp("com", m[1]);
      else if (m[2]) out += sp("str", m[2]);
      else if (m[3]) out += sp("pre", m[3]);
      else if (m[4]) out += sp("num", m[4]);
      else {
        const w = m[5];
        if (antes === "def" || antes === "class") out += sp("fn", w);
        else if (KW.python.has(w)) out += sp("kw", w);
        else if (PY_BUILTIN.has(w)) out += sp("cb", w);
        else if (m[6]) out += sp("fn", w);
        else out += esc(w);
        antes = w;
      }
      ult = RE_PY.lastIndex;
    }
    return out + esc(cod.slice(ult));
  }

  /* ---------- CSS ---------- */
  // corta em pedaços até { ; } — o que vem antes de { é seletor, o resto é propriedade: valor
  const RE_CSS = /(\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|([{};])|([^{};"'\/]+|\/)/g;
  const RE_VAL = /(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:px|em|rem|%|vh|vw|s|ms|deg|fr|vmin|vmax|ch|dvh)?)|(![a-z]+)|([a-zA-Z-][\w-]*)/g;
  const corValor = t => t.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))
    .replace(RE_VAL, (x, hex, num, imp, pal) => hex ? `<span class="c-num">${x}</span>` : num ? `<span class="c-num">${x}</span>` : imp ? `<span class="c-kw">${x}</span>` : `<span class="c-val">${x}</span>`);
  function css(cod) {
    let out = "", m, prof = 0, seg = [];
    const render = term => {
      const seletor = term === "{" || (!term && !prof);
      let jaPassouDoisPontos = false;
      for (const p of seg) {
        if (p.t === "com") out += sp("com", p.v);
        else if (p.t === "str") out += sp("str", p.v);
        else if (seletor) out += p.v.replace(/(@[\w-]+)|([^@]+)/g, (x, at, resto) => at ? sp("kw", at) : sp("tag", resto));
        else if (!jaPassouDoisPontos && p.v.includes(":")) {
          const i = p.v.indexOf(":");
          const prop = p.v.slice(0, i), val = p.v.slice(i + 1);
          out += prop.replace(/[\w-]+/, w => "\u0001" + w + "\u0002").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).replace("\u0001", '<span class="c-att">').replace("\u0002", "</span>") + ":" + corValor(val);
          jaPassouDoisPontos = true;
        } else out += jaPassouDoisPontos ? corValor(p.v) : esc(p.v);
      }
      seg = [];
    };
    RE_CSS.lastIndex = 0;
    while ((m = RE_CSS.exec(cod))) {
      if (m[0] === "") { RE_CSS.lastIndex++; continue; }
      if (m[1]) seg.push({ t: "com", v: m[1] });
      else if (m[2]) seg.push({ t: "str", v: m[2] });
      else if (m[4]) seg.push({ t: "txt", v: m[4] });
      else {
        render(m[3]);
        if (m[3] === "{") prof++;
        else if (m[3] === "}") prof = Math.max(0, prof - 1);
        out += m[3];
      }
    }
    render(null);
    return out;
  }

  /* ---------- HTML ---------- */
  const RE_HTML = /(<!--[\s\S]*?(?:-->|$))|(<\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?>|$)|(&[#\w]+;)/g;
  const RE_ATTR = /([^\s=/"']+)(\s*=\s*)?("[^"]*"?|'[^']*'?|[^\s>"']+)?/g;
  function html(cod) {
    let out = "", ult = 0, m;
    RE_HTML.lastIndex = 0;
    const partes = [];
    while ((m = RE_HTML.exec(cod))) {
      if (m[0] === "") { RE_HTML.lastIndex++; continue; }
      partes.push({ ini: m.index, fim: RE_HTML.lastIndex, m });
    }
    for (let i = 0; i < partes.length; i++) {
      const { ini, fim } = partes[i];
      const m = partes[i].m;
      let texto = cod.slice(ult, ini);
      // conteúdo do <style> ganha cor de CSS
      const anterior = partes[i - 1];
      if (anterior && anterior.m[3] && anterior.m[3].toLowerCase() === "style" && anterior.m[2] === "<") out += css(texto);
      else out += esc(texto);
      if (m[1]) out += sp("com", m[1]);
      else if (m[6]) out += sp("num", m[6]);
      else {
        out += sp("pont", m[2]) + sp("tag", m[3]);
        out += m[4].replace(RE_ATTR, (_, nome, igual, valor) =>
          sp("att", nome) + (igual ? esc(igual) : "") + (valor ? sp("str", valor) : "")).replace(/<span class="c-att"><\/span>/g, "");
        out += sp("pont", m[5]);
      }
      ult = fim;
    }
    const resto = cod.slice(ult);
    const anterior = partes[partes.length - 1];
    out += anterior && anterior.m[3] && anterior.m[3].toLowerCase() === "style" && anterior.m[2] === "<" ? css(resto) : esc(resto);
    return out;
  }

  /* ---------- JavaScript ---------- */
  const KW_JS = conjunto("const let var function return if else for while do switch case default break continue new class extends this super try catch finally throw async await of in typeof instanceof import export from as yield delete void null undefined true false");
  const JS_GLOBAIS = conjunto("console document window Math JSON Number String Array Object Promise Date localStorage setTimeout setInterval clearInterval fetch parseInt parseFloat isNaN Error Map Set");
  const RE_JS = /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=(\s*\()?)/g;
  function js(cod) {
    let out = "", ult = 0, m;
    RE_JS.lastIndex = 0;
    while ((m = RE_JS.exec(cod))) {
      if (m[0] === "") { RE_JS.lastIndex++; continue; }
      out += esc(cod.slice(ult, m.index));
      if (m[1]) out += sp("com", m[1]);
      else if (m[2]) out += sp("str", m[2]);
      else if (m[3]) out += sp("num", m[3]);
      else {
        const w = m[4];
        if (KW_JS.has(w)) out += sp("kw", w);
        else if (JS_GLOBAIS.has(w)) out += sp("cb", w);
        else if (m[5]) out += sp("fn", w);
        else out += esc(w);
      }
      ult = RE_JS.lastIndex;
    }
    return out + esc(cod.slice(ult));
  }

  function colorir(cod, lang) {
    if (cod.length > 120000) return esc(cod);   // código gigante: sem cor, pra não travar
    try {
      if (lang === "pawn" || lang === "c" || lang === "pwn") return pawn(cod);
      if (lang === "python" || lang === "py") return python(cod);
      if (lang === "html") return html(cod);
      if (lang === "css") return css(cod);
      if (lang === "javascript" || lang === "js") return js(cod);
    } catch (e) { /* se der qualquer problema, mostra sem cor */ }
    return esc(cod);
  }

  return { colorir };
})();

WCDEV.cores = Cores;
