(() => {
  "use strict";

  const CHAVE = "marcador-truco:v1";
  const LIMITE = 15;
  const NOMES_PADRAO = ["Nós", "Eles"];

  /* ---------- Estado ---------- */

  const criarEstado = () => ({
    times: NOMES_PADRAO.map((nome) => ({ nome, pontos: 0, vitorias: 0 })),
    vencedor: null, // 0, 1 ou null
  });

  function validar(dados) {
    const base = criarEstado();
    if (!dados || !Array.isArray(dados.times) || dados.times.length !== 2) return base;

    dados.times.forEach((t, i) => {
      if (typeof t.nome === "string") base.times[i].nome = t.nome.slice(0, 12);
      base.times[i].pontos = Math.min(LIMITE, Math.max(0, Math.floor(Number(t.pontos) || 0)));
      base.times[i].vitorias = Math.max(0, Math.floor(Number(t.vitorias) || 0));
    });

    if ((dados.vencedor === 0 || dados.vencedor === 1) && base.times[dados.vencedor].pontos >= LIMITE) {
      base.vencedor = dados.vencedor;
    }
    return base;
  }

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      return bruto ? validar(JSON.parse(bruto)) : criarEstado();
    } catch {
      return criarEstado();
    }
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      /* sem localStorage (modo privado, por exemplo): o placar só não fica salvo */
    }
  }

  const estado = carregar();

  /* ---------- Elementos ---------- */

  const refs = [...document.querySelectorAll(".time")].map((secao) => {
    const palitos = secao.querySelector(".palitos");
    for (let n = 0; n < LIMITE; n++) {
      const palito = document.createElement("span");
      palito.className = "palito";
      palitos.appendChild(palito);
    }
    return {
      nome: secao.querySelector(".nome"),
      pontos: secao.querySelector(".pontos"),
      vitorias: secao.querySelector(".vitorias"),
      botoes: secao.querySelector(".botoes"),
      itens: [...palitos.children],
    };
  });

  const btnNova = document.getElementById("nova");
  const btnZerar = document.getElementById("zerar");
  const dialogo = document.getElementById("vitoria");
  const dlgTitulo = document.getElementById("vitoria-titulo");
  const dlgPlacar = document.getElementById("vitoria-placar");
  const btnCorrigir = document.getElementById("corrigir");
  const btnProxima = document.getElementById("proxima");

  /* ---------- Apresentação ---------- */

  const nomeDe = (i) => estado.times[i].nome.trim() || NOMES_PADRAO[i];
  const textoVitorias = (n) => (n === 1 ? "1 partida ganha" : `${n} partidas ganhas`);

  function render(novos = null) {
    estado.times.forEach((time, i) => {
      const r = refs[i];

      if (document.activeElement !== r.nome) r.nome.value = time.nome;
      r.pontos.textContent = time.pontos;
      r.vitorias.textContent = textoVitorias(time.vitorias);
      r.botoes.setAttribute("aria-label", `Ajustar pontos para ${nomeDe(i)}`);
      r.botoes.querySelectorAll("button").forEach((b) => {
        b.disabled = estado.vencedor !== null;
      });

      r.itens.forEach((palito, n) => {
        palito.classList.toggle("aceso", n < time.pontos);
      });

      if (novos && novos.time === i) {
        for (let n = novos.de; n < time.pontos; n++) {
          const palito = r.itens[n];
          palito.classList.add("novo");
          setTimeout(() => palito.classList.remove("novo"), 450);
        }
      }
    });

    if (estado.vencedor !== null) {
      const v = estado.vencedor;
      dlgTitulo.textContent = `Vitória: ${nomeDe(v)}`;
      dlgPlacar.textContent = `${nomeDe(0)} ${estado.times[0].pontos} × ${estado.times[1].pontos} ${nomeDe(1)}`;
      dialogo.dataset.time = String(v);
      if (!dialogo.open) {
        if (typeof dialogo.showModal === "function") dialogo.showModal();
        else dialogo.setAttribute("open", "");
      }
    } else if (dialogo.open) {
      dialogo.close();
    }
  }

  function vibrar(ms) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch {
      /* ignorar */
    }
  }

  /* ---------- Ações ---------- */

  function somar(i, valor) {
    if (estado.vencedor !== null) return;
    const time = estado.times[i];
    if (time.pontos >= LIMITE) return;

    const antes = time.pontos;
    time.pontos = Math.min(LIMITE, antes + valor);
    if (time.pontos >= LIMITE) estado.vencedor = i;

    salvar();
    render({ time: i, de: antes });
    vibrar(time.pontos >= LIMITE ? [30, 40, 30] : 15);
  }

  function diminuir(i) {
    if (estado.vencedor !== null) return;
    const time = estado.times[i];
    if (time.pontos === 0) return;
    time.pontos -= 1;
    salvar();
    render();
    vibrar(15);
  }

  function corrigirVitoria() {
    if (estado.vencedor === null) return;
    estado.times[estado.vencedor].pontos = Math.max(0, estado.times[estado.vencedor].pontos - 1);
    estado.vencedor = null;
    salvar();
    render();
  }

  function zerarPartida() {
    estado.times.forEach((t) => (t.pontos = 0));
    estado.vencedor = null;
  }

  function novaPartida() {
    const temPonto = estado.times.some((t) => t.pontos > 0);
    if (temPonto && !confirm("Zerar o placar desta partida?")) return;
    zerarPartida();
    salvar();
    render();
  }

  function proximaPartida() {
    if (estado.vencedor === null) return;
    estado.times[estado.vencedor].vitorias += 1;
    zerarPartida();
    salvar();
    render();
  }

  function zerarVitorias() {
    if (!confirm("Zerar as partidas ganhas dos dois times?")) return;
    estado.times.forEach((t) => (t.vitorias = 0));
    salvar();
    render();
  }

  /* ---------- Eventos ---------- */

  refs.forEach((r, i) => {
    r.botoes.addEventListener("click", (e) => {
      const botao = e.target.closest("button[data-pontos]");
      if (botao) somar(i, Number(botao.dataset.pontos));
      if (e.target.closest("button[data-diminuir]")) diminuir(i);
    });

    r.nome.addEventListener("focus", () => r.nome.select());
    r.nome.addEventListener("input", () => {
      estado.times[i].nome = r.nome.value;
      salvar();
    });
    r.nome.addEventListener("blur", () => {
      if (!r.nome.value.trim()) {
        estado.times[i].nome = NOMES_PADRAO[i];
        r.nome.value = NOMES_PADRAO[i];
        salvar();
      }
    });
    r.nome.addEventListener("keydown", (e) => {
      if (e.key === "Enter") r.nome.blur();
    });
  });

  btnNova.addEventListener("click", novaPartida);
  btnZerar.addEventListener("click", zerarVitorias);
  btnCorrigir.addEventListener("click", corrigirVitoria);
  btnProxima.addEventListener("click", proximaPartida);

  // A tela de vitória só fecha pelos botões; se o Esc fechar, ela reabre.
  dialogo.addEventListener("cancel", (e) => e.preventDefault());
  dialogo.addEventListener("close", () => {
    if (estado.vencedor !== null) render();
  });

  /* ---------- Tela acesa durante o jogo ---------- */

  let trava = null;
  async function manterTelaAcesa() {
    if (!("wakeLock" in navigator)) return;
    try {
      trava = await navigator.wakeLock.request("screen");
      trava.addEventListener("release", () => {
        trava = null;
      });
    } catch {
      /* o navegador pode negar; sem problema */
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !trava) manterTelaAcesa();
  });

  render();
  manterTelaAcesa();
})();