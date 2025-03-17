// index.js (servidor Express)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require("http");
const { Server } = require("socket.io");
const { Jogador, Sala, Partida, Historico } = require("./db/models"); // Importando modelos do Sequelize

const app = express();
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
app.use(cors());

// Criação de sala
io.on("connection", (socket) => {
    console.log("Novo jogador conectado!");

    // Criar sala
    socket.on("createRoom", async () => {
        try {
            console.log("Criando nova sala...");
            const room = await Sala.create({
                nome: `Sala-${socket.id}`,
            });

            activeRooms[socket.id] = room.idSala;
            socket.emit("roomCreated", room.idSala);
            socket.join(room.idSala);

            const playerSymbol = Object.keys(activeRooms).length % 2 === 0 ? "O" : "X";
            socket.emit("assignSymbol", playerSymbol);

            const player = await Jogador.create({
                nome: `Jogador-${socket.id}`,
                simbolo: playerSymbol,
                idSala: room.idSala,
            });

            io.to(room.idSala).emit("playersUpdate", await getPlayersInRoom(room.idSala));
        } catch (error) {
            console.error("Erro ao criar sala:", error);
        }
    });

    // Jogada do jogador
    socket.on("makeMove", async ({ index, symbol }) => {
        try {
            console.log(`Jogada recebida: index=${index}, symbol=${symbol}`);
            if (board[index] === null && symbol === currentPlayer) {
                board[index] = symbol;

                // Registra jogada no banco de dados (Histórico)
                await Historico.create({
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
            await Jogador.destroy({ where: { socketId: socket.id } });
            io.emit("playersUpdate", await getPlayersInRoom(activeRooms[socket.id]));
        } catch (error) {
            console.error("Erro ao desconectar jogador:", error);
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
    return await Jogador.findAll({
        where: { idSala },
        include: [{ model: Sala }],
    });
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
