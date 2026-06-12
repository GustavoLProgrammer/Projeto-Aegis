const dadosUsuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

// Função para carregar o último protocolo salvo
function carregarUltimoProtocolo() {
    const ultimoProtocolo = localStorage.getItem('ultimoProtocolo');
    if (ultimoProtocolo) {
        const inputProtocolo = document.getElementById("numeroProtocolo");
        if (inputProtocolo) {
            inputProtocolo.value = ultimoProtocolo;
            // Busca automaticamente a ocorrência
            buscarPorProtocolo();
        }
    }
}

window.onload = function() {
    if (dadosUsuarioLogado) {
        document.getElementById("titulo-lista").innerText = `Ocorrências de: ${dadosUsuarioLogado.nome}`;
    } else {
        document.getElementById("titulo-lista").innerText = "Resultado da Busca por Protocolo";
    }
    
    // Carregar o último protocolo salvo
    carregarUltimoProtocolo();
};

// ========== FUNÇÃO BUSCAR PROTOCOLO CORRIGIDA COM CARGO ==========
async function buscarPorProtocolo() {
    const idProtocolo = document.getElementById("numeroProtocolo").value.trim();

    if (idProtocolo === "") {
        alert("Por favor, informe o número do protocolo.");
        return;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const cpfSolicitante = usuarioLogado ? usuarioLogado.cpf : "anonimo";
    const cargo = usuarioLogado ? usuarioLogado.cargo : "";

    try {
        const resposta = await fetch(`/api/denuncias/${idProtocolo}?solicitante=${cpfSolicitante}&cargo=${cargo}`);
        
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
    let iconeStatus = "🚨 ";
    if (ocorrencia.status === "Em Andamento") { classeStatus = "status-andamento"; iconeStatus = "🚔 "; }
    if (ocorrencia.status === "Atendido") { classeStatus = "status-atendido"; iconeStatus = "✅ "; }

    const mensagemObservacao = ocorrencia.observacoes 
        ? ocorrencia.observacoes 
        : "Nenhuma atualização registrada pelo Centro de Operações ainda.";

    tabelaArea.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
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
                    <td><span class="status-badge ${classeStatus}">${iconeStatus}${ocorrencia.status}</span></td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 25px; padding: 15px; background: rgba(255,255,255,0.05); border-left: 4px solid #3a86ff; border-radius: 4px;">
            <strong style="color: #3a86ff;">💬 Notas de Atualização e Despacho:</strong>
            <p style="margin-top: 8px;">"${mensagemObservacao}"</p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
            <a href="/acompanhamento.html?id=${ocorrencia.id}" target="_blank" 
               style="background: #e63946; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; transition: all 0.3s ease; transform: scale(1);"
               onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';"
               onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                🗺️ RASTREAR VIATURA NO MAPA
            </a>
        </div>

        <div class="chat-box" style="background: #141417; border: 1px solid #26262b; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: white; margin-bottom: 10px;">💬 Conversa com a Central Aegis</h3>
            <div id="chat-vitima-container" style="height: 180px; overflow-y: auto; background: #0a0a0c; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #26262b;"></div>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="input-msg-vitima" placeholder="Digite sua resposta..." 
                       onkeydown="if(event.key === 'Enter') enviarMensagemChat(${ocorrencia.id}, 'input-msg-vitima', 'chat-vitima-container', 'vitima')" 
                       style="flex: 1; padding: 10px; background: #0a0a0c; border: 1px solid #26262b; color: white; border-radius: 6px;">
                <button onclick="enviarMensagemChat(${ocorrencia.id}, 'input-msg-vitima', 'chat-vitima-container', 'vitima')" 
                        style="background: #3a86ff; color: white; border: none; padding: 0 15px; border-radius: 6px; cursor: pointer;">Enviar</button>
            </div>
        </div>
    `;

    carregarChat(ocorrencia.id, 'chat-vitima-container', 'vitima');

    if (window.intervaloChatVitima) clearInterval(window.intervaloChatVitima);
    window.intervaloChatVitima = setInterval(() => {
        carregarChat(ocorrencia.id, 'chat-vitima-container', 'vitima');
    }, 3000);
}

async function carregarChat(idDenuncia, containerId, usuarioAtual) {
    try {
        const resposta = await fetch(`/api/denuncias/${idDenuncia}/mensagens`);
        if (!resposta.ok) return;

        const mensagens = await resposta.json();
        const chatContainer = document.getElementById(containerId);
        
        const usuarioLogadoLocal = JSON.parse(localStorage.getItem("usuarioLogado"));
        const nomeDoUsuario = usuarioLogadoLocal ? usuarioLogadoLocal.nome : "Anônimo";

        chatContainer.innerHTML = mensagens.map(msg => {
            const nomeExibicao = msg.remetente === 'dev' ? '🛡️ Suporte/Dev' : `👤 ${nomeDoUsuario}`;

            return `
                <div style="margin-bottom: 10px; padding: 8px; background: ${msg.remetente === 'dev' ? '#3a86ff20' : '#e6394620'}; border-radius: 8px;">
                    <small style="color: #aaa;">${nomeExibicao}</small>
                    <div style="margin-top: 4px;">${msg.texto}</div>
                </div>
            `;
        }).join('');

        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (erro) {
        console.error("Erro ao carregar o chat:", erro);
    }
}

async function enviarMensagemChat(idDenuncia, inputId, containerId, remetente) {
    const input = document.getElementById(inputId);
    const texto = input.value.trim();

    if (texto === "") return;

    try {
        const resposta = await fetch(`/api/denuncias/${idDenuncia}/mensagens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ remetente, texto })
        });

        if (resposta.ok) {
            input.value = ""; 
            carregarChat(idDenuncia, containerId, remetente); 
        }
    } catch (erro) {
        alert("Erro ao enviar a mensagem.");
    }
}