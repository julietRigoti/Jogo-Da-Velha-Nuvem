require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const gameSocket = require('./src/sockets/gameSocket');

const PORT = process.env.PORT || 8080;

// Criando servidor HTTP e integrando com o Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// Inicializando o WebSocket
gameSocket(io);

// Iniciando o servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
