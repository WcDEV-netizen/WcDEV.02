/* =========================================================
   WC DEV — INTENÇÃO, PERMISSÃO, PERSISTÊNCIA E VERSÕES (Pawn / SA-MP)

   Regras que comparam o que o código FAZ com o que ele claramente
   PRETENDE fazer. Cada uma só acusa com evidência no próprio código:

   • comando-sem-permissao (estrutural)
       a checagem de permissão vale pela ESTRUTURA, não pela palavra:
       precisa ser uma condição de verdade (IsPlayerAdmin, função de
       permissão, nível de admin do PRÓPRIO jogador), que PARA o comando
       (return) ANTES da ação privilegiada. "Admin" em comentário, texto,
       nome de variável ou depois da ação não protege nada.
   • alvo-errado           o comando escolhe um alvo, mas a ação cai em quem digitou
   • limite-um-a-mais      > / >= contra o que a mensagem ou o preço diz
   • persistencia-dados    DOF2/dini: chave, tipo, arquivo e ordem entre salvar e carregar
   • valor-padrao          array global usado com -1/INVALID_* como "vazio", mas começa em 0
   • versao-native         native que só existe numa versão (SA-MP 0.3.7, 0.3DL, open.mp)
   • argumentos-native     número de argumentos conferido no catálogo OFICIAL de natives
   • processador-comandos  zcmd e Pawn.CMD juntos

   Quando a intenção não dá pra saber, o nível é "verificar" (pergunta),
   nunca "erro".
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const AnaliseIntencao = (() => {
  const P = () => WCDEV.pawnAst, F = () => WCDEV.analiseFluxo;
  const txt = (ctx, n) => P().texto(ctx.codigo, n).replace(/\s+/g, " ").trim();
  const nu = n => P().nu(n);
  const ev = (linha, texto) => ({ linha, texto });
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const funcoes = ctx => ctx.ast.funcoes.filter(f => !f.parcial);
  const nomeSimples = x => { x = nu(x); return x && x.k === "id" ? x.nome : null; };
  const R = [];
  const regra = (id, modulo, categoria, verificar) => R.push({ id, modulo, categoria, verificar(ctx) { if (!ctx.ast) return []; return verificar(ctx) || []; } });

  /* ================= PERMISSÃO ESTRUTURAL ================= */
  // (dono/owner NÃO entra: "donoDoCarro", "cDono" são de propriedade, não de permissão)
  const CAMPO_ADM = /^(p|j|pl|player|jogador)?_?(admin|adm|nivel_?adm|nivel_?admin|staff|mod|moderador|helper|lider|cargo|vip|perm\w*|rank|ceo|fundador|gerente)\d*$/i;
  const BASE_ADM = /^(admin|adm|nivel_?admin|nivel_?adm|staff|moderador|helper|vip|lider|cargo|perm\w*|rank)\w*$/i;
  const FUNC_PERM = /(admin|adm\b|adm[A-Z_]|perm|staff|moderador|helper|lider|cargo|vip|acesso|rank|dono|owner)/i;
  const NAO_PERM = /(conectado|connected|dinheiro|money|grana|spawn|item|arma|weapon|carro|vehicle|veiculo|logado|login|online)/i;
  const PERIGO = /^(Kick|Ban|BanEx|SendRconCommand|SetPlayerHealth|SetPlayerArmour|GivePlayerWeapon|ResetPlayerWeapons|SetPlayerScore|SetPlayerPos|SetPlayerSkin|SetPlayerInterior|SetPlayerVirtualWorld|TogglePlayerControllable|SetPlayerWantedLevel|GivePlayerMoney|ResetPlayerMoney|SetPlayerName|GameModeExit|SetPlayerSpecialAction|SpawnPlayer|PutPlayerInVehicle|DestroyVehicle|SetVehicleHealth|CreateVehicle|SetWeather|SetWorldTime|SendClientMessageToAll|GameTextForAll)$/;
  const GLOBAL = /^(SendRconCommand|GameModeExit|SetWeather|SetWorldTime)$/;
  // expressão é "nível de permissão de alguém"? devolve o texto do jogador ou null
  function jogadorDaPermissao(e, ctx) {
    e = nu(e);
    if (!e) return null;
    if (e.k === "chamada") {
      if (e.nome === "IsPlayerAdmin" && e.args[0]) return txt(ctx, e.args[0]);
      if (FUNC_PERM.test(e.nome) && !NAO_PERM.test(e.nome) && e.args[0]) return txt(ctx, e.args[0]);
      return null;
    }
    const b = P().baseDe(e);
    if (!b || !b.indices.length) return null;
    const campo = b.indices.length >= 2 ? nomeSimples(b.indices[b.indices.length - 1]) : null;
    if ((campo && CAMPO_ADM.test(campo)) || (BASE_ADM.test(b.base) && b.indices.length === 1)) return txt(ctx, b.indices[0]);
    return null;
  }
  // a condição fala de permissão? devolve { jogador, nega } (nega = condição verdadeira quando NÃO tem permissão)
  function permissaoNaCondicao(cond, ctx) {
    let achado = null;
    const visitar = (n, neg) => {
      n = nu(n);
      if (!n || achado) return;
      if (n.k === "un" && n.op === "!") return visitar(n.e, !neg);
      if (n.k === "bin" && (n.op === "&&" || n.op === "||")) { visitar(n.esq, neg); visitar(n.dir, neg); return; }
      if (n.k === "bin" && ["<", "<=", ">", ">=", "==", "!="].includes(n.op)) {
        let lado = n.esq, outro = n.dir, op = n.op;
        let j = jogadorDaPermissao(lado, ctx);
        if (!j) { j = jogadorDaPermissao(n.dir, ctx); lado = n.dir; outro = n.esq; op = { "<": ">", "<=": ">=", ">": "<", ">=": "<=", "==": "==", "!=": "!=" }[op]; }
        if (!j) return;
        const k = F().valorConst(outro, F().simbolos(ctx));
        // "tem permissão" = X >= N, X > N, X != 0, X == N (N > 0)
        let tem = op === ">=" || op === ">" || (op === "!=" && k === 0) || (op === "==" && k !== null && k > 0);
        if (op === "<" || op === "<=" || (op === "==" && k === 0)) tem = false;
        achado = { jogador: j, nega: tem === neg, no: n };
        return;
      }
      const j = jogadorDaPermissao(n, ctx);
      if (j) achado = { jogador: j, nega: neg, no: n };   // IsPlayerAdmin(playerid) / !EhAdmin(playerid)
    };
    visitar(cond, false);
    return achado;
  }
  // ações privilegiadas dentro de um nó (sem entrar em ifs: quem anda pelos ifs é a função abaixo)
  function acoesEm(no, ctx, privs, jogador) {
    const out = [];
    P().percorrer(no, n => {
      if (n.k === "if") return false;
      if (n.k === "chamada") {
        if (PERIGO.test(n.nome)) {
          const a0 = n.args[0] ? txt(ctx, n.args[0]) : "";
          const emSi = a0 === jogador;
          const global = GLOBAL.test(n.nome), todos = /ToAll$/.test(n.nome);
          if (global || todos || !emSi) out.push({ linha: n.linha, oque: `${n.nome}(${todos ? "..." : a0}${n.args.length > 1 && !todos ? ", ..." : ""})`, global, fraca: todos, forte: /^(Kick|Ban|BanEx|SendRconCommand|GameModeExit|SetPlayerName)$/.test(n.nome) });
        }
        const p = privs.get(n.nome);
        if (p) out.push({ linha: n.linha, oque: `${n.nome}(...)`, viaFuncao: n.nome, motivo: p, forte: true });
      }
      if (n.k === "atrib") {
        const b = P().baseDe(n.alvo);
        if (!b || !b.indices.length) return;
        const campo = b.indices.length >= 2 ? nomeSimples(b.indices[b.indices.length - 1]) : null;
        if ((campo && CAMPO_ADM.test(campo)) || (BASE_ADM.test(b.base) && b.indices.length === 1)) {
          // tirar o próprio cargo (sair da org, = 0) não é privilégio; dar cargo pra si mesmo ou pra outro é
          const v = nu(n.valor), emSi = txt(ctx, b.indices[0]) === jogador;
          if (emSi && n.op === "=" && v && ((v.k === "num" && v.valor <= 0) || (v.k === "id" && /^(false|ORG_NENHUMA|NENHUM\w*|SEM_\w+|INVALID_\w+)$/.test(v.nome)))) return;
          out.push({ linha: n.linha, oque: txt(ctx, n.alvo) + " " + n.op + " ...", forte: true, cargo: true });
        }
      }
    });
    return out;
  }
  // funções do projeto que fazem algo privilegiado sem conferir permissão dentro delas
  function funcoesPrivilegiadas(ctx) {
    if (ctx._privs) return ctx._privs;
    const privs = new Map();
    for (let rodada = 0; rodada < 3; rodada++) for (const f of funcoes(ctx)) {
      if (f.tipo === "comando" || f.callback || f.tipo === "trecho" || privs.has(f.nome)) continue;
      let protegida = false;
      P().percorrer(f.corpo, n => { if (n.k === "if" && permissaoNaCondicao(n.cond, ctx)) protegida = true; });
      if (protegida) continue;
      const a = acoesEm(f.corpo, ctx, privs, "\u0000").filter(x => x.forte || x.cargo || x.global);
      if (a.length) privs.set(f.nome, a[0].oque);
    }
    ctx._privs = privs;
    return privs;
  }
  // anda pelos comandos na ordem guardando "já está protegido?"
  function analisarPermissao(f, ctx) {
    const jogador = f.params[0] ? f.params[0].nome : "playerid";
    const privs = funcoesPrivilegiadas(ctx);
    const r = { soltas: [], protegidas: [], checagens: [], naoPara: [], alvoErrado: [], depois: [] };
    const andar = (cmds, prot) => {
      for (const s of cmds) {
        if (!s) continue;
        if (s.k === "if") {
          const pc = permissaoNaCondicao(s.cond, ctx);
          // permissão de OUTRO jogador como guarda (if ... return) é suspeito; num laço listando admins, não
          if (pc && pc.jogador !== jogador && pc.nega && P().sempreRetorna(s.entao) && !/^(i|j|k|p|x|id_?loop)$/.test(pc.jogador)) r.alvoErrado.push({ linha: s.linha, quem: pc.jogador });
          if (pc && pc.jogador === jogador) {
            r.checagens.push(s.linha);
            if (r.soltas.length && !prot) r.depois.push({ linha: s.linha, antes: r.soltas[0] });
            if (pc.nega) {
              if (P().terminaFluxo(s.entao)) { if (s.senao) andar(blocoDe(s.senao), true); prot = true; continue; }
              r.naoPara.push(s.linha);
              andar(blocoDe(s.entao), prot); if (s.senao) andar(blocoDe(s.senao), true);
              continue;
            }
            andar(blocoDe(s.entao), true);
            if (s.senao) { andar(blocoDe(s.senao), prot); if (P().terminaFluxo(s.senao)) prot = true; }
            continue;
          }
          r[prot ? "protegidas" : "soltas"].push(...acoesEm(s.cond, ctx, privs, jogador));
          andar(blocoDe(s.entao), prot);
          if (s.senao) andar(blocoDe(s.senao), prot);
          continue;
        }
        if (s.k === "bloco") { prot = andarBloco(s.corpo, prot); continue; }
        if (["while", "for", "do", "foreach"].includes(s.k)) { andar(blocoDe(s.corpo), prot); continue; }
        if (s.k === "switch") { s.casos.forEach(c => andar(blocoDe(c.corpo), prot)); continue; }
        r[prot ? "protegidas" : "soltas"].push(...acoesEm(s, ctx, privs, jogador));
      }
      return prot;
    };
    const andarBloco = (cmds, prot) => andar(cmds, prot);
    const blocoDe = s => !s ? [] : s.k === "bloco" ? s.corpo : [s];
    andar(f.corpo.corpo, false);
    return r;
  }
  regra("comando-sem-permissao", "segurança (estrutural)", "seguranca", ctx => {
    const out = [];
    for (const f of funcoes(ctx).filter(f => f.tipo === "comando")) {
      const r = analisarPermissao(f, ctx);
      const nome = f.nome;
      const jogador = f.params[0] ? f.params[0].nome : "playerid";
      const L = f.linhaNome || f.linha;
      const linhasF = ctx.linhas.slice(f.linha - 1, f.linhaFim).join("\n");
      const palavraSo = /admin|adm\b|staff|moderador/i.test(linhasF) && !r.checagens.length;
      for (const a of r.alvoErrado) out.push({ nivel: "provavel", linha: a.linha, categoria: "seguranca", titulo: `/${nome} confere a permissão de {{${a.quem}}}, não de quem digitou`,
        porque: `A condição olha o nível de {{${a.quem}}}. Quem está usando o comando é {{${jogador}}}: é a permissão DELE que importa.`,
        consequencia: "Um jogador comum consegue usar o comando (basta escolher um alvo que seja admin), e um admin pode ser barrado.", quando: "Sempre que o comando é usado.",
        correcao: `Troque por {{${jogador}}} na checagem de permissão.`, evidencias: [ev(a.linha, `checa ${a.quem}`)], teste: "Use o comando com uma conta sem admin, mirando num admin." });
      for (const l of r.naoPara) if (r.soltas.length || r.protegidas.length) out.push({ nivel: "provavel", linha: l, categoria: "seguranca", titulo: `/${nome} confere a permissão mas **não para** o comando`,
        porque: "O {{if}} da permissão não tem {{return}}: ele só manda a mensagem e o código continua até a ação.",
        consequencia: "Quem não tem permissão vê o aviso... e o comando funciona mesmo assim.", quando: "Quando alguém sem permissão usa o comando.",
        correcao: "Coloque {{return}} na checagem: {{if (!TemPermissao) return SendClientMessage(...);}}", evidencias: [ev(l, "checagem sem return")], teste: "Use com uma conta sem admin." });
      if (!r.soltas.length || r.naoPara.length || r.alvoErrado.length) continue;
      const forte = r.soltas.some(a => a.forte || a.global || a.cargo);
      const soFraca = r.soltas.every(a => a.fraca);   // só mensagem pra todos: pode ser de propósito
      const temTransferencia = r.soltas.every(a => /^GivePlayerMoney/.test(a.oque)) && P().chamadas(f.corpo).some(c => c.nome === "GivePlayerMoney" && txt(ctx, c.args[0] || c) === jogador && /^-/.test(txt(ctx, c.args[1] || c)));
      if (temTransferencia) continue;   // /pagar: tira de um e dá pro outro (comando de jogador)
      const sens = /^(kick|ban|banir|kickar|dar|set|setar|tp|trazer|puxar|congelar|descongelar|desarmar|darxp|setlevel|setadmin|daradmin|god|jetpack|matar|slap|reiniciar|gmx|limpar|arma|vida|colete|skin|score|admin|adm|tempo|clima|anunciar|explodir|prender|soltar|mute|calar|promover|rebaixar)/i.test(nome);
      const depois = r.depois[0];
      const lista = [...new Set(r.soltas.map(a => a.oque))].slice(0, 3).map(x => `{{${x}}}`).join(", ");
      out.push({ nivel: soFraca ? "verificar" : depois || sens || forte ? "provavel" : "verificar", linha: depois ? depois.linha : L, categoria: "seguranca",
        titulo: depois ? `/${nome}: a permissão é conferida **depois** da ação` : `/${nome} não confere **permissão**`,
        porque: (depois ? `A checagem (linha ${depois.linha}) vem depois de ${lista} (linha ${depois.antes.linha}): quando ela roda, a ação já aconteceu.` : `${lista} roda sem nenhuma condição de permissão antes${r.soltas.some(a => a.viaFuncao) ? ` (a função {{${r.soltas.find(a => a.viaFuncao).viaFuncao}}} faz ${r.soltas.find(a => a.viaFuncao).motivo} e também não confere)` : ""}.`) +
          (palavraSo ? " A palavra \"admin\" aparece no comando (comentário, texto ou nome de variável), mas isso **não protege nada**: só uma condição que para o comando protege." : ""),
        consequencia: `Qualquer jogador consegue usar ${depois ? "(a ação acontece antes de ser barrado)" : ""}: ${r.soltas.some(a => a.cargo) ? "inclusive se dar cargo/admin." : r.soltas.some(a => a.global) ? "e isso afeta o servidor inteiro." : "e afeta outros jogadores."}`,
        quando: "Sempre que alguém sem permissão usa o comando.",
        correcao: `Confira o nível de admin **antes de tudo** e pare o comando: {{if (!IsPlayerAdmin(${jogador})) return SendClientMessage(${jogador}, -1, "Sem permissao.");}} (troque {{IsPlayerAdmin}}, que é o admin RCON, pelo seu sistema, ex: {{Jogador[${jogador}][jAdmin] < 1}}).`,
        // correção (só quando não existe checagem nenhuma): a guarda logo depois da "{" do comando
        correcoes: !depois && !r.checagens.length && (sens || forte) && !soFraca ? [{ tipo: "inserirDepois", linha: f.corpo.linha, linhas: [((ctx.linhas[f.corpo.linha] || "").match(/^\s*/)[0] || "    ") + `if (!IsPlayerAdmin(${jogador})) return SendClientMessage(${jogador}, -1, "Sem permissao.");`] }] : [],
        seguro: !depois && !r.checagens.length && (sens || forte) && !soFraca, suposicao: "usei {{IsPlayerAdmin}} (admin RCON): troque pelo seu sistema de admin",
        evidencias: [ev(L, `/${nome}`), ...r.soltas.slice(0, 3).map(a => ev(a.linha, "ação sem permissão: " + a.oque)), ...(depois ? [ev(depois.linha, "checagem só aqui")] : [])],
        teste: "Use o comando com uma conta sem admin.", limites: sens || forte ? undefined : "Média/baixa: pode ser um comando que todo mundo pode usar de propósito." });
    }
    return out;
  });

  /* ================= INTENÇÃO: AÇÃO NO JOGADOR ERRADO ================= */
  const ACAO_ALVO = /^(SetPlayerHealth|SetPlayerArmour|GivePlayerMoney|ResetPlayerMoney|GivePlayerWeapon|ResetPlayerWeapons|SetPlayerPos|TogglePlayerControllable|SetPlayerSkin|SetPlayerScore|Kick|Ban|BanEx|SpawnPlayer|SetPlayerInterior|SetPlayerVirtualWorld|SetPlayerWantedLevel|SetPlayerColor|SetPlayerName|SetPlayerTeam|SetPlayerDrunkLevel|SetPlayerSpecialAction|ClearAnimations|ApplyAnimation|PutPlayerInVehicle|RemovePlayerFromVehicle)$/;
  regra("alvo-errado", "intenção", "logica", ctx => {
    const out = [], sim = F().simbolos(ctx);
    for (const f of funcoes(ctx).filter(f => f.tipo === "comando")) {
      const jogador = f.params[0] ? f.params[0].nome : "playerid", params = f.params[1] ? f.params[1].nome : "params";
      // alvos: o que o jogador escolheu (sscanf "u"/"i"/"d"/"r", strval(params), ReturnUser...)
      const alvos = new Map();
      for (const c of P().chamadas(f.corpo)) {
        if ((c.nome === "sscanf" || c.nome === "unformat") && c.args[1] && nu(c.args[1]).k === "str") {
          const esp = F().especSscanf(nu(c.args[1]).v);
          esp.forEach((sp, i) => { const v = nomeSimples(c.args[2 + i]); if (v && /[uUrRqQ]/.test(sp)) alvos.set(v, c.linha); else if (v && /[iIdD]/.test(sp) && i === 0 && /^(alvo|id|target|outro|jogador|player|vitima|pid|giveplayerid|otherid|destino)/i.test(v)) alvos.set(v, c.linha); });
        }
      }
      P().percorrer(f.corpo, n => {
        if (n.k === "decl") for (const v of n.vars) { const i = v.init && nu(v.init); if (i && i.k === "chamada" && /^(strval|ReturnUser)$/.test(i.nome) && txt(ctx, i.args[0] || i) === params) alvos.set(v.nome, v.linha); }
        if (n.k === "atrib" && n.op === "=") { const i = nu(n.valor); const v = nomeSimples(n.alvo); if (v && i && i.k === "chamada" && /^(strval|ReturnUser)$/.test(i.nome) && txt(ctx, i.args[0] || i) === params) alvos.set(v, n.linha); }
      });
      const chamadas = P().chamadas(f.corpo);
      for (const gp of chamadas.filter(c => c.nome === "GetPlayerPos" && c.args.length === 4)) {
        const quem = txt(ctx, gp.args[0]), vars = gp.args.slice(1).map(a => nomeSimples(a));
        const sp = chamadas.find(c => c.nome === "SetPlayerPos" && c.linha >= gp.linha && c.args[0] && txt(ctx, c.args[0]) === quem && c.args.slice(1).some(a => vars.some(v => v && new RegExp(`\\b${esc(v)}\\b`).test(txt(ctx, a)))));
        if (!sp || (quem !== jogador && !alvos.has(quem))) continue;
        const outro = quem === jogador ? [...alvos.keys()][0] : jogador;
        if (!outro) continue;
        out.push({ nivel: "provavel", linha: gp.linha, categoria: "logica", titulo: `Lê a posição de {{${quem}}} e coloca o próprio {{${quem}}} lá: ele **não sai do lugar**`,
          porque: `{{GetPlayerPos(${quem}, ...)}} (linha ${gp.linha}) e {{SetPlayerPos(${quem}, ...)}} (linha ${sp.linha}) usam o mesmo jogador. Pra levar alguém até outro, a posição tem que ser lida do **outro** ({{${outro}}}).`,
          consequencia: `O comando "funciona" mas ${quem} só é movido pra perto de onde já estava.`, quando: "Sempre.",
          correcao: `Leia a posição de quem fica parado: {{GetPlayerPos(${outro}, ...)}}.`, evidencias: [ev(gp.linha, `posição de ${quem}`), ev(sp.linha, `move ${quem}`)], teste: "Use o comando e veja se o jogador muda de lugar." });
      }
      if (!alvos.size) continue;
      for (const [alvo, linhaAlvo] of alvos) {
        const naAlvo = chamadas.filter(c => ACAO_ALVO.test(c.nome) && c.args[0] && txt(ctx, c.args[0]) === alvo);
        const naMim = chamadas.filter(c => ACAO_ALVO.test(c.nome) && c.args[0] && txt(ctx, c.args[0]) === jogador);
        if (naAlvo.length || !naMim.length) continue;
        // ir até o alvo / copiar algo do alvo é de propósito: GetPlayerPos(alvo, ...) + SetPlayerPos(playerid, ...)
        const leDoAlvo = chamadas.some(c => /^Get\w+/.test(c.nome) && c.args[0] && txt(ctx, c.args[0]) === alvo && !/^GetPlayerName$/.test(c.nome));
        const suspeitas = naMim.filter(c => !(leDoAlvo && /^(SetPlayerPos|SetPlayerInterior|SetPlayerVirtualWorld|PutPlayerInVehicle|SetPlayerFacingAngle)$/.test(c.nome)));
        if (!suspeitas.length) continue;
        // pagar com o próprio dinheiro: GivePlayerMoney(playerid, -x) é legítimo
        const s0 = suspeitas.find(c => !(c.nome === "GivePlayerMoney" && /^-/.test(txt(ctx, c.args[1] || c))));
        if (!s0) continue;
        // evidência extra: mensagem falando do alvo (nome dele, "você curou %s", "foi curado por")
        const fala = chamadas.some(c => c.nome === "GetPlayerName" && txt(ctx, c.args[0] || c) === alvo) || /\b(curou|deu|congelou|setou|kickou|baniu|teleportou|desarmou|matou|foi curado|recebeu|foi congelado|foi setado)\b/i.test(txt(ctx, f.corpo));
        out.push({ nivel: fala ? "provavel" : "verificar", linha: s0.linha, categoria: "logica", titulo: `/${f.nome} escolhe um alvo ({{${alvo}}}), mas {{${s0.nome}}} é aplicado em **quem digitou**`,
          porque: `{{${alvo}}} vem do que o jogador digitou (linha ${linhaAlvo})${fala ? " e o comando fala do alvo nas mensagens" : ""}, mas a ação {{${txt(ctx, s0)}}} usa {{${jogador}}} (quem usou o comando). O alvo não recebe nada.`,
          consequencia: `Quem usa o comando recebe o efeito em si mesmo; o jogador escolhido continua igual.`,
          quando: "Sempre que o comando é usado em outro jogador.", correcao: `Troque o primeiro argumento por {{${alvo}}}: {{${txt(ctx, s0).replace(new RegExp("\\(\\s*" + esc(jogador) + "\\b"), "(" + alvo)}}}.${fala ? "" : " (Se o comando é pra você mesmo de propósito, tudo certo: aí o alvo nem precisava existir.)"}`,
          correcoes: fala ? [{ tipo: "trocar", linha: s0.linha, de: new RegExp(`(${esc(s0.nome)}\\s*\\(\\s*)${esc(jogador)}\\b`), para: `$1${alvo}` }] : [], seguro: false,
          evidencias: [ev(linhaAlvo, `alvo escolhido: ${alvo}`), ev(s0.linha, `ação em ${jogador}`)], teste: `Use o comando em outro jogador e veja quem recebe o efeito.` });
        void sim;
      }
    }
    return out;
  });

  /* ================= LIMITES: > x >= (só com evidência) ================= */
  // frase da mensagem diz se o limite INCLUI o número ("pelo menos 10", "nível 10 ou mais") ou EXCLUI ("mais de 10")
  function intencaoDaMensagem(texto, N) {
    const t = texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const n = String(N).replace(".", "\\.");
    if (new RegExp(`(mais de|acima de|maior que|superior a|passar de)\\s*(nivel |level |\\$ ?|r\\$ ?)?${n}\\b`).test(t)) return "exclui";
    if (new RegExp(`(pelo menos|no minimo|minimo( de| e)?|a partir d[eo]|precisa( ter| de| do| ser)?( nivel| level| lvl)?|requer|necessario|exige)\\s*(nivel |level |lvl |\\$ ?|r\\$ ?)?${n}\\b|\\b${n}\\s*(ou mais|\\+)|(nivel|level|lvl)\\s*${n}\\s*(necessario|minimo|ou mais)`).test(t)) return "inclui";
    if (new RegExp(`(no maximo|ate|maximo( de| e)?|limite( de| e)?)\\s*(nivel |level |\\$ ?)?${n}\\b`).test(t)) return "maximo-inclui";
    if (new RegExp(`(menos de|abaixo de|menor que)\\s*(nivel |level |\\$ ?)?${n}\\b`).test(t)) return "maximo-exclui";
    if (new RegExp(`\\b${n}\\b`).test(t)) return "cita";
    return null;
  }
  const textosEm = (no, ctx) => { const out = []; P().percorrer(no, n => { if (n.k === "str") out.push(n.v); }); return out.join(" | "); };
  regra("limite-um-a-mais", "intenção", "logica", ctx => {
    const out = [], sim = F().simbolos(ctx);
    // o ramo BARRA? = termina (return) sem fazer nada além de avisar
    const SO_AVISO = /^(SendClientMessage|GameTextForPlayer|PlayerPlaySound|format|ShowPlayerDialog|printf|print)$/;
    const soAvisa = no => { let ok = true; P().percorrer(no, m => { if (m.k === "chamada" && !SO_AVISO.test(m.nome)) ok = false; if (m.k === "atrib") ok = false; }); return ok; };
    // limite de array: if (i < 0 || i > TAM) return; ... arr[i]  →  i == TAM passa
    for (const f of funcoes(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "if" || !n.cond || !P().terminaFluxo(n.entao)) return;
      const partes = [];
      const juntar = e => { e = nu(e); if (e && e.k === "bin" && e.op === "||") { juntar(e.esq); juntar(e.dir); } else if (e) partes.push(e); };
      juntar(n.cond);
      for (const c of partes) {
        if (c.k !== "bin" || c.op !== ">") continue;
        const nome = nomeSimples(c.esq), N = F().valorConst(c.dir, sim);
        if (!nome || N === null) continue;
        let usa = null;
        P().percorrer(f.corpo, m => { if (!usa && m.k === "indice" && m.linha >= n.linha && nomeSimples(m.i) === nome) { const b = P().baseDe(m); const info = b && sim.globais.get(b.base); const tam = info && info.tamanhos ? info.tamanhos[b.indices.length - 1] : null; if (tam === N) usa = { m, b }; } });
        if (!usa) continue;
        out.push({ nivel: "erro", linha: n.linha, categoria: "logica", titulo: `{{${nome}}} = ${N} passa na checagem e estoura {{${usa.b.base}}}`,
          porque: `{{${usa.b.base}}} tem ${N} posições (0 a ${N - 1}). A checagem barra só **maior** que ${N}, então ${N} passa e é usado na linha ${usa.m.linha}.`,
          consequencia: "Erro \"array index out of bounds\": a função para no meio.", quando: `Quando ${nome} é ${N}.`, correcao: `Use {{${nome} >= ${txt(ctx, c.dir)}}}.`,
          correcoes: [{ tipo: "trocar", linha: n.linha, de: new RegExp(`${esc(nome)}\\s*>\\s*${esc(txt(ctx, c.dir))}`), para: `${nome} >= ${txt(ctx, c.dir)}` }], seguro: true,
          evidencias: [ev(n.linha, "checagem"), ev(usa.m.linha, `usa ${usa.b.base}[${nome}]`)], teste: `Chame com ${nome} = ${N}.` });
      }
    });
    for (const f of funcoes(ctx)) P().percorrer(f.corpo, (n, pai) => {
      if (n.k !== "if" || !n.cond) return;
      const c = nu(n.cond);
      if (!c || c.k !== "bin" || !["<", "<=", ">", ">="].includes(c.op)) return;
      let v = c.esq, k = c.dir, op = c.op;
      let N = F().valorConst(k, sim);
      if (N === null) { const N2 = F().valorConst(c.esq, sim); if (N2 !== null) { N = N2; v = c.dir; k = c.esq; op = { "<": ">", "<=": ">=", ">": "<", ">=": "<=" }[op]; } }
      const rejeita = P().terminaFluxo(n.entao) && soAvisa(n.entao);   // if (...) return "mensagem"  → a condição é a de BARRAR
      // o que vem logo depois do if (quando ele termina) é o "senão" na prática
      const depois = !n.senao && P().terminaFluxo(n.entao) && pai && pai.k === "bloco" ? pai.corpo.slice(pai.corpo.indexOf(n) + 1, pai.corpo.indexOf(n) + 3) : [];
      // ---------- dinheiro x preço ----------
      const vt = txt(ctx, v);
      const ehDinheiro = /GetPlayerMoney|Dinheiro|dinheiro|Money|money|Grana|grana|Saldo|saldo|Banco|banco/.test(vt);
      const outroT = txt(ctx, k);
      if (ehDinheiro && N === null && /preco|preço|price|valor|custo|cost|taxa/i.test(outroT)) {
        // barrar com <= preço (quem tem EXATAMENTE o preço não compra) / permitir só com > preço
        if ((rejeita && op === "<=") || (!rejeita && op === ">")) out.push({ nivel: "provavel", linha: n.linha, categoria: "logica", titulo: `Quem tem **exatamente** {{${outroT}}} não consegue`,
          porque: `{{${txt(ctx, c)}}} ${rejeita ? "barra" : "só deixa passar"} ${rejeita ? "quando o dinheiro é menor **ou igual**" : "quando o dinheiro é **maior**"} ao preço. Com dinheiro igual ao preço a compra deveria passar.`,
          consequencia: "O jogador com o valor certinho recebe \"sem dinheiro\".", quando: `Quando o dinheiro é igual a ${outroT}.`,
          correcao: rejeita ? `Use {{${vt} < ${outroT}}}.` : `Use {{${vt} >= ${outroT}}}.`, correcoes: [{ tipo: "trocar", linha: n.linha, de: new RegExp(`${esc(vt)}\\s*${esc(c.op === op ? c.op : c.op)}\\s*${esc(outroT)}`), para: `${vt} ${rejeita ? "<" : ">="} ${outroT}` }], seguro: true,
          evidencias: [ev(n.linha, txt(ctx, c))], teste: `Teste com o dinheiro igual a ${outroT}.` });
        return;
      }
      if (N === null) return;
      // ---------- mensagem que diz a regra ----------
      const msgs = rejeita ? textosEm(n.entao, ctx) : textosEm(n.senao, ctx) || depois.map(d => textosEm(d, ctx)).filter(Boolean).join(" | ") || textosEm(n.entao, ctx);
      // a mensagem pode estar em outro ponto da função (ex: depois do if)
      let intencao = msgs ? intencaoDaMensagem(msgs, N) : null;
      let msgsUsadas = msgs;
      if (!intencao) { const todas = textosEm(f.corpo, ctx); const i2 = todas ? intencaoDaMensagem(todas, N) : null; if (i2) { intencao = i2 === "cita" ? "cita" : i2; msgsUsadas = todas; } }
      if (!intencao) return;
      if (!intencao) return;
      // o que a condição faz com o valor N: passa ou é barrado?
      const passaN = (() => {
        const verdade = op === "<" ? N < N : op === "<=" ? true : op === ">" ? false : true;   // condição com v == N
        return rejeita ? !verdade : verdade;
      })();
      // valor uma unidade acima/abaixo, pra saber se o limite é "de baixo" ou "de cima"
      const limiteDeBaixo = rejeita ? (op === "<" || op === "<=") : (op === ">" || op === ">=");
      let esperado = null;
      if (intencao === "inclui") esperado = limiteDeBaixo ? true : null;
      if (intencao === "exclui") esperado = limiteDeBaixo ? false : null;
      if (intencao === "maximo-inclui") esperado = !limiteDeBaixo ? true : null;
      if (intencao === "maximo-exclui") esperado = !limiteDeBaixo ? false : null;
      const frase = msgsUsadas.split(" | ").find(m => new RegExp(`\\b${N}\\b`).test(m)) || msgsUsadas;
      if (esperado === null && intencao !== "cita") return;
      if (intencao === "cita") {
        // a mensagem cita o número mas não diz se inclui: pergunta
        if (!/(nivel|level|lvl|dinheiro|\$|score|idade|minimo|maximo|vip|admin)/i.test(frase.normalize("NFD").replace(/[̀-ͯ]/g, ""))) return;
        out.push({ nivel: "verificar", linha: n.linha, categoria: "logica", titulo: `${N} deve passar ou ser barrado? ({{${txt(ctx, c)}}})`,
          porque: `A mensagem cita ${N} ("${frase.slice(0, 60)}"), mas não diz se ${N} conta. Do jeito que está, ${vt} = ${N} ${passaN ? "**passa**" : "é **barrado**"}.`,
          consequencia: `Se a regra é "${N} ou mais", ${passaN ? "está certo" : "quem tem exatamente " + N + " fica de fora"}; se é "mais de ${N}", ${passaN ? "quem tem exatamente " + N + " entra sem poder" : "está certo"}.`,
          quando: `Quando ${vt} vale exatamente ${N}.`, correcao: `Decida a regra e escreva na mensagem ("pelo menos ${N}" ou "mais de ${N}"); use {{>=}} pra incluir ${N} e {{>}} pra excluir.`,
          teste: `Teste com ${vt} = ${N}.`, limites: "Baixa: a intenção não dá pra saber só pelo código. Isto é uma pergunta, não um erro." });
        return;
      }
      if (esperado === passaN) return;
      const certo = (() => {
        const mapa = rejeita ? { true: limiteDeBaixo ? "<" : ">", false: limiteDeBaixo ? "<=" : ">=" } : { true: limiteDeBaixo ? ">=" : "<=", false: limiteDeBaixo ? ">" : "<" };
        const o = mapa[esperado];
        return v === c.esq ? o : { "<": ">", "<=": ">=", ">": "<", ">=": "<=" }[o];
      })();
      out.push({ nivel: "provavel", linha: n.linha, categoria: "logica", titulo: `{{${txt(ctx, c)}}} ${passaN ? "deixa passar" : "barra"} quem tem **exatamente ${N}**, mas a mensagem diz o contrário`,
        porque: `A mensagem diz "${frase.slice(0, 70)}" (${esperado ? `${N} conta` : `${N} não conta`}). Com {{${c.op}}}, ${vt} = ${N} ${passaN ? "passa" : "é barrado"}.`,
        consequencia: esperado ? `Quem tem exatamente ${N} é barrado mesmo cumprindo a regra.` : `Quem tem exatamente ${N} passa sem cumprir a regra.`, quando: `Quando ${vt} vale exatamente ${N}.`,
        correcao: `Troque {{${c.op}}} por {{${certo}}}: {{${txt(ctx, c.esq)} ${certo} ${txt(ctx, c.dir)}}}. (Se a regra mudou, ajuste a mensagem em vez disso.)`,
        correcoes: [{ tipo: "trocar", linha: n.linha, de: new RegExp(`${esc(txt(ctx, c.esq))}\\s*${esc(c.op)}\\s*${esc(txt(ctx, c.dir))}`), para: `${txt(ctx, c.esq)} ${certo} ${txt(ctx, c.dir)}` }], seguro: false,
        evidencias: [ev(n.linha, txt(ctx, c))], teste: `Teste com ${vt} = ${N}.`, limites: "Média: comparei a condição com a mensagem do próprio código. Se a mensagem é que está errada, conserte ela." });
    });
    return out;
  });

  /* ================= PERSISTÊNCIA (DOF2 / dini) ================= */
  const SET = /^(DOF2_Set(Int|Float|String|Bool)|dini_(IntSet|FloatSet|Set|BoolSet))$/, GET = /^(DOF2_Get(Int|Float|String|Bool)|dini_(Int|Float|Get|Bool))$/;
  const tipoDe = nome => /Float/.test(nome) ? "Float" : /String|dini_Set$|dini_Get$/.test(nome) ? "String" : /Bool/.test(nome) ? "Bool" : "Int";
  const normalizar = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/^(p|j|pl|player|jogador|info|e|c|v)_?(?=[a-z])/, "").replace(/[^a-z0-9]/g, "");
  function campoDe(e, ctx) { e = nu(e); if (!e) return null; if (e.k === "un") return campoDe(e.e, ctx); if (e.k === "chamada" && /^(floatround|float)$/.test(e.nome)) return campoDe(e.args[0], ctx); const b = P().baseDe(e); if (!b) return null; return b.indices.length >= 2 ? b.base + "." + (nomeSimples(b.indices[b.indices.length - 1]) || "?") : b.indices.length ? b.base + "[]" : b.base; }
  // caminho do arquivo: o texto do format que montou a variável (ex: "contas/%s.ini")
  function caminhoDe(arg, f, ctx) {
    const a = nu(arg);
    if (!a) return null;
    if (a.k === "str") return a.v;
    const v = nomeSimples(a);
    if (!v) return null;
    let fmt = null;
    for (const c of P().chamadas(f.corpo)) if (c.nome === "format" && nomeSimples(c.args[0]) === v && c.args[2] && nu(c.args[2]).k === "str") fmt = nu(c.args[2]).v;
    if (fmt) return fmt;
    // caminho montado em outra função (ex: CaminhoConta(playerid, arq))
    for (const c of P().chamadas(f.corpo)) if (c.args.some(x => nomeSimples(x) === v)) { const g = ctx.ast.funcoes.find(x => x.nome === c.nome); if (g) for (const d of P().chamadas(g.corpo)) if (d.nome === "format" && d.args[2] && nu(d.args[2]).k === "str") return nu(d.args[2]).v; }
    return null;
  }
  function persistencia(ctx) {
    const ops = [];
    for (const f of funcoes(ctx)) {
      P().percorrer(f.corpo, n => {
        if (n.k === "chamada" && SET.test(n.nome) && n.args[1]) {
          const k = nu(n.args[1]);
          ops.push({ op: "set", tipo: tipoDe(n.nome), chave: k && k.k === "str" ? k.v : null, campo: campoDe(n.args[2], ctx), arquivo: caminhoDe(n.args[0], f, ctx), linha: n.linha, funcao: f.nome, no: n });
        }
        const pega = (alvo, valor, linha) => {
          let c = nu(valor);
          while (c && c.k === "chamada" && /^(float|floatround|strval|bool)$/.test(c.nome) && c.args[0]) c = nu(c.args[0]);
          if (!c || c.k !== "chamada" || !GET.test(c.nome) || !c.args[1]) return;
          const k = nu(c.args[1]);
          ops.push({ op: "get", tipo: tipoDe(c.nome), chave: k && k.k === "str" ? k.v : null, campo: campoDe(alvo, ctx), arquivo: caminhoDe(c.args[0], f, ctx), linha, funcao: f.nome, no: c });
        };
        if (n.k === "atrib" && n.op === "=") pega(n.alvo, n.valor, n.linha);
        if (n.k === "decl") n.vars.forEach(v => v.init && pega({ k: "id", nome: v.nome }, v.init, v.linha));
        // leitura usada direto como argumento (ex: SetPlayerPos(p, float(DOF2_GetInt(arq, "X")), ...))
        if (n.k === "chamada" && !/^(DOF2_Get|dini_)/.test(n.nome)) for (const a of n.args) { let c = nu(a); while (c && c.k === "chamada" && /^(float|floatround|strval|bool)$/.test(c.nome) && c.args[0]) c = nu(c.args[0]); if (c && c.k === "chamada" && GET.test(c.nome) && c.args[1]) { const k = nu(c.args[1]); ops.push({ op: "get", tipo: tipoDe(c.nome), chave: k && k.k === "str" ? k.v : null, campo: null, arquivo: caminhoDe(c.args[0], f, ctx), linha: c.linha, funcao: f.nome, no: c }); } }
        // DOF2_GetString(arq, "Senha", Senha[playerid]) / dini_Get com destino no 3º argumento
        if (n.k === "chamada" && /^DOF2_GetString$/.test(n.nome) && n.args[2]) { const k = nu(n.args[1]); ops.push({ op: "get", tipo: "String", chave: k && k.k === "str" ? k.v : null, campo: campoDe(n.args[2], ctx), arquivo: caminhoDe(n.args[0], f, ctx), linha: n.linha, funcao: f.nome, no: n }); }
      });
    }
    return ops;
  }
  regra("persistencia-dados", "persistência", "integracao", ctx => {
    const out = [];
    const ops = persistencia(ctx);
    if (!ops.length) return out;
    const sets = ops.filter(o => o.op === "set" && o.chave), gets = ops.filter(o => o.op === "get" && o.chave);
    const sim = F().simbolos(ctx);
    const chamadas = new Set(); for (const f of ctx.ast.funcoes) for (const c of P().chamadas(f.corpo)) chamadas.add(c.nome);
    const viaTimer = new Set(); for (const f of ctx.ast.funcoes) for (const c of P().chamadas(f.corpo)) if (/^(SetTimer|SetTimerEx|CallLocalFunction|CallRemoteFunction)$/.test(c.nome) && c.args[0] && nu(c.args[0]).k === "str") viaTimer.add(nu(c.args[0]).v);
    const completo = ctx.completo || (!!ctx.arquivoDe && !(ctx.faltando || []).length);
    // 1. mesmo campo: salvo com uma chave, carregado com outra
    if (sets.length && gets.length) {
      for (const s of sets) {
        if (!s.campo || gets.some(g => g.chave === s.chave)) continue;
        const g = gets.find(g => g.campo === s.campo && g.chave !== s.chave && !sets.some(x => x.chave === g.chave));
        if (!g) continue;
        // migração: o mesmo campo também é carregado da chave antiga em outro lugar → de propósito
        if (gets.filter(x => x.campo === s.campo).length > 1) continue;
        out.push({ nivel: "provavel", linha: g.linha, categoria: "integracao", titulo: `{{${s.campo.replace(".", "][")}}} é salvo como {{"${s.chave}"}} e carregado como {{"${g.chave}"}}`,
          porque: `Na linha ${s.linha} ({{${s.funcao}}}) a chave é {{"${s.chave}"}}; na linha ${g.linha} ({{${g.funcao}}}) o mesmo dado é lido de {{"${g.chave}"}}, que nunca é gravada.`,
          consequencia: "Ao entrar de novo, o valor volta pro padrão (0): parece que o progresso **sumiu**, mesmo estando salvo no arquivo.",
          quando: "Todo login depois do primeiro.", correcao: `Use a mesma chave nos dois lugares (ex: {{"${s.chave}"}}). Se você trocou o nome de propósito, carregue a chave antiga quando a nova não existir ({{DOF2_IsSet}}).`,
          correcoes: [{ tipo: "trocar", linha: g.linha, de: new RegExp(`"${esc(g.chave)}"`), para: `"${s.chave}"` }], seguro: false,
          evidencias: [ev(s.linha, `salva "${s.chave}"`), ev(g.linha, `carrega "${g.chave}"`)], teste: "Mude o valor, saia, entre de novo e confira." });
      }
      // 2. tipo diferente entre salvar e carregar
      for (const g of gets) {
        const s = sets.find(x => x.chave === g.chave);
        if (!s || s.tipo === g.tipo || (s.tipo === "Bool" && g.tipo === "Int") || (s.tipo === "Int" && g.tipo === "Bool")) continue;
        out.push({ nivel: "provavel", linha: g.linha, categoria: "integracao", titulo: `{{"${g.chave}"}} é salvo como **${s.tipo}** e lido como **${g.tipo}**`,
          porque: `Salva com {{${s.no.nome}}} (linha ${s.linha}) e lê com {{${g.no.nome}}} (linha ${g.linha}).`,
          consequencia: s.tipo === "Float" && g.tipo === "Int" ? "As casas decimais se perdem (ex: 99.5 vira 99)." : s.tipo === "String" ? "O texto vira número 0 (ou lixo de conversão)." : "O valor volta diferente do que foi salvo.",
          quando: "No login.", correcao: `Use o mesmo tipo dos dois lados ({{DOF2_Set${s.tipo}}} com {{DOF2_Get${s.tipo}}}).`, evidencias: [ev(s.linha, "salva " + s.tipo), ev(g.linha, "lê " + g.tipo)], teste: "Salve um valor com casas decimais e carregue." });
      }
      // 3. carregado na variável errada (a chave tem o nome de OUTRO campo)
      for (const g of gets) {
        if (g.campo && !/\./.test(g.campo)) {
          const base = g.campo.replace(/\[\]$/, ""), kn = normalizar(g.chave), bn = normalizar(base);
          if (kn === bn || bn.includes(kn) || kn.includes(bn)) continue;
          const certo = [...sim.globais.keys()].find(n => n !== base && normalizar(n) === kn);
          if (!certo) continue;
          out.push({ nivel: "provavel", linha: g.linha, categoria: "integracao", titulo: `A chave {{"${g.chave}"}} é carregada em {{${base}}}, não em {{${certo}}}`,
            porque: `O nome da chave bate com a variável {{${certo}}}, mas o valor vai pra {{${base}}}.`, consequencia: `No login, {{${base}}} recebe o valor de "${g.chave}" (os dois ficam trocados ou um fica zerado).`, quando: "No login.",
            correcao: `Carregue "${g.chave}" em {{${certo}}}.`, evidencias: [ev(g.linha, `${g.chave} → ${base}`)], teste: "Confira os valores depois de logar." });
          continue;
        }
        if (!g.campo || !/\./.test(g.campo)) continue;
        const [base, campo] = g.campo.split(".");
        const kn = normalizar(g.chave), cn = normalizar(campo);
        if (kn === cn || cn.includes(kn) || kn.includes(cn)) continue;
        const enumDe = [...sim.enums.values()].find(e => e.membros.includes(campo));
        const certo = enumDe && enumDe.membros.find(m => normalizar(m) === kn);
        if (!certo) continue;
        out.push({ nivel: "provavel", linha: g.linha, categoria: "integracao", titulo: `A chave {{"${g.chave}"}} é carregada em {{${campo}}}, não em {{${certo}}}`,
          porque: `O nome da chave bate com o campo {{${certo}}}, mas o valor vai pra {{${base}[...][${campo}]}}.`,
          consequencia: `No login, {{${campo}}} recebe o valor de "${g.chave}" e {{${certo}}} fica sem carregar.`, quando: "No login.",
          correcao: `Carregue em {{${base}[playerid][${certo}]}}.`, evidencias: [ev(g.linha, `${g.chave} → ${campo}`)], teste: "Confira os dois valores depois de logar." });
      }
      // 4. arquivo diferente entre salvar e carregar (inclusive maiúscula/minúscula: no Linux são pastas diferentes)
      const caminhosS = [...new Set(sets.map(s => s.arquivo).filter(Boolean))], caminhosG = [...new Set(gets.map(g => g.arquivo).filter(Boolean))];
      if (caminhosS.length === 1 && caminhosG.length === 1 && caminhosS[0] !== caminhosG[0]) {
        const g = gets.find(x => x.arquivo === caminhosG[0]), s = sets.find(x => x.arquivo === caminhosS[0]);
        const soCaixa = caminhosS[0].toLowerCase() === caminhosG[0].toLowerCase();
        out.push({ nivel: "provavel", linha: g.linha, categoria: "integracao", titulo: `Salva em {{"${caminhosS[0]}"}} e carrega de {{"${caminhosG[0]}"}}`,
          porque: soCaixa ? "Os caminhos só mudam nas maiúsculas/minúsculas. No Windows dá certo; num servidor **Linux** são pastas diferentes." : "O arquivo que é lido não é o mesmo que é gravado.",
          consequencia: "O login lê um arquivo que nunca recebe os dados: a conta parece zerada (ou \"não registrada\").", quando: soCaixa ? "Quando o servidor roda em Linux (a maioria das hospedagens)." : "Sempre.",
          correcao: "Monte o caminho num lugar só (uma função {{CaminhoConta}}) e use nos dois.", evidencias: [ev(s.linha, "salva aqui"), ev(g.linha, "carrega daqui")], teste: "Salve, reinicie o servidor e veja qual arquivo foi criado." });
      }
      // 5. salvo e nunca carregado (pode ser de propósito: log, estatística)
      const naoLidas = [...new Set(sets.filter(s => !gets.some(g => g.chave === s.chave) && !(s.campo && gets.some(g => g.campo === s.campo))).map(s => s.chave))];
      if (naoLidas.length && naoLidas.length < sets.length) {
        const s = sets.find(x => x.chave === naoLidas[0]);
        out.push({ nivel: "verificar", linha: s.linha, categoria: "integracao", titulo: `${naoLidas.slice(0, 3).map(k => `{{"${k}"}}`).join(", ")} ${naoLidas.length > 1 ? "são salvas" : "é salva"} mas **nunca carregada${naoLidas.length > 1 ? "s" : ""}**`,
          porque: "A função de carregar lê as outras chaves, mas não essas.", consequencia: "Se esse dado devia voltar no login, ele volta zerado.", quando: "No login.",
          correcao: "Carregue no login (ou, se for só registro/estatística, pode ignorar).", teste: "Mude o valor, saia, entre e confira.", limites: "Baixa: pode ser de propósito (histórico, log)." });
      }
    }
    // 6. função de salvar que ninguém chama
    if (completo) for (const f of funcoes(ctx)) {
      if (f.callback || f.tipo === "comando" || f.tipo === "trecho") continue;
      if (!ops.some(o => o.op === "set" && o.funcao === f.nome)) continue;
      if (chamadas.has(f.nome) || viaTimer.has(f.nome)) continue;
      out.push({ nivel: "provavel", linha: f.linhaNome || f.linha, categoria: "integracao", titulo: `{{${f.nome}}} grava os dados, mas **ninguém chama** ela`,
        porque: `Nenhuma função, comando, callback ou timer do código chama {{${f.nome}}}.${f.tipo === "stock" ? " E função {{stock}} que ninguém usa nem é compilada." : ""}`,
        consequencia: "Nada é salvo: o jogador perde tudo ao sair.", quando: "Sempre.", correcao: `Chame {{${f.nome}(playerid);}} no {{OnPlayerDisconnect}} (e, se quiser, num timer de alguns minutos).`,
        evidencias: [ev(f.linhaNome || f.linha, "função de salvar")], teste: "Saia do servidor e veja se o arquivo mudou." });
    }
    // 7. carrega e depois sobrescreve SEM condição, no mesmo bloco (um "if (x < 1) x = 1" é correção, não perda)
    const blocos = [];
    for (const f of funcoes(ctx)) P().percorrer(f.corpo, n => { if (n.k === "bloco") blocos.push(n); });
    for (const bl of blocos) {
      const lidos = new Map();
      for (const st of bl.corpo) {
        if (st.k !== "expr" || !st.e || st.e.k !== "atrib" || st.e.op !== "=") continue;
        const n = st.e, v = nu(n.valor), campo = campoDe(n.alvo, ctx);
        if (!campo) continue;
        if (v && v.k === "chamada" && GET.test(v.nome)) { lidos.set(campo, n.linha); continue; }
        if (lidos.has(campo) && v && (v.k === "num" || (v.k === "str" && v.v === ""))) {
          out.push({ nivel: "provavel", linha: n.linha, categoria: "logica", titulo: `{{${campo.replace(".", "][")}}} é carregado e logo depois **sobrescrito**`,
            porque: `Na linha ${lidos.get(campo)} o valor vem do arquivo; nesta linha ele recebe ${txt(ctx, n.valor)} de novo, sem condição.`,
            consequencia: "O valor salvo nunca chega a valer: o jogador volta sempre com o padrão.", quando: "Todo login.",
            correcao: "Zere os dados **antes** de carregar (no começo do login), não depois.", evidencias: [ev(lidos.get(campo), "carrega"), ev(n.linha, "sobrescreve")], teste: "Mude o valor, saia e entre." });
          lidos.delete(campo);
        }
      }
    }
    return out;
  });

  /* ================= VALOR PADRÃO (-1 / INVALID_*) ================= */
  regra("valor-padrao", "estado do jogador", "logica", ctx => {
    const out = [], sim = F().simbolos(ctx);
    const codigo = ctx.limpo || ctx.codigo;
    const INIT = /^(OnGameModeInit|OnFilterScriptInit|OnPlayerConnect|main)$/;
    for (const g of sim.globais.values()) {
      if (!g.dims || !g.dims.length) continue;
      if (g.init) continue;   // new X[...] = { -1, ... }
      const nome = esc(g.nome);
      // comparado com -1 / INVALID_* como sinal de "vazio"
      const cmp = new RegExp(`\\b${nome}\\s*\\[[^\\]]*\\](?:\\s*\\[[^\\]]*\\])?\\s*(!=|==)\\s*(-\\s*1|INVALID_\\w+)|(-\\s*1|INVALID_\\w+)\\s*(!=|==)\\s*${nome}\\s*\\[`).exec(codigo);
      if (!cmp) continue;
      const sentinela = (cmp[2] || cmp[3]).replace(/\s+/g, "");
      if (sentinela === "INVALID_PLAYER_ID" && /^(Alvo|Target|Ultimo|Last)/i.test(g.nome) === false && false) continue;
      // em algum lugar ele recebe a sentinela no INÍCIO (init / connect / laço de inicialização)?
      let iniciado = false, recebeAlgumLugar = false;
      for (const f of ctx.ast.funcoes) P().percorrer(f.corpo, n => {
        if (n.k !== "atrib" || n.op !== "=") return;
        const b = P().baseDe(n.alvo);
        if (!b || b.base !== g.nome) return;
        const v = txt(ctx, n.valor).replace(/\s+/g, "");
        if (v === sentinela || (/^INVALID_/.test(v) && /^INVALID_/.test(sentinela)) || (v === "-1" && sentinela === "-1")) { recebeAlgumLugar = true; if (INIT.test(f.nome)) iniciado = true; }
      });
      if (iniciado) continue;
      const L = ctx.linhas.findIndex(l => new RegExp(`\\b${nome}\\b`).test(l) && /(!=|==)\s*(-\s*1|INVALID_)|(-\s*1|INVALID_\w+)\s*(!=|==)/.test(l)) + 1;
      if (!L) continue;
      out.push({ nivel: recebeAlgumLugar ? "verificar" : "provavel", linha: L, categoria: "logica", titulo: `{{${g.nome}}} começa em **0**, não em {{${sentinela}}}`,
        porque: `O código usa {{${sentinela}}} como "vazio" (linha ${L}), mas {{new ${g.nome}[...]}} começa com **0** em todas as posições${recebeAlgumLugar ? " e só recebe " + sentinela + " depois (não no começo)" : ""}. Pra esse teste, 0 parece um valor **guardado**.`,
        consequencia: `Antes da primeira vez que recebe um valor, o código acha que existe algo no id 0 (ex: veículo/casa/timer 0) e age em cima dele.`,
        quando: "Logo que o servidor liga / o jogador entra pela primeira vez.",
        correcao: `Comece com a sentinela: {{new ${g.nome}[...] = { ${sentinela}, ... };}} (ou preencha no {{OnGameModeInit}}/{{OnPlayerConnect}}).`,
        evidencias: [ev(g.linha, "declarado sem valor inicial (= 0)"), ev(L, `testado contra ${sentinela}`)], teste: "Logo depois de ligar o servidor, imprima o valor e veja o que o if faz." });
    }
    return out;
  });

  /* ================= VERSÕES E CATÁLOGO DE NATIVES ================= */
  function versaoDoCodigo(ctx) {
    const inc = ctx.ast.includes.map(i => i.nome.replace(/\.(inc)$/i, "").split("/").pop().toLowerCase());
    if (inc.some(i => i === "open.mp" || /^omp_/.test(i))) return "omp";
    if (inc.includes("a_samp") || inc.includes("a_players")) return "a_samp";   // pode ser SA-MP OU o a_samp do open.mp
    return null;
  }
  regra("versao-native", "versões", "compilacao", ctx => {
    const out = [], cat = WCDEV.catalogo && WCDEV.catalogo.natives;
    if (!cat) return out;
    const sim = F().simbolos(ctx);
    const proprias = new Set([...sim.funcoes.keys(), ...sim.prototipos.keys(), ...sim.defines.keys()]);
    const ver = versaoDoCodigo(ctx);
    const vistos = new Set();
    for (const f of funcoes(ctx)) for (const c of P().chamadas(f.corpo)) {
      if (proprias.has(c.nome) || vistos.has(c.nome)) continue;
      const n = cat[c.nome];
      if (!n) continue;
      const soOmp = !/[SD]/.test(n.v), soDL = /D/.test(n.v), soSamp = !/O/.test(n.v);
      if (!soOmp && !soDL && !soSamp) continue;
      vistos.add(c.nome);
      if (soOmp) out.push({ nivel: "verificar", linha: c.linha, categoria: "compilacao", titulo: `{{${c.nome}}} só existe no **open.mp**`,
        porque: `{{${c.nome}}} está nos includes do open.mp ({{${n.i}}}), não nos do SA-MP.${ver === "a_samp" ? " O código inclui {{a_samp}}: se a pasta de includes for a do SA-MP 0.3.7, ela não existe." : ""}`,
        consequencia: "Com os includes do SA-MP: o compilador para com **error 017: undefined symbol**. Com os do open.mp: funciona.",
        quando: "Ao compilar.", correcao: "Se o servidor é open.mp, use {{#include <open.mp>}}. Se é SA-MP, troque por um jeito que exista no SA-MP (ou um include/plugin que traga essa função).",
        teste: "Compile: se der error 017 nessa linha, você está com os includes do SA-MP.", limites: "Depende da versão do seu servidor (SA-MP ou open.mp), que eu não consigo ver só pelo código. Me diga qual você usa." });
      else if (soDL) out.push({ nivel: "verificar", linha: c.linha, categoria: "compilacao", titulo: `{{${c.nome}}} é do **SA-MP 0.3.DL** (modelos customizados)`,
        porque: "Essa native existe no 0.3.DL e no open.mp, mas **não** no SA-MP 0.3.7.", consequencia: "Num servidor 0.3.7 o gamemode não carrega (\"function not found\"), mesmo compilando.",
        quando: "Ao ligar o servidor.", correcao: "Confirme que o servidor é 0.3.DL ou open.mp.", teste: "Ligue o servidor e veja o log.", limites: "Depende da versão do servidor." });
      else if (soSamp && ver === "omp") out.push({ nivel: "verificar", linha: c.linha, categoria: "compilacao", titulo: `{{${c.nome}}} não está nos includes do open.mp`,
        porque: "Ela existe nos includes do SA-MP, mas foi removida/renomeada no open.mp.", consequencia: "Com {{#include <open.mp>}} pode dar **error 017**.", quando: "Ao compilar.",
        correcao: "Veja a função equivalente no open.mp (ex: as funções de pool foram trocadas por foreach/loops até MAX_PLAYERS).", teste: "Compile com os includes do open.mp.", limites: "Depende dos includes que você usa." });
    }
    return out;
  });
  regra("argumentos-native", "versões", "logica", ctx => {
    const out = [], cat = WCDEV.catalogo && WCDEV.catalogo.natives;
    if (!cat) return out;
    const sim = F().simbolos(ctx);
    const ver = versaoDoCodigo(ctx);
    // o analisador antigo já confere estas (assinatura-errada); aqui vão todas as outras do catálogo
    const JA = /^(SendClientMessage|SendClientMessageToAll|SetPlayerHealth|SetPlayerArmour|GivePlayerMoney|ResetPlayerMoney|SetPlayerScore|GetPlayerScore|SetPlayerPos|GetPlayerPos|SetPlayerSkin|SetPlayerInterior|SetPlayerVirtualWorld|GivePlayerWeapon|ResetPlayerWeapons|Kick|Ban|BanEx|IsPlayerConnected|GetPlayerName|SetPlayerName|GameTextForPlayer|GameTextForAll|ShowPlayerDialog|PutPlayerInVehicle|CreateVehicle|AddStaticVehicle|SetPlayerCheckpoint|DisablePlayerCheckpoint|TogglePlayerControllable|SetPlayerColor|SetTimer|KillTimer|SetTimerEx|format|printf|print|strcmp|strval|sscanf)$/;
    for (const f of funcoes(ctx)) for (const c of P().chamadas(f.corpo)) {
      if (JA.test(c.nome) || sim.funcoes.has(c.nome)) continue;
      // native declarada no próprio projeto (include enviado): vale a declaração de lá
      const local = sim.prototipos.get(c.nome);
      let min, max, fonte;
      if (local && local.tipo === "native") { if (local.params.some(p => p.variadico)) continue; min = local.params.filter(p => p.padrao === null || p.padrao === undefined).length; max = local.params.length; fonte = `a declaração {{native ${c.nome}}} na linha ${local.linha}`; }
      else { const n = cat[c.nome]; if (!n || local) continue; [min, max] = ver === "omp" && n.ao ? n.ao : n.a; fonte = `o include oficial ({{${n.i}}}: {{${c.nome}(${n.p.split(",").join(", ")})}})`; if (n.ao && ver !== "omp" && c.args.length >= n.ao[0] && c.args.length <= n.ao[1]) continue; }
      if (max === 99 || c.args.some(a => a.k === "nomeado")) continue;
      const k = c.args.length;
      if (k >= min && k <= max) continue;
      out.push({ nivel: "erro", linha: c.linha, categoria: "logica", titulo: `{{${c.nome}}} com ${k} argumento(s); ela recebe ${min === max ? min : `de ${min} a ${max}`}`,
        porque: `Conferi com ${fonte}.`, consequencia: "O compilador só avisa (**warning 202**) e compila: os parâmetros chegam trocados ou com 0.", quando: "Toda vez que essa linha roda.",
        correcao: "Passe os argumentos na ordem da declaração.", compilador: "warning 202", evidencias: [ev(c.linha, "chamada")], teste: "Compile: warning 202 nesta linha." });
    }
    return out;
  });
  regra("processador-comandos", "versões", "integracao", ctx => {
    // includes de verdade + os que a análise de projeto colocou dentro do código ("// [wcdev] incluído: x.inc")
    const todos = ctx.ast.includes.map(i => ({ nome: i.nome, linha: i.linha }));
    ctx.linhas.forEach((l, i) => { const m = l.match(/\/\/ \[wcdev\] incluído: (\S+)/); if (m) todos.push({ nome: m[1], linha: i + 1 }); });
    const base = i => i.nome.split("/").pop().replace(/\.inc$/i, "");
    const z = todos.find(i => /^(zcmd|izcmd)$/i.test(base(i))), p = todos.find(i => /^pawn\.cmd$/i.test(base(i)));
    if (!z || !p) return [];
    const segundo = z.linha > p.linha ? z : p;
    return [{ nivel: "provavel", linha: segundo.linha, categoria: "integracao", titulo: "**zcmd** e **Pawn.CMD** incluídos juntos",
      porque: "Os dois definem o {{CMD:}} do jeito deles. O compilador só avisa (**warning 201**, macro redefinida) e fica valendo o que foi incluído por último.",
      consequencia: `Os comandos passam a ser do ${segundo === z ? "zcmd" : "Pawn.CMD"}: o outro sistema não recebe nada, e comandos podem parar de responder ("Unknown command").`,
      quando: "Ao compilar e ao usar comandos.", correcao: "Escolha um só (o Pawn.CMD é mais rápido) e tire o outro {{#include}}.", compilador: "warning 201",
      evidencias: [ev(z.linha, "zcmd"), ev(p.linha, "Pawn.CMD")], teste: "Compile e veja o warning 201; teste um comando." }];
  });

  /* ================= FUNÇÃO CHAMADA QUE NÃO EXISTE ================= */
  // includes de terceiros conhecidos: o que eles trazem (prefixos). Include desconhecido = não dá pra ter certeza
  const BIBLIOTECAS = {
    zcmd: /^$/, izcmd: /^$/, sscanf2: /^(sscanf|unformat|SSCANF_\w+|isnull)$/, sscanf: /^(sscanf|unformat|isnull)$/, DOF2: /^DOF2_\w+$/, dof2: /^DOF2_\w+$/, dini: /^(dini_\w+|udb_\w+)$/, dutils: /^\w+$/,
    foreach: /^(foreach|Iter_\w+|Itter_\w+)$/, a_mysql: /^(mysql_\w+|cache_\w+|orm_\w+)$/, streamer: /^(CreateDynamic\w*|DestroyDynamic\w*|IsValidDynamic\w*|Streamer_\w+|\w*Dynamic\w*)$/,
    "Pawn.CMD": /^(PC_\w+)$/, easyDialog: /^(Dialog_\w+)$/, bcrypt: /^bcrypt_\w+$/, samp_bcrypt: /^bcrypt_\w+$/, crashdetect: /^\w+$/,
  };
  regra("funcao-inexistente", "contexto", "compilacao", ctx => {
    const out = [], sim = F().simbolos(ctx), cat = (WCDEV.catalogo && WCDEV.catalogo.natives) || {};
    const conhecidas = new Set([...sim.funcoes.keys(), ...sim.prototipos.keys(), ...sim.defines.keys(), "sizeof", "tagof", "defined", "char", "exit", "sleep", "state", "assert"]);
    // macros com parâmetros (#define Foo(%0) ...) e prefixos (#define CMD:%0)
    for (const d of ctx.ast.defines) conhecidas.add(d.nome);
    const incs = [...ctx.ast.includes.map(i => i.nome.split("/").pop().replace(/\.inc$/i, ""))];
    const padrao = n => cat[n] || /^(a_samp|a_players|a_vehicles|a_objects|a_actor|a_http|a_npc|a_sampdb|core|float|string|file|time|console|datagram|args|open\.mp|omp_\w+)$/i.test(n);
    const desconhecidas = incs.filter(n => !padrao(n) && !BIBLIOTECAS[n]);
    const libs = incs.filter(n => BIBLIOTECAS[n]).map(n => BIBLIOTECAS[n]);
    const completo = (ctx.completo || (!!ctx.arquivoDe && !(ctx.faltando || []).length)) && !desconhecidas.length && !(ctx.faltando || []).length;
    const inativo = (ctx.pre && ctx.pre.textoInativo) || [];
    const vistos = new Set();
    for (const f of funcoes(ctx)) for (const c of P().chamadas(f.corpo)) {
      const n = c.nome;
      if (vistos.has(n) || conhecidas.has(n) || cat[n] || libs.some(re => re.test(n))) continue;
      vistos.add(n);
      const bloco = inativo.find(b => new RegExp(`\\b(?:public|stock|static)?\\s*(?:\\w+:)?${esc(n)}\\s*\\([^;]*\\)\\s*(\\{|$)`, "m").test(b.texto) || new RegExp(`\\bforward\\s+(?:\\w+:)?${esc(n)}\\s*\\(`).test(b.texto));
      if (bloco) {
        out.push({ nivel: "erro", linha: c.linha, categoria: "compilacao", titulo: `{{${n}}} só existe dentro de {{${bloco.motivo}}}, que **não vale** aqui`,
          porque: `A função está nas linhas ${bloco.ini}–${bloco.fim}, que só são compiladas quando {{${bloco.motivo.replace(/^#\w+\s*/, "")}}} é verdade. Nesta configuração não é, mas a chamada (linha ${c.linha}) fica fora do #if.`,
          consequencia: "O compilador para com **error 017: undefined symbol**.", quando: "Ao compilar nesta configuração.", compilador: "error 017",
          correcao: `Coloque a chamada dentro do mesmo {{#if}} (ou defina o símbolo, ou tire a função de dentro do #if).`, evidencias: [ev(bloco.ini, "definida só aqui (inativo)"), ev(c.linha, "chamada")], teste: "Compile: error 017 nesta linha." });
        continue;
      }
      if (/^[A-Z_][A-Z0-9_]*$/.test(n)) continue;   // TUDO_MAIUSCULO costuma ser macro de algum include
      if (!completo) continue;                       // trecho/projeto incompleto: a função pode estar no que eu não vi (sem evidência, não falo nada)
      out.push({ nivel: completo ? "provavel" : "verificar", linha: c.linha, categoria: "compilacao", titulo: `Não achei a função {{${n}}}`,
        porque: completo ? `Ela não está no código, nem nas natives do SA-MP/open.mp, nem nos includes que você usa.` : `Ela não está no que eu recebi. Pode estar num include ou arquivo que eu não vi${desconhecidas.length ? ` (ex: {{${desconhecidas[0]}}})` : ""}.`,
        consequencia: completo ? "O compilador para com **error 017: undefined symbol**." : "Se ela não existir em lugar nenhum, o compilador dá error 017.", quando: "Ao compilar.",
        correcao: `Confira o nome (maiúsculas contam) ou crie a função {{${n}}}.`, compilador: completo ? "error 017" : "", evidencias: [ev(c.linha, "chamada")], teste: "Compile e veja se aparece error 017." });
    }
    return out;
  });

  /* ================= TAG Float SÓ NA PRIMEIRA VARIÁVEL ================= */
  // new Float:x, y, z;  → só x é Float; y e z são inteiros
  regra("tag-so-na-primeira", "texto e tipos", "logica", ctx => {
    const out = [];
    for (const f of funcoes(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "decl" || n.vars.length < 2) return;
      const [a, ...resto] = n.vars;
      if (a.tag !== "Float") return;
      const semTag = resto.filter(v => !v.tag && !(v.dims || []).length);
      if (!semTag.length) return;
      // são usados como Float? (GetPlayerPos & cia., %f, contas com float)
      const nomes = new Set(semTag.map(v => v.nome));
      let uso = null;
      P().percorrer(f.corpo, m => {
        if (uso || m.k !== "chamada") return;
        if (/^(GetPlayerPos|GetVehiclePos|GetObjectPos|GetPlayerVelocity|GetVehicleVelocity|GetPlayerHealth|GetPlayerArmour|GetVehicleHealth|GetPlayerFacingAngle|GetVehicleZAngle|GetPlayerCameraPos|GetPlayerCameraFrontVector)$/.test(m.nome) && m.args.slice(1).some(x => nomes.has(nomeSimples(x)))) uso = m;
        if (/^(SetPlayerPos|SetVehiclePos|SetPlayerHealth|SetPlayerArmour|CreateVehicle|CreateObject|SetPlayerFacingAngle|IsPlayerInRangeOfPoint|SetPlayerCheckpoint)$/.test(m.nome) && m.args.some(x => nomes.has(nomeSimples(x)))) uso = uso || m;
      });
      if (!uso) return;
      const lista = semTag.map(v => v.nome).join(", ");
      out.push({ nivel: "provavel", linha: n.linha, categoria: "logica", titulo: `Só {{${a.nome}}} é Float: {{${lista}}} ficaram **inteiros**`,
        porque: `Em Pawn a tag vale pra **uma** variável: {{new Float:${a.nome}, ${lista};}} cria {{${lista}}} sem tag. Elas são usadas como Float em {{${uso.nome}}} (linha ${uso.linha}).`,
        consequencia: "Os valores saem errados (números gigantes ou 0) e o compilador avisa com **warning 213 (tag mismatch)**.", quando: "Sempre.",
        correcao: `Coloque a tag em todas: {{new Float:${a.nome}, ${semTag.map(v => "Float:" + v.nome).join(", ")};}}`, compilador: "warning 213",
        correcoes: [{ tipo: "trocar", linha: n.linha, de: new RegExp(`(new\\s+Float:${esc(a.nome)}\\s*,\\s*)${semTag.map(v => esc(v.nome)).join("\\s*,\\s*")}`), para: `$1${semTag.map(v => "Float:" + v.nome).join(", ")}` }], seguro: true,
        evidencias: [ev(n.linha, "declaração"), ev(uso.linha, "usado como Float")], teste: "Compile: warning 213. Imprima os valores com %f." });
    });
    return out;
  });

  /* ================= FORMAT: ESPECIFICADOR x TIPO DO VALOR ================= */
  regra("format-tipo", "texto e tipos", "logica", ctx => {
    const out = [], sim = F().simbolos(ctx);
    for (const f of funcoes(ctx)) {
      const locais = new Map();
      for (const p of f.params) locais.set(p.nome, { tag: p.tag, array: p.array });
      P().percorrer(f.corpo, n => { if (n.k === "decl") n.vars.forEach(v => locais.set(v.nome, { tag: v.tag, array: (v.dims || []).length > 0 })); });
      const infoDe = a => { a = nu(a); if (!a) return null; if (a.k === "num") return { tag: /\./.test(a.v) ? "Float" : "", array: false, lit: true }; if (a.k === "str") return { tag: "", array: true, lit: true }; const v = nomeSimples(a); if (v) { const l = locais.get(v) || sim.globais.get(v); return l ? { tag: l.tag || "", array: Array.isArray(l.dims) ? l.dims.length > 0 : !!l.array } : null; } if (a.k === "chamada" && /^(floatsqroot|floatabs|float|floatdiv|floatmul|GetPlayerDistanceFromPoint)$/.test(a.nome)) return { tag: "Float", array: false }; if (a.k === "chamada" && /^(GetPlayerMoney|GetPlayerScore|strval|strlen|random|GetPlayerSkin|GetPlayerVirtualWorld|GetPlayerInterior)$/.test(a.nome)) return { tag: "", array: false }; return null; };
      for (const c of P().chamadas(f.corpo)) {
        const off = c.nome === "format" ? 2 : /^(printf)$/.test(c.nome) ? 0 : -1;
        if (off < 0) continue;
        const fmt = nu(c.args[off]);
        if (!fmt || fmt.k !== "str") continue;
        F().especFormat(fmt.v).forEach((sp, i) => {
          const arg = c.args[off + 1 + i], info = arg && infoDe(arg);
          if (!info) return;
          let prob = null;
          if (sp === "s" && !info.array) prob = { msg: `{{%s}} espera um **texto**, mas {{${txt(ctx, arg)}}} é ${info.tag === "Float" ? "Float" : "um número"}`, cons: "O format lê o número como se fosse o endereço de um texto: sai lixo ou o servidor dá erro.", fix: info.tag === "Float" ? "%f" : "%d" };
          else if (/[di]/.test(sp) && info.array) prob = { msg: `{{%${sp}}} espera um número, mas {{${txt(ctx, arg)}}} é um **texto/array**`, cons: "Sai um número sem sentido (o endereço do texto).", fix: "%s" };
          else if (/[di]/.test(sp) && info.tag === "Float") prob = { msg: `{{%${sp}}} com {{${txt(ctx, arg)}}}, que é **Float**`, cons: "Sai um número gigante sem sentido (os bits do Float lidos como inteiro).", fix: "%.1f" };
          else if (sp === "f" && !info.array && info.tag !== "Float" && !info.lit) prob = { msg: `{{%f}} com {{${txt(ctx, arg)}}}, que é **inteiro**`, cons: "Sai 0.000000 (ou um valor minúsculo sem sentido).", fix: "%d" };
          if (!prob) return;
          out.push({ nivel: "provavel", linha: c.linha, categoria: "logica", titulo: prob.msg, porque: `O ${i + 1}º especificador do formato ({{%${sp}}}) recebe {{${txt(ctx, arg)}}}.`, consequencia: prob.cons, quando: "Sempre que essa linha roda.",
            correcao: `Use {{${prob.fix}}} nesse lugar.`, evidencias: [ev(c.linha, "format")], teste: "Mostre a mensagem e veja o valor." });
        });
      }
    }
    return out;
  });

  /* ================= TIMER RECRIADO SEM MATAR O ANTERIOR ================= */
  regra("timer-recriado", "sequência de eventos", "logica", ctx => {
    const out = [];
    const REPETE = /^(OnPlayerSpawn|OnPlayerStateChange|OnPlayerEnterVehicle|OnPlayerDeath|OnPlayerEnterCheckpoint|OnPlayerKeyStateChange|OnDialogResponse|OnPlayerText|OnPlayerCommandText|OnPlayerPickUpPickup)$/;
    for (const f of funcoes(ctx)) {
      if (!REPETE.test(f.nome) && f.tipo !== "comando") continue;
      const corpo = txt(ctx, f.corpo);
      P().percorrer(f.corpo, n => {
        if (n.k !== "atrib" || n.op !== "=") return;
        const v = nu(n.valor);
        if (!v || v.k !== "chamada" || !/^SetTimer(Ex)?$/.test(v.nome) || !v.args[2]) return;
        if (F().valorConst(v.args[2], F().simbolos(ctx)) !== 1 && txt(ctx, v.args[2]) !== "true") return;
        const alvo = txt(ctx, n.alvo);
        if (new RegExp(`KillTimer\\s*\\(\\s*${esc(alvo)}\\s*\\)`).test(corpo)) return;   // mata o anterior antes de criar
        // só cria se ainda não existe? (if (Timer[p] == 0) / flag)
        if (new RegExp(`if\\s*\\([^)]*${esc(alvo)}`).test(corpo)) return;
        out.push({ nivel: "provavel", linha: n.linha, categoria: "logica", titulo: `Cada ${f.tipo === "comando" ? `/${f.nome}` : f.nome.replace(/^On/, "")} cria **outro** timer repetido em {{${alvo}}}`,
          porque: `O {{${v.nome}}} repete pra sempre e é criado de novo toda vez que ${f.tipo === "comando" ? "o comando é usado" : "o callback roda"}, sem {{KillTimer(${alvo})}} antes. A variável guarda só o último: os anteriores continuam rodando e ninguém consegue parar.`,
          consequencia: "Depois de N vezes, a função do timer roda N vezes por intervalo (ex: N salários por minuto) e continua mesmo depois de sair.",
          quando: `A partir da segunda vez que ${f.tipo === "comando" ? "o comando é usado" : "o callback roda"} (ex: morrer e renascer).`,
          correcao: `Antes de criar: {{KillTimer(${alvo});}} (ou crie só uma vez, no login).`,
          correcoes: [{ tipo: "inserirAntes", linha: n.linha, linhas: [((ctx.linhas[n.linha - 1] || "").match(/^\s*/)[0]) + `KillTimer(${alvo});`] }], seguro: true,
          evidencias: [ev(n.linha, "timer criado de novo")], teste: "Coloque um print no timer, morra 3 vezes e conte quantas vezes ele imprime por intervalo." });
      });
    }
    return out;
  });

  /* ================= "NÃO ACHOU" = -1 USADO COMO ÍNDICE ================= */
  regra("indice-nao-encontrado", "fluxo", "logica", ctx => {
    const out = [];
    for (const f of funcoes(ctx)) P().percorrer(f.corpo, n => {
      if (n.k !== "decl") return;
      for (const v of n.vars) {
        const i = v.init && nu(v.init);
        if (!(i && ((i.k === "un" && i.op === "-" && nu(i.e).k === "num" && nu(i.e).valor === 1) || (i.k === "id" && /^INVALID_\w+$/.test(i.nome))))) continue;
        const nome = v.nome;
        let atribuiNoLaco = false, conferido = false, uso = null;
        P().percorrer(f.corpo, m => {
          if ((m.k === "for" || m.k === "while") && m.corpo) P().percorrer(m.corpo, x => { if (x.k === "atrib" && nomeSimples(x.alvo) === nome) atribuiNoLaco = true; });
          if ((m.k === "if" || m.k === "while") && m.cond && new RegExp(`\\b${esc(nome)}\\b`).test(txt(ctx, m.cond)) && m.linha > v.linha) conferido = conferido || !uso;
          if (!uso && m.k === "indice" && nomeSimples(m.i) === nome && m.linha > v.linha) uso = m;
        });
        if (!atribuiNoLaco || conferido || !uso) continue;
        out.push({ nivel: "provavel", linha: uso.linha, categoria: "logica", titulo: `{{${nome}}} pode continuar {{${txt(ctx, v.init)}}} e é usado como posição de {{${txt(ctx, uso.base)}}}`,
          porque: `{{${nome}}} começa em {{${txt(ctx, v.init)}}} ("não achei") e só muda dentro do laço. Se o laço não achar nada, ele chega na linha ${uso.linha} ainda valendo isso, sem um if conferindo.`,
          consequencia: "Índice negativo/inválido: **array index out of bounds** (a função para) — ex: inventário cheio.", quando: "Quando o laço não encontra nada.",
          correcao: `Depois do laço: {{if (${nome} == ${txt(ctx, v.init)}) return SendClientMessage(playerid, -1, "Nao tem espaco.");}}`,
          evidencias: [ev(v.linha, `começa em ${txt(ctx, v.init)}`), ev(uso.linha, "usado como índice")], teste: "Teste com o inventário/lista cheio." });
      }
    });
    return out;
  });

  /* ================= TEXTDRAW CRIADO SEM PARAR ================= */
  regra("textdraw-vazando", "desempenho", "desempenho", ctx => {
    const out = [], sim = F().simbolos(ctx);
    const rapidos = new Set(["OnPlayerUpdate"]);
    for (const f of funcoes(ctx)) for (const c of P().chamadas(f.corpo)) if (/^SetTimer(Ex)?$/.test(c.nome) && c.args[0] && nu(c.args[0]).k === "str" && F().valorConst(c.args[2], sim) === 1) rapidos.add(nu(c.args[0]).v);
    for (const f of funcoes(ctx).filter(f => rapidos.has(f.nome))) {
      const ch = P().chamadas(f.corpo);
      const cria = ch.find(c => /^(CreatePlayerTextDraw|TextDrawCreate|CreatePlayer3DTextLabel|Create3DTextLabel|CreatePickup|CreateObject|CreatePlayerObject|CreateVehicle)$/.test(c.nome));
      if (!cria) continue;
      const tipo = cria.nome.replace(/^Create(Player)?|Create$/g, "").replace(/^TextDrawCreate$/, "TextDraw");
      if (ch.some(c => /^(PlayerTextDrawDestroy|TextDrawDestroy|DeletePlayer3DTextLabel|Delete3DTextLabel|DestroyPickup|DestroyObject|DestroyPlayerObject|DestroyVehicle)$/.test(c.nome))) continue;
      out.push({ nivel: "provavel", linha: cria.linha, categoria: "desempenho", titulo: `{{${cria.nome}}} cria um novo a cada vez que {{${f.nome}}} roda, sem destruir o anterior`,
        porque: `{{${f.nome}}} roda ${f.nome === "OnPlayerUpdate" ? "várias vezes por segundo" : "repetidamente (timer)"} e cada vez cria mais um, sem {{Destroy}}.`,
        consequencia: `Eles se acumulam até o limite (ex: 256 PlayerTextDraws por jogador). Depois disso a criação falha e a tela para de atualizar.`, quando: "Depois de algum tempo com o servidor ligado.",
        correcao: `Crie uma vez só (no login/spawn) e no timer só atualize (ex: {{PlayerTextDrawSetString}}).`, evidencias: [ev(cria.linha, "cria de novo")], teste: "Deixe o servidor rodando alguns minutos e veja o textdraw sumir/parar." });
      void tipo;
    }
    return out;
  });

  return { regras: R, permissaoNaCondicao, analisarPermissao, persistencia, intencaoDaMensagem };
})();

WCDEV.analiseIntencao = AnaliseIntencao;
// as regras entram na lista do analisador; a regra antiga de permissão (por palavra) sai quando a árvore existe
if (WCDEV.analisador) WCDEV.analisador.regras.pawn.push(...AnaliseIntencao.regras);
