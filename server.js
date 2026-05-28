require('dotenv').config();

const express = require('express');

const mysql = require('mysql2');

const cors = require('cors');

const path = require('path');



// MÓDULOS ADICIONADOS PARA O MAPA E PROCESSO PYTHON

const http = require('http');

const { Server } = require('socket.io');

const { spawn } = require('child_process');



const app = express();

app.use(express.json());

app.use(cors());



app.use((req, res, next) => {

    console.log(`[${req.method}] ${req.url}`);

    next();

});



// Servidor integrado HTTP + Socket.io para comunicação em tempo real

const server = http.createServer(app);

const io = new Server(server);



app.use(express.static(path.join(__dirname, 'public')));



// Rota criada para abrir o painel de GPS no navegador

app.get('/central/gps', (req, res) => {

    res.sendFile(path.join(__dirname, 'central_monitoramento', 'painel_gps.html'));

});



// ROTA DO SMARTWATCH AEGIS 

app.post('/api/smartwatch/alerta', async (req, res) => {

    const { tipo, opcao_ajuda, sigilo, gps } = req.body; 

    

    if (!tipo || !gps) {

        return res.status(400).json({ erro: 'Dados obrigatórios do alerta estão ausentes.' });

    }



    console.log(`Alerta Smartwatch! Tipo: ${tipo} | Opção: ${opcao_ajuda} | Sigilo: ${sigilo} | GPS: ${gps}`);



    let enderecoReal = "Endereço indisponível";

    const [lat, lng] = gps.split(',');



    try {

        // Consulta a API Nominatim para traduzir as coordenadas GPS em Nome da Rua e Número

        const urlFetch = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.trim()}&lon=${lng.trim()}`;

        const response = await fetch(urlFetch, { headers: { 'User-Agent': 'Aegis-Smartwatch-App' } });

        const data = await response.json();

        enderecoReal = data.display_name || "Endereço não localizado";

    } catch (err) {

        console.error("Erro ao traduzir GPS em endereço:", err);

    }



    // Executa o processador Python 

    const pythonProcess = spawn('python3', [

        path.join(__dirname, 'backend_python', 'processador_denuncia.py'),

        tipo,

        `${opcao_ajuda} (Sigilo: ${sigilo})`,

        gps,

        enderecoReal

    ]);



    pythonProcess.stdout.on('data', (result) => {

        console.log(`Retorno do Python (Smartwatch): ${result.toString()}`);

    });



    // Envia o ponto traduzido em tempo real para plotar no mapa da central

    io.emit('fixar_sos_no_mapa', {

        tipo: tipo,

        categoria: `${opcao_ajuda} - Sigilo: ${sigilo}`,

        lat: parseFloat(lat),

        lng: parseFloat(lng),

        endereco: enderecoReal,

        horario: new Date().toLocaleTimeString('pt-BR')

    });



    res.status(200).json({ mensagem: 'Alerta processado com sucesso e viatura acionada!' });

});



// Substituído para mysql.createPool para gerenciar conexões automaticamente na nuvem

const db = mysql.createPool({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_DATABASE,

    waitForConnections: true,

    connectionLimit: 3,

    queueLimit: 0

});



// Teste de conexão inicial do Pool

db.getConnection((err, connection) => {

    if (err) {

        console.error('Erro ao conectar ao Pool do MySQL na nuvem:', err);

        return;

    }

    console.log('Conectado ao pool do MySQL com sucesso!');

    connection.release(); // Libera a conexão de volta para o pool

});

io.on('connection', (socket) => {

    socket.on('novo_pedido_ajuda', (data) => {

        const gpsString = `${data.lat}, ${data.lng}`;



        const pythonProcess = spawn('python3', [

            path.join(__dirname, 'backend_python', 'processador_denuncia.py'),

            'SOS',

            'Segurança',

            gpsString,

            data.endereco

        ]);



        pythonProcess.stdout.on('data', (result) => {

            console.log(`Retorno do Python (Manual): ${result.toString()}`);

        });



        io.emit('fixar_sos_no_mapa', data);

    });

});



app.post('/api/cadastro', (req, res) => {

    const { nome, email, senha, cpf, telefone, cep, endereco } = req.body;



    const query = "INSERT INTO usuarios (nome, email, senha, cpf, telefone, cep, endereco, cargo) VALUES (?, ?, ?, ?, ?, ?, ?, 'usuario')";

    db.query(query, [nome, email, senha, cpf, telefone, cep, endereco], (err, result) => {

        if (err) {

            if (err.code === 'ER_DUP_ENTRY') {

                return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });

            }

            console.error('Erro ao inserir no MySQL:', err);

            return res.status(500).json({ erro: 'Erro ao salvar no banco.' });

        }

        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });

    });

});



app.post('/api/login', (req, res) => {

    const { email, senha } = req.body;



    const query = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";

    db.query(query, [email, senha], (err, results) => {

        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });



        if (results.length === 0) {

            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

        }



        const usuario = results[0];



        res.json({

            nome: usuario.nome,

            email: usuario.email,

            cargo: usuario.cargo,

            cpf: usuario.cpf,

            telefone: usuario.telefone,

            cep: usuario.cep,

            endereco: usuario.endereco

        });

    });

});



app.post('/api/denuncias', (req, res) => {

    const { nome, cpf, telefone, email, cep, endereco, tipoOcorrencia, modoViatura, anonima } = req.body;

    

    const v_nome = nome || 'Anônimo';

    const v_cpf = cpf || null;

    const v_telefone = telefone || null;

    const v_email = email || null;

    const v_cep = (cep && cep !== 'Não informado') ? cep : null;

    const v_endereco = endereco || 'Localização não informada';

    const v_tipo = tipoOcorrencia || 'Emergência Geral';

    const v_modo = modoViatura || 'Silencioso';

    const v_anonima = anonima !== undefined ? anonima : 1;



    const query = `

        INSERT INTO denuncias 

        (nome, cpf, telefone, email, cep, endereco, tipo_ocorrencia, modo_viatura, anonima, status) 

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')

    `;



    db.query(

        query,

        [v_nome, v_cpf, v_telefone, v_email, v_cep, v_endereco, v_tipo, v_modo, v_anonima],

        (err, result) => {

            if (err) {

                console.error('ERRO REAL NO TERMINAL DO VS CODE:', err);

                return res.status(500).json({ erro: 'Erro interno ao salvar o chamado de emergência.' });

            }



            res.status(201).json({

                mensagem: 'Denúncia registrada e viatura despachada!',

                idDenuncia: result.insertId

            });

        }

    );

});



app.get('/api/denuncias', (req, res) => {

    const query = "SELECT * FROM denuncias ORDER BY id DESC";

    db.query(query, (err, results) => {

        if (err) return res.status(500).json({ erro: 'Erro ao listar denúncias.' });

        res.json(results);

    });

});



app.put('/api/denuncias/:id/status', (req, res) => {

    const id = req.params.id;

    const { novoStatus, observacoes } = req.body;



    const query = "UPDATE denuncias SET status = ?, observacoes = ? WHERE id = ?";

    db.query(query, [novoStatus, observacoes, id], (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).json({ erro: 'Erro ao atualizar dados da ocorrência.' });

        }

        res.json({ mensagem: 'Ocorrência atualizada com sucesso!' });

    });

});



app.get('/api/denuncias/:id/mensagens', (req, res) => {

    const denunciaId = req.params.id;



    const query = "SELECT * FROM mensagens_denuncia WHERE denuncia_id = ? ORDER BY data_envio ASC";

    db.query(query, [denunciaId], (err, results) => {

        if (err) {

            console.error('Erro ao buscar mensagens:', err);

            return res.status(500).json({ erro: "Erro ao carregar mensagens." });

        }

        res.json(results);

    });

});



app.post('/api/denuncias/:id/mensagens', (req, res) => {

    const denunciaId = req.params.id;

    const { remetente, texto } = req.body;



    if (!texto || texto.trim() === "") {

        return res.status(400).json({ erro: "O texto da mensagem não pode ser vazio." });

    }



    const query = "INSERT INTO mensagens_denuncia (denuncia_id, remetente, texto) VALUES (?, ?, ?)";

    db.query(query, [denunciaId, remetente, texto], (err, result) => {

        if (err) {

            console.error('Erro ao salvar mensagem:', err);

            return res.status(500).json({ erro: "Erro ao enviar mensagem." });

        }

        res.status(201).json({ mensagem: "Mensagem enviada com sucesso!" });

    });

});



app.get('/api/denuncias/:id', (req, res) => {

    const id = req.params.id;

    const solicitante = req.query.solicitante;



    const query = "SELECT * FROM denuncias WHERE id = ?";

    db.query(query, [id], (err, results) => {

        if (err) return res.status(500).json({ erro: 'Erro ao buscar o protocolo.' });

        if (results.length === 0) return res.status(404).json({ erro: 'Protocolo não encontrado.' });



        const denuncia = results[0];



        if (denuncia.anonima === 1) {

            return res.json(denuncia);

        }



        if (solicitante && solicitante !== "anonimo" && denuncia.cpf === solicitante) {

            return res.json(denuncia);

        }



        return res.status(403).json({ erro: 'Acesso negado. Esta ocorrência pertence a outro usuário.' });

    });

});



app.get('/api/usuarios', (req, res) => {

    const query = "SELECT id, nome, email, cargo FROM usuarios";

    db.query(query, (err, results) => {

        if (err) return res.status(500).json({ erro: 'Erro ao buscar usuários.' });

        res.json(results);

    });

});



app.put('/api/usuarios/cargo', (req, res) => {

    const { email, novoCargo } = req.body;



    const query = "UPDATE usuarios SET cargo = ? WHERE email = ?";

    db.query(query, [novoCargo, email], (err, results) => {

        if (err) return res.status(500).json({ erro: 'Erro ao atualizar cargo.' });

        res.json({ mensagem: `Usuário atualizado para ${novoCargo} com sucesso!` });

    });

});



app.delete('/api/usuarios/:email', (req, res) => {

    const email = req.params.email;



    const query = "DELETE FROM usuarios WHERE email = ?";

    db.query(query, [email], (err, results) => {

        if (err) return res.status(500).json({ erro: 'Erro ao remover usuário.' });

        res.json({ mensagem: 'Usuário removido com sucesso!' });

    });

});



app.get(/.*/, (req, res) => {

    res.sendFile(path.join(__dirname, 'public', 'index.html'));

});



const { exec } = require('child_process'); // Certifique-se de que isso está disponível ou adicione essa linha



const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {

    console.log(`Servidor rodando com sucesso!`);

    console.log(`Acesse localmente em: http://localhost:${PORT}`);

    

    // Abre o navegador automaticamente apenas quando rodando no seu computador

    if (process.env.NODE_ENV !== 'production') {

        exec(`start http://localhost:${PORT}`);

    }

});

