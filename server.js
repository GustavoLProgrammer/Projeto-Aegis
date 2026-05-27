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

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao banco MySQL com sucesso!');
});

// INTEGRAÇÃO COM O PROCESSO DO MAPA MANUAL 
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
    const { nome, email, senha } = req.body;
    
    const query = "INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, 'usuario')";
    db.query(query, [nome, email, senha], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
            }
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
            cargo: usuario.cargo
        });
    });
});

app.get('/api/usuarios', (req, res) => {
    const query = "SELECT id, nome, email, cargo FROM usuarios";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
        res.json(results);
    });
});

app.put('/api/usuarios/cargo', (req , res) => {
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

const PORT = process.env.PORT || 10000;
// Rodando o servidor através do escopo HTTP do Socket.io
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

