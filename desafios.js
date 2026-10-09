/* =========================================================
   WC DEV — GERADOR DE DESAFIOS E MISSÕES
   /desafio pawn        -> desafio novo, com valores sorteados (nunca acaba)
   /desafio sobre X     -> desafio usando qualquer coisa da consulta
   /missao pawn         -> projeto maior com checklist
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Desafios = {
  sorteia(lista) { return lista[Math.floor(Math.random() * lista.length)]; },
  num(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
  re(texto) { return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); },

  /* ---------------- modelos por linguagem ---------------- */
  modelos: {
    pawn: [
      (D) => { const cmd = D.sorteia(["cura", "medico", "hp", "saude"]), v = D.sorteia([50, 75, 100]);
        return { nivel: 1, titulo: `Comando /${cmd}`, enunciado: `Crie o comando **/${cmd}** (com zcmd) que deixa a vida do jogador em **${v}**.`,
          dica: `{{CMD:${cmd}(playerid, params[])}} e dentro {{SetPlayerHealth(playerid, ${v}.0);}}`,
          testes: [
            { re: new RegExp(`CMD\\s*:\\s*${cmd}\\s*\\(\\s*playerid\\s*,\\s*params\\s*\\[\\s*\\]\\s*\\)`, "i"), falta: `Crie o comando: {{CMD:${cmd}(playerid, params[])}}` },
            { re: new RegExp(`SetPlayerHealth\\s*\\(\\s*playerid\\s*,\\s*${v}(\\.0+)?\\s*\\)\\s*;`), falta: `Use {{SetPlayerHealth(playerid, ${v}.0);}}` },
            { re: /return\s+1\s*;/, falta: "Termine com {{return 1;}}" }],
          solucao: `CMD:${cmd}(playerid, params[])\n{\n    #pragma unused params\n    SetPlayerHealth(playerid, ${v}.0);\n    return 1;\n}` }; },
      (D) => { const v = D.sorteia([500, 1000, 2500, 5000]), cmd = D.sorteia(["grana", "salario", "bonus", "premio"]);
        return { nivel: 1, titulo: `Comando /${cmd}`, enunciado: `Crie **/${cmd}** que dá **$${v}** pro jogador e manda uma mensagem avisando.`,
          dica: `{{GivePlayerMoney(playerid, ${v});}} e {{SendClientMessage(playerid, -1, "...");}}`,
          testes: [
            { re: new RegExp(`CMD\\s*:\\s*${cmd}\\b`, "i"), falta: `Crie {{CMD:${cmd}(playerid, params[])}}` },
            { re: new RegExp(`GivePlayerMoney\\s*\\(\\s*playerid\\s*,\\s*${v}\\s*\\)\\s*;`), falta: `Dê o dinheiro: {{GivePlayerMoney(playerid, ${v});}}` },
            { re: /SendClientMessage\s*\(\s*playerid\s*,[^,]+,\s*"[^"]+"\s*\)\s*;/, falta: "Mande uma mensagem com {{SendClientMessage(playerid, cor, \"texto\");}}" }],
          solucao: `CMD:${cmd}(playerid, params[])\n{\n    #pragma unused params\n    GivePlayerMoney(playerid, ${v});\n    SendClientMessage(playerid, 0x33AA33FF, "Você ganhou $${v}!");\n    return 1;\n}` }; },
      (D) => { const [nome, id] = D.sorteia([["M4", 31], ["AK-47", 30], ["Desert Eagle", 24], ["Shotgun", 25], ["Sniper", 34], ["MP5", 29]]), bal = D.sorteia([100, 200, 500]);
        return { nivel: 1, titulo: `Kit de ${nome}`, enunciado: `Crie um comando que dá uma **${nome}** com **${bal} balas**. (Dica: o ID da ${nome} é **${id}**.)`,
          dica: `{{GivePlayerWeapon(playerid, ${id}, ${bal});}}`,
          testes: [
            { re: /CMD\s*:\s*\w+\s*\(|strcmp\s*\(\s*cmdtext/i, falta: "Crie um comando (zcmd ou strcmp)." },
            { re: new RegExp(`GivePlayerWeapon\\s*\\(\\s*playerid\\s*,\\s*${id}\\s*,\\s*${bal}\\s*\\)\\s*;`), falta: `Use {{GivePlayerWeapon(playerid, ${id}, ${bal});}}` }],
          solucao: `CMD:arma(playerid, params[])\n{\n    #pragma unused params\n    GivePlayerWeapon(playerid, ${id}, ${bal});\n    return 1;\n}` }; },
      (D) => { const lugar = D.sorteia([["Grove Street", "2495.3, -1688.0, 13.6", "grove"], ["Prefeitura", "1481.0, -1772.0, 18.8", "prefeitura"], ["Aeroporto de LS", "1685.0, -2335.0, 13.5", "aero"], ["Monte Chiliad", "-2321.6, -1639.8, 483.7", "chiliad"]]);
        return { nivel: 2, titulo: `Teleporte pra ${lugar[0]}`, enunciado: `Crie **/${lugar[2]}** que coloca o jogador no interior 0 e teleporta pra **${lugar[0]}** ({{${lugar[1]}}}).`,
          dica: `{{SetPlayerInterior(playerid, 0);}} e {{SetPlayerPos(playerid, ${lugar[1]});}}`,
          testes: [
            { re: new RegExp(`CMD\\s*:\\s*${lugar[2]}\\b`, "i"), falta: `Crie {{CMD:${lugar[2]}(playerid, params[])}}` },
            { re: /SetPlayerInterior\s*\(\s*playerid\s*,\s*0\s*\)\s*;/, falta: "Coloque no interior 0: {{SetPlayerInterior(playerid, 0);}}" },
            { re: new RegExp(`SetPlayerPos\\s*\\(\\s*playerid\\s*,\\s*${lugar[1].split(", ").map(x => D.re(x)).join("\\s*,\\s*")}\\s*\\)\\s*;`), falta: `Teleporte: {{SetPlayerPos(playerid, ${lugar[1]});}}` }],
          solucao: `CMD:${lugar[2]}(playerid, params[])\n{\n    #pragma unused params\n    SetPlayerInterior(playerid, 0);\n    SetPlayerPos(playerid, ${lugar[1]});\n    return 1;\n}` }; },
      (D) => { const v = D.sorteia([20, 30, 50]);
        return { nivel: 2, titulo: "Aviso de vida baixa", enunciado: `Crie um comando que pega a vida do jogador e, **se for menor que ${v}**, manda a mensagem **"Vida baixa!"**.`,
          dica: `{{new Float:vida;}} {{GetPlayerHealth(playerid, vida);}} {{if (vida < ${v}.0)}}`,
          testes: [
            { re: /new\s+Float\s*:\s*\w+/, falta: "Crie a variável com a tag Float: {{new Float:vida;}}" },
            { re: /GetPlayerHealth\s*\(\s*playerid\s*,\s*\w+\s*\)\s*;/, falta: "Pegue a vida: {{GetPlayerHealth(playerid, vida);}}" },
            { re: new RegExp(`if\\s*\\(\\s*\\w+\\s*<\\s*${v}(\\.0+)?\\s*\\)`), falta: `Compare: {{if (vida < ${v}.0)}}` },
            { re: /Vida baixa/i, falta: "Mande a mensagem **\"Vida baixa!\"**." }],
          solucao: `CMD:checar(playerid, params[])\n{\n    #pragma unused params\n    new Float:vida;\n    GetPlayerHealth(playerid, vida);\n    if (vida < ${v}.0)\n    {\n        SendClientMessage(playerid, 0xFF0000FF, "Vida baixa!");\n    }\n    return 1;\n}` }; },
      (D) => { const v = D.sorteia([100, 250, 500]);
        return { nivel: 2, titulo: "Presente pra todos", enunciado: `Crie uma função {{stock PresenteGeral()}} que dá **$${v}** pra **todos os jogadores online** usando um loop.`,
          dica: `{{foreach (new i : Player)}} ou um {{for}} com {{GetPlayerPoolSize()}} e {{IsPlayerConnected(i)}}.`,
          testes: [
            { re: /stock\s+PresenteGeral\s*\(\s*\)/, falta: "Crie {{stock PresenteGeral()}}" },
            { re: /foreach\s*\(\s*new\s+\w+\s*:\s*Player\s*\)|for\s*\(\s*new\s+\w+\s*=\s*0/, falta: "Use um loop: {{foreach (new i : Player)}}" },
            { re: new RegExp(`GivePlayerMoney\\s*\\(\\s*\\w+\\s*,\\s*${v}\\s*\\)\\s*;`), falta: `Dentro do loop: {{GivePlayerMoney(i, ${v});}}` }],
          solucao: `stock PresenteGeral()\n{\n    foreach (new i : Player)\n    {\n        GivePlayerMoney(i, ${v});\n    }\n}` }; },
      (D) => { const m = D.sorteia([2, 5, 10]), txt = D.sorteia(["Use /ajuda!", "Respeite as regras!", "Entre no Discord!"]);
        return { nivel: 3, titulo: "Aviso automático", enunciado: `Faça uma public {{Aviso}} (com forward) que manda **"${txt}"** pra todos, e um timer que chama ela **a cada ${m} minutos**, repetindo.`,
          dica: `{{forward Aviso();}}, {{public Aviso()}} com {{SendClientMessageToAll}}, e {{SetTimer("Aviso", ${m * 60000}, true);}}`,
          testes: [
            { re: /forward\s+Aviso\s*\(\s*\)\s*;/, falta: "Faltou {{forward Aviso();}}" },
            { re: /public\s+Aviso\s*\(\s*\)/, falta: "Crie {{public Aviso()}}" },
            { re: new RegExp(`SendClientMessageToAll\\s*\\([^,]+,\\s*"${D.re(txt)}"\\s*\\)\\s*;`), falta: `Mande pra todos: {{SendClientMessageToAll(cor, "${txt}");}}` },
            { re: new RegExp(`SetTimer\\s*\\(\\s*"Aviso"\\s*,\\s*(${m * 60000}|${m}\\s*\\*\\s*60000|60000\\s*\\*\\s*${m})\\s*,\\s*(true|1)\\s*\\)\\s*;`), falta: `Timer: {{SetTimer("Aviso", ${m * 60000}, true);}} (${m} min = ${m * 60000} ms)` }],
          solucao: `forward Aviso();\npublic Aviso()\n{\n    SendClientMessageToAll(0x1E90FFFF, "${txt}");\n    return 1;\n}\n\npublic OnGameModeInit()\n{\n    SetTimer("Aviso", ${m * 60000}, true);\n    return 1;\n}` }; },
      (D) => { const id = D.num(1, 20);
        return { nivel: 3, titulo: "Dialog de escolha", enunciado: `Mostre um dialog **DIALOG_STYLE_LIST** com ID **${id}** e as opções **Vida**, **Colete** e **Dinheiro**. No {{OnDialogResponse}}, a opção 0 dá vida 100, a 1 dá colete 100 e a 2 dá $1000.`,
          dica: `Separe as opções com {{\\n}}. No response: {{if (dialogid == ${id} && response)}} e {{switch (listitem)}}.`,
          testes: [
            { re: new RegExp(`ShowPlayerDialog\\s*\\(\\s*playerid\\s*,\\s*${id}\\s*,\\s*DIALOG_STYLE_LIST`), falta: `{{ShowPlayerDialog(playerid, ${id}, DIALOG_STYLE_LIST, ...)}}` },
            { re: /Vida\\n\s*Colete\\n\s*Dinheiro/i, falta: "As opções num texto só: {{\"Vida\\nColete\\nDinheiro\"}}" },
            { re: new RegExp(`dialogid\\s*==\\s*${id}`), falta: `Confira o ID: {{dialogid == ${id}}}` },
            { re: /listitem/, falta: "Use o {{listitem}} pra saber a escolha." },
            { re: /SetPlayerHealth[\s\S]*SetPlayerArmour[\s\S]*GivePlayerMoney|switch\s*\(\s*listitem/, falta: "Faça as 3 ações (vida, colete e dinheiro)." }],
          solucao: `ShowPlayerDialog(playerid, ${id}, DIALOG_STYLE_LIST, "Escolha", "Vida\\nColete\\nDinheiro", "Ok", "Sair");\n\npublic OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])\n{\n    if (dialogid == ${id} && response)\n    {\n        switch (listitem)\n        {\n            case 0: SetPlayerHealth(playerid, 100.0);\n            case 1: SetPlayerArmour(playerid, 100.0);\n            case 2: GivePlayerMoney(playerid, 1000);\n        }\n        return 1;\n    }\n    return 0;\n}` }; },
    ],

    python: [
      (D) => { const f = D.sorteia(["Python é demais!", "Eu sei programar!", "WC DEV no topo!"]);
        return { nivel: 1, titulo: "Primeira frase", enunciado: `Mostre na tela: **${f}**`, dica: `{{print("${f}")}}`,
          testes: [{ re: new RegExp(`print\\s*\\(\\s*["']${D.re(f)}["']\\s*\\)`), falta: `Use {{print("${f}")}}` }], solucao: `print("${f}")` }; },
      (D) => { const a = D.num(1, 5), b = D.num(8, 15);
        return { nivel: 1, titulo: `Contar de ${a} a ${b}`, enunciado: `Use um **for** pra mostrar os números de **${a} até ${b}**.`, dica: `{{for i in range(${a}, ${b + 1}):}}`,
          testes: [{ re: new RegExp(`for\\s+\\w+\\s+in\\s+range\\s*\\(\\s*${a}\\s*,\\s*${b + 1}\\s*\\)\\s*:`), falta: `Lembre que o fim do range não entra: {{range(${a}, ${b + 1})}}` },
            { re: /\n[ \t]+print\s*\(/, falta: "O print vai **dentro** do for (com recuo)." }],
          solucao: `for i in range(${a}, ${b + 1}):\n    print(i)` }; },
      (D) => { const nome = D.sorteia(["triplo", "dobro", "quadrado"]), k = { triplo: "x * 3", dobro: "x * 2", quadrado: "x * x" }[nome], t = D.num(3, 9);
        return { nivel: 2, titulo: `Função ${nome}`, enunciado: `Crie a função **${nome}(x)** que **retorna** o ${nome} de x, e mostre {{${nome}(${t})}}.`,
          dica: `{{def ${nome}(x):}} e {{return ${k}}}`,
          testes: [{ re: new RegExp(`def\\s+${nome}\\s*\\(\\s*\\w+\\s*\\)\\s*:`), falta: `{{def ${nome}(x):}}` },
            { re: /return\s+\S/, falta: "A função precisa de {{return}}." },
            { re: new RegExp(`print\\s*\\(\\s*${nome}\\s*\\(\\s*${t}\\s*\\)\\s*\\)`), falta: `Mostre: {{print(${nome}(${t}))}}` }],
          solucao: `def ${nome}(x):\n    return ${k}\n\nprint(${nome}(${t}))` }; },
      (D) => { const itens = D.sorteia([["maçã", "banana", "uva"], ["Pawn", "Python", "HTML"], ["arroz", "feijão", "ovo"]]);
        return { nivel: 2, titulo: "Lista e tamanho", enunciado: `Crie uma lista com **${itens.join(", ")}**, adicione **mais um item** com append e mostre o **tamanho** da lista.`,
          dica: "{{lista = [...]}}, {{lista.append(...)}} e {{print(len(lista))}}",
          testes: [{ re: /\w+\s*=\s*\[[^\]]+\]/, falta: "Crie a lista com os itens: {{lista = [\"...\", ...]}}" },
            { re: /\.append\s*\(/, falta: "Adicione com {{.append(...)}}" }, { re: /len\s*\(\s*\w+\s*\)/, falta: "Use {{len(lista)}}" }],
          solucao: `lista = [${itens.map(i => `"${i}"`).join(", ")}]\nlista.append("novo")\nprint(len(lista))` }; },
      (D) => { const n = D.sorteia([10, 18, 50]);
        return { nivel: 2, titulo: `Maior que ${n}`, enunciado: `Peça um número ao usuário (convertendo com int). Se for **maior que ${n}**, mostre **"Grande"**, senão **"Pequeno"**.`,
          dica: `{{n = int(input("Número: "))}} e {{if n > ${n}:}}`,
          testes: [{ re: /int\s*\(\s*input\s*\(/, falta: "Converta: {{int(input(...))}}" },
            { re: new RegExp(`if\\s+\\w+\\s*>\\s*${n}\\s*:`), falta: `{{if n > ${n}:}}` }, { re: /\n\s*else\s*:/, falta: "Faltou o {{else:}}" },
            { re: /Grande[\s\S]*Pequeno/, falta: "Mostre \"Grande\" e \"Pequeno\"." }],
          solucao: `n = int(input("Número: "))\nif n > ${n}:\n    print("Grande")\nelse:\n    print("Pequeno")` }; },
      (D) => { const n = D.sorteia([10, 50, 100]);
        return { nivel: 3, titulo: `Soma de 1 a ${n}`, enunciado: `Calcule a **soma de todos os números de 1 até ${n}** usando um loop e uma variável acumuladora, e mostre o resultado.`,
          dica: `{{total = 0}}, {{for i in range(1, ${n + 1}):}} e {{total += i}}`,
          testes: [{ re: /\w+\s*=\s*0/, falta: "Comece o acumulador com 0: {{total = 0}}" },
            { re: new RegExp(`range\\s*\\(\\s*1\\s*,\\s*${n + 1}\\s*\\)`), falta: `{{range(1, ${n + 1})}}` }, { re: /\+=/, falta: "Some no loop com {{+=}}" }, { re: /print\s*\(/, falta: "Mostre o resultado." }],
          solucao: `total = 0\nfor i in range(1, ${n + 1}):\n    total += i\nprint(total)` }; },
      (D) => { const n = D.num(3, 10);
        return { nivel: 3, titulo: "Contagem com while", enunciado: `Use **while** pra fazer uma contagem regressiva de **${n} até 1** e depois mostre **"Fim!"**.`,
          dica: `{{n = ${n}}}, {{while n > 0:}}, {{print(n)}}, {{n -= 1}}`,
          testes: [{ re: new RegExp(`\\w+\\s*=\\s*${n}\\b`), falta: `Comece com {{n = ${n}}}` }, { re: /while\s+\w+\s*>=?\s*[01]\s*:/, falta: "{{while n > 0:}}" },
            { re: /-=\s*1|=\s*\w+\s*-\s*1/, falta: "Diminua 1 a cada volta: {{n -= 1}}" }, { re: /Fim/, falta: "Mostre \"Fim!\" no final." }],
          solucao: `n = ${n}\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("Fim!")` }; },
    ],

    html: [
      (D) => { const t = D.sorteia(["Bem-vindo", "Meu Servidor", "WC DEV"]);
        return { nivel: 1, titulo: "Título e texto", enunciado: `Crie um **h1** escrito **${t}** e um **parágrafo** com qualquer texto.`, dica: `{{<h1>${t}</h1>}} e {{<p>...</p>}}`,
          testes: [{ re: new RegExp(`<h1[^>]*>\\s*${D.re(t)}\\s*</h1>`, "i"), falta: `{{<h1>${t}</h1>}}` }, { re: /<p[^>]*>[^<]+<\/p>/i, falta: "Um parágrafo com texto: {{<p>...</p>}}" }],
          solucao: `<h1>${t}</h1>\n<p>Texto qualquer.</p>` }; },
      (D) => { const [site, url] = D.sorteia([["YouTube", "https://www.youtube.com"], ["Discord", "https://discord.com"], ["GitHub", "https://github.com"]]);
        return { nivel: 1, titulo: `Link pro ${site}`, enunciado: `Crie um link pro **${site}** ({{${url}}}) que abre em **nova aba**.`, dica: `{{<a href="${url}" target="_blank">${site}</a>}}`,
          testes: [{ re: new RegExp(`<a\\s[^>]*href\\s*=\\s*["']${D.re(url)}/?["']`, "i"), falta: `{{href="${url}"}}` }, { re: /target\s*=\s*["']_blank["']/i, falta: "Nova aba: {{target=\"_blank\"}}" }],
          solucao: `<a href="${url}" target="_blank">${site}</a>` }; },
      (D) => { const itens = D.sorteia([["Pawn", "Python", "HTML", "CSS"], ["Vida", "Colete", "Arma"], ["Segunda", "Terça", "Quarta"]]), ord = Math.random() < 0.5;
        return { nivel: 2, titulo: ord ? "Lista numerada" : "Lista com bolinhas", enunciado: `Crie uma **lista ${ord ? "numerada" : "com bolinhas"}** com: **${itens.join(", ")}**.`,
          dica: `{{<${ord ? "ol" : "ul"}>}} e cada item com {{<li>}}`,
          testes: [{ re: new RegExp(`<${ord ? "ol" : "ul"}[^>]*>[\\s\\S]*</${ord ? "ol" : "ul"}>`, "i"), falta: `Use {{<${ord ? "ol" : "ul"}>}}` },
            ...itens.map(i => ({ re: new RegExp(`<li[^>]*>\\s*${D.re(i)}\\s*</li>`, "i"), falta: `Faltou {{<li>${i}</li>}}` }))],
          solucao: `<${ord ? "ol" : "ul"}>\n${itens.map(i => `  <li>${i}</li>`).join("\n")}\n</${ord ? "ol" : "ul"}>` }; },
      (D) => { const tipo = D.sorteia([["e-mail", "email"], ["senha", "password"], ["data", "date"], ["cor", "color"]]);
        return { nivel: 2, titulo: `Campo de ${tipo[0]}`, enunciado: `Crie um formulário com um campo de **${tipo[0]}** obrigatório, com {{label}}, e um botão **Enviar**.`,
          dica: `{{<input type="${tipo[1]}" required>}}`,
          testes: [{ re: /<form[^>]*>[\s\S]*<\/form>/i, falta: "Use {{<form>...</form>}}" }, { re: new RegExp(`<input\\s[^>]*type\\s*=\\s*["']${tipo[1]}["']`, "i"), falta: `{{type="${tipo[1]}"}}` },
            { re: /<input\s[^>]*required/i, falta: "Obrigatório: {{required}}" }, { re: /<label/i, falta: "Coloque um {{<label>}}" }, { re: /<button[^>]*>\s*Enviar\s*<\/button>/i, falta: "{{<button>Enviar</button>}}" }],
          solucao: `<form>\n  <label for="campo">${tipo[0]}:</label>\n  <input type="${tipo[1]}" id="campo" required>\n  <button>Enviar</button>\n</form>` }; },
    ],

    css: [
      (D) => { const [cor, nome] = D.sorteia([["#1e90ff", "azul"], ["#ff4757", "vermelho"], ["#2ed573", "verde"]]), tam = D.sorteia([32, 40, 48]);
        return { nivel: 1, titulo: `Título ${nome}`, enunciado: `Deixe o **h1** com cor **${cor}** e tamanho **${tam}px**.`, dica: `{{h1 { color: ${cor}; font-size: ${tam}px; } }}`,
          base: `<h1>Título</h1><p>Parágrafo</p>`,
          testes: [{ re: new RegExp(`h1\\s*\\{[^}]*color\\s*:\\s*${D.re(cor)}`, "i"), falta: `{{color: ${cor};}}` }, { re: new RegExp(`h1\\s*\\{[^}]*font-size\\s*:\\s*${tam}px`, "i"), falta: `{{font-size: ${tam}px;}}` }],
          solucao: `h1 {\n    color: ${cor};\n    font-size: ${tam}px;\n}` }; },
      (D) => { const r = D.sorteia([6, 10, 20]), p = D.sorteia([10, 15, 20]);
        return { nivel: 2, titulo: "Card arredondado", enunciado: `Estilize a classe **.card** com **padding de ${p}px**, **cantos de ${r}px** e uma **borda** de 1px azul.`,
          dica: `{{padding: ${p}px;}} {{border-radius: ${r}px;}} {{border: 1px solid #1e90ff;}}`, base: `<div class="card">Sou um card</div>`,
          testes: [{ re: /\.card\s*\{/, falta: "Seletor de classe: {{.card}}" }, { re: new RegExp(`\\.card\\s*\\{[^}]*padding\\s*:\\s*${p}px`), falta: `{{padding: ${p}px;}}` },
            { re: new RegExp(`\\.card\\s*\\{[^}]*border-radius\\s*:\\s*${r}px`), falta: `{{border-radius: ${r}px;}}` }, { re: /\.card\s*\{[^}]*border\s*:\s*1px\s+solid/, falta: "{{border: 1px solid #1e90ff;}}" }],
          solucao: `.card {\n    padding: ${p}px;\n    border-radius: ${r}px;\n    border: 1px solid #1e90ff;\n}` }; },
      (D) => { const cor = D.sorteia(["#5cb8ff", "#ffd32a", "#ff6b81"]);
        return { nivel: 2, titulo: "Hover no link", enunciado: `Quando passar o mouse num **link (a)**, a cor deve virar **${cor}**. Tire também o **sublinhado** dos links.`,
          dica: `{{a { text-decoration: none; } }} e {{a:hover { color: ${cor}; } }}`, base: `<a href="#">Passe o mouse aqui</a>`,
          testes: [{ re: /(^|\})\s*a\s*\{[^}]*text-decoration\s*:\s*none/m, falta: "{{a { text-decoration: none; } }}" }, { re: new RegExp(`a\\s*:hover\\s*\\{[^}]*color\\s*:\\s*${D.re(cor)}`, "i"), falta: `{{a:hover { color: ${cor}; } }}` }],
          solucao: `a {\n    text-decoration: none;\n}\na:hover {\n    color: ${cor};\n}` }; },
      (D) => { const g = D.sorteia([10, 16, 24]);
        return { nivel: 3, titulo: "Menu com flexbox", enunciado: `Deixe o **nav** com os links **lado a lado** usando flexbox, com **${g}px de espaço** entre eles e **centralizados**.`,
          dica: `{{display: flex; gap: ${g}px; justify-content: center;}}`, base: `<nav><a href="#">Início</a><a href="#">Sobre</a><a href="#">Contato</a></nav>`,
          testes: [{ re: /nav\s*\{[^}]*display\s*:\s*flex/, falta: "{{display: flex;}}" }, { re: new RegExp(`nav\\s*\\{[^}]*gap\\s*:\\s*${g}px`), falta: `{{gap: ${g}px;}}` }, { re: /nav\s*\{[^}]*justify-content\s*:\s*center/, falta: "{{justify-content: center;}}" }],
          solucao: `nav {\n    display: flex;\n    gap: ${g}px;\n    justify-content: center;\n}` }; },
    ],
  },

  gerar(lang, nivel) {
    const modelos = this.modelos[lang];
    if (!modelos) return null;
    let opcoes = modelos.map(m => m(this));
    if (nivel) opcoes = opcoes.filter(o => o.nivel === nivel).length ? opcoes.filter(o => o.nivel === nivel) : opcoes;
    const ex = this.sorteia(opcoes);
    return { ...ex, lang, gerado: true, titulo: "Desafio: " + ex.titulo };
  },

  // desafio sobre qualquer item da consulta ou aula
  sobre(tema) {
    if (!tema || tema.lang === "conversa") return null;
    const lang = tema.lang;
    const ex = WCDEV.cerebro.primeiroCodigo(tema);
    const nome = tema.titulo;
    let usa;
    if (lang === "html" && /^<\w+>$/.test(nome)) usa = { re: new RegExp(`<${nome.slice(1, -1)}[\\s>]`, "i"), falta: `Use a tag {{${nome}}}.` };
    else if (lang === "css" && /^[a-z-]+$/.test(nome)) usa = { re: new RegExp(`${nome}\\s*:`), falta: `Use a propriedade {{${nome}}}.` };
    else if (/^[A-Za-z_][\w.]*$/.test(nome)) usa = { re: new RegExp(`\\b${nome.split(".").pop()}\\b`), falta: `Use **${nome}** no seu código.` };
    else usa = null;
    if (!usa && !ex) return null;
    const testes = [];
    if (usa) testes.push(usa);
    testes.push({ re: /\S[\s\S]{7,}/, falta: "Escreva um código de verdade (pelo menos uma linha completa)." });
    // só fica o que o próprio exemplo consegue cumprir (conceitos como "SEO" ou "px" não têm um nome pra usar no código)
    const possiveis = ex ? testes.filter(x => x.re.test(ex.codigo)) : testes;
    if (!possiveis.length) return null;
    testes.length = 0;
    testes.push(...possiveis);
    const contexto = { pawn: "dentro de um comando ou callback", python: "num programinha", html: "numa página", css: "estilizando algum elemento" }[lang];
    return {
      lang, gerado: true, nivel: 2, titulo: `Desafio: usar ${nome}`,
      enunciado: `Escreva um código **seu** usando **${nome}** ${contexto}. Invente uma situação, tipo um comando ou programa que faça sentido.\nEu vou conferir se você usou certo e se não tem erro.`,
      dica: ex ? `Olhe o exemplo de ${nome} e adapte pra sua ideia:\n~~~${ex.lang}\n${ex.codigo}\n~~~` : `Pergunte "${nome}" pra ver a explicação.`,
      testes, solucao: ex ? ex.codigo : "", base: lang === "css" ? `<h1>Título</h1><p>Parágrafo</p><a href="#">Link</a><button class="botao">Botão</button><div class="card caixa">Caixa</div>` : undefined,
    };
  },

  /* ---------------- missões (projetos com checklist) ---------------- */
  missoes: {
    pawn: [
      { titulo: "Missão: mini servidor de DM", enunciado: "Monte um **gamemode de deathmatch** completo:",
        itens: [
          [/#include\s*<(a_samp|open\.mp)>/, "Incluir o {{a_samp}}"],
          [/\bmain\s*\(\s*\)/, "Ter a função {{main()}}"],
          [/public\s+OnGameModeInit\s*\(\s*\)[\s\S]*AddPlayerClass\s*\(/, "Criar uma classe com {{AddPlayerClass}} no {{OnGameModeInit}}"],
          [/public\s+OnPlayerSpawn\s*\(\s*playerid\s*\)[\s\S]*GivePlayerWeapon\s*\(/, "Dar armas no {{OnPlayerSpawn}}"],
          [/public\s+OnPlayerDeath\s*\([^)]*\)[\s\S]*SetPlayerScore\s*\(/, "Dar score pra quem matar no {{OnPlayerDeath}}"],
          [/public\s+OnPlayerConnect\s*\(\s*playerid\s*\)[\s\S]*SendClientMessage\s*\(/, "Mensagem de boas-vindas no {{OnPlayerConnect}}"],
          [/CMD\s*:\s*kill|"\/kill"/i, "Comando {{/kill}}"],
        ] },
      { titulo: "Missão: sistema de admin", enunciado: "Crie um **sistema de admin** básico:",
        itens: [
          [/enum\s+\w+[\s\S]*Admin/i, "Um {{enum}} com o nível de admin"],
          [/new\s+\w+\s*\[\s*MAX_PLAYERS\s*\]\s*\[\s*\w+\s*\]/, "O array {{[MAX_PLAYERS][enum]}}"],
          [/CMD\s*:\s*kick/i, "Comando {{/kick}} com sscanf"],
          [/sscanf\s*\(\s*params/, "Ler parâmetros com {{sscanf}}"],
          [/SetTimerEx\s*\(\s*"\w+"\s*,\s*\d+\s*,\s*false\s*,\s*"i"/, "Kickar com atraso usando {{SetTimerEx}}"],
          [/CMD\s*:\s*(tp|ir|trazer|goto)/i, "Um comando de teleporte de admin"],
          [/IsPlayerAdmin\s*\(|\]\s*\[\s*\w*Admin\w*\s*\]\s*[<>]=?/i, "Conferir se é admin antes de executar"],
        ] },
      { titulo: "Missão: loja com dialog", enunciado: "Crie uma **loja de armas** com dialog:",
        itens: [
          [/#define\s+DIALOG_\w+\s+\d+/, "Um {{#define}} pro ID do dialog"],
          [/CMD\s*:\s*\w+[\s\S]*ShowPlayerDialog\s*\([^)]*DIALOG_STYLE_(LIST|TABLIST)/, "Um comando que abre o dialog de lista"],
          [/public\s+OnDialogResponse\s*\(\s*playerid\s*,\s*dialogid\s*,\s*response\s*,\s*listitem\s*,\s*inputtext\s*\[\s*\]\s*\)/, "O {{OnDialogResponse}} com o cabeçalho certo"],
          [/GetPlayerMoney\s*\(\s*playerid\s*\)\s*<\s*\d+/, "Conferir se o jogador tem dinheiro"],
          [/GivePlayerMoney\s*\(\s*playerid\s*,\s*-\s*\d+\s*\)/, "Cobrar o preço (dinheiro negativo)"],
          [/GivePlayerWeapon\s*\(/, "Entregar a arma"],
        ] },
    ],
    python: [
      { titulo: "Missão: banco digital", enunciado: "Crie um **banco no terminal**:",
        itens: [
          [/saldo\s*=\s*\d+/, "Uma variável {{saldo}}"], [/while\s+True\s*:/, "Um menu com {{while True}}"],
          [/def\s+depositar\s*\(/, "Função {{depositar}}"], [/def\s+sacar\s*\(/, "Função {{sacar}}"],
          [/if\s+[^:]*>\s*saldo|if\s+saldo\s*<|saldo\s*>=/, "Não deixar sacar mais do que tem"],
          [/float\s*\(\s*input|int\s*\(\s*input/, "Converter o valor digitado"], [/break/, "Opção de sair (break)"],
        ] },
      { titulo: "Missão: quiz", enunciado: "Crie um **quiz de perguntas**:",
        itens: [
          [/perguntas\s*=\s*\[|perguntas\s*=\s*\{/, "Uma lista/dicionário de {{perguntas}}"], [/for\s+\w+.*\s+in\s+/, "Percorrer as perguntas com {{for}}"],
          [/input\s*\(/, "Pedir a resposta"], [/\.lower\s*\(\s*\)|\.strip\s*\(\s*\)/, "Ignorar maiúsculas/espaços ({{lower}} ou {{strip}})"],
          [/pontos\s*\+=|acertos\s*\+=/, "Contar os acertos"], [/print\s*\(\s*f?["'].*(pontos|acertos)/, "Mostrar a pontuação final"],
        ] },
    ],
    html: [
      { titulo: "Missão: página do seu servidor", enunciado: "Monte a **página de divulgação** do seu servidor:",
        itens: [
          [/<!DOCTYPE html>/i, "{{<!DOCTYPE html>}}"], [/<meta\s+charset/i, "{{<meta charset=\"UTF-8\">}}"],
          [/<header[\s\S]*<h1/i, "{{<header>}} com {{<h1>}}"], [/<nav[\s\S]*<a\s/i, "Menu {{<nav>}} com links"],
          [/<img\s[^>]*alt\s*=/i, "Uma imagem com {{alt}}"], [/<(ul|ol)[\s\S]*<li/i, "Uma lista de regras ou recursos"],
          [/<a\s[^>]*href\s*=\s*["']https?:\/\/(discord|wa\.me|www\.youtube)/i, "Link pro Discord, WhatsApp ou YouTube"], [/<footer/i, "Um {{<footer>}}"],
        ] },
    ],
    css: [
      { titulo: "Missão: tema azul e preto", enunciado: "Crie o **tema WC DEV** pra uma página:",
        itens: [
          [/:root\s*\{[^}]*--[\w-]+\s*:/, "Variáveis de cor no {{:root}}"], [/body\s*\{[^}]*background/, "Fundo escuro no {{body}}"],
          [/var\s*\(\s*--/, "Usar as variáveis com {{var()}}"], [/\.botao\s*\{[^}]*border-radius/, "Um {{.botao}} arredondado"],
          [/\.botao\s*:hover/, "Efeito {{:hover}} no botão"], [/transition\s*:/, "Uma {{transition}}"],
          [/@media\s*\(\s*max-width/, "Um {{@media}} pro celular"],
        ] },
    ],
  },

  missao(lang, indice) {
    const lista = this.missoes[lang];
    if (!lista) return null;
    const m = lista[indice !== undefined ? indice % lista.length : Math.floor(Math.random() * lista.length)];
    return {
      lang, gerado: true, missao: true, nivel: 3, titulo: m.titulo,
      enunciado: m.enunciado + "\n" + m.itens.map(i => "- " + i[1]).join("\n") + "\n\nVá montando no editor e envie quantas vezes quiser: eu marco o que já está pronto ✅.",
      dica: "Faça um item de cada vez e envie pra ver o progresso. Pergunte qualquer coisa no chat se travar.",
      testes: m.itens.map(([re, txt]) => ({ re, falta: txt })),
      solucao: "", base: lang === "css" ? `<h1>Título</h1><p>Texto</p><button class="botao">Botão</button>` : undefined,
    };
  },
};

WCDEV.desafios = Desafios;
