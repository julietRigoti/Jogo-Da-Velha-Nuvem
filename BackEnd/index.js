// index.js (servidor Express)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require("http");
const {Server} = require("socket.io");
const {db} = require("./db/models"); // Importando modelos do Sequelize
const userControler = require('./controllers/users');

const app = express();
app.use(express.json());
app.use(cors());

// Criar as rotas
app.use('/', userControler);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "OPTIONS"],
    }
});

// Variáveis do jogo
let board = Array(9).fill(null);
let currentPlayer = "X";
let scores = { X: 0, O: 0 };
let activeRooms = {}; // Armazenar salas ativas

app.use(express.static("public"));

// Criação de sala
io.on("connection", (socket) => {
    console.log("Novo jogador conectado!");

    // Jogada do jogador
    socket.on("makeMove", async ({ index, symbol }) => {
        try {
            console.log(`Jogada recebida: index=${index}, symbol=${symbol}`);
            if (board[index] === null && symbol === currentPlayer) {
                board[index] = symbol;

                // Registra jogada no banco de dados (Histórico)
                await db.Historico.create({
                    idJogador: socket.id,
                    movimento: index,
                    idPartida: activeRooms[socket.id],
                });

                // Verifica vencedor
                const winner = checkWinner();
                if (winner) {
                    scores[winner]++;
                    io.emit("gameOver", winner);
                    resetBoard();
                } else if (!board.includes(null)) {
                    io.emit("gameOver", "Empate");
                    resetBoard();
                } else {
                    currentPlayer = currentPlayer === "X" ? "O" : "X";
                }

                io.emit("updateBoard", board);
                io.emit("updateScores", scores);
                io.emit("updateCurrentPlayer", currentPlayer);
            }
        } catch (error) {
            console.error("Erro ao fazer jogada:", error);
        }
    });

    // Reiniciar jogo
    socket.on("restartGame", async () => {
        resetBoard();
        io.emit("updateBoard", board);
    });

    // Desconexão
    socket.on("disconnect", async () => {
        try {
            console.log("Jogador desconectado:", socket.id);
        } catch (error) {
            console.error("Erro ao desconectar jogador:", error);
        }
    });

    socket.on('createRoom', async (data) => {
        const { nicknameJogador, emailJogador, idJogador, passwordJogador } = data;
      
        if (!nicknameJogador || !emailJogador || !idJogador || !passwordJogador) {
          return socket.emit("error", { message: "Dados do jogador são obrigatórios." });
        }
      
        try {
          // Criação do jogador no banco de dados
          const jogador = await db.Jogador.create({
            nicknameJogador,
            emailJogador,
            idJogador,
            passwordJogador,
          });
      
          // Criação da sala com o jogador associado
          const idSala = await criarSala(jogador);
      
          // Emitir para o front-end a confirmação da criação da sala
          socket.emit("roomCreated", idSala);
        } catch (err) {
          console.error(err);
          socket.emit("error", { message: err.message });
        }
      });
});

// Função para verificar vencedor
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];  // Retorna o vencedor (X ou O)
        }
    }
    return null;
}

// Reinicia o tabuleiro
function resetBoard() {
    board = Array(9).fill(null);
    currentPlayer = "X";
    // Resetar pontuação no início de cada jogo
    scores = { X: 0, O: 0 };
}

// Função para obter jogadores de uma sala
async function getPlayersInRoom(idSala) {
    return await db.Jogador.findAll({
        where: { idSala },
        include: [{ model: Sala }],
    });
}

// Inicia o servidor HTTP com WebSocket
server.listen(8080, () => {
    console.log('Servidor WebSocket em execução na porta 8080');
});

module.exports = io;