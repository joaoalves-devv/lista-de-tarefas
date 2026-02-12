// ================== DADOS ==================
let tarefas = [];
let ordenarAscendente = true;

// ================== ADICIONAR ==================
function adicionarTarefa() {
    const inputTarefa = document.getElementById("inputTarefa");
    const statusTarefa = document.getElementById("statusTarefa").value;
    const prioridade = document.getElementById("prioridadeTarefa").value;
    const tarefa = inputTarefa.value.trim();

    if (tarefa === "") {
        Swal.fire({
            icon: "warning",
            title: "Campo vazio!",
            text: "Adicione algo para criar a tarefa.",
            timer: 1000,
            background: "#F4F0EA",
            color: "#331F19"
        });
        return;
    }

    tarefas.push({
        texto: tarefa,
        status: statusTarefa,
        prioridade: prioridade,
        criadaEm: new Date().toISOString()
    });

    fecharModal();
    atualizar();

    Swal.fire({
        icon: "success",
        title: "Tarefa adicionada!",
        timer: 1000,
        showConfirmButton: false,
        background: "#F4F0EA",
        color: "#331F19"
    });

    inputTarefa.value = "";
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

                // Tarefa
                const tdTexto = document.createElement("td");
                tdTexto.textContent = tarefa.texto;

                // Prioridade
                const tdPrioridade = document.createElement("td");
                tdPrioridade.textContent = tarefa.prioridade;
                tdPrioridade.classList.add(`prioridade-${tarefa.prioridade}`);

                // Status
                const tdStatus = document.createElement("td");
                tdStatus.textContent = formatarStatus(tarefa.status);

                // Data
                const tdData = document.createElement("td");
                tdData.textContent = new Date(tarefa.criadaEm).toLocaleDateString("pt-BR");

                // Ações
                const tdAcoes = document.createElement("td");
                tdAcoes.classList.add("acoes");

                const btnConcluir = document.createElement("button");
                btnConcluir.textContent = "✔";
                btnConcluir.onclick = () => marcarComoFeito(i);

                const btnCancelar = document.createElement("button");
                btnCancelar.textContent = "❌";
                btnCancelar.onclick = () => cancelarTarefa(i);

                const btnEditar = document.createElement("button");
                btnEditar.textContent = "✍";
                btnEditar.onclick = () => editarTarefa(i);

                const btnRemover = document.createElement("button");
                btnRemover.textContent = "🗑️";
                btnRemover.classList.add("remover");
                btnRemover.onclick = () => removerTarefa(i);

                tdAcoes.append(btnConcluir, btnCancelar, btnEditar, btnRemover);

                tr.append(tdTexto, tdPrioridade, tdStatus, tdData, tdAcoes);
                tbody.appendChild(tr);
            }
});}

// ================== STATUS ==================
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

function editarTarefa(i) {
    const novoTexto = prompt("Edite sua tarefa:", tarefas[i].texto);

    if (novoTexto && novoTexto.trim() !== "") {
        tarefas[i].texto = novoTexto.trim();
        salvarTarefasNoLocalStorage();
        renderizarTarefas();

        Swal.fire({
            icon: "success",
            title: "Tarefa editada!",
            timer: 1000,
            showConfirmButton: false,
            background: "#F4F0EA",
            color: "#331F19"
        });
    }
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
    doc.text("===========================================================", 14, 25);

    // =========================================
    // 3. Definição das colunas da tabela
    // =========================================
    const colunas = ["Tarefa", "Prioridade", "Status", "Criação"];

    // =========================================
    // 4. Monta o corpo da tabela a partir
    //    do array de tarefas
    // =========================================
    const linhas = tarefas.map(tarefa => [
        tarefa.texto,
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
            0: { halign: "left", cellWidth: 90 }, // Tarefa
            1: { halign: "center", cellWidth: 30 }, // Prioridade
            2: { halign: "center", cellWidth: 30 }, // Status
            3: { halign: "center", cellWidth: 30 }  // Data
        },

        // -------------------------------------
        // Estilo condicional por linha
        // -------------------------------------
        didParseCell: function (data) {
            if (data.section === "body") {
                const status = data.row.raw[2]; // coluna "Status"

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