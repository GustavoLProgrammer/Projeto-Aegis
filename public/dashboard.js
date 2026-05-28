const dadosUsuarioLogado = JSON.parse(localStorage.getitem("usuarioLogado"));

window.onload = function() {
    if (dadosUsuarioLogado) {
        document.getElementById("titulo-lista").innerText = `Ocorrências de: ${dadosUsuarioLogado.nome}`;
    } else {
        document.getElementById("titulo-lista").innerText = "Resultado da Busca por Protocolo";
    }
};

window.onload = function() {
    if (dadosUsuarioLogado) {
        document.getElementById("titulo-lista").innerText = `Ocorrências de: ${dadosUsuarioLogado.nome}`;
    } else {
        document.getElementById("titulo-lista").innerText = "Resultado da Busca por Protocolo";
    }
};

async function buscarPorProtocolo() {
    const idProtocolo = document.getElementById("numeroProtocolo").value.trim();

    if (idProtocolo === "") {
        alert("Por favor, informe o número do protocolo.");
        return;
    }

    try {
        const resposta = await fetch(`/api/denuncias/${idProtocolo}`);
        
        if (!resposta.ok) {
            const dadosErro = await resposta.json();
            document.getElementById("tabela-area").innerHTML = `<p class="sem-dados" style="color: #e63946;">${dadosErro.erro || 'Erro ao localizar o protocolo.'}</p>`;
            return;
        }

        const ocorrencia = await resposta.json();
        renderizarOcorrencia(ocorrencia);

    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

function renderizarOcorrencia(ocorrencia) {
    const tabelaArea = document.getElementById("tabela-area");

    let classeStatus = "status-pendente";
    if (ocorrencia.status === "Em Andamento") classeStatus = "status-andamento";
    if (ocorrencia.status === "Atendido") classeStatus = "status-atendido";

    const mensagemObservacao = ocorrencia.observacoes 
        ? ocorrencia.observacoes 
        : "Nenhuma atualização registrada pelo Centro de Operações ainda.";

    tabelaArea.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Protocolo</th>
                    <th>Tipo</th>
                    <th>Endereço</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>#${ocorrencia.id}</strong></td>
                    <td>${ocorrencia.tipo_ocorrencia}</td>
                    <td>${ocorrencia.endereco}</td>
                    <td><span class="status-badge ${classeStatus}">🚨 ${ocorrencia.status}</span></td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 25px; padding: 15px; background: rgba(255,255,255,0.05); border-left: 4px solid #3a86ff; border-radius: 4px;">
            <strong style="color: #3a86ff; display: block; margin-bottom: 8px; font-size: 0.95rem; text-transform: uppercase;">💬 Notas de Atualização e Despacho:</strong>
            <p style="font-size: 1rem; line-height: 1.5; color: #e0e0e5; font-style: italic;">"${mensagemObservacao}"</p>
        </div>
    `;
}