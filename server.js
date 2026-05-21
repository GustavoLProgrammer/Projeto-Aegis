require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});