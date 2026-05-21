# Projeto Aegis 🛡️

Sistema completo de autenticação e gerenciamento de usuários com controle de níveis de acesso dinâmicos (`usuario`, `dev` e `master` intocável), integrado a um banco de dados relacional.

---

## 🔌 Requisito Fundamental para a Interface (Front-end)

Para conseguir abrir e rodar o site corretamente no navegador, é **obrigatório** usar a extensão **Live Server** no VS Code. 

### Como instalar a extensão:
1. No menu lateral esquerdo do VS Code, clique no ícone de **Extensions** (quatro quadradinhos) ou aperte `Ctrl + Shift + X`.
2. Na barra de pesquisa, digite: **Live Server**.
3. Encontre a extensão criada por *Ritwick Dey* e clique no botão verde **Install**.

---

## 🚀 Guia Passo a Passo: Preparando o Código

Siga estes comandos para preparar as pastas e instalar as bibliotecas no computador (seu ou do seu colega).

### 1. Abrindo o projeto
1. Abra o **VS Code**.
2. Vá no menu superior em `File` > `Open Folder` (Abrir Pasta) e selecione a pasta do projeto.
3. Abra o terminal integrado do VS Code pressionando as teclas `Ctrl + '` (ou indo em `Terminal` > `New Terminal`).

### 2. Instalação das Bibliotecas via Terminal
Com o terminal aberto, digite e execute o comando abaixo para instalar todas as dependências do projeto de uma vez só:

```bash
npm install express mysql2 dotenv cors
💡 Nota: Se você acabou de baixar o código do GitHub e a pasta node_modules não estiver lá, esse comando lê o arquivo package.json e baixa tudo o que o servidor precisa para funcionar!

🗄️ Gerenciamento do Banco de Dados (Duas Opções)
Você pode apresentar o projeto usando o banco de dados rodando na internet ou instalado direto na máquina. Escolha uma das duas opções abaixo:

🌟 OPÇÃO 1: Banco de Dados 100% ONLINE (Recomendado - Sem Instalar Nada)
Use esta opção se for apresentar no notebook do seu colega e não quiser baixar ou instalar o MySQL na máquina dele. Tudo funciona direto pelo navegador.

Acesse o site Clever Cloud e faça login na sua conta.

No painel, vá em Create > an add-on > selecione MySQL > escolha o Plano Dev (Gratuito).

Na raiz do seu projeto no VS Code, crie um arquivo chamado exatamente .env e coloque as credenciais que a Clever Cloud gerou para você:

Snippet de código
DB_HOST=seu_host_da_clever_cloud.cleverapps.io
DB_USER=seu_usuario_gerado
DB_PASSWORD=sua_senha_longa_gerada
DB_DATABASE=seu_nome_de_banco_gerado
DB_PORT=3306
PORT=3000
Como ver os dados online na hora de mostrar pro professor:
No painel da Clever Cloud, clique em cima do seu banco de dados criado.

No menu lateral esquerdo, clique no botão phpMyAdmin.

Uma aba vai se abrir no navegador mostrando a tabela usuarios. Basta clicar nela para o professor ver os e-mails e cargos cadastrados em tempo real, sem precisar de nenhum programa instalado.

💻 OPÇÃO 2: Banco de Dados LOCAL (Instalado na Máquina)
Use esta opção se você for rodar o projeto no seu próprio notebook ou se o computador de teste precisar do ambiente do MySQL completo instalado.

🛠️ Passo a Passo de Download e Instalação do MySQL:
Baixar o Instalador: Acesse a página oficial de downloads MySQL Installer para Windows.

Escolher a versão: Clique no botão azul de download da versão completa (geralmente a segunda opção da página, que possui cerca de 200MB+).

Ignorar login: Na tela seguinte, clique no link de baixo que diz: "No thanks, just start my download." para baixar direto.

Instalando (Muito Importante): * Abra o instalador e escolha o tipo de instalação Developer Default ou Full.

Avance pelas telas deixando os padrões. Quando chegar na tela de Accounts and Roles, defina uma senha forte para o usuário administrador principal (root) e anote ela. Você usará essa senha para tudo.

Prossiga até o final para concluir a instalação do MySQL Server e do aplicativo visual MySQL Workbench.

⚙️ O que fazer antes de rodar os comandos no Workbench:
Abra o programa MySQL Workbench que foi instalado no seu computador.

Na tela inicial, clique na caixinha cinza chamada Local Instance MySQL80 (que representa o seu servidor local).

Digite a senha que você criou durante a instalação para conseguir se conectar.

Criada a conexão com o servidor, abra uma nova aba de queries clicando no ícone do arquivo SQL com um + no topo esquerdo (ou aperte Ctrl + T).

Antes de criar as tabelas, execute o comando abaixo isolado para criar o banco de dados do projeto:

SQL
CREATE DATABASE aegis;
Agora, na raiz do projeto no VS Code, configure seu arquivo .env local refletindo exatamente os seus dados:

Snippet de código
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_definida_na_instalacao
DB_DATABASE=aegis
DB_PORT=3306
PORT=3000
📜 Script SQL de Inicialização (Para a Nuvem ou Local)
Abra o seu gerenciador de banco de dados (seja a página do phpMyAdmin na nuvem ou o MySQL Workbench local dentro do banco aegis selecionado) e execute este script para criar as tabelas e o administrador do sistema:

SQL
-- 1. Cria a tabela de usuários com e-mail único
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) DEFAULT 'usuario'
);

-- 2. Insere o Administrador Master Principal com ID 1 fixo
INSERT INTO usuarios (nome, email, senha, cargo)
VALUES ('Admin', 'admin@aegis.com', 'admin123', 'master');

-- 3. Mostra os dados na tela para conferência
SELECT * FROM usuarios;
🏃 Como Inicializar o Sistema para a Apresentação
Siga esta ordem exata na hora de mostrar o projeto funcionando:

Passo 1: Iniciar o Servidor Back-end (Node.js)
No terminal do VS Code, digite e aperte Enter:

Bash
node server.js
O que observar: O terminal deve exibir mensagens confirmando que o servidor está de pé na porta 3000 e que o banco de dados conectou com sucesso. Não feche esse terminal!

Passo 2: Iniciar a Interface do Site (Front-end)
Na árvore de arquivos do VS Code, clique no arquivo login.html.

Clique com o botão direito do mouse em cima do código do login.html e selecione a opção Open with Live Server.

O navegador vai abrir o site automaticamente.

Passo 3: Fazendo o Teste de Login Master
Para mostrar as travas de segurança e o modo desenvolvedor rodando, use os dados do admin:

E-mail: admin@aegis.com

Senha: admin123

Entre no sistema, clique in Listar Usuários e mostre para o professor que o usuário Admin tem o cargo em roxo e exibe o texto "Master Intocável", impedindo qualquer remoção ou alteração acidental!