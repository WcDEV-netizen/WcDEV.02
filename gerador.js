/* =========================================================
   WC DEV — GERADOR DE CÓDIGO
   "cria um comando /cura que dá 100 de vida só pra admin"
   -> escreve o código completo, explica e confere se ficou sem erro
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Gerador = {
  ARMAS: { "soco ingles": 1, "taco de golfe": 2, cassetete: 3, faca: 4, taco: 5, bastao: 5, pa: 6, katana: 8, motosserra: 9,
    granada: 16, molotov: 18, "9mm": 22, colt: 22, silenciada: 23, deagle: 24, "desert eagle": 24, desert: 24,
    shotgun: 25, escopeta: 25, sawnoff: 26, spas: 27, "combat shotgun": 27, uzi: 28, "micro uzi": 28, mp5: 29,
    ak: 30, ak47: 30, "ak-47": 30, m4: 31, tec9: 32, "tec-9": 32, rifle: 33, sniper: 34, rpg: 35, bazuca: 35,
    "lanca chamas": 37, minigun: 38, spray: 41, extintor: 42, camera: 43, paraquedas: 46 },
  NOME_ARMA: { 1: "Soco-inglês", 2: "Taco de golfe", 3: "Cassetete", 4: "Faca", 5: "Bastão", 6: "Pá", 8: "Katana", 9: "Motosserra",
    16: "Granada", 18: "Molotov", 22: "9mm", 23: "9mm silenciada", 24: "Desert Eagle", 25: "Shotgun", 26: "Sawnoff", 27: "Combat Shotgun",
    28: "Micro Uzi", 29: "MP5", 30: "AK-47", 31: "M4", 32: "Tec-9", 33: "Country Rifle", 34: "Sniper", 35: "RPG", 37: "Lança-chamas",
    38: "Minigun", 41: "Spray", 42: "Extintor", 43: "Câmera", 46: "Paraquedas" },
  CARROS: { infernus: 411, cheetah: 415, banshee: 429, turismo: 451, bullet: 541, sultan: 560, elegy: 562, jester: 559,
    "super gt": 506, "zr-350": 477, zr350: 477, buffalo: 402, phoenix: 603, nrg: 522, "nrg-500": 522, fcr: 521, pcj: 461,
    sanchez: 468, freeway: 463, faggio: 462, bmx: 481, bike: 509, "mountain bike": 510, hydra: 520, maverick: 487,
    hunter: 425, sparrow: 469, shamal: 519, dodo: 593, rhino: 432, tanque: 432, viatura: 596, ambulancia: 416, bombeiro: 407,
    taxi: 420, onibus: 431, monster: 556, kart: 571, quadriciclo: 471, squalo: 446, guincho: 525, landstalker: 400, savanna: 567 },
  LUGARES: {
    grove: ["Grove Street", 2495.3, -1688.0, 13.6], prefeitura: ["Prefeitura de LS", 1481.0, -1772.0, 18.8],
    delegacia: ["Delegacia de LS", 1554.9, -1675.6, 16.2], dp: ["Delegacia de LS", 1554.9, -1675.6, 16.2],
    hospital: ["Hospital de LS", 1172.0, -1323.0, 15.4], aeroporto: ["Aeroporto de LS", 1685.0, -2335.0, 13.5],
    chiliad: ["Monte Chiliad", -2321.6, -1639.8, 483.7], "aeroporto sf": ["Aeroporto de SF", -1418.0, -295.0, 14.1],
    "aeroporto lv": ["Aeroporto de LV", 1319.0, 1253.0, 10.8], lv: ["Las Venturas", 1958.4, 1343.2, 15.4],
    ls: ["Los Santos (Grove)", 2495.3, -1688.0, 13.6], sf: ["Aeroporto de SF", -1418.0, -295.0, 14.1],
  },

  /* ================= PAWN: comandos ================= */
  acoesPawn(t) {
    t = t.replace(/\//g, " ");   // o nome do comando também é pista: "/cura", "/m4", "/anunciar"
    const a = [];
    const tem = re => re.test(t);
    if (tem(/ (vida|curar|cura|heal|hp) /) && !tem(/ (tirar|tira|zera|zerar) (a )?vida /)) a.push("vida");
    if (tem(/ (colete|armour|armor) /)) a.push("colete");
    if (tem(/ (dinheiro|grana|\$\d|reais|dolares) /) && !tem(/ (custa|custando|cobra|cobrando|preco) /)) a.push("dinheiro");
    if (tem(/ (arma|armas) /) || Object.keys(this.ARMAS).some(k => t.includes(" " + k + " "))) a.push("arma");
    if (tem(/ (skin|roupa|personagem) /)) a.push("skin");
    if (tem(/ (teleporta|teleportar|teleporte|levar pra|leva pra|ir pra|ir para|levar para) /) || Object.keys(this.LUGARES).some(k => t.includes(" " + k + " ") && k.length > 2)) a.push("tp");
    if (tem(/ (carro|veiculo|moto|aviao|helicoptero|barco) /) || Object.keys(this.CARROS).some(k => t.includes(" " + k + " "))) {
      if (tem(/ (conserta|consertar|reparar|repara|fix) /)) a.push("fix"); else a.push("carro");
    } else if (tem(/ (conserta|consertar|reparar|repara|fix) /)) a.push("fix");
    if (tem(/ (matar|mata|suicidio|se matar|kill) /)) a.push("kill");
    if (tem(/ (anuncio|anunciar|anuncia|mensagem pra todos|mensagem para todos|avisar todos|aviso geral) /)) a.push("anunciar");
    if (tem(/ (kick|kickar|expulsa|expulsar) /)) a.push("kick");
    if (tem(/ (ban|banir|bane) /)) a.push("ban");
    if (tem(/ (descongela|descongelar) /)) a.push("descongelar"); else if (tem(/ (congela|congelar|travar|trava) /)) a.push("congelar");
    if (tem(/ jetpack /)) a.push("jetpack");
    if (tem(/ (score|level|nivel|pontos) /)) a.push("score");
    if (tem(/ (procurado|estrelas|wanted) /)) a.push("procurado");
    if (tem(/ (hora|horario|deixar de noite|deixar de dia) /) && !tem(/ a cada /)) a.push("hora");
    if (tem(/ (clima|chuva|tempo nublado|neblina) /)) a.push("clima");
    return [...new Set(a)];
  },

  nomeComando(bruto, t, acoes) {
    let m = bruto.toLowerCase().match(/\/([a-z0-9_]{2,24})/);
    if (m) return m[1];
    m = t.match(/ comando (?:chamado |de nome |com nome )?([a-z][a-z0-9_]{2,20}) /);
    const ignorar = /^(que|pra|para|de|do|da|com|onde|quando|qual|simples|novo|pawn|samp|zcmd|sem|admin|vip)$/;
    if (m && !ignorar.test(m[1]) && !Object.keys(this.ARMAS).includes(m[1])) return m[1];
    return { vida: "vida", colete: "colete", dinheiro: "grana", arma: "arma", skin: "skin", tp: "ir", carro: "carro", fix: "fix",
      kill: "kill", anunciar: "anunciar", kick: "kick", ban: "ban", congelar: "congelar", descongelar: "descongelar",
      jetpack: "jetpack", score: "score", procurado: "procurado", hora: "hora", clima: "clima" }[acoes[0]] || "comando";
  },

  numeros(t) { return [...t.matchAll(/(?:^|\s|\$)(\d+(?:[.,]\d+)?)(?=\s|$)/g)].map(m => parseFloat(m[1].replace(",", "."))); },

  comandoPawn(bruto, t) {
    const acoes = this.acoesPawn(t);
    if (!acoes.length) return null;
    const nome = this.nomeComando(bruto, t, acoes);
    let nums = this.numeros(t.replace(/\/[a-z0-9_]+/g, " "));
    const pega = (padrao) => { const v = nums.length ? nums.shift() : padrao; return v; };
    // número escrito perto da palavra ("100 de vida", "colete 50", "300 balas")
    const perto = (palavras, padrao) => {
      const m = t.match(new RegExp(` (\\d+(?:[.,]\\d+)?) (?:de |da |do |em )?(?:${palavras}) `)) ||
                t.match(new RegExp(` (?:${palavras}) (?:de |em |pra |para |com )?(\\d+(?:[.,]\\d+)?) `));
      if (!m) return pega(padrao);
      const v = parseFloat(m[1].replace(",", "."));
      const i = nums.indexOf(v);
      if (i >= 0) nums.splice(i, 1);
      return v;
    };

    const ehAdmin = / (admin|administrador|staff|so pra admin|apenas admin) /.test(t);
    const segundos = (t.match(/ (\d+) (segundos|segundo|s|minutos|minuto) /) || [])[0];
    let cooldown = 0;
    if (segundos && / (cooldown|a cada|espera|esperar|de tempo|intervalo|so pode usar) /.test(t)) {
      const mm = t.match(/ (\d+) (segundos|segundo|s|minutos|minuto) /);
      cooldown = parseInt(mm[1], 10) * (/minuto/.test(mm[2]) ? 60 : 1);
      nums = nums.filter(n => n !== parseInt(mm[1], 10));
    }
    let preco = 0;
    const pm = t.match(/ (?:custa|custando|cobra|cobrando|preco de|por) \$?(\d+) /);
    if (pm) { preco = parseInt(pm[1], 10); nums = nums.filter(n => n !== preco); }

    const exclusivas = ["kick", "ban", "anunciar"];
    const principal = acoes.find(x => exclusivas.includes(x));
    if (principal) return this.comandoEspecial(principal, nome, ehAdmin || principal !== "anunciar", t);

    const praOutro = / (outro jogador|outra pessoa|pra alguem|para alguem|pelo id|o id|um jogador|de outro|pra outro|para outro|de alguem|em alguem|qualquer jogador) /.test(t) ||
      acoes.includes("congelar") || acoes.includes("descongelar");
    const alvo = praOutro ? "alvo" : "playerid";
    const corpo = [], explica = [];
    let precisaPos = false;

    for (const ac of acoes) {
      if (ac === "vida") { const v = Math.min(100, perto("vida|hp|cura", 100)); corpo.push(`SetPlayerHealth(${alvo}, ${v.toFixed(1)});`); explica.push(`deixa a **vida** em ${v}`); }
      if (ac === "colete") { const v = Math.min(100, perto("colete", 100)); corpo.push(`SetPlayerArmour(${alvo}, ${v.toFixed(1)});`); explica.push(`dá **colete** ${v}`); }
      if (ac === "dinheiro") { const v = Math.round(perto("dinheiro|grana|reais|dolares", 1000)); corpo.push(`GivePlayerMoney(${alvo}, ${v});`); explica.push(`dá **$${v}**`); }
      if (ac === "arma") {
        const chave = Object.keys(this.ARMAS).sort((a, b) => b.length - a.length).find(k => t.includes(" " + k + " "));
        const id = chave ? this.ARMAS[chave] : 24;
        const bal = Math.round(perto("balas|bala|municao|tiros", id >= 22 ? 500 : 1));
        corpo.push(`GivePlayerWeapon(${alvo}, ${id}, ${bal});   // ${this.NOME_ARMA[id] || "arma"}`);
        explica.push(`dá uma **${this.NOME_ARMA[id] || "arma"}** (ID ${id})${id >= 22 ? ` com ${bal} balas` : ""}`);
      }
      if (ac === "skin") { const v = Math.round(perto("skin|roupa|personagem", 0)); corpo.push(`SetPlayerSkin(${alvo}, ${v});`); explica.push(`muda a **skin** pra ${v}`); }
      if (ac === "score") { const v = Math.round(perto("score|level|nivel|pontos", 1)); corpo.push(`SetPlayerScore(${alvo}, GetPlayerScore(${alvo}) + ${v});`); explica.push(`dá **+${v} de score**`); }
      if (ac === "procurado") { const v = Math.min(6, Math.round(perto("estrelas|estrela|procurado", 0))); corpo.push(`SetPlayerWantedLevel(${alvo}, ${v});`); explica.push(`deixa com **${v} estrelas** de procurado`); }
      if (ac === "hora") { const v = Math.min(23, Math.round(pega(/ noite /.test(t) ? 0 : 12))); corpo.push(`SetPlayerTime(${alvo}, ${v}, 0);`); explica.push(`muda a **hora** pra ${v}h`); }
      if (ac === "clima") { const v = / chuva /.test(t) ? 8 : / neblina /.test(t) ? 9 : Math.round(pega(1)); corpo.push(`SetPlayerWeather(${alvo}, ${v});`); explica.push(`muda o **clima** (ID ${v})`); }
      if (ac === "kill") { corpo.push(`SetPlayerHealth(${alvo}, 0.0);`); explica.push("**mata** o jogador"); }
      if (ac === "congelar") { corpo.push(`TogglePlayerControllable(${alvo}, false);`); explica.push("**congela** o jogador"); }
      if (ac === "descongelar") { corpo.push(`TogglePlayerControllable(${alvo}, true);`); explica.push("**descongela** o jogador"); }
      if (ac === "jetpack") { corpo.push(`SetPlayerSpecialAction(${alvo}, SPECIAL_ACTION_USEJETPACK);`); explica.push("dá um **jetpack**"); }
      if (ac === "fix") {
        corpo.push(`if (!IsPlayerInAnyVehicle(${alvo})) return SendClientMessage(playerid, 0xFF0000FF, "Precisa estar num veículo.");`);
        corpo.push(`RepairVehicle(GetPlayerVehicleID(${alvo}));`);
        explica.push("**conserta** o veículo");
      }
      if (ac === "tp") {
        const chave = Object.keys(this.LUGARES).sort((a, b) => b.length - a.length).find(k => t.includes(" " + k + " ")) || "grove";
        const [lugar, x, y, z] = this.LUGARES[chave];
        corpo.push(`SetPlayerInterior(${alvo}, 0);`, `SetPlayerVirtualWorld(${alvo}, 0);`, `SetPlayerPos(${alvo}, ${x}, ${y}, ${z});`);
        explica.push(`**teleporta** pra ${lugar}`);
      }
      if (ac === "carro") {
        const chave = Object.keys(this.CARROS).sort((a, b) => b.length - a.length).find(k => t.includes(" " + k + " "));
        const numModelo = nums.find(n => n >= 400 && n <= 611);
        const modelo = numModelo || (chave ? this.CARROS[chave] : 411);
        if (numModelo) nums = nums.filter(n => n !== numModelo);
        precisaPos = true;
        corpo.push(`new veiculo = CreateVehicle(${modelo}, x + 2.0, y, z, a, -1, -1, -1);`, `PutPlayerInVehicle(${alvo}, veiculo, 0);`);
        explica.push(`cria um veículo modelo **${modelo}**${chave ? ` (${chave})` : ""} e coloca o jogador dentro`);
      }
    }

    const L = [];
    L.push(`CMD:${nome}(playerid, params[])`, "{");
    if (ehAdmin) L.push(`    if (!IsPlayerAdmin(playerid)) return SendClientMessage(playerid, 0xFF0000FF, "Só admins podem usar este comando.");`);
    if (cooldown) {
      L.push(`    if (GetTickCount() - Usou_${nome}[playerid] < ${cooldown * 1000})`, `        return SendClientMessage(playerid, 0xFF0000FF, "Espere ${cooldown} segundos pra usar de novo.");`);
    }
    if (praOutro) {
      L.push("    new alvo;", `    if (sscanf(params, "u", alvo)) return SendClientMessage(playerid, -1, "Use: /${nome} [id ou nome]");`,
        `    if (alvo == INVALID_PLAYER_ID) return SendClientMessage(playerid, 0xFF0000FF, "Jogador não encontrado.");`);
    } else {
      L.push("    #pragma unused params");
    }
    if (preco) L.push(`    if (GetPlayerMoney(playerid) < ${preco}) return SendClientMessage(playerid, 0xFF0000FF, "Você precisa de $${preco}.");`, `    GivePlayerMoney(playerid, -${preco});`);
    if (precisaPos) L.push("    new Float:x, Float:y, Float:z, Float:a;", `    GetPlayerPos(${alvo}, x, y, z);`, `    GetPlayerFacingAngle(${alvo}, a);`);
    corpo.forEach(c => L.push("    " + c));
    if (cooldown) L.push(`    Usou_${nome}[playerid] = GetTickCount();`);
    const msgTxt = explica.map(e => e.replace(/\*\*/g, "")).join(", ").replace(/"/g, "");
    if (praOutro) L.push(`    SendClientMessage(playerid, 0x33AA33FF, "Pronto! Comando aplicado no jogador.");`, `    SendClientMessage(alvo, 0x33AA33FF, "Um admin usou /${nome} em você.");`);
    else L.push(`    SendClientMessage(playerid, 0x33AA33FF, "${("Pronto: " + msgTxt).slice(0, 110)}.");`);
    L.push("    return 1;", "}");

    const cabecalho = ["#include <a_samp>", "#include <zcmd>"];
    if (praOutro) cabecalho.push("#include <sscanf2>");
    if (cooldown) cabecalho.push("", `new Usou_${nome}[MAX_PLAYERS];   // guarda quando cada jogador usou /${nome}`);
    const codigo = cabecalho.join("\n") + "\n\n" + L.join("\n");

    const oQueFaz = [];
    if (ehAdmin) oQueFaz.push("confere se quem usou é **admin** (logado no RCON)");
    if (cooldown) oQueFaz.push(`só deixa usar de **${cooldown} em ${cooldown} segundos**`);
    if (praOutro) oQueFaz.push("lê o **ID ou nome** do jogador com o sscanf e confere se ele existe");
    if (preco) oQueFaz.push(`cobra **$${preco}** de quem usou`);
    explica.forEach(e => oQueFaz.push(e));
    oQueFaz.push("manda uma **mensagem** confirmando");

    return this.entregar("pawn", `Comando /${nome}`, codigo, oQueFaz,
      ["Coloque no seu gamemode (fora de qualquer função).", "Precisa do include **zcmd**" + (praOutro ? " e do plugin **sscanf**." : "."),
        ehAdmin ? "Pra testar, entre no RCON com {{/rcon login SENHA}}." : null].filter(Boolean));
  },

  comandoEspecial(tipo, nome, admin, t) {
    let codigo, oQueFaz;
    if (tipo === "anunciar") {
      codigo = `#include <a_samp>
#include <zcmd>

CMD:${nome}(playerid, params[])
{
${admin ? '    if (!IsPlayerAdmin(playerid)) return SendClientMessage(playerid, 0xFF0000FF, "Só admins.");\n' : ""}    if (isnull(params)) return SendClientMessage(playerid, -1, "Use: /${nome} [texto]");
    new nome[MAX_PLAYER_NAME], msg[144];
    GetPlayerName(playerid, nome, sizeof(nome));
    format(msg, sizeof(msg), "[ANÚNCIO] %s: %s", nome, params);
    SendClientMessageToAll(0xFF9900FF, msg);
    return 1;
}`;
      oQueFaz = [admin ? "confere se é admin" : null, "confere se a pessoa escreveu um texto", "pega o nome de quem anunciou", "manda a mensagem pra **todos** em laranja"].filter(Boolean);
    } else {
      const acao = tipo === "kick" ? "Kick" : "Ban";
      const verbo = tipo === "kick" ? "kickou" : "baniu";
      codigo = `#include <a_samp>
#include <zcmd>
#include <sscanf2>

forward Punir_${nome}(playerid);
public Punir_${nome}(playerid)
{
    ${acao}(playerid);
    return 1;
}

CMD:${nome}(playerid, params[])
{
    if (!IsPlayerAdmin(playerid)) return SendClientMessage(playerid, 0xFF0000FF, "Só admins podem usar este comando.");
    new alvo, motivo[64];
    if (sscanf(params, "uS(sem motivo)[64]", alvo, motivo)) return SendClientMessage(playerid, -1, "Use: /${nome} [id ou nome] [motivo]");
    if (alvo == INVALID_PLAYER_ID) return SendClientMessage(playerid, 0xFF0000FF, "Jogador não encontrado.");
    new nomeAdm[MAX_PLAYER_NAME], nomeAlvo[MAX_PLAYER_NAME], msg[144];
    GetPlayerName(playerid, nomeAdm, sizeof(nomeAdm));
    GetPlayerName(alvo, nomeAlvo, sizeof(nomeAlvo));
    format(msg, sizeof(msg), "[ADMIN] %s ${verbo} %s. Motivo: %s", nomeAdm, nomeAlvo, motivo);
    SendClientMessageToAll(0xFF6347FF, msg);
    SetTimerEx("Punir_${nome}", 500, false, "i", alvo);
    return 1;
}`;
      oQueFaz = ["confere se é **admin**", "lê o **jogador** e o **motivo** (o motivo é opcional)", "avisa todo mundo no chat",
        `${tipo === "kick" ? "kicka" : "bane"} depois de **meio segundo** (assim a mensagem chega antes)`];
    }
    return this.entregar("pawn", `Comando /${nome}`, codigo, oQueFaz, ["Precisa do **zcmd**" + (tipo !== "anunciar" ? " e do **sscanf**." : ".")]);
  },

  /* ================= PAWN: sistemas ================= */
  sistemaPawn(bruto, t) {
    const aspas = (bruto.match(/["“”']([^"“”']{3,120})["“”']/) || [])[1];
    const min = parseInt((t.match(/ (\d+) (minutos|minuto|min) /) || [])[1] || "0", 10);
    if (/ (mensagem|mensagens|anuncio|anuncios|aviso|avisos|dica|dicas) (automatica|automaticas|automatico|automaticos) | a cada .* (mensagem|aviso) /.test(t)) {
      const m = min || 5, txt = (aspas || "Siga as regras e divirta-se!").replace(/"/g, "");
      const codigo = `#include <a_samp>

forward MensagemAutomatica();
public MensagemAutomatica()
{
    SendClientMessageToAll(0x1E90FFFF, "[AVISO] ${txt}");
    return 1;
}

public OnGameModeInit()
{
    SetTimer("MensagemAutomatica", ${m * 60000}, true);   // ${m} minuto(s), repetindo
    return 1;
}`;
      return this.entregar("pawn", "Mensagem automática", codigo, [`a cada **${m} minuto(s)** manda "${txt}" pra todos`, "usa um **timer** que repete (o true no final)"],
        ["Se você já tem um {{OnGameModeInit}}, coloque só a linha do SetTimer dentro dele."]);
    }
    if (/ (payday|salario|pagamento automatico) /.test(t)) {
      const nums = this.numeros(t).filter(n => n !== min);
      const valor = Math.round(nums[0] || 500), m = min || 60;
      const codigo = `#include <a_samp>
#include <foreach>

forward Payday();
public Payday()
{
    foreach (new i : Player)
    {
        GivePlayerMoney(i, ${valor});
        GameTextForPlayer(i, "~g~PAYDAY! +$${valor}", 3000, 1);
    }
    return 1;
}

public OnGameModeInit()
{
    SetTimer("Payday", ${m * 60000}, true);   // a cada ${m} minuto(s)
    return 1;
}`;
      return this.entregar("pawn", "Sistema de payday", codigo, [`a cada **${m} minuto(s)** dá **$${valor}** pra todo mundo online`, "mostra \"PAYDAY\" na tela"],
        ["Precisa do include **foreach**.", "Se você já tem um {{OnGameModeInit}}, coloque só a linha do SetTimer dentro dele."]);
    }
    return null;
  },

  /* ================= PYTHON ================= */
  python(bruto, t) {
    const n = this.numeros(t);
    const tpl = [
      [/ (calculadora) /, "Calculadora", () => `a = float(input("Primeiro número: "))
op = input("Operação (+ - * /): ")
b = float(input("Segundo número: "))

if op == "+":
    print("Resultado:", a + b)
elif op == "-":
    print("Resultado:", a - b)
elif op == "*":
    print("Resultado:", a * b)
elif op == "/":
    if b == 0:
        print("Não dá pra dividir por zero!")
    else:
        print("Resultado:", a / b)
else:
    print("Operação inválida.")`, ["pede dois números e a operação", "usa if/elif pra escolher a conta", "não deixa dividir por zero"]],
      [/ (soma|somar|some) /, "Soma de dois números", () => `a = float(input("Primeiro número: "))
b = float(input("Segundo número: "))
print("A soma é", a + b)`, ["pede dois números (convertendo com float)", "mostra a soma"]],
      [/ tabuada /, "Tabuada", () => { const k = n[0] || 7; return `numero = ${k}
for i in range(1, 11):
    print(f"{numero} x {i} = {numero * i}")`; }, ["usa um **for** de 1 a 10", "mostra cada multiplicação com f-string"]],
      [/ (par ou impar|e par|e impar) /, "Par ou ímpar", () => `numero = int(input("Digite um número: "))
if numero % 2 == 0:
    print(numero, "é par")
else:
    print(numero, "é ímpar")`, ["usa o resto da divisão (**%**)", "se o resto por 2 for 0, é par"]],
      [/ (adivinhar|adivinhacao|adivinha) /, "Jogo de adivinhar", () => { const max = n[0] || 10; return `import random

segredo = random.randint(1, ${max})
tentativas = 0

while True:
    palpite = int(input("Chute um número de 1 a ${max}: "))
    tentativas += 1
    if palpite < segredo:
        print("Mais alto!")
    elif palpite > segredo:
        print("Mais baixo!")
    else:
        print(f"Acertou em {tentativas} tentativas!")
        break`; }, ["sorteia um número com **random**", "repete com **while True** até acertar", "dá dica de mais alto/mais baixo"]],
      [/ (media|média) /, "Média de notas", () => { const q = n[0] || 3; return `quantidade = ${q}
soma = 0
for i in range(quantidade):
    nota = float(input(f"Nota {i + 1}: "))
    soma += nota

media = soma / quantidade
print(f"Média: {media:.1f}")
if media >= 7:
    print("Aprovado!")
else:
    print("Reprovado.")`; }, ["pede as notas num **for**", "soma tudo e divide pela quantidade", "diz se foi aprovado (média 7)"]],
      [/ (contagem regressiva|contagem) /, "Contagem regressiva", () => { const k = n[0] || 10; return `import time

for i in range(${k}, 0, -1):
    print(i)
    time.sleep(1)
print("Fim!")`; }, ["conta de trás pra frente com range(..., 0, -1)", "espera 1 segundo entre cada número"]],
      [/ (celsius|fahrenheit|temperatura) /, "Conversor de temperatura", () => `celsius = float(input("Temperatura em °C: "))
fahrenheit = celsius * 9 / 5 + 32
print(f"{celsius}°C = {fahrenheit:.1f}°F")`, ["usa a fórmula F = C × 9/5 + 32"]],
      [/ (imc) /, "Calculadora de IMC", () => `peso = float(input("Peso (kg): "))
altura = float(input("Altura (m, ex: 1.70): "))
imc = peso / altura ** 2
print(f"Seu IMC é {imc:.1f}")`, ["divide o peso pela altura ao quadrado (**)"]],
      [/ (maior numero|maior de|qual o maior) /, "Maior número", () => `numeros = []
for i in range(3):
    numeros.append(float(input(f"Número {i + 1}: ")))
print("O maior é", max(numeros))`, ["guarda os números numa **lista**", "usa **max()** pra achar o maior"]],
      [/ (senha) /, "Gerador de senha", () => { const k = n[0] || 12; return `import random
import string

caracteres = string.ascii_letters + string.digits + "!@#$%"
senha = "".join(random.choice(caracteres) for _ in range(${k}))
print("Sua senha:", senha)`; }, ["junta letras, números e símbolos", `sorteia ${n[0] || 12} caracteres`]],
      [/ (lista de compras|lista de tarefas|to do|todo list) /, "Lista de tarefas", () => `tarefas = []

while True:
    print("\\n1 - Adicionar  2 - Ver  3 - Sair")
    opcao = input("> ")
    if opcao == "1":
        tarefas.append(input("Tarefa: "))
    elif opcao == "2":
        for i, tarefa in enumerate(tarefas, start=1):
            print(i, "-", tarefa)
    elif opcao == "3":
        break`, ["usa uma **lista** pra guardar", "um **menu** com while True", "**enumerate** pra numerar"]],
    ];
    for (const [re, titulo, fazer, oque] of tpl) if (re.test(t)) return this.entregar("python", titulo, fazer(), oque, ["Rode com {{python arquivo.py}} ou cole num site como o Programiz."]);
    return null;
  },

  /* ================= HTML ================= */
  html(bruto, t) {
    if (!/ (pagina|site|tela|landing) /.test(t)) return null;
    const titulo = (bruto.match(/["“”]([^"“”]{2,60})["“”]/) || [])[1] || "Meu Site";
    const partes = [], oque = [`título **${titulo}**`];
    if (/ (login|entrar) /.test(t)) { partes.push(`  <form class="caixa">
    <h2>Entrar</h2>
    <input type="text" placeholder="Usuário" required>
    <input type="password" placeholder="Senha" required>
    <button>Entrar</button>
  </form>`); oque.push("formulário de **login**"); }
    if (/ (contato|formulario) /.test(t) && !/ login /.test(t)) { partes.push(`  <form class="caixa">
    <h2>Contato</h2>
    <input type="email" placeholder="Seu e-mail" required>
    <textarea placeholder="Mensagem"></textarea>
    <button>Enviar</button>
  </form>`); oque.push("formulário de **contato**"); }
    if (/ (card|cards|produto|produtos|servicos) /.test(t)) { partes.push(`  <section class="cards">
    <div class="caixa"><h3>Item 1</h3><p>Descrição.</p></div>
    <div class="caixa"><h3>Item 2</h3><p>Descrição.</p></div>
    <div class="caixa"><h3>Item 3</h3><p>Descrição.</p></div>
  </section>`); oque.push("**3 cards** em grade"); }
    if (/ (botao) /.test(t) && !partes.length) { partes.push(`  <button>Começar</button>`); oque.push("um **botão**"); }
    if (!partes.length) { partes.push(`  <p>Bem-vindo! Edite este texto.</p>`); oque.push("um parágrafo de boas-vindas"); }
    const codigo = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
  <style>
    body { background: #05070d; color: #dbe6ff; font-family: Arial, sans-serif; margin: 0; padding: 30px; }
    h1 { color: #1e90ff; text-align: center; }
    .caixa { background: #0b0f1a; border: 1px solid #1c2740; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 10px; max-width: 360px; margin: 20px auto; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    input, textarea { padding: 10px; border-radius: 8px; border: 1px solid #1c2740; background: #111827; color: #fff; }
    button { background: #1e90ff; color: #000; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <h1>${titulo}</h1>
${partes.join("\n")}
</body>
</html>`;
    return this.entregar("html", "Página " + titulo, codigo, oque, ["Salve como {{index.html}} e abra no navegador.", "Já vem com CSS azul e preto dentro do {{<style>}}."]);
  },

  /* ================= entrega com autoconferência ================= */
  entregar(lang, titulo, codigo, oque, notas) {
    const r = WCDEV.revisor ? WCDEV.revisor.analisar(codigo, lang) : { problemas: [] };
    const erros = r.problemas.filter(p => p.tipo === "erro");
    let texto = `> 🧠 Entendi o que você quer e montei o código. Depois passei ele no meu revisor: ${erros.length ? `achei ${erros.length} ponto(s) pra conferir.` : "**nenhum erro** encontrado."}\n`;
    texto += `### ✅ ${titulo}\n**O que esse código faz:**\n${oque.map(x => "- " + x).join("\n")}\n~~~${lang}\n${codigo}\n~~~\n`;
    if (notas && notas.length) texto += `**Como usar:**\n${notas.map(x => "- " + x).join("\n")}`;
    estado.ultimoCodigo = { codigo, lang };
    return { texto, sugestoes: ["/explicar", "/desafio " + lang, "/editor"], preview: lang === "html" ? codigo.replace(/^[\s\S]*<body>|<\/body>[\s\S]*$/g, "").replace(/^/, codigo.match(/<style>[\s\S]*<\/style>/)[0]) : null };
  },

  // ponto de entrada: tenta gerar algo a partir do pedido
  tentar(bruto, t, lang) {
    const pede = / (cria|crie|criar|faz|faca|fazer|gera|gere|gerar|escreve|escreva|monta|monte|quero|preciso|me da|me de|programa|codigo de|codigo pra|codigo para|codigo que) /.test(t);
    if (!pede) return null;
    const ehPawn = lang === "pawn" || (!lang && estado.lang === "pawn") ||
      (/ (comando|cmd|payday|salario|mensagem automatica|mensagens automaticas|anuncio automatico|aviso automatico) /.test(t) && !/ (python|html|css) /.test(t));
    if (ehPawn) {
      if (/ (comando|cmd) /.test(t) || /\/[a-z]/.test(bruto)) { const r = this.comandoPawn(bruto, t); if (r) return r; }
      const s = this.sistemaPawn(bruto, t);
      if (s) return s;
    }
    if (lang === "python" || (!lang && estado.lang === "python") || / programa /.test(t)) { const r = this.python(bruto, t); if (r) return r; }
    if (lang === "html" || (!lang && estado.lang === "html") || / (pagina|site) /.test(t)) { const r = this.html(bruto, t); if (r) return r; }
    return null;
  },

  // "outro exemplo": coloca o exemplo da consulta dentro de um código de verdade
  exemploCompleto(tema) {
    const ex = WCDEV.cerebro.primeiroCodigo(tema);
    if (!ex || tema.lang !== "pawn" || /public|CMD:|stock|#include|enum|forward|^\/\//m.test(ex.codigo)) return null;
    if (!/playerid/.test(ex.codigo)) return null;
    const nome = tema.titulo.replace(/[^A-Za-z]/g, "").toLowerCase().slice(0, 14) || "teste";
    return `#include <a_samp>\n#include <zcmd>\n\n// Comando de teste usando ${tema.titulo}\nCMD:${nome}(playerid, params[])\n{\n    #pragma unused params\n${ex.codigo.split("\n").map(l => "    " + l).join("\n")}\n    SendClientMessage(playerid, 0x33AA33FF, "Comando /${nome} funcionou!");\n    return 1;\n}`;
  },
};

WCDEV.gerador = Gerador;
