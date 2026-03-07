let tarefas = [];
let tarefaAtual = null;
let tarefaId = null;
let idEmEdicao = null;

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    tarefaId = Number(params.get("id"));

    tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
    tarefaAtual = tarefas.find(t => t.id === tarefaId);

    const titulo = document.getElementById("tituloPagina");

    if (!tarefaAtual) {
        titulo.textContent = "Tarefa não encontrada";
        return;
    }

    titulo.innerHTML = `Subtarefas de: <span class="titulo-destaque">${tarefaAtual.texto}</span>`;
    renderizarSubtarefas();
});

// Renderizar tarefas
function renderizarSubtarefas() {
    const tbody = document.getElementById("tbodySubtarefas");
    tbody.innerHTML = "";

    if (!tarefaAtual.subTarefas || tarefaAtual.subTarefas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    Nenhuma subtarefa cadastrada
                </td>
            </tr>
        `;
        return;
    }

    // // 🔎 filtros
    // const pesquisa = document.getElementById("pesquisa");
    // const busca = pesquisa ? pesquisa.value.toLowerCase() : "";

    // const filtroStatus = document.getElementById("filtroStatus")?.value || "";
    // const filtroPrioridade = document.getElementById("filtroPrioridade")?.value || "";

    tarefaAtual.subTarefas
        .forEach((sub, i) => {

        // if (
        //     sub.texto.toLowerCase().includes(busca) &&
        //     (!filtroStatus || sub.status === filtroStatus) &&
        //     (!filtroPrioridade || sub.prioridade === filtroPrioridade)
        // ) 
        {
            const tr = document.createElement("tr");

            // status visual
            if (sub.status === "concluida") tr.classList.add("taskDone");
            if (sub.status === "cancelada") tr.classList.add("taskCancel");

            // ========= COLUNAS =========
            // ID
            const tdId = document.createElement("td");
            tdId.textContent = sub.id;

            // Texto
            const tdTexto = document.createElement("td");
            tdTexto.textContent = (sub.texto || "").trim() || "-";

            // Descrição
            const tdDescricao = document.createElement("td");
            tdDescricao.textContent = (sub.descricao || "").trim() || "-";

            // Prioridade
            const tdPrioridade = document.createElement("td");
            tdPrioridade.textContent = sub.prioridade;
            tdPrioridade.classList.add(`prioridade-${sub.prioridade}`);

            // Status
            const tdStatus = document.createElement("td");
            tdStatus.textContent = formatarStatus(sub.status);

            // Data
            const tdData = document.createElement("td");
            tdData.textContent = new Date(sub.criadaEm)
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
            btnConcluir.textContent = "Marcar como concluída!";
            btnConcluir.onclick = () => marcarComoFeitoSub(sub.id);
            btnConcluir.classList.add("btnAcoes");

            const btnCancelar = document.createElement("button");
            btnCancelar.textContent = "Cancelar";
            btnCancelar.onclick = () => cancelarSub(sub.id);
            btnCancelar.classList.add("btnAcoes");

            const btnEditar = document.createElement("button");
            btnEditar.textContent = "Editar";
            btnEditar.onclick = () => editarSub(sub.id);
            btnEditar.classList.add("btnAcoes");

            const btnRemover = document.createElement("button");
            btnRemover.textContent = "Remover";
            btnRemover.onclick = () => removerSubTarefa(sub.id);
            btnRemover.classList.add("btnAcoes");

            listagemAcoes.append(btnConcluir, btnCancelar, btnEditar, btnRemover);

            tr.append(tdId, tdTexto, tdDescricao, tdPrioridade, tdStatus, tdData, tdAcoes);
            tbody.appendChild(tr);
        }
    });
}

function formatarStatus(status) {
    const mapa = {
        pendente: "Em aberto",
        concluida: "Concluída",
        cancelada: "Cancelada"
    };

    return mapa[status] || status;
}


function adicionarSubTarefa() {

    const inputTarefa = document.getElementById("inputTarefaSub");
    const inputDescricao = document.getElementById("inputDescricaoSub");
    const selectPrioridade = document.getElementById("prioridadeTarefaSub");
    const selectStatus = document.getElementById("statusTarefaSub");

    const texto = inputTarefa.value.trim();
    if (!texto) return;

    // 🔥 MODO EDIÇÃO
    if (idEmEdicao !== null) {

        const index = tarefaAtual.subTarefas.findIndex(s => s.id === idEmEdicao);
        if (index !== -1) {
            tarefaAtual.subTarefas[index].texto = texto;
            tarefaAtual.subTarefas[index].descricao = inputDescricao.value;
            tarefaAtual.subTarefas[index].prioridade = selectPrioridade.value;
            tarefaAtual.subTarefas[index].status = selectStatus.value;
        }

        idEmEdicao = null;

        salvar();
        renderizarSubtarefas();
        fecharModalSubTarefa();

        Swal.fire({
            icon: "success",
            title: "Tarefa editada!",
            timer: 1000,
            showConfirmButton: false
        });

        return;
    }
        else {
    const inputTarefa = document.getElementById("inputTarefaSub");
    const inputDescricao = document.getElementById("inputDescricaoSub");
    const selectPrioridade = document.getElementById("prioridadeTarefaSub");
    const selectStatus = document.getElementById("statusTarefaSub");

    const texto = inputTarefa.value.trim();
    if (!texto) return;

const novoSubId = tarefaAtual.subTarefas && tarefaAtual.subTarefas.length > 0
    ? Math.max(...tarefaAtual.subTarefas.map(s => Number(s.id))) + 1
    : 1;


    const novaSub = {
        id: novoSubId,
        texto: texto,
        descricao: inputDescricao.value,
        prioridade: selectPrioridade.value,
        status: selectStatus.value,
        criadaEm: new Date().toISOString()
    };

    tarefaAtual.subTarefas = tarefaAtual.subTarefas || [];
    tarefaAtual.subTarefas.push(novaSub);

    salvar();
    renderizarSubtarefas();
    fecharModalSubTarefa();

    Swal.fire({
        icon: "success",
        title: "Subtarefa adicionada!",
        timer: 1000,
        showConfirmButton: false
    });

inputTarefa.value = "";
inputDescricao.value = "";
selectPrioridade.selectedIndex = 0;
selectStatus.selectedIndex = 0;

}
}


function removerSubTarefa(id) {
    tarefaAtual.subTarefas = tarefaAtual.subTarefas.filter(s => s.id !== id);
    salvar();
    renderizarSubtarefas();
}


function salvar() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function marcarComoFeitoSub(id) {
    const index = tarefaAtual.subTarefas.findIndex(s => s.id === id);
    if (index !== -1) {
        tarefaAtual.subTarefas[index].status = "concluida";
        salvar();
        renderizarSubtarefas();
    }
}

function cancelarSub(id) {
    const index = tarefaAtual.subTarefas.findIndex(s => s.id === id);
    if (index !== -1) {
        tarefaAtual.subTarefas[index].status = "cancelada";
        salvar();
        renderizarSubtarefas();
    }
}

function editarSub(id) {
    const sub = tarefaAtual.subTarefas.find(s => s.id === id);
    if (!sub) return;

    idEmEdicao = sub.id; // guarda o ID que está sendo editado

    const inputTarefa = document.getElementById("inputTarefaSub");
    const inputDescricao = document.getElementById("inputDescricaoSub");
    const selectPrioridade = document.getElementById("prioridadeTarefaSub");
    const selectStatus = document.getElementById("statusTarefaSub");
    const tituloModal = document.getElementById("tituloModalCriacao");
    const botaoSalvar = document.getElementById("botaoFinalizarCadastro");

    tituloModal.textContent = "Editar Tarefa";
    botaoSalvar.textContent = "Salvar alterações";

    inputTarefa.value = sub.texto;
    inputDescricao.value = sub.descricao;
    selectPrioridade.value = sub.prioridade;
    selectStatus.value = sub.status;

    abrirModalSubTarefa();
}

function voltar() {
    window.location.href = "index.html";
}


const abrirModalSubTarefa = () => {
    document.getElementById("modalSubTarefa").style.display = "flex";
};

const fecharModalSubTarefa = () => {
    document.getElementById("modalSubTarefa").style.display = "none";
};
