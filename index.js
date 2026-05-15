let cargoAtual = "";

function fazerLogin() { 
    const nome = document.getElementById("user-name").value;
    const cargo = document.getElementById("user-role").value;

    if (nome === "") {
        alert("Por favor, digite seu nome.");
        return;
    }

    cargoAtual = cargo;

    document.getElementById("login-container").style.display = "none";
    document.getElementById("interface-user").style.display = "block";
    document.getElementById("span-nome").innerText = nome;

    if (cargo === "dev") {
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