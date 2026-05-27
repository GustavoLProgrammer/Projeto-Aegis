const dadosUsuario = JSON.parse(localStorage.getItem("usuarioLogado"));

function renderizarTelaSucesso(dados) {
    const nomeSolicitante = dados.nomeSolicitante || "Anônimo";
    
    const container = document.getElementById('main-container');
    container.innerHTML = `
        <header style="margin-bottom: 20px;">
            <h1 style="color: #BB071E; font-size: 1.6rem; letter-spacing: 0.5px;">🚨 VIATURA A CAMINHO!</h1>
        </header>
        
        <div class="status-box" style="border: 1px solid #000000; padding: 15px; border-radius: 8px;">
            <span style="font-size: 1.1rem; display: block; text-align: center; font-weight: bold; margin-bottom: 10px; color: #000;">
                ✓ ACIONAMENTO ENVIADO AO CENTRO DE OPERAÇÕES
            </span>
            <hr style="border: 0; border-top: 1px solid #000; margin-bottom: 12px;">
            
            <div style="background: #f0f0f0; padding: 10px; border-radius: 6px; margin-bottom: 15px; text-align: center; border: 1px solid #000;">
                <strong style="color: #6B6D6B; font-size: 1.1rem;">Código de Acompanhamento:</strong><br>
                <span style="font-size: 1.5rem; font-weight: bold; color: #000; letter-spacing: 1px;">#${dados.idDenuncia}</span>
            </div>

            <p style="color: #000;"><strong>Solicitante:</strong> ${nomeSolicitante}</p>
            
            <p style="color: #000;"><strong>Status:</strong> <span style="background: #f3ae2f; color: #fff; padding: 2px 6px; border-radius: 4px;">🚨 Pendente</span></p>
            <p style="color: #000;"><strong>Tipo:</strong> ${dados.tipoOcorrencia}</p>
            <p style="color: #000;"><strong>Modo:</strong> ${dados.modoViatura}</p>
            <p style="color: #000;"><strong>Endereço:</strong> ${dados.endereco}</p>
            
            <p style="color: #000; font-weight: bold; text-align: center; background: #e0e0e0; padding: 10px; border-radius: 6px; border: 1px solid #000;">
                A unidade policial foi despachada. Aguarde em local seguro.
            </p>
            
            <button class="btn-acao btn-denuncia" onclick="limparDenuncia()">
                Fazer Nova Denúncia
            </button>
            
            <button class="btn-acao btn-login" onclick="window.location.href='/login.html'">
                Voltar para Dashboard
            </button>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    const denuncialSalva = localStorage.getItem("denunciaAtiva");
    if (denuncialSalva) {
        renderizarTelaSucesso(JSON.parse(denuncialSalva));
    }
});

function limparDenuncia() {
    localStorage.removeItem("denunciaAtiva");
    location.reload();
}

async function acionarEmergencia(tipoOcorrencia) {
    const respostaSigilo = confirm("Deseja que a viatura compareça em SIGILO (sem sirenes/luzes)?");
    const modoViatura = respostaSigilo ? "EM SIGILO (Sem sirenes)" : "MODO PADRÃO (Sirenes/Giroflex ligados)";

    let dadosDenuncia = dadosUsuario ? {
        nome: dadosUsuario.nome,
        cpf: dadosUsuario.cpf,
        telefone: dadosUsuario.telefone,
        email: dadosUsuario.email,
        cep: dadosUsuario.cep,
        endereco: dadosUsuario.endereco,
        tipoOcorrencia,
        modoViatura,
        anonima: 0
    } : {
        nome: "Anônimo (Chamado de Urgência)",
        endereco: prompt("Endereço ou Ponto de referência:") || "Localização automática",
        tipoOcorrencia,
        modoViatura,
        anonima: 1
    };

    try {
        const resposta = await fetch('/api/denuncias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosDenuncia)
        });

        const dadosRetorno = await resposta.json();
        if (!resposta.ok) return alert(dadosRetorno.erro || "Erro.");

        const dadosParaSalvar = {
            idDenuncia: dadosRetorno.idDenuncia,
            endereco: dadosDenuncia.endereco,
            tipoOcorrencia: tipoOcorrencia,
            modoViatura: modoViatura,
            nomeSolicitante: dadosDenuncia.nome
        };
        localStorage.setItem("denunciaAtiva", JSON.stringify(dadosParaSalvar));

        renderizarTelaSucesso(dadosParaSalvar);

    } catch (erro) {
        alert("Erro de conexão.");
    }
}