"use strict";

// Equipamentos fictícios usados para demonstrar o monitoramento.
const equipamentos = [
  {
    codigo: "R-01",
    nome: "Robô Solda Ponto KUKA KR-210",
    setor: "Solda Ponto",
    estado: "falha",
    temperatura: "94°C",
    oee: "61.5%",
    vibracao: "4.2",
    descricao: "Sobreaquecimento crítico no transformador de solda (94°C). Bloqueio automático acionado."
  },
  {
    codigo: "R-02",
    nome: "Robô Solda MIG ABB IRB-2600",
    setor: "Solda MIG",
    estado: "atencao",
    temperatura: "76°C",
    oee: "83%",
    vibracao: "3.1",
    descricao: "Oscilação na vazão do gás de proteção e proximidade do limite térmico (78°C)."
  },
  {
    codigo: "P-04",
    nome: "Prensa Hidráulica Schuler 800T",
    setor: "Estamparia",
    estado: "falha",
    temperatura: "88°C",
    oee: "54%",
    vibracao: "6.8",
    descricao: "Queda abrupta de pressão no circuito hidráulico sugerindo vibração elevada."
  },
  {
    codigo: "R-05",
    nome: "Robô Solda Ponto FANUC R-2000iC",
    setor: "Solda Ponto",
    estado: "ok",
    temperatura: "58°C",
    oee: "94.8%",
    vibracao: "1.4",
    descricao: "Operando dentro dos parâmetros ideais."
  },
  {
    codigo: "PT-02",
    nome: "Cabine Pintura Eletrostática Dürr",
    setor: "Pintura",
    estado: "ok",
    temperatura: "26°C",
    oee: "91.5%",
    vibracao: "0.9",
    descricao: "Pressão positiva de cabine e exaustão estabilizadas."
  },
  {
    codigo: "R-08",
    nome: "Robô Solda MIG Yaskawa Motoman",
    setor: "Solda MIG",
    estado: "atencao",
    temperatura: "71°C",
    oee: "85.4%",
    vibracao: "2.7",
    descricao: "Contador atingiu 98.6% da vida útil preventiva do redutor do eixo 3."
  }
];

const elementos = {
  grade: document.querySelector("#assets-grid"),
  busca: document.querySelector("#asset-search"),
  setor: document.querySelector("#sector-filter"),
  limpar: document.querySelector("#clear-filters"),
  limparVazio: document.querySelector("#empty-clear-filters"),
  vazio: document.querySelector("#empty-state"),
  anuncio: document.querySelector("#results-announcement"),
  botoesEstado: [...document.querySelectorAll("[data-status]")],
  botoesTelasFuturas: [...document.querySelectorAll("[data-future-screen]")],
  botaoMonitoramento: document.querySelector("#nav-monitoring"),
  contadorFalhaMenu: document.querySelector("#nav-failure-count"),
  valorOee: document.querySelector("#oee-value"),
  valorOk: document.querySelector("#ok-value"),
  valorAtencao: document.querySelector("#attention-value"),
  valorFalha: document.querySelector("#failure-value"),
  totalFalhas: document.querySelector("#critical-count"),
  ativoCritico: document.querySelector("#critical-asset"),
  descricaoCritica: document.querySelector("#critical-description"),
  relogio: document.querySelector("#clock"),
  modoTecnico: document.querySelector("#mode-technician"),
  modoEngenheiro: document.querySelector("#mode-engineer"),
  tituloVisao: document.querySelector("#view-title"),
  descricaoVisao: document.querySelector("#view-description"),
  notificacao: document.querySelector("#notification"),
  botaoInspecionar: document.querySelector('[data-action="inspect-critical"]'),
  botaoOsUrgente: document.querySelector('[data-action="open-critical-os"]')
};

let estadoSelecionado = "todos";
let tempoNotificacao;

// Cria elementos e adiciona texto com segurança.
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) {
    elemento.className = classe;
  }

  if (texto !== undefined) {
    elemento.textContent = texto;
  }

  return elemento;
}

// Exibe uma mensagem quando uma ação ainda não possui uma tela própria.
function mostrarNotificacao(mensagem) {
  elementos.notificacao.textContent = mensagem;
  elementos.notificacao.hidden = false;

  window.clearTimeout(tempoNotificacao);
  tempoNotificacao = window.setTimeout(() => {
    elementos.notificacao.hidden = true;
  }, 4000);
}

function atualizarIndicadores() {
  const quantidadeOk = equipamentos.filter((item) => item.estado === "ok").length;
  const quantidadeAtencao = equipamentos.filter((item) => item.estado === "atencao").length;
  const falhas = equipamentos.filter((item) => item.estado === "falha");
  const mediaOee = equipamentos.reduce((total, item) => total + Number.parseFloat(item.oee), 0) / equipamentos.length;

  elementos.valorOee.textContent = `${mediaOee.toFixed(1)}%`;
  elementos.valorOk.replaceChildren(
    document.createTextNode(String(quantidadeOk)),
    criarElemento("small", "", `de ${equipamentos.length} ativos`)
  );
  elementos.valorAtencao.textContent = String(quantidadeAtencao);
  elementos.valorFalha.textContent = String(falhas.length);
  elementos.contadorFalhaMenu.textContent = String(falhas.length);
  elementos.totalFalhas.textContent = `${falhas.length} equipamento(s) em falha crítica`;

  if (falhas.length > 0) {
    elementos.ativoCritico.textContent = `${falhas[0].nome} (${falhas[0].codigo}) — ${falhas[0].setor}`;
    elementos.descricaoCritica.textContent = falhas[0].descricao;
  } else {
    elementos.ativoCritico.textContent = "Nenhum equipamento em falha crítica";
    elementos.descricaoCritica.textContent = "Todos os equipamentos estão fora do estado de falha crítica.";
  }
}

function criarCartao(equipamento) {
  const cartao = criarElemento("article", `asset-card asset-card--${equipamento.estado}`);
  cartao.dataset.codigo = equipamento.codigo;

  const topo = criarElemento("div", "asset-card__top");
  const nomeEstado = equipamento.estado === "ok"
    ? "OK"
    : equipamento.estado === "atencao" ? "ATENÇÃO" : "FALHA";

  topo.append(
    criarElemento("span", "asset-code", equipamento.codigo),
    criarElemento("span", `asset-status asset-status--${equipamento.estado}`, nomeEstado)
  );

  const titulo = criarElemento("h2", "", equipamento.nome);
  const setor = criarElemento("p", "asset-sector");
  setor.append(
    document.createTextNode("Setor: "),
    criarElemento("strong", "", equipamento.setor)
  );

  const descricao = criarElemento("p", "asset-description", equipamento.descricao);
  const metricas = criarElemento("div", "asset-metrics");
  const valores = [
    ["TEMP.", equipamento.temperatura],
    ["OEE", equipamento.oee],
    ["VIBRAÇÃO", equipamento.vibracao]
  ];

  valores.forEach(([rotulo, valor]) => {
    const metrica = criarElemento("div", "asset-metric");
    metrica.append(
      criarElemento("span", "", rotulo),
      criarElemento("strong", "", valor)
    );
    metricas.append(metrica);
  });

  // Os botões respondem ao clique, mas as telas completas serão feitas depois.
  const acoes = criarElemento("div", "asset-card__actions");
  const detalhes = criarElemento("button", "asset-action asset-action--details", "ⓘ Detalhes");
  const ordemServico = criarElemento("button", "asset-action asset-action--os", "⚒ Abrir OS");

  detalhes.type = "button";
  detalhes.dataset.action = "show-details";
  detalhes.dataset.codigo = equipamento.codigo;
  ordemServico.type = "button";
  ordemServico.dataset.action = "open-os";
  ordemServico.dataset.codigo = equipamento.codigo;

  acoes.append(detalhes, ordemServico);
  cartao.append(topo, titulo, setor, descricao, metricas, acoes);

  return cartao;
}

function obterEquipamentosFiltrados() {
  const termo = elementos.busca.value.trim().toLocaleLowerCase("pt-BR");
  const setor = elementos.setor.value;

  return equipamentos.filter((item) => {
    const correspondeTexto = !termo || [item.codigo, item.nome, item.setor]
      .some((valor) => valor.toLocaleLowerCase("pt-BR").includes(termo));
    const correspondeSetor = !setor || item.setor === setor;
    const correspondeEstado = estadoSelecionado === "todos" || item.estado === estadoSelecionado;

    return correspondeTexto && correspondeSetor && correspondeEstado;
  });
}

function renderizarEquipamentos() {
  const filtrados = obterEquipamentosFiltrados();

  elementos.grade.replaceChildren(...filtrados.map(criarCartao));
  elementos.vazio.hidden = filtrados.length !== 0;
  elementos.grade.hidden = filtrados.length === 0;
  elementos.anuncio.textContent = `Exibindo ${filtrados.length} de ${equipamentos.length} equipamentos.`;
}

function selecionarEstado(novoEstado) {
  estadoSelecionado = novoEstado;

  elementos.botoesEstado.forEach((botao) => {
    const ativo = botao.dataset.status === novoEstado;
    botao.classList.toggle("is-active", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });

  renderizarEquipamentos();
}

function limparFiltros() {
  elementos.busca.value = "";
  elementos.setor.value = "";
  selecionarEstado("todos");
  elementos.busca.focus();
}

function atualizarRelogio() {
  const agora = new Date();

  elementos.relogio.textContent = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(agora);
}

function selecionarModo(modo) {
  const tecnico = modo === "tecnico";

  document.body.dataset.view = tecnico ? "technician" : "engineer";
  elementos.modoTecnico.classList.toggle("is-selected", tecnico);
  elementos.modoEngenheiro.classList.toggle("is-selected", !tecnico);
  elementos.modoTecnico.setAttribute("aria-pressed", String(tecnico));
  elementos.modoEngenheiro.setAttribute("aria-pressed", String(!tecnico));

  elementos.tituloVisao.textContent = tecnico
    ? "Visão: Técnico de Manutenção (Tablet Chão de Fábrica)"
    : "Visão: Engenheiro de Produção (Desktop / Notebook)";
  elementos.descricaoVisao.textContent = tecnico
    ? "Controles ampliados para toque, alertas críticos em destaque e acesso diret à Ordens de Serviço."
    : "Painel de acompanhamento da produção, indicadores OEE e consulta rápida ao estado dos equipamentos.";
}

// Leva o usuário até o cartão do equipamento em falha.
function inspecionarAtivoCritico() {
  const equipamento = equipamentos.find((item) => item.estado === "falha");

  if (!equipamento) {
    mostrarNotificacao("Não existe equipamento em falha crítica no momento.");
    return;
  }

  const cartao = elementos.grade.querySelector(`[data-codigo="${equipamento.codigo}"]`);

  if (!cartao) {
    limparFiltros();
    window.setTimeout(inspecionarAtivoCritico, 0);
    return;
  }

  cartao.scrollIntoView({ behavior: "smooth", block: "center" });
  cartao.classList.add("asset-card--highlight");
  window.setTimeout(() => cartao.classList.remove("asset-card--highlight"), 2500);
  mostrarNotificacao(`Equipamento crítico localizado: ${equipamento.codigo} — ${equipamento.nome}.`);
}

// Eventos da busca, dos filtros e dos botões do painel.
elementos.busca.addEventListener("input", renderizarEquipamentos);
elementos.setor.addEventListener("change", renderizarEquipamentos);
elementos.limpar.addEventListener("click", limparFiltros);
elementos.limparVazio.addEventListener("click", limparFiltros);

elementos.botoesEstado.forEach((botao) => {
  botao.addEventListener("click", () => selecionarEstado(botao.dataset.status));
});

elementos.modoTecnico.addEventListener("click", () => selecionarModo("tecnico"));
elementos.modoEngenheiro.addEventListener("click", () => selecionarModo("engenheiro"));
elementos.botaoMonitoramento.addEventListener("click", () => {
  limparFiltros();
  document.querySelector("#monitoramento").scrollIntoView({ behavior: "smooth", block: "start" });
});

elementos.botoesTelasFuturas.forEach((botao) => {
  botao.addEventListener("click", () => {
    mostrarNotificacao(`${botao.dataset.futureScreen}: esta tela será desenvolvida em uma próxima etapa. O monitoramento continua disponível.`);
  });
});

elementos.botaoInspecionar.addEventListener("click", inspecionarAtivoCritico);
elementos.botaoOsUrgente.addEventListener("click", () => {
  const equipamento = equipamentos.find((item) => item.estado === "falha");
  mostrarNotificacao(`A abertura de Ordens de Serviço será desenvolvida depois. Equipamento selecionado: ${equipamento.codigo}.`);
});

// Os cartões são recriados pelos filtros; por isso, os cliques são tratados na grade.
elementos.grade.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-action]");

  if (!botao) {
    return;
  }

  const equipamento = equipamentos.find((item) => item.codigo === botao.dataset.codigo);

  if (!equipamento) {
    return;
  }

  if (botao.dataset.action === "show-details") {
    mostrarNotificacao(`Detalhes completos de ${equipamento.codigo} serão desenvolvidos na próxima etapa. Estado atual: ${equipamento.estado}.`);
  }

  if (botao.dataset.action === "open-os") {
    mostrarNotificacao(`A tela de Ordem de Serviço será desenvolvida depois. Equipamento selecionado: ${equipamento.codigo}.`);
  }
});

// Inicialização do painel.
atualizarIndicadores();
renderizarEquipamentos();
selecionarModo("tecnico");
atualizarRelogio();
window.setInterval(atualizarRelogio, 30000);
