let cargoAtual = "";

function atualizarTextoPermissao(cargo) {
    const textoPermissao = document.getElementById("texto-permissao");
    if (textoPermissao) {
        if (cargo === "dev" || cargo === "master") {
            textoPermissao.innerHTML = "🛡️ Você está logado no <strong>Modo de Desenvolvedor e Monitoramento</strong>.";
        } else {
            textoPermissao.innerHTML = "Você está logado na área de visualização pública.";
        }
    }
}

async function fazerLogin() { 
    const email = document.getElementById("emailUsu").value.trim();
    const senha = document.getElementById("senhaUsu").value.trim();

    if (email === "" || senha === "") {
        alert("Por favor, preencha e-mail e senha.");
        return;
    }

    try {
        const resposta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro);
            return;
        }

        cargoAtual = dados.cargo;
        localStorage.setItem("usuarioLogado", JSON.stringify(dados));

        document.getElementById("tela-login").style.display = "none";
        
        document.getElementById("interface-user").style.display = "block";
        document.getElementById("span-nome").innerText = dados.nome;

        atualizarTextoPermissao(cargoAtual);

        if (cargoAtual === "dev" || cargoAtual === "master") {
            document.getElementById("interface-dev").style.display = "block";
            alert("Modo Desenvolvedor Ativado!");
            listarDenuncias(); 
        } else {
            atualizarTituloDashboard(dados.nome);
        }

    } catch (erro) {
        alert("Erro ao conectar com o servidor back-end.");
    }
}

window.onload = function() {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    
    const telaLogin = document.getElementById("tela-login");
    const interfaceUser = document.getElementById("interface-user");
    const spanNome = document.getElementById("span-nome");
    const interfaceDev = document.getElementById("interface-dev");

    if (usuarioSalvo) {
        const dados = JSON.parse(usuarioSalvo);
        cargoAtual = dados.cargo;

        if (telaLogin) telaLogin.style.display = "none";
        if (interfaceUser) interfaceUser.style.display = "block";
        if (spanNome) spanNome.innerText = dados.nome;

        atualizarTextoPermissao(cargoAtual);

        if (cargoAtual === "dev" || cargoAtual === "master") {
            if (interfaceDev) interfaceDev.style.display = "block";
            listarDenuncias(); 
        } else {
            atualizarTituloDashboard(dados.nome);
        }
    } else {
        if (telaLogin) telaLogin.style.display = "block";
        if (interfaceUser) interfaceUser.style.display = "none";
    }
};

function deslogar() {
    localStorage.removeItem("usuarioLogado");
    location.reload();
}

function acaoRestrita() {
    if (cargoAtual === "dev" || cargoAtual === "master") {
        alert("Acesso autorizado: Alterando configurações do sistema...");
    } else {
        alert("Erro: Área restrita a desenvolvedores.");
    }
}

async function cadastrarUsuario() {
    // Agora que o formulário tem o ID "formCadastro", esta linha vai funcionar!
    const form = document.getElementById("formCadastro");
    
    // O navegador vai ler os inputs, travar o envio se estiver vazio e mostrar os alertas visuais
    if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
    }

    let nome = document.getElementById("nomeUsu").value.trim();
    let email = document.getElementById("emailUsu").value.trim();
    let senha = document.getElementById("senhaUsu").value.trim();
    let cpf = document.getElementById("cpfUsu").value.trim();
    let telefone = document.getElementById("telUsu").value.trim();
    let cep = document.getElementById("cepUsu").value.trim();
    let endereco = document.getElementById("endUsu").value.trim();

    if (nome === "" || email === "" || senha === "" || cpf === "" || telefone === "" || cep === "" || endereco === "") {
        alert("Por favor, preencha todos os campos para se cadastrar.");
        return;
    }

    try {
        const resposta = await fetch('/api/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, cpf, telefone, cep, endereco })
        });
        
        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro);
            return;
        }

        alert(dados.mensagem);
        window.location.href = "login.html";

        document.getElementById("nomeUsu").value = "";
        document.getElementById("emailUsu").value = "";
        document.getElementById("senhaUsu").value = "";
        document.getElementById("cpfUsu").value = "";
        document.getElementById("telUsu").value = "";
        document.getElementById("cepUsu").value = "";
        document.getElementById("endUsu").value = "";

    } catch (erro) {
        alert("Erro ao conectar com o servidor back-end.");
    }
}

async function listarUsuarios(botao, focarAtualizacao = false) {
    if (cargoAtual !== "dev" && cargoAtual !== "master") {
        alert("Erro: Apenas desenvolvedores ou administradores podem listar usuários.");
        return;
    }

    let divLista = document.getElementById("listaUsuarios");

    if (!focarAtualizacao && divLista.style.display === "block" && divLista.innerHTML !== "") {
        divLista.style.display = "none";
        if (botao) botao.innerText = "Listar Usuários";
        return;
    }

    divLista.style.display = "block";
    if (botao) botao.innerText = "Ocultar Lista";

    try {
        const resposta = await fetch('/api/usuarios');
        const listaUsuario = await resposta.json();

        if (!resposta.ok) {
            divLista.innerHTML = "<p>Erro ao carregar usuários.</p>";
            return;
        }

        if (listaUsuario.length === 0) {
            divLista.innerHTML = "<p>Nenhum usuário encontrado.</p>";
            return;
        }

        let estruturaHtml = `
        <table border="1" style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background-color: #ddd; color: black;">
                    <th style="padding: 8px;">Nome</th>
                    <th style="padding: 8px;">E-mail</th>
                    <th style="padding: 8px;">Cargo</th>
                    <th style="padding: 8px;">Ações</th>
                </tr>
            </thead>
            <tbody>
        `;

        listaUsuario.forEach(usuario => {
            let corCargo = "blue"; 
            if (usuario.cargo === "dev") corCargo = "green";
            if (usuario.cargo === "master") corCargo = "purple";

            let botaoAcao = "";

            if (usuario.cargo === "master") {
                botaoAcao = `<span style="color: #777; font-weight: bold; font-style: italic;">Master</span>`;
            } else {
                if (usuario.cargo === "usuario") {
                    botaoAcao = `<button onclick="promoverPeloEmail('${usuario.email}')" style="background-color: green; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-right: 5px;">Promover</button>`;
                } else {
                    botaoAcao = `<button onclick="rebaixarPeloEmail('${usuario.email}')" style="background-color: orange; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-right: 5px;">Rebaixar</button>`;
                }

                botaoAcao += `<button onclick="removerPeloEmail('${usuario.email}')" style="background-color: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">Remover</button>`;
            }

            estruturaHtml += `
            <tr style="background-color: #fff; color: black">
                <td style="padding: 8px;">${usuario.nome}</td>
                <td style="padding: 8px;">${usuario.email}</td>
                <td style="padding: 8px; color: ${corCargo}; font-weight: bold;">${usuario.cargo}</td>
                <td style="padding: 8px;">${botaoAcao}</td>
            </tr>
            `;
        });

        estruturaHtml += `
            </tbody>
        </table>
        `;

        divLista.innerHTML = estruturaHtml;

    } catch (erro) {
        alert("Erro ao conectar com o servidor para listar usuários.");
    }
}

async function promoverPeloEmail(email) {
    try {
        const resposta = await fetch('/api/usuarios/cargo', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, novoCargo: 'dev' })
        });

        const dados = await resposta.json();
        if (!resposta.ok) return alert(dados.erro);

        alert(dados.mensagem);
        listarUsuarios(null, true); 
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function rebaixarPeloEmail(email) {
    try {
        const resposta = await fetch('/api/usuarios/cargo', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, novoCargo: 'usuario' })
        });

        const dados = await resposta.json();
        if (!resposta.ok) return alert(dados.erro);

        alert(dados.mensagem);
        listarUsuarios(null, true);
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function removerPeloEmail(email) {
    if (!confirm(`Tem certeza que deseja remover o usuário com e-mail ${email}?`)) {
        return;
    }

    try {
        const resposta = await fetch(`/api/usuarios/${email}`, {
            method: 'DELETE'
        });

        const dados = await resposta.json();
        if (!resposta.ok) return alert(dados.erro);

        alert(dados.mensagem);
        listarUsuarios(null, true);
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function salvarAtualizacaoDev(id) {
    const novoStatus = document.getElementById(`status-${id}`).value;
    const observacoes = document.getElementById(`obs-${id}`).value.trim();

    try {
        const resposta = await fetch(`/api/denuncias/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novoStatus, observacoes })
        });

        const dados = await resposta.json();
        if (!resposta.ok) return alert(dados.erro);

        alert(`Ocorrência #${id} atualizada com sucesso!`);
        listarDenuncias();
        
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function listarDenuncias() {
    if (cargoAtual !== "dev" && cargoAtual !== "master") {
        alert("Erro: Acesso restrito a desenvolvedores ou administradores.");
        return;
    }

    const divListaDenuncias = document.getElementById("listaDenuncias");

    try {
        const resposta = await fetch('/api/denuncias');
        const listaDenuncias = await resposta.json();

        if (!resposta.ok) {
            divListaDenuncias.innerHTML = "<p>Erro ao carregar o painel de denúncias.</p>";
            return;
        }

        if (listaDenuncias.length === 0) {
            divListaDenuncias.innerHTML = "<p>Nenhum chamado de emergência registrado no momento.</p>";
            return;
        }

        let estruturaHtml = `
        <table border="1" style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 10px; color: black;">
            <thead>
                <tr style="background-color: #ddd;">
                    <th style="padding: 8px;">Protocolo</th>
                    <th>Vítima</th>
                    <th>Tipo de Ocorrência</th>
                    <th>Endereço / Localização</th>
                    <th>Aproximação</th>
                    <th>Status Operacional</th>
                    <th>Atualizações / Chat</th> 
                    <th>Ações</th> 
                </tr>
            </thead>
            <tbody>
        `;

        listaDenuncias.forEach(denuncia => {
            const tagAnonimo = denuncia.anonima === 1 ? ' <span class="badge-anonimo">ANÔNIMO</span>' : '';
            const obsAtual = denuncia.observacoes || "";

            estruturaHtml += `
            <tr style="background-color: #fff;">
                <td style="padding: 8px;"><strong>#${denuncia.id}</strong></td>
                <td>${denuncia.nome}${tagAnonimo}<br><small style="color: #555;">CPF: ${denuncia.cpf}</small></td>
                <td><span style="color: #e63946; font-weight: bold;">${denuncia.tipo_ocorrencia}</span></td>
                <td>${denuncia.endereco}</td>
                <td><small>${denuncia.modo_viatura}</small></td>
                <td>
                    <select id="status-${denuncia.id}" class="status-select">
                        <option value="Pendente" ${denuncia.status === 'Pendente' ? 'selected' : ''}>🚨 Pendente</option>
                        <option value="Em Andamento" ${denuncia.status === 'Em Andamento' ? 'selected' : ''}>🚔 Em Andamento</option>
                        <option value="Atendido" ${denuncia.status === 'Atendido' ? 'selected' : ''}>✅ Atendido</option>
                    </select>
                </td>
                <td style="padding: 10px; min-width: 250px;">
                    <textarea id="obs-${denuncia.id}" placeholder="Notas da viatura..." style="width: 100%; min-height: 40px; padding: 4px; resize: vertical; margin-bottom: 8px;">${obsAtual}</textarea>
                    
                    <div style="background: #f4f4f6; border: 1px solid #ccc; border-radius: 4px; padding: 5px;">
                        <div id="chat-dev-container-${denuncia.id}" style="height: 100px; overflow-y: auto; background: #fff; padding: 4px; font-size: 0.85rem; margin-bottom: 5px; border: 1px solid #ddd;"></div>
                        <div style="display: flex; gap: 4px;">
                            <input type="text" id="input-msg-dev-${denuncia.id}" placeholder="Responder vítima..." onkeydown="if(event.key === 'Enter') enviarMensagemChat(${denuncia.id}, 'input-msg-dev-${denuncia.id}', 'chat-dev-container-${denuncia.id}', 'dev')" style="flex: 1; padding: 4px; font-size: 0.85rem; border: 1px solid #ccc; border-radius: 4px;">
                            <button type="button" onclick="enviarMensagemChat(${denuncia.id}, 'input-msg-dev-${denuncia.id}', 'chat-dev-container-${denuncia.id}', 'dev')" style="background: #e63946; color: white; border: none; padding: 4px 8px; font-size: 0.85rem; cursor: pointer; border-radius: 4px;">Enviar</button>
                        </div>
                    </div>
                </td>
                <td>
                    <button onclick="salvarAtualizacaoDev(${denuncia.id})" style="background-color: #3a86ff; color: white; border: none; padding: 6px 12px; cursor: pointer; font-weight: bold;">Salvar</button>
                </td>
            </tr>
            `;
        });

        estruturaHtml += `
            </tbody>
        </table>
        `;

        divListaDenuncias.innerHTML = estruturaHtml;

        if (window.intervalosChatDev) {
            window.intervalosChatDev.forEach(idIntervalo => clearInterval(idIntervalo));
        }
        window.intervalosChatDev = [];

        listaDenuncias.forEach(denuncia => {
            carregarChat(denuncia.id, `chat-dev-container-${denuncia.id}`, 'dev');
            
            let idIntervalo = setInterval(() => {
                carregarChat(denuncia.id, `chat-dev-container-${denuncia.id}`, 'dev');
            }, 3000);
            
            window.intervalosChatDev.push(idIntervalo);
        });

    } catch (erro) {
        alert("Erro ao conectar com o servidor para monitorar denúncias.");
    }
}

async function atualizarStatusDenuncia(id, novoStatus) {
    try {
        const reply = await fetch(`/api/denuncias/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novoStatus })
        });

        const dados = await reply.json();
        if (!reply.ok) return alert(dados.erro);

        alert(`Ocorrência #${id} updated to: ${novoStatus}`);
        
    } catch (erro) {
        alert("Erro ao conectar com o servidor para atualizar o status.");
    }
}

function atualizarTituloDashboard(nomeUsuario) {
    const tituloLista = document.getElementById("titulo-lista");
    if (tituloLista) {
        if (nomeUsuario) {
            tituloLista.innerText = `Ocorrências de: ${nomeUsuario}`;
        } else {
            tituloLista.innerText = "Resultado da Busca por Protocolo";
        }
    }
}

async function buscarPorProtocolo() {
    const idProtocolo = document.getElementById("numeroProtocolo").value.trim();

    if (idProtocolo === "") {
        alert("Por favor, informe o número do protocolo.");
        return;
    }

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const cpfSolicitante = usuarioLogado ? usuarioLogado.cpf : "anonimo";

    try {
        const resposta = await fetch(`/api/denuncias/${idProtocolo}?solicitante=${cpfSolicitante}`);
        
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
                    <td><span class="status-badge ${classeStatus}">${iconeStatus}${ocorrencia.status}</span></td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 25px; padding: 15px; background: rgba(255,255,255,0.05); border-left: 4px solid #3a86ff; border-radius: 4px; text-align: left;">
            <strong style="color: #3a86ff; display: block; margin-bottom: 8px; font-size: 0.95rem; text-transform: uppercase;">💬 Notas de Atualização e Despacho:</strong>
            <p style="font-size: 1rem; line-height: 1.5; color: #e0e0e5; font-style: italic;">"${mensagemObservacao}"</p>
        </div>

        <div class="chat-box" style="background: #141417; border: 1px solid #26262b; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: left;">
            <h3 style="color: white; font-size: 1.1rem; margin-bottom: 10px;">💬 Conversa com a Central Aegis</h3>
            <div id="chat-vitima-container" style="height: 180px; overflow-y: auto; background: #0a0a0c; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #26262b;"></div>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="input-msg-vitima" placeholder="Digite sua resposta..." onkeydown="if(event.key === 'Enter') enviarMensagemChat(${ocorrencia.id}, 'input-msg-vitima', 'chat-vitima-container', 'vitima')" style="flex: 1; padding: 10px; background: #0a0a0c; border: 1px solid #26262b; color: white; border-radius: 6px;">
                <button onclick="enviarMensagemChat(${ocorrencia.id}, 'input-msg-vitima', 'chat-vitima-container', 'vitima')" style="background: #3a86ff; color: white; border: none; padding: 0 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">Enviar</button>
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
            const classeBalao = msg.remetente === 'dev' ? 'msg-dev' : 'msg-vitima';
            
            const nomeExibicao = msg.remetente === 'dev' ? '🛡️ Suporte/Dev' : `👤 ${nomeDoUsuario}`;

            return `
                <div class="${classeBalao}">
                    <small>${nomeExibicao}</small>
                    <div>
                        ${msg.texto}
                    </div>
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