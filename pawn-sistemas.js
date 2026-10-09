/* =========================================================
   WC DEV — PAWN: SISTEMAS DE SERVIDOR (nível avançado)
   Continuação da trilha de Pawn: sistemas reais de RP.
   Cada código diz de onde vem cada função:
     // nativa  = vem com o SA-MP/open.mp (a_samp)
     // zcmd / sscanf / DOF2 = include ou plugin que você instala
     // sua     = função criada por você no gamemode
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

WCDEV.temas.push(
  {
    id: "pawn-origem",
    lang: "pawn",
    titulo: "Nativas, includes, plugins e funções suas",
    chaves: ["funcao nativa", "funcoes nativas", "nativa ou plugin", "nativa ou de plugin", "e nativa", "se e nativa", "se e de plugin", "nativa", "native", "de onde vem essa funcao", "diferenca entre nativa e plugin", "o que e plugin", "plugin pawn", "o que e include", "include pawn", "funcao de plugin", "funcao de include", "minhas funcoes", "funcao criada", "a_samp"],
    resposta: `### De onde vem cada função?
Num gamemode tem **4 tipos** de função, e saber a diferença evita muito erro de compilação:
- **Nativa do SA-MP/open.mp**: já vem pronta no {{a_samp}}. Ex: {{SendClientMessage}}, {{SetPlayerHealth}}, {{GivePlayerMoney}}.
- **De include**: um arquivo {{.inc}} que você coloca na pasta {{include}}. Ex: {{zcmd}} (o {{CMD:}}), {{DOF2}} (salvar arquivos), {{foreach}}.
- **De plugin**: um {{.dll}} (Windows) ou {{.so}} (Linux) na pasta {{plugins}} **e** o {{.inc}} dele. Ex: {{sscanf}}, {{MySQL}}, {{streamer}}, {{crashdetect}}.
- **Sua**: criada no seu código com {{stock}} ou {{public}}. Ex: {{SalvarConta}}, {{DarXP}}.
~~~pawn
#include <a_samp>    // nativas
#include <zcmd>      // include: CMD:
#include <sscanf2>   // plugin: precisa do sscanf.dll/.so + "plugins sscanf" no server.cfg

stock DarDinheiro(playerid, valor)   // sua
{
    GivePlayerMoney(playerid, valor); // nativa
}

CMD:pagar(playerid, params[])       // zcmd
{
    new alvo, valor;
    if (sscanf(params, "ui", alvo, valor)) return SendClientMessage(playerid, -1, "Use: /pagar [id] [valor]"); // sscanf
    if (!IsPlayerConnected(alvo)) return SendClientMessage(playerid, -1, "Jogador offline.");               // nativa
    if (valor < 1 || valor > GetPlayerMoney(playerid)) return SendClientMessage(playerid, -1, "Valor inválido.");
    DarDinheiro(playerid, -valor);
    DarDinheiro(alvo, valor);
    return 1;
}
~~~
**Deu {{error 017: undefined symbol}}?** Quase sempre é: faltou o {{#include}}, faltou instalar o plugin, ou o nome está escrito diferente (maiúsculas importam).
⚠️ Plugin precisa estar **também** no {{server.cfg}}, na linha {{plugins}} (no open.mp: {{config.json}}, em {{pawn.legacy_plugins}}).`,
    sugestoes: ["sscanf", "zcmd", "error 017"],
  },
  {
    id: "pawn-textdraw",
    lang: "pawn",
    titulo: "TextDraw e PlayerTextDraw (HUD)",
    chaves: ["textdraw", "textdraws", "playertextdraw", "player textdraw", "hud", "hud samp", "texto na tela", "mostrar na tela", "td", "interface na tela", "logo na tela", "barra de xp na tela", "textdraw por jogador", "diferenca textdraw e playertextdraw"],
    resposta: `### TextDraw x PlayerTextDraw
**TextDraw** é texto/caixa desenhado na tela (a tela tem **640 x 448** "pontos", não importa a resolução).
- **TextDraw (global)**: o **mesmo** pra todo mundo. Bom pra logo do servidor, relógio.
- **PlayerTextDraw**: um **pra cada jogador**. Bom pra HUD com dados dele (dinheiro, level, fome).

**1) Global: logo do servidor**
~~~pawn
new Text:Logo;   // tag Text:

public OnGameModeInit()
{
    Logo = TextDrawCreate(500.0, 5.0, "WC DEV RP");   // nativa
    TextDrawFont(Logo, 3);
    TextDrawLetterSize(Logo, 0.4, 1.6);
    TextDrawColor(Logo, 0x1E90FFFF);
    TextDrawSetOutline(Logo, 1);
    return 1;
}

public OnPlayerSpawn(playerid)
{
    TextDrawShowForPlayer(playerid, Logo);
    return 1;
}
~~~
**2) Por jogador: HUD de level que muda**
~~~pawn
new PlayerText:HudLevel[MAX_PLAYERS];   // tag PlayerText:

public OnPlayerConnect(playerid)
{
    HudLevel[playerid] = CreatePlayerTextDraw(playerid, 30.0, 320.0, "Level 1");
    PlayerTextDrawLetterSize(playerid, HudLevel[playerid], 0.3, 1.2);
    PlayerTextDrawColor(playerid, HudLevel[playerid], 0xFFFFFFFF);
    PlayerTextDrawSetOutline(playerid, HudLevel[playerid], 1);
    return 1;
}

stock AtualizarHud(playerid)   // sua
{
    new txt[32];
    format(txt, sizeof(txt), "Level %d", GetPlayerScore(playerid));
    PlayerTextDrawSetString(playerid, HudLevel[playerid], txt);
    PlayerTextDrawShow(playerid, HudLevel[playerid]);
}
~~~
**Dicas importantes:**
- Configure fonte/cor/tamanho **antes** de mostrar. Se mudar depois, mostre de novo.
- PlayerTextDraw some sozinho quando o jogador sai, mas não use o ID antigo dele depois.
- Limite: 2048 TextDraws globais e 256 PlayerTextDraws por jogador.
- Pra **clicar** em textdraw: {{TextDrawSetSelectable}} + {{SelectTextDraw}} + callback {{OnPlayerClickTextDraw}}.`,
    sugestoes: ["TextDrawCreate", "sistema de level e xp", "relógio na tela"],
  },
  {
    id: "pawn-level",
    lang: "pawn",
    titulo: "Sistema de level e XP",
    chaves: ["sistema de level", "sistema de nivel", "level e xp", "nivel e xp", "level xp", "subir de level", "subir de nivel", "ganhar xp", "dar xp", "experiencia", "progressao", "upar", "level up", "xp por kill", "xp por tempo", "xp necessaria", "sistema de progressao"],
    resposta: `### Sistema de level com XP
**A ideia:** o jogador junta **XP**. Quando chega no necessário pro próximo level, ele **sobe** e o XP que sobrou continua contando.

**1) Os dados** (no seu enum do jogador):
~~~pawn
enum E_JOGADOR
{
    jNivel,
    jXP,
    bool:jLogado
}
new Jogador[MAX_PLAYERS][E_JOGADOR];
~~~
**2) Quanto precisa pra subir** (level 1 → 100 XP, level 2 → 200 XP...):
~~~pawn
stock XpNecessaria(nivel)   // sua
{
    return nivel * 100;
}
~~~
**3) Dar XP e subir de level** (o {{while}} sobe vários levels se ganhar muito XP de uma vez):
~~~pawn
stock DarXP(playerid, quantidade)   // sua
{
    Jogador[playerid][jXP] += quantidade;
    while (Jogador[playerid][jXP] >= XpNecessaria(Jogador[playerid][jNivel]))
    {
        Jogador[playerid][jXP] -= XpNecessaria(Jogador[playerid][jNivel]);
        Jogador[playerid][jNivel]++;
        SetPlayerScore(playerid, Jogador[playerid][jNivel]);   // nativa: mostra no TAB

        new msg[64];
        format(msg, sizeof(msg), "Parabéns! Você subiu pro level %d!", Jogador[playerid][jNivel]);
        SendClientMessage(playerid, 0x00FF00FF, msg);
        GameTextForPlayer(playerid, "~g~LEVEL UP!", 3000, 3);   // nativa
    }
}
~~~
**4) Quando ganhar XP**
~~~pawn
public OnPlayerDeath(playerid, killerid, reason)
{
    if (killerid != INVALID_PLAYER_ID) DarXP(killerid, 25);   // XP por kill
    return 1;
}
~~~
**5) Ver o progresso** (zcmd):
~~~pawn
CMD:nivel(playerid, params[])
{
    new msg[96];
    format(msg, sizeof(msg), "Level %d | XP: %d/%d", Jogador[playerid][jNivel], Jogador[playerid][jXP], XpNecessaria(Jogador[playerid][jNivel]));
    SendClientMessage(playerid, 0x1E90FFFF, msg);
    return 1;
}
~~~
**6) Não esqueça:** quem entra começa no level 1 ({{Jogador[playerid][jNivel] = 1;}} no {{OnPlayerConnect}}), e salve {{jNivel}} e {{jXP}} junto com a conta (DOF2 ou MySQL).
💡 Quer o sistema inteiro pronto, com salvamento e XP por tempo? Me peça: **"cria um sistema de level com XP, salvamento e aviso"**.`,
    sugestoes: ["cria um sistema de level com XP, salvamento e aviso", "Salvar contas (DOF2 e MySQL)", "TextDraw e PlayerTextDraw (HUD)"],
  },
  {
    id: "pawn-inventario",
    lang: "pawn",
    titulo: "Sistema de inventário",
    chaves: ["inventario", "sistema de inventario", "inventario samp", "mochila", "itens do jogador", "guardar itens", "usar item", "slots", "item", "itens", "bolsa"],
    resposta: `### Sistema de inventário
**A ideia:** cada jogador tem **slots**. Cada slot guarda **qual item** e **quantos**.
~~~pawn
#define MAX_SLOTS 10
#define DIALOG_INVENTARIO 50

// tipos de item (0 = slot vazio)
#define ITEM_NADA     0
#define ITEM_KIT      1
#define ITEM_LANCHE   2
#define ITEM_COLETE   3

new NomeItem[][] = { "Vazio", "Kit médico", "Lanche", "Colete" };

new InvItem[MAX_PLAYERS][MAX_SLOTS];
new InvQtd[MAX_PLAYERS][MAX_SLOTS];
~~~
**Dar e tirar itens** (funções suas):
~~~pawn
stock DarItem(playerid, item, qtd)
{
    // 1º: se já tem esse item, só soma
    for (new s = 0; s < MAX_SLOTS; s++)
    {
        if (InvItem[playerid][s] == item) { InvQtd[playerid][s] += qtd; return 1; }
    }
    // 2º: senão, procura um slot vazio
    for (new s = 0; s < MAX_SLOTS; s++)
    {
        if (InvItem[playerid][s] == ITEM_NADA)
        {
            InvItem[playerid][s] = item;
            InvQtd[playerid][s] = qtd;
            return 1;
        }
    }
    return 0;   // inventário cheio
}

stock TirarItem(playerid, slot, qtd)
{
    InvQtd[playerid][slot] -= qtd;
    if (InvQtd[playerid][slot] <= 0)
    {
        InvItem[playerid][slot] = ITEM_NADA;
        InvQtd[playerid][slot] = 0;
    }
}
~~~
**Abrir o inventário num dialog e usar o item:**
~~~pawn
CMD:inventario(playerid, params[])
{
    new lista[512], linha[48];
    for (new s = 0; s < MAX_SLOTS; s++)
    {
        if (InvItem[playerid][s] == ITEM_NADA) format(linha, sizeof(linha), "%d. -\\n", s + 1);
        else format(linha, sizeof(linha), "%d. %s (x%d)\\n", s + 1, NomeItem[InvItem[playerid][s]], InvQtd[playerid][s]);
        strcat(lista, linha);
    }
    ShowPlayerDialog(playerid, DIALOG_INVENTARIO, DIALOG_STYLE_LIST, "Inventário", lista, "Usar", "Fechar");
    return 1;
}

public OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])
{
    if (dialogid == DIALOG_INVENTARIO)
    {
        if (!response) return 1;
        new item = InvItem[playerid][listitem];
        switch (item)
        {
            case ITEM_NADA: return SendClientMessage(playerid, -1, "Esse slot está vazio.");
            case ITEM_KIT: SetPlayerHealth(playerid, 100.0);
            case ITEM_LANCHE: SendClientMessage(playerid, -1, "Você comeu um lanche.");
            case ITEM_COLETE: SetPlayerArmour(playerid, 100.0);
        }
        TirarItem(playerid, listitem, 1);
        return 1;
    }
    return 0;
}
~~~
**Não esqueça:** zere os slots no {{OnPlayerConnect}} e salve cada slot na conta (ex: {{DOF2_SetInt(arq, "Item0", ...)}}).
💡 Pra testar, crie um {{/daritem}} de admin que chama {{DarItem(playerid, ITEM_KIT, 1);}}.`,
    sugestoes: ["Dialogs (janelas)", "Salvar contas (DOF2 e MySQL)", "Separando o gamemode em módulos"],
  },
  {
    id: "pawn-org",
    lang: "pawn",
    titulo: "Organizações e facções",
    chaves: ["organizacao", "organizacoes", "sistema de organizacao", "faccao", "faccoes", "gangue", "gangues", "org", "corporacao", "convidar pra org", "radio da org", "chat da org", "cargo", "lider da org", "membros"],
    resposta: `### Organizações (polícia, gangues, máfias)
**A ideia:** cada jogador guarda **em qual org** está e **qual cargo** tem. O líder convida, e a org tem um chat próprio (rádio).
~~~pawn
#define ORG_NENHUMA 0
#define ORG_POLICIA 1
#define ORG_MAFIA   2

new NomeOrg[][] = { "Civil", "Polícia Militar", "Máfia" };
new CorOrg[] = { 0xFFFFFFFF, 0x1E90FFFF, 0x990000FF };

enum E_JOGADOR
{
    jOrg,
    jCargo   // 0 = membro ... 5 = líder
}
new Jogador[MAX_PLAYERS][E_JOGADOR];
~~~
**Convidar** (só líder; usa sscanf com {{u}} pra aceitar id ou nome):
~~~pawn
CMD:convidar(playerid, params[])
{
    new alvo;
    if (Jogador[playerid][jOrg] == ORG_NENHUMA || Jogador[playerid][jCargo] < 5)
        return SendClientMessage(playerid, -1, "Só o líder pode convidar.");
    if (sscanf(params, "u", alvo)) return SendClientMessage(playerid, -1, "Use: /convidar [id]");
    if (!IsPlayerConnected(alvo)) return SendClientMessage(playerid, -1, "Jogador não conectado.");
    if (Jogador[alvo][jOrg] != ORG_NENHUMA) return SendClientMessage(playerid, -1, "Ele já está em uma organização.");

    Jogador[alvo][jOrg] = Jogador[playerid][jOrg];
    Jogador[alvo][jCargo] = 0;
    new msg[96];
    format(msg, sizeof(msg), "Você entrou na %s!", NomeOrg[Jogador[alvo][jOrg]]);
    SendClientMessage(alvo, CorOrg[Jogador[alvo][jOrg]], msg);
    return 1;
}
~~~
**Rádio da org** (só quem é da mesma org recebe):
~~~pawn
CMD:r(playerid, params[])
{
    new org = Jogador[playerid][jOrg];
    if (org == ORG_NENHUMA) return SendClientMessage(playerid, -1, "Você não é de nenhuma organização.");
    if (isnull(params)) return SendClientMessage(playerid, -1, "Use: /r [mensagem]");

    new nome[MAX_PLAYER_NAME], msg[144];
    GetPlayerName(playerid, nome, sizeof(nome));
    format(msg, sizeof(msg), "[Rádio %s] %s: %s", NomeOrg[org], nome, params);
    for (new i = 0; i < MAX_PLAYERS; i++)
    {
        if (IsPlayerConnected(i) && Jogador[i][jOrg] == org) SendClientMessage(i, CorOrg[org], msg);
    }
    return 1;
}
~~~
**Sair da org:**
~~~pawn
CMD:sairorg(playerid, params[])
{
    if (Jogador[playerid][jOrg] == ORG_NENHUMA) return SendClientMessage(playerid, -1, "Você não está em nenhuma org.");
    Jogador[playerid][jOrg] = ORG_NENHUMA;
    Jogador[playerid][jCargo] = 0;
    SendClientMessage(playerid, -1, "Você saiu da organização.");
    return 1;
}
~~~
💡 Próximos passos: salvar {{jOrg}}/{{jCargo}} na conta, spawn e skin por org no {{OnPlayerSpawn}}, e um {{/setlider}} pra admin.`,
    sugestoes: ["sscanf", "isnull", "Sistema de admin"],
  },
  {
    id: "pawn-empregos",
    lang: "pawn",
    titulo: "Sistema de empregos",
    chaves: ["emprego", "empregos", "sistema de emprego", "sistema de empregos", "trabalho", "trampo", "profissao", "job", "caminhoneiro", "taxista", "entregador", "pegar emprego", "salario do emprego", "checkpoint de entrega"],
    resposta: `### Sistema de empregos
**A ideia:** o jogador **pega** um emprego num lugar (pickup), depois usa um comando pra **trabalhar**: vai até um checkpoint e recebe.
~~~pawn
#define EMPREGO_NENHUM      0
#define EMPREGO_ENTREGADOR  1

new NomeEmprego[][] = { "Desempregado", "Entregador" };
new PickupEmprego;

enum E_JOGADOR
{
    jEmprego,
    bool:jTrabalhando
}
new Jogador[MAX_PLAYERS][E_JOGADOR];

public OnGameModeInit()
{
    PickupEmprego = CreatePickup(1239, 1, 1481.0, -1771.0, 18.8);   // nativa: ícone de "i"
    return 1;
}
~~~
**Pegar o emprego** encostando no pickup:
~~~pawn
public OnPlayerPickUpPickup(playerid, pickupid)
{
    if (pickupid == PickupEmprego)
        SendClientMessage(playerid, -1, "Agência de empregos: digite /emprego pra virar entregador.");
    return 1;
}

CMD:emprego(playerid, params[])
{
    if (!IsPlayerInRangeOfPoint(playerid, 3.0, 1481.0, -1771.0, 18.8))
        return SendClientMessage(playerid, -1, "Você precisa estar na agência de empregos.");
    Jogador[playerid][jEmprego] = EMPREGO_ENTREGADOR;
    SendClientMessage(playerid, 0x00FF00FF, "Agora você é Entregador! Use /trabalhar.");
    return 1;
}
~~~
**Trabalhar** (checkpoint e pagamento):
~~~pawn
CMD:trabalhar(playerid, params[])
{
    if (Jogador[playerid][jEmprego] != EMPREGO_ENTREGADOR) return SendClientMessage(playerid, -1, "Você não é entregador.");
    if (Jogador[playerid][jTrabalhando]) return SendClientMessage(playerid, -1, "Você já está numa entrega.");
    Jogador[playerid][jTrabalhando] = true;
    SetPlayerCheckpoint(playerid, 2105.0, -1806.0, 13.5, 3.0);   // nativa
    SendClientMessage(playerid, -1, "Leve a entrega até o checkpoint vermelho no mapa.");
    return 1;
}

public OnPlayerEnterCheckpoint(playerid)
{
    if (Jogador[playerid][jTrabalhando])
    {
        Jogador[playerid][jTrabalhando] = false;
        DisablePlayerCheckpoint(playerid);
        GivePlayerMoney(playerid, 350);
        SendClientMessage(playerid, 0x00FF00FF, "Entrega feita! Você ganhou $350.");
    }
    return 1;
}
~~~
⚠️ Só existe **1 checkpoint por jogador** de cada vez. Se você usa checkpoint em outro sistema, guarde **qual** sistema ativou (ex: {{jTrabalhando}}) pra não pagar errado.
💡 Pra vários empregos: um {{#define}} e um {{NomeEmprego}} pra cada, e um {{switch (Jogador[playerid][jEmprego])}} no {{/trabalhar}}.`,
    sugestoes: ["emprego de entregador", "SetPlayerCheckpoint", "Sistema de level e XP"],
  },
  {
    id: "pawn-boas-praticas",
    lang: "pawn",
    titulo: "Boas práticas para gamemode RP",
    chaves: ["boas praticas", "boas praticas pawn", "boas praticas gamemode", "boas praticas rp", "gamemode rp", "gamemode roleplay", "codigo organizado", "organizar gamemode", "dicas pra gamemode", "gamemode profissional", "otimizar gamemode", "codigo limpo pawn", "erros de iniciante pawn"],
    resposta: `### Boas práticas pra um gamemode RP
Essas regras evitam **bugs, crash e hack** quando o servidor cresce:
**1) Dê nome pros números** ({{#define}}), nada de "número mágico":
~~~pawn
#define DIALOG_LOGIN     1
#define DIALOG_REGISTRO  2
#define COR_ERRO         0xFF4444FF
#define COR_SUCESSO      0x33CC33FF
~~~
**2) Zere os dados quando o jogador entra** (senão ele herda os dados de quem saiu com o mesmo ID):
~~~pawn
public OnPlayerConnect(playerid)
{
    new vazio[E_JOGADOR];
    Jogador[playerid] = vazio;
    return 1;
}
~~~
**3) Valide tudo que vem do jogador** (parâmetro de comando, id, valor):
~~~pawn
if (sscanf(params, "ui", alvo, valor)) return SendClientMessage(playerid, COR_ERRO, "Use: /pagar [id] [valor]");
if (!IsPlayerConnected(alvo) || alvo == playerid) return SendClientMessage(playerid, COR_ERRO, "Jogador inválido.");
if (valor < 1 || valor > GetPlayerMoney(playerid)) return SendClientMessage(playerid, COR_ERRO, "Valor inválido.");
~~~
**4) Mais regras de ouro:**
- **Dinheiro no servidor**: guarde no seu enum e só confie nele (o dinheiro do cliente pode ser hackeado).
- **Salve no {{OnPlayerDisconnect}}** e de tempos em tempos (um timer de 10 min), não só ao sair.
- **Um timer global** que percorre os jogadores é melhor que um timer por jogador.
- Sempre {{KillTimer}} em timer que não precisa mais.
- {{sizeof}} em vez de tamanho escrito à mão: {{format(msg, sizeof(msg), ...)}}.
- Strings do tamanho certo: mensagem de chat cabe em **144**, nome em {{MAX_PLAYER_NAME}}.
- Comando de admin: confira o nível **antes** de qualquer outra coisa.
- Separe o gamemode em **módulos** (um arquivo por sistema).
- Compile **sem warnings**: warning hoje vira bug amanhã.`,
    sugestoes: ["Separando o gamemode em módulos", "Encontrando e corrigindo bugs no Pawn", "dinheiro no servidor (anti-cheat)"],
  },
  {
    id: "pawn-modulos",
    lang: "pawn",
    titulo: "Separando o gamemode em módulos",
    chaves: ["modulos", "modularizar", "separar o gamemode", "separar em arquivos", "varios arquivos", "dividir o codigo", "organizar em pastas", "include proprio", "y_hooks", "hook", "hooks", "gamemode grande", "arquivo muito grande"],
    resposta: `### Separando o gamemode em módulos
Um gamemode de 20 mil linhas num arquivo só vira bagunça. Separe **um sistema por arquivo**:
~~~
gamemodes/
  meurp.pwn          ← arquivo principal (é ele que você compila)
  modulos/
    contas.pwn
    level.pwn
    inventario.pwn
    empregos.pwn
~~~
**No arquivo principal**, inclua os módulos com **aspas** (caminho relativo):
~~~pawn
#include <a_samp>
#include <zcmd>
#include <sscanf2>

#include "modulos/contas.pwn"
#include "modulos/level.pwn"
#include "modulos/inventario.pwn"
~~~
⚠️ A **ordem importa**: se o {{level.pwn}} usa o {{Jogador[]}} criado no {{contas.pwn}}, o {{contas.pwn}} vem antes.

**O problema dos callbacks:** só pode existir **um** {{OnPlayerConnect}} no gamemode inteiro. Solução simples: cada módulo tem uma função, e o callback principal chama todas:
~~~pawn
// modulos/level.pwn
stock Level_AoConectar(playerid)
{
    Jogador[playerid][jNivel] = 1;
    Jogador[playerid][jXP] = 0;
}

// meurp.pwn
public OnPlayerConnect(playerid)
{
    Contas_AoConectar(playerid);
    Level_AoConectar(playerid);
    Inventario_AoConectar(playerid);
    return 1;
}
~~~
**Jeito avançado:** a biblioteca **YSI** tem o {{y_hooks}}, que deixa cada módulo ter o próprio {{hook OnPlayerConnect(playerid)}}. É uma biblioteca externa (precisa baixar o YSI), então só use se já estiver no seu projeto.
💡 Dê um prefixo pras funções de cada módulo ({{Level_}}, {{Inv_}}): fica fácil saber de onde cada uma vem.`,
    sugestoes: ["Boas práticas para gamemode RP", "Nativas, includes, plugins e funções suas"],
  },
  {
    id: "pawn-bugs",
    lang: "pawn",
    titulo: "Encontrando e corrigindo bugs no Pawn",
    chaves: ["debug pawn", "debugar pawn", "depurar pawn", "achar bug", "achar o bug", "encontrar bug", "corrigir bug", "bug no servidor", "servidor crashando", "servidor caindo", "crash", "crashdetect", "unknown command", "comando nao funciona", "nao funciona", "array index out of bounds", "printf debug", "por que nao funciona"],
    resposta: `### Caçando bugs no Pawn 🐛
**Compila mas não funciona?** Siga esta ordem:
**1) Coloque "prints" pra ver até onde o código chega** (aparece no console do servidor):
~~~pawn
CMD:teste(playerid, params[])
{
    printf("[DEBUG] /teste chamado por %d", playerid);
    new valor = GetPlayerMoney(playerid);
    printf("[DEBUG] dinheiro = %d", valor);
    return 1;
}
~~~
**2) Instale o plugin crashdetect** (mostra a linha exata do erro no {{server_log.txt}}) e compile com debug: no Pawno, flag {{-d3}}.
**3) Os bugs mais comuns:**
- **"SERVER: Unknown command"**: o comando não retornou {{1}}, ou deu erro de execução dentro dele (o crashdetect mostra qual).
- **Array index out of bounds**: usou uma posição que não existe. Ex: {{NomeOrg[org]}} com {{org = 5}}, mas o array só tem 3.
- **Dados de outro jogador**: esqueceu de zerar o enum no {{OnPlayerConnect}}.
- **{{strcmp}} com texto vazio** devolve 0 (= "igual"). Confira com {{isnull}} antes.
- **Float sem tag**: {{new vida = 50.5;}} vira lixo. Use {{new Float:vida}}.
- **Timer que não para**: guarde o id e use {{KillTimer}}.
- **{{if (x = 5)}}** (um {{=}} só) atribui em vez de comparar: o compilador avisa com warning 211.
**4) Isole o problema:** comente metade do código suspeito ({{/* ... */}}) e veja se o bug some. Vá diminuindo até achar.
💡 Me cole o código e a mensagem de erro que eu te ajudo a achar a linha.`,
    sugestoes: ["warning 211", "isnull", "Boas práticas para gamemode RP"],
  },
);

/* ---------- exercícios dos sistemas ---------- */
WCDEV.exercicios = WCDEV.exercicios || [];
WCDEV.exercicios.push(
  {
    lang: "pawn", nivel: 3,
    titulo: "Função de XP necessária",
    enunciado: "Crie uma função {{stock XpNecessaria(nivel)}} que **retorna** {{nivel * 150}}.",
    dica: "Dentro das chaves, só um {{return nivel * 150;}}.",
    testes: [
      { re: /stock\s+XpNecessaria\s*\(\s*nivel\s*\)/, falta: "Faltou o cabeçalho {{stock XpNecessaria(nivel)}}." },
      { re: /return\s+nivel\s*\*\s*150\s*;/, falta: "A função precisa de {{return nivel * 150;}}." },
    ],
    solucao: `stock XpNecessaria(nivel)
{
    return nivel * 150;
}`,
  },
  {
    lang: "pawn", nivel: 3,
    titulo: "Rádio só pra organização",
    enunciado: "Dentro de um loop {{for (new i = 0; i < MAX_PLAYERS; i++)}}, mande {{msg}} só pros jogadores **conectados** que têm {{Jogador[i][jOrg] == org}}.",
    dica: "Junte as duas condições com {{&&}}: {{IsPlayerConnected(i) && Jogador[i][jOrg] == org}}.",
    testes: [
      { re: /for\s*\(\s*new\s+i\s*=\s*0\s*;\s*i\s*<\s*MAX_PLAYERS\s*;\s*i\s*\+\+\s*\)/, falta: "Use o loop {{for (new i = 0; i < MAX_PLAYERS; i++)}}." },
      { re: /IsPlayerConnected\s*\(\s*i\s*\)/, falta: "Confira se o jogador está conectado com {{IsPlayerConnected(i)}}." },
      { re: /Jogador\s*\[\s*i\s*\]\s*\[\s*jOrg\s*\]\s*==\s*org/, falta: "Compare a org: {{Jogador[i][jOrg] == org}}." },
      { re: /SendClientMessage\s*\(\s*i\s*,[^;]*msg\s*\)\s*;/, falta: "Mande pra {{i}}: {{SendClientMessage(i, -1, msg);}}" },
    ],
    solucao: `for (new i = 0; i < MAX_PLAYERS; i++)
{
    if (IsPlayerConnected(i) && Jogador[i][jOrg] == org) SendClientMessage(i, -1, msg);
}`,
  },
);
