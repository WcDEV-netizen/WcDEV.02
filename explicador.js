/* =========================================================
   WC DEV — EXPLICADOR e CORRETOR
   - explicar(codigo): explica o código linha por linha
   - corrigir(codigo): conserta os erros que o revisor achou e diz o porquê
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

/* ---------- frase curta de um item da consulta ---------- */
function descricaoCurta(lang, nome) {
  const t = WCDEV.temas.find(x => x.lang === lang && x.ref && (x.titulo === nome || x.titulo.split(".").pop() === nome));
  if (!t) return null;
  const linhas = t.resposta.split("\n");
  const desc = (linhas[2] || "").replace(/\*\*/g, "");
  return (desc.match(/^.*?[.!?](\s|$)/) || [desc])[0].trim();
}

// "if (cond) resto" -> [cond, resto], contando os parênteses
function separarIf(l) {
  const i = l.indexOf("(");
  if (i < 0) return null;
  let n = 0;
  for (let j = i; j < l.length; j++) {
    if (l[j] === "(") n++;
    else if (l[j] === ")" && --n === 0) return [l.slice(i + 1, j), l.slice(j + 1).trim()];
  }
  return [l.slice(i + 1), ""];
}

function traduzirCondicao(c) {
  return c.replace(/\s+/g, " ").trim()
    .replace(/!\s*IsPlayerAdmin\s*\(\s*\w+\s*\)/g, "o jogador NÃO for admin").replace(/\bIsPlayerAdmin\s*\(\s*\w+\s*\)/g, "o jogador for admin")
    .replace(/!\s*IsPlayerInAnyVehicle\s*\(\s*\w+\s*\)/g, "o jogador NÃO estiver num veículo").replace(/\bIsPlayerInAnyVehicle\s*\(\s*\w+\s*\)/g, "o jogador estiver num veículo")
    .replace(/^\s*sscanf\s*\(.*\)\s*$/, "faltar algum parâmetro no comando").replace(/\bisnull\s*\(\s*params\s*\)/g, "a pessoa não escreveu nada depois do comando")
    .replace(/\bGetPlayerMoney\s*\(\s*\w+\s*\)/g, "o dinheiro do jogador")
    .replace(/!strcmp\s*\(([^,]+),\s*([^,)]+)[^)]*\)/g, "o texto $1 for igual a $2")
    .replace(/!\s*IsPlayerConnected\s*\((\w+)\)/g, "o jogador $1 NÃO estiver conectado")
    .replace(/\s*==\s*/g, " for igual a ").replace(/\s*!=\s*/g, " for diferente de ")
    .replace(/\s*>=\s*/g, " for maior ou igual a ").replace(/\s*<=\s*/g, " for menor ou igual a ")
    .replace(/\s+>\s+/g, " for maior que ").replace(/\s+<\s+/g, " for menor que ")
    .replace(/\s*&&\s*/g, " E ").replace(/\s*\|\|\s*/g, " OU ").replace(/\band\b/g, "E").replace(/\bor\b/g, "OU")
    .replace(/^!\s*/, "NÃO ").replace(/\bnot\s+/g, "NÃO ");
}

const Explicador = {
  linhaPawn(l) {
    let m;
    if ((m = l.match(/^#include\s*[<"]([^>"]+)[>"]/))) return `Importa o include **${m[1]}** (funções prontas que você vai usar).`;
    if ((m = l.match(/^#define\s+(\w+)(\([^)]*\))?\s*(.*)$/))) return m[2] ? `Cria o **macro** ${m[1]}: um atalho que o compilador troca pelo código ao lado.` : `Cria o apelido **${m[1]}**, que vale ${m[3] || "(vazio)"}. O compilador troca o nome pelo valor.`;
    if (/^#pragma\s+unused/.test(l)) return "Avisa o compilador que essa variável não é usada de propósito (tira o warning 203).";
    if (/^#/.test(l)) return "Instrução pro compilador (não vira código do jogo).";
    if (/^main\s*\(/.test(l)) return "Função **main**: obrigatória em todo gamemode. Roda quando o script carrega.";
    if ((m = l.match(/^public\s+(On\w+)\s*\(([^)]*)\)/))) {
      const d = descricaoCurta("pawn", m[1]);
      return `Começa o callback **${m[1]}**${d ? ": " + d.charAt(0).toLowerCase() + d.slice(1) : "."} O servidor chama sozinho.`;
    }
    if ((m = l.match(/^forward\s+(\w+)/))) return `Declara a função **${m[1]}** antes de criar (obrigatório pra toda public sua).`;
    if ((m = l.match(/^public\s+(\w+)\s*\(([^)]*)\)/))) return `Cria a função pública **${m[1]}**, que pode ser chamada pelo nome (por um timer, por exemplo).`;
    if ((m = l.match(/^stock\s+(?:\w+:)?(\w+)\s*\(([^)]*)\)/))) return `Cria a função **${m[1]}**${m[2].trim() ? ` que recebe ${m[2].trim()}` : ""}.`;
    if ((m = l.match(/^CMD\s*:\s*(\w+)/i))) return `Cria o comando **/${m[1]}** (zcmd). {{params}} é o texto que a pessoa digitou depois do comando.`;
    if ((m = l.match(/^enum\s+(\w+)/))) return `Começa o enum **${m[1]}**: uma lista de nomes pra organizar dados.`;
    if ((m = l.match(/^new\s+(.+?);?$/))) {
      const vars = m[1].split(/,(?![^[\]{]*[\]}])/).map(v => v.trim()).filter(Boolean);
      const desc = vars.slice(0, 4).map(v => {
        const nome = v.replace(/=.*$/, "").trim();
        const tag = nome.match(/^(\w+):/);
        const arr = nome.match(/\[([^\]]*)\]/);
        const val = v.includes("=") ? v.split("=").slice(1).join("=").trim() : null;
        const limpo = nome.replace(/^\w+:/, "").replace(/\[.*$/, "");
        return `**${limpo}**${tag ? ` (${tag[1] === "Float" ? "decimal" : tag[1] === "bool" ? "verdadeiro/falso" : tag[1]})` : ""}${arr ? ` com ${arr[1] || "vários"} espaços` : ""}${val ? ` valendo ${val}` : ""}`;
      });
      return `Cria a(s) variável(is) ${desc.join(", ")}.`;
    }
    if (/^(?:}\s*)?else\s+if\b/.test(l)) { const p = separarIf(l.replace(/^(?:}\s*)?else\s+/, "")); return `Senão, se ${traduzirCondicao(p[0])}...`; }
    if (/^(?:}\s*)?else\b/.test(l)) return "Senão (se a condição de cima não foi verdadeira)...";
    if (/^if\s*\(/.test(l)) {
      const [cond, resto] = separarIf(l);
      const corpo = resto.replace(/^\{?\s*/, "").replace(/;\s*$/, "");
      let entao = ", então faz o que vem abaixo";
      if (corpo) {
        const volta = corpo.match(/^return\s+(.*)$/);
        const acao = this.acoesPawn(volta ? volta[1] : corpo);
        entao = volta ? `, então ${acao || "devolve " + volta[1]} e **para por aqui**` : `, então ${acao || "executa " + corpo}`;
      }
      return `Se ${traduzirCondicao(cond)}${entao}.`;
    }
    if ((m = l.match(/^foreach\s*\(\s*new\s+(\w+)\s*:\s*(\w+)\s*\)/))) return `Repete pra cada **${m[2] === "Player" ? "jogador online" : m[2]}**, guardando o ID em **${m[1]}**.`;
    if ((m = l.match(/^for\s*\((.*)\)/))) return `Loop **for**: repete o bloco (${m[1].trim()}).`;
    if ((m = l.match(/^while\s*\((.*)\)/))) return `Repete enquanto ${traduzirCondicao(m[1])}.`;
    if ((m = l.match(/^switch\s*\((.*)\)/))) return `Escolhe o caminho conforme o valor de **${m[1].trim()}**.`;
    if ((m = l.match(/^case\s+(.+?):/))) return `Caso o valor seja **${m[1]}**...`;
    if (/^default\s*:/.test(l)) return "Caso nenhum dos de cima...";
    if ((m = l.match(/^return\s+(.+?);/))) {
      const acao = this.acoesPawn(m[1]);
      return acao ? `${acao.charAt(0).toUpperCase() + acao.slice(1)} e **termina** a função.` : `Termina a função devolvendo **${m[1]}**.`;
    }
    if (/^(break|continue)\s*;/.test(l)) return l.startsWith("break") ? "Sai do loop/switch." : "Pula pra próxima volta do loop.";
    if (/^[{}];?$/.test(l)) return null;
    const acoes = this.acoesPawn(l);
    if (acoes) return acoes.charAt(0).toUpperCase() + acoes.slice(1) + ".";
    if ((m = l.match(/^(\w+(?:\[[^\]]*\])*)\s*(\+\+|--)/))) return `${m[2] === "++" ? "Soma 1" : "Tira 1"} em **${m[1]}**.`;
    if ((m = l.match(/^(\w+(?:\[[^\]]*\])*)\s*([+\-*/]?=)\s*(.+?);/))) return `${m[2] === "=" ? "Guarda" : m[2] === "+=" ? "Soma" : m[2] === "-=" ? "Tira" : "Calcula"} **${m[3]}** ${m[2] === "=" ? "em" : m[2] === "+=" ? "em" : "de"} **${m[1]}**.`;
    return null;
  },
  acoesPawn(l) {
    const nomes = [...l.matchAll(/\b([A-Za-z_]\w+)\s*\(/g)].map(m => m[1]).filter(n => !/^(if|for|while|switch|sizeof|return)$/.test(n));
    const ditas = [];
    for (const n of [...new Set(nomes)].slice(0, 3)) {
      const d = descricaoCurta("pawn", n);
      if (d) ditas.push(`chama **${n}** (${d.replace(/\.$/, "").charAt(0).toLowerCase() + d.replace(/\.$/, "").slice(1)})`);
      else ditas.push(`chama **${n}**`);
    }
    return ditas.join(", depois ");
  },

  linhaPython(l) {
    let m;
    if ((m = l.match(/^(?:import\s+([\w, .]+)|from\s+(\w+)\s+import\s+(.+))/))) return m[1] ? `Importa o módulo **${m[1]}** pra usar as funções dele.` : `Importa **${m[3]}** do módulo **${m[2]}**.`;
    if ((m = l.match(/^def\s+(\w+)\s*\(([^)]*)\)/))) return `Cria a função **${m[1]}**${m[2].trim() ? ` que recebe **${m[2].trim()}**` : ""}. O código de dentro só roda quando alguém chamar ${m[1]}().`;
    if ((m = l.match(/^class\s+(\w+)/))) return `Cria a classe **${m[1]}** (um molde pra criar objetos).`;
    if ((m = l.match(/^for\s+(.+?)\s+in\s+range\s*\((.*)\)\s*:/))) {
      const a = m[2].split(",").map(x => x.trim());
      const faixa = a.length === 1 ? `de 0 até ${a[0]} - 1` : `de ${a[0]} até ${a[1]} - 1${a[2] ? ` pulando de ${a[2]} em ${a[2]}` : ""}`;
      return `Repete com **${m[1]}** indo ${faixa}.`;
    }
    if ((m = l.match(/^for\s+(.+?)\s+in\s+(.+):/))) return `Repete pra cada item de **${m[2]}**, guardando em **${m[1]}**.`;
    if ((m = l.match(/^while\s+(.+):/))) return m[1].trim() === "True" ? "Repete **pra sempre** (até um {{break}})." : `Repete enquanto ${traduzirCondicao(m[1])}.`;
    if ((m = l.match(/^if\s+(.+):/))) return `Se ${traduzirCondicao(m[1])}, faz o que está embaixo (com recuo).`;
    if ((m = l.match(/^elif\s+(.+):/))) return `Senão, se ${traduzirCondicao(m[1])}...`;
    if (/^else\s*:/.test(l)) return "Senão (se nenhuma condição de cima deu certo)...";
    if (/^try\s*:/.test(l)) return "Tenta rodar o bloco de baixo; se der erro, vai pro {{except}}.";
    if ((m = l.match(/^except\s*(\w*)/))) return `Se der erro${m[1] ? ` do tipo **${m[1]}**` : ""}, roda isto em vez de quebrar o programa.`;
    if ((m = l.match(/^return\s*(.*)$/))) return m[1] ? `Devolve **${m[1]}** e sai da função.` : "Sai da função.";
    if (/^(break|continue|pass)$/.test(l)) return { break: "Sai do loop.", continue: "Pula pra próxima volta.", pass: "Não faz nada (só pra o bloco não ficar vazio)." }[l];
    if ((m = l.match(/^(\w+)\s*=\s*(int|float)\s*\(\s*input\s*\((.*)\)\s*\)/))) return `Pergunta ${m[3] || "algo"} ao usuário, converte pra **número** e guarda em **${m[1]}**.`;
    if ((m = l.match(/^(\w+)\s*=\s*input\s*\((.*)\)/))) return `Pergunta ${m[2] || "algo"} ao usuário e guarda o **texto** em **${m[1]}**.`;
    if ((m = l.match(/^print\s*\((.*)\)\s*$/))) return `Mostra na tela: ${m[1].length > 60 ? m[1].slice(0, 60) + "..." : m[1]}.`;
    if ((m = l.match(/^(\w+)\.(append|remove|pop|insert|sort|reverse|extend|clear)\s*\((.*)\)/))) return `${{ append: "Adiciona", remove: "Remove", pop: "Tira", insert: "Insere", sort: "Ordena", reverse: "Inverte", extend: "Junta", clear: "Esvazia" }[m[2]]} ${m[3] ? "**" + m[3] + "** " : ""}${["sort", "reverse", "clear"].includes(m[2]) ? "a lista" : "na lista"} **${m[1]}**.`;
    if ((m = l.match(/^(\w+)\s*=\s*\[(.*)\]?$/))) return `Cria a lista **${m[1]}**${m[2] && m[2] !== "]" ? ` com ${m[2].replace(/\]$/, "")}` : " vazia"}.`;
    if ((m = l.match(/^(\w+)\s*=\s*\{/))) return `Cria o dicionário **${m[1]}** (pares chave: valor).`;
    if ((m = l.match(/^(\w+(?:\[[^\]]*\])?)\s*([+\-*/]?=)\s*(.+)$/)) && !/==/.test(l)) return `${m[2] === "=" ? "Guarda" : m[2] === "+=" ? "Soma" : m[2] === "-=" ? "Tira" : "Calcula"} **${m[3]}** ${m[2] === "-=" ? "de" : "em"} **${m[1]}**.`;
    if ((m = l.match(/^(\w+)\s*\(/))) {
      const d = descricaoCurta("python", m[1]);
      return `Chama a função **${m[1]}**${d ? ": " + d : "."}`;
    }
    return null;
  },

  linhaHtml(l) {
    const tags = [...l.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g)];
    if (!tags.length) return l.startsWith("<!--") ? "Comentário (não aparece no site)." : (l.trim() ? `Texto que aparece na página: "${l.slice(0, 50)}"` : null);
    const frases = [];
    for (const [, fecha, tag, attrs] of tags.slice(0, 3)) {
      if (tag.toLowerCase() === "doctype" || /^!/.test(tag)) continue;
      if (fecha) { frases.push(`fecha o **<${tag}>**`); continue; }
      const d = descricaoCurta("html", `<${tag.toLowerCase()}>`);
      let f = `abre **<${tag}>**${d ? " (" + d.replace(/\.$/, "").toLowerCase() + ")" : ""}`;
      const href = attrs.match(/href\s*=\s*["']([^"']+)/), src = attrs.match(/src\s*=\s*["']([^"']+)/), cls = attrs.match(/class\s*=\s*["']([^"']+)/);
      if (href) f += ` indo pra **${href[1]}**`;
      if (src) f += ` usando o arquivo **${src[1]}**`;
      if (cls) f += ` com a classe **${cls[1]}**`;
      frases.push(f);
    }
    if (/^<!DOCTYPE/i.test(l)) return "Diz pro navegador que é uma página **HTML5**.";
    return frases.length ? frases.join(", ").replace(/^./, c => c.toUpperCase()) + "." : null;
  },

  linhaCss(l) {
    let m;
    if ((m = l.match(/^@media\s*(.*)\{/))) return `Estilos que só valem quando ${m[1].replace(/max-width\s*:\s*(\w+)/, "a tela tiver até $1").replace(/min-width\s*:\s*(\w+)/, "a tela tiver pelo menos $1").replace(/[()]/g, "").trim()}.`;
    if ((m = l.match(/^@keyframes\s+([\w-]+)/))) return `Cria a animação **${m[1]}**.`;
    if ((m = l.match(/^([^{]+)\{(.*)$/))) {
      const sel = m[1].trim();
      const expl = sel.split(",").map(s => s.trim()).map(s => {
        if (s.startsWith(".")) return `os elementos com a classe **${s.slice(1).split(/[:\s]/)[0]}**`;
        if (s.startsWith("#")) return `o elemento com id **${s.slice(1).split(/[:\s]/)[0]}**`;
        if (s === "*") return "**todos** os elementos";
        return `as tags **<${s.split(/[:\s.#]/)[0]}>**`;
      }).join(" e ");
      const hover = sel.includes(":hover") ? " quando o mouse passa por cima" : "";
      const resto = m[2].trim() ? " " + (this.linhaCss(m[2].replace(/}\s*$/, "")) || "") : "";
      return `Estiliza ${expl}${hover}.${resto}`;
    }
    if (/^}$/.test(l)) return null;
    const decls = l.replace(/}\s*$/, "").split(";").map(x => x.trim()).filter(x => x.includes(":"));
    if (!decls.length) return null;
    return decls.slice(0, 3).map(dc => {
      const [p, ...v] = dc.split(":");
      const d = descricaoCurta("css", p.trim());
      return `**${p.trim()}: ${v.join(":").trim()}**${d ? " → " + d.replace(/\.$/, "").toLowerCase() : ""}`;
    }).join("; ") + ".";
  },

  explicar(codigo, lang, opcoes = {}) {
    lang = lang || (WCDEV.revisor && WCDEV.revisor.detectar(codigo)) || "pawn";
    const fn = { pawn: "linhaPawn", python: "linhaPython", html: "linhaHtml", css: "linhaCss" }[lang];
    const linhas = codigo.split("\n");
    const itens = [];
    linhas.forEach((bruta, i) => {
      let l = bruta.trim();
      if (!l) return;
      const comentario = (lang === "python" && l.startsWith("#")) || ((lang === "pawn" || lang === "css") && /^(\/\/|\/\*|\*)/.test(l));
      if (comentario) {
        itens.push({ n: i + 1, l, e: `Comentário: ${l.replace(/^(\/\/|#|\/\*|\*)\s*/, "").replace(/\*\/$/, "")}` });
        return;
      }
      l = l.replace(/\s*\/\/.*$/, "").replace(/\s+#\s.*$/, "");
      const e = this[fn](l);
      if (e) itens.push({ n: i + 1, l: bruta.trim(), e });
    });
    const mostrar = itens.slice(0, 40);
    let texto = opcoes.semTitulo ? "" : `### 📖 Explicando seu código ${NOMES[lang]} linha por linha\n`;
    // chaves seguidas quebram o {{código}} do chat: separa com um espaço invisível
    const seguro = c => (c.length > 70 ? c.slice(0, 67) + "..." : c).replace(/\{(?=\{)/g, "{\u200b").replace(/\}(?=\})/g, "}\u200b").replace(/\}$/, "}\u200b");
    texto += mostrar.map(x => `- **Linha ${x.n}** {{${seguro(x.l)}}}\n${x.e}`).join("\n");
    if (itens.length > 40) texto += `\n\n(mostrei as 40 primeiras linhas importantes de ${itens.length})`;
    return texto.replace(/- \*\*Linha (\d+)\*\* (\{\{.*?\}\})\n/g, "- **Linha $1** $2 → ");
  },
};

/* =========================================================
   CORRETOR: conserta o que o revisor achou
   ========================================================= */
const ASSINATURAS_PAWN = {
  OnGameModeInit: "public OnGameModeInit()", OnGameModeExit: "public OnGameModeExit()", OnFilterScriptInit: "public OnFilterScriptInit()",
  OnFilterScriptExit: "public OnFilterScriptExit()", OnPlayerConnect: "public OnPlayerConnect(playerid)",
  OnPlayerDisconnect: "public OnPlayerDisconnect(playerid, reason)", OnPlayerSpawn: "public OnPlayerSpawn(playerid)",
  OnPlayerDeath: "public OnPlayerDeath(playerid, killerid, reason)", OnPlayerText: "public OnPlayerText(playerid, text[])",
  OnPlayerCommandText: "public OnPlayerCommandText(playerid, cmdtext[])", OnPlayerRequestClass: "public OnPlayerRequestClass(playerid, classid)",
  OnPlayerRequestSpawn: "public OnPlayerRequestSpawn(playerid)", OnPlayerEnterVehicle: "public OnPlayerEnterVehicle(playerid, vehicleid, ispassenger)",
  OnPlayerExitVehicle: "public OnPlayerExitVehicle(playerid, vehicleid)", OnPlayerStateChange: "public OnPlayerStateChange(playerid, newstate, oldstate)",
  OnPlayerKeyStateChange: "public OnPlayerKeyStateChange(playerid, newkeys, oldkeys)",
  OnDialogResponse: "public OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])",
  OnPlayerTakeDamage: "public OnPlayerTakeDamage(playerid, issuerid, Float:amount, weaponid, bodypart)",
  OnPlayerGiveDamage: "public OnPlayerGiveDamage(playerid, damagedid, Float:amount, weaponid, bodypart)",
  OnPlayerPickUpPickup: "public OnPlayerPickUpPickup(playerid, pickupid)", OnPlayerEnterCheckpoint: "public OnPlayerEnterCheckpoint(playerid)",
  OnPlayerLeaveCheckpoint: "public OnPlayerLeaveCheckpoint(playerid)", OnVehicleDeath: "public OnVehicleDeath(vehicleid, killerid)",
  OnVehicleSpawn: "public OnVehicleSpawn(vehicleid)", OnPlayerUpdate: "public OnPlayerUpdate(playerid)",
  OnPlayerClickMap: "public OnPlayerClickMap(playerid, Float:fX, Float:fY, Float:fZ)",
  OnPlayerClickPlayer: "public OnPlayerClickPlayer(playerid, clickedplayerid, source)",
  OnPlayerInteriorChange: "public OnPlayerInteriorChange(playerid, newinteriorid, oldinteriorid)",
  OnRconLoginAttempt: "public OnRconLoginAttempt(ip[], password[], success)", OnPlayerEnterRaceCheckpoint: "public OnPlayerEnterRaceCheckpoint(playerid)",
  OnPlayerClickTextDraw: "public OnPlayerClickTextDraw(playerid, Text:clickedid)",
  OnPlayerWeaponShot: "public OnPlayerWeaponShot(playerid, weaponid, hittype, hitid, Float:fX, Float:fY, Float:fZ)",
};

const Corretor = {
  // separa o código da linha do comentário no fim (pra colocar ; antes do //)
  semComentario(linha, lang) {
    if (lang === "pawn") { const m = linha.match(/^(.*?)(\s*\/\/.*)$/); if (m && (m[1].match(/"/g) || []).length % 2 === 0) return [m[1], m[2]]; }
    if (lang === "python") { const m = linha.match(/^(.*?)(\s+#.*)$/); if (m && (m[1].match(/["']/g) || []).length % 2 === 0) return [m[1], m[2]]; }
    return [linha, ""];
  },

  umaPassada(codigo, lang) {
    const r = WCDEV.revisor.analisar(codigo, lang);
    if (!r) return { codigo, mudancas: [] };
    const L = codigo.split("\n");
    const mudancas = [];
    const feito = new Set();
    const anotar = (n, o, porque) => mudancas.push({ n, o, porque });
    const extras = { inicio: [], fim: [], antes: {} };

    for (const p of r.problemas) {
      const i = p.linha - 1;
      const msg = p.msg;
      if (i < 0 || i >= L.length && !/não fechou|Faltou o \*\*<\//.test(msg)) continue;
      const chave = p.linha + "|" + msg.slice(0, 30);
      if (feito.has(chave)) continue;
      feito.add(chave);
      let m;

      if (lang === "pawn") {
        if (/faltou o \*\*;\*\* no fim/.test(msg) || /forward\*\* precisa de \*\*;/.test(msg)) {
          const [cod, com] = this.semComentario(L[i], lang);
          if (!/;\s*$/.test(cod)) { L[i] = cod.replace(/\s*$/, ";") + com; anotar(p.linha, "coloquei o **;** no final", "em Pawn todo comando termina com ponto e vírgula, senão o compilador acha que a linha continua (error 001)."); }
        } else if (/comparar texto com \*\*==/.test(msg)) {
          const antes = L[i];
          L[i] = L[i].replace(/([\w\]\[]+)\s*==\s*("(?:[^"\\]|\\.)*")/g, "!strcmp($1, $2)").replace(/("(?:[^"\\]|\\.)*")\s*==\s*([\w\]\[]+)/g, "!strcmp($2, $1)")
            .replace(/([\w\]\[]+)\s*!=\s*("(?:[^"\\]|\\.)*")/g, "strcmp($1, $2)");
          if (L[i] !== antes) anotar(p.linha, "troquei o **==** por **strcmp**", "texto em Pawn é um array de letras, e array não se compara com ==. O strcmp compara letra por letra e devolve 0 quando é igual (por isso o !).");
        } else if (/Tem \*\*=\*\* dentro do if/.test(msg)) {
          const antes = L[i];
          L[i] = L[i].replace(/(\b(?:if|while)\s*\()(.*)(\))/, (all, a, meio, b) => a + meio.replace(/([^=!<>])=([^=])/, "$1==$2") + b);
          if (L[i] !== antes) anotar(p.linha, "troquei **=** por **==** na condição", "um = sozinho GUARDA um valor; pra COMPARAR é ==.");
        } else if ((m = msg.match(/A variável \*\*(\w+)\*\* guarda número com vírgula/))) {
          L[i] = L[i].replace(new RegExp(`\\bnew\\s+${m[1]}\\b`), `new Float:${m[1]}`);
          anotar(p.linha, `coloquei a tag **Float:** em ${m[1]}`, "número com vírgula precisa da tag Float:, senão o Pawn guarda errado (warning 213).");
        } else if (/Vida e colete são \*\*Float/.test(msg)) {
          L[i] = L[i].replace(/\b(SetPlayerHealth|SetPlayerArmour|SetVehicleHealth)\s*\(([^,]+),\s*(\d+)\s*\)/g, "$1($2, $3.0)");
          anotar(p.linha, "coloquei **.0** no valor", "vida, colete e lataria são Float, então o número precisa de ponto (100.0).");
        } else if (/SendClientMessage\}\} precisa de 3/.test(msg)) {
          L[i] = L[i].replace(/\bSendClientMessage\s*\(\s*([^,]+),\s*/, "SendClientMessage($1, -1, ");
          anotar(p.linha, "coloquei a cor **-1** (branco)", "o SendClientMessage precisa de (jogador, cor, texto). Sem a cor, o compilador reclama.");
        } else if ((m = msg.match(/\*\*(\w+)\*\* não existe\. Você quis dizer \*\*(\w+)\*\*/))) {
          L[i] = L[i].replace(new RegExp(`\\b${m[1]}\\b`, "g"), m[2]);
          anotar(p.linha, `troquei **${m[1]}** por **${m[2]}**`, "o nome estava digitado errado. Em Pawn maiúsculas e minúsculas importam, e uma letra a menos já vira error 017.");
        } else if ((m = msg.match(/public \*\*(\w+)\*\* precisa de \{\{forward/))) {
          const cab = L[i].match(/public\s+((?:\w+:)?\w+\s*\([^)]*\))/);
          if (cab) { (extras.antes[i] = extras.antes[i] || []).push(`forward ${cab[1]};`); anotar(p.linha, `coloquei **forward ${m[1]}** antes da função`, "toda public sua precisa ser anunciada com forward, senão dá warning 235 e timers podem não achar ela."); }
        } else if ((m = msg.match(/O \*\*(On\w+)\*\* tem \d+ parâmetro/)) && ASSINATURAS_PAWN[m[1]]) {
          L[i] = L[i].replace(/public\s+On\w+\s*\([^)]*\)/, ASSINATURAS_PAWN[m[1]]);
          anotar(p.linha, `arrumei o cabeçalho do **${m[1]}**`, "callbacks precisam ter exatamente os mesmos parâmetros do original (error 025).");
        } else if ((m = msg.match(/\*\*(On\w+)\*\* não é um callback\. Você quis dizer \*\*(On\w+)\*\*/))) {
          L[i] = L[i].replace(m[1], m[2]);
          anotar(p.linha, `troquei **${m[1]}** por **${m[2]}**`, "o nome do callback estava errado, então o servidor nunca ia chamar ele.");
        } else if (/precisa da função \{\{main\(\)\}\}/.test(msg) && /#include/.test(codigo)) {
          extras.fim.push("", "main()", "{", "}");
          anotar(L.length, "coloquei a função **main()**", "todo gamemode precisa de main(), senão o servidor não carrega.");
        } else if (/Faltou \{\{#include <a_samp>\}\}/.test(msg)) {
          extras.inicio.push("#include <a_samp>");
          anotar(1, "coloquei **#include <a_samp>** no começo", "é esse include que traz as funções do SA-MP (SendClientMessage, SetPlayer...).");
        } else if (/Abriu chave \*\*\{\*\* e não fechou/.test(msg)) {
          extras.fim.push("}");
          anotar(p.linha, "fechei a chave **}** que estava aberta", "toda chave que abre um bloco precisa fechar, senão dá error 030.");
        } else if (/Abriu parêntese \*\*\(\*\* e não fechou/.test(msg)) {
          const [cod, com] = this.semComentario(L[i], lang);
          L[i] = cod.replace(/;?\s*$/, m2 => ")" + (m2.includes(";") ? ";" : "")) + com;
          anotar(p.linha, "fechei o parêntese **)**", "cada ( precisa do seu ).");
        }
      }

      if (lang === "python") {
        if (/Faltou os \*\*dois pontos/.test(msg)) {
          const [cod, com] = this.semComentario(L[i], lang);
          L[i] = cod.replace(/\s*$/, ":") + com;
          anotar(p.linha, "coloquei os **dois pontos (:)**", "if, for, while, def, else... sempre terminam com : pra mostrar que vem um bloco embaixo.");
        } else if (/não existe \*\*else if\*\*/.test(msg)) {
          L[i] = L[i].replace(/\belse\s+if\b/, "elif");
          if (!/:\s*$/.test(L[i])) L[i] = L[i].replace(/\s*$/, ":");
          anotar(p.linha, "troquei **else if** por **elif**", "no Python o \"senão se\" se escreve elif.");
        } else if (/print precisa de parênteses/.test(msg)) {
          L[i] = L[i].replace(/\bprint\s+(.+?)\s*$/, "print($1)");
          anotar(p.linha, "coloquei os **parênteses** no print", "no Python 3 o print é uma função, então precisa de ().");
        } else if ((m = msg.match(/Em Python é \*\*(\w+)\*\*/))) {
          L[i] = L[i].replace(/\b(true|false|null|none)\b/, m[1]);
          anotar(p.linha, `escrevi **${m[1]}** com maiúscula`, "True, False e None são palavras especiais e começam com letra maiúscula.");
        } else if (/não tem \*\*\+\+\*\*/.test(msg)) {
          L[i] = L[i].replace(/(\w+)\s*\+\+/, "$1 += 1").replace(/(\w+)\s*--/, "$1 -= 1");
          anotar(p.linha, "troquei **++** por **+= 1**", "Python não tem ++; usa += 1.");
        } else if (/pra comparar use \*\*==\*\*/.test(msg)) {
          L[i] = L[i].replace(/^(\s*(?:if|elif|while)\b[^=!<>:]*[^=!<>:])=([^=])/, "$1==$2");
          anotar(p.linha, "troquei **=** por **==**", "um = guarda valor; == compara.");
        } else if ((m = msg.match(/\*\*(\w+)\*\* vem do \{\{input\(\)\}\}/))) {
          const j = L.findIndex(x => new RegExp(`^\\s*${m[1]}\\s*=\\s*input\\s*\\(`).test(x));
          if (j >= 0) { L[j] = L[j].replace(/=\s*input\s*\((.*)\)\s*$/, "= int(input($1))"); anotar(j + 1, `coloquei **int()** no input de ${m[1]}`, "o input sempre devolve texto; pra fazer conta tem que converter pra número."); }
        } else if ((m = msg.match(/\*\*(\w+)\*\* não existe\. Você quis dizer \*\*(\w+)\*\*/))) {
          L[i] = L[i].replace(new RegExp(`\\b${m[1]}\\b`, "g"), m[2]);
          anotar(p.linha, `troquei **${m[1]}** por **${m[2]}**`, "o nome estava escrito errado (NameError).");
        } else if (/precisa de \*\*4 espaços a mais\*\*/.test(msg)) {
          const anterior = L.slice(0, i).reverse().find(x => x.trim());
          const base = anterior ? anterior.match(/^\s*/)[0].replace(/\t/g, "    ").length : 0;
          L[i] = " ".repeat(base + 4) + L[i].trim();
          anotar(p.linha, "coloquei **4 espaços** na frente", "o que fica dentro de um if/for/def precisa de recuo, é assim que o Python sabe o que está dentro.");
        } else if (/espaço a mais\*\* no começo/.test(msg)) {
          const anterior = L.slice(0, i).reverse().find(x => x.trim());
          const base = anterior ? anterior.match(/^\s*/)[0].length : 0;
          L[i] = " ".repeat(base) + L[i].trim();
          anotar(p.linha, "tirei os espaços a mais do começo", "recuo no Python só pode aparecer dentro de um bloco.");
        } else if (/não tem nada dentro do bloco/.test(msg)) {
          const base = L[i].match(/^\s*/)[0].length;
          extras.fim.push(" ".repeat(base + 4) + "pass");
          anotar(p.linha, "coloquei **pass** dentro do bloco vazio", "todo bloco precisa de pelo menos uma linha; pass é a linha que não faz nada.");
        } else if (/misturou \*\*TAB e espaços/.test(msg)) {
          for (let k = 0; k < L.length; k++) L[k] = L[k].replace(/^\t+/, t => "    ".repeat(t.length));
          anotar(1, "troquei os TABs por espaços", "misturar TAB e espaço confunde o Python (TabError).");
        }
      }

      if (lang === "html") {
        if ((m = msg.match(/A tag \*\*<(\w+)>\*\* não existe\. Você quis dizer \*\*<(\w+)>\*\*/))) {
          L.forEach((x, k) => (L[k] = x.replace(new RegExp(`<(/?)${m[1]}\\b`, "gi"), `<$1${m[2]}`)));
          anotar(p.linha, `troquei **<${m[1]}>** por **<${m[2]}>**`, "o nome da tag estava errado, então o navegador não sabia o que fazer com ela.");
        } else if (/Coloque \*\*alt\*\* na imagem/.test(msg) && r.problemas.some(x => x.tipo === "erro")) {
          L[i] = L[i].replace(/<img\b(?![^>]*\balt=)/i, '<img alt="imagem"');
          anotar(p.linha, "coloquei **alt** na imagem", "o alt descreve a imagem pra quem usa leitor de tela e pro Google. Troque \"imagem\" por uma descrição de verdade.");
        } else if ((m = msg.match(/Tem um \*\*<\/(\w+)>\*\* fechando sem ter aberto/))) {
          const aberta = (L[i].match(/<(h[1-6]|p|div|span|li|a|b|strong|em)\b[^>]*>(?![\s\S]*<\/\1>)/i) || [])[1];
          if (aberta && aberta !== m[1]) { L[i] = L[i].replace(`</${m[1]}>`, `</${aberta}>`); anotar(p.linha, `troquei **</${m[1]}>** por **</${aberta}>**`, "a tag que fecha precisa ter o mesmo nome da que abriu."); }
        } else if ((m = msg.match(/não foi fechada\. Faltou o \*\*<\/(\w+)>\*\*/))) {
          extras.fim.push(`</${m[1]}>`);
          anotar(p.linha, `fechei a tag **<${m[1]}>** no final`, "toda tag que abre (menos img, br, input...) precisa fechar. Confira se o lugar do fechamento ficou bom pra você.");
        }
      }

      if (lang === "css") {
        if ((m = msg.match(/A propriedade \*\*([\w-]+)\*\* não existe\. Você quis dizer \*\*([\w-]+)\*\*/))) {
          L[i] = L[i].replace(new RegExp(`(^|[\\s;{])${m[1]}(\\s*:)`), `$1${m[2]}$2`);
          anotar(p.linha, `troquei **${m[1]}** por **${m[2]}**`, "propriedade escrita errado o navegador simplesmente ignora, sem avisar.");
        } else if ((m = msg.match(/Faltou a \*\*unidade\*\* em \*\*([\w-]+): (.+?)\*\*/))) {
          L[i] = L[i].replace(new RegExp(`(${m[1]}\\s*:[^;}]*?)(^|\\s|:)([1-9]\\d*)(?=\\s|;|$|})`), "$1$2$3px");
          anotar(p.linha, `coloquei **px** no valor de ${m[1]}`, "número sem unidade (a não ser 0) o navegador não entende. px é pixel.");
        } else if (/Faltou o \*\*;\*\* no fim desta linha/.test(msg)) {
          L[i] = L[i].replace(/\s*$/, ";");
          anotar(p.linha, "coloquei o **;** no final", "cada propriedade termina com ; pra o navegador saber onde começa a próxima.");
        } else if ((m = msg.match(/faltou o \*\*;\*\* entre as propriedades em \*\*(.+?)\*\*/))) {
          L[i] = L[i].replace(/(:\s*[^;:{}]+?)\s+([a-z-]+\s*:)/, "$1; $2");
          anotar(p.linha, "coloquei o **;** entre as propriedades", "sem o ; o navegador acha que é tudo uma propriedade só.");
        } else if ((m = msg.match(/Faltou os \*\*dois pontos\*\* em \*\*(.+?)\*\*/))) {
          L[i] = L[i].replace(/^(\s*[a-z-]+)\s+/, "$1: ");
          anotar(p.linha, "coloquei os **dois pontos**", "o formato é propriedade: valor;");
        } else if (/Abriu chave \*\*\{\*\* e não fechou/.test(msg)) {
          extras.fim.push("}");
          anotar(p.linha, "fechei a chave **}**", "todo bloco de estilo precisa abrir e fechar chaves.");
        }
      }
    }

    // inserir linhas extras (de baixo pra cima pra não bagunçar a numeração)
    Object.keys(extras.antes).map(Number).sort((a, b) => b - a).forEach(i => L.splice(i, 0, ...extras.antes[i]));
    let novo = L.join("\n");
    if (extras.inicio.length) novo = extras.inicio.join("\n") + "\n" + novo;
    if (extras.fim.length) novo = novo.replace(/\s*$/, "") + "\n" + extras.fim.join("\n");
    return { codigo: novo, mudancas };
  },

  corrigir(codigo, lang) {
    lang = lang || WCDEV.revisor.detectar(codigo);
    if (!lang) return null;
    const antes = WCDEV.revisor.analisar(codigo, lang).problemas.filter(p => p.tipo === "erro").length;
    let atual = codigo, todas = [];
    for (let volta = 0; volta < 3; volta++) {
      const r = this.umaPassada(atual, lang);
      if (!r.mudancas.length) break;
      todas = todas.concat(r.mudancas);
      atual = r.codigo;
    }
    const depois = WCDEV.revisor.analisar(atual, lang).problemas;
    return { lang, codigo: atual, mudancas: todas, antes, restantes: depois.filter(p => p.tipo === "erro"), avisos: depois.filter(p => p.tipo !== "erro") };
  },
};

WCDEV.explicador = Explicador;
WCDEV.corretor = Corretor;
