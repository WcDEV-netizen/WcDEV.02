/* =========================================================
   WC DEV — HISTÓRICO DE ANÁLISES E VERSÕES

   - cada análise fica guardada (no navegador, por usuário): quando,
     o que foi analisado, quantos problemas de cada tipo e a "assinatura"
     de cada problema (regra + trecho), além do código (se couber)
   - na próxima análise do MESMO código (mesmo arquivo, ou código parecido)
     eu comparo: o que foi resolvido, o que é novo e o que continua
   - versões: antes de aplicar uma correção no editor/projeto, guardo a
     versão anterior pra dar pra voltar (↩ desfazer)
   Tudo fica só no aparelho. Se o navegador não deixar guardar, funciona
   sem histórico (não quebra nada).
   ========================================================= */

window.WCDEV = window.WCDEV || { temas: [] };

const AnaliseHistorico = (() => {
  const MAX = 25, MAX_CODIGO = 120000, MAX_VERSOES = 10;
  const chave = n => (typeof chaveDoUsuario === "function" ? chaveDoUsuario(n) : "wcdev_" + n);
  const ler = (n, p) => { try { return typeof Guardar !== "undefined" ? Guardar.ler(chave(n), p) : JSON.parse(localStorage.getItem(chave(n)) || "null") || p; } catch (e) { return p; } };
  const salvar = (n, v) => { try { if (typeof Guardar !== "undefined") return Guardar.salvar(chave(n), v); localStorage.setItem(chave(n), JSON.stringify(v)); return true; } catch (e) { return false; } };
  let memoria = [];   // se o navegador não guardar, fica só na sessão

  const assinatura = a => `${a.regra}|${a.arquivo || ""}|${String(a.trecho || "").replace(/\s+/g, " ").slice(0, 120)}`;
  const linhasDe = c => new Set(String(c || "").split("\n").map(l => l.trim()).filter(l => l.length > 3));
  function parecido(a, b) { const A = linhasDe(a), B = linhasDe(b); if (!A.size || !B.size) return 0; let c = 0; for (const l of A) if (B.has(l)) c++; return c / Math.max(A.size, B.size); }

  function lista() { const l = ler("analises", null); return Array.isArray(l) ? l : memoria; }
  // registra uma análise e devolve a comparação com a anterior do mesmo código (ou null)
  function registrar({ nome, codigo, arquivos, achados, sintaxe, hash }) {
    const todos = lista();
    const texto = codigo || (arquivos ? Object.entries(arquivos).map(([k, v]) => `// arquivo: ${k}\n${v}`).join("\n") : "");
    const entrada = {
      id: "an" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), quando: Date.now(), nome: nome || "trecho", hash: hash || "",
      contagens: contar(achados, sintaxe), assinaturas: [...new Set((achados || []).filter(a => a.nivel !== "sugestao").map(assinatura))],
      titulos: Object.fromEntries((achados || []).filter(a => a.nivel !== "sugestao").map(a => [assinatura(a), (a.titulo || "").replace(/\{\{|\}\}|\*\*/g, "").slice(0, 90)])),
      codigo: texto.length <= MAX_CODIGO ? texto : null, projeto: !!arquivos,
    };
    // anterior: mesmo nome de arquivo/projeto, ou código parecido (≥ 40% das linhas iguais), e não idêntico
    let anterior = null;
    for (let i = todos.length - 1; i >= 0; i--) {
      const x = todos[i];
      if (x.hash && x.hash === entrada.hash) { anterior = null; break; }   // mesmo código de novo: nada a comparar
      if ((nome && x.nome === nome && nome !== "trecho") || (x.codigo && texto && parecido(x.codigo, texto) >= 0.4)) { anterior = x; break; }
    }
    const nova = todos.filter(x => !(x.hash && x.hash === entrada.hash)).concat(entrada).slice(-MAX);
    if (!salvar("analises", nova)) memoria = nova;
    if (!anterior) return { id: entrada.id, comparacao: null };
    const antes = new Set(anterior.assinaturas), agora = new Set(entrada.assinaturas);
    return {
      id: entrada.id,
      comparacao: {
        quando: anterior.quando, nomeAnterior: anterior.nome,
        resolvidos: [...antes].filter(s => !agora.has(s)).map(s => anterior.titulos[s] || s.split("|")[0]),
        novos: [...agora].filter(s => !antes.has(s)).map(s => entrada.titulos[s] || s.split("|")[0]),
        continuam: [...agora].filter(s => antes.has(s)).length,
      },
    };
  }
  function contar(achados, sintaxe) {
    const c = { erro: 0, provavel: 0, verificar: 0, sugestao: 0, sintaxe: (sintaxe || []).filter(s => s.tipo === "erro").length };
    (achados || []).forEach(a => { if (c[a.nivel] !== undefined) c[a.nivel]++; });
    return c;
  }
  function pegar(id) { return lista().find(x => x.id === id) || null; }
  function apagarTudo() { salvar("analises", []); memoria = []; }

  /* ---------- versões (antes de aplicar correções) ---------- */
  function guardarVersao(motivo, conteudo) {
    const v = ler("versoes", []);
    const lista2 = (Array.isArray(v) ? v : []).concat({ id: "v" + Date.now().toString(36), quando: Date.now(), motivo, conteudo }).slice(-MAX_VERSOES);
    // conteúdo grande demais pro armazenamento: guarda o que der (as mais novas)
    let ok = salvar("versoes", lista2);
    while (!ok && lista2.length > 1) { lista2.shift(); ok = salvar("versoes", lista2); }
    return ok ? lista2[lista2.length - 1].id : null;
  }
  function versoes() { const v = ler("versoes", []); return Array.isArray(v) ? v : []; }
  function versao(id) { return versoes().find(x => x.id === id) || null; }

  function quandoTexto(t) {
    const s = Math.round((Date.now() - t) / 1000);
    if (s < 60) return "agora há pouco"; if (s < 3600) return `há ${Math.round(s / 60)} min`; if (s < 86400) return `há ${Math.round(s / 3600)} h`;
    return new Date(t).toLocaleDateString("pt-BR");
  }

  return { registrar, lista, pegar, apagarTudo, guardarVersao, versoes, versao, quandoTexto, assinatura, parecido };
})();

WCDEV.analiseHistorico = AnaliseHistorico;
