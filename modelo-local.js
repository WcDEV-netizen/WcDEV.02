/* =========================================================
   WC DEV — MODELO DE LINGUAGEM LOCAL (opcional, DESLIGADO por padrão)

   Por que não vem um modelo junto: o site roda no navegador, e um modelo
   de linguagem que preste ocupa de 1 a 8 GB. Baixar isso sem perguntar
   travaria o celular de quem só quer aprender.

   O que este módulo faz: conversa com um modelo rodando NO PRÓPRIO PC
   da pessoa (ex: Ollama, em http://localhost:11434). Nada sai do
   computador dela, não existe chave de API, não existe nuvem.

   Regras de uso:
   - o motor de regras/análise continua sendo o principal;
   - o modelo só entra quando a pessoa pede ("/ia ...") ou quando a base
     não tem a resposta (botão "Perguntar ao modelo local");
   - a resposta vem marcada como do modelo (pode errar) e, se tiver código
     Pawn, passa no analisador antes de aparecer como "validada";
   - dá pra cancelar, tem tempo limite e nunca trava a página.
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const ModeloLocal = (() => {
  const PADRAO = { ativo: false, url: "http://localhost:11434", modelo: "qwen2.5-coder:7b", tempo: 90 };
  const ler = () => { try { return { ...PADRAO, ...(JSON.parse(localStorage.getItem("wcdev_modelo_local") || "{}")) }; } catch (e) { return { ...PADRAO }; } };
  const salvar = c => { try { localStorage.setItem("wcdev_modelo_local", JSON.stringify(c)); } catch (e) { /* sem armazenamento */ } };
  let atual = null;   // AbortController da geração em andamento

  async function testar(cfg = ler()) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    try {
      const r = await fetch(cfg.url.replace(/\/$/, "") + "/api/tags", { signal: ctl.signal });
      if (!r.ok) return { ok: false, erro: "o servidor respondeu " + r.status };
      const j = await r.json();
      const modelos = (j.models || []).map(m => m.name);
      return { ok: true, modelos, temModelo: modelos.some(m => m === cfg.modelo || m.split(":")[0] === cfg.modelo.split(":")[0]) };
    } catch (e) {
      return { ok: false, erro: e.name === "AbortError" ? "não respondeu em 2,5 s" : "não consegui conectar (o servidor está rodando? o navegador bloqueou?)" };
    } finally { clearTimeout(t); }
  }

  // gera com streaming; onPedaco recebe o texto acumulado
  async function gerar(prompt, onPedaco) {
    const cfg = ler();
    if (atual) atual.abort();
    const ctl = new AbortController();
    atual = ctl;
    const limite = setTimeout(() => ctl.abort("tempo"), Math.max(10, cfg.tempo) * 1000);
    let texto = "";
    try {
      const r = await fetch(cfg.url.replace(/\/$/, "") + "/api/generate", {
        method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: cfg.modelo, prompt, stream: true, options: { temperature: 0.2, num_predict: 900 } }),
      });
      if (!r.ok || !r.body) throw new Error("o servidor respondeu " + r.status);
      const leitor = r.body.getReader(), dec = new TextDecoder();
      let resto = "";
      for (;;) {
        const { value, done } = await leitor.read();
        if (done) break;
        resto += dec.decode(value, { stream: true });
        const linhas = resto.split("\n");
        resto = linhas.pop();
        for (const l of linhas) {
          if (!l.trim()) continue;
          let j;
          try { j = JSON.parse(l); } catch (e) { continue; }
          if (j.response) { texto += j.response; if (texto.length > 12000) { ctl.abort("tamanho"); break; } onPedaco && onPedaco(texto); }
          if (j.done) break;
        }
      }
      return { ok: true, texto };
    } catch (e) {
      const motivo = ctl.signal.aborted ? (ctl.signal.reason === "tempo" ? "passou do tempo limite" : ctl.signal.reason === "tamanho" ? "resposta grande demais (cortei)" : "você cancelou") : e.message;
      return { ok: !!texto, texto, erro: motivo };
    } finally { clearTimeout(limite); if (atual === ctl) atual = null; }
  }
  function cancelar() { if (atual) atual.abort("cancelado"); }

  // monta a pergunta pro modelo com o que a WC DEV já sabe (pra ele não inventar)
  function montarPrompt(pergunta) {
    const partes = ["Você é a WC DEV, professora de programação. Responda em português do Brasil, de forma curta e didática.",
      "Regras: não invente funções, plugins ou parâmetros; se não tiver certeza, diga que não tem certeza. Para Pawn/SA-MP, use só nativas reais do a_samp."];
    const lang = estado.lang;
    if (lang) partes.push("Linguagem da conversa: " + NOMES[lang] + ".");
    const tema = estado.ultimo && estado.ultimo.lang !== "conversa" ? estado.ultimo : null;
    if (tema && typeof tema.resposta === "string") partes.push("Contexto da base local (confiável):\n" + tema.resposta.slice(0, 1500));
    const c = WCDEV.motor && WCDEV.motor.codigoRecente();
    if (c && c.origem !== "aula") partes.push(`Código do aluno (${NOMES[c.lang] || c.lang}):\n` + c.codigo.slice(0, 3000));
    partes.push("Pergunta do aluno: " + pergunta);
    return partes.join("\n\n");
  }

  // pergunta e escreve a resposta numa mensagem que vai aparecendo aos poucos
  async function perguntar(pergunta) {
    const cfg = ler();
    if (!cfg.ativo) return { texto: "O modelo local está **desligado**. Veja como ligar em **/modelo** (precisa de um modelo rodando no seu PC).", sugestoes: ["/modelo"] };
    if (WCDEV.motor) WCDEV.motor.passo("Modelo local", `perguntei ao ${cfg.modelo} (${cfg.url})`);
    const msg = adicionarMensagem("bot", `<div class="ml"><div class="ml-topo">🤖 Modelo local <b>${escapar(cfg.modelo)}</b> <span class="ml-st">pensando…</span> <button class="ml-parar">⏹ Parar</button></div><div class="ml-corpo"></div></div>`);
    const corpo = msg.querySelector(".ml-corpo"), st = msg.querySelector(".ml-st"), parar = msg.querySelector(".ml-parar");
    parar.onclick = () => cancelar();
    let ultimo = 0;
    const r = await gerar(montarPrompt(pergunta), txt => {
      const agora = Date.now();
      if (agora - ultimo < 120) return;   // não redesenha a cada letra
      ultimo = agora;
      corpo.innerHTML = formatar(txt.replace(/```(\w*)/g, "~~~$1"));
    });
    parar.remove();
    const texto = (r.texto || "").replace(/```(\w*)/g, "~~~$1");
    let final = texto ? texto : "";
    let selo = "";
    // código Pawn na resposta: passa pelo analisador antes de confiar
    const cod = texto.match(/~~~(pawn|c|pwn)?\n([\s\S]*?)~~~/);
    if (cod && WCDEV.analisador && (cod[1] || WCDEV.revisor.detectar(cod[2]) === "pawn")) {
      const a = WCDEV.analisador.analisar(cod[2], "pawn");
      const graves = a.sintaxe.filter(x => x.tipo === "erro").length + a.achados.filter(x => x.nivel === "erro" || x.nivel === "provavel").length;
      selo = graves ? `\n\n🔬 **Conferi o código do modelo com as minhas regras: achei ${graves} problema(s).** Peça **"revisa esse código"** pra ver.` : "\n\n🔬 Conferi o código do modelo com as minhas regras: nenhum erro de sintaxe nem problema provável (não compilei).";
      estado.ultimoCodigo = { codigo: cod[2], lang: "pawn", origem: "modelo" };
    }
    st.textContent = r.erro ? `(${r.erro})` : "pronto";
    corpo.innerHTML = formatar((final || (r.erro ? `Não consegui resposta: ${r.erro}. Veja **/modelo**.` : "(resposta vazia)")) +
      "\n\n> ⚠️ Resposta de um **modelo de linguagem local**: pode errar. As regras e a base da WC DEV não verificaram o texto." + selo);
    if (typeof Historico !== "undefined") Historico.adicionar({ q: "bot", t: `🤖 **Modelo local (${cfg.modelo}):**\n${final || "(sem resposta)"}${selo}`, s: [] });
    if (typeof rolagem !== "undefined" && rolagem.noFim) rolagem.descer();
    return null;
  }

  // painel de configuração (dentro do chat)
  function painel() {
    const cfg = ler();
    const msg = adicionarMensagem("bot", `<div class="ml-cfg">
      <h3>🤖 Modelo de linguagem local (opcional)</h3>
      <p>A WC DEV funciona sem isso. Se você tiver um modelo rodando <b>no seu próprio PC</b> (ex: <b>Ollama</b>), eu posso usar ele pra perguntas que a minha base não cobre. Nada sai do seu computador.</p>
      <label><input type="checkbox" class="ml-ativo" ${cfg.ativo ? "checked" : ""}> Usar o modelo local</label>
      <label>Endereço <input class="ml-url" value="${escapar(cfg.url)}"></label>
      <label>Modelo <input class="ml-mod" value="${escapar(cfg.modelo)}"></label>
      <label>Tempo limite (s) <input class="ml-tempo" type="number" min="10" max="600" value="${cfg.tempo}"></label>
      <div class="ml-bts"><button class="ml-salvar">Salvar e testar</button></div>
      <p class="ml-res"></p>
      <details><summary>Como instalar (PC)</summary><ol>
        <li>Instale o <b>Ollama</b> (ollama.com) e rode no terminal: <code>ollama pull qwen2.5-coder:7b</code> (uns 4,7 GB; precisa de ~8 GB de RAM).</li>
        <li>Libere o navegador: defina a variável <code>OLLAMA_ORIGINS=*</code> e reinicie o Ollama.</li>
        <li>Se o WC DEV estiver num site <b>https://</b>, alguns navegadores bloqueiam acesso ao localhost. Se der erro, abra o WC DEV pelo arquivo no PC.</li>
      </ol></details></div>`);
    const $ = s => msg.querySelector(s);
    $(".ml-salvar").onclick = async () => {
      const novo = { ativo: $(".ml-ativo").checked, url: $(".ml-url").value.trim() || PADRAO.url, modelo: $(".ml-mod").value.trim() || PADRAO.modelo, tempo: Math.min(600, Math.max(10, +$(".ml-tempo").value || 90)) };
      if (!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.|10\.)/.test(novo.url)) { $(".ml-res").textContent = "⚠️ Por privacidade, eu só aceito endereços do seu PC ou da sua rede (localhost, 127.0.0.1, 192.168..., 10...)."; return; }
      salvar(novo);
      $(".ml-res").textContent = "Testando…";
      const t = await testar(novo);
      $(".ml-res").textContent = !t.ok ? `❌ ${t.erro}.` : !t.temModelo ? `⚠️ Conectei, mas o modelo "${novo.modelo}" não está instalado. Tem: ${t.modelos.join(", ") || "nenhum"}.` : `✅ Conectado! ${novo.ativo ? "Use \"/ia sua pergunta\"." : "Marque \"Usar o modelo local\" pra ligar."}`;
    };
    return null;
  }

  return { ler, salvar, testar, gerar, cancelar, perguntar, painel, montarPrompt, ativo: () => ler().ativo };
})();

WCDEV.modeloLocal = ModeloLocal;
