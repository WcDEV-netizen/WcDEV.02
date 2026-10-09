/* =========================================================
   WC DEV — APRENDIZAGEM LOCAL (sem API, sem nuvem)

   O que existe aqui, com o nome certo de cada coisa:
   1. ATUALIZAR A BASE   importar documentos/exemplos (.md .txt .pwn .py .js...)
                         -> viram aulas consultáveis, com validação, detecção
                         de duplicados, versões e "desfazer"
   2. NOVAS REGRAS       regras de análise criadas por você (regex), testadas
                         contra os códigos corretos da base antes de salvar
   3. CONTEXTO           a memória da conversa (motor.js) — dura a conversa
   4. TREINAR UM MODELO  NÃO acontece aqui: não existe modelo de linguagem
                         sendo ajustado. Guardar mensagens não é "treinar".
   Feedback 👍/👎 vira SUGESTÃO pendente de revisão: nunca muda a base sozinho.
   Tudo fica salvo neste navegador (localStorage), por usuário.
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const Aprendizagem = (() => {
  const LIM = { arquivo: 1024 * 1024, item: 20000, itens: 200, minCorpo: 40 };
  const chave = n => chaveDoUsuario(n);
  const hoje = () => new Date().toLocaleString("pt-BR");

  /* ================= 1. BASE IMPORTADA (versões) ================= */
  function base() { return Guardar.ler(chave("base_importada"), { versoes: [] }); }
  function salvarBase(b) { return Guardar.salvar(chave("base_importada"), b); }

  function carregar() {
    WCDEV.temas = WCDEV.temas.filter(t => !t.importado);
    for (const v of base().versoes) for (const it of v.itens) {
      if (it.obsoleto) continue;   // obsoleto: fica guardado, mas não aparece nas respostas
      const tema = {
        id: it.id, lang: it.lang, importado: true, versao: v.id, titulo: it.titulo, chaves: it.chaves,
        resposta: `### ${it.titulo}\n${it.corpo}\n\n📥 *Conteúdo importado de **${v.origem}** em ${v.data}* · situação: **${it.verificado ? "verificado por você" : "experimental"}** (${it.confianca})${it.aviso ? ` · ⚠️ ${it.aviso}` : ""}${(it.conflitos || []).length ? ` · ⚔️ conflita com a referência: ${it.conflitos.join("; ")}` : ""}`,
        sugestoes: ["/importados"],
      };
      prepararTema(tema);
      WCDEV.temas.push(tema);
    }
  }

  // quebra o arquivo em itens de conhecimento
  function partir(texto, nome) {
    const ext = (nome.split(".").pop() || "").toLowerCase();
    const LANG_EXT = { pwn: "pawn", inc: "pawn", p: "pawn", py: "python", js: "javascript", mjs: "javascript", html: "html", htm: "html", css: "css" };
    if (LANG_EXT[ext]) {
      // arquivo de código: vira UM exemplo, com as funções como palavras-chave
      const lang = LANG_EXT[ext];
      const nomes = [...texto.matchAll(/(?:stock|public|function|def|CMD:)\s*([A-Za-z_]\w*)/g)].map(m => m[1]).slice(0, 12);
      return [{ titulo: `Exemplo: ${nome}`, corpo: "~~~" + lang + "\n" + texto.trim() + "\n~~~", lang, chaves: [nome.replace(/\.\w+$/, ""), ...nomes] }];
    }
    // texto/markdown: cada título (#, ##, ###) vira um item
    const itens = [];
    let atual = null;
    for (const linha of texto.replace(/\r\n/g, "\n").split("\n")) {
      const h = linha.match(/^#{1,3}\s+(.+?)\s*#*\s*$/);
      if (h) { if (atual) itens.push(atual); atual = { titulo: h[1].replace(/[*_`]/g, "").trim(), linhas: [] }; }
      else if (atual) atual.linhas.push(linha);
      else (atual = { titulo: nome.replace(/\.\w+$/, ""), linhas: [linha] });
    }
    if (atual) itens.push(atual);
    return itens.map(i => ({ titulo: i.titulo, corpo: i.linhas.join("\n").trim().replace(/```(\w*)/g, "~~~$1") }));
  }

  function linguagemDe(item) {
    if (item.lang) return item.lang;
    const bloco = item.corpo.match(/~~~(\w+)\n/);
    if (bloco && NOMES[bloco[1]]) return bloco[1];
    const cod = (item.corpo.match(/~~~\w*\n([\s\S]*?)~~~/) || [])[1];
    const det = cod && WCDEV.revisor ? WCDEV.revisor.detectar(cod) : null;
    if (det) return det;
    const t = normalizar(item.titulo + " " + item.corpo.slice(0, 400));
    return detectarLinguagem(t) || langProvavel(t) || "conversa";
  }
  function palavras(t) { return new Set(normalizar(t).split(" ").filter(w => w.length >= 4)); }
  function parecido(a, b) { const A = palavras(a), B = palavras(b); if (!A.size || !B.size) return 0; let c = 0; for (const w of A) if (B.has(w)) c++; return c / Math.min(A.size, B.size); }

  function importar(texto, nome) {
    if (texto.length > LIM.arquivo) return { texto: `O arquivo **${nome}** é grande demais (máx. 1 MB). Divida em partes.` };
    if (/\u0000/.test(texto)) return { texto: `**${nome}** não parece ser texto (é binário?). Eu importo .md, .txt e arquivos de código.` };
    const brutos = partir(texto, nome).slice(0, LIM.itens);
    const b = base();
    const versao = { id: "v" + Date.now().toString(36), data: hoje(), origem: nome, itens: [] };
    const pulados = { pequeno: [], grande: [], duplicado: [] };
    const existentes = WCDEV.temas.filter(t => t.lang !== "conversa" || t.aprendido);
    for (const it of brutos) {
      if (!it.titulo || it.titulo.length < 3 || it.corpo.replace(/\s/g, "").length < LIM.minCorpo) { pulados.pequeno.push(it.titulo || "(sem título)"); continue; }
      if (it.corpo.length > LIM.item) { pulados.grande.push(it.titulo); continue; }
      const nt = normalizar(it.titulo);
      const dup = existentes.find(t => t._titulo === nt) || versao.itens.find(x => normalizar(x.titulo) === nt) ||
        existentes.find(t => typeof t.resposta === "string" && parecido(it.titulo + " " + it.corpo.slice(0, 300), t.titulo + " " + t.resposta.slice(0, 300)) >= 0.85);
      if (dup) { pulados.duplicado.push(`${it.titulo} (já existe: ${dup.titulo})`); continue; }
      const lang = linguagemDe(it);
      // código com erro de sintaxe entra, mas marcado
      let aviso = "", erros = 0;
      for (const m of it.corpo.matchAll(/~~~(\w+)\n([\s\S]*?)~~~/g)) {
        const l = NOMES[m[1]] ? m[1] : lang;
        if (WCDEV.revisor && NOMES[l]) erros += (WCDEV.revisor.analisar(m[2], l) || { problemas: [] }).problemas.filter(p => p.tipo === "erro").length;
      }
      // Pawn: o analisador completo (lógica, segurança); conflito = chamada que não bate com a assinatura oficial
      const conflitos = [];
      let problemas = 0;
      if (WCDEV.analisador) {
        const blocos = [...it.corpo.matchAll(/~~~(\w*)\n([\s\S]*?)~~~/g)].filter(m => (m[1] || lang) === "pawn").map(m => m[2]);
        const inline = [...it.corpo.matchAll(/\{\{([A-Z]\w+\([^{}]*\))\}\}|`([A-Z]\w+\([^`]*\))`/g)].map(m => (m[1] || m[2]) + ";");
        for (const cod of blocos.concat(inline.length ? [inline.join("\n")] : [])) {
          const a = WCDEV.analisador.analisar(cod, "pawn", { semCache: true });
          a.achados.filter(x => x.regra === "assinatura-errada").forEach(x => conflitos.push(x.titulo.replace(/\{\{|\}\}|\*\*/g, "")));
          problemas += a.achados.filter(x => (x.nivel === "erro" || x.nivel === "provavel") && x.regra !== "assinatura-errada").length;
        }
      }
      if (erros) aviso = `o código deste item tem ${erros} erro(s) segundo o meu revisor`;
      if (problemas) aviso = (aviso ? aviso + "; " : "") + `${problemas} problema(s) de lógica/segurança segundo o analisador`;
      it._conflitos = [...new Set(conflitos)].slice(0, 4);
      it._problemas = problemas;
      const chaves = [...new Set([it.titulo, ...(it.chaves || []), ...[...it.corpo.matchAll(/\*\*([^*]{3,40})\*\*/g)].map(m => m[1])].map(x => x.trim()).filter(x => x.length >= 3))].slice(0, 16);
      versao.itens.push({ id: `imp-${versao.id}-${versao.itens.length}`, lang, titulo: it.titulo.slice(0, 90), corpo: it.corpo, chaves, confianca: it._conflitos.length ? "conflita com a referência oficial" : (erros || it._problemas) ? "não revisado, exemplo com problema" : "não revisado, exemplos sem problema nas minhas checagens", aviso, conflitos: it._conflitos, problemasExemplo: (erros || 0) + (it._problemas || 0) });
    }
    if (!versao.itens.length) {
      return { texto: `### 📥 Nada importado de **${nome}**\n` + resumoPulados(pulados) + "\n\nDica: use títulos (# ou ##) separando cada assunto, com pelo menos um parágrafo embaixo." };
    }
    const antes = respostasDeReferencia();
    b.versoes.push(versao);
    if (!salvarBase(b)) return { texto: "⚠️ O navegador não deixou salvar (armazenamento cheio ou bloqueado). Nada foi importado." };
    carregar();
    const depois = respostasDeReferencia();
    const mudaram = Object.keys(antes).filter(q => antes[q] !== depois[q]).map(q => `"${q}": antes **${antes[q] || "nada"}** → agora **${depois[q] || "nada"}**`);
    versao.regressao = mudaram.length;
    if (WCDEV.motor) WCDEV.motor.passo("Aprendizagem", `importei ${versao.itens.length} item(ns) de ${nome} como versão ${versao.id}`);
    const porLang = {};
    versao.itens.forEach(i => (porLang[i.lang] = (porLang[i.lang] || 0) + 1));
    return {
      texto: `### 📥 Importei ${versao.itens.length} item(ns) de **${nome}**\n` +
        Object.entries(porLang).map(([l, n]) => `- ${NOMES[l] || "Geral"}: ${n}`).join("\n") +
        (Object.values(pulados).some(x => x.length) ? "\n\n" + resumoPulados(pulados) : "") +
        `\n\n**Versão:** {{${versao.id}}} · ${versao.data}\nEsses itens entram como **experimentais** e aparecem com a origem quando eu usar. Não é treinamento de modelo: é a minha base de consulta crescendo.` +
        (versao.itens.some(i => (i.conflitos || []).length) ? `\n\n⚔️ **Conflitos com a referência oficial:**\n${versao.itens.filter(i => (i.conflitos || []).length).slice(0, 5).map(i => `- ${i.titulo}: ${i.conflitos.join("; ")}`).join("\n")}` : "") +
        (versao.itens.some(i => i.problemasExemplo) ? `\n\n⚠️ **Exemplos com problema** (conferi com o meu analisador): ${versao.itens.filter(i => i.problemasExemplo).map(i => i.titulo).slice(0, 5).join("; ")}` : "") +
        `\n\n🧪 **Teste de regressão:** conferi ${Object.keys(antes).length} perguntas de referência antes e depois: ${mudaram.length ? `**${mudaram.length} resposta(s) mudaram**:\n${mudaram.slice(0, 5).map(x => "- " + x).join("\n")}\nSe piorou, use **/desfazer importação**.` : "nenhuma resposta antiga mudou. ✅"}` +
        `\n\nComandos: **/verificar importado ID** (marca como verificado) · **/obsoleto ID** (tira das respostas) · **/desfazer importação**.`,
      sugestoes: [versao.itens[0].titulo, "/importados", "/desfazer importação"],
    };
  }
  function resumoPulados(p) {
    const l = [];
    if (p.duplicado.length) l.push(`**Repetidos (não importei):** ${p.duplicado.slice(0, 6).join("; ")}${p.duplicado.length > 6 ? "..." : ""}`);
    if (p.pequeno.length) l.push(`**Muito curtos:** ${p.pequeno.slice(0, 6).join("; ")}`);
    if (p.grande.length) l.push(`**Grandes demais (máx. 20 mil letras):** ${p.grande.join("; ")}`);
    return l.join("\n");
  }
  function listarImportados() {
    const b = base();
    if (!b.versoes.length) return { texto: "Você ainda não importou nada. Use **/importar** e escolha um arquivo **.md**, **.txt** ou de código (.pwn, .py, .js...).\nCada título (# ou ##) do arquivo vira um assunto que eu passo a conhecer.", sugestoes: ["/importar"] };
    return {
      texto: "### 📚 Base importada\n" + b.versoes.map(v => `- **${v.id}** · ${v.origem} · ${v.data} · ${v.itens.length} item(ns)${v.regressao ? ` · ⚠️ mudou ${v.regressao} resposta(s) de referência` : ""}\n${v.itens.slice(0, 6).map(i => `  - {{${i.id}}} ${i.titulo} — ${i.obsoleto ? "🗄 obsoleto" : i.verificado ? "✔ verificado" : (i.conflitos || []).length ? "⚔️ conflito" : i.problemasExemplo ? "⚠️ exemplo com problema" : "🧪 experimental"}`).join("\n")}${v.itens.length > 6 ? "\n  - ..." : ""}`).join("\n") +
        "\n\n**/desfazer importação** tira a última versão. **/apagar importação ID** tira uma específica.",
      sugestoes: ["/desfazer importação", "/importar"],
    };
  }
  function desfazer(id) {
    const b = base();
    if (!b.versoes.length) return { texto: "Não tem nenhuma importação pra desfazer." };
    const i = id ? b.versoes.findIndex(v => v.id === id) : b.versoes.length - 1;
    if (i < 0) return { texto: `Não achei a importação **${id}**. Veja a lista em **/importados**.`, sugestoes: ["/importados"] };
    const [v] = b.versoes.splice(i, 1);
    salvarBase(b);
    carregar();
    return { texto: `↩️ Desfeito: tirei os **${v.itens.length}** item(ns) importados de **${v.origem}** (${v.id}).`, sugestoes: ["/importados"] };
  }
  function abrirSeletor() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown,.txt,.pwn,.inc,.py,.js,.mjs,.html,.htm,.css";
    input.onchange = () => {
      const arq = input.files && input.files[0];
      if (!arq) return;
      if (arq.size > LIM.arquivo) { responder({ texto: `**${arq.name}** é grande demais (máx. 1 MB).` }); return; }
      const leitor = new FileReader();
      leitor.onload = () => { adicionarMensagem("user", escapar(`📥 importar ${arq.name}`)); responder(importar(String(leitor.result), arq.name)); };
      leitor.readAsText(arq);
    };
    input.click();
    return { texto: "Escolha o arquivo pra eu importar (**.md**, **.txt** ou código). Cada título vira um assunto novo na minha base, marcado como **não revisado**.", _semMemoria: true };
  }

  // perguntas fixas: a importação não pode mudar a resposta delas sem eu avisar
  const REFERENCIA = ["como dar dinheiro pro jogador", "como criar um comando no samp", "como salvar conta com dof2", "como fazer um for em python", "como centralizar uma div",
    "como usar sscanf", "o que e um enum", "como criar um dialog", "como fazer um timer", "como mudar a cor do texto css", "como pegar o nome do jogador", "como usar if no pawn",
    "como fazer uma funcao em javascript", "como ler input em python", "como teleportar o jogador", "como dar arma pro jogador", "o que e uma variavel", "como fazer login no samp"];
  function respostasDeReferencia() {
    const out = {};
    if (typeof buscarTema !== "function") return out;
    for (const q of REFERENCIA) { try { const t = buscarTema(normalizar(q), null); out[q] = t ? t.titulo : ""; } catch (e) { out[q] = ""; } }
    return out;
  }
  function acharItem(id) { const b = base(); for (const v of b.versoes) { const it = v.itens.find(i => i.id === id); if (it) return { b, v, it }; } return null; }
  function marcarObsoleto(id) {
    const x = id && acharItem(id);
    if (!x) return { texto: "Não achei esse item. Os IDs aparecem em **/importados**.", sugestoes: ["/importados"] };
    x.it.obsoleto = !x.it.obsoleto;
    salvarBase(x.b); carregar();
    return { texto: x.it.obsoleto ? `🗄 **${x.it.titulo}** marcado como **obsoleto**: continua guardado, mas não aparece mais nas respostas. (De novo o mesmo comando desfaz.)` : `↩ **${x.it.titulo}** voltou a valer.` };
  }
  function marcarVerificado(id) {
    const x = id && acharItem(id);
    if (!x) return { texto: "Não achei esse item. Os IDs aparecem em **/importados**.", sugestoes: ["/importados"] };
    if ((x.it.conflitos || []).length || x.it.problemasExemplo) return { texto: `Não dá pra marcar **${x.it.titulo}** como verificado: ${(x.it.conflitos || []).length ? "ele conflita com a referência oficial (" + x.it.conflitos.join("; ") + ")" : "o exemplo dele tem problema segundo o meu analisador"}. Corrija o arquivo e importe de novo.` };
    x.it.verificado = true;
    salvarBase(x.b); carregar();
    return { texto: `✔ **${x.it.titulo}** marcado como **verificado por você**. (Eu continuo mostrando a origem.)` };
  }
  // passa o analisador em TODOS os exemplos de código da base (o que achou bug real nas aulas)
  function verificarBase() {
    const A = WCDEV.analisador, Rv = WCDEV.revisor;
    const t0 = Date.now();
    let total = 0;
    const achados = [];
    for (const t of WCDEV.temas) {
      if (typeof t.resposta !== "string") continue;
      for (const m of t.resposta.matchAll(/~~~(\w+)\n([\s\S]*?)~~~/g)) {
        const l = m[1], cod = m[2];
        if (!NOMES[l] || /\/\/\s*(errado|erro:)|#\s*errado|<!--\s*errado/i.test(cod)) continue;   // exemplo errado de propósito
        total++;
        if (l === "pawn" && A) { const r = A.analisar(cod, "pawn"); const x = r.sintaxe.filter(s => s.tipo === "erro").length + r.achados.filter(a => a.nivel === "erro" || a.nivel === "provavel").length; if (x) achados.push(`${t.importado ? "📥 " : ""}**${t.titulo}** (${NOMES[l]}): ${[...r.sintaxe.filter(s => s.tipo === "erro").map(s => s.msg), ...r.achados.filter(a => a.nivel === "erro" || a.nivel === "provavel").map(a => a.titulo.replace(/\{\{|\}\}|\*\*/g, ""))].slice(0, 2).join("; ")}`); }
        else if (Rv) { const r = Rv.analisar(cod, l); const x = r ? r.problemas.filter(p => p.tipo === "erro") : []; if (x.length) achados.push(`${t.importado ? "📥 " : ""}**${t.titulo}** (${NOMES[l]}): ${x.slice(0, 2).map(p => p.msg).join("; ")}`); }
      }
    }
    return { texto: `### 🧪 Verificação dos exemplos da base
Conferi **${total}** exemplos de código (sintaxe em todas as linguagens; em Pawn também lógica e segurança) em ${Date.now() - t0} ms. Exemplos marcados como "errado" de propósito ficam de fora.\n` +
      (achados.length ? `\n**${achados.length} exemplo(s) com problema:**
${achados.slice(0, 20).map(x => "- " + x).join("\n")}` : "\n✅ Nenhum exemplo com erro ou problema provável.") +
      "\n\n⚙️ Aqui no navegador não tem compilador: nos testes do projeto eu também compilo os exemplos Pawn com o **pawncc** de verdade.", sugestoes: ["/importados"] };
  }

  /* ================= 2. REGRAS DE ANÁLISE CRIADAS POR VOCÊ ================= */
  // /regra pawn | SetPlayerHealth\(\w+,\s*0\) | Isso mata o jogador: é de propósito? | verificar
  function regras() { return Guardar.ler(chave("regras_usuario"), []); }
  function aplicarRegrasUsuario() {
    if (!WCDEV.analisador) return;
    const R = WCDEV.analisador.regras;
    for (const l of Object.keys(R)) R[l] = R[l].filter(r => !r.doUsuario);
    for (const r of regras()) {
      let re;
      try { re = new RegExp(r.padrao, "g"); } catch (e) { continue; }
      (R[r.lang] = R[r.lang] || []).push({ id: "usuario-" + r.id, modulo: "sua regra", doUsuario: true, verificar(ctx) {
        const out = [];
        for (const m of ctx.codigo.matchAll(re)) {
          out.push({ nivel: r.nivel, linha: ctx.linhaDe(m.index), titulo: r.mensagem, porque: "Regra criada por você (não é uma regra revisada da WC DEV).", correcao: r.correcao || "Veja se esse trecho é o que você queria.", quando: "Quando esse padrão aparece no código." });
          if (out.length >= 10) break;
        }
        return out;
      } });
    }
  }
  function criarRegra(texto) {
    const partes = texto.replace(/^\/regra\s*/i, "").split("|").map(x => x.trim());
    if (partes.length < 3) return { texto: "Pra criar uma regra de análise, escreva assim:\n~~~\n/regra pawn | SetPlayerHealth\\(\\w+,\\s*0(\\.0)?\\) | Isso mata o jogador: é de propósito? | verificar\n~~~\n**linguagem | padrão (regex) | mensagem | nível** (nível: {{verificar}}, {{sugestao}} ou {{provavel}}). Regras suas nunca viram \"erro confirmado\"." };
    const [lang, padrao, mensagem, nivelBruto] = partes;
    if (!NOMES[lang] || lang !== "pawn") return { texto: "Por enquanto as regras de análise são pra **pawn** (é onde existe o analisador profundo)." };
    let re;
    try { re = new RegExp(padrao, "g"); } catch (e) { return { texto: `O padrão não é uma regex válida: {{${e.message}}}` }; }
    if (re.test("")) return { texto: "Esse padrão casa com **texto vazio**: ia acusar tudo. Deixe ele mais específico." };
    const nivel = ["verificar", "sugestao", "provavel"].includes(nivelBruto) ? nivelBruto : "verificar";
    // validação: quantos códigos CORRETOS da base essa regra acusaria?
    const corretos = [];
    for (const t of WCDEV.temas) if (t.lang === lang && typeof t.resposta === "string") for (const m of t.resposta.matchAll(/~~~\w*\n([\s\S]*?)~~~/g)) corretos.push(m[1]);
    const ini = Date.now();
    let acusa = 0;
    for (const c of corretos) { re.lastIndex = 0; if (re.test(c)) acusa++; if (Date.now() - ini > 300) return { texto: "Esse padrão é **lento demais** (pode travar a análise). Simplifique a regex." }; }
    const lista = regras();
    const nova = { id: Date.now().toString(36), lang, padrao, mensagem, nivel, criada: hoje(), versao: lista.length + 1 };
    lista.push(nova);
    Guardar.salvar(chave("regras_usuario"), lista);
    aplicarRegrasUsuario();
    return {
      texto: `### ✅ Regra criada (versão ${nova.versao})\n- **Procura:** {{${padrao}}}\n- **Mensagem:** ${mensagem}\n- **Nível:** ${nivel}\n\n**Teste nos exemplos corretos da base:** ela acusaria **${acusa} de ${corretos.length}**.` +
        (acusa > corretos.length * 0.05 ? "\n⚠️ Isso é bastante: talvez ela esteja **larga demais** e vá gerar alarme falso. Se for o caso, **/apagar regra " + nova.id + "**." : "\nÓtimo: ela quase não acusa código correto.") +
        "\nEla já roda em toda análise de código Pawn (marcada como \"sua regra\").",
      sugestoes: ["/regras"],
    };
  }
  function listarRegras() {
    const l = regras();
    if (!l.length) return { texto: "Você ainda não criou regras de análise. Veja como com **/regra**.", sugestoes: ["/regra"] };
    return { texto: "### 🧩 Suas regras de análise\n" + l.map(r => `- **${r.id}** (v${r.versao}, ${r.lang}, ${r.nivel}): {{${r.padrao}}} → ${r.mensagem}`).join("\n") + "\n\nPra tirar: **/apagar regra ID**.", sugestoes: ["/regra"] };
  }
  function apagarRegra(id) {
    const l = regras();
    const n = l.filter(r => r.id !== id);
    if (n.length === l.length) return { texto: `Não achei a regra **${id}**.`, sugestoes: ["/regras"] };
    Guardar.salvar(chave("regras_usuario"), n);
    aplicarRegrasUsuario();
    return { texto: `🗑️ Regra **${id}** apagada.`, sugestoes: ["/regras"] };
  }

  /* ================= FEEDBACK (vira sugestão, não muda a base) ================= */
  function feedbacks() { return Guardar.ler(chave("feedback"), []); }
  function registrarFeedback(tipo, resposta, pergunta, comentario) {
    const l = feedbacks();
    l.push({ data: hoje(), tipo, pergunta: (pergunta || "").slice(0, 300), resposta: (resposta || "").slice(0, 600), comentario: (comentario || "").slice(0, 500), status: "pendente" });
    while (l.length > 300) l.shift();
    Guardar.salvar(chave("feedback"), l);
  }
  function listarFeedback() {
    const l = feedbacks();
    if (!l.length) return { texto: "Nenhuma avaliação ainda. Use 👍 ou 👎 embaixo das minhas respostas." };
    const neg = l.filter(f => f.tipo === "ruim");
    return {
      texto: `### 🗳️ Avaliações (${l.length})\n👍 ${l.length - neg.length} · 👎 ${neg.length}\n\n**Últimos 👎 (pendentes de revisão):**\n` +
        (neg.slice(-8).reverse().map(f => `- ${f.data} · "${f.pergunta.slice(0, 60)}"${f.comentario ? ` → ${f.comentario}` : ""}`).join("\n") || "- nenhum") +
        "\n\nIsso **não muda** o que eu sei sozinho: serve pra quem cuida da WC DEV revisar e melhorar a base. **/feedback exportar** baixa tudo em JSON.",
      sugestoes: ["/feedback exportar"],
    };
  }
  function exportarFeedback() {
    const blob = new Blob([JSON.stringify({ exportado: hoje(), feedback: feedbacks(), regras: regras() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wcdev-feedback.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return { texto: "📦 Baixando **wcdev-feedback.json** (avaliações e suas regras)." };
  }

  function comoAprendo() {
    return {
      texto: `### 🧠 Como eu "aprendo" (sem enrolação)
Tem **4 coisas diferentes** que às vezes são chamadas de aprender. Aqui está o que eu faço e o que eu **não** faço:
- **1. Atualizar a minha base** ✅ — você importa documentos ou exemplos (**/importar**) ou me ensina respostas (**/ensinar**). Eles viram assuntos que eu consulto, com origem e marcados como "não revisado". Dá pra **desfazer**.
- **2. Novas regras e testes** ✅ — você cria regras de análise de código (**/regra**). Eu testo a regra nos códigos corretos da base antes de aceitar, pra ela não dar alarme falso.
- **3. Contexto da conversa** ✅ — eu lembro do último código e do assunto **enquanto a conversa durar** (o balão 🧠 mostra o que é).
- **4. Treinar um modelo de IA** ❌ — isso **não acontece** aqui. Eu não tenho um modelo de linguagem sendo ajustado; guardar suas mensagens **não é treinamento**.

Seus 👍/👎 viram **sugestões pendentes** pra revisão: eles **não mudam** o que eu sei sozinhos.
Tudo fica salvo **neste navegador**.`,
      sugestoes: ["/importar", "/regra", "/feedback"],
    };
  }

  return { carregar, importar, abrirSeletor, listarImportados, desfazer, marcarObsoleto, marcarVerificado, verificarBase, respostasDeReferencia, criarRegra, listarRegras, apagarRegra, aplicarRegrasUsuario, registrarFeedback, listarFeedback, exportarFeedback, comoAprendo, LIM };
})();

WCDEV.aprendizagem = Aprendizagem;
