let cargoAtual = "";

function fazerLogin() { 
    const email = document.getElementById("emailUsu").value.trim();
    const senha = document.getElementById("senhaUsu").value.trim();

    if (email === "" || senha === "") {
        alert("Por favor, preencha e-mail e senha.");
        return;
    }

    let listaUsuario = localStorage.getItem("usuarios_aegis");

    listaUsuario = JSON.parse(listaUsuario);

    if (listaUsuario == null) {
        alert("Nenhum usuário cadastrado. Por favor, cadastre-se primeiro.");
        return;
    }

    let usuarioAchado = listaUsuario.find(u => u.email === email && u.senha === senha);

    if (usuarioAchado === undefined) {
        alert("Usuário não encontrado. Por favor, cadastre-se primeiro.");
        return;
    }

    cargoAtual = usuarioAchado.cargo;

    document.getElementById("tela-login").style.display = "none";
    document.getElementById("interface-user").style.display = "block";
    document.getElementById("span-nome").innerText = usuarioAchado.nome;

    if (cargoAtual === "dev") {
        document.getElementById("interface-dev").style.display = "block";
        alert("Modo Desenvolvedor Ativado!");
    }
}

function deslogar() {
    location.reload();
}

function acaoRestrita() {
    if (cargoAtual === "dev") {
        alert("Acesso autorizado: Alterando configurações do sistema...");
    } else {
        alert("Erro: Área restrita a desenvolvedores.");
    }
}

function cadastrarUsuario() {
    let nome = document.getElementById("nomeUsu").value;
    let email= document.getElementById("emailUsu").value;
    let senha = document.getElementById("senhaUsu").value;

    if (nome === "" || email === "" || senha === "") {
        alert("Por favor, preencha todos os campos para se cadastrar.");
        return;
    }

    let listaUsuario = localStorage.getItem("usuarios_aegis");

    if (listaUsuario == null) {
        listaUsuario = [
        {nome: "Admin", email: "admin@aegis.com", senha: "admin123", cargo: "dev"}
        ];
    } else {
        listaUsuario = JSON.parse(listaUsuario);
    }

    let novoUsuario = {
        nome: nome,
        email: email,
        senha: senha,
        cargo: "usuario"
    };

    listaUsuario.push(novoUsuario);
    localStorage.setItem("usuarios_aegis", JSON.stringify(listaUsuario));
    alert("Usuário cadastrado com sucesso!");
    window.location.href = "login.html";

    document.getElementById("nomeUsu").value = "";
    document.getElementById("emailUsu").value = "";
    document.getElementById("senhaUsu").value = "";
}


function listarUsuarios(botao) {
    if (cargoAtual !== "dev") {
        alert("Erro: Apenas desenvolvedores podem listar usuários.");
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

    let listaUsuario = localStorage.getItem("usuarios_aegis");
    listaUsuario = JSON.parse(listaUsuario);

    if (listaUsuario == null || listaUsuario.length === 0) {
        document.getElementById("listaUsuarios").innerHTML = "<p>Nenhum usuário encontrado.</p>";
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
    ` ;

    listaUsuario.forEach(usuario => {
        let corCargo = usuario.cargo === "dev" ? "green" : "blue";
        let botaoAcao = "";

        if (usuario.email === "admin@aegis.com") {
            botaoAcao = `<span>Master</span>`;
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

    document.getElementById("listaUsuarios").innerHTML = estruturaHtml;
}

function promoverPeloEmail(email) {
    let listaUsuario = JSON.parse(localStorage.getItem("usuarios_aegis"));
    let usuarioEncontrado = listaUsuario.find(u => u.email === email);

    if (usuarioEncontrado) {
        usuarioEncontrado.cargo = "dev";
        localStorage.setItem("usuarios_aegis", JSON.stringify(listaUsuario));
        alert(`Usuário ${usuarioEncontrado.nome} promovido a Desenvolvedor com sucesso!`);

        document.getElementById("listaUsuarios").innerHTML = "";
        listarUsuarios();
    }
}

function rebaixarPeloEmail(email) {
    let listaUsuario = JSON.parse(localStorage.getItem("usuarios_aegis"));
    let usuarioEncontrado = listaUsuario.find(u => u.email === email);

    if (usuarioEncontrado) {
        usuarioEncontrado.cargo = "usuario";
        localStorage.setItem("usuarios_aegis", JSON.stringify(listaUsuario));
        alert(`Usuário ${usuarioEncontrado.nome} rebaixado a Usuário com sucesso!`);

        document.getElementById("listaUsuarios").innerHTML = "";
        listarUsuarios();
    }
}

function removerPeloEmail(email) {
    if (!confirm(`Tem certeza que deseja remover o usuário com e-mail ${email}?`)) {
        return;
    }

    let listaUsuario = JSON.parse(localStorage.getItem("usuarios_aegis"));

    let listaAtualizada = listaUsuario.filter(u => u.email !== email);

    localStorage.setItem("usuarios_aegis", JSON.stringify(listaAtualizada));
    alert("Usuário removido com sucesso!");

    document.getElementById("listaUsuarios").innerHTML = "";
    listarUsuarios();
}