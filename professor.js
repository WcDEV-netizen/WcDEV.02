/* =========================================================
   WC DEV — PROFESSOR
   - entende mensagens de ERRO do compilador Pawn e do Python
   - explica com comparações do dia a dia ("explica fácil")
   - roteiros de projeto ("quero fazer um servidor RPG")
   - progresso nas trilhas
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Professor = {

  /* ================= 1. MENSAGENS DE ERRO ================= */
  // gamemode.pwn(12) : error 017: undefined symbol "SendClientMesage"
  RE_PAWN: /([\w\-. /\\:]*?\.(?:pwn|inc|p))?\s*\((\d+)(?:\s*--\s*(\d+))?\)\s*:\s*(fatal error|error|warning)\s*(\d+)\s*:\s*([^\n]+)/gi,

  ehMensagemDeErro(texto) {
    return /\(\d+(?:\s*--\s*\d+)?\)\s*:\s*(fatal error|error|warning)\s*\d+\s*:/i.test(texto) ||
      /Traceback \(most recent call last\)|^\s*File ".+", line \d+|^\s*\w+Error: .+$/m.test(texto) ||
      /^(error|warning) \d{3}: /mi.test(texto);
  },

  nomeParecido(nome, lang) {
    const lista = WCDEV.temas.filter(t => t.ref && t.lang === lang && /^[A-Za-z_][\w.]*$/.test(t.titulo)).map(t => t.titulo.split(".").pop());
    let melhor = null, menor = 9;
    for (const x of lista) {
      if (Math.abs(x.length - nome.length) > 2) continue;
      const a = nome.toLowerCase(), b = x.toLowerCase();
      let d = distancia(a, b);
      // letras trocadas de lugar ("nmoe" / "nome") contam como 1 erro só
      if (a.length === b.length) for (let k = 0; k < a.length - 1; k++) if (a[k] !== b[k]) { if (a[k] === b[k + 1] && a[k + 1] === b[k] && a.slice(k + 2) === b.slice(k + 2)) d = 1; break; }
      if (d < menor) { menor = d; melhor = x; }
    }
    return menor === 1 || (menor === 2 && nome.length >= 7) ? melhor : null;
  },

  explicarErros(texto) {
    const itens = [];
    let m;
    const re = new RegExp(this.RE_PAWN.source, "gi");
    while ((m = re.exec(texto)) && itens.length < 12) {
      const [, arquivo, linha, linha2, tipo, num, resto] = m;
      itens.push({ lang: "pawn", arquivo: (arquivo || "").trim().split(/[\\/]/).pop(), linha, linha2, tipo: tipo.toLowerCase(), num: num.padStart(3, "0"), msg: resto.trim() });
    }
    if (!itens.length) {
      const soltos = texto.match(/^(fatal error|error|warning) (\d{3}): (.+)$/gmi) || [];
      soltos.forEach(l => { const x = l.match(/^(fatal error|error|warning) (\d{3}): (.+)$/i); itens.push({ lang: "pawn", tipo: x[1].toLowerCase(), num: x[2], msg: x[3] }); });
    }
    if (itens.length) return this.respostaPawn(itens);
    return this.respostaPython(texto);
  },

  respostaPawn(itens) {
    const erros = itens.filter(i => i.tipo !== "warning"), avisos = itens.filter(i => i.tipo === "warning");
    let t = `> 🧠 Li a saída do compilador: ${erros.length} erro(s) e ${avisos.length} aviso(s). Vou te explicar um por um.\n`;
    t += erros.length ? "### 🔧 Vamos resolver isso juntos\n" : "### ⚠️ Só avisos (o .amx foi gerado, mas vale arrumar)\n";
    const dica = { "001": "falta de **;** ou parêntese, quase sempre na linha **de cima**", "017": "um nome que não existe", "021": "nome repetido", "025": "cabeçalho de callback diferente do original", "029": "expressão quebrada", "030": "chave **}** faltando", "033": "texto comparado com **==** (use strcmp)", "035": "tipo errado de valor numa função", "054": "chave **}** sobrando", "100": "include que não foi achado", "203": "variável criada e não usada", "213": "Float misturado com inteiro (faltou Float: ou o .0)", "217": "indentação bagunçada (TAB e espaço)", "235": "public sem forward", "202": "quantidade errada de argumentos", "209": "função que nem sempre retorna valor", "211": "**=** onde devia ser **==**" };
    for (const i of itens.slice(0, 8)) {
      const ref = WCDEV.temas.find(x => x.lang === "pawn" && x.ref && (x.titulo === `${i.tipo} ${i.num}` || x.titulo === `${i.tipo} ${String(+i.num)}`));
      const onde = i.linha ? `Linha ${i.linha}${i.linha2 ? `–${i.linha2}` : ""}${i.arquivo ? ` do ${i.arquivo}` : ""}` : "Sem linha";
      t += `\n**${i.tipo === "warning" ? "⚠️" : "❌"} ${onde}: ${i.tipo} ${i.num}**\n`;
      t += `O que significa: ${dica[i.num] || (ref ? WCDEV.cerebro.frase(ref).replace(/\*\*/g, "") : i.msg)}.\n`;
      const simbolo = (i.msg.match(/"([^"]+)"/) || [])[1];
      if (simbolo && i.num === "017") {
        const quis = this.nomeParecido(simbolo, "pawn");
        t += quis ? `👉 O **${simbolo}** não existe, mas parece muito com **${quis}**. Provavelmente é erro de digitação!\n`
          : `👉 O **${simbolo}** não existe: confira se você criou essa variável/função, se escreveu igualzinho (maiúsculas importam) ou se faltou o {{#include}} dela.\n`;
      } else if (simbolo && i.num === "100") t += `👉 O include **${simbolo}** não foi achado. Coloque o arquivo .inc na pasta {{pawno/include}} (ou {{qawno/include}}).\n`;
      else if (simbolo) t += `👉 O problema está em **${simbolo}**.\n`;
      if (i.num === "001" && i.linha) t += `👉 Olha também a **linha ${+i.linha - 1}**: o ; que falta costuma ser lá.\n`;
    }
    if (itens.length > 8) t += `\n(mostrei 8 de ${itens.length})`;
    if (erros.length > 2) t += "\n💡 **Dica de professor:** um erro costuma gerar vários outros \"em cascata\". Arrume o **primeiro** e compile de novo, que muitos dos outros somem sozinhos.";
    t += "\nSe quiser, **cole o código** aqui que eu acho e conserto as linhas pra você.";
    const sugestoes = ["/editor"];
    const primeira = WCDEV.temas.find(x => x.lang === "pawn" && x.ref && itens[0] && x.titulo === `${itens[0].tipo} ${itens[0].num}`);
    if (primeira) sugestoes.push(primeira.titulo);
    return { texto: t, sugestoes };
  },

  respostaPython(texto) {
    const final = (texto.match(/^\s*(\w+(?:Error|Exception|Interrupt|Iteration))\s*:?\s*(.*)$/m) || []);
    if (!final[1]) return null;
    const linhas = [...texto.matchAll(/File "([^"]+)", line (\d+)/g)];
    const ultima = linhas.length ? linhas[linhas.length - 1] : null;
    const ref = WCDEV.temas.find(x => x.lang === "python" && x.ref && x.titulo === final[1]);
    let t = `> 🧠 Li o erro do Python. O importante fica na **última linha** (o tipo do erro) e na linha com o **número** (onde foi).\n### 🐍 ${final[1]}${ultima ? ` na linha ${ultima[2]}` : ""}\n`;
    t += ref ? WCDEV.cerebro.frase(ref) + "\n" : "";
    let m;
    if ((m = final[2].match(/name '(\w+)' is not defined/))) {
      const quis = this.nomeParecido(m[1], "python");
      t += quis ? `👉 Você usou **${m[1]}**, que não existe. Será que não quis dizer **${quis}**?` : `👉 A variável/função **${m[1]}** não existe nesse ponto: confira se criou ela **antes** de usar e se o nome está igualzinho.`;
    } else if ((m = final[2].match(/can only concatenate str \(not "(\w+)"\) to str/))) {
      t += `👉 Você tentou juntar **texto** com **${m[1]}** usando +. Converta com {{str(valor)}} ou use f-string: {{f"Total: {valor}"}}.`;
    } else if (/unsupported operand type\(s\) for .+: 'str' and 'int'|'int' and 'str'/.test(final[2])) {
      t += "👉 Você está fazendo conta com **texto**. Lembre: o {{input()}} devolve texto, converta com {{int()}} ou {{float()}}.";
    } else if ((m = final[2].match(/invalid literal for int\(\) with base 10: '(.*)'/))) {
      t += `👉 O {{int()}} recebeu **"${m[1]}"**, que não é número. Valide antes com {{.isdigit()}} ou use try/except.`;
    } else if (/expected ':'/.test(final[2]) || /invalid syntax/.test(final[2])) {
      t += "👉 Confira a linha (e a de cima): falta **:** no fim do if/for/def, ou tem parêntese/aspas sem fechar?";
    } else if (/expected an indented block/.test(final[2])) {
      t += "👉 Depois de uma linha com **:**, a próxima precisa de **4 espaços** na frente.";
    } else if (/unexpected indent/.test(final[2])) {
      t += "👉 Essa linha tem **espaço a mais** no começo. Alinhe com as de cima.";
    } else if (/list index out of range/.test(final[2])) {
      t += "👉 Você pediu uma posição que a lista não tem. Lembre: começa no **0** e vai até **len(lista) - 1**.";
    } else if ((m = final[2].match(/'(\w+)' object has no attribute '(\w+)'/))) {
      t += `👉 O tipo **${m[1]}** não tem **${m[2]}**. Talvez o nome esteja errado, ou a variável não é do tipo que você pensa (use {{type(x)}} pra ver).`;
    } else if ((m = final[2].match(/No module named '([\w.]+)'/))) {
      t += `👉 Instale com {{pip install ${m[1]}}} no terminal (ou confira se o nome está certo).`;
    } else if (final[2]) {
      t += `👉 Mensagem: {{${final[2].slice(0, 90).replace(/[{}]/g, "")}}}`;
    }
    t += "\n\nSe quiser, cole o **código** que eu acho a linha e conserto pra você.";
    return { texto: t, sugestoes: ref ? [ref.titulo, "/editor"] : ["/editor"] };
  },

  /* ================= 2. EXPLICA FÁCIL (comparações) ================= */
  ANALOGIAS: [
    [/variav/, "Uma **variável** é tipo uma **caixinha com etiqueta**: a etiqueta é o nome (vida), e dentro fica o valor (100). Você pode abrir a caixa e trocar o que tem dentro quando quiser."],
    [/funcao|funcoes|stock|def /, "Uma **função** é tipo uma **receita de bolo** guardada: você escreve os passos uma vez e, toda vez que quiser o bolo, só chama o nome da receita. Os parâmetros são os ingredientes que você passa."],
    [/if|else|condic|decis/, "O **if** é tipo o **segurança da balada**: \"se tiver 18 anos ou mais, entra; senão, volta pra casa\". O programa testa a condição e escolhe um caminho."],
    [/for|loop|repet|while|foreach/, "Um **loop** é tipo dar **10 voltas na quadra**: em vez de escrever \"corre uma volta\" 10 vezes, você diz \"repete 10 vezes: corre uma volta\". O while é \"corre ENQUANTO não cansar\"."],
    [/array|lista|vetor/, "Um **array/lista** é tipo uma **fileira de armários numerados**: armário 0, armário 1, armário 2... Cada um guarda uma coisa, e você acessa pelo número. (Sim, começa no 0!)"],
    [/dicionario|dict/, "Um **dicionário** é tipo uma **agenda de contatos**: você procura pelo **nome** (chave) e acha o **telefone** (valor), sem precisar saber a posição."],
    [/classe|objeto|poo/, "Uma **classe** é a **forma de biscoito**, e os objetos são os **biscoitos**. A forma é uma só, mas dá pra fazer vários biscoitos, cada um com o seu recheio."],
    [/callback|evento/, "Um **callback** é tipo a **campainha da sua casa**: você não fica olhando a porta o tempo todo; quando alguém aperta (o jogador entra, morre...), o servidor \"toca a campainha\" e roda o seu código."],
    [/timer/, "Um **timer** é tipo o **despertador**: você programa \"daqui a 10 minutos, me avisa\" (ou \"todo dia às 7h\"), e quando dá a hora ele chama a sua função."],
    [/enum|dados do jogador/, "Um **enum** é tipo uma **ficha de cadastro** com campos fixos (nome, nível, dinheiro). O array **Jogador[MAX_PLAYERS]** é a **pasta** com uma ficha pra cada jogador."],
    [/string|texto/, "Em Pawn, um **texto** é tipo um **colar de contas**: cada conta é uma letra, numa fileira. Por isso você precisa dizer o tamanho do colar, e não dá pra comparar dois colares com == (tem que olhar conta por conta: strcmp)."],
    [/return/, "O **return** é tipo o **entregador voltando com a resposta**: a função faz o trabalho e \"devolve\" o resultado pra quem chamou."],
    [/tag|html/, "O **HTML** é o **esqueleto** do site e as **tags** são as **peças**: {{<h1>}} é a cabeça (título), {{<p>}} são os parágrafos, {{<img>}} as fotos. Toda peça que abre precisa fechar."],
    [/seletor/, "O **seletor** do CSS é tipo **apontar o dedo**: \"você aí, com a classe .botao, fica azul!\". O ponto (.) aponta pra classe e a cerquilha (#) pra um id."],
    [/flex/, "O **flexbox** é tipo arrumar **livros numa prateleira**: você decide se ficam lado a lado ou empilhados, se ficam juntos no meio ou espalhados, e o espaço entre eles."],
    [/box model|margin|padding/, "Pensa numa **caixa de presente**: o **conteúdo** é o presente, o **padding** é o plástico-bolha dentro da caixa, a **border** é a caixa, e a **margin** é o espaço entre essa caixa e as outras na mesa."],
    [/include|import|modulo|biblioteca/, "Um **include/import** é tipo pegar uma **caixa de ferramentas pronta** emprestada: alguém já fez as ferramentas (funções), você só traz a caixa pro seu projeto."],
    [/compil/, "O **compilador** é tipo um **tradutor**: você escreve em Pawn (que a gente entende), e ele traduz pra **.amx** (que o servidor entende). Se tiver erro de \"gramática\", ele se recusa a traduzir e te avisa onde."],
    [/dialog/, "Um **dialog** é tipo um **garçom com o cardápio**: ele mostra as opções pro jogador e, quando o jogador escolhe, o {{OnDialogResponse}} recebe o pedido."],
    [/parametro|argumento/, "Os **parâmetros** são os **ingredientes** que você entrega pra receita (função). {{GivePlayerMoney(playerid, 500)}}: \"dá dinheiro\" é a receita; o jogador e o 500 são os ingredientes."],
    [/float|decimal/, "**Float** é número **com vírgula** (100.5), tipo preço de mercado. Inteiro é número **redondo** (100), tipo quantidade de pessoas. Em Pawn você avisa qual é com a tag Float:."],
  ],

  analogia(tema) {
    if (!tema) return null;
    const alvo = typeof tema === "string" ? tema : normalizar(tema.titulo + " " + (tema.chaves || []).slice(0, 4).join(" "));
    const a = this.ANALOGIAS.find(([re]) => re.test(alvo));
    return a ? a[1] : null;
  },

  /* ================= 3. ROTEIROS DE PROJETO ================= */
  ROTEIROS: [
    { re: / (servidor|gamemode|gm|server) .*(rpg|roleplay|rp)|(rpg|roleplay) /, titulo: "Servidor RPG (roleplay)", lang: "pawn", passos: [
      ["Monte o servidor e entenda a estrutura", "Montando o servidor"], ["Variáveis e o enum do jogador", "Dados do jogador com enum"],
      ["Sistema de login e registro", "Projeto: login e registro completo"], ["Salvar contas (DOF2 ou MySQL)", "Salvar contas (DOF2 e MySQL)"],
      ["Comandos com zcmd + sscanf", "Comandos (/comando)"], ["Chat local e /me /do", "comandos /me e /do"],
      ["Empregos com checkpoint", "emprego de entregador"], ["Admin: /kick /ban /ir", "Sistema de admin"],
      ["Payday (salário)", "sistema de payday"], ["Prisão (jail)", "sistema de prender (jail)"]] },
    { re: / (dm|deathmatch|tdm|pvp|mata mata|x1) /, titulo: "Servidor DM (deathmatch)", lang: "pawn", passos: [
      ["Estrutura do gamemode", "Estrutura de um gamemode"], ["Classes e spawn com armas", "kit ao nascer"],
      ["Score por kill", "OnPlayerDeath"], ["Comandos /kill /heal", "comando /heal"], ["Contagem e eventos", "contagem regressiva"],
      ["Times e gangzones", "GangZoneCreate"], ["Anti-flood e ping alto", "anti-flood no chat"], ["Missão: mini DM completo", "/missao pawn"]] },
    { re: / (corrida|race|drift) /, titulo: "Servidor de corrida", lang: "pawn", passos: [
      ["Criar veículos", "Veículos"], ["Checkpoints de corrida", "SetPlayerRaceCheckpoint"], ["Contagem regressiva", "contagem regressiva"],
      ["Velocímetro", "velocímetro"], ["Tuning", "AddVehicleComponent"], ["Timers pra cronometrar", "GetTickCount"]] },
    { re: / (site|pagina|portfolio|landing) (?!interativo)/, titulo: "Seu primeiro site", lang: "html", passos: [
      ["Estrutura básica do HTML", "Estrutura básica de uma página"], ["Títulos, textos e imagens", "Títulos e parágrafos"],
      ["Links e menu", "menu de navegação"], ["Ligar o CSS", "O que é CSS e como ligar no HTML"], ["Cores e fontes", "Cores e fundos"],
      ["Layout com flexbox", "Flexbox (alinhar e centralizar)"], ["Deixar responsivo", "Site responsivo (celular)"], ["Publicar de graça", "publicar site"]] },
    { re: / (site interativo|jogo no navegador|jogo em javascript|jogo javascript|app web|aplicacao web|lista de tarefas) /, titulo: "Site interativo com JavaScript", lang: "javascript", passos: [
      ["HTML e CSS básicos", "html:Estrutura básica de uma página"], ["Variáveis e tipos", "Variáveis: let, const e tipos"], ["Condições e loops", "if, else e switch"],
      ["Funções", "Funções e arrow functions"], ["Arrays e objetos", "Arrays e seus métodos (push, map, filter)"], ["Mexer na página (DOM)", "DOM: mexendo na página"],
      ["Eventos (cliques)", "Eventos: clique, teclado e formulário"], ["Código assíncrono", "Assíncrono: setTimeout, Promise e async/await"], ["Projeto: lista de tarefas", "Projeto: lista de tarefas"]] },
    { re: / (jogo) .*(python)|(pygame) /, titulo: "Jogo em Python", lang: "python", passos: [
      ["Variáveis e input", "Variáveis"], ["if/else", "if, elif e else (decisões)"], ["Loops", "while (repetir enquanto)"],
      ["Números aleatórios", "Módulos e import"], ["Funções", "Funções"], ["Projeto: jogo de adivinhação", "Projeto: jogo de adivinhação"],
      ["Jogo com janela (pygame)", "pygame"]] },
    { re: / (bot) .*(discord)|(discord) .*(bot) /, titulo: "Bot pro Discord", lang: "python", passos: [
      ["Python básico (variáveis, if, funções)", "Funções"], ["Instalar bibliotecas com pip", "pip"], ["Async e await", "async e await"],
      ["A biblioteca discord.py", "discord.py"], ["Guardar dados em JSON", "json.dump"]] },
  ],

  acharPasso(titulo, lang) {
    if (/^\w+:/.test(titulo)) { const [l, t] = [titulo.split(":")[0], titulo.slice(titulo.indexOf(":") + 1)]; return WCDEV.temas.find(x => x.titulo === t && x.lang === l); }
    return WCDEV.temas.find(x => x.titulo === titulo && x.lang === lang) || WCDEV.temas.find(x => x.titulo === titulo && x.lang !== "conversa");
  },

  roteiro(t) {
    if (!/ (quero|queria|vou|como|preciso|bora|quero fazer|quero criar|criar|fazer|montar|abrir) /.test(t)) return null;
    if (!/ (servidor|gamemode|gm|site|pagina|portfolio|jogo|bot|projeto|server|rpg|roleplay|dm|corrida|app|aplicacao|lista) /.test(t)) return null;
    // "como deixa o fundo da página azul" é pergunta de CSS, não "quero construir um site"
    if (/ (fundo|cor|centraliz\w*|fonte|borda|sombra|piscar|imagem|botao|margem|alinhar|estourando|menu|link) /.test(t) && !/ (quero|queria|vou|bora|preciso) (fazer|criar|montar|construir|comecar|abrir) /.test(t)) return null;
    const r = this.ROTEIROS.find(x => x.re.test(t));
    if (!r) {
      if (/ (servidor|gamemode|gm|server) /.test(t) && / (quero|queria|vou|bora|pretendo|preciso) /.test(t) && / (fazer|criar|abrir|ter|montar|comecar) /.test(t) &&
          (/ (samp|sa mp|sa-mp|gta|open.mp|openmp|pawn) /.test(t) || estado.lang === "pawn")) {
        atualizarLang("pawn");
        return { texto: "> 🧠 Você quer montar um servidor de SA-MP. Antes de te passar o caminho, preciso saber o estilo.\n### 🎮 Que tipo de servidor?\nCada estilo tem uma ordem de estudo diferente. Escolhe um 👇", sugestoes: ["quero fazer um servidor rpg", "quero fazer um servidor dm", "quero fazer um servidor de corrida"] };
      }
      return null;
    }
    const vistas = (Treino.progresso && Treino.progresso._vistas) || [];
    const passos = r.passos.map(([desc, alvo], i) => {
      const tema = this.acharPasso(alvo, r.lang);
      const ok = tema && vistas.includes(tema.id);
      return `- ${ok ? "✅" : "⬜"} **Passo ${i + 1}:** ${desc}`;
    }).join("\n");
    const proximo = r.passos.find(([, alvo]) => { const tema = this.acharPasso(alvo, r.lang); return !tema || !vistas.includes(tema.id); });
    atualizarLang(r.lang);
    return {
      texto: `> 🧠 Você quer construir um projeto de verdade. Montei o caminho na ordem que eu ensinaria, do mais básico ao mais avançado.\n### 🗺️ Roteiro: ${r.titulo}\n${passos}\n\nVai no seu ritmo: um passo por dia já é ótimo. Toque no passo que quer estudar agora 👇`,
      sugestoes: [...new Set([proximo ? proximo[1] : r.passos[0][1], ...r.passos.slice(0, 5).map(p => p[1])].map(x => x.replace(/^\w+:/, "")))].slice(0, 6),
    };
  },

  /* ================= AULA GUIADA: aula → desafio → próximo passo ================= */
  montarDesafio(aula) {
    const d = aula && WCDEV.desafiosAula && WCDEV.desafiosAula[aula.id];
    if (!d) return null;
    return { ...d, lang: aula.lang, titulo: `Desafio da aula: ${aula.titulo}`, daAula: true, aulaTitulo: aula.titulo };
  },
  aulaFeita(id) {
    const p = Treino.progresso || {};
    return (p._aulasOk || []).includes(id) || (p._aulasPuladas || []).includes(id);
  },
  // mostra a aula e já passa o desafio dela (no fim da mesma mensagem)
  aulaComDesafio(aula, resposta, n, total) {
    const ex = this.montarDesafio(aula);
    const topo = `> 📚 Aula ${n} de ${total} da trilha de ${NOMES[aula.lang]}. Lê com calma: no final tem um desafio pra fixar.\n` + (WCDEV.professorAdaptativo ? WCDEV.professorAdaptativo.cabecalhoAula(aula) : "");
    if (!ex || this.aulaFeita(aula.id)) return { ...resposta, texto: topo + resposta.texto };
    const d = Treino.abrir(ex);
    return {
      texto: topo + resposta.texto + "\n\n" + d.texto,
      sugestoes: ["/editor", "/dica", "explica melhor", "/pular"],
      preview: resposta.preview,
    };
  },
  abrirDesafioDaAula(aula) {
    if (!aula) return { texto: "Primeiro escolhe uma aula da trilha (tipo {{/pawn}}) que eu te passo o desafio dela. 🙂", sugestoes: ["/pawn", "/python", "/html", "/css"] };
    const ex = this.montarDesafio(aula);
    if (!ex) return { texto: `A aula **${aula.titulo}** não tem um desafio próprio. Quer um desafio surpresa de ${NOMES[aula.lang]}?`, sugestoes: [`/desafio ${aula.lang}`, "/proximo"] };
    return Treino.abrir(ex);
  },
  // tentou ir pro próximo passo sem fazer o desafio da aula atual
  portaoDaAula() {
    const ativo = Treino.ativo;
    if (ativo && ativo.daAula) {
      return {
        texto: `Calma, quase lá! 😄 Antes do próximo passo, faz o **desafio da aula ${ativo.aulaTitulo}**. É ele que faz o conteúdo **entrar na cabeça**.\n\n**Relembrando:** ${ativo.enunciado}\n\nSe travou, peça uma **/dica**. Se quiser mesmo seguir sem fazer, use **/pular**.`,
        sugestoes: ["/editor", "/dica", "/pular"],
      };
    }
    const aula = estado.ultimaAula;
    if (aula && this.montarDesafio(aula) && !this.aulaFeita(aula.id) && (Treino.progresso || {})._vistas && Treino.progresso._vistas.includes(aula.id)) {
      const d = Treino.abrir(this.montarDesafio(aula));
      return { texto: `Antes de ir pro próximo passo, falta o desafio da aula **${aula.titulo}** 👇\n\n` + d.texto, sugestoes: ["/editor", "/dica", "/pular"] };
    }
    return null;
  },
  aulaConcluida(ex, avisos, preview) {
    const PA = WCDEV.professorAdaptativo;
    if (PA) PA.registrar(ex.aula, ex.lang, true, { ajuda: (ex._dicaVista ? 1 : 0) + (ex._respostaVista ? 2 : 0) });
    const dom = PA ? PA.estadoAula(ex.aula) : null;
    const p = Treino.progresso;
    p._aulasOk = p._aulasOk || [];
    if (!p._aulasOk.includes(ex.aula)) p._aulasOk.push(ex.aula);
    const d = p._desafios || {};
    d[ex.lang] = (d[ex.lang] || 0) + 1;
    p._desafios = d;
    Treino.salvarProgresso();
    const lista = temasDa(ex.lang);
    const i = lista.findIndex(x => x.id === ex.aula);
    const prox = lista[i + 1];
    const feitas = lista.filter(a => p._aulasOk.includes(a.id)).length;
    const elogio = ["Mandou muito bem!", "Isso aí! Entrou na cabeça! 🧠", "Perfeito, programador(a)!", "Acertou! 😎", "Show de bola!"][Math.floor(Math.random() * 5)];
    return {
      texto: `### ✅ ${elogio}\nVocê fez o desafio da aula **${ex.aulaTitulo}**. Trilha de ${NOMES[ex.lang]}: ${this.barra(feitas, lista.length)} **${feitas}/${lista.length}** aulas concluídas.` +
        (avisos && avisos.length ? `\n\nSó umas dicas pra ficar ainda melhor:\n${avisos.slice(0, 4).map(a => `- Linha ${a.linha}: ${a.msg}`).join("\n")}` : "") +
        (dom ? `\n\n**Essa aula agora está:** ${PA.ROTULO[dom.estado]}${dom.estado !== "dominado" ? ` (${PA.porQue(dom)}). Pra ficar **dominada**: acerte de novo outro dia, sem dica (eu te chamo na **/revisao**).` : "."}` : "") +
        (prox ? `\n\n**Próximo passo:** ${prox.titulo} 👉` : `\n\n🎉 Essa era a última aula da trilha de ${NOMES[ex.lang]}!`),
      sugestoes: prox ? ["▶ próximo passo", "teste rápido", "/desafio " + ex.lang] : ["/desafio " + ex.lang, "/missao " + ex.lang, "/boletim"],
      preview,
    };
  },
  pularDesafioDaAula(ex) {
    const p = Treino.progresso;
    p._aulasPuladas = p._aulasPuladas || [];
    if (!p._aulasPuladas.includes(ex.aula)) p._aulasPuladas.push(ex.aula);
    const aj = p._ajuda || {};
    aj[ex.lang] = (aj[ex.lang] || 0) + 1;
    p._ajuda = aj;
    Treino.salvarProgresso();
    Treino.ativo = null;
    if (WCDEV.editor) WCDEV.editor.fecharExercicio();
    const r = proximaAula();
    r.texto = `> ⏭️ Pulei o desafio da aula **${ex.aulaTitulo}**. Depois você pode voltar nele com **/desafio da aula** (vale a pena!).\n` + r.texto;
    return r;
  },

  /* ================= DIFICULDADE QUE SE ADAPTA ================= */
  // venceu muitos desafios -> sobe o nível; precisou ver muita resposta -> segura no nível mais fácil
  nivelAdaptado(lang) {
    const p = Treino.progresso || {};
    const vitorias = (p._desafios || {})[lang] || 0;
    const ajudas = (p._ajuda || {})[lang] || 0;
    const nota = vitorias - ajudas * 0.7;
    return nota < 3 ? 1 : nota < 8 ? 2 : 3;
  },
  explicarNivel(lang) {
    const n = this.nivelAdaptado(lang);
    return ["", "🌱 fácil (pra pegar o jeito)", "🔧 médio (você já está mandando bem)", "🚀 difícil (você já venceu vários)"][n];
  },

  /* ================= 4. PROGRESSO NAS TRILHAS ================= */
  marcarVista(tema) {
    if (!tema || tema.ref || tema.lang === "conversa" || !Treino.progresso) return;
    const v = (Treino.progresso._vistas = Treino.progresso._vistas || []);
    if (!v.includes(tema.id)) { v.push(tema.id); Treino.salvarProgresso(); }
  },

  barra(feito, total) {
    const n = total ? Math.round((feito / total) * 10) : 0;
    return "▰".repeat(n) + "▱".repeat(10 - n);
  },

  boletim() {
    const p = Treino.progresso || {};
    const vistas = p._vistas || [];
    const d = p._desafios || {};
    const q = p._quiz || { certas: 0, total: 0 };
    const linhas = ["pawn", "python", "html", "css", "javascript"].map(l => {
      const aulas = temasDa(l);
      const vistasL = aulas.filter(a => vistas.includes(a.id)).length;
      const ex = Treino.feitos(l).length, totEx = Treino.lista(l).length;
      const ok = aulas.filter(a => (p._aulasOk || []).includes(a.id)).length;
      const dm = WCDEV.professorAdaptativo ? WCDEV.professorAdaptativo.dominioDaTrilha(l) : null;
      return `- **${NOMES[l]}**: aulas ${this.barra(ok, aulas.length)} ${ok}/${aulas.length} concluídas (${vistasL} vistas) · exercícios ${ex}/${totEx} · desafios ${d[l] || 0}` + (dm && (dm.dominado + dm.praticando + dm.revisar) ? `\n  domínio: ✅ ${dm.dominado} dominada(s) · 🌱 ${dm.praticando} praticando · 🔁 ${dm.revisar} pra revisar` : "");
    });
    const total = linhas.length;
    const nivel = vistas.length + Object.values(d).reduce((a, b) => a + b, 0) * 2 + (q.certas || 0);
    const titulo = nivel < 10 ? "🌱 Iniciante" : nivel < 30 ? "🔧 Aprendiz" : nivel < 70 ? "⚙️ Programador(a)" : "🚀 Avançado(a)";
    return {
      texto: `### 📊 Seu boletim\nNível: **${titulo}**\n${linhas.join("\n")}\n- **Testes rápidos**: ${q.certas || 0} de ${q.total || 0} certas\n\n` +
        (vistas.length ? "**Dominada** = acertou o desafio 2+ vezes, em dias diferentes, pelo menos uma sem dica (uma vez só não prova que fixou). Continua assim! 💙" : "Ainda não começou nenhuma trilha. Bora? Escolhe uma 👇"),
      sugestoes: ["continuar de onde parei", "/revisao", "/modo", "/caca"],
      _total: total,
    };
  },
};

WCDEV.professor = Professor;
