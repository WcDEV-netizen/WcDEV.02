/* =========================================================
   WC DEV — PAWN (GTA SA-MP / open.mp)
   Trilha em ordem + consulta + exercícios
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

WCDEV.temas.push(
  {
    id: "pawn-intro",
    lang: "pawn",
    titulo: "O que é Pawn, SA-MP e open.mp",
    chaves: ["o que e pawn", "o que e samp", "o que e sa-mp", "pra que serve pawn", "comecar pawn", "aprender pawn", "open.mp", "openmp", "o que e open.mp", "servidor de gta", "gta multiplayer"],
    resposta: `### O que é Pawn? 🎮
**Pawn** é a linguagem usada pra programar servidores de **GTA San Andreas Multiplayer**: o **SA-MP** e o **open.mp** (a versão moderna, que roda os mesmos scripts).
Com Pawn você cria o **gamemode**: comandos, empregos, casas, carros, login, admin, roleplay, DM, corrida...

**Como funciona:**
- Você escreve o código num arquivo **.pwn**
- O **compilador** (pawncc, que vem no Pawno/Qawno) transforma em **.amx**
- O servidor carrega o **.amx** e roda seu código

A sintaxe é parecida com **C**: usa chaves pra abrir e fechar blocos e **ponto e vírgula** no fim das linhas.
~~~pawn
#include <a_samp>

main()
{
    print("Meu primeiro gamemode!");
}
~~~
Pawn é **orientado a eventos**: o servidor chama suas funções (os **callbacks**) quando algo acontece: alguém entra, morre, digita um comando...`,
    sugestoes: ["montar servidor samp", "estrutura de um gamemode"],
  },
  {
    id: "pawn-servidor",
    lang: "pawn",
    titulo: "Montando o servidor",
    chaves: ["montar servidor", "montar servidor samp", "criar servidor", "baixar samp server", "server.cfg", "rodar servidor", "abrir servidor", "pasta do servidor", "compilar", "como compilar", "pawno", "qawno", "pawncc", "compilador", "ip do servidor", "porta 7777", "conectar no servidor", "rcon_password"],
    resposta: `### Montando seu servidor 🖥️
**1. Baixe o servidor** (SA-MP 0.3.7 ou **open.mp**, que é o mais atualizado) no site oficial.
**2. Conheça as pastas:**
- {{gamemodes/}} → seus modos de jogo (.pwn e .amx)
- {{filterscripts/}} → scripts extras que rodam junto
- {{scriptfiles/}} → arquivos que o script salva (contas, configs)
- {{plugins/}} → plugins (.dll no Windows, .so no Linux)
- {{pawno/include/}} ou {{qawno/include/}} → os includes (.inc)

**3. Configure o server.cfg:**
~~~ini
hostname Meu Servidor WC DEV
gamemode0 meugm 1
filterscripts
plugins
rcon_password TroqueEstaSenha
port 7777
maxplayers 50
lanmode 0
announce 0
~~~
(no open.mp, as mesmas configs ficam no **config.json**)

**4. Compile:** abra o .pwn no Pawno/Qawno e aperte **F5** (ou use o VS Code com a extensão de Pawn). Se não tiver erros, sai o **.amx** na mesma pasta.
**5. Rode** o {{samp-server.exe}} (ou {{omp-server.exe}}) e conecte no SA-MP em {{127.0.0.1:7777}}.

⚠️ Sempre troque a {{rcon_password}}: com a senha padrão o servidor nem liga.`,
    sugestoes: ["estrutura de um gamemode", "erros do compilador pawn"],
  },
  {
    id: "pawn-estrutura",
    lang: "pawn",
    titulo: "Estrutura de um gamemode",
    chaves: ["estrutura", "estrutura de um gamemode", "estrutura basica pawn", "gamemode basico", "modelo de gamemode", "gamemode do zero", "esqueleto gamemode", "template pawn", "include a_samp"],
    resposta: `### Estrutura básica de um gamemode
~~~pawn
#include <a_samp>        // funções do SA-MP (no open.mp: #include <open.mp>)

main()
{
    print("Gamemode WC DEV carregado!");
}

public OnGameModeInit()
{
    SetGameModeText("WC DEV v1.0");
    // skin, posição X Y Z, ângulo, e 3 armas com munição
    AddPlayerClass(0, 1958.38, 1343.16, 15.37, 270.0, 0, 0, 0, 0, 0, 0);
    return 1;
}

public OnGameModeExit()
{
    return 1;
}

public OnPlayerConnect(playerid)
{
    SendClientMessage(playerid, 0x1E90FFFF, "Bem-vindo ao servidor!");
    return 1;
}

public OnPlayerSpawn(playerid)
{
    GivePlayerWeapon(playerid, 24, 100);   // Desert Eagle
    return 1;
}
~~~
**Peças importantes:**
- {{#include}} traz funções prontas.
- {{main()}} é obrigatório no gamemode.
- Os {{public On...}} são **callbacks**: o servidor chama sozinho.
- Quase todo callback termina com {{return 1;}}.`,
    sugestoes: ["variáveis em pawn", "callbacks"],
  },
  {
    id: "pawn-variaveis",
    lang: "pawn",
    titulo: "Variáveis e tags (new, Float, bool)",
    chaves: ["variavel", "variaveis", "variaveis em pawn", "new", "criar variavel", "tag", "tags", "float", "bool", "tipos pawn", "numero decimal pawn"],
    resposta: `### Variáveis em Pawn
Variáveis são criadas com {{new}}. Por padrão guardam **números inteiros**.
~~~pawn
new dinheiro = 500;
new vida;              // começa com 0
dinheiro += 100;       // 600
~~~
Pawn não tem "tipos" como outras linguagens, tem **tags**:
~~~pawn
new Float:vida = 100.0;     // número com vírgula: precisa da tag Float:
new bool:logado = false;    // verdadeiro/falso
new Float:x, Float:y, Float:z;
~~~
⚠️ Esqueceu o {{Float:}}? O compilador avisa **warning 213: tag mismatch** e o valor fica errado.

**Constantes** (não mudam):
~~~pawn
const MAX_CASAS = 100;
#define COR_AZUL 0x1E90FFFF
~~~
**Global x local:** criada fora de funções é **global** (todo o script vê). Dentro de uma função, só existe lá dentro.`,
    sugestoes: ["arrays e strings pawn", "if e switch pawn"],
  },
  {
    id: "pawn-arrays",
    lang: "pawn",
    titulo: "Arrays e strings",
    chaves: ["array", "arrays", "vetor", "string", "strings", "texto pawn", "arrays e strings pawn", "matriz pawn", "max_player_name", "tamanho da string"],
    resposta: `### Arrays e strings
Um **array** guarda vários valores:
~~~pawn
new pontos[3] = {10, 20, 30};
printf("%d", pontos[0]);    // 10 (começa no 0!)
~~~
**Array por jogador** (muito usado):
~~~pawn
new Matou[MAX_PLAYERS];      // um valor pra cada playerid
Matou[playerid]++;
~~~
Em Pawn **texto é um array de caracteres**. Você precisa dizer o tamanho:
~~~pawn
new nome[MAX_PLAYER_NAME];          // 24 caracteres
GetPlayerName(playerid, nome, sizeof(nome));

new msg[128];
format(msg, sizeof(msg), "Olá %s, você tem %d de grana", nome, GetPlayerMoney(playerid));
SendClientMessage(playerid, -1, msg);
~~~
⚠️ Em Pawn **não dá** pra comparar texto com {{==}} nem juntar com {{+}}. Use {{strcmp}} pra comparar e {{format}} ou {{strcat}} pra juntar.
**Dica:** mensagens do chat têm no máximo **144 caracteres**; {{new msg[144]}} é um bom tamanho.`,
    sugestoes: ["format", "strcmp", "if e switch pawn"],
  },
  {
    id: "pawn-if",
    lang: "pawn",
    titulo: "if, else e switch",
    chaves: ["if", "else", "if e switch pawn", "switch", "case", "condicao", "condicional", "decisao pawn"],
    resposta: `### Decisões: if / else
~~~pawn
new Float:vida;
GetPlayerHealth(playerid, vida);

if (vida < 20.0)
{
    SendClientMessage(playerid, 0xFF0000FF, "Você está quase morrendo!");
}
else if (vida < 50.0)
{
    SendClientMessage(playerid, 0xFFFF00FF, "Cuidado!");
}
else
{
    SendClientMessage(playerid, 0x00FF00FF, "Tudo certo.");
}
~~~
Operadores: {{==}} igual, {{!=}} diferente, {{>}} {{<}} {{>=}} {{<=}}, {{&&}} (e), {{||}} (ou), {{!}} (não).

### switch: vários casos
~~~pawn
switch (GetPlayerSkin(playerid))
{
    case 0: SendClientMessage(playerid, -1, "Você é o CJ!");
    case 280..288: SendClientMessage(playerid, -1, "Você é policial.");
    case 102, 103, 104: SendClientMessage(playerid, -1, "Ballas!");
    default: SendClientMessage(playerid, -1, "Outra skin.");
}
~~~
No Pawn o {{switch}} **não precisa de break** e aceita intervalos com {{..}}.`,
    sugestoes: ["loops pawn", "funções pawn"],
  },
  {
    id: "pawn-loops",
    lang: "pawn",
    titulo: "Loops: for, while e foreach",
    chaves: ["for", "while", "loop", "loops", "loops pawn", "repetir", "repeticao", "percorrer jogadores", "todos os jogadores", "foreach", "do while", "getplayerpoolsize"],
    resposta: `### Loops
**for** (repetir um número de vezes):
~~~pawn
for (new i = 0; i < 10; i++)
{
    printf("Volta %d", i);
}
~~~
**Percorrer todos os jogadores online** (o mais usado no SA-MP):
~~~pawn
for (new i = 0, j = GetPlayerPoolSize(); i <= j; i++)
{
    if (!IsPlayerConnected(i)) continue;
    GivePlayerMoney(i, 1000);
}
~~~
**Com foreach** (include y_iterate/foreach, mais rápido e limpo):
~~~pawn
#include <foreach>

foreach (new i : Player)
{
    GivePlayerMoney(i, 1000);
}
~~~
**while** (enquanto for verdade):
~~~pawn
new contagem = 3;
while (contagem > 0)
{
    printf("%d...", contagem);
    contagem--;
}
~~~
{{break}} sai do loop, {{continue}} pula pra próxima volta.`,
    sugestoes: ["funções pawn", "foreach"],
  },
  {
    id: "pawn-funcoes",
    lang: "pawn",
    titulo: "Funções: stock, public e forward",
    chaves: ["funcao", "funcoes", "funcoes pawn", "stock", "public", "forward", "criar funcao", "return", "retornar", "parametro", "native"],
    resposta: `### Funções
**stock**: função normal sua (se não for usada, não dá aviso):
~~~pawn
stock DarKit(playerid)
{
    GivePlayerWeapon(playerid, 24, 50);
    GivePlayerWeapon(playerid, 31, 300);
    SetPlayerArmour(playerid, 100.0);
}
~~~
**Com retorno:**
~~~pawn
stock NomeDoJogador(playerid)
{
    new nome[MAX_PLAYER_NAME];
    GetPlayerName(playerid, nome, sizeof(nome));
    return nome;
}
~~~
**public**: função que o servidor (ou um timer) pode chamar pelo **nome**. Toda public sua precisa de **forward** antes:
~~~pawn
forward Salario(playerid);
public Salario(playerid)
{
    GivePlayerMoney(playerid, 500);
    SendClientMessage(playerid, -1, "Você recebeu seu salário!");
    return 1;
}
~~~
Sem o {{forward}}: **warning 235: public function lacks forward declaration**.
**Parâmetro por referência** ({{&}}): a função pode mudar a variável de quem chamou, como em {{GetPlayerHealth(playerid, vida)}}.`,
    sugestoes: ["callbacks", "timers pawn"],
  },
  {
    id: "pawn-callbacks",
    lang: "pawn",
    titulo: "Callbacks (eventos do jogo)",
    chaves: ["callback", "callbacks", "evento", "eventos", "o que e callback", "onplayer", "on player"],
    resposta: `### Callbacks
São funções que o **servidor chama sozinho** quando algo acontece. Você só escreve o que fazer:
- {{OnGameModeInit}} → servidor ligou
- {{OnPlayerConnect}} → alguém entrou
- {{OnPlayerDisconnect}} → alguém saiu
- {{OnPlayerSpawn}} → nasceu/renasceu
- {{OnPlayerDeath}} → morreu
- {{OnPlayerText}} → escreveu no chat
- {{OnPlayerCommandText}} → digitou um comando com /
- {{OnDialogResponse}} → respondeu um dialog
- {{OnPlayerKeyStateChange}} → apertou uma tecla
- {{OnPlayerEnterVehicle}} → vai entrar num carro
- {{OnPlayerStateChange}} → virou motorista, passageiro, a pé...

Exemplo: dar score pra quem matar:
~~~pawn
public OnPlayerDeath(playerid, killerid, reason)
{
    if (killerid != INVALID_PLAYER_ID)
    {
        SetPlayerScore(killerid, GetPlayerScore(killerid) + 1);
        GivePlayerMoney(killerid, 500);
    }
    return 1;
}
~~~
Digite o nome de qualquer callback pra ver os detalhes. 😉`,
    sugestoes: ["OnPlayerDeath", "OnPlayerConnect", "mensagens e cores"],
  },
  {
    id: "pawn-mensagens",
    lang: "pawn",
    titulo: "Mensagens e cores",
    chaves: ["mensagem", "mensagens", "mandar mensagem", "mensagens e cores", "cor", "cores", "cores pawn", "cor no chat", "texto colorido", "gametext", "0x"],
    resposta: `### Mensagens e cores
~~~pawn
SendClientMessage(playerid, 0x1E90FFFF, "Só pra esse jogador");
SendClientMessageToAll(0xFFFF00FF, "Pra todo mundo!");
GameTextForPlayer(playerid, "~g~Bem-vindo!", 3000, 3);   // texto grande na tela
~~~
**Cores** são em hexadecimal: {{0xRRGGBBAA}} (vermelho, verde, azul, transparência).
~~~pawn
#define COR_VERMELHO 0xFF0000FF
#define COR_VERDE    0x00FF00FF
#define COR_AZUL     0x1E90FFFF
#define COR_BRANCO   0xFFFFFFFF
#define COR_AMARELO  0xFFFF00FF
#define COR_CINZA    0xAFAFAFFF
~~~
**Várias cores na mesma mensagem:** coloque a cor entre chaves, tipo **{1E90FF}**, no meio do texto:
~~~pawn
SendClientMessage(playerid, -1, "{1E90FF}[WC DEV] {FFFFFF}Use {00FF00}/ajuda {FFFFFF}pra ver os comandos.");
~~~
**Cores do GameText:** ~r~ vermelho, ~g~ verde, ~b~ azul, ~y~ amarelo, ~w~ branco, ~p~ roxo, ~n~ pula linha.
{{-1}} é atalho pra branco.`,
    sugestoes: ["comandos pawn", "SendClientMessage", "GameTextForPlayer"],
  },
  {
    id: "pawn-comandos",
    lang: "pawn",
    titulo: "Comandos (/comando)",
    chaves: ["comando", "comandos", "comandos pawn", "criar comando", "fazer comando", "onplayercommandtext", "zcmd", "cmd", "pawn.cmd", "sscanf", "comando com parametro", "/ajuda"],
    resposta: `### Comandos
**Jeito básico** (sem include), no {{OnPlayerCommandText}}:
~~~pawn
public OnPlayerCommandText(playerid, cmdtext[])
{
    if (!strcmp(cmdtext, "/vida", true))
    {
        SetPlayerHealth(playerid, 100.0);
        SendClientMessage(playerid, 0x00FF00FF, "Vida recuperada!");
        return 1;
    }
    return 0;   // 0 = "comando desconhecido"
}
~~~
Lembre: {{strcmp}} devolve **0 quando é igual**, por isso o {{!}}.

**Jeito profissional:** include **zcmd** (ou **Pawn.CMD**) + **sscanf** pra ler parâmetros:
~~~pawn
#include <a_samp>
#include <zcmd>
#include <sscanf2>

CMD:vida(playerid, params[])
{
    #pragma unused params
    SetPlayerHealth(playerid, 100.0);
    return 1;
}

CMD:dargrana(playerid, params[])
{
    if (!IsPlayerAdmin(playerid))   // só admin: senão qualquer um cria dinheiro
        return SendClientMessage(playerid, 0xFF0000FF, "Sem permissão.");
    new id, valor;
    if (sscanf(params, "ui", id, valor))
        return SendClientMessage(playerid, -1, "Use: /dargrana [id] [valor]");
    if (!IsPlayerConnected(id))
        return SendClientMessage(playerid, 0xFF0000FF, "Jogador não conectado.");
    if (valor < 1)
        return SendClientMessage(playerid, 0xFF0000FF, "Valor inválido.");
    GivePlayerMoney(id, valor);
    return 1;
}
~~~
No sscanf: {{u}} = jogador (id ou nome), {{i}} ou {{d}} = inteiro, {{f}} = Float, {{s[64]}} = texto.`,
    sugestoes: ["sscanf", "zcmd", "dialogs pawn"],
  },
  {
    id: "pawn-dialogs",
    lang: "pawn",
    titulo: "Dialogs (janelas)",
    chaves: ["dialog", "dialogs", "dialogs pawn", "janela", "showplayerdialog", "ondialogresponse", "menu de opcoes pawn", "caixa de dialogo", "lista pawn"],
    resposta: `### Dialogs
Janelas com botões, listas e campos de texto.
~~~pawn
#define DIALOG_ARMAS 1

CMD:armas(playerid, params[])
{
    ShowPlayerDialog(playerid, DIALOG_ARMAS, DIALOG_STYLE_LIST,
        "Loja de Armas",
        "Desert Eagle - $500\\nM4 - $1500\\nShotgun - $800",
        "Comprar", "Fechar");
    return 1;
}

public OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])
{
    if (dialogid == DIALOG_ARMAS)
    {
        if (!response) return 1;   // clicou em Fechar
        switch (listitem)
        {
            case 0: { GivePlayerWeapon(playerid, 24, 100); GivePlayerMoney(playerid, -500); }
            case 1: { GivePlayerWeapon(playerid, 31, 300); GivePlayerMoney(playerid, -1500); }
            case 2: { GivePlayerWeapon(playerid, 25, 50);  GivePlayerMoney(playerid, -800); }
        }
        return 1;
    }
    return 0;
}
~~~
**Estilos:** {{DIALOG_STYLE_MSGBOX}} (aviso), {{DIALOG_STYLE_INPUT}} (campo), {{DIALOG_STYLE_PASSWORD}} (senha), {{DIALOG_STYLE_LIST}} (lista), {{DIALOG_STYLE_TABLIST_HEADERS}} (tabela).
- {{response}}: 1 = botão da esquerda, 0 = da direita/ESC
- {{listitem}}: qual linha da lista (começa em 0)
- {{inputtext}}: o que foi digitado
⚠️ Cada dialog precisa de um **ID diferente**.`,
    sugestoes: ["timers pawn", "ShowPlayerDialog"],
  },
  {
    id: "pawn-timers",
    lang: "pawn",
    titulo: "Timers",
    chaves: ["timer", "timers", "timers pawn", "settimer", "settimerex", "killtimer", "a cada", "repetir a cada", "depois de segundos", "contagem regressiva", "temporizador"],
    resposta: `### Timers
Executam uma função **depois de um tempo** ou **repetindo**. O tempo é em **milissegundos** (1000 = 1 segundo).
~~~pawn
forward MensagemAutomatica();
public MensagemAutomatica()
{
    SendClientMessageToAll(0x1E90FFFF, "[WC DEV] Siga as regras e divirta-se!");
}

public OnGameModeInit()
{
    SetTimer("MensagemAutomatica", 5 * 60000, true);   // a cada 5 min, repetindo
    return 1;
}
~~~
**Timer pra um jogador** com {{SetTimerEx}}:
~~~pawn
forward LiberarJogador(playerid);
public LiberarJogador(playerid)
{
    TogglePlayerControllable(playerid, true);
    SendClientMessage(playerid, -1, "Você foi liberado!");
}

// congela por 10 segundos
TogglePlayerControllable(playerid, false);
SetTimerEx("LiberarJogador", 10000, false, "i", playerid);
~~~
Guarde o ID pra cancelar: {{new t = SetTimer(...); KillTimer(t);}}
⚠️ A função do timer **precisa ser public com forward**.`,
    sugestoes: ["dados do jogador enum", "SetTimerEx"],
  },
  {
    id: "pawn-enum",
    lang: "pawn",
    titulo: "Dados do jogador com enum",
    chaves: ["enum", "enum pawn", "dados do jogador", "dados do jogador enum", "playerinfo", "pinfo", "variaveis do jogador", "guardar dados", "estatisticas"],
    resposta: `### Guardando dados de cada jogador
O jeito clássico é um **enum** + array por jogador:
~~~pawn
enum E_JOGADOR
{
    jSenha[65],
    jAdmin,
    jDinheiro,
    jNivel,
    jMatou,
    jMorreu,
    Float:jVida,
    bool:jLogado
}
new Jogador[MAX_PLAYERS][E_JOGADOR];
~~~
**Usando:**
~~~pawn
Jogador[playerid][jNivel] = 1;
Jogador[playerid][jMatou]++;
if (Jogador[playerid][jAdmin] >= 3) { /* é admin nível 3+ */ }
~~~
**Sempre zere quando alguém entra** (senão o próximo jogador herda os dados de quem saiu!):
~~~pawn
public OnPlayerConnect(playerid)
{
    new vazio[E_JOGADOR];
    Jogador[playerid] = vazio;
    return 1;
}
~~~`,
    sugestoes: ["salvar contas pawn", "sistema de admin pawn"],
  },
  {
    id: "pawn-salvar",
    lang: "pawn",
    titulo: "Salvar contas (DOF2 e MySQL)",
    chaves: ["salvar", "salvar contas", "salvar conta", "salvar dados", "salvar contas pawn", "salvar dados pawn", "carregar conta", "dof2", "dini", "y_ini", "mysql", "banco de dados pawn", "registro", "login e registro", "sistema de login"],
    resposta: `### Salvando contas
**Opção fácil: DOF2** (salva arquivos na pasta {{scriptfiles}}):
~~~pawn
#include <DOF2>

stock CaminhoConta(playerid)
{
    new nome[MAX_PLAYER_NAME], arquivo[64];
    GetPlayerName(playerid, nome, sizeof(nome));
    format(arquivo, sizeof(arquivo), "Contas/%s.ini", nome);
    return arquivo;
}

stock SalvarConta(playerid)
{
    new arq[64];
    format(arq, sizeof(arq), "%s", CaminhoConta(playerid));
    if (!DOF2_FileExists(arq)) DOF2_CreateFile(arq);
    DOF2_SetInt(arq, "Dinheiro", GetPlayerMoney(playerid));
    DOF2_SetInt(arq, "Score", GetPlayerScore(playerid));
    DOF2_SetInt(arq, "Admin", Jogador[playerid][jAdmin]);
    DOF2_SaveFile();
}

stock CarregarConta(playerid)
{
    new arq[64];
    format(arq, sizeof(arq), "%s", CaminhoConta(playerid));
    GivePlayerMoney(playerid, DOF2_GetInt(arq, "Dinheiro"));
    SetPlayerScore(playerid, DOF2_GetInt(arq, "Score"));
    Jogador[playerid][jAdmin] = DOF2_GetInt(arq, "Admin");
}

public OnPlayerDisconnect(playerid, reason)
{
    if (Jogador[playerid][jLogado]) SalvarConta(playerid);
    return 1;
}

public OnGameModeExit()
{
    DOF2_Exit();   // obrigatório: grava tudo antes de desligar
    return 1;
}
~~~
⚠️ Crie a pasta {{scriptfiles/Contas}} antes, senão não salva.
**Servidor grande?** Use **MySQL** (plugin do BlueG): mais rápido e seguro. Digite {{mysql_tquery}} pra ver como.
🔐 **Nunca salve a senha pura**: use hash (ex: {{bcrypt}} ou {{SHA256_PassHash}} com salt).`,
    sugestoes: ["projeto login pawn", "DOF2_SetInt", "mysql_tquery"],
  },
  {
    id: "pawn-veiculos",
    lang: "pawn",
    titulo: "Veículos",
    chaves: ["veiculo", "veiculos", "carro", "carros", "criar carro", "spawnar carro", "createvehicle", "addstaticvehicle", "/carro", "/v", "moto"],
    resposta: `### Veículos
**Carros fixos no mapa** (no {{OnGameModeInit}}):
~~~pawn
AddStaticVehicleEx(411, 2495.0, -1680.0, 13.3, 0.0, 1, 1, 120);  // Infernus, respawn 120s
~~~
**Criar carro pro jogador** (comando /carro):
~~~pawn
new CarroDoJogador[MAX_PLAYERS] = {INVALID_VEHICLE_ID, ...};

CMD:carro(playerid, params[])
{
    new modelo;
    if (sscanf(params, "i", modelo)) return SendClientMessage(playerid, -1, "Use: /carro [400-611]");
    if (modelo < 400 || modelo > 611) return SendClientMessage(playerid, 0xFF0000FF, "Modelo inválido.");

    if (CarroDoJogador[playerid] != INVALID_VEHICLE_ID) DestroyVehicle(CarroDoJogador[playerid]);

    new Float:x, Float:y, Float:z, Float:a;
    GetPlayerPos(playerid, x, y, z);
    GetPlayerFacingAngle(playerid, a);
    CarroDoJogador[playerid] = CreateVehicle(modelo, x, y, z, a, -1, -1, -1);
    LinkVehicleToInterior(CarroDoJogador[playerid], GetPlayerInterior(playerid));
    SetVehicleVirtualWorld(CarroDoJogador[playerid], GetPlayerVirtualWorld(playerid));
    PutPlayerInVehicle(playerid, CarroDoJogador[playerid], 0);
    return 1;
}
~~~
Outras: {{RepairVehicle}}, {{SetVehicleHealth}}, {{ChangeVehicleColor}}, {{AddVehicleComponent}} (tuning), {{SetVehicleParamsEx}} (motor, luz, portas).
Digite **"ids de veículos"** pra ver os modelos mais usados.`,
    sugestoes: ["ids de veículos", "sistema de admin pawn"],
  },
  {
    id: "pawn-admin",
    lang: "pawn",
    titulo: "Sistema de admin",
    chaves: ["admin", "sistema de admin", "sistema de admin pawn", "administrador", "kickar", "banir", "/kick", "/ban", "comando de admin", "nivel de admin", "staff"],
    resposta: `### Sistema de admin
~~~pawn
// verifica se é admin (com o enum Jogador da aula anterior)
#define IsAdmin(%0,%1) (Jogador[%0][jAdmin] >= %1 || IsPlayerAdmin(%0))

CMD:kick(playerid, params[])
{
    if (!IsAdmin(playerid, 1)) return SendClientMessage(playerid, 0xFF0000FF, "Você não é admin.");

    new id, motivo[64];
    if (sscanf(params, "us[64]", id, motivo))
        return SendClientMessage(playerid, -1, "Use: /kick [id/nome] [motivo]");
    if (!IsPlayerConnected(id)) return SendClientMessage(playerid, 0xFF0000FF, "Jogador offline.");

    new nomeAdm[MAX_PLAYER_NAME], nomeAlvo[MAX_PLAYER_NAME], msg[144];
    GetPlayerName(playerid, nomeAdm, sizeof(nomeAdm));
    GetPlayerName(id, nomeAlvo, sizeof(nomeAlvo));
    format(msg, sizeof(msg), "[ADMIN] %s kickou %s. Motivo: %s", nomeAdm, nomeAlvo, motivo);
    SendClientMessageToAll(0xFF6347FF, msg);

    SetTimerEx("KickAtrasado", 500, false, "i", id);   // dá tempo da mensagem chegar
    return 1;
}

forward KickAtrasado(playerid);
public KickAtrasado(playerid) { Kick(playerid); }

CMD:daradmin(playerid, params[])
{
    if (!IsPlayerAdmin(playerid)) return 0;   // só quem logou no RCON
    new id, nivel;
    if (sscanf(params, "ui", id, nivel)) return SendClientMessage(playerid, -1, "Use: /daradmin [id] [nível]");
    if (!IsPlayerConnected(id)) return SendClientMessage(playerid, -1, "Jogador offline.");
    Jogador[id][jAdmin] = nivel;
    return 1;
}
~~~
⚠️ **Kick e Ban na hora** fazem a mensagem não chegar pro jogador; por isso o timer de 500ms.
Pra virar admin RCON no jogo: {{/rcon login SUA_SENHA}}.`,
    sugestoes: ["projeto login pawn", "Kick", "Ban"],
  },
  {
    id: "pawn-teclas",
    lang: "pawn",
    titulo: "Teclas, posições e teleporte",
    chaves: ["tecla", "teclas", "apertar tecla", "onplayerkeystatechange", "pressed", "teleporte", "teleportar", "/tp", "posicao", "coordenadas", "getplayerpos", "/ir", "/trazer"],
    resposta: `### Detectar teclas
~~~pawn
#define PRESSED(%0) (((newkeys & (%0)) == (%0)) && ((oldkeys & (%0)) != (%0)))

public OnPlayerKeyStateChange(playerid, newkeys, oldkeys)
{
    if (PRESSED(KEY_YES))   // tecla Y
    {
        SendClientMessage(playerid, -1, "Você apertou Y!");
    }
    if (PRESSED(KEY_SECONDARY_ATTACK))   // F ou Enter
    {
        if (IsPlayerInRangeOfPoint(playerid, 2.0, 1554.9, -1675.6, 16.2))
            SendClientMessage(playerid, -1, "Você está na porta da delegacia.");
    }
    return 1;
}
~~~
### Teleporte
~~~pawn
CMD:ls(playerid, params[])
{
    SetPlayerInterior(playerid, 0);
    SetPlayerVirtualWorld(playerid, 0);
    SetPlayerPos(playerid, 2495.3, -1688.0, 13.6);   // Grove Street
    return 1;
}

CMD:ir(playerid, params[])   // ir até outro jogador
{
    new id, Float:x, Float:y, Float:z;
    if (sscanf(params, "u", id)) return SendClientMessage(playerid, -1, "Use: /ir [id]");
    if (!IsPlayerConnected(id)) return SendClientMessage(playerid, -1, "Jogador offline.");   // senão vai pro 0,0,0
    GetPlayerPos(id, x, y, z);
    SetPlayerInterior(playerid, GetPlayerInterior(id));
    SetPlayerPos(playerid, x + 1.0, y, z);
    return 1;
}
~~~
**Pegar coordenadas no jogo:** digite {{/save}} (salva em {{savedpositions.txt}} na pasta do GTA).`,
    sugestoes: ["projeto login pawn", "KEY_YES", "SetPlayerPos"],
  },
  {
    id: "pawn-projeto",
    lang: "pawn",
    titulo: "Projeto: login e registro completo",
    chaves: ["projeto pawn", "projeto login pawn", "projeto login", "projeto de login", "gamemode completo", "login completo", "registro e login", "sistema de registro", "exemplo completo pawn"],
    resposta: `### Projeto: login e registro com dialogs + DOF2 🏆
~~~pawn
#include <a_samp>
#include <DOF2>

#define DIALOG_REGISTRO 1
#define DIALOG_LOGIN    2

enum E_JOGADOR { jSenha[65], jAdmin, bool:jLogado, jTentativas }
new Jogador[MAX_PLAYERS][E_JOGADOR];

main() {}

stock Arquivo(playerid)
{
    new nome[MAX_PLAYER_NAME], arq[48];
    GetPlayerName(playerid, nome, sizeof(nome));
    format(arq, sizeof(arq), "Contas/%s.ini", nome);
    return arq;
}

public OnGameModeInit()
{
    SetGameModeText("WC DEV Login");
    AddPlayerClass(0, 1958.38, 1343.16, 15.37, 270.0, 0, 0, 0, 0, 0, 0);
    return 1;
}

public OnGameModeExit()
{
    DOF2_Exit();
    return 1;
}

public OnPlayerConnect(playerid)
{
    new vazio[E_JOGADOR];
    Jogador[playerid] = vazio;

    if (DOF2_FileExists(Arquivo(playerid)))
        ShowPlayerDialog(playerid, DIALOG_LOGIN, DIALOG_STYLE_PASSWORD, "Login", "Digite sua senha:", "Entrar", "Sair");
    else
        ShowPlayerDialog(playerid, DIALOG_REGISTRO, DIALOG_STYLE_PASSWORD, "Registro", "Crie uma senha (4 a 20 letras):", "Registrar", "Sair");
    return 1;
}

public OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])
{
    if (!response && (dialogid == DIALOG_LOGIN || dialogid == DIALOG_REGISTRO))
        return Kick(playerid);

    if (dialogid == DIALOG_REGISTRO)
    {
        if (strlen(inputtext) < 4 || strlen(inputtext) > 20)
            return ShowPlayerDialog(playerid, DIALOG_REGISTRO, DIALOG_STYLE_PASSWORD, "Registro", "{FF0000}Senha de 4 a 20 letras!", "Registrar", "Sair");

        new hash[65];
        SHA256_PassHash(inputtext, "wcdev_salt", hash, sizeof(hash));
        DOF2_CreateFile(Arquivo(playerid));
        DOF2_SetString(Arquivo(playerid), "Senha", hash);
        DOF2_SetInt(Arquivo(playerid), "Dinheiro", 500);
        DOF2_SaveFile();

        Jogador[playerid][jLogado] = true;
        GivePlayerMoney(playerid, 500);
        SendClientMessage(playerid, 0x00FF00FF, "Conta criada! Bem-vindo.");
        return 1;
    }

    if (dialogid == DIALOG_LOGIN)
    {
        new hash[65];
        SHA256_PassHash(inputtext, "wcdev_salt", hash, sizeof(hash));
        if (!strcmp(hash, DOF2_GetString(Arquivo(playerid), "Senha")))
        {
            Jogador[playerid][jLogado] = true;
            GivePlayerMoney(playerid, DOF2_GetInt(Arquivo(playerid), "Dinheiro"));
            SendClientMessage(playerid, 0x00FF00FF, "Logado com sucesso!");
        }
        else
        {
            if (++Jogador[playerid][jTentativas] >= 3) return Kick(playerid);
            ShowPlayerDialog(playerid, DIALOG_LOGIN, DIALOG_STYLE_PASSWORD, "Login", "{FF0000}Senha errada!{FFFFFF} Tente de novo:", "Entrar", "Sair");
        }
        return 1;
    }
    return 0;
}

public OnPlayerRequestSpawn(playerid)
{
    if (!Jogador[playerid][jLogado]) return 0;   // não deixa nascer sem logar
    return 1;
}

public OnPlayerDisconnect(playerid, reason)
{
    if (Jogador[playerid][jLogado])
    {
        DOF2_SetInt(Arquivo(playerid), "Dinheiro", GetPlayerMoney(playerid));
        DOF2_SaveFile();
    }
    return 1;
}
~~~
**Melhore:** salve posição e skin, adicione e-mail, use **bcrypt** ou **MySQL** num servidor sério.
Quer treinar? Digite {{/treinar pawn}}. 💪`,
    sugestoes: ["/treinar pawn", "mysql_tquery", "bcrypt"],
  }
);

/* =========================================================
   PAWN — CONSULTA (cada item: nome, explicação, exemplo, palavras extras)
   ========================================================= */
WCDEV.refs = WCDEV.refs || [];

WCDEV.refs.push({ lang: "pawn", grupo: "Callback", itens: [
  ["OnGameModeInit", "Chamado quando o **gamemode liga**. Lugar de criar classes, carros fixos, objetos, timers e configurações.", `public OnGameModeInit()
{
    SetGameModeText("WC DEV RPG");
    UsePlayerPedAnims();
    DisableInteriorEnterExits();
    AddPlayerClass(0, 1958.38, 1343.16, 15.37, 270.0, 0, 0, 0, 0, 0, 0);
    return 1;
}`, "quando o servidor liga|servidor ligou|iniciar gamemode"],
  ["OnGameModeExit", "Chamado quando o gamemode **desliga** (ou {{gmx}}). Salve tudo aqui.", `public OnGameModeExit()
{
    DOF2_Exit();
    return 1;
}`, "servidor desligar"],
  ["OnFilterScriptInit", "Igual ao {{OnGameModeInit}}, mas pra **filterscripts**.", `public OnFilterScriptInit()
{
    print("Filterscript de admin carregado.");
    return 1;
}`, "filterscript"],
  ["OnFilterScriptExit", "Chamado quando o filterscript é descarregado.", `public OnFilterScriptExit() { return 1; }`, ""],
  ["OnPlayerConnect", "Alguém **entrou** no servidor. Bom pra zerar variáveis e mostrar login.", `public OnPlayerConnect(playerid)
{
    new nome[MAX_PLAYER_NAME], msg[96];
    GetPlayerName(playerid, nome, sizeof(nome));
    format(msg, sizeof(msg), "%s entrou no servidor.", nome);
    SendClientMessageToAll(0xAFAFAFFF, msg);
    return 1;
}`, "jogador entrou|quando entrar|mensagem de entrada|boas vindas"],
  ["OnPlayerDisconnect", "Alguém **saiu**. {{reason}}: 0 = caiu/timeout, 1 = saiu, 2 = kick/ban. Salve a conta aqui.", `public OnPlayerDisconnect(playerid, reason)
{
    new motivos[3][] = {"caiu", "saiu", "foi kickado/banido"};
    new nome[MAX_PLAYER_NAME], msg[96];
    GetPlayerName(playerid, nome, sizeof(nome));
    format(msg, sizeof(msg), "%s %s.", nome, motivos[reason]);
    SendClientMessageToAll(0xAFAFAFFF, msg);
    return 1;
}`, "jogador saiu|quando sair|mensagem de saida"],
  ["OnPlayerSpawn", "O jogador **nasceu** (ou renasceu depois de morrer).", `public OnPlayerSpawn(playerid)
{
    SetPlayerHealth(playerid, 100.0);
    GivePlayerWeapon(playerid, 24, 100);
    return 1;
}`, "quando nascer|renascer|spawnou"],
  ["OnPlayerDeath", "O jogador **morreu**. {{killerid}} é quem matou ({{INVALID_PLAYER_ID}} se morreu sozinho); {{reason}} é a arma.", `public OnPlayerDeath(playerid, killerid, reason)
{
    SendDeathMessage(killerid, playerid, reason);   // aparece no canto da tela
    if (killerid != INVALID_PLAYER_ID)
        SetPlayerScore(killerid, GetPlayerScore(killerid) + 1);
    return 1;
}`, "quando morrer|jogador morrer|jogador morreu|quando alguem morrer|morreu|matou|kill"],
  ["OnPlayerText", "O jogador **escreveu no chat**. Retorne 0 pra **bloquear** a mensagem original.", `public OnPlayerText(playerid, text[])
{
    new nome[MAX_PLAYER_NAME], msg[144];
    GetPlayerName(playerid, nome, sizeof(nome));
    format(msg, sizeof(msg), "{1E90FF}%s{FFFFFF}: %s", nome, text);
    SendClientMessageToAll(-1, msg);
    return 0;   // não manda a mensagem padrão
}`, "chat|quando falar|digitar no chat|escrever no chat|jogador digitar|mudar chat|chat personalizado"],
  ["OnPlayerCommandText", "O jogador digitou um **comando** (texto que começa com /). Retorne 1 se o comando existe, 0 se não.", `public OnPlayerCommandText(playerid, cmdtext[])
{
    if (!strcmp(cmdtext, "/kill", true))
    {
        SetPlayerHealth(playerid, 0.0);
        return 1;
    }
    return 0;
}`, "comando sem include"],
  ["OnPlayerRequestClass", "O jogador está na **seleção de personagem**. Bom pra mostrar a câmera e a skin.", `public OnPlayerRequestClass(playerid, classid)
{
    SetPlayerPos(playerid, 1958.38, 1343.16, 15.37);
    SetPlayerCameraPos(playerid, 1958.38, 1347.16, 15.37);
    SetPlayerCameraLookAt(playerid, 1958.38, 1343.16, 15.37);
    return 1;
}`, "selecao de skin|escolher personagem"],
  ["OnPlayerRequestSpawn", "O jogador clicou em **Spawn**. Retorne 0 pra **impedir** (ex: não está logado).", `public OnPlayerRequestSpawn(playerid)
{
    if (!Jogador[playerid][jLogado]) return 0;
    return 1;
}`, "impedir spawn"],
  ["OnPlayerEnterVehicle", "O jogador **começou a entrar** num veículo. {{ispassenger}}: 1 se for de passageiro.", `public OnPlayerEnterVehicle(playerid, vehicleid, ispassenger)
{
    if (GetVehicleModel(vehicleid) == 596 && !ispassenger && !EhPolicial(playerid))
        ClearAnimations(playerid);   // cancela a entrada na viatura
    return 1;
}`, "entrar no carro|entrou no veiculo"],
  ["OnPlayerExitVehicle", "O jogador **começou a sair** do veículo.", `public OnPlayerExitVehicle(playerid, vehicleid)
{
    SendClientMessage(playerid, -1, "Você saiu do veículo.");
    return 1;
}`, "sair do carro"],
  ["OnPlayerStateChange", "O **estado** mudou: a pé, motorista, passageiro, morto... Mais confiável que o {{OnPlayerEnterVehicle}} pra saber se ele realmente entrou.", `public OnPlayerStateChange(playerid, newstate, oldstate)
{
    if (newstate == PLAYER_STATE_DRIVER)
    {
        new modelo = GetVehicleModel(GetPlayerVehicleID(playerid));
        if (modelo == 520) // Hydra
        {
            RemovePlayerFromVehicle(playerid);
            SendClientMessage(playerid, 0xFF0000FF, "Veículo proibido!");
        }
    }
    return 1;
}`, "virou motorista|estado do jogador"],
  ["OnPlayerKeyStateChange", "O jogador **apertou ou soltou** uma tecla. Use com o macro {{PRESSED}}.", `#define PRESSED(%0) (((newkeys & (%0)) == (%0)) && ((oldkeys & (%0)) != (%0)))

public OnPlayerKeyStateChange(playerid, newkeys, oldkeys)
{
    if (PRESSED(KEY_YES)) SendClientMessage(playerid, -1, "Apertou Y");
    return 1;
}`, "apertar tecla|detectar tecla"],
  ["OnDialogResponse", "O jogador **respondeu um dialog**. {{response}} 1 = botão esquerdo; {{listitem}} = linha escolhida; {{inputtext}} = texto digitado.", `public OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])
{
    if (dialogid == 1 && response)
    {
        SetPlayerSkin(playerid, strval(inputtext));
        return 1;
    }
    return 0;
}`, "resposta do dialog"],
  ["OnPlayerClickPlayer", "O jogador **clicou no nome** de outro na lista do TAB.", `public OnPlayerClickPlayer(playerid, clickedplayerid, source)
{
    new msg[64];
    format(msg, sizeof(msg), "Você clicou no ID %d", clickedplayerid);
    SendClientMessage(playerid, -1, msg);
    return 1;
}`, "clicar no tab"],
  ["OnPlayerTakeDamage", "O jogador **levou dano**. Bom pra sistemas de dano personalizado e headshot ({{bodypart}} 9 = cabeça).", `public OnPlayerTakeDamage(playerid, issuerid, Float:amount, weaponid, bodypart)
{
    if (issuerid != INVALID_PLAYER_ID && bodypart == 9 && weaponid == 34)
        SetPlayerHealth(playerid, 0.0);   // headshot de sniper mata na hora
    return 1;
}`, "levou dano|headshot|dano"],
  ["OnPlayerGiveDamage", "O jogador **causou dano** em outro.", `public OnPlayerGiveDamage(playerid, damagedid, Float:amount, weaponid, bodypart)
{
    return 1;
}`, "causou dano"],
  ["OnPlayerWeaponShot", "O jogador **atirou**. {{hittype}} diz se acertou jogador, veículo, objeto ou nada.", `public OnPlayerWeaponShot(playerid, weaponid, hittype, hitid, Float:fX, Float:fY, Float:fZ)
{
    if (hittype == BULLET_HIT_TYPE_VEHICLE) { /* acertou um carro */ }
    return 1;
}`, "atirou|tiro"],
  ["OnPlayerPickUpPickup", "O jogador **pegou um pickup** (ícone no chão).", `new PickupVida;

public OnGameModeInit()
{
    PickupVida = CreatePickup(1240, 2, 2495.0, -1685.0, 13.5, 0);
    return 1;
}

public OnPlayerPickUpPickup(playerid, pickupid)
{
    if (pickupid == PickupVida) SetPlayerHealth(playerid, 100.0);
    return 1;
}`, "pegou pickup|pegar item"],
  ["OnPlayerEnterCheckpoint", "O jogador **entrou no checkpoint** vermelho.", `public OnPlayerEnterCheckpoint(playerid)
{
    DisablePlayerCheckpoint(playerid);
    GivePlayerMoney(playerid, 300);
    SendClientMessage(playerid, -1, "Entrega feita! +$300");
    return 1;
}`, "entrou no checkpoint|chegou no checkpoint"],
  ["OnPlayerLeaveCheckpoint", "O jogador **saiu** do checkpoint.", `public OnPlayerLeaveCheckpoint(playerid) { return 1; }`, ""],
  ["OnPlayerEnterRaceCheckpoint", "Entrou num **checkpoint de corrida**.", `public OnPlayerEnterRaceCheckpoint(playerid)
{
    ProximoCheckpointCorrida(playerid);
    return 1;
}`, "checkpoint de corrida"],
  ["OnVehicleSpawn", "Um veículo **(re)nasceu**.", `public OnVehicleSpawn(vehicleid) { return 1; }`, ""],
  ["OnVehicleDeath", "Um veículo **explodiu**.", `public OnVehicleDeath(vehicleid, killerid) { return 1; }`, "carro explodiu"],
  ["OnPlayerUpdate", "Chamado **várias vezes por segundo** pra cada jogador. ⚠️ Evite código pesado aqui.", `public OnPlayerUpdate(playerid)
{
    return 1;   // retornar 0 faz o jogador não sincronizar
}`, ""],
  ["OnPlayerInteriorChange", "O jogador **mudou de interior**.", `public OnPlayerInteriorChange(playerid, newinteriorid, oldinteriorid) { return 1; }`, "mudou de interior"],
  ["OnPlayerClickTextDraw", "O jogador **clicou num textdraw** (precisa de {{SelectTextDraw}}).", `public OnPlayerClickTextDraw(playerid, Text:clickedid)
{
    if (clickedid == TD_BotaoJogar) { CancelSelectTextDraw(playerid); SpawnPlayer(playerid); }
    return 1;
}`, "clicar textdraw"],
  ["OnPlayerClickMap", "O jogador **marcou um ponto no mapa** (menu ESC). Ótimo pra teleporte de admin.", `public OnPlayerClickMap(playerid, Float:fX, Float:fY, Float:fZ)
{
    if (IsPlayerAdmin(playerid)) SetPlayerPosFindZ(playerid, fX, fY, fZ);
    return 1;
}`, "marcar no mapa|teleporte pelo mapa"],
  ["OnRconLoginAttempt", "Alguém **tentou logar no RCON**.", `public OnRconLoginAttempt(ip[], password[], success)
{
    if (!success) printf("Tentativa de RCON falhou do IP %s", ip);
    return 1;
}`, "login rcon"],
  ["OnRconCommand", "Um **comando RCON** foi digitado no console.", `public OnRconCommand(cmd[]) { return 0; }`, ""],
  ["OnPlayerStreamIn", "Outro jogador **ficou visível** (perto) pra este jogador.", `public OnPlayerStreamIn(playerid, forplayerid) { return 1; }`, ""],
  ["OnPlayerEditObject", "O jogador **editou um objeto** com {{EditObject}}.", `public OnPlayerEditObject(playerid, playerobject, objectid, response, Float:fX, Float:fY, Float:fZ, Float:fRotX, Float:fRotY, Float:fRotZ)
{
    return 1;
}`, ""],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Função de jogador", itens: [
  ["SendClientMessage", "Manda uma **mensagem no chat** pra um jogador. Máximo 144 caracteres.", `SendClientMessage(playerid, 0x1E90FFFF, "Olá!");
SendClientMessage(playerid, -1, "{FF0000}Vermelho {FFFFFF}e branco");`, "mandar mensagem|mensagem no chat|enviar mensagem"],
  ["SendClientMessageToAll", "Manda uma mensagem pra **todos**.", `SendClientMessageToAll(0xFFFF00FF, "Evento começando em 1 minuto!");`, "mensagem para todos|anuncio"],
  ["GameTextForPlayer", "Texto **grande no meio da tela**. Tempo em ms; estilos de 0 a 6.", `GameTextForPlayer(playerid, "~g~MISSAO~n~~w~COMPLETA!", 4000, 3);`, "texto na tela|texto grande|gametext"],
  ["GameTextForAll", "GameText pra **todos**.", `GameTextForAll("~r~EVENTO!", 3000, 3);`, ""],
  ["GetPlayerName", "Pega o **nome** do jogador.", `new nome[MAX_PLAYER_NAME];
GetPlayerName(playerid, nome, sizeof(nome));`, "nome do jogador|pegar nome"],
  ["SetPlayerName", "Muda o **nome** (1 = sucesso, 0 = já existe/inválido, -1 = mesmo nome).", `SetPlayerName(playerid, "[ADM]Cesar");`, "mudar nome"],
  ["GetPlayerIp", "Pega o **IP** do jogador.", `new ip[16];
GetPlayerIp(playerid, ip, sizeof(ip));`, "ip do jogador"],
  ["GivePlayerMoney", "**Dá ou tira dinheiro** (valor negativo tira).", `GivePlayerMoney(playerid, 1000);
GivePlayerMoney(playerid, -500);`, "dar dinheiro|dar grana|tirar dinheiro"],
  ["GetPlayerMoney", "Quanto **dinheiro** o jogador tem.", `if (GetPlayerMoney(playerid) < 500)
    return SendClientMessage(playerid, -1, "Dinheiro insuficiente.");`, "ver dinheiro|quanto dinheiro"],
  ["ResetPlayerMoney", "**Zera** o dinheiro.", `ResetPlayerMoney(playerid);`, "zerar dinheiro"],
  ["SetPlayerHealth", "Muda a **vida** (0.0 a 100.0). 0 mata.", `SetPlayerHealth(playerid, 100.0);`, "dar vida|curar|vida cheia|matar jogador"],
  ["GetPlayerHealth", "Pega a **vida** (guarda numa variável Float por referência).", `new Float:vida;
GetPlayerHealth(playerid, vida);`, "ver vida|quanto de vida"],
  ["SetPlayerArmour", "Muda o **colete** (0.0 a 100.0).", `SetPlayerArmour(playerid, 100.0);`, "colete|dar colete"],
  ["GetPlayerArmour", "Pega o **colete**.", `new Float:colete;
GetPlayerArmour(playerid, colete);`, ""],
  ["SetPlayerPos", "**Teleporta** o jogador pra uma posição.", `SetPlayerPos(playerid, 2495.3, -1688.0, 13.6);`, "teleportar|mudar posicao|tp"],
  ["SetPlayerPosFindZ", "Teleporta achando a **altura do chão** sozinho.", `SetPlayerPosFindZ(playerid, 1500.0, -1700.0, 50.0);`, ""],
  ["GetPlayerPos", "Pega a **posição** X, Y, Z.", `new Float:x, Float:y, Float:z;
GetPlayerPos(playerid, x, y, z);`, "pegar posicao|coordenadas do jogador"],
  ["SetPlayerFacingAngle", "Muda pra **onde o jogador olha** (0 a 360).", `SetPlayerFacingAngle(playerid, 90.0);`, "angulo"],
  ["GetPlayerFacingAngle", "Pega o **ângulo** do jogador.", `new Float:a;
GetPlayerFacingAngle(playerid, a);`, ""],
  ["IsPlayerInRangeOfPoint", "Testa se o jogador está **perto de um ponto** (raio em metros).", `if (IsPlayerInRangeOfPoint(playerid, 3.0, 1554.9, -1675.6, 16.2))
    SendClientMessage(playerid, -1, "Você está na DP.");`, "perto de|distancia do ponto|esta perto"],
  ["GetPlayerDistanceFromPoint", "**Distância** do jogador até um ponto.", `new Float:dist = GetPlayerDistanceFromPoint(playerid, 0.0, 0.0, 3.0);`, "distancia"],
  ["SetPlayerInterior", "Muda o **interior** (0 = rua).", `SetPlayerInterior(playerid, 0);`, "interior"],
  ["GetPlayerInterior", "Pega o interior atual.", `new int = GetPlayerInterior(playerid);`, ""],
  ["SetPlayerVirtualWorld", "Muda o **mundo virtual**: jogadores em mundos diferentes **não se veem**.", `SetPlayerVirtualWorld(playerid, playerid + 1);   // mundo só dele`, "mundo virtual|virtual world|vw"],
  ["GetPlayerVirtualWorld", "Pega o mundo virtual.", `new vw = GetPlayerVirtualWorld(playerid);`, ""],
  ["GivePlayerWeapon", "**Dá uma arma** com munição.", `GivePlayerWeapon(playerid, 31, 500);   // M4 com 500 balas`, "dar arma|armas"],
  ["ResetPlayerWeapons", "**Tira todas** as armas.", `ResetPlayerWeapons(playerid);`, "tirar armas|remover armas|tirar todas armas|limpar armas"],
  ["GetPlayerWeapon", "Arma que o jogador **está segurando**.", `if (GetPlayerWeapon(playerid) == 38) Kick(playerid);   // minigun proibida`, "arma na mao"],
  ["SetPlayerAmmo", "Muda a **munição** de uma arma.", `SetPlayerAmmo(playerid, 24, 200);`, "municao"],
  ["SetPlayerSkin", "Muda a **skin** (roupa/personagem).", `SetPlayerSkin(playerid, 280);   // policial`, "mudar skin|roupa"],
  ["GetPlayerSkin", "Pega a skin atual.", `new skin = GetPlayerSkin(playerid);`, ""],
  ["SetPlayerScore", "Muda o **score** (aparece no TAB).", `SetPlayerScore(playerid, GetPlayerScore(playerid) + 1);`, "score|pontos|level"],
  ["GetPlayerScore", "Pega o **score**.", `new nivel = GetPlayerScore(playerid);`, ""],
  ["SetPlayerColor", "Cor do **nome e do radar**.", `SetPlayerColor(playerid, 0x1E90FFFF);`, "cor do nome"],
  ["SetPlayerWantedLevel", "**Estrelas de procurado** (0 a 6).", `SetPlayerWantedLevel(playerid, 3);`, "estrelas|procurado|wanted"],
  ["TogglePlayerControllable", "**Congela** (false) ou descongela (true) o jogador.", `TogglePlayerControllable(playerid, false);`, "congelar|descongelar|travar jogador"],
  ["IsPlayerConnected", "Testa se o ID está **online**.", `if (!IsPlayerConnected(id)) return SendClientMessage(playerid, -1, "Offline.");`, "esta online|conectado"],
  ["IsPlayerAdmin", "Testa se o jogador está **logado no RCON**.", `if (!IsPlayerAdmin(playerid)) return 0;`, "admin rcon"],
  ["IsPlayerInAnyVehicle", "Testa se está **em algum veículo**.", `if (IsPlayerInAnyVehicle(playerid)) RemovePlayerFromVehicle(playerid);`, "esta no carro|dentro do veiculo"],
  ["GetPlayerVehicleID", "ID do veículo em que o jogador está (0 se nenhum).", `new carro = GetPlayerVehicleID(playerid);`, ""],
  ["GetPlayerVehicleSeat", "**Banco** em que está (0 = motorista).", `if (GetPlayerVehicleSeat(playerid) == 0) { /* motorista */ }`, "banco do carro"],
  ["PutPlayerInVehicle", "**Coloca** o jogador num veículo (banco 0 = motorista).", `PutPlayerInVehicle(playerid, carro, 0);`, "colocar no carro"],
  ["RemovePlayerFromVehicle", "**Tira** o jogador do veículo.", `RemovePlayerFromVehicle(playerid);`, "tirar do carro"],
  ["GetPlayerState", "**Estado**: a pé, motorista, passageiro, morto, espectador...", `if (GetPlayerState(playerid) == PLAYER_STATE_DRIVER) { }`, "estado"],
  ["Kick", "**Expulsa** o jogador. Use um timer de ~500ms antes pra mensagem chegar.", `SendClientMessage(playerid, 0xFF0000FF, "Você foi kickado.");
SetTimerEx("KickAtrasado", 500, false, "i", playerid);`, "kickar|expulsar|kick"],
  ["Ban", "**Bane** o jogador pelo IP.", `Ban(playerid);`, "banir|ban"],
  ["BanEx", "Bane com **motivo** (aparece no samp.ban).", `BanEx(playerid, "Cheat de dinheiro");`, "banir com motivo"],
  ["SpawnPlayer", "**Faz o jogador nascer** (ou renascer) na hora.", `SpawnPlayer(playerid);`, "respawnar"],
  ["SetSpawnInfo", "Define **onde e como** o jogador vai nascer.", `SetSpawnInfo(playerid, 0, 280, 1554.9, -1675.6, 16.2, 90.0, 24, 100, 0, 0, 0, 0);`, "local de spawn|nascer em"],
  ["ForceClassSelection", "Manda pra **seleção de skin** na próxima morte.", `ForceClassSelection(playerid);
SetPlayerHealth(playerid, 0.0);`, ""],
  ["SetPlayerCameraPos", "Coloca a **câmera** numa posição.", `SetPlayerCameraPos(playerid, 1500.0, -1700.0, 80.0);
SetPlayerCameraLookAt(playerid, 1480.0, -1750.0, 15.0);`, "camera|setplayercameralookat"],
  ["SetCameraBehindPlayer", "Volta a câmera **atrás do jogador**.", `SetCameraBehindPlayer(playerid);`, "voltar camera"],
  ["InterpolateCameraPos", "**Movimenta a câmera** suavemente (cinematográfico).", `InterpolateCameraPos(playerid, 1500.0, -1700.0, 80.0, 1600.0, -1650.0, 60.0, 8000, CAMERA_MOVE);`, "camera cinematografica|camera se movendo"],
  ["SetPlayerTime", "Muda a **hora** do jogo só pra ele.", `SetPlayerTime(playerid, 22, 0);   // noite`, "hora do jogo|deixar de noite"],
  ["SetPlayerWeather", "Muda o **clima** só pra ele.", `SetPlayerWeather(playerid, 8);   // chuva`, "clima do jogador"],
  ["PlayerPlaySound", "Toca um **som** do GTA.", `PlayerPlaySound(playerid, 1057, 0.0, 0.0, 0.0);   // som de "check"`, "tocar som|som"],
  ["PlayAudioStreamForPlayer", "Toca uma **música por link** (mp3/rádio online).", `PlayAudioStreamForPlayer(playerid, "http://link.da/musica.mp3");
StopAudioStreamForPlayer(playerid);`, "musica|radio|tocar musica"],
  ["ApplyAnimation", "Faz o jogador fazer uma **animação**.", `ApplyAnimation(playerid, "PED", "SEAT_down", 4.1, 0, 0, 0, 1, 0, 1);   // sentar
ApplyAnimation(playerid, "DANCING", "dnce_M_a", 4.1, 1, 0, 0, 0, 0, 1);  // dançar`, "animacao|sentar|dancar|anim"],
  ["ClearAnimations", "**Para** a animação.", `ClearAnimations(playerid);`, "parar animacao"],
  ["SetPlayerSpecialAction", "Ações especiais: **algemado, bebendo, fumando, dançando, jetpack**...", `SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CUFFED);    // algemado
SetPlayerSpecialAction(playerid, SPECIAL_ACTION_USEJETPACK); // jetpack`, "algemar|jetpack|fumar|special action"],
  ["SetPlayerCheckpoint", "Cria o **checkpoint vermelho** (só um por vez por jogador).", `SetPlayerCheckpoint(playerid, 1810.0, -1890.0, 13.4, 3.0);`, "checkpoint|criar checkpoint|marcador"],
  ["DisablePlayerCheckpoint", "**Remove** o checkpoint.", `DisablePlayerCheckpoint(playerid);`, "tirar checkpoint"],
  ["SetPlayerRaceCheckpoint", "Checkpoint de **corrida** (aponta pro próximo).", `SetPlayerRaceCheckpoint(playerid, 0, x, y, z, proxX, proxY, proxZ, 8.0);`, ""],
  ["SetPlayerMapIcon", "Coloca um **ícone no radar/mapa**.", `SetPlayerMapIcon(playerid, 0, 1554.9, -1675.6, 16.2, 30, 0, MAPICON_GLOBAL);   // 30 = delegacia`, "icone no mapa|icone no radar|map icon|mapa icone|icone do mapa"],
  ["RemovePlayerMapIcon", "Remove um ícone do mapa.", `RemovePlayerMapIcon(playerid, 0);`, ""],
  ["SetPlayerAttachedObject", "**Prende um objeto** no corpo (chapéu, mochila, arma nas costas).", `SetPlayerAttachedObject(playerid, 0, 18645, 2, 0.07, 0.0, 0.0, 88.0, 75.0, 0.0);   // capacete`, "objeto no corpo|chapeu|mochila|acessorio"],
  ["RemovePlayerAttachedObject", "Remove o objeto preso.", `RemovePlayerAttachedObject(playerid, 0);`, ""],
  ["SetPlayerDrunkLevel", "Deixa a tela **bêbada**.", `SetPlayerDrunkLevel(playerid, 5000);`, "bebado"],
  ["SetPlayerSkillLevel", "Muda a **habilidade com armas** (999 = duas armas nas mãos).", `SetPlayerSkillLevel(playerid, WEAPONSKILL_PISTOL, 999);`, "skill|duas armas|habilidade"],
  ["GetPlayerPing", "Pega o **ping** do jogador.", `if (GetPlayerPing(playerid) > 500) Kick(playerid);`, "ping|lag"],
  ["TogglePlayerSpectating", "Coloca o jogador em **modo espectador**.", `TogglePlayerSpectating(playerid, true);
PlayerSpectatePlayer(playerid, alvo);`, "espectador|spec|assistir jogador"],
  ["SetPlayerTeam", "Coloca o jogador num **time** (mesmo time não se machuca).", `SetPlayerTeam(playerid, 1);`, "time|equipe"],
  ["SetPlayerVelocity", "Dá **impulso** ao jogador.", `SetPlayerVelocity(playerid, 0.0, 0.0, 1.0);   // pulo pra cima`, "impulso|pular alto"],
  ["SetPlayerChatBubble", "**Balão de texto** em cima da cabeça.", `SetPlayerChatBubble(playerid, "Estou AFK", 0xFFFFFFFF, 30.0, 10000);`, "texto na cabeca|balao"],
  ["SendDeathMessage", "Mostra a **mensagem de morte** no canto (killfeed).", `SendDeathMessage(killerid, playerid, reason);`, "killfeed"],
  ["SendPlayerMessageToAll", "Manda uma mensagem **como se fosse** o jogador falando.", `SendPlayerMessageToAll(playerid, "Olá a todos!");`, ""],
  ["SetPlayerMarkerForPlayer", "Muda a cor do jogador **só pra outro** jogador ver.", `SetPlayerMarkerForPlayer(playerid, alvo, 0xFF0000FF);`, ""],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Função de veículo", itens: [
  ["CreateVehicle", "**Cria um veículo** (modelo, x, y, z, ângulo, cor1, cor2, tempo de respawn em segundos; -1 = não respawna).", `new carro = CreateVehicle(411, x, y, z, a, 0, 1, -1);`, "criar veiculo|criar carro|spawnar veiculo"],
  ["AddStaticVehicle", "Veículo **fixo** do mapa (só no {{OnGameModeInit}}).", `AddStaticVehicle(522, 2490.0, -1680.0, 13.0, 0.0, 3, 3);   // NRG-500`, "carro fixo"],
  ["AddStaticVehicleEx", "Igual ao {{AddStaticVehicle}}, mas com **tempo de respawn**.", `AddStaticVehicleEx(560, 2485.0, -1680.0, 13.1, 0.0, 1, 1, 300);   // Sultan`, ""],
  ["DestroyVehicle", "**Apaga** um veículo.", `DestroyVehicle(carro);`, "apagar carro|deletar veiculo"],
  ["GetVehicleModel", "Pega o **modelo** (400 a 611).", `if (GetVehicleModel(vid) == 596) SendClientMessage(playerid, -1, "Viatura!");`, "modelo do carro"],
  ["SetVehicleHealth", "Muda a **lataria** (1000 = novo; abaixo de 250 pega fogo).", `SetVehicleHealth(vid, 1000.0);`, "vida do carro"],
  ["GetVehicleHealth", "Pega a **lataria**.", `new Float:lataria;
GetVehicleHealth(vid, lataria);`, ""],
  ["RepairVehicle", "**Conserta** tudo (lataria e visual).", `RepairVehicle(GetPlayerVehicleID(playerid));`, "consertar carro|reparar|/fix"],
  ["SetVehiclePos", "**Teleporta** um veículo.", `SetVehiclePos(vid, 2000.0, -1700.0, 13.5);`, "teleportar carro"],
  ["GetVehiclePos", "Posição do veículo.", `new Float:x, Float:y, Float:z;
GetVehiclePos(vid, x, y, z);`, ""],
  ["SetVehicleZAngle", "Muda o **ângulo** do veículo.", `SetVehicleZAngle(vid, 180.0);`, "desvirar carro"],
  ["ChangeVehicleColor", "Muda as **cores** do veículo.", `ChangeVehicleColor(vid, 0, 1);   // preto e branco`, "pintar carro|cor do carro"],
  ["ChangeVehiclePaintjob", "Coloca **pintura especial** (0 a 2, só em alguns carros).", `ChangeVehiclePaintjob(vid, 1);`, "paintjob"],
  ["AddVehicleComponent", "**Tuning**: rodas, nitro, aerofólio...", `AddVehicleComponent(vid, 1010);   // nitro 10x
AddVehicleComponent(vid, 1080);   // rodas Switch`, "tunar|tuning|nitro|rodas"],
  ["RemoveVehicleComponent", "Remove uma peça de tuning.", `RemoveVehicleComponent(vid, 1010);`, ""],
  ["SetVehicleParamsEx", "Liga/desliga **motor, faróis, alarme, portas, capô, porta-malas**.", `new motor, luz, alarme, portas, capo, mala, obj;
GetVehicleParamsEx(vid, motor, luz, alarme, portas, capo, mala, obj);
SetVehicleParamsEx(vid, VEHICLE_PARAMS_ON, luz, alarme, portas, capo, mala, obj);`, "ligar motor|trancar carro|farol|getvehicleparamsex"],
  ["ManualVehicleEngineAndLights", "Faz o motor **não ligar sozinho** (pra sistema de /motor).", `public OnGameModeInit()
{
    ManualVehicleEngineAndLights();
    return 1;
}`, "/motor|motor manual"],
  ["SetVehicleNumberPlate", "Muda a **placa** (aplica no próximo respawn).", `SetVehicleNumberPlate(vid, "WCDEV01");
SetVehicleToRespawn(vid);`, "placa"],
  ["SetVehicleToRespawn", "**Respawna** o veículo no lugar original.", `SetVehicleToRespawn(vid);`, "respawnar carros"],
  ["LinkVehicleToInterior", "Coloca o veículo num **interior**.", `LinkVehicleToInterior(vid, 0);`, ""],
  ["SetVehicleVirtualWorld", "Coloca o veículo num **mundo virtual**.", `SetVehicleVirtualWorld(vid, 1);`, ""],
  ["SetVehicleVelocity", "Dá **velocidade/impulso** ao veículo.", `SetVehicleVelocity(vid, 0.0, 0.0, 0.5);   // pulo`, "pular com o carro"],
  ["GetVehicleVelocity", "Pega a velocidade (use pra **velocímetro**).", `new Float:vx, Float:vy, Float:vz;
GetVehicleVelocity(vid, vx, vy, vz);
new kmh = floatround(floatsqroot(vx*vx + vy*vy + vz*vz) * 180.0);`, "velocimetro|velocidade do carro|km/h"],
  ["AttachTrailerToVehicle", "Engata um **reboque**.", `AttachTrailerToVehicle(reboque, caminhao);`, "reboque|trailer"],
  ["IsVehicleStreamedIn", "Testa se o veículo está **visível** pro jogador.", `if (IsVehicleStreamedIn(vid, playerid)) { }`, ""],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Função de servidor e mundo", itens: [
  ["AddPlayerClass", "Cria uma **classe** (skin na seleção): skin, posição, ângulo e 3 armas com munição.", `AddPlayerClass(280, 1554.9, -1675.6, 16.2, 90.0, 24, 100, 25, 50, 0, 0);`, "classe|skin na selecao"],
  ["SetGameModeText", "Texto do **modo de jogo** na lista de servidores.", `SetGameModeText("RPG Brasil v2");`, "nome do modo"],
  ["SendRconCommand", "Executa um **comando RCON** pelo script.", `SendRconCommand("hostname [BR] WC DEV RPG");
SendRconCommand("gmx");   // reinicia o gamemode`, "mudar nome do servidor|reiniciar servidor|gmx|hostname"],
  ["SetWorldTime", "Muda a **hora** pra todos.", `SetWorldTime(12);`, "hora do servidor"],
  ["SetWeather", "Muda o **clima** pra todos (0 = sol, 8 = chuva, 9 = neblina, 19 = tempestade de areia).", `SetWeather(8);`, "clima|chuva|tempo"],
  ["SetGravity", "Muda a **gravidade** (padrão 0.008).", `SetGravity(0.004);   // lua`, "gravidade"],
  ["ShowPlayerMarkers", "Mostra ou esconde os **jogadores no radar** (0 = esconde).", `ShowPlayerMarkers(PLAYER_MARKERS_MODE_OFF);`, "esconder no radar"],
  ["ShowNameTags", "Mostra ou esconde os **nomes em cima** dos jogadores.", `ShowNameTags(0);`, "esconder nomes"],
  ["SetNameTagDrawDistance", "**Distância** que o nome aparece.", `SetNameTagDrawDistance(20.0);`, ""],
  ["UsePlayerPedAnims", "Usa o **jeito de andar** padrão do CJ pra todas as skins.", `UsePlayerPedAnims();`, "andar do cj"],
  ["DisableInteriorEnterExits", "**Desativa as setinhas amarelas** de entrar nos prédios.", `DisableInteriorEnterExits();`, "setas amarelas|entradas do gta"],
  ["EnableStuntBonusForAll", "Liga/desliga o **dinheiro de manobras**.", `EnableStuntBonusForAll(0);`, "bonus de manobra"],
  ["AllowInteriorWeapons", "Permite **armas dentro** de interiores.", `AllowInteriorWeapons(1);`, ""],
  ["LimitGlobalChatRadius", "Faz o chat ser ouvido só **por perto** (bom pra RP).", `LimitGlobalChatRadius(20.0);`, "chat local|chat por distancia"],
  ["GetMaxPlayers", "Número máximo de jogadores do servidor.", `printf("Slots: %d", GetMaxPlayers());`, ""],
  ["GetPlayerPoolSize", "**Maior ID** de jogador conectado (use em loops).", `for (new i = 0, j = GetPlayerPoolSize(); i <= j; i++) { }`, ""],
  ["SetTimer", "Roda uma função **depois de X ms** (ou repetindo).", `SetTimer("Atualizar", 1000, true);   // a cada 1 segundo`, "timer|repetir|a cada segundo"],
  ["SetTimerEx", "Timer que **passa valores** pra função. Formato: i = inteiro, f = Float, s = texto.", `SetTimerEx("Reviver", 5000, false, "i", playerid);`, "timer com parametro"],
  ["KillTimer", "**Cancela** um timer.", `KillTimer(TimerDoJogador[playerid]);`, "parar timer|cancelar timer"],
  ["CallLocalFunction", "Chama uma **public pelo nome**.", `CallLocalFunction("SalvarConta", "i", playerid);`, ""],
  ["CallRemoteFunction", "Chama uma public em **outros scripts** (gamemode e filterscripts).", `CallRemoteFunction("AvisarAdmins", "s", "Teste");`, ""],
  ["print", "Mostra um texto no **console do servidor**.", `print("Servidor iniciado.");`, "console|log no console"],
  ["printf", "Igual ao {{print}}, mas com **formatação**.", `printf("Jogador %d entrou. Total: %d", playerid, total);`, ""],
  ["GetTickCount", "Milissegundos desde que o servidor ligou. Ótimo pra **cooldown** e anti-flood.", `new UltimoComando[MAX_PLAYERS];

if (GetTickCount() - UltimoComando[playerid] < 3000)
    return SendClientMessage(playerid, -1, "Espere 3 segundos.");
UltimoComando[playerid] = GetTickCount();`, "cooldown|anti flood|tempo de espera"],
  ["gettime", "**Hora atual** real (e timestamp Unix).", `new h, m, s;
gettime(h, m, s);
new agora = gettime();   // timestamp`, "hora real|timestamp|unix"],
  ["getdate", "**Data atual** real.", `new ano, mes, dia;
getdate(ano, mes, dia);`, "data real|data de hoje"],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Objeto, pickup e texto 3D", itens: [
  ["CreateObject", "Cria um **objeto** no mapa (modelo, posição, rotação, distância de visão).", `CreateObject(19447, 1500.0, -1700.0, 13.0, 0.0, 0.0, 90.0, 300.0);`, "criar objeto|mapear|mapping"],
  ["DestroyObject", "Apaga um objeto.", `DestroyObject(obj);`, ""],
  ["MoveObject", "**Move** um objeto (portões, elevadores). Velocidade em unidades/s.", `MoveObject(Portao, 1500.0, -1700.0, 8.0, 2.0);   // desce o portão`, "portao|abrir portao|elevador"],
  ["SetObjectPos", "Teleporta um objeto.", `SetObjectPos(obj, x, y, z);`, ""],
  ["SetObjectMaterialText", "Escreve um **texto num objeto** (placas, letreiros).", `SetObjectMaterialText(placa, "WC DEV", 0, OBJECT_MATERIAL_SIZE_256x128, "Arial", 28, 1, 0xFF1E90FF, 0, OBJECT_MATERIAL_TEXT_ALIGN_CENTER);`, "texto no objeto|letreiro"],
  ["RemoveBuildingForPlayer", "**Remove prédios/objetos originais** do mapa do GTA (use no {{OnPlayerConnect}}).", `RemoveBuildingForPlayer(playerid, 1302, 0.0, 0.0, 0.0, 6000.0);   // remove todas as máquinas de refri`, "remover predio|remover objeto do gta"],
  ["EditObject", "Abre o **editor com setas** pro jogador mover o objeto.", `EditObject(playerid, obj);`, "editar objeto"],
  ["CreatePickup", "Cria um **pickup** (ícone no chão). Tipo **1** = fica sempre lá (bom pra entradas e ícones); tipo **2** = some ao pegar e volta depois de uns 30 segundos.", `CreatePickup(1239, 1, 1554.9, -1675.6, 16.2, 0);   // ícone de informação "i"`, "criar pickup|icone no chao"],
  ["DestroyPickup", "Apaga um pickup.", `DestroyPickup(pickup);`, ""],
  ["Create3DTextLabel", "**Texto 3D flutuando** no mapa.", `Create3DTextLabel("{1E90FF}Delegacia\\n{FFFFFF}Aperte F para entrar", -1, 1554.9, -1675.6, 16.5, 20.0, 0, 1);`, "texto 3d|texto flutuante|label"],
  ["Delete3DTextLabel", "Apaga um texto 3D.", `Delete3DTextLabel(label);`, ""],
  ["Update3DTextLabelText", "Muda o **texto** de um label 3D.", `Update3DTextLabelText(label, -1, "Casa à venda: $50000");`, ""],
  ["Attach3DTextLabelToPlayer", "Prende o texto 3D **em cima do jogador**.", `new Text3D:tag = Create3DTextLabel("[ADMIN]", 0xFF0000FF, 0.0, 0.0, 0.0, 20.0, 0, 1);
Attach3DTextLabelToPlayer(tag, playerid, 0.0, 0.0, 0.4);`, "tag em cima do jogador"],
  ["CreatePlayer3DTextLabel", "Texto 3D que **só um jogador** vê.", `CreatePlayer3DTextLabel(playerid, "Seu carro", -1, x, y, z, 15.0);`, ""],
  ["GangZoneCreate", "Cria uma **área colorida no radar** (território de gangue).", `new Zona = GangZoneCreate(2400.0, -1750.0, 2550.0, -1600.0);
GangZoneShowForAll(Zona, 0x00FF0088);`, "gangzone|territorio|zona no mapa|guerra de gangue"],
  ["GangZoneFlashForAll", "Faz a zona **piscar** (área em guerra).", `GangZoneFlashForAll(Zona, 0xFF000088);
GangZoneStopFlashForAll(Zona);`, "zona piscando"],
  ["GangZoneShowForPlayer", "Mostra a zona só pra um jogador.", `GangZoneShowForPlayer(playerid, Zona, 0x1E90FF88);`, ""],
  ["CreateExplosion", "Cria uma **explosão**.", `CreateExplosion(x, y, z, 12, 10.0);`, "explosao|explodir"],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Dialog e textdraw", itens: [
  ["ShowPlayerDialog", "Mostra uma **janela** (dialog). Use {{\\n}} pra separar linhas e {{\\t}} pra colunas.", `ShowPlayerDialog(playerid, 1, DIALOG_STYLE_INPUT, "Skin", "Digite o ID da skin:", "Ok", "Cancelar");`, "dialog|janela|abrir dialog|caixa"],
  ["DIALOG_STYLE_MSGBOX", "Dialog de **aviso** com 1 ou 2 botões.", `ShowPlayerDialog(playerid, 10, DIALOG_STYLE_MSGBOX, "Regras", "1. Sem cheat\\n2. Respeite todos", "Entendi", "");`, "msgbox|aviso|regras"],
  ["DIALOG_STYLE_INPUT", "Dialog com **campo de texto**.", `ShowPlayerDialog(playerid, 11, DIALOG_STYLE_INPUT, "Nome", "Digite seu nome:", "Ok", "Sair");`, "campo de texto"],
  ["DIALOG_STYLE_PASSWORD", "Campo que **esconde** o que digita (senha).", `ShowPlayerDialog(playerid, 12, DIALOG_STYLE_PASSWORD, "Login", "Senha:", "Entrar", "Sair");`, "senha|dialog de senha"],
  ["DIALOG_STYLE_LIST", "Dialog com **lista** de opções ({{listitem}} começa em 0).", `ShowPlayerDialog(playerid, 13, DIALOG_STYLE_LIST, "Menu", "Armas\\nVeículos\\nTeleportes", "Escolher", "Fechar");`, "lista|menu|dialog de lista|dialog lista"],
  ["DIALOG_STYLE_TABLIST_HEADERS", "Lista em **colunas com título** (use {{\\t}} entre colunas).", `ShowPlayerDialog(playerid, 14, DIALOG_STYLE_TABLIST_HEADERS, "Loja",
    "Item\\tPreço\\nColete\\t$500\\nKit médico\\t$300", "Comprar", "Sair");`, "tabela|tablist|loja"],
  ["TextDrawCreate", "Cria um **texto na tela** (tela de 640x448). Global: todos podem ver.", `new Text:Logo;

public OnGameModeInit()
{
    Logo = TextDrawCreate(500.0, 5.0, "WC DEV");
    TextDrawFont(Logo, 2);
    TextDrawLetterSize(Logo, 0.4, 1.6);
    TextDrawColor(Logo, 0x1E90FFFF);
    TextDrawSetOutline(Logo, 1);
    return 1;
}

public OnPlayerSpawn(playerid)
{
    TextDrawShowForPlayer(playerid, Logo);
    return 1;
}`, "textdraw|texto na tela|logo na tela|hud"],
  ["TextDrawShowForPlayer", "**Mostra** um textdraw pra um jogador.", `TextDrawShowForPlayer(playerid, Logo);`, "mostrar textdraw"],
  ["TextDrawHideForPlayer", "**Esconde** um textdraw.", `TextDrawHideForPlayer(playerid, Logo);`, "esconder textdraw"],
  ["TextDrawSetString", "Muda o **texto** do textdraw.", `TextDrawSetString(Relogio, "12:30");`, "mudar textdraw"],
  ["TextDrawFont", "**Fonte** do textdraw (0 a 3; 4 = sprite; 5 = modelo 3D).", `TextDrawFont(td, 1);`, ""],
  ["TextDrawColor", "**Cor** do textdraw.", `TextDrawColor(td, 0xFFFFFFFF);`, ""],
  ["TextDrawLetterSize", "**Tamanho das letras**.", `TextDrawLetterSize(td, 0.3, 1.2);`, ""],
  ["TextDrawUseBox", "Liga a **caixa de fundo** (cor com {{TextDrawBoxColor}}, tamanho com {{TextDrawTextSize}}).", `TextDrawUseBox(td, 1);
TextDrawBoxColor(td, 0x00000088);
TextDrawTextSize(td, 620.0, 0.0);`, "fundo do textdraw|caixa"],
  ["TextDrawSetSelectable", "Deixa o textdraw **clicável** (use com {{SelectTextDraw}}).", `TextDrawSetSelectable(Botao, 1);
SelectTextDraw(playerid, 0x1E90FFFF);`, "textdraw clicavel|botao na tela"],
  ["CreatePlayerTextDraw", "Textdraw **individual** (cada jogador vê o seu, ex: velocímetro, dinheiro).", `new PlayerText:Velo[MAX_PLAYERS];

Velo[playerid] = CreatePlayerTextDraw(playerid, 550.0, 380.0, "0 km/h");
PlayerTextDrawShow(playerid, Velo[playerid]);
PlayerTextDrawSetString(playerid, Velo[playerid], "120 km/h");`, "player textdraw|textdraw do jogador"],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Texto, número e arquivo", itens: [
  ["format", "**Monta um texto** com valores dentro: {{%d}} inteiro, {{%f}} decimal ({{%.2f}} 2 casas), {{%s}} texto, {{%i}} inteiro, {{%x}} hexadecimal, {{%%}} porcentagem.", `new msg[128];
format(msg, sizeof(msg), "%s tem $%d e %.1f de vida", nome, GetPlayerMoney(playerid), vida);
SendClientMessage(playerid, -1, msg);`, "formatar|juntar texto|%d|%s|%f|colocar variavel na mensagem"],
  ["strcmp", "**Compara textos**. Devolve **0 se forem iguais**! 3º parâmetro {{true}} ignora maiúsculas.", `if (!strcmp(texto, "oi", true)) { /* é igual */ }
if (strcmp(a, b) != 0)            { /* é diferente */ }`, "comparar texto|comparar string|texto igual"],
  ["strlen", "**Tamanho** do texto.", `if (strlen(inputtext) < 4) return SendClientMessage(playerid, -1, "Muito curto!");`, "tamanho do texto|quantos caracteres"],
  ["strval", "Converte **texto em número**.", `new id = strval(params);`, "texto para numero|converter numero|converter texto em numero|texto em numero"],
  ["valstr", "Converte **número em texto**.", `new txt[12];
valstr(txt, 250);`, "numero para texto"],
  ["floatstr", "Converte texto em **Float**.", `new Float:v = floatstr("3.5");`, ""],
  ["strfind", "**Procura** um texto dentro de outro (-1 se não achar).", `if (strfind(text, "hack", true) != -1) SendClientMessage(playerid, -1, "Palavra proibida!");`, "procurar texto|contem palavra|filtro de palavrao"],
  ["strcat", "**Junta** um texto no final de outro.", `new lista[256] = "Admins: ";
strcat(lista, "Cesar, ");
strcat(lista, "Ana");`, "concatenar|juntar strings|juntar texto|juntar textos"],
  ["strdel", "**Apaga** um pedaço do texto.", `strdel(texto, 0, 5);`, ""],
  ["strins", "**Insere** texto numa posição.", `strins(texto, "[VIP] ", 0);`, ""],
  ["strmid", "**Copia um pedaço** do texto.", `new parte[16];
strmid(parte, texto, 0, 5);`, "pedaco do texto|substring"],
  ["tolower e toupper", "Uma letra em **minúscula/maiúscula**.", `for (new i = 0; texto[i]; i++) texto[i] = toupper(texto[i]);`, "maiusculo|minusculo|tolower|toupper"],
  ["random", "Número **aleatório** de 0 até max-1.", `new sorte = random(100);        // 0 a 99
new dado = random(6) + 1;        // 1 a 6`, "aleatorio|sortear|numero aleatorio"],
  ["floatround", "**Arredonda** Float pra inteiro ({{floatround_floor}} pra baixo, {{floatround_ceil}} pra cima).", `new inteiro = floatround(vida);`, "arredondar|float para inteiro"],
  ["float", "Converte inteiro em **Float**.", `new Float:f = float(10);`, "inteiro para float"],
  ["floatsqroot", "**Raiz quadrada**.", `new Float:r = floatsqroot(16.0);`, "raiz quadrada"],
  ["floatabs", "Valor **absoluto** de um Float.", `new Float:d = floatabs(-5.0);`, ""],
  ["floatpower", "**Potência** de Float.", `new Float:p = floatpower(2.0, 3.0);   // 8.0`, "potencia"],
  ["VectorSize", "**Tamanho de um vetor** (distância entre dois pontos).", `new Float:dist = VectorSize(x1 - x2, y1 - y2, z1 - z2);`, "distancia entre pontos"],
  ["min, max e clamp", "Menor, maior, e **limitar** um valor.", `new vida = clamp(valor, 0, 100);
new maior = max(a, b);`, "limitar valor|clamp|min|max"],
  ["sizeof", "**Tamanho do array**. Use sempre no {{format}} e {{GetPlayerName}}.", `new nome[MAX_PLAYER_NAME];
GetPlayerName(playerid, nome, sizeof(nome));`, "tamanho do array"],
  ["fopen", "**Abre um arquivo** em {{scriptfiles}} ({{io_read}}, {{io_write}}, {{io_append}}).", `new File:f = fopen("log.txt", io_append);
if (f)
{
    fwrite(f, "Jogador entrou\\r\\n");
    fclose(f);
}`, "arquivo|abrir arquivo|log em arquivo|fwrite|fclose"],
  ["fread", "Lê **uma linha** de um arquivo.", `new File:f = fopen("regras.txt", io_read), linha[128];
while (fread(f, linha)) SendClientMessage(playerid, -1, linha);
fclose(f);`, "ler arquivo"],
  ["fexist", "Testa se o **arquivo existe**.", `if (fexist("Contas/Cesar.ini")) { }`, "arquivo existe"],
  ["fremove", "**Apaga** um arquivo.", `fremove("Contas/Antigo.ini");`, "apagar arquivo"],
  ["SHA256_PassHash", "Gera **hash SHA-256** da senha com salt (pra não salvar senha pura).", `new hash[65];
SHA256_PassHash(senha, "meu_salt_secreto", hash, sizeof(hash));`, "hash|hash de senha|hash da senha|criptografar senha|senha segura"],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Linguagem Pawn", itens: [
  ["new", "**Cria uma variável** (começa com 0).", `new vida = 100;
new Float:x = 1.5;
new nome[24];`, "declarar variavel"],
  ["Float: (tag)", "**Tag** pra números com vírgula. Sem ela: warning 213 e valores errados.", `new Float:vida = 75.5;
new Float:x, Float:y, Float:z;`, "float pawn|decimal|tag float"],
  ["bool: (tag)", "Tag pra **verdadeiro/falso**.", `new bool:Logado[MAX_PLAYERS];
Logado[playerid] = true;`, "true false|booleano"],
  ["const", "Variável que **não pode mudar**. Também usado em parâmetros que não serão alterados.", `const PRECO_COLETE = 500;
stock Avisar(const texto[]) { SendClientMessageToAll(-1, texto); }`, "constante"],
  ["static", "Variável que **guarda o valor** entre chamadas (ou fica visível só neste arquivo).", `stock Contar()
{
    static vezes;
    vezes++;
    return vezes;
}`, "variavel estatica"],
  ["#define", "Cria um **apelido/atalho** que o compilador troca antes de compilar. Também cria macros com parâmetros ({{%0}}, {{%1}}).", `#define COR_ERRO 0xFF0000FF
#define DIALOG_LOGIN 1
#define Erro(%0,%1) SendClientMessage(%0, COR_ERRO, %1)

Erro(playerid, "Você não pode fazer isso!");`, "define|macro|constante define"],
  ["#include", "**Importa** um arquivo .inc (de {{pawno/include}}). Com aspas, procura na pasta do script.", `#include <a_samp>
#include <zcmd>
#include "meus_sistemas/casas.inc"`, "include|importar"],
  ["#pragma", "Dá instruções ao compilador.", `#pragma unused params           // tira o warning 203
#pragma tabsize 0               // desliga o warning 217 de indentação (melhor arrumar!)
#pragma dynamic 8192            // mais memória pra strings grandes`, "pragma unused|tabsize"],
  ["#if / #endif", "**Compilação condicional**: só compila o trecho se a condição for verdadeira.", `#define DEBUG 1

#if DEBUG == 1
    print("Modo debug ligado");
#endif`, "#if|#endif|#ifdef|#undef"],
  ["enum", "Lista de **nomes ligados a posições**. Muito usado pra dados de jogadores, casas, carros.", `enum E_CASA { cDono[24], cPreco, Float:cX, Float:cY, Float:cZ, bool:cAVenda }
new Casa[100][E_CASA];
Casa[0][cPreco] = 50000;`, "enumerador|enum casas"],
  ["array 2D", "Array de **duas dimensões** (tabela).", `new Spawns[3][3] = {
    {1958, 1343, 15},
    {2495, -1688, 13},
    {-1418, -295, 14}
};
new Float:SpawnsF[][3] = { {1958.4, 1343.2, 15.4}, {2495.3, -1688.0, 13.6} };`, "matriz|array de arrays|array bidimensional"],
  ["operadores", "Contas: {{+ - * /}}, resto {{%}}, {{++}} {{--}}, {{+=}} {{-=}}. Comparação: {{==}} {{!=}} {{<}} {{>}}. Lógicos: {{&&}} {{||}} {{!}}.", `new par = (numero % 2 == 0);
contador++;
dinheiro -= 100;`, "operador|resto da divisao|incrementar"],
  ["operadores de bit", "{{&}} (e), {{|}} (ou), {{^}} (xor), {{~}} (não), {{<<}} {{>>}}. Usados nas **teclas** e em flags.", `if (newkeys & KEY_FIRE) { /* segurando atirar */ }
new flags = 0;
flags |= 1 << 3;   // liga o bit 3`, "bitwise|bits|flags"],
  ["operador ternário", "**If em uma linha**: condição ? se verdade : se falso.", `new txt[8];
format(txt, sizeof(txt), "%s", (Jogador[playerid][jVip]) ? ("Sim") : ("Não"));`, "ternario|if em uma linha"],
  ["while e do-while", "Repete **enquanto** for verdade. O {{do}} roda pelo menos uma vez.", `new i = 0;
do
{
    printf("%d", i);
    i++;
}
while (i < 5);`, "do while|enquanto"],
  ["break e continue", "{{break}} **sai** do loop; {{continue}} **pula** pra próxima volta.", `for (new i = 0; i < MAX_PLAYERS; i++)
{
    if (!IsPlayerConnected(i)) continue;
    if (Jogador[i][jAdmin] > 0) { printf("Primeiro admin: %d", i); break; }
}`, "sair do loop|pular volta"],
  ["return", "**Termina** a função e devolve um valor. Nos callbacks, o valor muda o comportamento (ex: {{OnPlayerText}} retornando 0 bloqueia a mensagem).", `stock Dobro(n) return n * 2;`, "retornar|retorno"],
  ["stock", "Função **sua** que não gera aviso se não for usada. Perfeita pra includes.", `stock bool:EhVip(playerid) return Jogador[playerid][jVip] > 0;`, "funcao stock"],
  ["public", "Função que pode ser chamada **pelo nome** (callbacks, timers, CallLocalFunction). Precisa de {{forward}}.", `forward AtualizarHud(playerid);
public AtualizarHud(playerid) { return 1; }`, "funcao publica"],
  ["forward", "**Declara** uma public antes de usar. Sem ele: warning 235.", `forward Payday();`, "declarar public"],
  ["native", "Função que vem do **servidor ou de um plugin** (escrita em C++). Fica nos includes.", `native SendClientMessage(playerid, color, const message[]);`, "nativa|funcao nativa"],
  ["parâmetro por referência (&)", "Com {{&}}, a função **muda a variável** de quem chamou.", `stock Trocar(&a, &b)
{
    new t = a;
    a = b;
    b = t;
}`, "referencia|&|passar por referencia"],
  ["parâmetro padrão", "Parâmetro com **valor padrão** e {{...}} pra vários argumentos.", `stock Avisar(playerid, const msg[], cor = -1)
{
    SendClientMessage(playerid, cor, msg);
}`, "valor padrao"],
  ["char e strings compactadas", "{{char}} guarda 4 caracteres por célula (economiza memória). Pra ler cada letra use chaves no lugar dos colchetes. Pra iniciantes: use strings normais.", `new texto[32 char];
strpack(texto, "Olá");`, "strpack|strunpack|string compactada"],
  ["goto", "Pula pra um rótulo. ⚠️ **Evite**: deixa o código confuso.", ``, ""],
  ["comentários", "{{//}} comenta uma linha; {{/* ... */}} comenta várias.", `// isto é um comentário
/* isto também,
   em várias linhas */`, "comentario pawn|comentar"],
  ["indentação", "Use **4 espaços** (ou 1 TAB) por nível e **não misture**. Misturar dá **warning 217: loose indentation**.", `public OnPlayerSpawn(playerid)
{
    if (Jogador[playerid][jVip])
    {
        GivePlayerWeapon(playerid, 31, 200);
    }
    return 1;
}`, "identacao|warning 217|organizar codigo"],
  ["INVALID_PLAYER_ID", "Valor que significa **\"nenhum jogador\"** (65535).", `if (killerid == INVALID_PLAYER_ID) { /* suicídio/queda */ }`, "jogador invalido"],
  ["INVALID_VEHICLE_ID", "Valor que significa **\"nenhum veículo\"**.", `new Carro[MAX_PLAYERS] = {INVALID_VEHICLE_ID, ...};`, ""],
  ["MAX_PLAYERS", "Número máximo de jogadores (padrão 1000). **Redefina** pro tamanho real do seu servidor e economize memória.", `#include <a_samp>
#undef MAX_PLAYERS
#define MAX_PLAYERS 100`, "max players|limite de jogadores"],
  ["MAX_PLAYER_NAME", "Tamanho máximo do **nome** (24).", `new nome[MAX_PLAYER_NAME];`, ""],
  ["playerid", "O **ID do jogador** (0, 1, 2...). Todo jogador conectado tem um, e ele é reaproveitado quando alguém sai.", `SendClientMessage(playerid, -1, "Esse é você!");`, "id do jogador"],
  ["gamemode e filterscript", "**Gamemode**: o modo principal (só 1 rodando). **Filterscript**: scripts extras (mapas, admin) que rodam junto e podem ser ligados/desligados com {{/rcon loadfs}}.", ``, "filterscripts|diferenca gamemode filterscript"],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Include e plugin", itens: [
  ["a_samp", "Include **principal** do SA-MP, com todas as funções do jogo. Sempre o primeiro.", `#include <a_samp>`, "a_samp.inc"],
  ["open.mp include", "No **open.mp**, use o include novo (compatível com o código antigo).", `#include <open.mp>`, "omp|include openmp"],
  ["zcmd", "Processador de **comandos rápido** e fácil: cada comando vira uma função {{CMD:nome}}.", `#include <zcmd>

CMD:ajuda(playerid, params[])
{
    SendClientMessage(playerid, -1, "/vida /carro /tp");
    return 1;
}`, "cmd:|comandos zcmd|izcmd"],
  ["Pawn.CMD", "Plugin de comandos **ainda mais rápido** que o zcmd, com a mesma sintaxe e aliases.", `#include <Pawn.CMD>

CMD:vida(playerid, params[]) { SetPlayerHealth(playerid, 100.0); return 1; }
alias:vida("hp", "curar");`, "pawncmd|alias"],
  ["sscanf", "Plugin que **separa parâmetros** dos comandos. Especificadores: {{u}} jogador, {{i}}/{{d}} inteiro, {{f}} Float, {{s[n]}} texto, {{c}} caractere, {{I(0)}} opcional.", `#include <sscanf2>

CMD:pm(playerid, params[])
{
    new id, msg[100];
    if (sscanf(params, "us[100]", id, msg)) return SendClientMessage(playerid, -1, "Use: /pm [id] [mensagem]");
    if (id == INVALID_PLAYER_ID) return SendClientMessage(playerid, -1, "Jogador não encontrado.");
    SendClientMessage(id, 0xFFFF00FF, msg);
    return 1;
}`, "sscanf2|parametros|separar parametros"],
  ["foreach", "Loop **rápido** só pelos jogadores online (do YSI ou standalone).", `#include <foreach>

foreach (new i : Player)
{
    SendClientMessage(i, -1, "Oi!");
}`, "y_iterate|iterator"],
  ["streamer", "Plugin do Incognito pra criar **milhares de objetos**, pickups e textos (o SA-MP sozinho tem limite). Funções {{CreateDynamic...}}.", `#include <streamer>

CreateDynamicObject(19447, 1500.0, -1700.0, 13.0, 0.0, 0.0, 0.0);
CreateDynamicPickup(1239, 1, 1554.9, -1675.6, 16.2);
CreateDynamic3DTextLabel("Loja", -1, 1500.0, -1700.0, 14.0, 20.0);
CreateDynamicCP(1810.0, -1890.0, 13.4, 3.0);`, "createdynamicobject|objetos dinamicos|limite de objetos"],
  ["DOF2", "Include **brasileiro** popular pra salvar contas em arquivos .ini. Funções: {{DOF2_CreateFile}}, {{DOF2_SetInt}}, {{DOF2_GetInt}}, {{DOF2_SetString}}, {{DOF2_GetString}}, {{DOF2_SetFloat}}, {{DOF2_FileExists}}, {{DOF2_SaveFile}}, {{DOF2_Exit}}.", `DOF2_SetFloat(arq, "PosX", x);
new Float:px = DOF2_GetFloat(arq, "PosX");`, "dof2 pawn|salvar em ini"],
  ["DOF2_SetInt", "Salva um **número** no arquivo.", `DOF2_SetInt("Contas/Cesar.ini", "Level", 5);`, "salvar numero"],
  ["DOF2_GetInt", "Lê um **número** do arquivo.", `new level = DOF2_GetInt("Contas/Cesar.ini", "Level");`, "ler numero"],
  ["DOF2_SetString", "Salva um **texto**.", `DOF2_SetString(arq, "Email", "ana@email.com");`, ""],
  ["DOF2_GetString", "Lê um **texto**.", `new email[64];
format(email, sizeof(email), "%s", DOF2_GetString(arq, "Email"));`, ""],
  ["DOF2_Exit", "**Grava tudo** e fecha. Chame no {{OnGameModeExit}}, senão perde dados!", `public OnGameModeExit() { DOF2_Exit(); return 1; }`, ""],
  ["y_ini", "Sistema de arquivos .ini do **YSI** (rápido).", `#include <YSI_Storage\\y_ini>

new INI:f = INI_Open("Contas/Cesar.ini");
INI_WriteInt(f, "Dinheiro", 500);
INI_Close(f);`, "ysi|ini_writeint"],
  ["dini", "Include **antigo** de arquivos (lento). Prefira DOF2 ou y_ini.", `dini_IntSet("conta.ini", "Grana", 100);`, ""],
  ["MySQL (plugin BlueG)", "Banco de dados **profissional**. Conecte no {{OnGameModeInit}}.", `#include <a_mysql>

new MySQL:Conexao;

public OnGameModeInit()
{
    Conexao = mysql_connect("127.0.0.1", "root", "senha", "meu_servidor");
    if (mysql_errno(Conexao) != 0) print("[MySQL] Falha ao conectar!");
    return 1;
}`, "mysql|a_mysql|banco de dados|mysql_connect"],
  ["mysql_tquery", "Executa uma **consulta SQL** sem travar o servidor; o resultado chega numa public.", `new query[128];
mysql_format(Conexao, query, sizeof(query), "SELECT * FROM contas WHERE nome = '%e' LIMIT 1", nome);
mysql_tquery(Conexao, query, "AoCarregarConta", "i", playerid);

forward AoCarregarConta(playerid);
public AoCarregarConta(playerid)
{
    if (cache_num_rows() == 0) return MostrarRegistro(playerid);
    cache_get_value_name_int(0, "dinheiro", Jogador[playerid][jDinheiro]);
    return 1;
}`, "query|consulta sql|select|mysql_format|cache_get_value"],
  ["mysql_format", "Monta uma query **segura**: {{%e}} escapa o texto contra **SQL injection**.", `mysql_format(Conexao, q, sizeof(q), "UPDATE contas SET dinheiro = %d WHERE id = %d", grana, Jogador[playerid][jID]);`, "sql injection|%e"],
  ["bcrypt", "Plugin pra **hash de senha** muito seguro (melhor que SHA-256 puro).", `bcrypt_hash(playerid, "AoGerarHash", senha, 12);`, "senha segura|criptografia"],
  ["crashdetect", "Plugin que mostra **onde o script travou** ou deu erro de runtime (array fora do limite...). Indispensável pra debugar.", `// no server.cfg (não é código Pawn):
// plugins crashdetect.dll sscanf.dll streamer.dll`, "debug|debugar|crash|servidor travando"],
  ["easyDialog", "Include que deixa os **dialogs mais organizados** (sem IDs numéricos).", `Dialog_Show(playerid, Regras, DIALOG_STYLE_MSGBOX, "Regras", "Sem cheat!", "Ok", "");

Dialog:Regras(playerid, response, listitem, inputtext[])
{
    return 1;
}`, "dialog organizado"],
  ["sampctl", "Ferramenta de linha de comando pra **baixar includes, compilar e rodar** o servidor automaticamente.", `// no terminal (não é código Pawn):
// sampctl package init
// sampctl package ensure
// sampctl package build
// sampctl package run`, "gerenciador de pacotes"],
  ["como instalar um plugin", "1) Coloque o **.dll** (Windows) ou **.so** (Linux) na pasta {{plugins}}. 2) Coloque o **.inc** em {{pawno/include}}. 3) Adicione no {{server.cfg}} na linha {{plugins}}. 4) Dê {{#include}} no script e compile.", `// linha do server.cfg:
// plugins sscanf.dll streamer.dll mysql.dll`, "instalar plugin|plugin nao carrega|instalar include"],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Erro do compilador", itens: [
  ["error 001", "**expected token**: faltou algo, quase sempre o **;** no fim da linha anterior, ou um parêntese.", `// errado
new vida = 100
// certo
new vida = 100;`, "expected token|faltou ponto e virgula"],
  ["error 004", "**function is not implemented**: chamou uma função que **não existe** (nome errado, ou faltou o {{#include}} dela).", ``, "function is not implemented|funcao nao implementada"],
  ["error 010", "**invalid function or declaration**: tem código **fora de uma função**, ou uma chave sobrando/faltando antes.", `// errado: comando solto no meio do arquivo
SendClientMessage(playerid, -1, "oi");`, "invalid function or declaration"],
  ["error 012", "**invalid function call, not a valid address**: chamou algo como função que não é função.", ``, "invalid function call"],
  ["error 017", "**undefined symbol**: usou uma **variável ou função que não existe**. Confira o nome (maiúsculas importam!) ou se faltou criar/incluir.", `// errado
SendClientMesage(playerid, -1, "oi");   // faltou um "s"`, "undefined symbol|simbolo indefinido"],
  ["error 020", "**invalid symbol name**: nome de variável inválido (começa com número ou tem caractere estranho).", ``, "invalid symbol name"],
  ["error 021", "**symbol already defined**: criou **duas coisas com o mesmo nome** (variável, função ou comando repetido).", ``, "already defined|ja definido|comando repetido"],
  ["error 025", "**function heading differs from prototype**: o callback está com **parâmetros diferentes** do original. Copie o cabeçalho certinho.", `// certo:
public OnPlayerDeath(playerid, killerid, reason)`, "heading differs from prototype"],
  ["error 029", "**invalid expression, assumed zero**: expressão quebrada (parênteses, operador sobrando...).", ``, "invalid expression"],
  ["error 030", "**compound statement not closed at the end of file**: faltou **fechar uma chave** em algum lugar.", ``, "compound statement not closed|faltou fechar chave"],
  ["error 032", "**array index out of bounds**: usou uma posição maior que o tamanho do array.", `new a[3];
a[3] = 1;   // erro: vai de 0 a 2`, "index out of bounds|fora do limite"],
  ["error 033", "**array must be indexed**: usou o array inteiro onde precisa de um valor, ou tentou comparar strings com {{==}}. Use {{strcmp}}!", `// errado
if (texto == "oi")
// certo
if (!strcmp(texto, "oi"))`, "array must be indexed|comparar string com =="],
  ["error 035", "**argument type mismatch**: passou o **tipo errado** pra função (ex: número onde precisa de texto).", ``, "argument type mismatch"],
  ["error 036", "**empty statement**: tem um {{;}} sozinho onde não deveria (ex: {{if (x);}}).", ``, "empty statement"],
  ["error 047", "**array sizes do not match**: tentou copiar um array pra outro de tamanho diferente.", ``, "array sizes do not match"],
  ["error 054", "**unmatched closing brace**: tem uma **chave fechando sobrando**.", ``, "unmatched closing brace|chave sobrando"],
  ["error 075", "**input line too long**: linha grande demais (ex: dialog enorme). Quebre o texto em partes com {{strcat}}.", ``, "input line too long|linha muito grande"],
  ["fatal error 100", "**cannot read from file**: o {{#include}} não foi achado. Coloque o .inc na pasta {{pawno/include}} e confira o nome.", `#include <zcmd>   // zcmd.inc precisa estar em pawno/include`, "cannot read from file|include nao encontrado"],
  ["warning 202", "**number of arguments does not match definition**: passou **argumentos a mais ou a menos**.", ``, "number of arguments does not match"],
  ["warning 203", "**symbol is never used**: criou uma variável e não usou. Apague, ou use {{#pragma unused}}.", ``, "symbol is never used|params nunca usado"],
  ["warning 204", "**symbol is assigned a value that is never used**: deu valor e nunca leu.", ``, "assigned a value that is never used"],
  ["warning 209", "**function should return a value**: a função às vezes retorna valor e às vezes não. Coloque {{return}} em todos os caminhos.", ``, "should return a value"],
  ["warning 211", "**possibly unintended assignment**: usou {{=}} dentro do {{if}}. Pra comparar é {{==}}!", `// errado
if (vida = 100)
// certo
if (vida == 100)`, "unintended assignment"],
  ["warning 213", "**tag mismatch**: misturou Float com inteiro, ou faltou a tag {{Float:}}.", `// errado
new vida = 100.0;
SetPlayerHealth(playerid, 100);
// certo
new Float:vida = 100.0;
SetPlayerHealth(playerid, 100.0);`, "tag mismatch"],
  ["warning 215", "**expression has no effect**: uma linha que não faz nada (ex: {{a == 5;}}).", ``, "expression has no effect"],
  ["warning 217", "**loose indentation**: indentação bagunçada (TAB misturado com espaço). Arrume os espaços.", ``, "loose indentation"],
  ["warning 219", "**local variable shadows a variable at a preceding level**: criou uma variável local com o **mesmo nome** de outra.", ``, "shadows a variable"],
  ["warning 235", "**public function lacks forward declaration**: faltou o {{forward}} antes da public.", `forward MinhaFuncao();
public MinhaFuncao() { }`, "lacks forward declaration"],
  ["Pawn compiler crashou", "Quando o compilador **fecha sozinho** sem mensagem: geralmente é array gigante, string sem fechar aspas, ou macro errado. Comente partes do código até achar.", ``, "pawno fecha|compilador travou|pawno crash"],
  ["Run time error 4", "**Array index out of bounds** durante o jogo (aparece com o crashdetect). Confira se o índice está dentro do tamanho do array, ex: {{playerid}} = 65535 ({{INVALID_PLAYER_ID}}).", ``, "runtime error|array index out of bounds runtime"],
  ["SERVER: Unknown command", "O comando **não existe** ou retornou 0. Confira o nome, se o script compilou e se o {{OnPlayerCommandText}} retorna 1.", ``, "unknown command|comando nao funciona"],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "IDs úteis", itens: [
  ["ids de armas", "IDs das **armas** pro {{GivePlayerWeapon}}.", `// Brancas: 1 Soco-inglês, 2 Taco de golfe, 3 Cassetete, 4 Faca, 5 Bastão,
//          6 Pá, 7 Taco de sinuca, 8 Katana, 9 Motosserra, 15 Bengala
// Arremesso: 16 Granada, 17 Gás lacrimogêneo, 18 Molotov, 39 Bomba remota (40 = detonador)
// Pistolas:  22 9mm, 23 9mm silenciada, 24 Desert Eagle
// Escopetas: 25 Shotgun, 26 Sawnoff, 27 Combat Shotgun (SPAS)
// Submetralhadoras: 28 Micro Uzi, 29 MP5, 32 Tec-9
// Fuzis:     30 AK-47, 31 M4
// Rifles:    33 Country Rifle, 34 Sniper
// Pesadas:   35 RPG, 36 Lança-mísseis, 37 Lança-chamas, 38 Minigun
// Outros:    41 Spray, 42 Extintor, 43 Câmera, 44 Visão noturna, 45 Visão térmica, 46 Paraquedas`, "id de arma|armas ids|weapon id|id da m4|id da deagle|id da ak|lista de armas"],
  ["ids de motivo de morte", "Além dos IDs de arma, o {{reason}} do {{OnPlayerDeath}} pode ser:", `// 49 = atropelado por veículo
// 50 = hélice de helicóptero
// 51 = explosão
// 53 = afogado
// 54 = queda (splat)
// 255 = suicídio / desconhecido`, "reason|motivo da morte"],
  ["ids de carros populares", "Carros **esportivos e comuns** mais usados.", `// 411 Infernus   415 Cheetah    429 Banshee   451 Turismo   506 Super GT
// 541 Bullet     560 Sultan     562 Elegy     559 Jester    477 ZR-350
// 402 Buffalo    603 Phoenix    602 Alpha     565 Flash     494 Hotring
// 400 Landstalker 405 Sentinel  445 Admiral   567 Savanna   536 Blade
// 535 Slamvan    556 Monster    571 Kart      471 Quadriciclo`, "ids de veiculos|id do infernus|id do sultan|id de carro|lista de carros|ids de veiculos"],
  ["ids de motos e bikes", "**Motos e bicicletas**.", `// 522 NRG-500   521 FCR-900   461 PCJ-600   463 Freeway   468 Sanchez
// 581 BF-400    586 Wayfarer  462 Faggio    448 Pizzaboy  523 HPV1000 (polícia)
// 481 BMX       509 Bike      510 Mountain Bike`, "id de moto|id da nrg|motos|bicicleta"],
  ["ids de veículos de serviço", "**Polícia, ambulância, bombeiro, táxi, ônibus, trabalho**.", `// 596 Viatura LS   597 Viatura SF   598 Viatura LV   599 Ranger (polícia)
// 601 SWAT         427 Enforcer     490 FBI Rancher  523 Moto da polícia
// 416 Ambulância   407 Bombeiro     420 Táxi         438 Cabbie
// 431 Ônibus       437 Coach        408 Caminhão de lixo
// 525 Guincho      455 Flatbed      514 Tanker       515 Roadtrain
// 403 Linerunner   578 DFT-30       574 Varredor     531 Trator
// 432 Tanque Rhino 433 Barracks (exército)`, "viatura|id da viatura|ambulancia|bombeiro|taxi|onibus|caminhao|tanque"],
  ["ids de aviões e helicópteros", "Veículos **aéreos**.", `// Aviões: 520 Hydra   519 Shamal   553 Nevada   592 Andromada
//         593 Dodo    511 Beagle   513 Stuntplane  476 Rustler  460 Skimmer
// Helicópteros: 487 Maverick   497 Maverick da polícia   469 Sparrow
//               425 Hunter     548 Cargobob    563 Raindance  447 Seasparrow`, "aviao|helicoptero|id do hydra|id do maverick|hunter"],
  ["ids de barcos", "Veículos **aquáticos**.", `// 446 Squalo   452 Speeder   473 Dinghy   493 Jetmax   484 Marquis
// 453 Reefer   454 Tropic    430 Predator (polícia)   472 Coastguard   595 Launch`, "barco|lancha|jet ski"],
  ["ids de skins", "**Skins** mais usadas (vão de 0 a 311; a 74 não existe).", `// 0 CJ   270 Sweet   271 Ryder   269 Big Smoke   294 Woozie
// Polícia: 280 LSPD, 281 SFPD, 282 LVPD, 283 Xerife, 284 Moto, 285 SWAT, 286 FBI, 287 Exército
// Médicos: 274, 275, 276      Bombeiros: 277, 278, 279
// Grove: 105, 106, 107        Ballas: 102, 103, 104
// Vagos: 108, 109, 110        Aztecas: 114, 115, 116`, "skin|id de skin|skins|id da skin de policia|roupa"],
  ["coordenadas famosas", "Posições conhecidas do mapa (**aproximadas**; ajuste com {{/save}} no jogo).", `// Grove Street ......... 2495.3, -1688.0, 13.6
// Prefeitura de LS ..... 1481.0, -1772.0, 18.8
// Delegacia de LS ...... 1554.9, -1675.6, 16.2
// Hospital de LS ....... 1172.0, -1323.0, 15.4
// Aeroporto de LS ...... 1685.0, -2335.0, 13.5
// Monte Chiliad (topo) . -2321.6, -1639.8, 483.7
// Aeroporto de SF ...... -1418.0, -295.0, 14.1
// Aeroporto de LV ...... 1319.0, 1253.0, 10.8
// Spawn de LV (padrão) . 1958.4, 1343.2, 15.4`, "coordenada|posicoes|lugares|locais do mapa|grove street|chiliad"],
  ["interiores famosos", "Interiores com **ID de interior** e posição (**aproximadas**). Use {{SetPlayerInterior}} + {{SetPlayerPos}}.", `// Ammu-Nation ......... int 1  | 286.1, -40.6, 1001.5
// Delegacia (LSPD) .... int 6  | 246.8, 62.3, 1003.6
// Casa do CJ .......... int 3  | 2496.0, -1692.1, 1014.7
// Academia Ganton ..... int 5  | 772.1, -3.9, 1000.7
// Boate Alhambra ...... int 17 | 493.4, -22.7, 1000.6
// Cassino Four Dragons  int 10 | 2016.2, 1017.1, 996.9
// Cassino Caligula's .. int 1  | 2233.8, 1714.7, 1012.4
// Burger Shot ......... int 10 | 375.7, -65.8, 1001.5
// Motel Jefferson ..... int 15 | 2215.5, -1150.5, 1025.8`, "interior|interiores|id de interior|dentro de predio|ammu|ammu-nation|interior da ammu|delegacia por dentro"],
  ["ids de ícones do mapa", "Alguns ícones pro {{SetPlayerMapIcon}} (a lista completa vai até 63).", `// 6 Ammu-Nation   10 Burger Shot   22 Hospital   30 Polícia`, "map icon id|icone"],
  ["ids de sons", "Sons pro {{PlayerPlaySound}}. O mais usado é o **1057** (o \"plim\" de confirmação). A lista completa de IDs está na wiki do open.mp (open.mp/docs).", `PlayerPlaySound(playerid, 1057, 0.0, 0.0, 0.0);`, "som id|id de som"],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Constante", itens: [
  ["PLAYER_STATE", "**Estados** do jogador ({{GetPlayerState}} e {{OnPlayerStateChange}}).", `// PLAYER_STATE_ONFOOT       // a pé
// PLAYER_STATE_DRIVER       // motorista
// PLAYER_STATE_PASSENGER    // passageiro
// PLAYER_STATE_WASTED       // morto
// PLAYER_STATE_SPAWNED      // acabou de nascer
// PLAYER_STATE_SPECTATING   // espectador`, "player_state_driver|player_state_onfoot|estados do jogador"],
  ["KEY_YES", "Tecla **Y**.", `if (PRESSED(KEY_YES)) { }`, "tecla y"],
  ["KEY_NO", "Tecla **N**.", `if (PRESSED(KEY_NO)) { }`, "tecla n"],
  ["KEY_CTRL_BACK", "Tecla **H**.", `if (PRESSED(KEY_CTRL_BACK)) { }`, "tecla h"],
  ["KEY_SECONDARY_ATTACK", "Tecla **F / Enter** (entrar em carro).", `if (PRESSED(KEY_SECONDARY_ATTACK)) { }`, "tecla f|tecla enter"],
  ["KEY_FIRE", "**Atirar** (botão esquerdo / Ctrl).", `if (newkeys & KEY_FIRE) { }`, "atirar|botao esquerdo"],
  ["KEY_SPRINT", "**Correr** (Espaço a pé) / acelerar no carro.", `if (PRESSED(KEY_SPRINT)) { }`, "correr|espaco"],
  ["KEY_JUMP", "**Pular** (Shift).", `if (PRESSED(KEY_JUMP)) { }`, "pular|shift"],
  ["KEY_CROUCH", "**Agachar** (C) / buzina no carro.", `if (PRESSED(KEY_CROUCH)) { }`, "agachar|buzina"],
  ["KEY_WALK", "**Andar devagar** (Alt).", `if (PRESSED(KEY_WALK)) { }`, "alt|andar"],
  ["KEY_HANDBRAKE", "**Mirar** (botão direito) / freio de mão no carro.", `if (newkeys & KEY_HANDBRAKE) { }`, "mirar|freio de mao|botao direito"],
  ["SPECIAL_ACTION", "Ações especiais pro {{SetPlayerSpecialAction}}.", `// SPECIAL_ACTION_NONE
// SPECIAL_ACTION_USEJETPACK
// SPECIAL_ACTION_HANDSUP        // mãos pra cima
// SPECIAL_ACTION_CUFFED         // algemado
// SPECIAL_ACTION_USECELLPHONE   // celular
// SPECIAL_ACTION_SMOKE_CIGGY
// SPECIAL_ACTION_DRINK_BEER
// SPECIAL_ACTION_DANCE1         // até DANCE4
// SPECIAL_ACTION_CARRY          // carregando caixa`, "maos pra cima|celular|special_action_cuffed"],
  ["bodypart", "Partes do corpo no {{OnPlayerTakeDamage}}.", `// 3 tronco   4 virilha   5 braço esquerdo   6 braço direito
// 7 perna esquerda   8 perna direita   9 cabeça`, "parte do corpo|cabeca"],
  ["cores prontas", "Cores pra usar no {{SendClientMessage}}.", `#define COR_BRANCO   0xFFFFFFFF
#define COR_PRETO    0x000000FF
#define COR_VERMELHO 0xFF0000FF
#define COR_VERDE    0x33AA33FF
#define COR_AZUL     0x1E90FFFF
#define COR_AMARELO  0xFFFF00FF
#define COR_LARANJA  0xFF9900FF
#define COR_ROXO     0xC2A2DAFF
#define COR_CINZA    0xAFAFAFFF
#define COR_ROSA     0xFF66FFFF
#define COR_ADMIN    0xFF6347FF`, "cor|lista de cores|codigos de cores|define cor"],
  ["cores do GameText", "Códigos de cor e formatação no {{GameTextForPlayer}} e textdraws.", `// ~r~ vermelho   ~g~ verde   ~b~ azul   ~y~ amarelo
// ~p~ roxo       ~w~ branco  ~l~ preto  ~h~ deixa mais claro
// ~n~ pula linha   ~k~~VEHICLE_ENTER_EXIT~ mostra a tecla configurada`, "~r~|~g~|cor do gametext|~n~"],
]});

WCDEV.refs.push({ lang: "pawn", grupo: "Sistema pronto", itens: [
  ["comando /kill", "Comando pra **se matar**.", `CMD:kill(playerid, params[])
{
    #pragma unused params
    SetPlayerHealth(playerid, 0.0);
    return 1;
}`, "/kill|se matar|suicidio"],
  ["comando /heal", "**Vida e colete** cheios.", `CMD:heal(playerid, params[])
{
    #pragma unused params
    SetPlayerHealth(playerid, 100.0);
    SetPlayerArmour(playerid, 100.0);
    SendClientMessage(playerid, 0x33AA33FF, "Vida e colete recuperados!");
    return 1;
}`, "/heal|/vida|comando de vida"],
  ["comando /fix", "**Consertar** o veículo.", `CMD:fix(playerid, params[])
{
    #pragma unused params
    if (!IsPlayerInAnyVehicle(playerid)) return SendClientMessage(playerid, -1, "Você não está num veículo.");
    RepairVehicle(GetPlayerVehicleID(playerid));
    SendClientMessage(playerid, 0x33AA33FF, "Veículo consertado!");
    return 1;
}`, "consertar veiculo|/reparar"],
  ["comandos /me e /do", "Comandos de **roleplay**: ação e descrição, ouvidos só por perto.", `stock MensagemPerto(playerid, Float:raio, cor, const msg[])
{
    new Float:x, Float:y, Float:z;
    GetPlayerPos(playerid, x, y, z);
    foreach (new i : Player)
        if (IsPlayerInRangeOfPoint(i, raio, x, y, z)) SendClientMessage(i, cor, msg);
}

CMD:me(playerid, params[])
{
    if (isnull(params)) return SendClientMessage(playerid, -1, "Use: /me [ação]");
    new nome[MAX_PLAYER_NAME], msg[144];
    GetPlayerName(playerid, nome, sizeof(nome));
    format(msg, sizeof(msg), "* %s %s", nome, params);
    MensagemPerto(playerid, 20.0, 0xC2A2DAFF, msg);
    return 1;
}`, "/me|/do|roleplay|rp|chat local"],
  ["comando /pm", "**Mensagem privada** entre jogadores.", `CMD:pm(playerid, params[])
{
    new id, texto[100], nome[MAX_PLAYER_NAME], msg[144];
    if (sscanf(params, "us[100]", id, texto)) return SendClientMessage(playerid, -1, "Use: /pm [id] [mensagem]");
    if (id == INVALID_PLAYER_ID || id == playerid) return SendClientMessage(playerid, -1, "ID inválido.");
    GetPlayerName(playerid, nome, sizeof(nome));
    format(msg, sizeof(msg), "[PM de %s]: %s", nome, texto);
    SendClientMessage(id, 0xFFFF00FF, msg);
    SendClientMessage(playerid, 0xFFFF00FF, "Mensagem enviada.");
    return 1;
}`, "mensagem privada|/pm|privado"],
  ["comando /admins", "Lista os **admins online**.", `CMD:admins(playerid, params[])
{
    #pragma unused params
    new nome[MAX_PLAYER_NAME], msg[64], total;
    SendClientMessage(playerid, 0x1E90FFFF, "--- Admins online ---");
    foreach (new i : Player)
    {
        if (Jogador[i][jAdmin] < 1) continue;
        GetPlayerName(i, nome, sizeof(nome));
        format(msg, sizeof(msg), "%s (nível %d)", nome, Jogador[i][jAdmin]);
        SendClientMessage(playerid, -1, msg);
        total++;
    }
    if (!total) SendClientMessage(playerid, -1, "Nenhum admin online.");
    return 1;
}`, "/admins|admins online|lista de admins"],
  ["anti-flood no chat", "Impede **spam** no chat.", `new UltimaMsg[MAX_PLAYERS];

public OnPlayerText(playerid, text[])
{
    if (GetTickCount() - UltimaMsg[playerid] < 1500)
    {
        SendClientMessage(playerid, 0xFF0000FF, "Não faça flood!");
        return 0;
    }
    UltimaMsg[playerid] = GetTickCount();
    return 1;
}`, "antiflood|anti flood|anti spam|flood"],
  ["mensagens automáticas", "**Avisos** que giram a cada X minutos.", `new const Avisos[][] = {
    "{1E90FF}[DICA] {FFFFFF}Use /ajuda pra ver os comandos.",
    "{1E90FF}[DICA] {FFFFFF}Respeite as regras: /regras",
    "{1E90FF}[DICA] {FFFFFF}Entre no nosso Discord!"
};

forward GirarAvisos();
public GirarAvisos()
{
    static i;
    SendClientMessageToAll(-1, Avisos[i]);
    i = (i + 1) % sizeof(Avisos);
}

// no OnGameModeInit:
SetTimer("GirarAvisos", 180000, true);`, "anuncios automaticos|mensagem automatica|dicas automaticas"],
  ["sistema de payday", "**Salário** de hora em hora.", `forward Payday();
public Payday()
{
    foreach (new i : Player)
    {
        new salario = 500 + GetPlayerScore(i) * 50;
        GivePlayerMoney(i, salario);
        GameTextForPlayer(i, "~g~PAYDAY!", 3000, 1);
    }
}

// no OnGameModeInit:
SetTimer("Payday", 3600000, true);   // 1 hora`, "payday|salario|pagamento"],
  ["sistema de VIP", "Benefícios pra **jogadores VIP**.", `// no enum: jVip
public OnPlayerSpawn(playerid)
{
    if (Jogador[playerid][jVip])
    {
        SetPlayerArmour(playerid, 100.0);
        GivePlayerWeapon(playerid, 31, 300);
        SetPlayerColor(playerid, 0xFFD700FF);   // nome dourado
    }
    return 1;
}

CMD:vipcarro(playerid, params[])
{
    if (!Jogador[playerid][jVip]) return SendClientMessage(playerid, -1, "Só pra VIP!");
    // ... criar carro exclusivo
    return 1;
}`, "vip|jogador vip"],
  ["sistema de prender (jail)", "**Prender** um jogador por um tempo.", `new TempoPreso[MAX_PLAYERS];

CMD:prender(playerid, params[])
{
    if (!IsPlayerAdmin(playerid)) return SendClientMessage(playerid, -1, "Sem permissão.");
    new id, minutos;
    if (sscanf(params, "ui", id, minutos)) return SendClientMessage(playerid, -1, "Use: /prender [id] [minutos]");
    if (!IsPlayerConnected(id)) return SendClientMessage(playerid, -1, "Jogador offline.");
    if (minutos < 1) return SendClientMessage(playerid, -1, "Tempo inválido.");
    TempoPreso[id] = minutos * 60;
    SetPlayerInterior(id, 6);
    SetPlayerPos(id, 264.0, 77.5, 1001.0);   // cela da LSPD
    ResetPlayerWeapons(id);
    return 1;
}

forward ContarCadeia();   // timer de 1 segundo no OnGameModeInit
public ContarCadeia()
{
    foreach (new i : Player)
    {
        if (TempoPreso[i] > 0 && --TempoPreso[i] == 0)
        {
            SetPlayerInterior(i, 0);
            SetPlayerPos(i, 1554.9, -1675.6, 16.2);
            SendClientMessage(i, -1, "Você foi solto!");
        }
    }
}`, "jail|prender|cadeia|preso"],
  ["contagem regressiva", "Comando **/cd** pra eventos e corridas.", `new Contagem = -1;

CMD:cd(playerid, params[])
{
    #pragma unused params
    if (Contagem != -1) return SendClientMessage(playerid, -1, "Já tem uma contagem rolando.");
    Contagem = 3;
    SetTimer("Contar", 1000, false);
    return 1;
}

forward Contar();
public Contar()
{
    new txt[8];
    if (Contagem > 0)
    {
        format(txt, sizeof(txt), "~y~%d", Contagem);
        GameTextForAll(txt, 1000, 3);
        Contagem--;
        SetTimer("Contar", 1000, false);
    }
    else
    {
        GameTextForAll("~g~VAI!", 1500, 3);
        Contagem = -1;
    }
}`, "/cd|contagem|countdown"],
  ["portão automático", "Portão que **abre sozinho** quando alguém chega perto.", `new Portao, bool:Aberto;

public OnGameModeInit()
{
    Portao = CreateObject(980, 1544.7, -1630.9, 15.2, 0.0, 0.0, 90.0);
    SetTimer("ChecarPortao", 1000, true);
    return 1;
}

forward ChecarPortao();
public ChecarPortao()
{
    new perto;
    foreach (new i : Player)
        if (IsPlayerInRangeOfPoint(i, 10.0, 1544.7, -1630.9, 15.2)) { perto = 1; break; }

    if (perto && !Aberto)  { MoveObject(Portao, 1544.7, -1630.9, 9.2, 3.0); Aberto = true; }
    if (!perto && Aberto)  { MoveObject(Portao, 1544.7, -1630.9, 15.2, 3.0); Aberto = false; }
}`, "portao|portao automatico|abrir portao"],
  ["emprego de entregador", "Emprego simples com **checkpoint** e pagamento.", `new bool:Trabalhando[MAX_PLAYERS];

CMD:trabalhar(playerid, params[])
{
    #pragma unused params
    Trabalhando[playerid] = true;
    SetPlayerCheckpoint(playerid, 1810.0, -1890.0, 13.4, 4.0);
    SendClientMessage(playerid, -1, "Leve a encomenda até o checkpoint vermelho!");
    return 1;
}

public OnPlayerEnterCheckpoint(playerid)
{
    if (Trabalhando[playerid])
    {
        Trabalhando[playerid] = false;
        DisablePlayerCheckpoint(playerid);
        GivePlayerMoney(playerid, 750);
        GameTextForPlayer(playerid, "~g~+$750", 2000, 1);
    }
    return 1;
}`, "emprego|trabalho|job|entregador"],
  ["dinheiro no servidor (anti-cheat)", "Cheaters conseguem mudar o dinheiro do **cliente**. Guarde o dinheiro **no servidor** e sincronize.", `stock DarDinheiro(playerid, valor)
{
    Jogador[playerid][jDinheiro] += valor;
    ResetPlayerMoney(playerid);
    GivePlayerMoney(playerid, Jogador[playerid][jDinheiro]);
}
// Sempre use Jogador[playerid][jDinheiro] pra conferir quanto ele tem.`, "anti cheat|anticheat|money hack|hack de dinheiro"],
  ["kick por ping alto", "Expulsa quem está com **ping muito alto**.", `forward ChecarPing();
public ChecarPing()
{
    foreach (new i : Player)
    {
        if (GetPlayerPing(i) > 600)
        {
            SendClientMessage(i, 0xFF0000FF, "Kickado: ping acima de 600.");
            SetTimerEx("KickAtrasado", 500, false, "i", i);
        }
    }
}`, "ping alto|lag kick"],
  ["relógio na tela", "Mostra a **hora real** num textdraw.", `new Text:Relogio;

public OnGameModeInit()
{
    Relogio = TextDrawCreate(547.0, 24.0, "00:00");
    TextDrawFont(Relogio, 3);
    TextDrawLetterSize(Relogio, 0.55, 2.0);
    TextDrawSetOutline(Relogio, 2);
    SetTimer("AtualizarRelogio", 1000, true);
    return 1;
}

forward AtualizarRelogio();
public AtualizarRelogio()
{
    new h, m, s, txt[8];
    gettime(h, m, s);
    format(txt, sizeof(txt), "%02d:%02d", h, m);
    TextDrawSetString(Relogio, txt);
}

public OnPlayerSpawn(playerid)
{
    TextDrawShowForPlayer(playerid, Relogio);
    return 1;
}`, "relogio|hora na tela"],
  ["velocímetro", "Mostra a **velocidade** do carro com textdraw por jogador.", `new PlayerText:Velo[MAX_PLAYERS];

public OnPlayerConnect(playerid)
{
    Velo[playerid] = CreatePlayerTextDraw(playerid, 500.0, 390.0, " ");
    PlayerTextDrawLetterSize(playerid, Velo[playerid], 0.4, 1.6);
    return 1;
}

public OnPlayerUpdate(playerid)
{
    if (GetPlayerState(playerid) == PLAYER_STATE_DRIVER)
    {
        new Float:vx, Float:vy, Float:vz, txt[16];
        GetVehicleVelocity(GetPlayerVehicleID(playerid), vx, vy, vz);
        format(txt, sizeof(txt), "%d km/h", floatround(floatsqroot(vx*vx + vy*vy + vz*vz) * 180.0));
        PlayerTextDrawSetString(playerid, Velo[playerid], txt);
        PlayerTextDrawShow(playerid, Velo[playerid]);
    }
    else PlayerTextDrawHide(playerid, Velo[playerid]);
    return 1;
}`, "velocimetro pawn|velocimetro|km/h"],
  ["sistema de level", "**Sobe de nível** com XP.", `stock DarXP(playerid, xp)
{
    Jogador[playerid][jXP] += xp;
    new precisa = Jogador[playerid][jNivel] * 100;
    if (Jogador[playerid][jXP] >= precisa)
    {
        Jogador[playerid][jXP] -= precisa;
        Jogador[playerid][jNivel]++;
        SetPlayerScore(playerid, Jogador[playerid][jNivel]);
        GameTextForPlayer(playerid, "~y~LEVEL UP!", 3000, 3);
    }
}`, "level|nivel|xp|experiencia|upar"],
  ["kit ao nascer", "Armas e itens **toda vez** que nasce.", `public OnPlayerSpawn(playerid)
{
    ResetPlayerWeapons(playerid);
    GivePlayerWeapon(playerid, 24, 150);   // Deagle
    GivePlayerWeapon(playerid, 25, 60);    // Shotgun
    GivePlayerWeapon(playerid, 31, 400);   // M4
    SetPlayerArmour(playerid, 50.0);
    return 1;
}`, "armas ao spawnar|kit inicial|spawn com armas"],
  ["isnull", "Macro pra testar se um texto está **vazio** (muito usado com zcmd).", `#if !defined isnull
    #define isnull(%1) ((!(%1[0])) || (((%1[0]) == '\\1') && (!(%1[1]))))
#endif

CMD:anunciar(playerid, params[])
{
    if (isnull(params)) return SendClientMessage(playerid, -1, "Use: /anunciar [texto]");
    SendClientMessageToAll(0xFF9900FF, params);
    return 1;
}`, "texto vazio|params vazio"],
]});

/* =========================================================
   PAWN — EXERCÍCIOS DO MODO TREINO (/treinar pawn)
   Cada teste: re = o que o código precisa ter, falta = dica se não tiver
   ========================================================= */
WCDEV.exercicios = WCDEV.exercicios || [];

WCDEV.exercicios.push(
  {
    lang: "pawn", nivel: 1,
    titulo: "Mensagem de boas-vindas",
    enunciado: "Escreva o callback {{OnPlayerConnect}} que manda a mensagem **\"Bem-vindo!\"** pro jogador que entrou, e retorna 1.",
    dica: "Use {{SendClientMessage(playerid, cor, \"texto\");}} dentro de {{public OnPlayerConnect(playerid)}}.",
    testes: [
      { re: /public\s+OnPlayerConnect\s*\(\s*playerid\s*\)/, falta: "Faltou o cabeçalho certinho: {{public OnPlayerConnect(playerid)}}." },
      { re: /SendClientMessage\s*\(\s*playerid\s*,[^,]+,\s*"[^"]*Bem-vindo[^"]*"\s*\)\s*;/i, falta: "Faltou {{SendClientMessage(playerid, -1, \"Bem-vindo!\");}} (com ponto e vírgula)." },
      { re: /return\s+1\s*;/, falta: "Faltou o {{return 1;}} no final." },
    ],
    solucao: `public OnPlayerConnect(playerid)
{
    SendClientMessage(playerid, -1, "Bem-vindo!");
    return 1;
}`,
  },
  {
    lang: "pawn", nivel: 1,
    titulo: "Variável Float",
    enunciado: "Crie uma variável chamada {{vida}} com a tag certa pra guardar **75.5**, e use ela no {{SetPlayerHealth(playerid, vida);}}.",
    dica: "Números com vírgula precisam da tag {{Float:}} antes do nome.",
    testes: [
      { re: /new\s+Float\s*:\s*vida\s*=\s*75\.5\s*;/, falta: "Crie assim: {{new Float:vida = 75.5;}}" },
      { re: /SetPlayerHealth\s*\(\s*playerid\s*,\s*vida\s*\)\s*;/, falta: "Faltou {{SetPlayerHealth(playerid, vida);}}" },
    ],
    solucao: `new Float:vida = 75.5;
SetPlayerHealth(playerid, vida);`,
  },
  {
    lang: "pawn", nivel: 1,
    titulo: "Comando /vida sem include",
    enunciado: "No {{OnPlayerCommandText}}, crie o comando **/vida** que deixa a vida em 100. Retorne 1 no comando e 0 no final.",
    dica: "Compare com {{if (!strcmp(cmdtext, \"/vida\", true))}}. Lembre que o strcmp devolve 0 quando é igual.",
    testes: [
      { re: /public\s+OnPlayerCommandText\s*\(\s*playerid\s*,\s*cmdtext\s*\[\s*\]\s*\)/, falta: "Use o cabeçalho {{public OnPlayerCommandText(playerid, cmdtext[])}}." },
      { re: /!\s*strcmp\s*\(\s*cmdtext\s*,\s*"\/vida"|strcmp\s*\(\s*cmdtext\s*,\s*"\/vida"[^)]*\)\s*==\s*0/, falta: "Compare o comando com {{!strcmp(cmdtext, \"/vida\", true)}}." },
      { re: /SetPlayerHealth\s*\(\s*playerid\s*,\s*100(\.0)?\s*\)\s*;/, falta: "Faltou {{SetPlayerHealth(playerid, 100.0);}}" },
      { re: /return\s+1\s*;[\s\S]*return\s+0\s*;/, falta: "Retorne {{1}} dentro do if e {{0}} no final da função." },
    ],
    solucao: `public OnPlayerCommandText(playerid, cmdtext[])
{
    if (!strcmp(cmdtext, "/vida", true))
    {
        SetPlayerHealth(playerid, 100.0);
        return 1;
    }
    return 0;
}`,
  },
  {
    lang: "pawn", nivel: 2,
    titulo: "Mensagem com o nome do jogador",
    enunciado: "Pegue o nome do jogador e mande pra **todos** a mensagem **\"NOME entrou no servidor\"** usando {{format}}.",
    dica: "Crie {{new nome[MAX_PLAYER_NAME], msg[64];}}, use {{GetPlayerName}}, depois {{format(msg, sizeof(msg), \"%s entrou no servidor\", nome);}}.",
    testes: [
      { re: /new\s+[^;]*nome\s*\[\s*(MAX_PLAYER_NAME|2[4-9]|[3-9]\d)\s*\]/, falta: "Crie a variável do nome: {{new nome[MAX_PLAYER_NAME];}}" },
      { re: /GetPlayerName\s*\(\s*playerid\s*,\s*nome\s*,\s*(sizeof\s*\(?\s*nome\s*\)?|MAX_PLAYER_NAME|\d+)\s*\)\s*;/, falta: "Use {{GetPlayerName(playerid, nome, sizeof(nome));}}" },
      { re: /format\s*\(\s*\w+\s*,\s*(sizeof\s*\(?\s*\w+\s*\)?|\d+)\s*,\s*"[^"]*%s[^"]*"\s*,\s*nome\s*\)\s*;/, falta: "Monte a mensagem com {{format(msg, sizeof(msg), \"%s entrou no servidor\", nome);}}" },
      { re: /SendClientMessageToAll\s*\(/, falta: "Pra mandar pra todos, use {{SendClientMessageToAll(cor, msg);}}" },
    ],
    solucao: `new nome[MAX_PLAYER_NAME], msg[64];
GetPlayerName(playerid, nome, sizeof(nome));
format(msg, sizeof(msg), "%s entrou no servidor", nome);
SendClientMessageToAll(0xAFAFAFFF, msg);`,
  },
  {
    lang: "pawn", nivel: 2,
    titulo: "Score por kill",
    enunciado: "No {{OnPlayerDeath}}, se o assassino for válido, dê **+1 de score** e **$500** pra ele.",
    dica: "Confira {{if (killerid != INVALID_PLAYER_ID)}} e use {{SetPlayerScore(killerid, GetPlayerScore(killerid) + 1);}}.",
    testes: [
      { re: /public\s+OnPlayerDeath\s*\(\s*playerid\s*,\s*killerid\s*,\s*reason\s*\)/, falta: "Cabeçalho: {{public OnPlayerDeath(playerid, killerid, reason)}}" },
      { re: /killerid\s*!=\s*INVALID_PLAYER_ID/, falta: "Confira se o assassino existe: {{if (killerid != INVALID_PLAYER_ID)}}" },
      { re: /SetPlayerScore\s*\(\s*killerid\s*,\s*GetPlayerScore\s*\(\s*killerid\s*\)\s*\+\s*1\s*\)\s*;/, falta: "Dê o score: {{SetPlayerScore(killerid, GetPlayerScore(killerid) + 1);}}" },
      { re: /GivePlayerMoney\s*\(\s*killerid\s*,\s*500\s*\)\s*;/, falta: "Dê o dinheiro: {{GivePlayerMoney(killerid, 500);}}" },
    ],
    solucao: `public OnPlayerDeath(playerid, killerid, reason)
{
    if (killerid != INVALID_PLAYER_ID)
    {
        SetPlayerScore(killerid, GetPlayerScore(killerid) + 1);
        GivePlayerMoney(killerid, 500);
    }
    return 1;
}`,
  },
  {
    lang: "pawn", nivel: 2,
    titulo: "Comando com zcmd",
    enunciado: "Usando **zcmd**, crie o comando **/colete** que dá 100 de colete.",
    dica: "O formato é {{CMD:colete(playerid, params[])}} e dentro use {{SetPlayerArmour}}.",
    testes: [
      { re: /CMD\s*:\s*colete\s*\(\s*playerid\s*,\s*params\s*\[\s*\]\s*\)/i, falta: "Crie o comando assim: {{CMD:colete(playerid, params[])}}" },
      { re: /SetPlayerArmour\s*\(\s*playerid\s*,\s*100(\.0)?\s*\)\s*;/, falta: "Faltou {{SetPlayerArmour(playerid, 100.0);}}" },
      { re: /return\s+1\s*;/, falta: "Termine com {{return 1;}}" },
    ],
    solucao: `CMD:colete(playerid, params[])
{
    #pragma unused params
    SetPlayerArmour(playerid, 100.0);
    return 1;
}`,
  },
  {
    lang: "pawn", nivel: 3,
    titulo: "Comando com parâmetros (sscanf)",
    enunciado: "Crie **/dargrana [id] [valor]** com zcmd + sscanf. Se faltar parâmetro, mostre como usar. Se o jogador não estiver conectado, avise.",
    dica: "{{if (sscanf(params, \"ui\", id, valor)) return SendClientMessage(...);}} e depois {{if (!IsPlayerConnected(id))}}.",
    testes: [
      { re: /CMD\s*:\s*dargrana\s*\(\s*playerid\s*,\s*params\s*\[\s*\]\s*\)/i, falta: "Cabeçalho: {{CMD:dargrana(playerid, params[])}}" },
      { re: /sscanf\s*\(\s*params\s*,\s*"[ur][id]"\s*,\s*\w+\s*,\s*\w+\s*\)/, falta: "Leia os parâmetros com {{sscanf(params, \"ui\", id, valor)}}" },
      { re: /if\s*\(\s*sscanf[\s\S]*?\)\s*\)?\s*return\s+SendClientMessage/, falta: "Se o sscanf falhar, mostre o uso: {{if (sscanf(...)) return SendClientMessage(playerid, -1, \"Use: /dargrana [id] [valor]\");}}" },
      { re: /(!\s*IsPlayerConnected\s*\(\s*\w+\s*\)|==\s*INVALID_PLAYER_ID)/, falta: "Confira se o jogador está online: {{if (!IsPlayerConnected(id))}}" },
      { re: /GivePlayerMoney\s*\(\s*\w+\s*,\s*\w+\s*\)\s*;/, falta: "Dê o dinheiro: {{GivePlayerMoney(id, valor);}}" },
    ],
    solucao: `CMD:dargrana(playerid, params[])
{
    if (!IsPlayerAdmin(playerid))   // só admin: senão qualquer um cria dinheiro
        return SendClientMessage(playerid, 0xFF0000FF, "Sem permissão.");
    new id, valor;
    if (sscanf(params, "ui", id, valor))
        return SendClientMessage(playerid, -1, "Use: /dargrana [id] [valor]");
    if (!IsPlayerConnected(id))
        return SendClientMessage(playerid, 0xFF0000FF, "Jogador não conectado.");
    if (valor < 1)
        return SendClientMessage(playerid, 0xFF0000FF, "Valor inválido.");
    GivePlayerMoney(id, valor);
    return 1;
}`,
  },
  {
    lang: "pawn", nivel: 3,
    titulo: "Timer de salário",
    enunciado: "Crie uma public {{Salario}} (com forward) que dá **$1000 pra todos** os jogadores online, e ligue um timer **repetindo a cada 10 minutos**.",
    dica: "{{forward Salario();}}, depois {{public Salario()}} com um loop. Timer: {{SetTimer(\"Salario\", 600000, true);}}",
    testes: [
      { re: /forward\s+Salario\s*\(\s*\)\s*;/, falta: "Faltou {{forward Salario();}} (sem ele dá warning 235)." },
      { re: /public\s+Salario\s*\(\s*\)/, falta: "Faltou a função {{public Salario()}}" },
      { re: /(foreach\s*\(\s*new\s+\w+\s*:\s*Player\s*\)|for\s*\(\s*new\s+\w+\s*=\s*0[^)]*\))/, falta: "Percorra os jogadores com {{foreach (new i : Player)}} ou um {{for}}." },
      { re: /GivePlayerMoney\s*\(\s*\w+\s*,\s*1000\s*\)\s*;/, falta: "Dentro do loop: {{GivePlayerMoney(i, 1000);}}" },
      { re: /SetTimer\s*\(\s*"Salario"\s*,\s*(600000|10\s*\*\s*60000|60000\s*\*\s*10|10\s*\*\s*60\s*\*\s*1000)\s*,\s*(true|1)\s*\)\s*;/, falta: "Ligue o timer: {{SetTimer(\"Salario\", 600000, true);}} (10 minutos = 600000 ms)." },
    ],
    solucao: `forward Salario();
public Salario()
{
    foreach (new i : Player)
    {
        GivePlayerMoney(i, 1000);
    }
}

public OnGameModeInit()
{
    SetTimer("Salario", 600000, true);
    return 1;
}`,
  },
  {
    lang: "pawn", nivel: 3,
    titulo: "Dialog de lista",
    enunciado: "Mostre um dialog **DIALOG_STYLE_LIST** com ID 5 e as opções **Vida** e **Colete**. No {{OnDialogResponse}}, dê vida 100 se escolher a primeira e colete 100 se escolher a segunda.",
    dica: "Separe as opções com {{\\n}}. No response, confira {{dialogid == 5}}, {{response}} e use {{listitem}} (começa em 0).",
    testes: [
      { re: /ShowPlayerDialog\s*\(\s*playerid\s*,\s*5\s*,\s*DIALOG_STYLE_LIST\s*,/, falta: "Mostre o dialog: {{ShowPlayerDialog(playerid, 5, DIALOG_STYLE_LIST, \"Menu\", \"Vida\\nColete\", \"Ok\", \"Sair\");}}" },
      { re: /"[^"]*Vida\\n\s*Colete[^"]*"/i, falta: "As opções vão num texto só, separadas por {{\\n}}: {{\"Vida\\nColete\"}}" },
      { re: /public\s+OnDialogResponse\s*\(\s*playerid\s*,\s*dialogid\s*,\s*response\s*,\s*listitem\s*,\s*inputtext\s*\[\s*\]\s*\)/, falta: "Use o cabeçalho completo: {{public OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])}}" },
      { re: /dialogid\s*==\s*5/, falta: "Confira o ID: {{if (dialogid == 5)}}" },
      { re: /listitem/, falta: "Use o {{listitem}} pra saber a opção (0 = Vida, 1 = Colete)." },
      { re: /SetPlayerHealth[\s\S]*SetPlayerArmour|SetPlayerArmour[\s\S]*SetPlayerHealth/, falta: "Use {{SetPlayerHealth}} pra opção 0 e {{SetPlayerArmour}} pra opção 1." },
    ],
    solucao: `ShowPlayerDialog(playerid, 5, DIALOG_STYLE_LIST, "Menu", "Vida\\nColete", "Escolher", "Sair");

public OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])
{
    if (dialogid == 5)
    {
        if (!response) return 1;
        if (listitem == 0) SetPlayerHealth(playerid, 100.0);
        else if (listitem == 1) SetPlayerArmour(playerid, 100.0);
        return 1;
    }
    return 0;
}`,
  },
  {
    lang: "pawn", nivel: 3,
    titulo: "Enum de dados do jogador",
    enunciado: "Crie um **enum** {{E_JOGADOR}} com {{jAdmin}}, {{jNivel}} e {{Float:jVida}}, e o array {{Jogador[MAX_PLAYERS][E_JOGADOR]}}.",
    dica: "Escreva {{enum E_JOGADOR}}, abra chaves, coloque os 3 campos separados por vírgula, feche, e depois {{new Jogador[MAX_PLAYERS][E_JOGADOR];}}",
    testes: [
      { re: /enum\s+E_JOGADOR\s*\{/, falta: "Comece com {{enum E_JOGADOR}} e abra as chaves." },
      { re: /jAdmin/, falta: "Faltou o campo {{jAdmin}}." },
      { re: /jNivel/, falta: "Faltou o campo {{jNivel}}." },
      { re: /Float\s*:\s*jVida/, falta: "A vida é decimal: {{Float:jVida}}." },
      { re: /new\s+Jogador\s*\[\s*MAX_PLAYERS\s*\]\s*\[\s*E_JOGADOR\s*\]\s*;/, falta: "Crie o array: {{new Jogador[MAX_PLAYERS][E_JOGADOR];}}" },
    ],
    solucao: `enum E_JOGADOR
{
    jAdmin,
    jNivel,
    Float:jVida
}
new Jogador[MAX_PLAYERS][E_JOGADOR];`,
  }
);
