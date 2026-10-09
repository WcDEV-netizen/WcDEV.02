/* =========================================================
   WC DEV — REVISOR DE CÓDIGO
   Lê o código que o aluno colou, descobre a linguagem e
   aponta os erros mais comuns (sem executar nada).
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Revisor = (() => {

  /* ---------- Listas de nomes conhecidos ---------- */
  const PAWN_EXTRAS = `SetPlayerCameraLookAt GetVehicleParamsEx PlayerSpectatePlayer PlayerSpectateVehicle TextDrawSetOutline TextDrawSetShadow
    TextDrawBoxColor TextDrawTextSize TextDrawAlignment TextDrawBackgroundColor TextDrawSetProportional TextDrawShowForAll TextDrawHideForAll
    TextDrawDestroy SelectTextDraw CancelSelectTextDraw PlayerTextDrawShow PlayerTextDrawHide PlayerTextDrawSetString PlayerTextDrawLetterSize
    PlayerTextDrawFont PlayerTextDrawColor PlayerTextDrawDestroy GangZoneShowForAll GangZoneHideForAll GangZoneDestroy GangZoneStopFlashForAll
    StopAudioStreamForPlayer strpack strunpack mysql_connect mysql_errno mysql_close mysql_query cache_num_rows cache_get_value_name
    cache_get_value_name_int cache_get_value_name_float cache_get_value_int cache_insert_id sscanf isnull GetPlayerWeaponData
    DisablePlayerRaceCheckpoint GetVehicleZAngle SetVehicleParamsForPlayer GetPlayerKeys SetPlayerArmedWeapon GetPlayerAmmo IsPlayerNPC
    GetPlayerTeam SetPlayerFightingStyle CreateDynamicObject CreateDynamicPickup CreateDynamic3DTextLabel CreateDynamicCP CreateDynamicMapIcon
    DestroyDynamicObject DestroyDynamicPickup MoveDynamicObject Streamer_Update DOF2_CreateFile DOF2_SetInt DOF2_GetInt DOF2_SetString
    DOF2_GetString DOF2_SetFloat DOF2_GetFloat DOF2_SetBool DOF2_GetBool DOF2_FileExists DOF2_SaveFile DOF2_Exit DOF2_RemoveFile
    INI_Open INI_Close INI_WriteInt INI_WriteString INI_WriteFloat INI_ParseFile dini_Create dini_Exists dini_Set dini_Get dini_IntSet dini_Int
    bcrypt_hash bcrypt_verify bcrypt_get_hash Dialog_Show GetVehicleColor SetPlayerShopName GetPlayerCameraPos GetPlayerVelocity
    GetPlayerSpecialAction GetPlayerAnimationIndex GetAnimationName SetVehicleAngularVelocity GetVehicleDistanceFromPoint
    GetVehicleVirtualWorld IsPlayerInVehicle IsPlayerStreamedIn SetPlayerCheckpoint IsPlayerInCheckpoint DestroyPlayerObject
    CreatePlayerObject MovePlayerObject AttachObjectToVehicle AttachObjectToPlayer GetObjectPos SetObjectRot GetPlayerObjectPos
    TogglePlayerClock SetPlayerVirtualWorld GetPlayerSurfingVehicleID GetPlayerTargetPlayer HideMenuForPlayer ShowMenuForPlayer
    CreateMenu AddMenuItem SetDeathDropAmount Delete3DTextLabel DeletePlayer3DTextLabel UpdatePlayer3DTextLabelText
    Attach3DTextLabelToVehicle GetServerTickRate GetNetworkStats NetStats_GetConnectedTime GetConsoleVarAsInt GetConsoleVarAsString
    SetSVarInt GetSVarInt SetPVarInt GetPVarInt SetPVarString GetPVarString DeletePVar funcidx numargs getarg setarg heapspace
    swapchars floatmul floatdiv floatadd floatsub floatcmp floatlog floatsin floatcos floattan asin acos atan atan2 tickcount`.split(/\s+/);

  const PY_BUILTINS = `print input len range int float str bool list dict set tuple type abs round max min sum sorted reversed enumerate zip
    map filter any all open chr ord bin hex oct pow divmod help dir id hash isinstance issubclass getattr setattr hasattr delattr
    vars eval exec repr format iter next slice super object globals locals callable frozenset bytes bytearray complex
    breakpoint staticmethod classmethod property memoryview exit quit`.split(/\s+/);

  const HTML_TAGS = `html head body title meta link script style noscript base header nav main section article aside footer div span
    address details summary dialog template h1 h2 h3 h4 h5 h6 p br hr strong b em i u s del ins mark small sub sup code pre kbd
    blockquote q cite abbr time data dfn var samp bdi bdo wbr ul ol li dl dt dd table tr td th thead tbody tfoot caption colgroup col
    a img picture figure figcaption video audio source track iframe canvas svg map area object embed form input label button
    textarea select option optgroup datalist fieldset legend output progress meter circle rect line path polygon g text center
    font marquee menu search slot`.split(/\s+/);

  const HTML_VAZIAS = new Set("area base br col embed hr img input link meta source track wbr param".split(" "));

  const CSS_PROPS = `color background background-color background-image background-size background-position background-repeat
    background-attachment background-clip opacity width height max-width min-width max-height min-height margin margin-top
    margin-right margin-bottom margin-left padding padding-top padding-right padding-bottom padding-left border border-top
    border-right border-bottom border-left border-width border-style border-color border-radius border-collapse border-spacing
    border-image box-shadow box-sizing outline outline-offset overflow overflow-x overflow-y display visibility position top
    right bottom left z-index float clear flex flex-direction flex-wrap flex-flow flex-grow flex-shrink flex-basis
    justify-content justify-items justify-self align-items align-content align-self place-items place-content place-self gap
    row-gap column-gap order grid grid-template grid-template-columns grid-template-rows grid-template-areas grid-area
    grid-column grid-row grid-auto-flow grid-auto-rows grid-auto-columns grid-column-start grid-column-end columns column-count
    font font-family font-size font-weight font-style font-variant line-height letter-spacing word-spacing text-align
    text-decoration text-transform text-shadow text-indent text-overflow text-wrap white-space word-break overflow-wrap
    vertical-align transition transition-duration transition-property transition-delay transition-timing-function transform
    transform-origin animation animation-name animation-duration animation-delay animation-iteration-count
    animation-timing-function animation-fill-mode animation-direction animation-play-state cursor pointer-events user-select
    scroll-behavior scroll-snap-type scroll-snap-align clip-path filter backdrop-filter mix-blend-mode list-style
    list-style-type list-style-position content counter-reset counter-increment appearance resize inset aspect-ratio
    object-fit object-position will-change perspective backface-visibility accent-color caret-color quotes table-layout
    container-type container-name src font-display`.split(/\s+/);

  /* ---------- Ferramentas ---------- */
  function dist(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
      {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        // letras trocadas de lugar ("pirnt" -> "print") contam como 1 erro só
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    return d[a.length][b.length];
  }

  function maisParecido(nome, lista) {
    let melhor = null, menor = 9;
    for (const x of lista) {
      if (x === nome) return null;            // existe: não é erro
      const d = dist(nome, x);
      if (d < menor) { menor = d; melhor = x; }
    }
    const limite = nome.length > 6 ? 2 : 1;
    return menor > 0 && menor <= limite ? melhor : null;
  }

  // Tira textos entre aspas e comentários, mantendo as linhas no lugar
  function limpar(codigo, lang) {
    let s = codigo;
    if (lang === "pawn" || lang === "css") s = s.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, " "));
    if (lang === "html") s = s.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, " "));
    s = s.replace(/"(?:[^"\\\n]|\\.)*"/g, m => '"' + " ".repeat(Math.max(0, m.length - 2)) + '"');
    if (lang !== "html") s = s.replace(/'(?:[^'\\\n]|\\.)*'/g, m => "'" + " ".repeat(Math.max(0, m.length - 2)) + "'");
    if (lang === "pawn") s = s.replace(/\/\/[^\n]*/g, m => " ".repeat(m.length));
    if (lang === "python") s = s.replace(/#[^\n]*/g, m => " ".repeat(m.length));
    return s;
  }

  function conferirPares(limpo, problemas) {
    const pares = { ")": "(", "]": "[", "}": "{" };
    const nomes = { "(": "parêntese", "[": "colchete", "{": "chave" };
    const pilha = [];
    const linhas = limpo.split("\n");
    linhas.forEach((l, i) => {
      for (const c of l) {
        if ("([{".includes(c)) pilha.push({ c, linha: i + 1 });
        else if (")]}".includes(c)) {
          const topo = pilha.pop();
          if (!topo) problemas.push({ linha: i + 1, tipo: "erro", msg: `Tem um **${c}** fechando sem ter aberto (${nomes[pares[c]]} sobrando).` });
          else if (topo.c !== pares[c]) problemas.push({ linha: i + 1, tipo: "erro", msg: `Abriu **${topo.c}** na linha ${topo.linha} mas fechou com **${c}**.` });
        }
      }
    });
    pilha.slice(0, 3).forEach(p => problemas.push({ linha: p.linha, tipo: "erro", msg: `Abriu ${nomes[p.c]} **${p.c}** e não fechou.` }));
  }

  /* ---------- Descobrir a linguagem ---------- */
  function detectar(codigo) {
    const c = codigo;
    const pts = { pawn: 0, python: 0, html: 0, css: 0 };
    if (/#include\s*[<"]/.test(c)) pts.pawn += 5;
    if (/\bpublic\s+On[A-Z]\w*\s*\(/.test(c)) pts.pawn += 6;
    if (/\b(SendClientMessage|GivePlayer\w+|SetPlayer\w+|GetPlayer\w+|ShowPlayerDialog|CMD\s*:|playerid)\b/.test(c)) pts.pawn += 5;
    if (/\bnew\s+(Float:|bool:)?\w+/.test(c)) pts.pawn += 3;
    if (/;\s*$/m.test(c) && /\b(new|return)\b/.test(c)) pts.pawn += 2;
    if (/\b(stock|forward)\s+\w+/.test(c)) pts.pawn += 3;
    if (/^\s*(def|class)\s+\w+.*:\s*$/m.test(c)) pts.python += 5;
    if (/\bprint\s*\(/.test(c) && !/;\s*$/m.test(c)) pts.python += 3;
    if (/^\s*(if|elif|for|while|else|try|except)\b.*:\s*$/m.test(c)) pts.python += 4;
    if (/\b(import\s+\w+|from\s+\w+\s+import|input\s*\(|elif\b|range\s*\()/.test(c)) pts.python += 3;
    if (/<\/?[a-z][a-z0-9]*[\s>]/i.test(c)) pts.html += 4;
    if (/<!DOCTYPE|<html|<body|<div|<p>|<h[1-6]/i.test(c)) pts.html += 4;
    if (/[.#]?[a-z][\w-]*\s*\{[^}]*[a-z-]+\s*:\s*[^;]+;?/i.test(c) && !/\bnew\b|playerid/.test(c)) pts.css += 5;
    if (/@media|:hover|px;|em;|rem;|#[0-9a-f]{3,6};/i.test(c)) pts.css += 3;
    if (/<style/i.test(c)) { pts.html += 2; }
    const melhor = Object.entries(pts).sort((a, b) => b[1] - a[1])[0];
    return melhor[1] >= 4 ? melhor[0] : null;
  }

  // Diz se a mensagem parece um código colado (e não uma pergunta)
  function pareceCodigo(texto) {
    const linhas = texto.split("\n").filter(l => l.trim());
    const sinais = (texto.match(/[;{}=()<>:]/g) || []).length;
    if (linhas.length >= 2 && sinais >= 4 && detectar(texto)) return true;
    if (linhas.length === 1 && /;\s*$|\)\s*\{\s*$|^\s*<[a-z][^>]*>.*<\/[a-z0-9]+>\s*$/i.test(texto) && detectar(texto)) return true;
    return false;
  }

  /* ---------- Análise por linguagem ---------- */
  function analisarPawn(codigo) {
    const p = [];
    const limpo = limpar(codigo, "pawn");
    const linhas = limpo.split("\n");
    const original = codigo.split("\n");
    conferirPares(limpo, p);

    const KEYW = /^(if|else|for|while|do|switch|case|default|public|stock|static|native|enum|CMD|cmd|COMMAND|Dialog|#|main|alias|foreach|forward)\b/;
    const proxima = i => { for (let j = i + 1; j < linhas.length; j++) if (linhas[j].trim()) return linhas[j].trim(); return ""; };

    linhas.forEach((bruta, i) => {
      const l = bruta.trim();
      if (!l) return;
      const n = i + 1;
      const prox = proxima(i);

      // ponto e vírgula faltando (membro de enum ou item de array antes do "}" não precisa)
      const fimDeLista = prox.startsWith("}") && !l.includes("(") && !/^(return|new|break|continue)\b/.test(l) && !/\s=\s/.test(l);
      if (!fimDeLista && /[\w)\]"'']$/.test(l) && !KEYW.test(l) && !/^[{}]/.test(l) && !prox.startsWith("{") &&
          !/(&&|\|\||[+\-*/%,=(<>!?:]|\belse)$/.test(l) && !/^(\|\||&&|\+|\?|:)/.test(prox) && !/^\w+:\s*$/.test(l)) {
        // linha que é o cabeçalho de função sem stock/public: Nome(...)  seguido de {
        p.push({ linha: n, tipo: "erro", msg: "Parece que faltou o **;** no fim da linha (error 001: expected token)." });
      }
      if (/^forward\s+[^;]+\)\s*$/.test(l)) p.push({ linha: n, tipo: "erro", msg: "O **forward** precisa de **;** no final: {{forward Nome();}}" });

      // comparar texto com ==
      if (/==\s*"|"\s*==|!=\s*"/.test(original[i])) p.push({ linha: n, tipo: "erro", msg: "Em Pawn não dá pra comparar texto com **==**. Use {{strcmp}}: {{if (!strcmp(texto, \"oi\"))}} (error 033)." });

      // = no lugar de == dentro do if
      if (/\b(if|while)\s*\((?:[^()=!<>]|\([^()]*\))*[^=!<>]=[^=](?:[^()]|\([^()]*\))*\)/.test(l))
        p.push({ linha: n, tipo: "aviso", msg: "Tem **=** dentro do if/while. Pra comparar use **==** (warning 211)." });

      // Float sem tag
      const semTag = l.match(/\bnew\s+([a-zA-Z_]\w*)\s*=\s*-?\d+\.\d+/);
      if (semTag) p.push({ linha: n, tipo: "aviso", msg: `A variável **${semTag[1]}** guarda número com vírgula: crie com {{new Float:${semTag[1]}}} (senão dá warning 213: tag mismatch).` });

      // vida/colete com inteiro
      if (/\b(SetPlayerHealth|SetPlayerArmour|SetVehicleHealth)\s*\([^,]+,\s*\d+\s*\)/.test(l))
        p.push({ linha: n, tipo: "aviso", msg: "Vida e colete são **Float**: escreva com ponto, tipo **100.0** (warning 213)." });

      // SendClientMessage sem cor
      const scm = l.match(/\bSendClientMessage\s*\(([^;]*)\)\s*;/);
      if (scm && scm[1].split(",").length === 2) p.push({ linha: n, tipo: "erro", msg: "O {{SendClientMessage}} precisa de 3 coisas: {{(playerid, cor, \"texto\")}}. Faltou a **cor** (use -1 pra branco)." });

      // strcmp sem ! nem comparação
      if (/\bif\s*\(\s*strcmp\s*\(/.test(l) && !/strcmp\s*\([^)]*\)\s*(==|!=)/.test(l))
        p.push({ linha: n, tipo: "aviso", msg: "Cuidado: o {{strcmp}} devolve **0 quando os textos são iguais**. Pra testar igualdade use {{if (!strcmp(a, b))}}." });

      // Kick logo depois de mensagem
      if (/\b(Kick|Ban|BanEx)\s*\(/.test(l) && i > 0 && /SendClientMessage/.test(linhas[i - 1] || ""))
        p.push({ linha: n, tipo: "dica", msg: "Kick/Ban logo depois da mensagem faz ela **não chegar**. Use um timer de ~500ms antes de kickar." });
    });

    // public sem forward
    const forwards = new Set([...codigo.matchAll(/forward\s+(?:\w+:)?(\w+)\s*\(/g)].map(m => m[1]));
    [...codigo.matchAll(/^\s*public\s+(?:\w+:)?(\w+)\s*\(/gm)].forEach(m => {
      const nome = m[1];
      if (!/^On[A-Z]/.test(nome) && !forwards.has(nome)) {
        const linha = codigo.slice(0, m.index).split("\n").length;
        p.push({ linha, tipo: "aviso", msg: `A public **${nome}** precisa de {{forward ${nome}(...);}} antes dela (warning 235).` });
      }
    });

    // callbacks com parâmetros errados
    const ASSINATURAS = {
      OnGameModeInit: 0, OnGameModeExit: 0, OnFilterScriptInit: 0, OnFilterScriptExit: 0, OnPlayerConnect: 1, OnPlayerDisconnect: 2,
      OnPlayerSpawn: 1, OnPlayerDeath: 3, OnPlayerText: 2, OnPlayerCommandText: 2, OnPlayerRequestClass: 2, OnPlayerRequestSpawn: 1,
      OnPlayerEnterVehicle: 3, OnPlayerExitVehicle: 2, OnPlayerStateChange: 3, OnPlayerKeyStateChange: 3, OnDialogResponse: 5,
      OnPlayerTakeDamage: 5, OnPlayerGiveDamage: 5, OnPlayerPickUpPickup: 2, OnPlayerEnterCheckpoint: 1, OnPlayerLeaveCheckpoint: 1,
      OnVehicleDeath: 2, OnVehicleSpawn: 1, OnPlayerUpdate: 1, OnPlayerClickMap: 4, OnPlayerClickPlayer: 3, OnPlayerInteriorChange: 3,
      OnRconLoginAttempt: 3, OnPlayerWeaponShot: 7, OnPlayerClickTextDraw: 2, OnPlayerEnterRaceCheckpoint: 1,
    };
    [...codigo.matchAll(/public\s+(On\w+)\s*\(([^)]*)\)/g)].forEach(m => {
      const esperado = ASSINATURAS[m[1]];
      if (esperado === undefined) {
        const quis = maisParecido(m[1], Object.keys(ASSINATURAS));
        if (quis) p.push({ linha: codigo.slice(0, m.index).split("\n").length, tipo: "erro", msg: `**${m[1]}** não é um callback. Você quis dizer **${quis}**?` });
        return;
      }
      const qtd = m[2].trim() ? m[2].split(",").length : 0;
      if (qtd !== esperado) {
        const ref = (WCDEV.temas || []).find(t => t.lang === "pawn" && t.titulo === m[1]);
        p.push({ linha: codigo.slice(0, m.index).split("\n").length, tipo: "erro",
          msg: `O **${m[1]}** tem ${esperado} parâmetro(s), mas você escreveu ${qtd} (error 025). Digite **${m[1]}** pra ver o cabeçalho certo.` + (ref ? "" : "") });
      }
    });

    // gamemode sem main / sem include
    if (/public\s+OnGameModeInit/.test(codigo) && !/\bmain\s*\(/.test(codigo))
      p.push({ linha: 1, tipo: "aviso", msg: "Todo **gamemode** precisa de {{main() { }}} (filterscripts não precisam)." });
    if (/#include/.test(codigo) && !/#include\s*[<"](a_samp|open\.mp)/.test(codigo) && /\b(SendClientMessage|SetPlayer\w+|GetPlayer\w+)\b/.test(codigo))
      p.push({ linha: 1, tipo: "erro", msg: "Faltou {{#include <a_samp>}} (ou {{#include <open.mp>}}) no começo do arquivo." });

    // nomes de funções digitados errado
    const definidas = new Set([
      ...[...codigo.matchAll(/(?:stock|public|forward|native)\s+(?:\w+:)?(\w+)\s*\(/g)].map(m => m[1]),
      ...[...codigo.matchAll(/#define\s+(\w+)/g)].map(m => m[1]),
      ...[...codigo.matchAll(/^(\w+)\s*\([^;]*\)\s*$/gm)].map(m => m[1]),
    ]);
    const conhecidas = conhecidasDe("pawn").concat(PAWN_EXTRAS);
    const vistos = new Set();
    [...limpo.matchAll(/\b([A-Za-z_]\w{3,})\s*\(/g)].forEach(m => {
      const nome = m[1];
      if (vistos.has(nome) || definidas.has(nome) || /^(if|for|while|switch|return|sizeof|main|CMD|forward|public|stock)$/.test(nome)) return;
      vistos.add(nome);
      const quis = maisParecido(nome, conhecidas);
      if (quis) p.push({ linha: limpo.slice(0, m.index).split("\n").length, tipo: "erro", msg: `**${nome}** não existe. Você quis dizer **${quis}**? (error 017: undefined symbol)` });
    });

    return p;
  }

  function analisarPython(codigo) {
    const p = [];
    const limpo = limpar(codigo, "python");
    const linhas = limpo.split("\n");
    conferirPares(limpo, p);
    let indentAnterior = 0, pedeBloco = false, linhaBloco = 0;
    const usaTab = /^\t/m.test(codigo), usaEspaco = /^ +\S/m.test(codigo);
    if (usaTab && usaEspaco) p.push({ linha: 1, tipo: "erro", msg: "Você misturou **TAB e espaços** na indentação (TabError). Use só espaços." });

    linhas.forEach((bruta, i) => {
      if (!bruta.trim()) return;
      const n = i + 1;
      const l = bruta.trim();
      const indent = bruta.match(/^[ \t]*/)[0].replace(/\t/g, "    ").length;

      if (pedeBloco && indent <= indentAnterior)
        p.push({ linha: n, tipo: "erro", msg: `Depois da linha ${linhaBloco} (que termina com **:**) esta linha precisa de **4 espaços a mais** na frente (IndentationError).` });
      if (!pedeBloco && indent > indentAnterior && i > 0)
        p.push({ linha: n, tipo: "erro", msg: "Esta linha tem **espaço a mais** no começo sem estar dentro de um bloco (IndentationError: unexpected indent)." });

      if (/^(if|elif|for|while|def|class|try|except|finally|with|else)\b/.test(l) && !/:\s*$/.test(l) && !/\\$/.test(l) && !/^(else\s+if)/.test(l))
        p.push({ linha: n, tipo: "erro", msg: `Faltou os **dois pontos (:)** no final do **${l.split(/[\s(:]/)[0]}** (SyntaxError).` });
      if (/^else\s+if\b/.test(l)) p.push({ linha: n, tipo: "erro", msg: "Em Python não existe **else if**: use **elif**." });
      if (/^print\s+[^(=\s]/.test(l)) p.push({ linha: n, tipo: "erro", msg: "No Python 3 o print precisa de parênteses: {{print(\"texto\")}}." });
      if (/^(if|elif|while)\b[^=!<>]*[^=!<>]=[^=]/.test(l) && !/:=/.test(l)) p.push({ linha: n, tipo: "erro", msg: "Dentro do if/while, pra comparar use **==** (um **=** sozinho é pra guardar valor)." });
      const palavra = l.match(/\b(true|false|null|none)\b/);
      if (palavra) {
        const certo = { true: "True", false: "False", null: "None", none: "None" }[palavra[1]];
        p.push({ linha: n, tipo: "erro", msg: `Em Python é **${certo}**, com a primeira letra maiúscula (NameError).` });
      }
      if (/\w(\+\+|--)\s*$/.test(l)) p.push({ linha: n, tipo: "erro", msg: "Python não tem **++** ou **--**. Use {{x += 1}}." });
      if (/;\s*$/.test(l)) p.push({ linha: n, tipo: "dica", msg: "Não precisa de **;** no final da linha em Python (não é erro, mas não é o estilo do Python)." });
      if (/\b(function|var|let|const)\s+\w/.test(l)) p.push({ linha: n, tipo: "erro", msg: "Isso é JavaScript! Em Python: funções com {{def}} e variáveis sem palavra na frente ({{x = 5}})." });

      // linha de bloco (mesmo se esqueceu o ":") espera indentação na próxima
      pedeBloco = /:\s*$/.test(l) || /^(if|elif|for|while|def|class|try|except|finally|with|else)\b/.test(l);
      if (pedeBloco) linhaBloco = n;
      indentAnterior = indent;
    });
    if (pedeBloco) p.push({ linha: linhaBloco, tipo: "erro", msg: "A última linha termina com **:** mas não tem nada dentro do bloco. Use {{pass}} se quiser deixar vazio." });

    // input usado em conta
    const vars = [...codigo.matchAll(/^\s*(\w+)\s*=\s*input\s*\(/gm)].map(m => m[1]);
    vars.forEach(v => {
      const re = new RegExp(`\\b${v}\\s*[-*/]\\s*\\w|\\w\\s*[-*/]\\s*${v}\\b|\\b${v}\\s*[<>]=?\\s*\\d|\\b${v}\\s*\\+\\s*\\d`);
      if (re.test(limpo)) p.push({ linha: 1, tipo: "erro", msg: `A variável **${v}** vem do {{input()}}, que é **texto**. Pra fazer conta converta: {{${v} = int(input(...))}}.` });
    });

    // nomes errados
    const definidas = new Set([...codigo.matchAll(/(?:def|class)\s+(\w+)/g)].map(m => m[1]));
    const conhecidas = conhecidasDe("python").concat(PY_BUILTINS);
    const vistos = new Set();
    [...limpo.matchAll(/(?<![.\w])([a-z_]\w{2,})\s*\(/g)].forEach(m => {
      const nome = m[1];
      if (vistos.has(nome) || definidas.has(nome)) return;
      vistos.add(nome);
      const quis = maisParecido(nome, conhecidas);
      if (quis) p.push({ linha: limpo.slice(0, m.index).split("\n").length, tipo: "erro", msg: `**${nome}** não existe. Você quis dizer **${quis}**? (NameError)` });
    });
    return p;
  }

  function analisarHtml(codigo) {
    const p = [];
    const pilha = [];
    const semComentario = codigo.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, " "))
      .replace(/(<(script|style)[^>]*>)([\s\S]*?)(<\/\2>)/gi, (_, a, b, c, d) => a + c.replace(/[^\n]/g, " ") + d);
    const re = /<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
    let m;
    while ((m = re.exec(semComentario))) {
      const tag = m[1].toLowerCase();
      const linha = semComentario.slice(0, m.index).split("\n").length;
      const fechando = m[0].startsWith("</");
      if (!HTML_TAGS.includes(tag) && !tag.includes("-")) {
        const quis = maisParecido(tag, HTML_TAGS);
        p.push({ linha, tipo: "erro", msg: `A tag **<${tag}>** não existe.` + (quis ? ` Você quis dizer **<${quis}>**?` : "") });
        continue;
      }
      if (HTML_VAZIAS.has(tag)) {
        if (fechando) p.push({ linha, tipo: "aviso", msg: `A tag **<${tag}>** não tem fechamento, pode apagar o **</${tag}>**.` });
        if (tag === "img" && !/\balt\s*=/.test(m[2])) p.push({ linha, tipo: "aviso", msg: "Coloque **alt** na imagem: {{alt=\"descrição\"}} (acessibilidade e Google)." });
        if (tag === "img" && !/\bsrc\s*=/.test(m[2])) p.push({ linha, tipo: "erro", msg: "A **<img>** precisa do {{src=\"arquivo\"}}." });
        continue;
      }
      if (m[0].endsWith("/>")) continue;
      if (!fechando) {
        if (tag === "a" && !/\bhref\s*=/.test(m[2])) p.push({ linha, tipo: "aviso", msg: "O link **<a>** está sem {{href}}: ele não vai pra lugar nenhum." });
        if (/=\s*"[^"]*$/.test(m[2])) p.push({ linha, tipo: "erro", msg: `Tem uma **aspa sem fechar** num atributo da tag <${tag}>.` });
        pilha.push({ tag, linha });
      } else {
        const idx = pilha.map(x => x.tag).lastIndexOf(tag);
        if (idx === -1) { p.push({ linha, tipo: "erro", msg: `Tem um **</${tag}>** fechando sem ter aberto.` }); continue; }
        while (pilha.length - 1 > idx) {
          const aberta = pilha.pop();
          if (!["p", "li", "td", "th", "tr", "option", "dt", "dd"].includes(aberta.tag))
            p.push({ linha: aberta.linha, tipo: "erro", msg: `A tag **<${aberta.tag}>** não foi fechada antes do **</${tag}>** (feche na ordem: a última aberta fecha primeiro).` });
        }
        pilha.pop();
      }
    }
    pilha.filter(x => !["html", "head", "body", "p", "li", "td", "th", "tr", "option"].includes(x.tag)).slice(0, 4)
      .forEach(x => p.push({ linha: x.linha, tipo: "erro", msg: `A tag **<${x.tag}>** não foi fechada. Faltou o **</${x.tag}>**.` }));
    if (/<html/i.test(codigo) && !/<!DOCTYPE html>/i.test(codigo)) p.push({ linha: 1, tipo: "aviso", msg: "Coloque {{<!DOCTYPE html>}} na primeira linha." });
    if (/<html/i.test(codigo) && !/charset/i.test(codigo)) p.push({ linha: 1, tipo: "aviso", msg: "Faltou {{<meta charset=\"UTF-8\">}} no head: sem ele os **acentos** podem sair estranhos." });
    if (/<style[^>]*>([\s\S]*?)<\/style>/i.test(codigo)) {
      const css = codigo.match(/<style[^>]*>([\s\S]*?)<\/style>/i)[1];
      const base = codigo.slice(0, codigo.search(/<style/i)).split("\n").length;
      analisarCss(css).forEach(x => p.push({ ...x, linha: x.linha + base - 1, msg: "(CSS) " + x.msg }));
    }
    return p;
  }

  function analisarCss(codigo) {
    const p = [];
    const limpo = limpar(codigo, "css");
    conferirPares(limpo, p);
    const linhas = limpo.split("\n");
    let dentro = 0;
    linhas.forEach((bruta, i) => {
      const n = i + 1;
      const antes = dentro;
      for (const c of bruta) { if (c === "{") dentro++; if (c === "}") dentro--; }
      const l = bruta.trim();
      if (!l || l.startsWith("@")) return;
      // declarações da linha (pode ter várias)
      const corpo = l.includes("{") ? l.split("{").slice(1).join("{") : (antes > 0 ? l : "");
      if (!corpo) return;
      const partes = corpo.replace(/}\s*$/, "").split(";").map(x => x.trim()).filter(Boolean);
      partes.forEach((dec, k) => {
        if (!dec || dec === "}") return;
        if (!dec.includes(":")) {
          if (/^[a-z-]+\s+\S/.test(dec)) p.push({ linha: n, tipo: "erro", msg: `Faltou os **dois pontos** em **${dec}**. O certo é {{propriedade: valor;}}.` });
          return;
        }
        const prop = dec.split(":")[0].trim().toLowerCase();
        const valor = dec.split(":").slice(1).join(":").trim();
        if (/^[a-z-]+$/.test(prop) && !prop.startsWith("--") && !prop.startsWith("-webkit") && !prop.startsWith("-moz") && !CSS_PROPS.includes(prop)) {
          const quis = maisParecido(prop, CSS_PROPS);
          if (quis) p.push({ linha: n, tipo: "erro", msg: `A propriedade **${prop}** não existe. Você quis dizer **${quis}**?` });
        }
        if (/^(width|height|margin|padding|font-size|top|left|right|bottom|gap|border-radius|max-width|min-width|max-height|min-height|margin-\w+|padding-\w+|letter-spacing)$/.test(prop) && /(^|\s)[1-9]\d*(\s|$)/.test(valor))
          p.push({ linha: n, tipo: "erro", msg: `Faltou a **unidade** em **${prop}: ${valor}**. Use {{px}}, {{rem}}, {{%}}... (só o 0 pode ficar sem).` });
        const hex = valor.match(/#([0-9a-f]+)\b/i);
        if (hex && ![3, 4, 6, 8].includes(hex[1].length)) p.push({ linha: n, tipo: "erro", msg: `A cor **#${hex[1]}** está com ${hex[1].length} dígitos. Use 3 ou 6 (ex: {{#1e90ff}}).` });
        // falta de ; : valor com outra propriedade grudada
        if (/\s[a-z-]+\s*:\s*\S/.test(valor) && !/url\(|https?:/.test(valor))
          p.push({ linha: n, tipo: "erro", msg: `Parece que faltou o **;** entre as propriedades em **${dec}**.` });
      });
      // linha de propriedade sem ; seguida de outra
      if (antes > 0 && !l.includes("{") && /:\s*[^;{}]+$/.test(l)) {
        const prox = (linhas.slice(i + 1).find(x => x.trim()) || "").trim();
        if (prox && !prox.startsWith("}")) p.push({ linha: n, tipo: "erro", msg: "Faltou o **;** no fim desta linha." });
      }
    });
    return p;
  }

  function conhecidasDe(lang) {
    return (WCDEV.temas || []).filter(t => t.lang === lang && t.ref && /^[A-Za-z_][\w.]*$/.test(t.titulo)).map(t => t.titulo.split(".").pop());
  }

  // Nomes da consulta que aparecem no código (vira botão "ver explicação")
  function nomesUsados(codigo, lang) {
    const achados = [];
    const refs = (WCDEV.temas || []).filter(t => t.lang === lang && t.ref);
    for (const t of refs) {
      const nome = t.titulo;
      let re;
      if (lang === "html" && /^<\w+>$/.test(nome)) re = new RegExp("<" + nome.slice(1, -1) + "[\\s>]", "i");
      else if (lang === "css" && /^[a-z-]+$/.test(nome)) re = new RegExp("(^|[\\s;{])" + nome + "\\s*:", "m");
      else if (/^[A-Za-z_]\w+$/.test(nome) && nome.length > 3) re = new RegExp("\\b" + nome + "\\s*\\(");
      else continue;
      if (re.test(codigo)) achados.push(t.botao || nome);
      if (achados.length >= 8) break;
    }
    return achados;
  }

  function resumo(codigo, lang) {
    if (lang === "pawn") {
      const cbs = [...codigo.matchAll(/public\s+(On\w+)/g)].map(m => m[1]);
      const cmds = [...codigo.matchAll(/CMD\s*:\s*(\w+)/gi)].map(m => "/" + m[1]);
      const strc = [...codigo.matchAll(/"(\/\w+)"/g)].map(m => m[1]);
      const partes = [];
      if (cbs.length) partes.push(`callbacks: ${cbs.map(x => `{{${x}}}`).join(", ")}`);
      if (cmds.length || strc.length) partes.push(`comandos: ${[...new Set([...cmds, ...strc])].map(x => `{{${x}}}`).join(", ")}`);
      return partes.length ? "Seu código tem " + partes.join(" e ") + "." : "";
    }
    if (lang === "python") {
      const defs = [...codigo.matchAll(/def\s+(\w+)/g)].map(m => `{{${m[1]}()}}`);
      return defs.length ? `Você criou as funções ${defs.join(", ")}.` : "";
    }
    return "";
  }

  function analisar(codigo, langForcada) {
    const lang = langForcada || detectar(codigo);
    if (!lang) return null;
    let problemas = [];
    try {
      problemas = { pawn: analisarPawn, python: analisarPython, html: analisarHtml, css: analisarCss }[lang](codigo);
    } catch (e) { problemas = []; }
    // remove repetidos e ordena por linha
    const vistos = new Set();
    problemas = problemas.filter(x => { const k = x.linha + x.msg; if (vistos.has(k)) return false; vistos.add(k); return true; })
      .sort((a, b) => a.linha - b.linha);
    return { lang, problemas, usados: nomesUsados(codigo, lang), resumo: resumo(codigo, lang) };
  }

  return { analisar, detectar, pareceCodigo };
})();

WCDEV.revisor = Revisor;
