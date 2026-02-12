// ================== DADOS ==================
let tarefas = [];
let ordenarAscendente = true;

// ================== ADICIONAR ==================
function adicionarTarefa() {
    const inputTarefa = document.getElementById("inputTarefa");
    const statusTarefa = document.getElementById("statusTarefa").value;
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
        status: statusTarefa
    });

    salvarTarefasNoLocalStorage();
    renderizarTarefas();
    renderizarBotaoLimpar();

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

// ================== RENDER ==================
function renderizarTarefas() {
    const tbody = document.getElementById("listaTarefas");
    tbody.innerHTML = "";

    tarefas.forEach((tarefa, i) => {
        const tr = document.createElement("tr");

        if (tarefa.status === "concluida") tr.classList.add("taskDone");
        if (tarefa.status === "cancelada") tr.classList.add("taskCancel");

        // Coluna Tarefa
        const tdTexto = document.createElement("td");
        tdTexto.classList.add("texto");
        tdTexto.textContent = tarefa.texto;

        // Coluna Status (NOVA)
        const tdStatus = document.createElement("td");
        tdStatus.textContent = formatarStatus(tarefa.status);

        // Coluna Ações
        const tdAcoes = document.createElement("td");
        tdAcoes.classList.add("acoes");

        // Criar botões
        const btnConcluir = document.createElement("button");
        btnConcluir.textContent = "✔";
        btnConcluir.onclick = () => marcarComoFeito(i);
        btnConcluir.classList.add("btn-acao");

        const btnCancelar = document.createElement("button");
        btnCancelar.textContent = "❌";
        btnCancelar.onclick = () => cancelarTarefa(i);
        btnCancelar.classList.add("btn-acao");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "✍";
        btnEditar.onclick = () => editarTarefa(i);
        btnEditar.classList.add("btn-acao");

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "🗑️";
        btnRemover.onclick = () => removerTarefa(i);
        btnRemover.classList.add("btn-acao", "remover");

        // Adicionar botões à coluna Ações
        tdAcoes.append(btnConcluir, btnCancelar, btnEditar, btnRemover);

        // Adicionar todas as colunas à linha
        tr.append(tdTexto, tdStatus, tdAcoes);
        tbody.appendChild(tr);
    });
}

// Função auxiliar para formatar o status
function formatarStatus(status) {
    const statusMap = {
        "pendente": "Pendente",
        "concluida": "Concluída",
        "cancelada": "Cancelada"
    };
    return statusMap[status] || status;
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
    const novoStatus = prompt("Edite o status da tarefa:", tarefas[i].status);

    if (novoTexto && novoTexto.trim() !== "") {
        tarefas[i].texto = novoTexto.trim();
        tarefas[i].status = novoStatus;
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
    salvarTarefasNoLocalStorage();
    renderizarTarefas();
    renderizarBotaoLimpar();
    renderizarBotaoOrdenar();
    renderizarBotaoOrdenarStatus();

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
    tarefas = [];
    salvarTarefasNoLocalStorage();
    renderizarTarefas();
    renderizarBotaoLimpar();
    renderizarBotaoOrdenar();
    renderizarBotaoOrdenarStatus();
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

carregarTarefasDoLocalStorage();

// ================== ENTER ==================
document.getElementById("inputTarefa").addEventListener("keypress", e => {
    if (e.key === "Enter") {
        adicionarTarefa();
    }
});