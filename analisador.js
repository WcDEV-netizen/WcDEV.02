/* =========================================================
   WC DEV — ANALISADOR ESTÁTICO DE CÓDIGO (Pawn / SA-MP)

   Roda ANTES de explicar, revisar ou corrigir um código.
   Etapas:
     1. LIMPEZA     tira comentários e textos (sem mudar as posições)
     2. ESTRUTURA   acha includes, defines, enums, globais, funções,
                    parâmetros e variáveis locais
     3. REGRAS      cada regra procura um padrão suspeito
                    (módulos: sintaxe, lógica, execução, segurança,
                    sistemas do SA-MP, contexto, melhoria)
     4. VALIDAÇÃO   confere cada conclusão: tira repetidas, rebaixa o
                    que depende de arquivo que eu não vi, descarta o
                    que já está protegido no código
     5. CORREÇÃO    correções seguras, aplicadas uma a uma e
                    revalidadas no revisor (se piorar, desfaz)

   Níveis de certeza:
     erro       = confirmado pelo próprio código (vai dar problema)
     provavel   = muito provável que seja bug (depende da intenção)
     verificar  = falta contexto: diz exatamente o que conferir
     sugestao   = funciona, mas dá pra melhorar

   Não existe compilador Pawn no navegador. Se um dia existir
   (ex: pawncc em WebAssembly), registre em Analisador.compilador
   e o resultado real entra no relatório. Sem ele, eu NUNCA digo
   que compilei.

   Pra criar uma regra nova: Analisador.regras.pawn.push({ id, modulo, verificar(ctx) { return [achados] } })
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Analisador = (() => {
  /* ================= 1. LIMPEZA ================= */
  function limpar(codigo) {
    let out = "", i = 0;
    const textos = [];
    const n = codigo.length;
    while (i < n) {
      const c = codigo[i], d = codigo[i + 1];
      if (c === "/" && d === "/") { while (i < n && codigo[i] !== "\n") { out += " "; i++; } continue; }
      if (c === "/" && d === "*") { out += "  "; i += 2; while (i < n && !(codigo[i] === "*" && codigo[i + 1] === "/")) { out += codigo[i] === "\n" ? "\n" : " "; i++; } if (i < n) { out += "  "; i += 2; } continue; }
      if (c === '"' || c === "'") {
        const ini = i, q = c;
        out += q; i++;
        while (i < n && codigo[i] !== q && codigo[i] !== "\n") { if (codigo[i] === "\\") { out += " "; i++; } out += " "; i++; }
        if (codigo[i] === q) { out += q; i++; }
        textos.push({ ini, fim: i, texto: codigo.slice(ini + 1, i - 1) });
        continue;
      }
      out += c; i++;
    }
    return { limpo: out, textos };
  }

  const RESERVADAS = new Set(("new static const stock public forward native enum if else for while do switch case default return break continue goto sizeof tagof state " +
    "defined true false char operator sleep exit assert main Float bool File Text PlayerText Text3D PlayerText3D DB DBResult _").split(" "));

  /* símbolos que eu sei que existem fora do código (nativas do SA-MP, includes comuns) */
  let conhecidos = null;
  function prepararConhecidos() {
    conhecidos = new Set(["io_read", "io_write", "io_append", "io_readwrite", "seek_start", "seek_current", "seek_end", "printf", "print", "format", "strcmp", "strlen", "strval", "valstr", "strfind", "strcat", "strdel", "strins", "strmid", "strpack", "strunpack",
      "random", "floatround", "float", "floatstr", "floatsqroot", "floatabs", "floatpower", "min", "max", "clamp", "tolower", "toupper", "funcidx", "numargs", "getarg", "setarg",
      "heapspace", "tickcount", "gettime", "getdate", "swapchars", "isnull", "sscanf", "foreach", "Iter_Add", "Iter_Remove", "Iter_Contains", "Iter_Count", "Player", "Vehicle",
      "MAX_PLAYERS", "MAX_PLAYER_NAME", "MAX_VEHICLES", "INVALID_PLAYER_ID", "INVALID_VEHICLE_ID", "INVALID_OBJECT_ID", "INVALID_TEXT_DRAW", "cellmax", "cellmin", "cellbits", "charbits", "charmax", "ucharmax"]);
    for (const t of WCDEV.temas) {
      if (!t.ref || t.lang !== "pawn") continue;
      for (const nome of (t.titulo.match(/[A-Za-z_][\w]*/g) || [])) conhecidos.add(nome);
    }
  }
  function ehConhecido(nome) {
    if (!conhecidos) prepararConhecidos();
    return conhecidos.has(nome) || /^(DOF2|mysql|cache|Streamer|CreateDynamic|DestroyDynamic|Iter|y_|BCRYPT|bcrypt|SSCANF|PlayerTextDraw|TextDraw|KEY|DIALOG|PLAYER_STATE|WEAPON|SPECIAL_ACTION|COLOR|CAMERA|VEHICLE|BODY_PART|MAPICON|OBJECT_MATERIAL|SERVER_VARTYPE|PLAYER_VARTYPE|CLICK_SOURCE|EDIT_RESPONSE|SELECT_OBJECT|DOWNLOAD_REQUEST|CARMODTYPE|PLAYER_MARKERS|MAX_)/.test(nome);
  }

  /* ================= 2. ESTRUTURA ================= */
  function estrutura(codigo) {
    const { limpo, textos } = limpar(codigo);
    const linhas = codigo.split("\n");
    const linhasLimpas = limpo.split("\n");
    const inicioLinha = [0];
    for (let i = 0; i < codigo.length; i++) if (codigo[i] === "\n") inicioLinha.push(i + 1);
    const linhaDe = pos => { let lo = 0, hi = inicioLinha.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (inicioLinha[m] <= pos) lo = m; else hi = m - 1; } return lo + 1; };
    const fecha = pos => { let p = 0; for (let i = pos; i < limpo.length; i++) { if (limpo[i] === "{") p++; else if (limpo[i] === "}") { p--; if (!p) return i; } } return -1; };

    const ctx = {
      codigo, limpo, textos, linhas, linhasLimpas, linhaDe, fecha,
      includes: [], includesProprios: [], defines: new Set(), enums: [], membros: new Set(), globais: new Map(), funcoes: [], forwards: new Set(), natives: new Set(),
    };
    for (const m of codigo.matchAll(/^[ \t]*#\s*(?:try)?include\s*([<"])([^>"]+)[>"]/gm)) (m[1] === '"' ? ctx.includesProprios : ctx.includes).push(m[2].trim());
    // includes que a análise de projeto já colocou dentro do código (o arquivo foi fornecido): contam como vistos
    for (const m of codigo.matchAll(/\/\/ \[wcdev\] incluído: (\S+)/g)) { ctx.includes.push(m[1].replace(/\.(inc|pwn|p)$/i, "").split("/").pop()); ctx.incluidos = (ctx.incluidos || 0) + 1; }
    // árvore sintática (pawn-ast.js): base das regras de fluxo, estado e projeto
    try { ctx.ast = WCDEV.pawnAst ? WCDEV.pawnAst.analisarSintaxe(codigo) : null; } catch (e) { ctx.ast = null; }
    for (const m of limpo.matchAll(/#define\s+([A-Za-z_]\w*)/g)) ctx.defines.add(m[1]);
    for (const m of limpo.matchAll(/\bforward\s+(?:\w+:)?(\w+)\s*\(/g)) ctx.forwards.add(m[1]);
    for (const m of limpo.matchAll(/\bnative\s+(?:\w+:)?(\w+)\s*\(/g)) ctx.natives.add(m[1]);
    for (const m of limpo.matchAll(/\benum\s+(?:(\w+)\s*)?\{([^}]*)\}/g)) {
      const membros = m[2].split(",").map(x => (x.match(/(?:\w+:)?([A-Za-z_]\w*)/) || [])[1]).filter(Boolean);
      ctx.enums.push({ nome: m[1] || null, membros, linha: linhaDe(m.index) });
      membros.forEach(x => ctx.membros.add(x));
      if (m[1]) ctx.membros.add(m[1]);
    }

    // funções: cabeçalho no nível 0 seguido de {
    let prof = 0, pos = 0;
    const RE_CAB = /^\s*(?:(static)\s+)?(?:(stock|public)\s+)?(?:([A-Za-z_]\w*):)?([A-Za-z_]\w*)\s*\(([^;{}]*)\)\s*(\{.*)?$/;
    for (let li = 0; li < linhasLimpas.length; li++) {
      const L = linhasLimpas[li];
      if (prof === 0) {
        const m = L.match(RE_CAB);
        if (m && !/^(if|while|for|switch|return|forward|native|else|enum|sizeof)$/.test(m[4])) {
          let abre = m[6] ? pos + L.indexOf("{", L.lastIndexOf(")")) : -1;
          if (abre < 0) { const resto = limpo.slice(pos + L.length); const k = resto.search(/\S/); if (k >= 0 && resto[k] === "{") abre = pos + L.length + k; }
          if (abre >= 0) {
            const fim = fecha(abre);
            const tagOuCmd = m[3] || "";
            const ehCmd = /^(CMD|cmd|COMMAND|command|YCMD)$/.test(tagOuCmd);
            const params = m[5].trim() ? m[5].split(",").map(p => {
              const pm = p.trim().match(/^(?:const\s+)?(&)?(?:([A-Za-z_]\w*):)?([A-Za-z_]\w*)\s*(\[[^\]]*\])?/);
              return pm ? { nome: pm[3], tag: pm[2] || "", ref: !!pm[1], array: !!pm[4] } : null;
            }).filter(Boolean) : [];
            const f = {
              nome: m[4], tipo: ehCmd ? "comando" : m[2] || (m[1] ? "static" : "funcao"), tag: ehCmd ? "" : tagOuCmd, params,
              linha: li + 1, abre, fim: fim < 0 ? limpo.length : fim, linhaFim: fim < 0 ? linhas.length : linhaDe(fim),
              callback: m[2] === "public" && /^On[A-Z]/.test(m[4]),
            };
            f.corpo = limpo.slice(abre + 1, f.fim);
            const semForeach = f.corpo.replace(/\bforeach\s*\(\s*new\s+\w+\s*:\s*\w+\s*\)/g, x => " ".repeat(x.length));
            f.orig = codigo.slice(abre + 1, f.fim);   // mesmas posições, mas com os textos (pro formato do sscanf)
            f.locais = new Map();
            for (const d of semForeach.matchAll(/\b(?:new|static)\s+([^;]+);/g)) declaracoes(d[1]).forEach(([nome, tam]) => f.locais.set(nome, tam));
            for (const d of f.corpo.matchAll(/\b(?:for|foreach)\s*\(\s*new\s+(?:\w+:)?([A-Za-z_]\w*)/g)) f.locais.set(d[1], null);
            ctx.funcoes.push(f);
          }
        }
      }
      for (const ch of L) { if (ch === "{") prof++; else if (ch === "}") prof = Math.max(0, prof - 1); }
      pos += L.length + 1;
    }
    // globais: new/static fora das funções
    let fora = limpo;
    for (const f of ctx.funcoes) fora = fora.slice(0, f.abre) + " ".repeat(Math.max(0, f.fim - f.abre + 1)) + fora.slice(f.fim + 1);
    // protótipos (native/forward) e cabeçalhos de foreach não contam como uso de variável
    fora = fora.replace(/\b(native|forward)\b[^;]*;/g, x => x.replace(/[^\n]/g, " "))
      .replace(/\bforeach\s*\(\s*new\s+(\w+)\s*:\s*\w+\s*\)/g, (x, v) => { ctx.globais.set(v, null); return " ".repeat(x.length); });
    ctx.fora = fora;
    for (const d of fora.matchAll(/\b(?:new|static|const)\s+([^;]+);/g)) declaracoes(d[1]).forEach(([nome, tam]) => ctx.globais.set(nome, tam));
    // código solto (sem função em volta): é um pedaço de dentro de uma função
    ctx.solto = /\b(if|for|while|return|SendClientMessage|SetPlayer\w*|GivePlayer\w*)\b/.test(fora.replace(/#[^\n]*/g, ""));
    ctx.temInclude = ctx.includes.length > 0;
    ctx.completo = ctx.temInclude && /\bmain\s*\(/.test(limpo);
    return ctx;
  }
  // "a = 1, b[10], Float:c[MAX_PLAYERS][E_X]" -> [[a,null],[b,"10"],[c,"MAX_PLAYERS"]]
  function declaracoes(txt) {
    const partes = [];
    let p = 0, atual = "";
    for (const ch of txt) {
      if ("([{".includes(ch)) p++; else if (")]}".includes(ch)) p--;
      if (ch === "," && !p) { partes.push(atual); atual = ""; } else atual += ch;
    }
    partes.push(atual);
    return partes.map(x => {
      const m = x.trim().match(/^(?:const\s+)?(?:([A-Za-z_]\w*):)?([A-Za-z_]\w*)\s*(?:\[\s*([^\]]*?)\s*\])?/);
      return m ? [m[2], m[3] === undefined ? null : m[3]] : null;
    }).filter(Boolean);
  }

  /* ================= utilidades das regras ================= */
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const temGuarda = (texto, nome) => new RegExp(`IsPlayerConnected\\s*\\(\\s*${esc(nome)}\\s*\\)|${esc(nome)}\\s*(==|!=)\\s*INVALID_PLAYER_ID|INVALID_PLAYER_ID\\s*(==|!=)\\s*${esc(nome)}|${esc(nome)}\\s*(<|>=|>)\\s*(0|MAX_PLAYERS)|IsPlayerNPC\\s*\\(\\s*${esc(nome)}|!\\s*IsValid\\w*\\s*\\(\\s*${esc(nome)}`).test(texto);
  const linhaDentro = (ctx, f, posRel) => ctx.linhaDe(f.abre + 1 + posRel);
  const recuoDe = linha => (linha.match(/^\s*/) || [""])[0];
  const retornoPadrao = f => /\breturn\s+[^;\s]/.test(f.corpo) ? "return 0;" : "return;";
  // acha o bloco { } que começa depois de uma posição (relativa ao corpo) — devolve [abre, fecha] relativos
  function blocoDepois(f, posRel) {
    const resto = f.corpo.slice(posRel);
    const k = resto.search(/\S/);
    if (k < 0 || resto[k] !== "{") return null;
    let p = 0;
    for (let i = posRel + k; i < f.corpo.length; i++) { if (f.corpo[i] === "{") p++; else if (f.corpo[i] === "}") { p--; if (!p) return [posRel + k, i]; } }
    return null;
  }
  // sscanf(params, "ui", a, b) -> { formato: "ui", vars: ["a","b"], fim }
  function chamadasSscanf(f) {
    const out = [];
    for (const m of f.orig.matchAll(/\bsscanf\s*\(/g)) {
      const ini = m.index + m[0].length - 1, fim = fechaParen(f.corpo, ini);
      if (fim < 0) continue;
      const args = [];
      let p = 0, atual = "";
      for (const ch of f.orig.slice(ini + 1, fim)) {
        if ("([{".includes(ch)) p++; else if (")]}".includes(ch)) p--;
        if (ch === "," && !p) { args.push(atual.trim()); atual = ""; } else atual += ch;
      }
      args.push(atual.trim());
      const fm = (args[1] || "").match(/^"([^"]*)"$/);
      if (!fm) continue;
      out.push({ index: m.index, formato: fm[1], espec: fm[1].replace(/\[[^\]]*\]|\([^)]*\)|'[^']*'/g, "").replace(/[^a-zA-Z]/g, ""), vars: args.slice(2) });
    }
    return out;
  }
  // posição do ) que fecha o ( em posRel
  function fechaParen(txt, posRel) { let p = 0; for (let i = posRel; i < txt.length; i++) { if (txt[i] === "(") p++; else if (txt[i] === ")") { p--; if (!p) return i; } } return -1; }
  const inserirNoInicio = (ctx, f, texto) => {
    const L = ctx.linhaDe(f.abre);
    const base = recuoDe(ctx.linhas[L] || "    ") || "    ";
    return { tipo: "inserirDepois", linha: L, linhas: [base + texto] };
  };

  /* ================= 3. REGRAS ================= */
  const R = [];

  /* ---------- LÓGICA ---------- */
  // if que deveria ser while (XP / level e acumuladores)
  R.push({ id: "if-que-devia-ser-while", modulo: "lógica", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes) {
      for (const m of f.corpo.matchAll(/\bif\s*\(/g)) {
        const pIni = m.index + m[0].length - 1, pFim = fechaParen(f.corpo, pIni);
        if (pFim < 0) continue;
        const cond = f.corpo.slice(pIni + 1, pFim);
        const cm = cond.match(/^\s*(.+?)\s*>=\s*(.+?)\s*$/);
        if (!cm || /&&|\|\|/.test(cond)) continue;
        const A = cm[1], B = cm[2];
        const bloco = blocoDepois(f, pFim + 1);
        if (!bloco) continue;
        const corpoIf = f.corpo.slice(bloco[0] + 1, bloco[1]);
        if (!new RegExp(esc(A) + "\\s*-=\\s*").test(corpoIf)) continue;
        const sobeNivel = /\[\s*\w*(Nivel|nivel|Level|level|Lvl|lvl|NV|Score)\w*\s*\]\s*\+\+|\b\w*(nivel|level|lvl)\w*\s*\+\+|\+\+\s*\w*(nivel|level)/i.test(corpoIf);
        const xp = /xp|exp|experiencia/i.test(A);
        const L = linhaDentro(ctx, f, m.index);
        // a quantidade necessária depende do nível? então precisa recalcular dentro do loop
        const varB = B.match(/^[A-Za-z_]\w*$/) ? B : null;
        const calc = varB && f.corpo.match(new RegExp(`\\bnew\\s+${esc(varB)}\\s*=\\s*([^;]+);`));
        const dependeNivel = calc ? /nivel|level|lvl/i.test(calc[1]) : /nivel|level|lvl/i.test(B);
        const correcoes = [{ tipo: "trocar", linha: L, de: /\bif\b/, para: "while" }];
        if (calc && dependeNivel) {
          const Lfim = linhaDentro(ctx, f, bloco[1]);
          const recuo = recuoDe(ctx.linhas[Lfim - 2] || "        ");
          correcoes.push({ tipo: "inserirAntes", linha: Lfim, linhas: [recuo + `${varB} = ${calc[1].trim()};   // recalcula pro próximo nível`] });
        }
        if (sobeNivel || xp) out.push({
          nivel: "verificar", linha: L, titulo: "A função sobe só **um nível por chamada**: é isso que você quer?",
          porque: `Esse {{if}} testa uma vez só. Se o jogador ganhar XP suficiente pra **dois ou mais níveis** de uma vez (ex: um evento que dá muito XP), ele sobe só um, e o resto do XP fica "sobrando" acima do necessário até a próxima chamada.`,
          correcao: `Se a ideia é subir **todos os níveis** que o XP permite, troque o {{if}} por {{while}}` + (calc && dependeNivel ? ` e **recalcule {{${varB}}} dentro do loop** (ele depende do nível, que acabou de mudar; sem recalcular, o loop usaria o valor do nível antigo).` : ".") + " Se você quer de propósito só um nível por vez, pode deixar como está.",
          exemplo: calc && dependeNivel ? `while (${A} >= ${varB})\n{\n    ${A} -= ${varB};\n    ...++;   // sobe o nível\n    ${varB} = ${calc[1].trim()};\n}` : null,
          correcoes, seguro: true, suposicao: "troquei o {{if}} por {{while}} pra subir vários níveis de uma vez (se não era isso, volte pro {{if}})",
        });
        else out.push({
          nivel: "sugestao", linha: L, titulo: "Esse {{if}} só desconta uma vez",
          porque: `Se {{${A}}} puder passar de {{${B}}} mais de uma vez, um {{if}} desconta só uma.`,
          correcao: "Se puder acumular, use {{while}}. Se só acontece uma vez por vez, está certo.",
        });
      }
    }
    return out;
  } });

  // if (algo);  -> o bloco roda sempre
  R.push({ id: "if-com-ponto-e-virgula", modulo: "lógica", verificar(ctx) {
    const out = [];
    for (const m of ctx.limpo.matchAll(/\b(if|while|for)\s*\(/g)) {
      const pIni = m.index + m[0].length - 1, pFim = fechaParen(ctx.limpo, pIni);
      if (pFim < 0) continue;
      if (m[1] === "while" && /\}\s*$/.test(ctx.limpo.slice(0, m.index))) continue;   // do { ... } while (...);
      if (/^[ \t]*;/.test(ctx.limpo.slice(pFim + 1))) {
        const L = ctx.linhaDe(m.index);
        out.push({ nivel: "erro", linha: L, titulo: `Ponto e vírgula logo depois do {{${m[1]}}}`, categoria: "compilacao", compilador: "error 036",
          porque: `O {{;}} vira um comando **vazio** como corpo do ${m[1]}: o bloco de baixo não pertence a ele.`,
          consequencia: "No Pawn o compilador **recusa** isso: **error 036: empty statement** (em C compilaria e o bloco rodaria sempre; aqui nem compila).",
          quando: "Ao compilar.", correcao: "Tire o {{;}} do fim da linha.", correcoes: [{ tipo: "trocar", linha: L, de: /\)\s*;\s*$/, para: ")" }] });
      }
    }
    return out;
  } });

  // x == 1 || 2  (sempre verdadeiro)
  R.push({ id: "ou-com-constante", modulo: "lógica", verificar(ctx) {
    const out = [];
    for (const m of ctx.limpo.matchAll(/([A-Za-z_][\w\[\]]*)\s*==\s*([\w.]+)\s*\|\|\s*(\d+|[A-Z_][A-Z0-9_]+)\s*(?=[)|&])/g)) {
      const L = ctx.linhaDe(m.index);
      out.push({ nivel: "erro", linha: L, titulo: "Condição sempre verdadeira",
        porque: `{{${m[0].trim()}}} não compara {{${m[1]}}} com {{${m[3]}}}: o {{|| ${m[3]}}} sozinho vale "verdadeiro" (qualquer número diferente de 0), então a condição **sempre passa**.`,
        correcao: `Repita a variável: {{${m[1]} == ${m[2]} || ${m[1]} == ${m[3]}}}`,
        correcoes: [{ tipo: "trocar", linha: L, de: new RegExp(esc(m[0])), para: `${m[1]} == ${m[2]} || ${m[1]} == ${m[3]}` }] });
    }
    return out;
  } });

  // OnPlayerCommandText: if (strcmp(cmdtext, "/x")) sem ! — roda pra todos os OUTROS comandos
  R.push({ id: "strcmp-invertido", modulo: "lógica", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes) {
      const re = f.nome === "OnPlayerCommandText" ? /\bif\s*\(\s*strcmp\s*\(\s*cmdtext\s*,/g : /\bif\s*\(\s*strcmp\s*\(\s*\w+\s*,\s*"[^"]+"[^)]*\)\s*\)/g;
      for (const m of f.corpo.matchAll(re)) {
        const L = linhaDentro(ctx, f, m.index);
        out.push({ nivel: "provavel", linha: L, titulo: "Comando com a comparação invertida",
          porque: "O {{strcmp}} devolve **0 quando os textos são iguais**. Do jeito que está, esse bloco roda pra **qualquer outro** comando, menos o certo.",
          correcao: "Coloque o {{!}}: {{if (!strcmp(cmdtext, \"/comando\", true))}}",
          correcoes: [{ tipo: "trocar", linha: L, de: /if\s*\(\s*strcmp/, para: "if (!strcmp" }] });
      }
    }
    return out;
  } });

  // while sem nada mudando na condição
  R.push({ id: "while-infinito", modulo: "execução", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes) {
      for (const m of f.corpo.matchAll(/\bwhile\s*\(/g)) {
        const pIni = m.index + m[0].length - 1, pFim = fechaParen(f.corpo, pIni);
        if (pFim < 0) continue;
        const cond = f.corpo.slice(pIni + 1, pFim);
        if (/\}\s*$/.test(f.corpo.slice(0, m.index))) continue;   // é o fim de um do { } while: o corpo vem antes
        const bloco = blocoDepois(f, pFim + 1);
        const corpo = bloco ? f.corpo.slice(bloco[0] + 1, bloco[1]) : f.corpo.slice(pFim + 1, f.corpo.indexOf(";", pFim + 1) + 1);
        if (/\b(break|return|goto)\b/.test(corpo) || /\(\s*\)/.test(cond) && /\w+\s*\(/.test(cond)) continue;
        const vars = [...new Set((cond.match(/[A-Za-z_]\w*/g) || []).filter(v => !RESERVADAS.has(v) && !/^[A-Z_0-9]+$/.test(v)))];
        if (!vars.length || /\w+\s*\(/.test(cond)) continue;
        const muda = vars.some(v => new RegExp(`\\b${esc(v)}\\b[^=;]*?(\\+\\+|--|[-+*/%]?=(?!=))|(\\+\\+|--)\\s*${esc(v)}\\b|\\w+\\s*\\([^)]*\\b${esc(v)}\\b`).test(corpo));
        if (!muda) out.push({ nivel: "provavel", linha: linhaDentro(ctx, f, m.index), titulo: "{{while}} que pode nunca parar",
          porque: `Nada dentro do loop muda ${vars.map(v => `{{${v}}}`).join(", ")}. Se a condição começar verdadeira, o loop **nunca termina** e o servidor **trava**.`,
          correcao: "Garanta que algo dentro do loop mude a condição (ex: {{i++}}, diminuir o valor) ou use {{break}}." });
      }
    }
    return out;
  } });

  /* ---------- EXECUÇÃO (limites, arrays, ids) ---------- */
  // for (... i <= MAX_PLAYERS ...) usando i como índice
  R.push({ id: "loop-passa-do-limite", modulo: "execução", verificar(ctx) {
    const out = [];
    for (const m of ctx.limpo.matchAll(/\bfor\s*\(\s*(?:new\s+)?([A-Za-z_]\w*)\s*=\s*0\s*;\s*\1\s*<=\s*(MAX_\w+|sizeof\s*\(?\s*\w+\s*\)?|\d+)\s*;/g)) {
      const v = m[1], lim = m[2].replace(/\s/g, "");
      const L = ctx.linhaDe(m.index);
      const pIni = ctx.limpo.indexOf("(", m.index), pFim = fechaParen(ctx.limpo, pIni);
      const depois = ctx.limpo.slice(pFim, pFim + 800);
      const indexa = new RegExp(`\\[\\s*${esc(v)}\\s*\\]`).test(depois);
      // o array tem exatamente esse tamanho?
      const tamanhoIgual = [...ctx.globais, ...ctx.funcoes.flatMap(f => [...f.locais])].some(([nome, tam]) => tam && tam.replace(/\s/g, "") === lim && new RegExp(`\\b${esc(nome)}\\s*\\[\\s*${esc(v)}\\s*\\]`).test(depois));
      const sizeofArr = /^sizeof/.test(lim);
      if (!indexa && !/^MAX_PLAYERS$/.test(lim)) continue;
      out.push({ nivel: (tamanhoIgual || sizeofArr) && indexa ? "erro" : "provavel", linha: L, titulo: `O loop vai até **${lim}** (um a mais)`,
        porque: `Com {{<=}} o {{${v}}} chega a valer **${lim}**. Arrays em Pawn vão de **0 até tamanho − 1**, então ${indexa ? `{{[${v}]}} na última volta dá **"array index out of bounds"** (erro de execução)` : `a última volta usa um id que não existe`}.`,
        correcao: `Use {{<}}: {{${v} < ${lim}}}`, correcoes: [{ tipo: "trocar", linha: L, de: new RegExp(`${esc(v)}\\s*<=\\s*`), para: `${v} < ` }] });
    }
    return out;
  } });

  // índice constante fora do array: new a[10]; a[10] = ...
  R.push({ id: "indice-constante-fora", modulo: "execução", verificar(ctx) {
    const out = [];
    const tamanhos = new Map();
    for (const [n, t] of ctx.globais) if (t && /^\d+$/.test(t)) tamanhos.set(n, +t);
    for (const f of ctx.funcoes) for (const [n, t] of f.locais) if (t && /^\d+$/.test(t)) tamanhos.set(n, +t);
    // trechos que são declaração (new a[10], b[64];) não são uso do array
    const decl = [...ctx.limpo.matchAll(/\b(?:new|static|const)\s+[^;]*;/g)].map(d => [d.index, d.index + d[0].length]);
    const emDeclaracao = pos => decl.some(([a, b]) => pos >= a && pos < b && !/=[^,]*$/.test(ctx.limpo.slice(a, pos)));
    for (const [nome, tam] of tamanhos) {
      for (const m of ctx.limpo.matchAll(new RegExp(`(?<![\\w.])${esc(nome)}\\s*\\[\\s*(\\d+)\\s*\\]`, "g"))) {
        if (+m[1] >= tam && !emDeclaracao(m.index)) {
          out.push({ nivel: "erro", linha: ctx.linhaDe(m.index), titulo: `Posição **${m[1]}** não existe em {{${nome}}}`,
            porque: `{{${nome}}} foi criado com **${tam}** posições (de 0 até ${tam - 1}). O compilador acusa {{error 032: array index out of bounds}}.`,
            correcao: `Use uma posição de 0 a ${tam - 1}, ou aumente o tamanho do array.`, compilador: "error 032" });
        }
      }
    }
    return out;
  } });

  // format(msg, 128, ...) com msg menor / texto maior que o array
  R.push({ id: "format-tamanho", modulo: "execução", verificar(ctx) {
    const out = [];
    const tam = nome => { for (const f of ctx.funcoes) if (f.locais.has(nome)) return f.locais.get(nome); return ctx.globais.get(nome); };
    for (const m of ctx.limpo.matchAll(/\bformat\s*\(\s*([A-Za-z_]\w*)\s*,\s*(\d+)\s*,/g)) {
      const t = tam(m[1]);
      if (t && /^\d+$/.test(t) && +m[2] > +t) out.push({ nivel: "erro", linha: ctx.linhaDe(m.index), titulo: "{{format}} pode escrever fora do array",
        porque: `{{${m[1]}}} tem **${t}** posições, mas o format foi avisado que tem **${m[2]}**. Um texto grande escreve por cima de outras variáveis (bug difícil de achar ou crash).`,
        correcao: `Use {{sizeof(${m[1]})}} no lugar do número.`, correcoes: [{ tipo: "trocar", linha: ctx.linhaDe(m.index), de: new RegExp(`(format\\s*\\(\\s*${esc(m[1])}\\s*,\\s*)${m[2]}`), para: `$1sizeof(${m[1]})` }] });
    }
    // texto fixo maior que o array
    for (const m of ctx.codigo.matchAll(/\bformat\s*\(\s*([A-Za-z_]\w*)\s*,[^,]+,\s*"((?:\\.|[^"\\])*)"/g)) {
      const t = tam(m[1]);
      const base = m[2].replace(/%[-0-9.]*[a-zA-Z]/g, "").length;
      if (t && /^\d+$/.test(t) && base >= +t) out.push({ nivel: "provavel", linha: ctx.linhaDe(m.index), titulo: `{{${m[1]}}} é pequeno pra esse texto`,
        porque: `Só o texto fixo já tem ${base} letras e {{${m[1]}}} tem ${t} posições (contando o fim do texto). A mensagem vai sair **cortada**.`,
        correcao: `Aumente: {{new ${m[1]}[${Math.min(144, Math.ceil((base + 32) / 16) * 16)}]}}` });
    }
    return out;
  } });

  // mensagem fixa com mais de 144 caracteres
  R.push({ id: "mensagem-144", modulo: "execução", verificar(ctx) {
    const out = [];
    for (const m of ctx.codigo.matchAll(/\bSendClientMessage(?:ToAll)?\s*\([^"]*"((?:\\.|[^"\\])*)"/g)) {
      const visivel = m[1].replace(/\{[0-9A-Fa-f]{6}\}/g, "");
      if (m[1].length > 144) out.push({ nivel: "provavel", linha: ctx.linhaDe(m.index), titulo: "Mensagem com mais de 144 caracteres",
        porque: `O chat do SA-MP corta (ou nem mostra) mensagens acima de **144** caracteres. Essa tem ${m[1].length}${visivel.length !== m[1].length ? " (contando os códigos de cor)" : ""}.`,
        correcao: "Divida em duas mensagens." });
    }
    return out;
  } });

  // GetPlayerName com array pequeno
  R.push({ id: "nome-pequeno", modulo: "execução", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes.length ? ctx.funcoes : []) {
      for (const m of f.corpo.matchAll(/\bGetPlayerName\s*\(\s*\w+\s*,\s*([A-Za-z_]\w*)\s*,/g)) {
        const t = f.locais.get(m[1]) || ctx.globais.get(m[1]);
        if (t && /^\d+$/.test(t) && +t < 24) out.push({ nivel: "provavel", linha: linhaDentro(ctx, f, m.index), titulo: "Array pequeno pro nome",
          porque: `Nomes no SA-MP têm até **24** caracteres ({{MAX_PLAYER_NAME}}). Com {{[${t}]}} nomes grandes saem cortados.`,
          correcao: `Use {{new ${m[1]}[MAX_PLAYER_NAME]}}.` });
      }
    }
    return out;
  } });

  // timer chamando função que não é public
  R.push({ id: "timer-sem-public", modulo: "execução", verificar(ctx) {
    const out = [];
    for (const m of ctx.codigo.matchAll(/\bSetTimer(?:Ex)?\s*\(\s*"(\w+)"/g)) {
      const f = ctx.funcoes.find(x => x.nome === m[1]);
      const L = ctx.linhaDe(m.index);
      if (f && f.tipo !== "public") out.push({ nivel: "erro", linha: L, titulo: `O timer chama {{${m[1]}}}, mas ela não é {{public}}`,
        porque: "O SetTimer procura a função **pelo nome** em tempo de execução, e só acha funções {{public}}. Do jeito que está, o timer **nunca roda**.",
        correcao: `Crie {{forward ${m[1]}(${f.params.map(p => (p.tag ? p.tag + ":" : "") + p.nome + (p.array ? "[]" : "")).join(", ")});}} e troque por {{public ${m[1]}(...)}}.`,
        correcoes: [{ tipo: "trocar", linha: f.linha, de: /^(\s*)(?:stock\s+|static\s+)?/, para: `$1public ` }, ...(ctx.forwards.has(m[1]) ? [] : [{ tipo: "inserirAntes", linha: f.linha, linhas: [`forward ${m[1]}(${f.params.map(p => (p.tag ? p.tag + ":" : "") + p.nome + (p.array ? "[]" : "")).join(", ")});`] }])] });
      else if (f && f.tipo === "public" && !ctx.forwards.has(m[1])) { /* o revisor já avisa do forward (warning 235) */ }
      else if (!f && ctx.funcoes.length) out.push({ nivel: "verificar", linha: L, titulo: `Timer chama {{${m[1]}}}, que não está neste código`,
        porque: "Se essa função não existir (ou não for public), o timer não faz nada e o SA-MP não avisa.",
        correcao: `Confira se existe {{forward ${m[1]}(...);}} e {{public ${m[1]}(...)}} em algum arquivo do gamemode.` });
    }
    return out;
  } });

  /* ---------- IDs DE JOGADOR (SA-MP) ---------- */
  // função que recebe playerid e usa como índice sem validar
  R.push({ id: "playerid-sem-validar", modulo: "ids de jogador", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes) {
      if (f.callback || f.tipo === "comando") continue;   // o SA-MP já manda um id válido nos callbacks e comandos
      for (const p of f.params.filter(p => /^(playerid|alvo|targetid|giveplayerid|id|jogador|pid|player)$/i.test(p.nome))) {
        const indexa = new RegExp(`\\[\\s*${esc(p.nome)}\\s*\\]`).test(f.corpo);
        if (!indexa || temGuarda(f.corpo, p.nome)) continue;
        out.push({ nivel: "verificar", linha: f.linha, titulo: `{{${f.nome}}} não confere se o {{${p.nome}}} é válido`,
          porque: `A função usa {{[${p.nome}]}} como posição de array. Se alguém chamar ela com um id inválido (ex: {{INVALID_PLAYER_ID}}, que é 65535 e é o que o sscanf devolve quando não acha o jogador), dá **"array index out of bounds"** e o comando para no meio.`,
          correcao: `Se ela pode receber ids de fora (comando de admin, timer...), valide no começo: {{if (!IsPlayerConnected(${p.nome})) ${retornoPadrao(f)}}}. Se você já confere antes de chamar, está ok.`,
          correcoes: [inserirNoInicio(ctx, f, `if (!IsPlayerConnected(${p.nome})) ${retornoPadrao(f)}`)], seguro: true });
      }
    }
    return out;
  } });

  // sscanf com "u" e depois usa o id sem conferir se está conectado
  R.push({ id: "sscanf-id-sem-validar", modulo: "ids de jogador", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes) {
      for (const m of chamadasSscanf(f)) {
        const espec = m.espec, vars = m.vars;
        m[1] = m.formato;
        const L = linhaDentro(ctx, f, m.index);
        const depois = f.corpo.slice(m.index);
        [...espec].forEach((e, i) => {
          if (!/[uUrRqQ]/.test(e) || !vars[i] || !/^[A-Za-z_]\w*$/.test(vars[i])) return;
          const v = vars[i];
          if (temGuarda(depois, v)) return;
          if (!new RegExp(`\\b${esc(v)}\\b`).test(depois.slice(depois.indexOf(";") + 1))) return;
          const usa = new RegExp(`\\[\\s*${esc(v)}\\s*\\]`).test(depois) ? "como posição de array" : "nas funções";
          out.push({ nivel: "provavel", linha: L, titulo: `Não confere se o jogador {{${v}}} existe`,
            porque: `Se o nome/id digitado não for de ninguém online, o sscanf com {{"${e}"}} coloca {{INVALID_PLAYER_ID}} em {{${v}}}. Usar ele ${usa} dá ${usa === "como posição de array" ? "**array index out of bounds** (o comando quebra)" : "um comando que \"funciona\" sem fazer nada, sem avisar o jogador"}.`,
            correcao: `Logo depois do sscanf: {{if (!IsPlayerConnected(${v})) return SendClientMessage(playerid, -1, "Jogador nao conectado.");}}`,
            correcoes: f.params.some(p => p.nome === "playerid") ? [{ tipo: "inserirDepois", linha: L, linhas: [recuoDe(ctx.linhas[L - 1]) + `if (!IsPlayerConnected(${v})) return SendClientMessage(playerid, -1, "Jogador nao conectado.");`] }] : [], seguro: true });
        });
        // sscanf solto (sem if): não avisa quem digitou errado
        const antes = f.corpo.slice(Math.max(0, m.index - 40), m.index);
        if (!/(if|while)\s*\(\s*!?\s*$|=\s*$|return\s+$|&&\s*$|\|\|\s*$|\(\s*$/.test(antes)) out.push({ nivel: "provavel", linha: L, titulo: "{{sscanf}} sem conferir o resultado",
          porque: "O sscanf devolve **diferente de 0 quando o jogador digitou errado** (faltou parâmetro). Sem um {{if}}, o comando segue com valores zerados.",
          correcao: `{{if (sscanf(...)) return SendClientMessage(playerid, -1, "Use: /comando [parametros]");}}` });
      }
    }
    return out;
  } });

  // OnPlayerDeath usando killerid sem conferir INVALID_PLAYER_ID
  R.push({ id: "killerid-invalido", modulo: "ids de jogador", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes.filter(f => f.nome === "OnPlayerDeath")) {
      const k = (f.params[1] || {}).nome || "killerid";
      const usa = f.corpo.match(new RegExp(`\\[\\s*${esc(k)}\\s*\\]|\\w+\\s*\\(\\s*${esc(k)}\\s*[,)]`));
      if (usa && !temGuarda(f.corpo, k)) out.push({ nivel: "provavel", linha: linhaDentro(ctx, f, usa.index), titulo: `{{${k}}} usado sem conferir se alguém matou`,
        porque: `Quando o jogador morre **sozinho** (queda, explosão, /kill), {{${k}}} vem como {{INVALID_PLAYER_ID}} (65535). Usar ele ${/\[/.test(usa[0]) ? "como posição de array dá **array index out of bounds**" : "chama a função com um id que não existe"}.`,
        correcao: `Envolva com {{if (${k} != INVALID_PLAYER_ID) { ... }}}` });
    }
    return out;
  } });

  // OnDialogResponse sem conferir o dialogid
  R.push({ id: "dialog-sem-id", modulo: "sistemas SA-MP", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes.filter(f => f.nome === "OnDialogResponse")) {
      const d = (f.params[1] || {}).nome || "dialogid";
      if (/\b(listitem|inputtext|response)\b/.test(f.corpo) && !new RegExp(`\\b${esc(d)}\\b`).test(f.corpo)) out.push({ nivel: "provavel", linha: f.linha, titulo: "Não confere **qual** dialog respondeu",
        porque: `Todo dialog do servidor cai nesse mesmo callback. Sem testar {{${d}}}, a resposta de um dialog é tratada como se fosse de outro.`,
        correcao: `{{if (${d} == DIALOG_MEU) { ... return 1; }}} e {{return 0;}} no final.` });
      for (const m of f.corpo.matchAll(/\b([A-Za-z_]\w*)\s*\[\s*listitem\s*\]/g)) {
        if (/listitem\s*(<|>=|>)/.test(f.corpo)) continue;
        out.push({ nivel: "verificar", linha: linhaDentro(ctx, f, m.index), titulo: `{{${m[1]}[listitem]}}: o listitem cabe no array?`,
          porque: `O {{listitem}} é a linha que o jogador escolheu. Se a lista do dialog tiver mais linhas que o tamanho de {{${m[1]}}}, dá array index out of bounds.`,
          correcao: `Confira se o número de opções do dialog é igual ao tamanho de {{${m[1]}}}, ou use {{if (listitem < sizeof(${m[1]}))}}.` });
      }
    }
    return out;
  } });

  /* ---------- SEGURANÇA (dinheiro, permissões, valores) ---------- */
  // quantidade negativa: parâmetro de quantidade somado sem conferir
  R.push({ id: "quantidade-negativa", modulo: "segurança", verificar(ctx) {
    const out = [];
    const QTD = /^(xp|exp|qtd|quantidade|quant|valor|quantia|dinheiro|grana|money|amount|pontos|score|item_qtd|vezes|preco|custo)$/i;
    for (const f of ctx.funcoes) {
      for (const p of f.params.filter(p => QTD.test(p.nome) && !p.array)) {
        const soma = f.corpo.match(new RegExp(`(\\+=|-=)\\s*${esc(p.nome)}\\b|GivePlayerMoney\\s*\\(\\s*\\w+\\s*,\\s*-?\\s*${esc(p.nome)}\\s*\\)`));
        if (!soma || new RegExp(`${esc(p.nome)}\\s*(<|<=|>|>=)\\s*-?\\d|\\d\\s*(<|<=|>|>=)\\s*${esc(p.nome)}\\b|clamp\\s*\\(\\s*${esc(p.nome)}`).test(f.corpo)) continue;
        out.push({ nivel: "verificar", linha: f.linha, titulo: `{{${f.nome}}} aceita **${p.nome} negativo**?`,
          porque: `Nada impede chamar {{${f.nome}(..., -500)}}. Aí ${/xp|exp/i.test(p.nome) ? "o XP **diminui** (e pode ficar negativo)" : "o valor **é tirado** em vez de dado"}. Se algum comando passa um número que o jogador digitou, isso vira **brecha**.`,
          correcao: `Se nunca deve ser negativo, recuse no começo: {{if (${p.nome} <= 0) ${retornoPadrao(f)}}}`,
          correcoes: [inserirNoInicio(ctx, f, `if (${p.nome} <= 0) ${retornoPadrao(f)}`)], seguro: true });
      }
      // valor vindo do sscanf usado em dinheiro sem conferir
      for (const m of chamadasSscanf(f)) {
        const espec = m.espec, vars = m.vars;
        const L = linhaDentro(ctx, f, m.index);
        [...espec].forEach((e, i) => {
          const v = vars[i];
          if (!/[idIDhHfF]/.test(e) || !v || !/^[A-Za-z_]\w*$/.test(v)) return;
          const usoDinheiro = new RegExp(`GivePlayerMoney\\s*\\([^;]*\\b${esc(v)}\\b|\\[\\s*\\w*(Dinheiro|dinheiro|Money|money|Grana|grana|Banco|banco|Cash|cash|Saldo|saldo)\\w*\\s*\\]\\s*[-+]?=[^;]*\\b${esc(v)}\\b`).test(f.corpo);
          if (!usoDinheiro) return;
          const confereMin = new RegExp(`${esc(v)}\\s*(<|<=)\\s*[01]\\b|${esc(v)}\\s*<\\s*\\w+|[01]\\s*(>|>=)\\s*${esc(v)}\\b`).test(f.corpo);
          const confereSaldo = new RegExp(`${esc(v)}\\s*>\\s*(GetPlayerMoney|\\w+\\s*\\[)|GetPlayerMoney\\s*\\([^)]*\\)\\s*<\\s*${esc(v)}`).test(f.corpo);
          const tiraDoJogador = new RegExp(`GivePlayerMoney\\s*\\(\\s*playerid\\s*,\\s*-\\s*${esc(v)}\\s*\\)|-=\\s*${esc(v)}\\b`).test(f.corpo);
          if (!confereMin) out.push({ nivel: "provavel", linha: L, titulo: `{{${v}}} negativo vira **brecha de dinheiro**`,
            porque: `O jogador pode digitar um número negativo (ex: {{-50000}}). ${tiraDoJogador ? "Aí \"tirar\" dele vira **ganhar**, e o outro perde." : "Aí o comando **tira** dinheiro em vez de dar."}`,
            correcao: `Depois do sscanf: {{if (${v} < 1) return SendClientMessage(playerid, -1, "Valor invalido.");}}`,
            correcoes: f.params.some(p => p.nome === "playerid") ? [{ tipo: "inserirDepois", linha: L, linhas: [recuoDe(ctx.linhas[L - 1]) + `if (${v} < 1) return SendClientMessage(playerid, -1, "Valor invalido.");`] }] : [], seguro: true });
          if (tiraDoJogador && !confereSaldo) out.push({ nivel: "provavel", linha: L, titulo: `Não confere se o jogador **tem** esse dinheiro`,
            porque: `Ele pode transferir mais do que tem, e o dinheiro dele fica **negativo** (dinheiro surgindo do nada pro outro).`,
            correcao: `{{if (${v} > GetPlayerMoney(playerid)) return SendClientMessage(playerid, -1, "Voce nao tem esse dinheiro.");}}`,
            correcoes: f.params.some(p => p.nome === "playerid") ? [{ tipo: "inserirDepois", linha: L, linhas: [recuoDe(ctx.linhas[L - 1]) + `if (${v} > GetPlayerMoney(playerid)) return SendClientMessage(playerid, -1, "Voce nao tem esse dinheiro.");`] }] : [], seguro: true });
        });
      }
    }
    return out;
  } });

  // comando que mexe em outro jogador / servidor sem checar permissão
  R.push({ id: "comando-sem-permissao", modulo: "segurança", verificar(ctx) {
    const out = [];
    const PERIGO = /\b(Kick|Ban|BanEx|SendRconCommand|SetPlayerHealth|SetPlayerArmour|GivePlayerWeapon|ResetPlayerWeapons|SetPlayerScore|SetPlayerPos|SetPlayerSkin|SetPlayerInterior|SetPlayerVirtualWorld|TogglePlayerControllable|SetPlayerWantedLevel|GivePlayerMoney|ResetPlayerMoney|SetPlayerName|GameModeExit)\s*\(\s*([A-Za-z_]\w*)/g;
    const PERMISSAO = /IsPlayerAdmin|admin|Admin|ADMIN|adm\b|Adm|nivelAdm|Staff|staff|Mod\b|moderador|Moderador|VIP|vip|Vip|Lider|lider|Cargo|cargo|Permiss|permiss/;
    for (const f of ctx.funcoes.filter(f => f.tipo === "comando")) {
      // permissão de verdade = a palavra aparece numa CONDIÇÃO que barra (if ... return), e não em qualquer lugar (ex: Admin[alvo] = nivel)
      const condicoes = [...f.corpo.matchAll(/\bif\s*\(/g)].map(m => { const ini = m.index + m[0].length - 1, fim = fechaParen(f.corpo, ini); return fim > 0 ? f.corpo.slice(ini, fim + 1) + f.corpo.slice(fim + 1, fim + 60) : ""; });
      if (condicoes.some(c => PERMISSAO.test(c.split(")")[0] + ")") && /playerid/.test(c) && /\breturn\b/.test(c))) continue;
      // checagem própria do servidor: if (!TemPerm(playerid, ...)) return / if (Cargo[playerid] < 2) return
      if (/\bif\s*\(\s*!?\s*(Tem|Pode|Eh|E|Is|Has|Can|Checar|Checa|Verificar|Verifica|Nivel|Level|Perm|Acesso)\w*\s*\(\s*playerid\b/i.test(f.corpo)) continue;
      const acoes = [...f.corpo.matchAll(PERIGO)].filter(m => m[2] !== "playerid" || /^(SendRconCommand|GameModeExit)$/.test(m[1]));
      const global = /\b(SendRconCommand|GameModeExit)\s*\(/.test(f.corpo);
      if (!acoes.length && !global) continue;
      // pagar/transferir é coisa de jogador comum (tira de um, dá pro outro)
      if (acoes.every(a => a[1] === "GivePlayerMoney") && /GivePlayerMoney\s*\(\s*playerid\s*,\s*-/.test(f.corpo)) continue;
      const nomesAcoes = [...new Set(acoes.map(a => a[1]))].slice(0, 3).join(", ");
      const sens = /^(kick|ban|banir|kickar|dar|set|setar|tp|ir|trazer|puxar|congelar|descongelar|desarmar|darxp|setlevel|setadmin|daradmin|god|jetpack|matar|slap|reiniciar|gmx|limpar|arma|vida|colete|skin|score)/i.test(f.nome);
      out.push({ nivel: sens || global ? "provavel" : "verificar", linha: f.linha, titulo: `/${f.nome} não confere **permissão**`,
        porque: `O comando usa ${nomesAcoes || "uma ação do servidor"} em ${global ? "o **servidor inteiro**" : "**outro jogador**"}, e **qualquer pessoa** consegue usar. ${sens ? "Pelo nome, parece comando de admin." : "Se for de propósito (todo mundo pode), tudo bem."}`,
        correcao: "Confira o nível de admin **antes de tudo**: {{if (!IsPlayerAdmin(playerid)) return SendClientMessage(playerid, -1, \"Sem permissao.\");}} (troque {{IsPlayerAdmin}}, que é o admin RCON, pelo seu sistema de admin, ex: {{Jogador[playerid][jAdmin] < 1}}).",
        correcoes: sens || global ? [inserirNoInicio(ctx, f, `if (!IsPlayerAdmin(playerid)) return SendClientMessage(playerid, -1, "Sem permissao.");`)] : [], seguro: sens || global, suposicao: "usei {{IsPlayerAdmin}} (admin RCON): troque pelo seu sistema de admin" });
    }
    return out;
  } });

  // comando sem return no final -> "SERVER: Unknown command"
  R.push({ id: "comando-sem-return", modulo: "sistemas SA-MP", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes.filter(f => f.tipo === "comando")) {
      const fim = f.corpo.replace(/\s+$/, "");
      if (!/\breturn\b[^;]*;\s*$/.test(fim) && !/\breturn\b/.test(fim.slice(-80))) {
        out.push({ nivel: "provavel", linha: f.linhaFim, titulo: `/${f.nome} não termina com {{return 1;}}`,
          porque: "No zcmd, se o comando não retorna 1, o jogador vê **\"SERVER: Unknown command\"** mesmo o comando tendo funcionado.",
          correcao: "Coloque {{return 1;}} antes da {{}}} final.",
          correcoes: [{ tipo: "inserirAntes", linha: f.linhaFim, linhas: [recuoDe(ctx.linhas[f.linha] || "    ").replace(/^$/, "    ") + "return 1;"] }] });
      }
    }
    return out;
  } });

  /* ---------- SISTEMAS DE RP (XP, inventário, dinheiro) ---------- */
  // quantidade de item / dinheiro que pode ficar negativa
  R.push({ id: "pode-ficar-negativo", modulo: "sistemas SA-MP", verificar(ctx) {
    const out = [];
    for (const m of ctx.limpo.matchAll(/([A-Za-z_]\w*(?:\s*\[[^\]]+\])+)\s*-=\s*([^;]+);/g)) {
      if (!/(qtd|quant|amount|municao|ammo|combustivel|fome|sede|estoque|unidades)/i.test(m[1])) continue;
      m[3] = m[2];
      const resto = ctx.limpo.slice(m.index, m.index + 300);
      if (/(<=|<)\s*0|<\s*1/.test(resto) || /if\s*\([^)]*>=/.test(ctx.limpo.slice(Math.max(0, m.index - 200), m.index))) continue;
      out.push({ nivel: "sugestao", linha: ctx.linhaDe(m.index), titulo: "Esse valor pode ficar **negativo**",
        porque: `Depois de {{-= ${m[3].trim()}}} nada confere se {{${m[1].replace(/\s+/g, "")}}} passou de zero.`,
        correcao: `Confira antes de tirar (ex: {{if (${m[1].replace(/\s+/g, "")} < ${m[3].trim()}) return ...;}}) ou zere quando ficar abaixo de 0.` });
    }
    return out;
  } });

  // mexe em dados que parecem de conta e não salva em lugar nenhum deste código
  R.push({ id: "dados-salvos", modulo: "contexto", verificar(ctx) {
    const muda = ctx.limpo.match(/\[\s*\w*(XP|Xp|xp|Exp|exp|Nivel|nivel|Level|level|Dinheiro|dinheiro|Money|money|Banco|banco|Admin|admin|Item|item|Inv|inv|Org|org|Cargo|cargo|Emprego|emprego|Vip|VIP|vip)\w*\s*\]\s*(\+\+|--|[-+]?=(?!=))/);
    if (!muda) return [];
    if (/DOF2_|mysql_|INI_|db_query|dini_|fwrite|Salvar\w*\s*\(|Save\w*\s*\(|cache_|SQL|sqlite/i.test(ctx.limpo)) return [];
    return [{ nivel: "verificar", linha: ctx.linhaDe(muda.index), titulo: "Esses dados são **salvos** em outro lugar?",
      porque: "O código muda dados que parecem ser da **conta** do jogador, mas não tem nada salvando aqui. Se não forem salvos em outro arquivo (ex: no {{OnPlayerDisconnect}}), o jogador **perde** quando sai ou o servidor reinicia.",
      correcao: "Confira se a sua função de salvar conta (DOF2/MySQL) grava esses campos. Se não grava, adicione." }];
  } });

  // variáveis / arrays / campos de enum que não estão declarados no código enviado
  R.push({ id: "nao-declarado", modulo: "contexto", verificar(ctx) {
    const declarados = new Set([...ctx.globais.keys(), ...ctx.membros, ...ctx.defines, ...ctx.forwards, ...ctx.natives, ...ctx.funcoes.map(f => f.nome)]);
    const faltam = new Map();
    const CONTEXTO = /^(playerid|params|cmdtext|inputtext|listitem|response|dialogid|killerid|reason|vehicleid|newstate|oldstate|newkeys|oldkeys|text|i|j|k|issuerid|amount|weaponid|bodypart|pickupid|classid|ispassenger|success|ip|password)$/;
    const olhar = (txt, base, locaisPermitidos) => {
      const t = txt.replace(/#[^\n]*/g, "");
      for (const m of t.matchAll(/(?<![\w.:@])([A-Za-z_]\w*)\b(?!\s*\()(?!\s*:(?!:))/g)) {
        const nome = m[1];
        if (RESERVADAS.has(nome) || declarados.has(nome) || locaisPermitidos.has(nome) || ehConhecido(nome) || /^[A-Z][A-Z0-9_]+$/.test(nome) || /^\d/.test(nome)) continue;
        if (ctx.solto && CONTEXTO.test(nome)) continue;
        const antes = t.slice(Math.max(0, m.index - 6), m.index);
        if (/(new|static|const|enum|forward|native|stock|public)\s+$/.test(antes)) continue;
        if (!faltam.has(nome)) faltam.set(nome, ctx.linhaDe(base + m.index));
      }
    };
    for (const f of ctx.funcoes) olhar(f.corpo, f.abre + 1, new Set([...f.locais.keys(), ...f.params.map(p => p.nome)]));
    if (ctx.solto) {
      const locaisSoltos = new Set();
      for (const d of ctx.fora.matchAll(/\b(?:new|static)\s+([^;]+);/g)) declaracoes(d[1]).forEach(([n]) => locaisSoltos.add(n));
      for (const d of ctx.fora.matchAll(/\bfor\s*\(\s*new\s+(?:\w+:)?([A-Za-z_]\w*)/g)) locaisSoltos.add(d[1]);
      olhar(ctx.fora, 0, locaisSoltos);
    }
    if (!faltam.size) return [];
    const nomes = [...faltam.keys()];
    const outrosArquivos = ctx.includesProprios.length || ctx.includes.some(i => !/^(a_samp|open\.mp|omp|zcmd|sscanf2|sscanf|DOF2|dof2|foreach|streamer|a_mysql|Pawn\.CMD|izcmd|easyDialog|YSI.*)$/i.test(i));
    const certeza = ctx.completo && !outrosArquivos ? "provavel" : "verificar";
    return [{ nivel: certeza, linha: faltam.get(nomes[0]), titulo: `Não vi onde ${nomes.length > 1 ? "estes são declarados" : "isto é declarado"}: ${nomes.slice(0, 8).map(n => `{{${n}}}`).join(", ")}${nomes.length > 8 ? "..." : ""}`,
      porque: certeza === "provavel"
        ? "Você mandou o arquivo inteiro e não achei a declaração (nem nos includes padrão). Se não estiverem em outro include, o compilador vai dar **error 017: undefined symbol**."
        : "Você mandou só **um pedaço** do código, então eles provavelmente estão declarados em outro lugar (outro arquivo, include, ou mais em cima no gamemode). **Não é erro** só por não estar aqui.",
      correcao: `Confira se existe ${nomes.slice(0, 3).map(n => ctx.membros.size || /^[a-z]{1,3}[A-Z]/.test(n) ? `o campo {{${n}}} no enum` : `{{new ${n}}}`).join(", ")}${nomes.length > 3 ? " (e os outros)" : ""} em algum lugar do gamemode, com o nome escrito igualzinho.`,
      nomes }];
  } });

  /* ---------- SEMÂNTICA (dependências, assinaturas, retorno, variáveis) ---------- */
  // usa função de include/plugin sem o #include dela
  const DEPENDENCIAS = [
    [/\bsscanf\s*\(/, /sscanf/i, "sscanf2", "plugin **sscanf** (sscanf.dll/.so + {{#include <sscanf2>}})"],
    [/\b(CMD|COMMAND)\s*:\s*\w+\s*\(/, /zcmd|izcmd|Pawn\.CMD|y_commands|YSI/i, "zcmd", "include **zcmd** ({{#include <zcmd>}}), ou Pawn.CMD"],
    [/\bDOF2_\w+\s*\(/, /DOF2/i, "DOF2", "include **DOF2** ({{#include <DOF2>}})"],
    [/\bforeach\s*\(/, /foreach|y_iterate|YSI/i, "foreach", "include **foreach** ({{#include <foreach>}}) ou YSI"],
    [/\bmysql_\w+\s*\(|\bcache_\w+\s*\(/, /a_mysql|mysql/i, "a_mysql", "plugin **MySQL** ({{#include <a_mysql>}})"],
    [/\b(CreateDynamic\w*|Streamer_\w+)\s*\(/, /streamer/i, "streamer", "plugin **streamer** ({{#include <streamer>}})"],
    [/\bbcrypt_\w+\s*\(/, /bcrypt/i, "bcrypt", "plugin **bcrypt**"],
  ];
  R.push({ id: "dependencia-ausente", modulo: "semântica", verificar(ctx) {
    if (!ctx.temInclude) return [];   // trecho sem includes: não dá pra saber o que o arquivo inclui
    const out = [];
    const incs = ctx.includes.concat(ctx.includesProprios).join(" ");
    for (const [usa, inc, nome, descricao] of DEPENDENCIAS) {
      const m = ctx.limpo.match(usa);
      if (!m || inc.test(incs)) continue;
      if (/sscanf/.test(nome) && ctx.natives.has("sscanf")) continue;
      // só um include solto (trecho de exemplo) ou includes próprios: pode estar em outro lugar
      const proprio = ctx.includesProprios.length > 0 || !ctx.includes.some(i => /^(a_samp|open\.mp|omp)$/i.test(i));
      out.push({ nivel: proprio ? "verificar" : "provavel", linha: ctx.linhaDe(m.index), titulo: `Usa ${nome === "zcmd" ? "{{CMD:}}" : `{{${m[0].replace(/\s*\($/, "").trim()}}}`} mas não tem o include`,
        porque: `Isso vem do ${descricao}, e ele não está nos {{#include}} do arquivo.`,
        consequencia: nome === "zcmd" ? "Pior que erro: **compila** (só com warning 203) e o comando **nunca funciona**, porque sem o zcmd o {{CMD:}} vira uma função comum que ninguém chama." : "O compilador para com **error 017: undefined symbol** quando a função é usada.",
        quando: proprio ? "Se nenhum dos seus includes próprios incluir ele por dentro." : "Sempre, ao compilar.",
        correcao: `Adicione {{#include <${nome}>}} junto dos outros includes (e, se for plugin, instale o arquivo na pasta {{plugins}}).`,
        correcoes: proprio ? [] : [{ tipo: "inserirDepois", linha: ctx.linhaDe(ctx.codigo.lastIndexOf("#include", ctx.codigo.indexOf("\n", ctx.codigo.search(/#include/)) + 0)), linhas: [`#include <${nome}>`] }] });
    }
    return out;
  } });

  // quantidade de argumentos diferente da assinatura conhecida (só nativas que eu tenho certeza)
  const ASSINATURAS = {
    SendClientMessage: [3, 3], SendClientMessageToAll: [2, 2], SetPlayerHealth: [2, 2], SetPlayerArmour: [2, 2], GivePlayerMoney: [2, 2], ResetPlayerMoney: [1, 1],
    SetPlayerScore: [2, 2], GetPlayerScore: [1, 1], SetPlayerPos: [4, 4], GetPlayerPos: [4, 4], SetPlayerSkin: [2, 2], SetPlayerInterior: [2, 2], SetPlayerVirtualWorld: [2, 2],
    GivePlayerWeapon: [3, 3], ResetPlayerWeapons: [1, 1], Kick: [1, 1], Ban: [1, 1], BanEx: [2, 2], IsPlayerConnected: [1, 1], GetPlayerName: [3, 3], SetPlayerName: [2, 2],
    GameTextForPlayer: [4, 4], GameTextForAll: [3, 3], ShowPlayerDialog: [7, 7], PutPlayerInVehicle: [3, 3], CreateVehicle: [8, 9], AddStaticVehicle: [7, 7],
    SetPlayerCheckpoint: [5, 5], DisablePlayerCheckpoint: [1, 1], TogglePlayerControllable: [2, 2], SetPlayerColor: [2, 2], SetTimer: [3, 3], KillTimer: [1, 1],
    TextDrawCreate: [3, 3], TextDrawShowForPlayer: [2, 2], TextDrawHideForPlayer: [2, 2], PlayerPlaySound: [5, 5], SetPlayerWantedLevel: [2, 2], GetPlayerMoney: [1, 1],
    SetGameModeText: [1, 1], AddPlayerClass: [11, 11], SetSpawnInfo: [13, 13], SpawnPlayer: [1, 1], GetPlayerHealth: [2, 2], GetPlayerArmour: [2, 2],
  };
  function argumentos(txt, ini) {
    const fim = fechaParen(txt, ini);
    if (fim < 0) return null;
    const dentro = txt.slice(ini + 1, fim);
    if (!dentro.trim()) return 0;
    let p = 0, n = 1;
    for (const ch of dentro) { if ("([{".includes(ch)) p++; else if (")]}".includes(ch)) p--; else if (ch === "," && !p) n++; }
    return n;
  }
  R.push({ id: "assinatura-errada", modulo: "semântica", verificar(ctx) {
    const out = [];
    const proprias = new Set(ctx.funcoes.map(f => f.nome).concat([...ctx.natives], [...ctx.defines]));
    for (const m of ctx.limpo.matchAll(/(?<![\w.:])([A-Z][A-Za-z]+)\s*\(/g)) {
      const sig = ASSINATURAS[m[1]];
      if (!sig || proprias.has(m[1])) continue;
      const antes = ctx.limpo.slice(Math.max(0, m.index - 12), m.index);
      if (/(native|forward|stock|public)\s+$/.test(antes)) continue;
      const n = argumentos(ctx.limpo, m.index + m[0].length - 1);
      if (n === null || (n >= sig[0] && n <= sig[1])) continue;
      out.push({ nivel: "erro", linha: ctx.linhaDe(m.index), titulo: `{{${m[1]}}} com ${n} argumento(s); ela recebe ${sig[0] === sig[1] ? sig[0] : sig[0] + " a " + sig[1]}`,
        porque: `A assinatura do {{${m[1]}}} no SA-MP tem ${sig[0] === sig[1] ? sig[0] : `de ${sig[0]} a ${sig[1]}`} parâmetro(s). Digite **${m[1]}** aqui no chat pra ver a ordem certa.`,
        consequencia: "O compilador mostra só **warning 202** (número de argumentos não bate), ou **error 035** se o tipo também não bater. Com warning, compila e a função recebe valores **errados** em tempo de execução.",
        quando: "Toda vez que essa linha roda.", correcao: `Confira os parâmetros do {{${m[1]}}}.`, compilador: "warning 202" });
    }
    return out;
  } });

  // função que às vezes devolve valor e às vezes não
  R.push({ id: "retorno-inconsistente", modulo: "semântica", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes) {
      if (f.tipo === "comando") continue;   // o comando tem regra própria
      const comValor = /\breturn\s+[^;\s][^;]*;/.test(f.corpo), semValor = /\breturn\s*;/.test(f.corpo);
      // a árvore sintática decide "termina sem return" com precisão (regra caminho-sem-retorno); aqui só sobra o caso sem árvore
      const fa = ctx.ast && ctx.ast.funcoes.find(x => x.nome === f.nome && x.linhaNome === f.linha);
      const arvoreOk = fa && !fa.parcial;
      if (comValor && semValor) out.push({ nivel: "erro", linha: f.linha, titulo: `{{${f.nome}}} mistura {{return valor;}} com {{return;}}`,
        porque: "Uma função em Pawn ou sempre devolve valor, ou nunca devolve.", consequencia: "O compilador acusa **warning 209**; no caminho do {{return;}} a função devolve **0**, e quem usa o retorno recebe 0 sem perceber.",
        quando: "Ao compilar, e quando o caminho do {{return;}} roda.", correcao: "Use {{return 0;}} (ou outro valor) em todos os retornos." });
      else if (arvoreOk && comValor && WCDEV.analiseFluxo && WCDEV.analiseFluxo.chegaNoFimSemRetorno(ctx, fa) && f.tipo !== "comando" && f.nome !== "main") {
        // pela árvore: existe um caminho (if sem else, switch sem default...) que chega na } final sem return
        out.push({ nivel: fa.callback ? "provavel" : "erro", linha: f.linhaFim, titulo: `{{${f.nome}}} pode chegar no fim **sem devolver valor**`,
          porque: "Alguns caminhos terminam com {{return valor;}}, mas existe pelo menos um caminho (um {{if}} sem {{else}}, por exemplo) que chega na {{}}} final sem {{return}}.",
          consequencia: "O compilador avisa (**warning 209**) e compila; nesse caminho a função devolve **0** (testei executando). Se 0 não é o valor certo pra esse caso, quem chama recebe um resultado errado.",
          quando: "Quando nenhuma das condições com {{return}} é verdadeira.", correcao: "Coloque um {{return}} com o valor certo antes da {{}}} final (ou um {{else}} que retorne).",
          correcoes: [{ tipo: "inserirAntes", linha: f.linhaFim, linhas: ["    return 0;"] }], compilador: "warning 209",
          teste: `Chame {{${f.nome}}} com um valor que não entra em nenhum if e imprima o resultado.` });
      }
      else if (!arvoreOk && comValor && (!/\breturn\b[^;]*;\s*$/.test(f.corpo.replace(/\s+$/, "")) || /^\s*if\s*\(.*\)\s*return\b[^;]*;\s*$/.test((f.corpo.trim().split("\n").pop() || ""))) && !/^\s*$/.test(f.corpo)) {
        // termina sem return, mas tem return com valor no meio
        const ultimo = f.corpo.replace(/\s+$/, "");
        if (/\}\s*$/.test(ultimo) && /\belse\b/.test(ultimo.slice(-200)) && (ultimo.slice(-200).match(/return/g) || []).length >= 2) continue;   // if/else que retorna nos dois
        out.push({ nivel: "provavel", linha: f.linhaFim, titulo: `{{${f.nome}}} pode terminar sem devolver valor`,
          porque: "Tem {{return}} com valor no meio, mas o fim da função não retorna nada.", consequencia: "O compilador acusa **warning 209: function should return a value**.",
          quando: "Quando nenhum dos {{return}} do meio é alcançado.", correcao: "Coloque um {{return 0;}} (ou o valor certo) antes da {{}}} final.",
          correcoes: [{ tipo: "inserirAntes", linha: f.linhaFim, linhas: ["    return 0;"] }] });
      }
    }
    return out;
  } });

  // variável local criada e nunca usada
  R.push({ id: "variavel-nao-usada", modulo: "semântica", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes) {
      for (const [nome] of f.locais) {
        const usos = (f.corpo.match(new RegExp(`(?<![\\w.])${esc(nome)}(?![\\w])`, "g")) || []).length;
        if (usos <= 1 && !/^_/.test(nome)) {
          const m = f.corpo.match(new RegExp(`\\b(new|static)\\s+[^;]*\\b${esc(nome)}\\b`));
          out.push({ nivel: "sugestao", linha: m ? linhaDentro(ctx, f, m.index) : f.linha, titulo: `{{${nome}}} é criada e nunca usada`,
            porque: "A variável ocupa memória e não serve pra nada; às vezes é sinal de que você esqueceu de usar ela.", consequencia: "O compilador mostra **warning 203** (não quebra nada).",
            quando: "Sempre que compila.", correcao: `Use {{${nome}}} onde ela deveria ser usada, ou apague a declaração.` });
        }
      }
    }
    return out;
  } });

  /* ---------- PROGRESSÃO (XP e níveis) ---------- */
  // while que sobe nível sem recalcular o XP necessário
  R.push({ id: "xp-sem-recalculo", modulo: "progressão", verificar(ctx) {
    const out = [];
    for (const f of ctx.funcoes) {
      for (const m of f.corpo.matchAll(/\bwhile\s*\(/g)) {
        const pIni = m.index + m[0].length - 1, pFim = fechaParen(f.corpo, pIni);
        const cm = f.corpo.slice(pIni + 1, pFim).match(/^\s*(.+?)\s*>=\s*([A-Za-z_]\w*)\s*$/);
        if (!cm) continue;
        const bloco = blocoDepois(f, pFim + 1);
        if (!bloco) continue;
        const corpo = f.corpo.slice(bloco[0] + 1, bloco[1]);
        const calc = f.corpo.match(new RegExp(`\\bnew\\s+${esc(cm[2])}\\s*=\\s*([^;]+);`));
        if (!calc || !/nivel|level|lvl/i.test(calc[1])) continue;
        if (!/\+\+|\+=/.test(corpo) || new RegExp(`\\b${esc(cm[2])}\\s*=(?!=)`).test(corpo)) continue;
        const L = linhaDentro(ctx, f, m.index);
        const Lfim = linhaDentro(ctx, f, bloco[1]);
        out.push({ nivel: "provavel", linha: L, titulo: `O {{${cm[2]}}} não é recalculado dentro do {{while}}`,
          porque: `{{${cm[2]}}} foi calculado **antes** do loop usando o nível. Depois que o nível sobe, o próximo nível deveria pedir mais XP, mas o loop continua usando o valor antigo.`,
          consequencia: "Com muito XP de uma vez, o jogador sobe vários níveis **pelo preço do primeiro** (progressão fácil demais).",
          quando: "Quando o XP recebido é suficiente pra mais de um nível.", correcao: `No fim do loop, recalcule: {{${cm[2]} = ${calc[1].trim()};}}`,
          correcoes: [{ tipo: "inserirAntes", linha: Lfim, linhas: [recuoDe(ctx.linhas[Lfim - 2] || "        ") + `${cm[2]} = ${calc[1].trim()};`] }] });
      }
    }
    return out;
  } });

  // zera o XP ao subir de nível (perde o que sobrou)
  R.push({ id: "xp-excedente-perdido", modulo: "progressão", verificar(ctx) {
    const out = [];
    for (const m of ctx.limpo.matchAll(/(\[\s*\w*(XP|Xp|xp|Exp|exp)\w*\s*\]|\b\w*(xp|Xp|XP)\w*)\s*=\s*0\s*;/g)) {
      const perto = ctx.limpo.slice(Math.max(0, m.index - 250), m.index + 250);
      if (!/(nivel|level|lvl)\w*\s*\]?\s*\+\+|\+\+\s*\w*(nivel|level)/i.test(perto)) continue;
      out.push({ nivel: "verificar", linha: ctx.linhaDe(m.index), titulo: "Ao subir de nível o XP é **zerado**",
        porque: "Em vez de tirar só o necessário ({{-=}}), o XP vira 0.", consequencia: "O XP que **sobrou** depois de subir de nível é perdido (ex: tinha 150 de 100, perde 50).",
        quando: "Toda vez que o jogador ganha mais XP do que faltava.", correcao: "Se quer guardar o excedente, troque por {{XP -= necessario;}}. Se zerar é a regra do seu servidor, está ok." });
    }
    return out;
  } });

  /* ---------- MELHORIA ---------- */
  R.push({ id: "loop-sem-conectado", modulo: "melhoria", verificar(ctx) {
    const out = [];
    for (const m of ctx.limpo.matchAll(/\bfor\s*\(\s*new\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*MAX_PLAYERS\s*;[^)]*\)/g)) {
      const resto = ctx.limpo.slice(m.index + m[0].length, m.index + m[0].length + 500);
      const corpo = resto.trimStart().startsWith("{") ? resto.slice(0, (() => { let p = 0, s = resto.indexOf("{"); for (let i = s; i < resto.length; i++) { if (resto[i] === "{") p++; else if (resto[i] === "}") { p--; if (!p) return i; } } return resto.length; })()) : resto.split(";")[0];
      if (temGuarda(corpo, m[1]) || /IsPlayerConnected|foreach/.test(corpo)) continue;
      if (!new RegExp(`\\(\\s*${esc(m[1])}\\s*[,)]|\\[\\s*${esc(m[1])}\\s*\\]`).test(corpo)) continue;
      out.push({ nivel: "sugestao", linha: ctx.linhaDe(m.index), titulo: "Loop passa por slots vazios",
        porque: `O loop vai de 0 a ${"{{MAX_PLAYERS}}"} (1000 no open.mp), inclusive ids sem ninguém. Funções nesses ids não fazem nada, e arrays desses ids podem ter dados velhos.`,
        correcao: `Pule quem não está online: {{if (!IsPlayerConnected(${m[1]})) continue;}} (ou use {{foreach (new ${m[1]} : Player)}}).` });
    }
    return out;
  } });

  /* ================= INVESTIGAÇÃO DE SISTEMAS (checklist) ================= */
  // não é um "achado": é o roteiro que um programador experiente seguiria olhando um sistema de XP
  function investigarXP(ctx) {
    const out = [];
    for (const f of ctx.funcoes) {
      const xp = f.corpo.match(/(\[\s*\w*(XP|Xp|xp|Exp|exp)\w*\s*\]|\b\w*(xp|XP)\w*\b)\s*(\+=|-=)/);
      const sobe = /\[\s*\w*(Nivel|nivel|Level|level|Lvl|lvl)\w*\s*\]\s*\+\+|\b\w*(nivel|level)\w*\s*\+\+/i.test(f.corpo);
      if (!xp || !sobe) continue;
      const itens = [];
      const pid = f.params.find(p => /^(playerid|alvo|targetid|id|pid)$/i.test(p.nome));
      if (pid) itens.push(f.callback || f.tipo === "comando" ? ["ok", `O {{${pid.nome}}} vem do SA-MP (callback/comando), então é válido.`]
        : temGuarda(f.corpo, pid.nome) ? ["ok", `Valida o {{${pid.nome}}} antes de usar.`] : ["atencao", `Não valida o {{${pid.nome}}}: um id inválido quebra o array.`]);
      const qtd = f.params.find(p => /^(xp|exp|qtd|quantidade|valor|pontos)$/i.test(p.nome));
      if (qtd) itens.push(new RegExp(`${esc(qtd.nome)}\\s*(<|<=)\\s*[01]\\b|[01]\\s*(>|>=)\\s*${esc(qtd.nome)}`).test(f.corpo) ? ["ok", `Recusa {{${qtd.nome}}} negativo.`] : ["depende", `Aceita {{${qtd.nome}}} negativo. Isso só é certo se você usa a função pra **tirar** XP de propósito.`]);
      const usaWhile = /\bwhile\s*\([^)]*(XP|Xp|xp|Exp|exp)/.test(f.corpo);
      itens.push(usaWhile ? ["ok", "Sobe **vários níveis** numa chamada só (usa {{while}})."] : ["depende", "Sobe **um nível por chamada** (usa {{if}}). Se o jogador pode ganhar muito XP de uma vez, use {{while}}."]);
      itens.push(/(XP|Xp|xp|Exp|exp)\w*\s*\]?\s*-=/.test(f.corpo) ? ["ok", "Guarda o **XP que sobra** (usa {{-=}})."] : /(XP|Xp|xp|Exp|exp)\w*\s*\]?\s*=\s*0\s*;/.test(f.corpo) ? ["atencao", "**Zera** o XP ao subir: o que sobrou se perde."] : ["depende", "Não consegui ver como o XP é descontado."]);
      const varReq = f.corpo.match(/\bnew\s+(\w+)\s*=\s*([^;]*(nivel|level|lvl)[^;]*);/i);
      if (varReq) {
        const recalcula = new RegExp(`\\b${esc(varReq[1])}\\s*=(?!=)`).test(f.corpo.slice(varReq.index + varReq[0].length));
        itens.push(!usaWhile ? ["ok", `O XP necessário ({{${varReq[1]}}}) é calculado pelo nível atual.`] : recalcula ? ["ok", `Recalcula o XP necessário ({{${varReq[1]}}}) depois de cada nível.`] : ["atencao", `**Não recalcula** {{${varReq[1]}}} dentro do loop: os próximos níveis saem pelo preço do primeiro.`]);
      } else itens.push(["ok", "O XP necessário é calculado direto do nível, na hora de comparar."]);
      itens.push(/MAX_(NIVEL|LEVEL|LVL)|(nivel|level|lvl)\w*\]?\s*(<|>=|>|==)\s*\d{2,}/i.test(ctx.limpo) ? ["ok", "Tem **limite máximo** de nível."] : ["depende", "Não tem **nível máximo**. Se o seu servidor tem um teto, confira antes de subir ({{if (nivel >= MAX_NIVEL) ...}})."]);
      itens.push(/SetPlayerScore\s*\(/.test(f.corpo) ? ["ok", "Atualiza o **score** (aparece no TAB)."] : ["depende", "Não atualiza o score. Se quiser o nível no TAB, use {{SetPlayerScore}} quando subir."]);
      itens.push(/DOF2_|mysql_|Salvar\w*\s*\(|Save\w*\s*\(|INI_/.test(ctx.limpo) ? ["ok", "Tem salvamento neste código."] : ["depende", "Não salva aqui. Confira se o **salvar conta** grava nível e XP (senão perde ao sair ou se o servidor cair)."]);
      const retornos = [...f.corpo.matchAll(/\breturn\s+([^;]+);/g)].map(r => r[1].trim());
      if (retornos.length) itens.push(new Set(retornos).size === 1 ? ["depende", `Sempre devolve {{${retornos[0]}}}: quem chama não fica sabendo **se subiu de nível**. Se precisar, devolva quantos níveis subiu.`] : ["ok", "O retorno muda conforme o resultado."]);
      out.push({ titulo: `Sistema de XP: ${f.nome}`, linha: f.linha, itens });
    }
    return out;
  }

  /* ================= 4. VALIDAÇÃO ================= */
  const ORDEM = { erro: 0, provavel: 1, verificar: 2, sugestao: 3 };
  // CATEGORIA = o que o problema É; NÍVEL = o quanto eu tenho certeza. São coisas separadas.
  const CATEGORIA_REGRA = {
    "if-que-devia-ser-while": "logica", "if-com-ponto-e-virgula": "compilacao", "ou-com-constante": "logica", "strcmp-invertido": "logica", "while-infinito": "logica",
    "loop-passa-do-limite": "logica", "indice-constante-fora": "compilacao", "format-tamanho": "logica", "mensagem-144": "logica", "nome-pequeno": "logica", "timer-sem-public": "logica",
    "playerid-sem-validar": "logica", "sscanf-id-sem-validar": "seguranca", "killerid-invalido": "logica", "dialog-sem-id": "logica", "quantidade-negativa": "seguranca",
    "comando-sem-permissao": "seguranca", "comando-sem-return": "logica", "pode-ficar-negativo": "logica", "dados-salvos": "integracao", "nao-declarado": "integracao",
    "dependencia-ausente": "integracao", "assinatura-errada": "logica", "retorno-inconsistente": "logica", "variavel-nao-usada": "estilo", "xp-sem-recalculo": "logica",
    "xp-excedente-perdido": "logica", "loop-sem-conectado": "desempenho",
  };
  const CATEGORIAS = {
    compilacao: ["⛔", "Erro de compilação"], logica: ["🐞", "Bug de lógica confirmado"], possivel: ["❓", "Possível bug"], seguranca: ["🔒", "Risco de segurança"],
    desempenho: ["🐢", "Desempenho"], integracao: ["🔗", "Integração (arquivos/sistemas)"], estilo: ["🎨", "Estilo"], info: ["ℹ️", "Informativo"],
  };
  // como confirmar ou desmentir cada achado (pras regras que não disseram)
  const TESTE = {
    "if-que-devia-ser-while": "Chame a função dando XP pra 3 níveis de uma vez e veja quantos níveis subiu.", "ou-com-constante": "Teste com um valor que não devia passar: ele passa.",
    "strcmp-invertido": "Digite outro comando qualquer: esse bloco roda.", "while-infinito": "Rode com a condição verdadeira: o servidor para de responder.",
    "loop-passa-do-limite": "Rode com o servidor cheio (ou force o último índice): aparece \"array index out of bounds\".", "indice-constante-fora": "Compile: error 032.",
    "format-tamanho": "Use um texto grande: outra variável muda sozinha ou o servidor cai.", "mensagem-144": "Envie a mensagem: ela aparece cortada ou não aparece.",
    "nome-pequeno": "Entre com um nome de 24 letras.", "timer-sem-public": "Coloque um print dentro da função: ele nunca aparece.",
    "playerid-sem-validar": "Chame a função com INVALID_PLAYER_ID (65535).", "sscanf-id-sem-validar": "Use o comando com um id de alguém offline.",
    "killerid-invalido": "Morra de queda (sem assassino) e veja o console.", "dialog-sem-id": "Abra outro dialog do servidor e responda: este código roda junto.",
    "quantidade-negativa": "Chame com um valor negativo.", "comando-sem-permissao": "Use o comando com uma conta sem admin.", "comando-sem-return": "Use o comando: aparece \"Unknown command\".",
    "pode-ficar-negativo": "Tire mais do que existe e veja o valor.", "dados-salvos": "Mude o valor, saia, entre de novo e confira.", "nao-declarado": "Compile o projeto inteiro: se der error 017 nesse nome, falta declarar.",
    "dependencia-ausente": "Compile: veja se aparece error 017 (ou, no caso do CMD:, se o comando responde).", "assinatura-errada": "Compile: warning 202 nesta linha.",
    "retorno-inconsistente": "Compile: warning 209.", "variavel-nao-usada": "Compile: warning 203/204.", "xp-sem-recalculo": "Dê XP pra vários níveis e compare quanto cada nível custou.",
    "xp-excedente-perdido": "Dê XP a mais que o necessário e veja se o que sobrou ficou.", "loop-sem-conectado": "Meça o tempo do loop com poucos jogadores online.",
  };
  const LIMITE = {
    erro: "Alta: o próprio código mostra o problema (ou o compilador, quando indicado). Limite: eu não executei o seu código.",
    provavel: "Média: quase sempre é bug, mas pode ser de propósito. Limite: eu não sei a regra do seu servidor; o teste acima tira a dúvida.",
    verificar: "Baixa: depende de partes do projeto que eu não vi ou da sua intenção. Limite: use o teste acima pra confirmar.",
    sugestao: "Não é erro: é melhoria.",
  };
  function validar(achados, ctx, sintaxe) {
    const vistos = new Set();
    const ok = [];
    for (const a of achados) {
      // a linha existe e tem código?
      if (!a.linha || a.linha < 1 || a.linha > ctx.linhas.length || !ctx.linhas[a.linha - 1].trim()) continue;
      const chave = a.regra + ":" + a.linha + ":" + a.titulo;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      a.trecho = ctx.linhas[a.linha - 1].trim();
      let cat = a.categoria || CATEGORIA_REGRA[a.regra] || a.categoriaRegra || "logica";
      if (a.regra === "nao-declarado" && a.nivel === "provavel") cat = "compilacao";
      if (cat === "logica" && a.nivel !== "erro") cat = "possivel";
      if (a.nivel === "sugestao" && !["desempenho", "seguranca"].includes(cat)) cat = "estilo";
      a.categoria = cat;
      a.teste = a.teste || TESTE[a.regra] || "";
      a.limites = a.limites || LIMITE[a.nivel];
      ok.push(a);
    }
    // mesma linha, mesmo problema dito por duas regras: fica o mais certo
    const final = ok.filter(a => !ok.some(b => b !== a && b.linha === a.linha && ORDEM[b.nivel] < ORDEM[a.nivel] && b.categoria === a.categoria && /retorno|return/i.test(a.titulo + b.titulo) && /retorno|return|valor/i.test(b.titulo)));
    // com erro de sintaxe, a estrutura pode ter sido mal lida: rebaixa "erro" de lógica pra "provável"
    if (sintaxe.some(s => s.tipo === "erro")) final.forEach(a => { if (a.nivel === "erro" && !a.compilador) a.nivel = "provavel"; });
    return final.sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel] || a.linha - b.linha);
  }

  /* ================= API ================= */
  const regras = { pawn: R };
  // versão das regras: muda quando uma regra é criada/alterada (os testes de regressão garantem que nada quebrou)
  const VERSAO_REGRAS = "2026.10-v2";
  const compilador = null;   // ganchos pra um compilador local de verdade (ver o topo do arquivo)

  // cache: o mesmo código analisado de novo (reabrir conversa, corrigir, reanalisar) não refaz tudo
  const cache = new Map();
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + ":" + s.length; }

  // opcoes: { arquivoDe(linha) -> "arquivo:linha", faltando: [arquivos], limiteTexto, limiteTempo, semCache }
  function analisar(codigo, lang, opcoes = {}) {
    lang = lang || (WCDEV.revisor && WCDEV.revisor.detectar(codigo)) || "pawn";
    const chaveCache = !opcoes.arquivoDe && !opcoes.semCache ? lang + ":" + hash(codigo) : null;
    if (chaveCache && cache.has(chaveCache)) { const r = cache.get(chaveCache); cache.delete(chaveCache); cache.set(chaveCache, r); return r; }
    const rev = WCDEV.revisor ? WCDEV.revisor.analisar(codigo, lang) : null;
    const sintaxe = rev ? rev.problemas : [];
    if (!regras[lang]) return { lang, sintaxe, achados: [], ctx: null, suportado: false };
    const inicio = Date.now();
    const LIMITE_TEXTO = opcoes.limiteTexto || 120000, LIMITE_TEMPO = opcoes.limiteTempo || 1500;   // código gigante ou análise lenta: para e avisa
    const cortado = codigo.length > LIMITE_TEXTO;
    if (cortado) codigo = codigo.slice(0, codigo.lastIndexOf("\n", LIMITE_TEXTO));
    let ctx;
    try { ctx = estrutura(codigo); } catch (e) { return { lang, sintaxe, achados: [], ctx: null, suportado: true, falhou: true }; }
    ctx.arquivoDe = opcoes.arquivoDe || null;
    ctx.faltando = opcoes.faltando || [];
    if (ctx.faltando.length) ctx.includesProprios.push(...ctx.faltando);
    const brutos = [], puladas = [], tempos = {};
    for (const regra of regras[lang]) {
      if (Date.now() - inicio > LIMITE_TEMPO) { puladas.push(regra.id); continue; }
      const t0 = Date.now();
      try { for (const a of regra.verificar(ctx) || []) brutos.push({ ...a, regra: regra.id, modulo: regra.modulo, categoriaRegra: regra.categoria }); }
      catch (e) { (ctx.falhasRegras = ctx.falhasRegras || []).push(regra.id + ": " + e.message); }
      tempos[regra.id] = Date.now() - t0;
    }
    const achados = validar(brutos, ctx, sintaxe);
    let investigacoes = [];
    try { investigacoes = investigarXP(ctx); } catch (e) { investigacoes = []; }
    try { const est = WCDEV.analiseFluxo && WCDEV.analiseFluxo.investigarEstado(ctx); if (est) investigacoes.push(est); } catch (e) { /* sem checklist */ }
    let compilacao = null;
    if (Analisador.compilador) { try { compilacao = Analisador.compilador(codigo); } catch (e) { compilacao = null; } }
    const r = { lang, sintaxe, achados, ctx, suportado: true, compilacao, investigacoes, cortado, puladas, tempo: Date.now() - inicio, tempos, nRegras: regras[lang].length, arvore: !!(ctx.ast && !ctx.ast.erros.length) };
    if (chaveCache) { cache.set(chaveCache, r); if (cache.size > 20) cache.delete(cache.keys().next().value); }
    return r;
  }

  /* ================= 5. CORREÇÃO ================= */
  function aplicar(codigo, correcoes) {
    const linhas = codigo.split("\n");
    // de baixo pra cima pra não bagunçar os números das linhas
    const ord = [...correcoes].sort((a, b) => b.linha - a.linha || (a.tipo === "trocar" ? -1 : 1) - (b.tipo === "trocar" ? -1 : 1));
    for (const c of ord) {
      const i = c.linha - 1;
      if (i < 0 || i >= linhas.length) continue;
      if (c.tipo === "trocar") linhas[i] = linhas[i].replace(c.de, c.para);
      else if (c.tipo === "inserirDepois") linhas.splice(i + 1, 0, ...c.linhas);
      else if (c.tipo === "inserirAntes") linhas.splice(i, 0, ...c.linhas);
    }
    return linhas.join("\n");
  }
  // aplica as correções uma de cada vez e REVERIFICA tudo:
  //   - o revisor de sintaxe não pode achar erro novo;
  //   - a análise completa não pode achar problema sério NOVO (erro/provável que não existia);
  //   - o problema que motivou a correção tem que sumir (senão a correção só escondeu o aviso).
  // Se qualquer uma falhar, desfaz aquela correção.
  const assinatura = a => a.regra + "|" + (a.trecho || "").replace(/\s+/g, " ");
  const serio = a => a.nivel === "erro" || a.nivel === "provavel";
  function corrigir(codigo, lang, opcoes = {}) {
    const r = analisar(codigo, lang, opcoes.analise || {});
    if (!r.suportado || !r.ctx) return { codigo, aplicadas: [], puladas: r.achados || [], analise: r };
    const errosSintaxe = c => (WCDEV.revisor.analisar(c, r.lang) || { problemas: [] }).problemas.filter(p => p.tipo === "erro").length;
    const base = errosSintaxe(codigo);
    const antes = new Set(r.achados.filter(serio).map(assinatura));
    const contaRegra = (res, regra) => res.achados.filter(x => x.regra === regra).length;
    const candidatas = r.achados.filter(a => a.correcoes && a.correcoes.length && (a.nivel === "erro" || a.nivel === "provavel" || (a.seguro && opcoes.incluirSeguras !== false)));
    let atual = codigo, aplicadas = [], recusadas = [];
    // todas as correções usam as linhas do código ORIGINAL: aplica juntas, depois valida uma a uma
    const tentar = lista => aplicar(codigo, lista.flatMap(a => a.correcoes));
    for (const a of candidatas) {
      const teste = tentar([...aplicadas, a]);
      if (errosSintaxe(teste) > base) { recusadas.push({ achado: a, motivo: "criava erro de sintaxe" }); continue; }
      const depois = analisar(teste, r.lang, { ...(opcoes.analise || {}), semCache: true });
      const novos = depois.achados.filter(x => serio(x) && !antes.has(assinatura(x)) && x.regra !== a.regra);
      if (novos.length) { recusadas.push({ achado: a, motivo: `criava outro problema: ${novos[0].titulo.replace(/\{\{|\}\}|\*\*/g, "")}` }); continue; }
      a.resolveu = contaRegra(depois, a.regra) < contaRegra(r, a.regra) || a.regra === "if-que-devia-ser-while";
      aplicadas.push(a);
      atual = teste;
    }
    const final = aplicadas.length ? analisar(atual, r.lang, { ...(opcoes.analise || {}), semCache: true }) : r;
    return { codigo: atual, aplicadas, recusadas, puladas: r.achados.filter(a => !aplicadas.includes(a)), analise: r, depois: final,
      resumoVerificacao: { antes: r.achados.filter(serio).length, depois: final.achados.filter(serio).length, novos: final.achados.filter(x => serio(x) && !antes.has(assinatura(x))).length } };
  }

  /* ================= RELATÓRIO ================= */
  // quando cada problema acontece (pras regras que não disseram)
  const QUANDO = {
    "if-que-devia-ser-while": "Quando o jogador recebe XP suficiente pra mais de um nível de uma vez.",
    "if-com-ponto-e-virgula": "Sempre: a condição deixa de controlar o bloco.", "ou-com-constante": "Sempre: a condição nunca é falsa.",
    "strcmp-invertido": "Sempre que alguém digita um comando.", "while-infinito": "Quando a condição já começa verdadeira.",
    "loop-passa-do-limite": "Na última volta do loop.", "indice-constante-fora": "Ao compilar.", "format-tamanho": "Quando o texto formatado passa do tamanho real do array.",
    "mensagem-144": "Sempre que essa mensagem é enviada.", "nome-pequeno": "Com jogadores de nome comprido.", "timer-sem-public": "Sempre: o timer nunca acha a função.",
    "playerid-sem-validar": "Quando a função recebe o id de alguém offline ou INVALID_PLAYER_ID.", "sscanf-id-sem-validar": "Quando o jogador digita um id/nome de alguém que não está online.",
    "killerid-invalido": "Quando o jogador morre sem ninguém ter matado (queda, explosão, /kill).", "dialog-sem-id": "Quando o servidor tem mais de um dialog.",
    "quantidade-negativa": "Quando alguém passa um número negativo.", "comando-sem-permissao": "Sempre que um jogador comum usa o comando.",
    "comando-sem-return": "Toda vez que o comando é usado.", "pode-ficar-negativo": "Quando se tira mais do que existe.",
    "dados-salvos": "Quando o jogador sai ou o servidor reinicia.", "nao-declarado": "Ao compilar, se não estiverem declarados em outro arquivo.",
    "loop-sem-conectado": "Sempre que o loop roda.", "variavel-nao-usada": "Ao compilar (só aviso).",
  };
  const CONFIANCA = {
    erro: "Alta: o próprio código mostra o problema.", provavel: "Média: quase sempre é bug, mas depende do que você queria.",
    verificar: "Depende do resto do projeto: eu só vi este código.", sugestao: "Não é erro: é uma melhoria.",
  };
  const ROTULO = {
    erro: ["❌", "Erro confirmado", "Erros confirmados"], provavel: ["⚠️", "Problema provável", "Problemas prováveis"],
    verificar: ["🔍", "Risco potencial", "Riscos potenciais (dependem do projeto)"], sugestao: ["💡", "Melhoria recomendada", "Melhorias recomendadas"],
  };
  // um achado no formato do painel (também usado pela análise de projeto)
  function paraPainel(a, linhaDe) {
    const cat = CATEGORIAS[a.categoria] || CATEGORIAS.logica;
    return {
      nivel: a.nivel, rotulo: ROTULO[a.nivel][1], linha: a.linha, titulo: a.titulo, trecho: a.trecho, modulo: a.modulo, regra: a.regra,
      categoria: a.categoria, rotuloCategoria: cat[1], icone: cat[0], arquivo: a.arquivo || "",
      porque: a.porque, consequencia: a.consequencia || "", quando: a.quando || QUANDO[a.regra] || "", correcao: a.correcao, exemplo: a.exemplo || "",
      confianca: CONFIANCA[a.nivel], limites: a.limites || "", teste: a.teste || "", compilador: a.compilador || "",
      evidencias: (a.evidencias || []).slice(0, 6).map(e => ({ linha: e.linha, texto: e.texto, arquivo: e.arquivo || "", trecho: e.trecho || (linhaDe && linhaDe(e.linha) ? String(linhaDe(e.linha)).trim().slice(0, 90) : "") })),
    };
  }
  // monta um bloco ~~~analise (JSON) que a interface desenha como painel; o texto fica salvo na conversa
  function relatorio(r, opcoes = {}) {
    const { achados, sintaxe, ctx } = r;
    const dados = {
      curto: !!opcoes.curto, versao: VERSAO_REGRAS,
      linhas: ctx ? ctx.linhas.length : 0, funcoes: ctx ? ctx.funcoes.length : 0, regras: r.nRegras || 0, tempo: r.tempo || 0,
      trecho: !!(ctx && !ctx.completo), cortado: !!r.cortado, puladas: (r.puladas || []).length,
      sintaxe: sintaxe.filter(x => x.tipo === "erro").slice(0, 10).map(x => ({ linha: x.linha, msg: x.msg, trecho: ctx && ctx.linhas[x.linha - 1] ? ctx.linhas[x.linha - 1].trim() : "" })),
      avisos: sintaxe.filter(x => x.tipo !== "erro" && !/main\(\)/.test(x.msg) && !achados.some(a => a.linha === x.linha && a.regra === "strcmp-invertido" && /strcmp/.test(x.msg))).slice(0, 6).map(x => ({ linha: x.linha, msg: x.msg })),
      achados: achados.slice(0, opcoes.max || 14).map(a => paraPainel(a, l => ctx && ctx.linhas[l - 1])),
      categorias: Object.fromEntries(Object.keys(CATEGORIAS).map(k => [k, achados.filter(a => a.categoria === k).length + (k === "compilacao" ? sintaxe.filter(x => x.tipo === "erro").length : 0)])),
      faltando: ctx && ctx.faltando ? ctx.faltando : [], projeto: opcoes.projeto || null, arvore: !!r.arvore, id: opcoes.id || "", comparacao: opcoes.comparacao || null, total: achados.length,
      investigacoes: opcoes.curto ? [] : (r.investigacoes || []),
      compilou: r.compilacao ? r.compilacao.resumo : null,
    };
    const c = { erro: 0, provavel: 0, verificar: 0, sugestao: 0 };
    achados.forEach(a => c[a.nivel]++);
    // linha de texto (pra quem lê sem o painel, e pros testes)
    let t = "~~~analise\n" + JSON.stringify(dados).replace(/~~~/g, "~ ~ ~") + "\n~~~\n";
    if (!dados.sintaxe.length && !achados.length) t += "✅ **Sem problema identificado** nas verificações que eu faço. Isso não prova que está perfeito: eu não executo nem compilo o código.\n";
    t += r.compilacao ? `\n⚙️ **Compilador:** ${r.compilacao.resumo}` : "\n⚙️ Eu **não compilei** (não existe compilador Pawn aqui no navegador). Pra ter certeza absoluta, compile no Pawno/Qawno e, se der erro, **cole a mensagem aqui**.";
    return t;
  }
  // texto simples (lista) — usado quando precisa caber dentro de outra resposta
  function relatorioTexto(r) {
    return r.achados.map(a => `- ${ROTULO[a.nivel][0]} **Linha ${a.linha}:** ${a.titulo.replace(/\*\*/g, "")}`).join("\n");
  }

  /* ---------- comparação linha a linha (original x corrigido) ---------- */
  function diff(a, b) {
    const A = a.split("\n"), B = b.split("\n");
    if (A.length * B.length > 4e6) return null;
    const n = A.length, m = B.length;
    const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const out = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { out.push("  " + A[i]); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) out.push("- " + A[i++]);
      else out.push("+ " + B[j++]);
    }
    while (i < n) out.push("- " + A[i++]);
    while (j < m) out.push("+ " + B[j++]);
    return out.join("\n");
  }

  return { VERSAO_REGRAS, analisar, corrigir, relatorio, relatorioTexto, diff, estrutura, limpar, regras, compilador, aplicar, ROTULO, CATEGORIAS, hash, paraPainel };
})();

WCDEV.analisador = Analisador;
