/* =========================================================
   WC DEV — DESAFIO DE CADA AULA
   Aula guiada: eu ensino → você faz o desafio da aula →
   só depois vai pro próximo passo. Assim fixa na cabeça.
   Pra adicionar: A("id-da-aula", nível, enunciado, dica, [[regex, o que falta]], solução)
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };
WCDEV.desafiosAula = WCDEV.desafiosAula || {};

(function () {
  const A = (id, nivel, enunciado, dica, testes, solucao, extra) => {
    WCDEV.desafiosAula[id] = { aula: id, nivel, enunciado, dica, testes: testes.map(([re, falta]) => ({ re, falta })), solucao, ...(extra || {}) };
  };
  const BASE_CSS = `<h1>Título</h1><p>Um parágrafo de exemplo.</p><a href="#">Um link</a> <button class="botao">Botão</button><div class="card caixa">Card</div><img src="" alt="imagem" width="900" height="40">`;

  /* ======================= PAWN ======================= */
  A("pawn-intro", 1, "Escreva seu **primeiro gamemode**: inclua o {{a_samp}} e crie o {{main()}} que mostra **\"Meu servidor ligou!\"** no console com {{print}}.",
    "São 3 partes: {{#include <a_samp>}}, depois {{main()}} com chaves, e dentro um {{print(\"...\");}}.",
    [[/#include\s*<a_samp>/, "Faltou {{#include <a_samp>}}."], [/main\s*\(\s*\)/, "Faltou a função {{main()}}."], [/print\s*\(\s*"[^"]*"\s*\)\s*;/, "Faltou o {{print(\"Meu servidor ligou!\");}} (com ponto e vírgula)."]],
    `#include <a_samp>\n\nmain()\n{\n    print("Meu servidor ligou!");\n}`);
  A("pawn-servidor", 1, "No arquivo **server.cfg**, escreva as 2 linhas que: carregam o gamemode **meurp** e deixam o nome do servidor como **WC DEV RP**.",
    "Uma linha começa com {{gamemode0}} (nome + 1) e a outra com {{hostname}}.",
    [[/gamemode0\s+meurp\s+1/, "A linha do gamemode é {{gamemode0 meurp 1}}."], [/hostname\s+WC DEV RP/i, "A linha do nome é {{hostname WC DEV RP}}."]],
    `gamemode0 meurp 1\nhostname WC DEV RP`, { semRevisor: true });
  A("pawn-estrutura", 1, "Monte a **estrutura mínima** de um gamemode: {{#include <a_samp>}}, {{main()}} e o {{OnGameModeInit}} que usa {{SetGameModeText(\"Meu GM\")}} e retorna 1.",
    "O OnGameModeInit é {{public OnGameModeInit()}} e termina com {{return 1;}}.",
    [[/#include\s*<a_samp>/, "Faltou {{#include <a_samp>}}."], [/main\s*\(\s*\)/, "Faltou {{main()}}."], [/public\s+OnGameModeInit\s*\(\s*\)/, "Faltou {{public OnGameModeInit()}}."],
      [/SetGameModeText\s*\(\s*"[^"]+"\s*\)\s*;/, "Faltou {{SetGameModeText(\"Meu GM\");}}."], [/return\s+1\s*;/, "Faltou o {{return 1;}}."]],
    `#include <a_samp>\n\nmain() {}\n\npublic OnGameModeInit()\n{\n    SetGameModeText("Meu GM");\n    return 1;\n}`);
  A("pawn-variaveis", 1, "Crie **3 variáveis**: o inteiro {{dinheiro}} valendo 500, o Float {{vida}} valendo 100.0 e o bool {{logado}} valendo false.",
    "Float e bool precisam da **tag** antes do nome: {{new Float:vida = 100.0;}}",
    [[/new\s+dinheiro\s*=\s*500\s*;/, "Faltou {{new dinheiro = 500;}}."], [/new\s+Float\s*:\s*vida\s*=\s*100\.0\s*;/, "Faltou {{new Float:vida = 100.0;}} (com a tag e o .0)."], [/new\s+bool\s*:\s*logado\s*=\s*false\s*;/, "Faltou {{new bool:logado = false;}}."]],
    `new dinheiro = 500;\nnew Float:vida = 100.0;\nnew bool:logado = false;`);
  A("pawn-arrays", 2, "Crie a string {{nome}} do tamanho {{MAX_PLAYER_NAME}}, pegue o nome com {{GetPlayerName}} e mande **\"Oi, NOME!\"** pro jogador usando {{format}}.",
    "Você precisa de 2 strings: {{nome}} e {{msg}}. O format fica: {{format(msg, sizeof(msg), \"Oi, %s!\", nome);}}",
    [[/new\s+nome\s*\[\s*MAX_PLAYER_NAME\s*\]/, "Crie {{new nome[MAX_PLAYER_NAME]}}."], [/GetPlayerName\s*\(\s*playerid\s*,\s*nome\s*,\s*sizeof\s*\(?\s*nome\s*\)?\s*\)/, "Use {{GetPlayerName(playerid, nome, sizeof(nome));}}."],
      [/format\s*\([^;]*%s/, "Use {{format}} com {{%s}} pra colocar o nome no texto."], [/SendClientMessage\s*\(\s*playerid/, "Mande a mensagem com {{SendClientMessage(playerid, -1, msg);}}."]],
    `new nome[MAX_PLAYER_NAME], msg[64];\nGetPlayerName(playerid, nome, sizeof(nome));\nformat(msg, sizeof(msg), "Oi, %s!", nome);\nSendClientMessage(playerid, -1, msg);`);
  A("pawn-if", 1, "Pegue o dinheiro do jogador numa variável {{dinheiro}}. **Se** for 1000 ou mais, mande **\"Você é rico!\"**; **senão**, mande **\"Continue trabalhando\"**.",
    "{{new dinheiro = GetPlayerMoney(playerid);}} e depois {{if (dinheiro >= 1000) ... else ...}}",
    [[/new\s+dinheiro\s*=\s*GetPlayerMoney\s*\(\s*playerid\s*\)/, "Guarde o dinheiro: {{new dinheiro = GetPlayerMoney(playerid);}}."], [/if\s*\(\s*dinheiro\s*>=\s*1000\s*\)/, "Faltou {{if (dinheiro >= 1000)}}."], [/\belse\b/, "Faltou o {{else}} pro outro caso."],
      [/SendClientMessage[\s\S]*SendClientMessage/, "Precisa de **duas** mensagens: uma no if e outra no else."]],
    `new dinheiro = GetPlayerMoney(playerid);\nif (dinheiro >= 1000)\n{\n    SendClientMessage(playerid, -1, "Você é rico!");\n}\nelse\n{\n    SendClientMessage(playerid, -1, "Continue trabalhando");\n}`);
  A("pawn-loops", 2, "Faça um {{for}} que passa por **todos os jogadores** e dá **$100** só pra quem está conectado.",
    "{{for (new i = 0; i < MAX_PLAYERS; i++)}} e dentro {{if (IsPlayerConnected(i)) GivePlayerMoney(i, 100);}}",
    [[/for\s*\(\s*new\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*MAX_PLAYERS\s*;\s*\1\s*\+\+\s*\)/, "Use {{for (new i = 0; i < MAX_PLAYERS; i++)}}."], [/IsPlayerConnected\s*\(\s*\w+\s*\)/, "Confira se está conectado com {{IsPlayerConnected(i)}}."], [/GivePlayerMoney\s*\(\s*\w+\s*,\s*100\s*\)/, "Dê o dinheiro com {{GivePlayerMoney(i, 100);}}."]],
    `for (new i = 0; i < MAX_PLAYERS; i++)\n{\n    if (IsPlayerConnected(i)) GivePlayerMoney(i, 100);\n}`);
  A("pawn-funcoes", 2, "Crie a função {{stock Curar(playerid)}} que deixa **vida e colete em 100**, e chame ela dentro do {{OnPlayerSpawn}}.",
    "A função usa {{SetPlayerHealth}} e {{SetPlayerArmour}}. No OnPlayerSpawn é só {{Curar(playerid);}}.",
    [[/stock\s+Curar\s*\(\s*playerid\s*\)/, "Crie {{stock Curar(playerid)}}."], [/SetPlayerHealth\s*\(\s*playerid\s*,\s*100(\.0)?\s*\)/, "Faltou {{SetPlayerHealth(playerid, 100.0);}}."], [/SetPlayerArmour\s*\(\s*playerid\s*,\s*100(\.0)?\s*\)/, "Faltou {{SetPlayerArmour(playerid, 100.0);}}."],
      [/public\s+OnPlayerSpawn\s*\(\s*playerid\s*\)[\s\S]*Curar\s*\(\s*playerid\s*\)/, "Chame {{Curar(playerid);}} dentro do {{public OnPlayerSpawn(playerid)}}."]],
    `stock Curar(playerid)\n{\n    SetPlayerHealth(playerid, 100.0);\n    SetPlayerArmour(playerid, 100.0);\n}\n\npublic OnPlayerSpawn(playerid)\n{\n    Curar(playerid);\n    return 1;\n}`);
  A("pawn-callbacks", 2, "No {{OnPlayerDeath}}, se quem matou for válido (diferente de {{INVALID_PLAYER_ID}}), dê **+1 de score** pra ele.",
    "O score novo é o atual + 1: {{SetPlayerScore(killerid, GetPlayerScore(killerid) + 1);}}",
    [[/public\s+OnPlayerDeath\s*\(\s*playerid\s*,\s*killerid\s*,\s*reason\s*\)/, "Use o cabeçalho {{public OnPlayerDeath(playerid, killerid, reason)}}."], [/killerid\s*!=\s*INVALID_PLAYER_ID/, "Confira {{killerid != INVALID_PLAYER_ID}}."],
      [/SetPlayerScore\s*\(\s*killerid\s*,\s*GetPlayerScore\s*\(\s*killerid\s*\)\s*\+\s*1\s*\)/, "Dê o score: {{SetPlayerScore(killerid, GetPlayerScore(killerid) + 1);}}."]],
    `public OnPlayerDeath(playerid, killerid, reason)\n{\n    if (killerid != INVALID_PLAYER_ID)\n    {\n        SetPlayerScore(killerid, GetPlayerScore(killerid) + 1);\n    }\n    return 1;\n}`);
  A("pawn-mensagens", 1, "Mande pra **todos** uma mensagem na cor azul {{0x1E90FFFF}}, e pro jogador uma mensagem em que a palavra **Bem-vindo** aparece em amarelo usando {{{FFFF00}}} dentro do texto.",
    "Pra todos é {{SendClientMessageToAll(cor, \"texto\");}}. A cor no meio do texto fica assim: {{\"{FFFF00}Bem-vindo {FFFFFF}ao servidor\"}}.",
    [[/SendClientMessageToAll\s*\(\s*0x1E90FFFF/i, "Use {{SendClientMessageToAll(0x1E90FFFF, ...)}}."], [/\{FFFF00\}/i, "Coloque {{{FFFF00}}} antes da palavra no texto."], [/SendClientMessage\s*\(\s*playerid/, "Mande a do jogador com {{SendClientMessage(playerid, ...)}}."]],
    `SendClientMessageToAll(0x1E90FFFF, "Um novo jogador chegou!");\nSendClientMessage(playerid, -1, "{FFFF00}Bem-vindo {FFFFFF}ao servidor!");`);
  A("pawn-comandos", 1, "Crie com **zcmd** o comando **/colete** que dá **100 de colete** e manda uma mensagem avisando.",
    "{{CMD:colete(playerid, params[])}}, dentro {{SetPlayerArmour(playerid, 100.0);}}, uma mensagem e {{return 1;}}.",
    [[/CMD\s*:\s*colete\s*\(\s*playerid\s*,\s*params\s*\[\s*\]\s*\)/, "Use {{CMD:colete(playerid, params[])}}."], [/SetPlayerArmour\s*\(\s*playerid\s*,\s*100(\.0)?\s*\)/, "Faltou {{SetPlayerArmour(playerid, 100.0);}}."],
      [/SendClientMessage\s*\(/, "Mande uma mensagem pro jogador."], [/return\s+1\s*;/, "Comando precisa de {{return 1;}}."]],
    `CMD:colete(playerid, params[])\n{\n    SetPlayerArmour(playerid, 100.0);\n    SendClientMessage(playerid, -1, "Colete cheio!");\n    return 1;\n}`);
  A("pawn-dialogs", 2, "Mostre um dialog do tipo **mensagem** ({{DIALOG_STYLE_MSGBOX}}) com id **10**, título **\"Regras\"**, um texto e o botão **\"Ok\"** (o segundo botão vazio).",
    "{{ShowPlayerDialog(playerid, 10, DIALOG_STYLE_MSGBOX, \"Regras\", \"texto\", \"Ok\", \"\");}}",
    [[/ShowPlayerDialog\s*\(\s*playerid\s*,\s*10\s*,\s*DIALOG_STYLE_MSGBOX/, "Use {{ShowPlayerDialog(playerid, 10, DIALOG_STYLE_MSGBOX, ...)}}."], [/"Regras"/, "O título é {{\"Regras\"}}."], [/"Ok"/, "O botão é {{\"Ok\"}}."]],
    `ShowPlayerDialog(playerid, 10, DIALOG_STYLE_MSGBOX, "Regras", "Sem DM na praça.\\nRespeite todos.", "Ok", "");`);
  A("pawn-timers", 2, "Crie um **timer** que, a cada **10 minutos**, manda **\"Lembre de seguir as regras!\"** pra todos. Precisa de {{forward}}, {{public}} e do {{SetTimer}} repetindo dentro do {{OnGameModeInit}}.",
    "10 minutos = {{600000}} ms (ou {{10 * 60000}}). O último parâmetro {{true}} faz repetir.",
    [[/forward\s+(\w+)\s*\(\s*\)\s*;/, "Faltou o {{forward NomeDaFuncao();}}."], [/public\s+\w+\s*\(\s*\)/, "Faltou a função {{public}} do timer."],
      [/SetTimer\s*\(\s*"\w+"\s*,\s*(600000|10\s*\*\s*60000)\s*,\s*true\s*\)/, "Use {{SetTimer(\"NomeDaFuncao\", 600000, true);}}."], [/SendClientMessageToAll\s*\(/, "Mande pra todos com {{SendClientMessageToAll}}."]],
    `forward Lembrete();\npublic Lembrete()\n{\n    SendClientMessageToAll(-1, "Lembre de seguir as regras!");\n    return 1;\n}\n\npublic OnGameModeInit()\n{\n    SetTimer("Lembrete", 600000, true);\n    return 1;\n}`);
  A("pawn-enum", 2, "Crie o **enum** {{E_JOGADOR}} com {{jNivel}} e {{jDinheiro}}, o array {{Jogador[MAX_PLAYERS][E_JOGADOR]}}, e coloque **jNivel = 1** no {{OnPlayerConnect}}.",
    "Depois do enum: {{new Jogador[MAX_PLAYERS][E_JOGADOR];}}. No connect: {{Jogador[playerid][jNivel] = 1;}}",
    [[/enum\s+E_JOGADOR/, "Crie {{enum E_JOGADOR}}."], [/jNivel[\s\S]*jDinheiro|jDinheiro[\s\S]*jNivel/, "O enum precisa de {{jNivel}} e {{jDinheiro}}."], [/new\s+Jogador\s*\[\s*MAX_PLAYERS\s*\]\s*\[\s*E_JOGADOR\s*\]/, "Faltou {{new Jogador[MAX_PLAYERS][E_JOGADOR];}}."],
      [/Jogador\s*\[\s*playerid\s*\]\s*\[\s*jNivel\s*\]\s*=\s*1\s*;/, "No OnPlayerConnect: {{Jogador[playerid][jNivel] = 1;}}"]],
    `enum E_JOGADOR\n{\n    jNivel,\n    jDinheiro\n}\nnew Jogador[MAX_PLAYERS][E_JOGADOR];\n\npublic OnPlayerConnect(playerid)\n{\n    Jogador[playerid][jNivel] = 1;\n    return 1;\n}`);
  A("pawn-salvar", 2, "Escreva {{stock SalvarGrana(playerid, arq[])}} que salva o dinheiro do jogador com {{DOF2_SetInt}} na chave **\"Dinheiro\"** e depois chama {{DOF2_SaveFile()}}.",
    "{{DOF2_SetInt(arq, \"Dinheiro\", GetPlayerMoney(playerid));}}",
    [[/stock\s+SalvarGrana\s*\(\s*playerid\s*,\s*arq\s*\[\s*\]\s*\)/, "Crie {{stock SalvarGrana(playerid, arq[])}}."], [/DOF2_SetInt\s*\(\s*arq\s*,\s*"Dinheiro"\s*,\s*GetPlayerMoney\s*\(\s*playerid\s*\)\s*\)/, "Use {{DOF2_SetInt(arq, \"Dinheiro\", GetPlayerMoney(playerid));}}."], [/DOF2_SaveFile\s*\(\s*\)/, "Faltou {{DOF2_SaveFile();}}."]],
    `stock SalvarGrana(playerid, arq[])\n{\n    DOF2_SetInt(arq, "Dinheiro", GetPlayerMoney(playerid));\n    DOF2_SaveFile();\n}`);
  A("pawn-veiculos", 2, "Crie o comando **/infernus** que pega a posição do jogador, cria o carro **411** ali e coloca o jogador dentro.",
    "{{GetPlayerPos}} → {{new carro = CreateVehicle(411, x, y, z, 0.0, 0, 0, -1);}} → {{PutPlayerInVehicle(playerid, carro, 0);}}",
    [[/CMD\s*:\s*infernus/i, "Crie o {{CMD:infernus}}."], [/GetPlayerPos\s*\(\s*playerid/, "Pegue a posição com {{GetPlayerPos}}."], [/CreateVehicle\s*\(\s*411/, "Crie com {{CreateVehicle(411, ...)}}."], [/PutPlayerInVehicle\s*\(\s*playerid/, "Coloque dentro com {{PutPlayerInVehicle}}."]],
    `CMD:infernus(playerid, params[])\n{\n    new Float:x, Float:y, Float:z;\n    GetPlayerPos(playerid, x, y, z);\n    new carro = CreateVehicle(411, x, y, z, 0.0, 0, 0, -1);\n    PutPlayerInVehicle(playerid, carro, 0);\n    return 1;\n}`);
  A("pawn-admin", 2, "Crie o comando **/aviso** que só funciona pra admin: se {{Jogador[playerid][jAdmin]}} for **menor que 1**, mande **\"Sem permissão.\"** e pare. Se for admin, mande um aviso pra todos.",
    "Primeiro a checagem: {{if (Jogador[playerid][jAdmin] < 1) return SendClientMessage(playerid, -1, \"Sem permissão.\");}}",
    [[/CMD\s*:\s*aviso/i, "Crie o {{CMD:aviso}}."], [/Jogador\s*\[\s*playerid\s*\]\s*\[\s*jAdmin\s*\]\s*(<\s*1|>=\s*1|==\s*0)/, "Confira o nível: {{Jogador[playerid][jAdmin] < 1}}."], [/Sem permiss/i, "Avise {{\"Sem permissão.\"}} quem não é admin."], [/SendClientMessageToAll\s*\(/, "Mande o aviso pra todos com {{SendClientMessageToAll}}."]],
    `CMD:aviso(playerid, params[])\n{\n    if (Jogador[playerid][jAdmin] < 1) return SendClientMessage(playerid, -1, "Sem permissão.");\n    SendClientMessageToAll(0xFF4444FF, "[AVISO] O servidor vai reiniciar em 5 minutos.");\n    return 1;\n}`);
  A("pawn-teclas", 1, "Crie o comando **/lspd** que teleporta o jogador pra **1544.0, -1675.0, 13.5** e coloca ele no **interior 0**.",
    "{{SetPlayerPos(playerid, 1544.0, -1675.0, 13.5);}} e {{SetPlayerInterior(playerid, 0);}}",
    [[/CMD\s*:\s*lspd/i, "Crie o {{CMD:lspd}}."], [/SetPlayerPos\s*\(\s*playerid\s*,\s*1544(\.0)?\s*,\s*-1675(\.0)?\s*,\s*13\.5\s*\)/, "Use {{SetPlayerPos(playerid, 1544.0, -1675.0, 13.5);}}."], [/SetPlayerInterior\s*\(\s*playerid\s*,\s*0\s*\)/, "Faltou {{SetPlayerInterior(playerid, 0);}}."]],
    `CMD:lspd(playerid, params[])\n{\n    SetPlayerPos(playerid, 1544.0, -1675.0, 13.5);\n    SetPlayerInterior(playerid, 0);\n    return 1;\n}`);
  A("pawn-projeto", 3, "Parte do login: crie {{#define DIALOG_LOGIN 1}}, mostre um dialog de **senha** ({{DIALOG_STYLE_PASSWORD}}) no {{OnPlayerConnect}}, e no {{OnDialogResponse}} dê **Kick** se o jogador apertar o botão de sair ({{!response}}).",
    "No OnDialogResponse: {{if (dialogid == DIALOG_LOGIN) { if (!response) return Kick(playerid); ... }}}",
    [[/#define\s+DIALOG_LOGIN\s+1/, "Faltou {{#define DIALOG_LOGIN 1}}."], [/ShowPlayerDialog\s*\([^;]*DIALOG_STYLE_PASSWORD/, "Mostre com {{DIALOG_STYLE_PASSWORD}}."], [/public\s+OnDialogResponse\s*\(/, "Faltou o {{public OnDialogResponse(...)}}."], [/Kick\s*\(\s*playerid\s*\)/, "Dê {{Kick(playerid)}} quando não responder."]],
    `#define DIALOG_LOGIN 1\n\npublic OnPlayerConnect(playerid)\n{\n    ShowPlayerDialog(playerid, DIALOG_LOGIN, DIALOG_STYLE_PASSWORD, "Login", "Digite sua senha:", "Entrar", "Sair");\n    return 1;\n}\n\npublic OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])\n{\n    if (dialogid == DIALOG_LOGIN)\n    {\n        if (!response) return Kick(playerid);\n        SendClientMessage(playerid, -1, "Senha recebida!");\n        return 1;\n    }\n    return 0;\n}`);
  A("pawn-origem", 2, "Escreva um comando com **zcmd** que usa o **sscanf** (plugin) pra ler um id ({{\"u\"}}) e chama uma função **sua** chamada {{Saudar(alvo)}}. Inclua o {{zcmd}} e o {{sscanf2}}.",
    "Crie {{stock Saudar(alvo)}} antes do comando. No comando: {{if (sscanf(params, \"u\", alvo)) return ...;}}",
    [[/#include\s*<zcmd>/, "Inclua {{#include <zcmd>}}."], [/#include\s*<sscanf2>/, "Inclua {{#include <sscanf2>}}."], [/stock\s+Saudar\s*\(\s*\w+\s*\)/, "Crie a função sua: {{stock Saudar(alvo)}}."], [/sscanf\s*\(\s*params\s*,\s*"u"/, "Leia o id com {{sscanf(params, \"u\", alvo)}}."], [/Saudar\s*\(\s*alvo\s*\)\s*;/, "Chame {{Saudar(alvo);}} no comando."]],
    `#include <a_samp>\n#include <zcmd>\n#include <sscanf2>\n\nstock Saudar(alvo)\n{\n    SendClientMessage(alvo, -1, "Alguém te mandou um oi!");\n}\n\nCMD:oi(playerid, params[])\n{\n    new alvo;\n    if (sscanf(params, "u", alvo)) return SendClientMessage(playerid, -1, "Use: /oi [id]");\n    if (!IsPlayerConnected(alvo)) return SendClientMessage(playerid, -1, "Jogador offline.");\n    Saudar(alvo);\n    return 1;\n}`);
  A("pawn-textdraw", 2, "Crie um **TextDraw global** chamado {{Logo}} com o texto **\"MEU SERVIDOR\"** no {{OnGameModeInit}}, e mostre ele pro jogador no {{OnPlayerSpawn}}.",
    "{{new Text:Logo;}} lá em cima, {{Logo = TextDrawCreate(500.0, 5.0, \"MEU SERVIDOR\");}} e {{TextDrawShowForPlayer(playerid, Logo);}}",
    [[/new\s+Text\s*:\s*Logo/, "Crie {{new Text:Logo;}} (com a tag Text:)."], [/Logo\s*=\s*TextDrawCreate\s*\(/, "Crie com {{Logo = TextDrawCreate(...)}}."], [/TextDrawShowForPlayer\s*\(\s*playerid\s*,\s*Logo\s*\)/, "Mostre com {{TextDrawShowForPlayer(playerid, Logo);}}."]],
    `new Text:Logo;\n\npublic OnGameModeInit()\n{\n    Logo = TextDrawCreate(500.0, 5.0, "MEU SERVIDOR");\n    return 1;\n}\n\npublic OnPlayerSpawn(playerid)\n{\n    TextDrawShowForPlayer(playerid, Logo);\n    return 1;\n}`);
  A("pawn-level", 3, "Escreva {{stock DarXP(playerid, qtd)}} que **soma** o XP e, **se** {{jXP}} chegar em {{jNivel * 100}}, sobe o nível e tira do XP o que foi gasto.",
    "Soma: {{Jogador[playerid][jXP] += qtd;}}. Depois: {{if (Jogador[playerid][jXP] >= Jogador[playerid][jNivel] * 100) { ... jNivel++ ... }}}",
    [[/stock\s+DarXP\s*\(\s*playerid\s*,\s*qtd\s*\)/, "Crie {{stock DarXP(playerid, qtd)}}."], [/\[\s*jXP\s*\]\s*\+=\s*qtd/, "Some o XP: {{Jogador[playerid][jXP] += qtd;}}."], [/(if|while)\s*\([^)]*jXP[^)]*>=[^)]*jNivel[^)]*\*\s*100/, "Compare: {{jXP >= jNivel * 100}}."], [/\[\s*jNivel\s*\]\s*\+\+/, "Suba o nível com {{Jogador[playerid][jNivel]++;}}."]],
    `stock DarXP(playerid, qtd)\n{\n    Jogador[playerid][jXP] += qtd;\n    if (Jogador[playerid][jXP] >= Jogador[playerid][jNivel] * 100)\n    {\n        Jogador[playerid][jXP] -= Jogador[playerid][jNivel] * 100;\n        Jogador[playerid][jNivel]++;\n        SendClientMessage(playerid, -1, "Level up!");\n    }\n}`);
  A("pawn-inventario", 3, "Escreva {{stock TemItem(playerid, item)}} que passa pelos {{MAX_SLOTS}} e **retorna 1** se achar {{InvItem[playerid][s] == item}}, e **0** se não achar.",
    "Um {{for (new s = 0; s < MAX_SLOTS; s++)}} com um {{if}} dentro que dá {{return 1;}}. Depois do for, {{return 0;}}.",
    [[/stock\s+TemItem\s*\(\s*playerid\s*,\s*item\s*\)/, "Crie {{stock TemItem(playerid, item)}}."], [/for\s*\([^)]*MAX_SLOTS/, "Percorra os slots com um {{for}} até {{MAX_SLOTS}}."], [/InvItem\s*\[\s*playerid\s*\]\s*\[\s*\w+\s*\]\s*==\s*item/, "Compare {{InvItem[playerid][s] == item}}."], [/return\s+1\s*;[\s\S]*return\s+0\s*;/, "Retorne {{1}} quando achar e {{0}} no final."]],
    `stock TemItem(playerid, item)\n{\n    for (new s = 0; s < MAX_SLOTS; s++)\n    {\n        if (InvItem[playerid][s] == item) return 1;\n    }\n    return 0;\n}`);
  A("pawn-org", 3, "Faça o **rádio da org**: dentro de um {{for}} pelos jogadores, mande {{msg}} só pra quem está **conectado** e tem {{Jogador[i][jOrg] == org}}.",
    "Junte as duas condições com {{&&}}: {{if (IsPlayerConnected(i) && Jogador[i][jOrg] == org)}}",
    [[/for\s*\([^)]*MAX_PLAYERS/, "Use um {{for}} até {{MAX_PLAYERS}}."], [/IsPlayerConnected\s*\(\s*i\s*\)/, "Confira {{IsPlayerConnected(i)}}."], [/Jogador\s*\[\s*i\s*\]\s*\[\s*jOrg\s*\]\s*==\s*org/, "Compare {{Jogador[i][jOrg] == org}}."], [/SendClientMessage\s*\(\s*i\s*,[^;]*msg\s*\)\s*;/, "Mande pra {{i}}: {{SendClientMessage(i, -1, msg);}}"]],
    `for (new i = 0; i < MAX_PLAYERS; i++)\n{\n    if (IsPlayerConnected(i) && Jogador[i][jOrg] == org) SendClientMessage(i, -1, msg);\n}`);
  A("pawn-empregos", 2, "No {{OnPlayerEnterCheckpoint}}: **se** {{Jogador[playerid][jTrabalhando]}} for verdadeiro, desligue o checkpoint, pague **$500** e marque {{jTrabalhando = false}}.",
    "{{DisablePlayerCheckpoint(playerid);}}, {{GivePlayerMoney(playerid, 500);}} e {{Jogador[playerid][jTrabalhando] = false;}}",
    [[/public\s+OnPlayerEnterCheckpoint\s*\(\s*playerid\s*\)/, "Use {{public OnPlayerEnterCheckpoint(playerid)}}."], [/if\s*\(\s*Jogador\s*\[\s*playerid\s*\]\s*\[\s*jTrabalhando\s*\]/, "Confira {{if (Jogador[playerid][jTrabalhando])}}."], [/DisablePlayerCheckpoint\s*\(\s*playerid\s*\)/, "Desligue com {{DisablePlayerCheckpoint(playerid);}}."],
      [/GivePlayerMoney\s*\(\s*playerid\s*,\s*500\s*\)/, "Pague com {{GivePlayerMoney(playerid, 500);}}."], [/\[\s*jTrabalhando\s*\]\s*=\s*false/, "Marque {{jTrabalhando = false}}."]],
    `public OnPlayerEnterCheckpoint(playerid)\n{\n    if (Jogador[playerid][jTrabalhando])\n    {\n        DisablePlayerCheckpoint(playerid);\n        GivePlayerMoney(playerid, 500);\n        Jogador[playerid][jTrabalhando] = false;\n    }\n    return 1;\n}`);
  A("pawn-boas-praticas", 3, "Faça o comando **/pagar** do jeito certo: crie {{#define COR_ERRO 0xFF4444FF}}, leia id e valor com {{sscanf(params, \"ui\", ...)}}, confira {{IsPlayerConnected}}, recuse valor **menor que 1** ou **maior que o dinheiro** dele, e só então transfira.",
    "Valide em ordem e use {{return}} em cada erro. A transferência: {{GivePlayerMoney(playerid, -valor);}} e {{GivePlayerMoney(alvo, valor);}}",
    [[/#define\s+COR_ERRO\s+0x[0-9A-Fa-f]{8}/, "Crie {{#define COR_ERRO 0xFF4444FF}}."], [/sscanf\s*\(\s*params\s*,\s*"ui"/, "Leia com {{sscanf(params, \"ui\", alvo, valor)}}."], [/IsPlayerConnected\s*\(\s*alvo\s*\)/, "Confira {{IsPlayerConnected(alvo)}}."],
      [/valor\s*<\s*1|valor\s*<=\s*0/, "Recuse {{valor < 1}}."], [/valor\s*>\s*GetPlayerMoney\s*\(\s*playerid\s*\)/, "Recuse {{valor > GetPlayerMoney(playerid)}}."], [/GivePlayerMoney\s*\(\s*alvo\s*,\s*valor\s*\)/, "Transfira com {{GivePlayerMoney(alvo, valor);}}."]],
    `#define COR_ERRO 0xFF4444FF\n\nCMD:pagar(playerid, params[])\n{\n    new alvo, valor;\n    if (sscanf(params, "ui", alvo, valor)) return SendClientMessage(playerid, COR_ERRO, "Use: /pagar [id] [valor]");\n    if (!IsPlayerConnected(alvo) || alvo == playerid) return SendClientMessage(playerid, COR_ERRO, "Jogador inválido.");\n    if (valor < 1 || valor > GetPlayerMoney(playerid)) return SendClientMessage(playerid, COR_ERRO, "Valor inválido.");\n    GivePlayerMoney(playerid, -valor);\n    GivePlayerMoney(alvo, valor);\n    return 1;\n}`);
  A("pawn-modulos", 2, "No arquivo principal, inclua os módulos {{\"modulos/contas.pwn\"}} e {{\"modulos/level.pwn\"}} (com **aspas**), e no {{OnPlayerConnect}} chame {{Contas_AoConectar(playerid)}} e {{Level_AoConectar(playerid)}}.",
    "Include com aspas: {{#include \"modulos/contas.pwn\"}}. Depois um OnPlayerConnect só, chamando as duas funções.",
    [[/#include\s*"modulos\/contas\.pwn"/, "Inclua {{#include \"modulos/contas.pwn\"}}."], [/#include\s*"modulos\/level\.pwn"/, "Inclua {{#include \"modulos/level.pwn\"}}."], [/Contas_AoConectar\s*\(\s*playerid\s*\)\s*;/, "Chame {{Contas_AoConectar(playerid);}}."], [/Level_AoConectar\s*\(\s*playerid\s*\)\s*;/, "Chame {{Level_AoConectar(playerid);}}."]],
    `#include <a_samp>\n#include "modulos/contas.pwn"\n#include "modulos/level.pwn"\n\npublic OnPlayerConnect(playerid)\n{\n    Contas_AoConectar(playerid);\n    Level_AoConectar(playerid);\n    return 1;\n}`);
  A("pawn-bugs", 2, "Crie o comando **/teste** com um {{printf}} de debug **no começo** mostrando o {{playerid}} (use {{%d}}), e garanta que ele termina com {{return 1;}} (senão aparece \"Unknown command\").",
    "{{printf(\"[DEBUG] /teste chamado por %d\", playerid);}}",
    [[/CMD\s*:\s*teste/i, "Crie o {{CMD:teste}}."], [/printf\s*\(\s*"[^"]*%d[^"]*"\s*,\s*playerid\s*\)/, "Use {{printf(\"... %d\", playerid);}}."], [/return\s+1\s*;/, "Termine com {{return 1;}}."]],
    `CMD:teste(playerid, params[])\n{\n    printf("[DEBUG] /teste chamado por %d", playerid);\n    SendClientMessage(playerid, -1, "Teste ok!");\n    return 1;\n}`);

  /* ======================= PYTHON ======================= */
  A("py-intro", 1, "Escreva seu primeiro programa: mostre **Olá, mundo!** na tela.", "É só {{print(\"Olá, mundo!\")}}.",
    [[/print\s*\(\s*["'][^"']*mundo[^"']*["']\s*\)/i, "Use {{print(\"Olá, mundo!\")}}."]], `print("Olá, mundo!")`);
  A("py-print", 1, "Com **um print só**, mostre seu nome e sua idade separados por vírgula, tipo: {{print(\"Nome:\", \"Ana\", \"Idade:\", 15)}}.",
    "O print aceita várias coisas separadas por vírgula, e coloca um espaço entre elas.",
    [[/print\s*\([^)\n]*,[^)\n]*,[^)\n]*\)/, "Use um print com pelo menos 3 coisas separadas por vírgula."]], `print("Nome:", "Ana", "Idade:", 15)`);
  A("py-variaveis", 1, "Crie 3 variáveis: {{nome}} (texto), {{idade}} (número inteiro) e {{altura}} (número com ponto, tipo 1.75). Depois mostre as três com print.",
    "Texto vai entre aspas; número com vírgula em Python usa **ponto**: {{altura = 1.75}}",
    [[/nome\s*=\s*["']/, "Crie {{nome = \"...\"}} (com aspas)."], [/idade\s*=\s*\d+\s*$/m, "Crie {{idade = 15}} (número sem aspas)."], [/altura\s*=\s*\d+\.\d+/, "Crie {{altura = 1.75}} (com ponto)."], [/print\s*\(/, "Mostre com {{print}}."]],
    `nome = "Ana"\nidade = 15\naltura = 1.62\nprint(nome, idade, altura)`);
  A("py-tipos", 1, "Converta o texto {{\"42\"}} pra número com {{int()}}, some **8** e mostre o resultado (50). Depois mostre o **tipo** do resultado com {{type()}}.",
    "{{total = int(\"42\") + 8}} e {{print(type(total))}}",
    [[/int\s*\(\s*["']42["']\s*\)/, "Converta com {{int(\"42\")}}."], [/\+\s*8/, "Some {{+ 8}}."], [/type\s*\(/, "Mostre o tipo com {{type(...)}}."]],
    `total = int("42") + 8\nprint(total)\nprint(type(total))`);
  A("py-input", 1, "Pergunte o **nome** da pessoa com {{input}} e responda **\"Prazer, NOME!\"** usando **f-string**.",
    "{{nome = input(\"Seu nome: \")}} e {{print(f\"Prazer, {nome}!\")}}",
    [[/input\s*\(/, "Pergunte com {{input(...)}}."], [/f["'][^"']*\{\s*\w+\s*\}[^"']*["']/, "Use f-string: {{f\"Prazer, {nome}!\"}}."], [/print\s*\(/, "Mostre com {{print}}."]],
    `nome = input("Seu nome: ")\nprint(f"Prazer, {nome}!")`);
  A("py-operadores", 1, "Calcule a **média** das notas 7, 8.5 e 10 e mostre arredondada com 1 casa usando {{round(media, 1)}}.",
    "Parênteses primeiro: {{media = (7 + 8.5 + 10) / 3}}",
    [[/\(\s*7\s*\+\s*8\.5\s*\+\s*10\s*\)\s*\/\s*3/, "Some as 3 notas **entre parênteses** e divida por 3."], [/round\s*\([^)]*,\s*1\s*\)/, "Arredonde com {{round(media, 1)}}."]],
    `media = (7 + 8.5 + 10) / 3\nprint(round(media, 1))`);
  A("py-if", 1, "Pergunte a **idade** (convertendo com {{int(input(...))}}). Se for **18 ou mais**, mostre **\"Pode dirigir\"**; senão, **\"Ainda não\"**.",
    "{{if idade >= 18:}} e embaixo, com 4 espaços, o print. Depois {{else:}}.",
    [[/int\s*\(\s*input\s*\(/, "Converta: {{int(input(\"Idade: \"))}}."], [/if\s+\w+\s*>=\s*18\s*:/, "Use {{if idade >= 18:}}."], [/else\s*:/, "Faltou o {{else:}}."]],
    `idade = int(input("Idade: "))\nif idade >= 18:\n    print("Pode dirigir")\nelse:\n    print("Ainda não")`);
  A("py-for", 1, "Use {{for}} com {{range}} pra mostrar a **tabuada do 5**: de {{5 x 1 = 5}} até {{5 x 10 = 50}}.",
    "{{for i in range(1, 11):}} e dentro {{print(f\"5 x {i} = {5 * i}\")}}",
    [[/for\s+\w+\s+in\s+range\s*\(\s*1\s*,\s*11\s*\)\s*:/, "Use {{for i in range(1, 11):}} (o 11 não entra)."], [/5\s*\*\s*\w+|\w+\s*\*\s*5/, "Multiplique por 5."]],
    `for i in range(1, 11):\n    print(f"5 x {i} = {5 * i}")`);
  A("py-while", 1, "Faça uma **contagem regressiva** de 10 até 1 com {{while}} e, no final, mostre **\"Fogo!\"**.",
    "{{n = 10}}, {{while n >= 1:}} → print e {{n -= 1}}. O \"Fogo!\" vem **depois** do while (sem recuo).",
    [[/while\s+\w+\s*(>=\s*1|>\s*0)\s*:/, "Use {{while n >= 1:}}."], [/-=\s*1/, "Diminua com {{n -= 1}} (senão nunca para!)."], [/Fogo/i, "Mostre {{\"Fogo!\"}} no final."]],
    `n = 10\nwhile n >= 1:\n    print(n)\n    n -= 1\nprint("Fogo!")`);
  A("py-listas", 1, "Crie a lista {{frutas}} com 3 frutas, adicione **\"uva\"** com {{append}} e mostre quantas tem com {{len}}.",
    "{{frutas.append(\"uva\")}} e {{print(len(frutas))}}",
    [[/frutas\s*=\s*\[/, "Crie {{frutas = [...]}}."], [/frutas\.append\s*\(\s*["']uva["']\s*\)/, "Adicione com {{frutas.append(\"uva\")}}."], [/len\s*\(\s*frutas\s*\)/, "Conte com {{len(frutas)}}."]],
    `frutas = ["maçã", "banana", "manga"]\nfrutas.append("uva")\nprint(len(frutas))`);
  A("py-dicionarios", 2, "Crie o dicionário {{jogador}} com as chaves **\"nome\"** e **\"nivel\"**. Aumente o nível em 1 e mostre o nome e o nível.",
    "{{jogador[\"nivel\"] += 1}}",
    [[/jogador\s*=\s*\{/, "Crie {{jogador = {...}}}."], [/["']nome["']\s*:/, "Precisa da chave {{\"nome\"}}."], [/jogador\s*\[\s*["']nivel["']\s*\]\s*\+=\s*1/, "Aumente com {{jogador[\"nivel\"] += 1}}."], [/print\s*\(/, "Mostre com print."]],
    `jogador = {"nome": "Cesar", "nivel": 1}\njogador["nivel"] += 1\nprint(jogador["nome"], jogador["nivel"])`);
  A("py-strings", 1, "Com {{nome = \"  wc dev  \"}}, tire os espaços das pontas com {{strip()}}, deixe **MAIÚSCULO** com {{upper()}} e mostre.",
    "Dá pra encadear: {{nome.strip().upper()}}",
    [[/\.strip\s*\(\s*\)/, "Use {{.strip()}}."], [/\.upper\s*\(\s*\)/, "Use {{.upper()}}."], [/print\s*\(/, "Mostre com print."]],
    `nome = "  wc dev  "\nprint(nome.strip().upper())`);
  A("py-funcoes", 1, "Crie a função {{dobro(n)}} que **retorna** {{n * 2}}, e mostre {{dobro(21)}}.",
    "{{def dobro(n):}} e embaixo {{return n * 2}}",
    [[/def\s+dobro\s*\(\s*n\s*\)\s*:/, "Crie {{def dobro(n):}}."], [/return\s+n\s*\*\s*2/, "Retorne {{return n * 2}}."], [/print\s*\(\s*dobro\s*\(\s*21\s*\)\s*\)/, "Mostre {{print(dobro(21))}}."]],
    `def dobro(n):\n    return n * 2\n\nprint(dobro(21))`);
  A("py-erros", 2, "Leia um número com {{int(input(...))}} **dentro de um try**. Se a pessoa digitar letra ({{ValueError}}), mostre **\"Isso não é número\"**.",
    "{{try:}} → a leitura; {{except ValueError:}} → a mensagem.",
    [[/try\s*:/, "Faltou o {{try:}}."], [/int\s*\(\s*input\s*\(/, "Leia com {{int(input(...))}}."], [/except\s+ValueError\s*:/, "Use {{except ValueError:}}."]],
    `try:\n    n = int(input("Número: "))\n    print("Você digitou", n)\nexcept ValueError:\n    print("Isso não é número")`);
  A("py-modulos", 1, "Importe o {{random}} e mostre um número sorteado de **1 a 6** (um dado) com {{randint}}.",
    "{{import random}} e {{random.randint(1, 6)}}",
    [[/import\s+random|from\s+random\s+import/, "Faltou {{import random}}."], [/randint\s*\(\s*1\s*,\s*6\s*\)/, "Sorteie com {{randint(1, 6)}}."]],
    `import random\n\nprint("Dado:", random.randint(1, 6))`);
  A("py-classes", 2, "Crie a classe {{Cachorro}} com {{__init__(self, nome)}} e um método {{latir}} que mostra **\"NOME: Au au!\"**. Crie um cachorro e chame {{latir()}}.",
    "Dentro do latir: {{print(f\"{self.nome}: Au au!\")}}. Depois: {{rex = Cachorro(\"Rex\")}} e {{rex.latir()}}",
    [[/class\s+Cachorro/, "Crie {{class Cachorro:}}."], [/def\s+__init__\s*\(\s*self\s*,\s*nome\s*\)/, "Crie {{def __init__(self, nome):}}."], [/def\s+latir\s*\(\s*self\s*\)/, "Crie {{def latir(self):}}."], [/\.latir\s*\(\s*\)/, "Chame {{.latir()}} num objeto."]],
    `class Cachorro:\n    def __init__(self, nome):\n        self.nome = nome\n\n    def latir(self):\n        print(f"{self.nome}: Au au!")\n\n\nrex = Cachorro("Rex")\nrex.latir()`);
  A("py-arquivos", 2, "Salve **\"Olá arquivo\"** em {{notas.txt}} usando {{with open(..., \"w\")}}, depois abra de novo pra **ler** e mostre o conteúdo.",
    "Escrever: {{with open(\"notas.txt\", \"w\", encoding=\"utf-8\") as f: f.write(...)}}. Ler: modo {{\"r\"}} e {{f.read()}}.",
    [[/with\s+open\s*\(\s*["']notas\.txt["']\s*,\s*["']w["']/, "Abra pra escrever: {{open(\"notas.txt\", \"w\")}}."], [/\.write\s*\(/, "Escreva com {{.write(...)}}."], [/\.read\s*\(\s*\)/, "Leia com {{.read()}}."]],
    `with open("notas.txt", "w", encoding="utf-8") as f:\n    f.write("Olá arquivo")\n\nwith open("notas.txt", "r", encoding="utf-8") as f:\n    print(f.read())`);
  A("py-projeto", 2, "Mini jogo: sorteie um número de **1 a 10**, peça um palpite e diga **\"Acertou!\"** ou **\"Errou, era X\"**.",
    "{{secreto = random.randint(1, 10)}}, {{palpite = int(input(...))}} e {{if palpite == secreto:}}",
    [[/randint\s*\(\s*1\s*,\s*10\s*\)/, "Sorteie com {{random.randint(1, 10)}}."], [/int\s*\(\s*input\s*\(/, "Leia o palpite com {{int(input(...))}}."], [/if\s+[^:\n]*==[^:\n]*:/, "Compare com {{==}} num {{if}}."]],
    `import random\n\nsecreto = random.randint(1, 10)\npalpite = int(input("Seu palpite: "))\nif palpite == secreto:\n    print("Acertou!")\nelse:\n    print(f"Errou, era {secreto}")`);
  A("py-debug", 1, "Este código quebra: {{idade = input(\"Idade: \")}} e {{print(idade + 1)}} (TypeError). **Conserte** pra mostrar a idade + 1.",
    "O input devolve **texto**. Converta: {{int(input(\"Idade: \"))}}",
    [[/int\s*\(\s*input\s*\(/, "Converta a idade com {{int(input(...))}}."], [/\+\s*1/, "Some {{+ 1}}."]],
    `idade = int(input("Idade: "))\nprint(idade + 1)`);
  A("py-poo", 3, "Crie a classe {{Animal}} com o método {{falar()}} que mostra **\"...\"**, e a classe {{Gato(Animal)}} que **reescreve** {{falar()}} mostrando **\"Miau\"**. Chame {{Gato().falar()}}.",
    "{{class Gato(Animal):}} herda. Reescrever é criar outro {{def falar(self):}} dentro do Gato.",
    [[/class\s+Animal/, "Crie {{class Animal:}}."], [/class\s+Gato\s*\(\s*Animal\s*\)/, "Crie {{class Gato(Animal):}}."], [/def\s+falar\s*\(\s*self\s*\)[\s\S]*def\s+falar\s*\(\s*self\s*\)/, "As **duas** classes precisam de {{def falar(self):}}."], [/Miau/, "O gato mostra {{\"Miau\"}}."]],
    `class Animal:\n    def falar(self):\n        print("...")\n\n\nclass Gato(Animal):\n    def falar(self):\n        print("Miau")\n\n\nGato().falar()`);

  /* ======================= HTML ======================= */
  A("html-intro", 1, "Escreva um título {{<h1>}} **\"Meu site\"** e um parágrafo {{<p>}} embaixo.", "Toda tag abre e fecha: {{<h1>Meu site</h1>}}",
    [[/<h1>[^<]+<\/h1>/i, "Faltou o {{<h1>...</h1>}}."], [/<p>[^<]+<\/p>/i, "Faltou o {{<p>...</p>}}."]], `<h1>Meu site</h1>\n<p>Bem-vindo ao meu primeiro site!</p>`);
  A("html-estrutura", 1, "Monte a **estrutura completa**: {{<!DOCTYPE html>}}, {{<html lang=\"pt-BR\">}}, {{<head>}} com {{<meta charset=\"UTF-8\">}} e {{<title>}}, e o {{<body>}}.",
    "Digite **html** no editor e aperte **Tab** pra ver o modelo, depois tente escrever sozinho!",
    [[/<!DOCTYPE html>/i, "Faltou {{<!DOCTYPE html>}}."], [/<html[^>]*lang=/i, "Faltou {{<html lang=\"pt-BR\">}}."], [/<meta[^>]*charset=/i, "Faltou {{<meta charset=\"UTF-8\">}}."], [/<title>[^<]+<\/title>/i, "Faltou o {{<title>}}."], [/<body>[\s\S]*<\/body>/i, "Faltou o {{<body>...</body>}}."]],
    `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n    <meta charset="UTF-8">\n    <title>Minha página</title>\n</head>\n<body>\n    <h1>Olá!</h1>\n</body>\n</html>`);
  A("html-textos", 1, "Crie um {{<h1>}}, um {{<h2>}} e um parágrafo com uma palavra em **negrito** usando {{<strong>}}.", "{{<p>Isso é <strong>importante</strong>.</p>}}",
    [[/<h1>/i, "Faltou o {{<h1>}}."], [/<h2>/i, "Faltou o {{<h2>}}."], [/<p>[\s\S]*<strong>[^<]+<\/strong>[\s\S]*<\/p>/i, "Coloque um {{<strong>}} dentro do {{<p>}}."]],
    `<h1>Receitas</h1>\n<h2>Bolo de cenoura</h2>\n<p>Use cenouras <strong>bem frescas</strong>.</p>`);
  A("html-links", 1, "Faça um link pro Google ({{https://www.google.com}}) que abre em **nova aba**.", "O atributo da nova aba é {{target=\"_blank\"}}.",
    [[/<a[^>]*href=["']https:\/\/www\.google\.com\/?["']/i, "Use {{href=\"https://www.google.com\"}}."], [/<a[^>]*target=["']_blank["']/i, "Faltou {{target=\"_blank\"}}."], [/<\/a>/i, "Feche com {{</a>}}."]],
    `<a href="https://www.google.com" target="_blank">Abrir o Google</a>`);
  A("html-imagens", 1, "Coloque a imagem {{foto.jpg}} com um {{alt}} descrevendo a foto e {{width=\"300\"}}.", "{{<img src=\"foto.jpg\" alt=\"...\" width=\"300\">}} (img não fecha)",
    [[/<img[^>]*src=["']foto\.jpg["']/i, "Use {{src=\"foto.jpg\"}}."], [/<img[^>]*alt=["'][^"']+["']/i, "Descreva a imagem no {{alt}}."], [/<img[^>]*width=["']?300/i, "Faltou {{width=\"300\"}}."]],
    `<img src="foto.jpg" alt="Eu na praia ao pôr do sol" width="300">`);
  A("html-listas", 1, "Faça uma **lista numerada** ({{<ol>}}) com **3 passos** de uma receita.", "{{<ol>}} com três {{<li>}} dentro.",
    [[/<ol>/i, "Use {{<ol>}} (lista numerada)."], [/(<li>[\s\S]*){3}/i, "Precisa de 3 {{<li>}}."], [/<\/ol>/i, "Feche com {{</ol>}}."]],
    `<ol>\n    <li>Misture os ingredientes</li>\n    <li>Coloque na forma</li>\n    <li>Asse por 40 minutos</li>\n</ol>`);
  A("html-tabelas", 2, "Crie uma tabela com o cabeçalho **Nome** e **Nível** (em {{<th>}}) e **uma linha** de dados (em {{<td>}}).", "Cada linha é um {{<tr>}}: uma com dois {{<th>}}, outra com dois {{<td>}}.",
    [[/<table/i, "Faltou {{<table>}}."], [/<th>\s*Nome\s*<\/th>/i, "Cabeçalho {{<th>Nome</th>}}."], [/<th>\s*N[ií]vel\s*<\/th>/i, "Cabeçalho {{<th>Nível</th>}}."], [/<td>/i, "Faltou a linha com {{<td>}}."]],
    `<table>\n    <tr><th>Nome</th><th>Nível</th></tr>\n    <tr><td>Cesar</td><td>10</td></tr>\n</table>`);
  A("html-form", 2, "Crie um formulário com um {{<label>}}, um campo de **e-mail obrigatório** ({{type=\"email\"}} e {{required}}) e um botão **Enviar**.", "{{<input type=\"email\" required>}} e {{<button type=\"submit\">Enviar</button>}}",
    [[/<form/i, "Faltou {{<form>}}."], [/<label/i, "Faltou um {{<label>}}."], [/<input[^>]*type=["']email["']/i, "Use {{type=\"email\"}}."], [/<input[^>]*required/i, "Faltou o {{required}}."], [/<button[^>]*>[^<]*Enviar/i, "Faltou o botão Enviar."]],
    `<form>\n    <label for="email">E-mail</label>\n    <input id="email" type="email" required>\n    <button type="submit">Enviar</button>\n</form>`);
  A("html-div", 1, "Crie uma {{<div>}} com {{class=\"card\"}} e {{id=\"principal\"}}, com um {{<span>}} dentro.", "{{<div class=\"card\" id=\"principal\"><span>oi</span></div>}}",
    [[/<div[^>]*class=["'][^"']*card/i, "Faltou {{class=\"card\"}} na div."], [/<div[^>]*id=["']principal["']/i, "Faltou {{id=\"principal\"}} na div."], [/<span>[^<]*<\/span>/i, "Coloque um {{<span>}} dentro."]],
    `<div class="card" id="principal">\n    <span>Novo!</span> Card de exemplo\n</div>`);
  A("html-semantico", 2, "Monte a página com as tags semânticas: {{<header>}}, {{<nav>}}, {{<main>}} e {{<footer>}}.", "O {{<nav>}} costuma ficar dentro do {{<header>}}.",
    [[/<header/i, "Faltou {{<header>}}."], [/<nav/i, "Faltou {{<nav>}}."], [/<main/i, "Faltou {{<main>}}."], [/<footer/i, "Faltou {{<footer>}}."]],
    `<header>\n    <nav><a href="#">Início</a> <a href="#sobre">Sobre</a></nav>\n</header>\n<main>\n    <h1>Bem-vindo</h1>\n</main>\n<footer>© 2026 Meu site</footer>`);
  A("html-projeto", 2, "Página de perfil: um {{<h1>}} com seu nome, uma {{<img>}} com {{alt}}, uma lista {{<ul>}} com **3 hobbies** e um **link** de contato.", "Junte tudo que você aprendeu: h1, img, ul/li e a.",
    [[/<h1>/i, "Faltou o {{<h1>}} com seu nome."], [/<img[^>]*alt=["'][^"']+["']/i, "Faltou a {{<img>}} com {{alt}}."], [/<ul>[\s\S]*(<li>[\s\S]*){3}<\/ul>/i, "Faltou a {{<ul>}} com 3 {{<li>}}."], [/<a[^>]*href=/i, "Faltou o link de contato."]],
    `<h1>Cesar</h1>\n<img src="eu.jpg" alt="Foto do Cesar sorrindo" width="150">\n<ul>\n    <li>Programar</li>\n    <li>Jogar GTA</li>\n    <li>Música</li>\n</ul>\n<a href="mailto:contato@exemplo.com">Fale comigo</a>`);
  A("html-acessibilidade", 2, "Faça um formulário **acessível**: um {{<label>}} ligado ao {{<input>}} pelo {{for}}/{{id}}, e um botão só com o ícone **✕** que tem {{aria-label}}.", "{{<label for=\"nome\">}} e {{<input id=\"nome\">}} com o **mesmo** nome. O botão: {{<button aria-label=\"Fechar\">✕</button>}}",
    [[/<label[^>]*for=["']([\w-]+)["'][\s\S]*id=["']\1["']/i, "Ligue o label ao input: o {{for}} do label igual ao {{id}} do input."], [/<button[^>]*aria-label=["'][^"']+["']/i, "Faltou o {{aria-label}} no botão."]],
    `<form>\n    <label for="nome">Seu nome</label>\n    <input id="nome" type="text">\n    <button type="button" aria-label="Fechar">✕</button>\n</form>`);
  A("html-css-js", 2, "No {{<head>}}, ligue o arquivo {{style.css}} e o {{script.js}} (com {{defer}}).", "{{<link rel=\"stylesheet\" href=\"style.css\">}} e {{<script src=\"script.js\" defer></script>}}",
    [[/<link[^>]*rel=["']stylesheet["']/i, "Faltou o {{<link rel=\"stylesheet\" ...>}}."], [/<link[^>]*href=["']style\.css["']/i, "O link aponta pra {{href=\"style.css\"}}."], [/<script[^>]*src=["']script\.js["'][^>]*defer|<script[^>]*defer[^>]*src=["']script\.js["']/i, "Faltou {{<script src=\"script.js\" defer>}}."]],
    `<head>\n    <meta charset="UTF-8">\n    <title>Site</title>\n    <link rel="stylesheet" href="style.css">\n    <script src="script.js" defer></script>\n</head>`);

  /* ======================= CSS ======================= */
  const css = (id, nivel, enunciado, dica, testes, solucao) => A(id, nivel, enunciado, dica, testes, solucao, { base: BASE_CSS });
  css("css-intro", 1, "Deixe o {{h1}} **azul** ({{#1e90ff}}) e o {{p}} **cinza** (qualquer cinza).", "{{h1 { color: #1e90ff; }}} — uma regra pra cada tag.",
    [[/h1\s*\{[^}]*color\s*:\s*#1e90ff/i, "Faltou {{color: #1e90ff}} no {{h1}}."], [/(^|\})\s*p\s*\{[^}]*color\s*:/i, "Faltou um {{color}} no {{p}}."]], `h1 {\n    color: #1e90ff;\n}\n\np {\n    color: #888;\n}`);
  css("css-seletores", 1, "Use 2 tipos de seletor: a **classe** {{.botao}} com fundo azul, e o link {{a}} mudando de cor no {{:hover}}.", "Classe começa com ponto: {{.botao}}. Hover: {{a:hover}}.",
    [[/\.botao\s*\{[^}]*background/i, "Faltou {{.botao { background: ... }}}."], [/a:hover\s*\{[^}]*color/i, "Faltou {{a:hover { color: ... }}}."]], `.botao {\n    background: #1e90ff;\n}\n\na:hover {\n    color: orange;\n}`);
  css("css-cores", 1, "Deixe o fundo do {{body}} escuro ({{#05070d}}) com texto claro, e o {{.card}} com um fundo **transparente** usando {{rgba(...)}}.", "{{rgba(30, 144, 255, 0.2)}}: o último número é a transparência (0 a 1).",
    [[/body\s*\{[^}]*background(-color)?\s*:\s*#05070d/i, "Faltou {{background: #05070d}} no {{body}}."], [/body\s*\{[^}]*(^|[;{\s])color\s*:/i, "Coloque um {{color}} claro no {{body}}."], [/\.card\s*\{[^}]*rgba\s*\(/i, "Use {{rgba(...)}} no {{.card}}."]],
    `body {\n    background: #05070d;\n    color: #dbe6ff;\n}\n\n.card {\n    background: rgba(30, 144, 255, 0.2);\n}`);
  css("css-texto", 1, "Deixe o {{h1}} com {{font-size: 32px}}, em **negrito** e **centralizado**.", "{{font-weight: bold;}} e {{text-align: center;}}",
    [[/font-size\s*:\s*32px/i, "Faltou {{font-size: 32px}}."], [/font-weight\s*:\s*(bold|700)/i, "Faltou {{font-weight: bold}}."], [/text-align\s*:\s*center/i, "Faltou {{text-align: center}}."]],
    `h1 {\n    font-size: 32px;\n    font-weight: bold;\n    text-align: center;\n}`);
  css("css-box", 2, "No {{.card}}: {{padding: 16px}}, {{margin: 20px}}, borda de **2px sólida azul** e cantos arredondados de **12px**.", "{{border: 2px solid #1e90ff;}} e {{border-radius: 12px;}}",
    [[/\.card\s*\{/i, "Crie a regra {{.card}}."], [/padding\s*:\s*16px/i, "Faltou {{padding: 16px}}."], [/margin\s*:\s*20px/i, "Faltou {{margin: 20px}}."], [/border\s*:\s*2px\s+solid/i, "Faltou {{border: 2px solid ...}}."], [/border-radius\s*:\s*12px/i, "Faltou {{border-radius: 12px}}."]],
    `.card {\n    padding: 16px;\n    margin: 20px;\n    border: 2px solid #1e90ff;\n    border-radius: 12px;\n}`);
  css("css-display", 2, "Prenda o {{.botao}} no **canto de baixo à direita** da tela, mesmo rolando a página: {{position: fixed}}, {{bottom: 20px}} e {{right: 20px}}.", "Com {{position: fixed}} o elemento fica preso na tela.",
    [[/position\s*:\s*fixed/i, "Faltou {{position: fixed}}."], [/bottom\s*:\s*20px/i, "Faltou {{bottom: 20px}}."], [/right\s*:\s*20px/i, "Faltou {{right: 20px}}."]],
    `.botao {\n    position: fixed;\n    bottom: 20px;\n    right: 20px;\n}`);
  css("css-flex", 2, "**Centralize** tudo do {{body}} no meio da tela com flexbox: {{display: flex}}, centro na horizontal, centro na vertical e {{min-height: 100vh}}.", "{{justify-content: center;}} (horizontal) e {{align-items: center;}} (vertical).",
    [[/display\s*:\s*flex/i, "Faltou {{display: flex}}."], [/justify-content\s*:\s*center/i, "Faltou {{justify-content: center}}."], [/align-items\s*:\s*center/i, "Faltou {{align-items: center}}."], [/min-height\s*:\s*100vh/i, "Faltou {{min-height: 100vh}}."]],
    `body {\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n    min-height: 100vh;\n}`);
  css("css-grid", 2, "Deixe o {{body}} em **grid de 3 colunas iguais** com espaço de {{10px}} entre elas.", "{{grid-template-columns: repeat(3, 1fr);}} e {{gap: 10px;}}",
    [[/display\s*:\s*grid/i, "Faltou {{display: grid}}."], [/grid-template-columns\s*:\s*(repeat\s*\(\s*3\s*,\s*1fr\s*\)|1fr\s+1fr\s+1fr)/i, "Use {{grid-template-columns: repeat(3, 1fr)}}."], [/gap\s*:\s*10px/i, "Faltou {{gap: 10px}}."]],
    `body {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 10px;\n}`);
  css("css-responsivo", 2, "Crie um {{@media (max-width: 600px)}} que deixa o {{h1}} com {{font-size: 20px}} no celular.", "O h1 fica **dentro** das chaves do @media.",
    [[/@media\s*\(\s*max-width\s*:\s*600px\s*\)\s*\{/i, "Faltou {{@media (max-width: 600px) {}}."], [/@media[^{]*\{[\s\S]*h1\s*\{[^}]*font-size\s*:\s*20px/i, "Dentro do @media: {{h1 { font-size: 20px; }}}."]],
    `h1 {\n    font-size: 40px;\n}\n\n@media (max-width: 600px) {\n    h1 {\n        font-size: 20px;\n    }\n}`);
  css("css-hover", 2, "Dê ao {{.botao}} uma {{transition}} de {{0.3s}} e, no {{.botao:hover}}, troque o {{background}}.", "A transition fica no **.botao** (não no hover).",
    [[/\.botao\s*\{[^}]*transition\s*:/i, "Coloque {{transition: 0.3s}} no {{.botao}}."], [/\.botao:hover\s*\{[^}]*background/i, "Troque o {{background}} no {{.botao:hover}}."]],
    `.botao {\n    background: #1e90ff;\n    transition: 0.3s;\n}\n\n.botao:hover {\n    background: #0b3d91;\n}`);
  css("css-animacao", 2, "Crie a animação {{@keyframes piscar}} (opacity de 1 pra 0) e aplique no {{h1}} durando {{1s}} e repetindo pra sempre ({{infinite}}).", "{{animation: piscar 1s infinite;}}",
    [[/@keyframes\s+piscar/i, "Crie {{@keyframes piscar}}."], [/opacity\s*:\s*0/i, "Use {{opacity}} indo até 0."], [/animation\s*:[^;]*piscar[^;]*infinite|animation\s*:[^;]*infinite[^;]*piscar/i, "Aplique: {{animation: piscar 1s infinite;}}."]],
    `@keyframes piscar {\n    from { opacity: 1; }\n    to { opacity: 0; }\n}\n\nh1 {\n    animation: piscar 1s infinite;\n}`);
  css("css-projeto", 3, "Monte o {{.card}} **azul e preto**: fundo escuro, texto claro, borda azul, cantos arredondados ({{border-radius}}) e uma sombra ({{box-shadow}}).", "Junte: {{background}}, {{color}}, {{border}}, {{border-radius}} e {{box-shadow}}.",
    [[/\.card\s*\{[^}]*background/i, "Faltou o {{background}}."], [/\.card\s*\{[^}]*(^|[;{\s])color\s*:/i, "Faltou o {{color}} do texto."], [/\.card\s*\{[^}]*border\s*:/i, "Faltou a {{border}}."], [/border-radius\s*:/i, "Faltou {{border-radius}}."], [/box-shadow\s*:/i, "Faltou {{box-shadow}}."]],
    `.card {\n    background: #0b0f1a;\n    color: #dbe6ff;\n    border: 1px solid #1e90ff;\n    border-radius: 12px;\n    box-shadow: 0 8px 24px rgba(30, 144, 255, 0.25);\n    padding: 16px;\n}`);
  css("css-problemas", 2, "Conserte a **rolagem pro lado**: coloque {{box-sizing: border-box}} em **todos** os elementos ({{*}}) e {{max-width: 100%}} na {{img}} (a imagem do exemplo tem 900px!).", "{{* { box-sizing: border-box; }}} e {{img { max-width: 100%; }}}",
    [[/\*\s*\{[^}]*box-sizing\s*:\s*border-box/i, "Faltou {{box-sizing: border-box}} no {{*}}."], [/img\s*\{[^}]*max-width\s*:\s*100%/i, "Faltou {{max-width: 100%}} na {{img}}."]],
    `* {\n    box-sizing: border-box;\n}\n\nimg {\n    max-width: 100%;\n    height: auto;\n}`);
})();
