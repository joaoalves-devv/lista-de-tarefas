// ================== DADOS ==================
let tarefas = [];
let ordenarAscendente = true;
let idEmEdicao = null;

// Garante que a função original de criar tarefa esteja sempre disponível
const form = document.getElementById("modal");

form.onsubmit = function (e) {
    e.preventDefault();
    adicionarTarefa();
};


// ================== ADICIONAR ==================
function adicionarTarefa() {

    const inputTarefa = document.getElementById("inputTarefa");
    const inputDescricao = document.getElementById("inputDescricao");
    const selectPrioridade = document.getElementById("prioridadeTarefa");
    const selectStatus = document.getElementById("statusTarefa");

    const texto = inputTarefa.value.trim();
    if (!texto) return;

    // 🔥 SE ESTIVER EDITANDO
    if (idEmEdicao !== null) {

        const index = tarefas.findIndex(t => t.id === idEmEdicao);
        if (index !== -1) {
            tarefas[index].texto = texto;
            tarefas[index].descricao = inputDescricao.value;
            tarefas[index].prioridade = selectPrioridade.value;
            tarefas[index].status = selectStatus.value;
        }

        idEmEdicao = null; // 🔥 limpa modo edição

        Swal.fire({
            icon: "success",
            title: "Tarefa editada!",
            timer: 1000,
            showConfirmButton: false
        });

    } else {

        // 🔥 SE FOR NOVA TAREFA
        const novoId = tarefas.length > 0
            ? Math.max(...tarefas.map(t => Number(t.id))) + 1
            : 1;

        tarefas.push({
            id: novoId,
            texto: texto,
            descricao: inputDescricao.value,
            prioridade: selectPrioridade.value,
            status: selectStatus.value,
            criadaEm: new Date().toISOString()
        });

        Swal.fire({
            icon: "success",
            title: "Tarefa adicionada!",
            timer: 1000,
            showConfirmButton: false
        });
    }

    atualizar();
    fecharModal();
}

function renderizarTarefas() {
    const tbody = document.getElementById("listaTarefas");
    tbody.innerHTML = "";

    // 🔎 filtros atuais da tela
    const busca = pesquisa.value.toLowerCase();
    const filtroStatus = document.getElementById("filtroStatus").value;
    const filtroPrioridade = document.getElementById("filtroPrioridade").value;

    tarefas
        .forEach((tarefa, i) => {
            if (
                tarefa.texto.toLowerCase().includes(busca) &&
                (!filtroStatus || tarefa.status === filtroStatus) &&
                (!filtroPrioridade || tarefa.prioridade === filtroPrioridade)
            ) {
                const tr = document.createElement("tr");

                // status visual
                if (tarefa.status === "concluida") tr.classList.add("taskDone");
                if (tarefa.status === "cancelada") tr.classList.add("taskCancel");

                // ========= COLUNAS =========
                // ID
                const tdId = document.createElement("td");
                tdId.textContent = tarefa.id;

                // Tarefa
                const tdTexto = document.createElement("td");
                tdTexto.textContent = tarefa.texto;
                tdTexto.textContent = (tarefa.texto || "").trim() || "-";

                // Descrição
                const tdDescricao = document.createElement("td");
                tdDescricao.textContent = tarefa.descricao;
                tdDescricao.textContent = (tarefa.descricao || "").trim() || "-";

                // Prioridade
                const tdPrioridade = document.createElement("td");
                tdPrioridade.textContent = tarefa.prioridade;
                tdPrioridade.classList.add(`prioridade-${tarefa.prioridade}`);

                // Status
                const tdStatus = document.createElement("td");
                tdStatus.textContent = formatarStatus(tarefa.status);

                // Data
                const tdData = document.createElement("td");

                tdData.textContent = new Date(tarefa.criadaEm)
                .toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                });


                // Ações
                const tdAcoes = document.createElement("td");
                const listagemAcoes = document.createElement("div");
                tdAcoes.classList.add("acoes");
                listagemAcoes.classList.add("listagemAcoes", "esconder");
                tdAcoes.appendChild(listagemAcoes);
                const btnOpcoes = document.createElement("button");
                btnOpcoes.textContent = "⚙️";
                btnOpcoes.addEventListener("click", (e) => {
                    const rect = btnOpcoes.getBoundingClientRect();

                    listagemAcoes.style.top = rect.bottom + "px";
                    listagemAcoes.style.left = rect.left + "px";

                    listagemAcoes.classList.remove("esconder");
                    listagemAcoes.classList.add("mostrar");
                });

                listagemAcoes.addEventListener("mouseleave", () => {
                    listagemAcoes.classList.remove("mostrar");
                    listagemAcoes.classList.add("esconder");
                });

                tdAcoes.appendChild(btnOpcoes);

                const btnConcluir = document.createElement("button");
                btnConcluir.textContent = "Marcar como conluida!";
                btnConcluir.onclick = () => marcarComoFeito(i);
                btnConcluir.classList.add("btnAcoes");

                const btnCancelar = document.createElement("button");
                btnCancelar.textContent = "Cancelar";
                btnCancelar.onclick = () => cancelarTarefa(i);
                btnCancelar.classList.add("btnAcoes");

                const btnEditar = document.createElement("button");
                btnEditar.textContent = "Editar";
                btnEditar.onclick = () => editarTarefa(tarefa.id);
                btnEditar.classList.add("btnAcoes");

                const btnRemover = document.createElement("button");
                btnRemover.textContent = "Remover";
                btnRemover.onclick = () => removerTarefa(i);
                btnRemover.classList.add("btnAcoes");


                listagemAcoes.append(btnConcluir, btnCancelar, btnEditar, btnRemover);

                tr.append(tdId, tdTexto, tdDescricao, tdPrioridade, tdStatus, tdData, tdAcoes);
                tbody.appendChild(tr);
            }
        });
}

function editarTarefa(id) {

    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    idEmEdicao = id; // guarda o ID que está sendo editado

    const inputTarefa = document.getElementById("inputTarefa");
    const inputDescricao = document.getElementById("inputDescricao");
    const selectPrioridade = document.getElementById("prioridadeTarefa");
    const selectStatus = document.getElementById("statusTarefa");
    const tituloModal = document.getElementById("tituloModalCriacao");
    const botaoSalvar = document.getElementById("botaoFinalizarCadastro");

    tituloModal.textContent = "Editar Tarefa";
    botaoSalvar.textContent = "Salvar alterações";

    inputTarefa.value = tarefa.texto;
    inputDescricao.value = tarefa.descricao;
    selectPrioridade.value = tarefa.prioridade;
    selectStatus.value = tarefa.status;

    abrirModal();
}

// ================== STATUS ==================
function formatarStatus(status) {
    const mapa = {
        pendente: "Em aberto",
        concluida: "Concluída",
        cancelada: "Cancelada"
    };

    return mapa[status] || status;
}

// ================== AÇÕES ==================
function marcarComoFeito(i) {
    tarefas[i].status = "concluida";
    salvarTarefasNoLocalStorage();
    renderizarTarefas();

    Swal.fire({
        icon: "success",
        title: "Tarefa concluída!",
        timer: 1000,
        showConfirmButton: false,
        background: "#F4F0EA",
        color: "#331F19"
    });
}

function cancelarTarefa(i) {
    tarefas[i].status = "cancelada";
    salvarTarefasNoLocalStorage();
    renderizarTarefas();

    Swal.fire({
        icon: "error",
        title: "Tarefa cancelada!",
        timer: 1000,
        showConfirmButton: false,
        background: "#F4F0EA",
        color: "#331F19"
    });
}

function removerTarefa(i) {
    tarefas.splice(i, 1);
    atualizar();
    Swal.fire({
        icon: "success",
        title: "Tarefa removida!",
        timer: 1000,
        showConfirmButton: false,
        background: "#F4F0EA",
        color: "#331F19"
    });
}

// ================== BOTÕES EXTRAS ==================
function renderizarBotaoLimpar() {
    const div = document.getElementById("botoesExtras");
    div.innerHTML = "";

    if (tarefas.length > 0) {
        const btn = document.createElement("button");
        btn.textContent = "Limpar lista";
        btn.onclick = limpar;
        div.appendChild(btn);
    }
}

async function renderizarBotaoOrdenar() {
    const div = document.getElementById("botaoOrdenar");

    if (tarefas.length > 0) {
        const btn = document.createElement("button");
        btn.textContent = "👇";
        btn.classList.add("ordenar");
        btn.onclick = ordenarTarefas;
        div.appendChild(btn);
    }
}

async function renderizarBotaoOrdenarStatus() {
    const div = document.getElementById("botaoOrdenarStatus");

    if (tarefas.length > 0) {
        const btn = document.createElement("button");
        btn.textContent = "👇";
        btn.classList.add("ordenar");
        btn.onclick = ordenarstatus;
        div.appendChild(btn);
    }
    console.log("renderizou ordenar status");
}

// ================== UTIL ==================
function ordenarTarefas() {
    tarefas.sort((a, b) =>
        ordenarAscendente
            ? a.texto.localeCompare(b.texto)
            : b.texto.localeCompare(a.texto)
    );

    ordenarAscendente = !ordenarAscendente;
    salvarTarefasNoLocalStorage();
    renderizarTarefas();
}

function ordenarstatus() {
    tarefas.sort((a, b) =>
        ordenarAscendente
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status)
    );

    ordenarAscendente = !ordenarAscendente;
    salvarTarefasNoLocalStorage();
    renderizarTarefas();
}

function ordenarPrioridade() {
    tarefas.sort((a, b) =>
        ordenarAscendente
            ? a.prioridade.localeCompare(b.prioridade)
            : b.prioridade.localeCompare(a.prioridade)
    );

    ordenarAscendente = !ordenarAscendente;
    salvarTarefasNoLocalStorage();
    renderizarTarefas();
}

function ordenarCriacao() {
    tarefas.sort((a, b) => 
        ordenarAscendente            ? new Date(a.criadaEm) - new Date(b.criadaEm)
            : new Date(b.criadaEm) - new Date(a.criadaEm)
            
    );

    ordenarAscendente = !ordenarAscendente;
    salvarTarefasNoLocalStorage();
    renderizarTarefas();
}

function ordenarId() {
    tarefas.sort((a, b) =>
        ordenarAscendente
            ? a.id - b.id
            : b.id - a.id
    );

    ordenarAscendente = !ordenarAscendente;
    salvarTarefasNoLocalStorage();
    renderizarTarefas();
}

function ordenarDescricao() {
    tarefas.sort((a, b) =>
        ordenarAscendente
            ? a.descricao.localeCompare(b.descricao)
            : b.descricao.localeCompare(a.descricao)
    );

    ordenarAscendente = !ordenarAscendente;
    salvarTarefasNoLocalStorage();
    renderizarTarefas();
}

function limpar() {
    modalDeConfirmacao("Tem certeza que deseja limpar toda a lista?", () => {
        tarefas = [];
        atualizar();
    });
}

// ================== LOCAL STORAGE ==================
function salvarTarefasNoLocalStorage() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function carregarTarefasDoLocalStorage() {
    const dados = localStorage.getItem("tarefas");
    if (dados) {
        tarefas = JSON.parse(dados);
        renderizarTarefas();
        renderizarBotaoLimpar();
        renderizarBotaoOrdenar();
        renderizarBotaoOrdenarStatus();
    }
}

// ================== ENTER ==================
document.getElementById("inputTarefa").addEventListener("keypress", e => {
    if (e.key === "Enter") {
        adicionarTarefa();
    }
});

// ================== EXPORTAR PDF ==================
function exportarPDF() {
    // =========================================
    // 1. Inicializa o documento PDF
    // =========================================
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    // =========================================
    // 2. Título do PDF
    // =========================================
    doc.setFontSize(18);
    doc.setTextColor(33, 31, 25);
    doc.text("Lista de Tarefas", 14, 15);

    // Subtítulo com data de geração
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        21
    );

    doc.setFontSize(15);
    doc.setTextColor(33, 31, 25);
    doc.text("_______________________________________________", 14, 25);

    // =========================================
    // 3. Definição das colunas da tabela
    // =========================================
    const colunas = ["Tarefa", "Descrição", "Prioridade", "Status", "Criação"];

    // =========================================
    // 4. Monta o corpo da tabela a partir
    //    do array de tarefas
    // =========================================
    const linhas = tarefas.map(tarefa => [
        tarefa.id + " - " + tarefa.texto,
        tarefa.descricao,
        tarefa.prioridade,
        formatarStatus(tarefa.status),
        new Date(tarefa.criadaEm).toLocaleDateString("pt-BR")
    ]);

    // =========================================
    // 5. Criação da tabela com AutoTable
    // =========================================
    doc.autoTable({
        startY: 28, // posição inicial no eixo Y
        head: [colunas],
        body: linhas,

        // -------------------------------------
        // Estilo geral da tabela
        // -------------------------------------
        styles: {
            fontSize: 10,
            cellPadding: 3,
            valign: "middle",
            lineWidth: 0.2,              // ESPESSURA DA BORDA
            lineColor: [0, 0, 0],        // COR DA BORDA (preto)
            textColor: [51, 31, 25]
        },

        // -------------------------------------
        // Estilo do cabeçalho
        // -------------------------------------
        headStyles: {
            fillColor: [19, 19, 56, 100], // Azul escuro
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
            lineWidth: 0.2               // borda mais forte no cabeçalho
        },

        // -------------------------------------
        // Alinhamento e largura por coluna
        // -------------------------------------
        columnStyles: {
            0: { halign: "left", cellWidth: 40 }, // Tarefa
            1: { halign: "left", cellWidth: 50 }, // Descrição
            2: { halign: "center", cellWidth: 30 }, // Prioridade
            3: { halign: "center", cellWidth: 30 }, // Status
            4: { halign: "center", cellWidth: 30 }  // Data
        },

        // -------------------------------------
        // Estilo condicional por linha
        // -------------------------------------
        didParseCell: function (data) {
            if (data.section === "body") {
                const status = data.row.raw[3]; // coluna "Status"

                // Concluída → Verde
                if (status === "Concluída") {
                    data.cell.styles.fillColor = [76, 175, 80];
                    data.cell.styles.textColor = [255, 255, 255];
                }

                // Cancelada → Vermelho
                if (status === "Cancelada") {
                    data.cell.styles.fillColor = [244, 67, 54];
                    data.cell.styles.textColor = [255, 255, 255];
                }
            }
        },

        // -------------------------------------
        // Rodapé em todas as páginas
        // -------------------------------------
        didDrawPage: function () {
            const pageHeight = doc.internal.pageSize.height;

            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text(
                "Lista de Tarefas - Exportação PDF",
                14,
                pageHeight - 10
            );
        }
    });

    // =========================================
    // 6. Salva o arquivo
    // =========================================
    doc.save("lista-de-tarefas.pdf");
};

// ================== ATUALIZAR ==================
function atualizar() {
    salvarTarefasNoLocalStorage();
    renderizarTarefas();
    renderizarBotaoLimpar();
}

function abrirModal() {
    document.getElementById("modal").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("inputTarefa").value = "";
}

// Modal Filtro
function abrirModalFiltros() {
    document.getElementById("modalFiltros").style.display = "flex";
}

function limparFiltros() {
    document.getElementById("filtroStatus").value = "";
    document.getElementById("filtroPrioridade").value = "";
    fecharModalFiltros();
    atualizar();
}

function fecharModalFiltros() {
    document.getElementById("modalFiltros").style.display = "none";
}

function aplicarFiltros() {
    fecharModalFiltros();
    atualizar();
}

// ================== EVENTOS FILTRO ==================
pesquisa.addEventListener("input", atualizar);
filtroStatus.addEventListener("change", atualizar);
filtroPrioridade.addEventListener("change", atualizar);

// ================== INIT ==================
carregarTarefasDoLocalStorage();

function modalDeConfirmacao(mensagem, acaoConfirmar) {
    Swal.fire({
        title: "Confirmação",
        text: mensagem,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        background: "#F4F0EA",
        color: "#331F19",
    }).then(result => {
        if (result.isConfirmed) {
            acaoConfirmar();
        }
    });
}

// Corrige tarefas sem ID (caso tenha alguma tarefa criada antes da implementação do ID)
function corrigirIdsAntigos() {
    let maiorId = 0;

    tarefas.forEach((tarefa, index) => {
        // Se não tiver ID ou for inválido
        if (!tarefa.id || isNaN(Number(tarefa.id))) {
            maiorId++;
            tarefa.id = maiorId;
        } else {
            tarefa.id = Number(tarefa.id);
            if (tarefa.id > maiorId) {
                maiorId = tarefa.id;
            }
        }
    });

    salvarTarefasNoLocalStorage();
}

corrigirIdsAntigos();
