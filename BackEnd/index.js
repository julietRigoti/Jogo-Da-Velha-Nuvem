require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importa o middleware de CORS
const http = require('http');
const { Server } = require('socket.io');
const gameSocket = require('./src/sockets/gameSocket');
const userControler = require('./src/app');

const app = express();

// Configuração do CORS
app.use(cors({
    origin: "https://jogo-da-velha-nuvem.vercel.app", // Permite apenas o front-end acessar o back-end
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// Criar as rotas
app.use('/', userControler);

const PORT = process.env.PORT || 8081; // Alterado para usar a porta 8081

// Criando servidor HTTP e integrando com o Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://jogo-da-velha-nuvem.vercel.app",
        methods: ["GET", "POST", "PUT", "OPTIONS"],
    }
});

// Inicializando o WebSocket
gameSocket(io);

// Iniciando o servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
