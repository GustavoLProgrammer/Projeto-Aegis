let cargoAtual = "";

async function fazerLogin() { 
    const email = document.getElementById("emailUsu").value.trim();
    const senha = document.getElementById("senhaUsu").value.trim();

    if (email === "" || senha === "") {
        alert("Por favor, preencha e-mail e senha.");
        return;
    }

    try {
        const resposta = await fetch('https://projeto-aegis.onrender.com/api/login', {
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

        document.getElementById("tela-login").style.display = "none";
        document.getElementById("interface-user").style.display = "block";
        document.getElementById("span-nome").innerText = dados.nome;

        if (cargoAtual === "dev" || cargoAtual === "master") {
            document.getElementById("interface-dev").style.display = "block";
            alert("Modo Desenvolvedor Ativado!");
        }

    } catch (erro) {
        alert("Erro ao conectar com o servidor back-end.");
    }
}

function deslogar() {
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
    let nome = document.getElementById("nomeUsu").value.trim();
    let email = document.getElementById("emailUsu").value.trim();
    let senha = document.getElementById("senhaUsu").value.trim();

    if (nome === "" || email === "" || senha === "") {
        alert("Por favor, preencha todos os campos para se cadastrar.");
        return;
    }

    try {
        const resposta = await fetch('https://projeto-aegis.onrender.com/api/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
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

    } catch (erro) {
        alert("Erro ao conectar com o servidor back-end.");
    }
}

async function listarUsuarios(botao) {
    if (cargoAtual !== "dev" && cargoAtual !== "master") {
        alert("Erro: Apenas desenvolvedores ou administradores podem listar usuários.");
        return;
    }

    let divLista = document.getElementById("listaUsuarios");

    if (divLista.style.display === "block" && divLista.innerHTML !== "") {
        divLista.style.display = "none";
        if (botao) botao.innerText = "Listar Usuários";
        return;
    }

    divLista.style.display = "block";
    if (botao) botao.innerText = "Ocultar Lista";

    try {
        const resposta = await fetch('https://projeto-aegis.onrender.com/api/usuarios');
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
        const resposta = await fetch('https://projeto-aegis.onrender.com/api/usuarios/cargo', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, novoCargo: 'dev' })
        });

        const dados = await resposta.json();
        if (!resposta.ok) return alert(dados.erro);

        alert(dados.mensagem);
        document.getElementById("listaUsuarios").innerHTML = "";
        listarUsuarios();
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function rebaixarPeloEmail(email) {
    try {
        const resposta = await fetch('https://projeto-aegis.onrender.com/api/usuarios/cargo', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, novoCargo: 'usuario' })
        });

        const dados = await resposta.json();
        if (!resposta.ok) return alert(dados.erro);

        alert(dados.mensagem);
        document.getElementById("listaUsuarios").innerHTML = "";
        listarUsuarios();
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function removerPeloEmail(email) {
    if (!confirm(`Tem certeza que deseja remover o usuário com e-mail ${email}?`)) {
        return;
    }

    try {
        const resposta = await fetch(`https://projeto-aegis.onrender.com/api/usuarios/${email}`, {
            method: 'DELETE'
        });

        const dados = await resposta.json();
        if (!resposta.ok) return alert(dados.erro);

        alert(dados.mensagem);
        document.getElementById("listaUsuarios").innerHTML = "";
        listarUsuarios();
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}