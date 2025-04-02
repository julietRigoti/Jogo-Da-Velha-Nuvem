const express = require("express");
const cors = require("cors"); // Importa o middleware de CORS
const http = require("http");
const { Server } = require("socket.io");
const gameSocket = require("./src/sockets/gameSocket");
const userControler = require("./src/app");

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require("dotenv").config({ path: envFile });

console.log("🚀 Ambiente:", process.env.NODE_ENV); // Verifica se o ambiente está corret
console.log("URL do banco de dados:", process.env.DATABASE_URL); // Verifica a URL do banco de dados

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://jogo-da-velha-nuvem.vercel.app",
];

// Configuração do CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Origem não permitida pelo CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

// Criar as rotas
app.use("/", userControler);

const PORT = process.env.PORT || 8080;
// Criando servidor HTTP e integrando com o Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Permite múltiplas origens
    methods: ["GET", "POST", "PUT", "OPTIONS"],
  },
});

// Inicializando o WebSocket
gameSocket(io);

// Iniciando o servidor
server.listen(process.env.PORT || PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${process.env.PORT || PORT}`);
});
