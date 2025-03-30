const { Sala, Historico } = require("../models");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");
const autenticarJWT = require("../middlewares/auth");

const redis  = new Redis(process.env.REDIS_URL, {
  tls: { rejectUnauthorized: false } // Para evitar erro de SSL no Railway
});

// Log de conexão com o Redis
redis.on("connect", () => console.log("✅ Conectado ao Redis com sucesso."));
redis.on("error", (err) => console.error("❌ Erro na conexão com o Redis:", err));

// ===============================
// Inicialização
// ===============================
(async () => {
  try {
    const salasKeys = await redis.keys("sala:*");
    for (const key of salasKeys) {
      await redis.del(key);
      console.log(`🗑️ Sala removida: ${key}`);
    }
    console.log("🚮 Todas as salas foram apagadas ao iniciar o servidor.");
  } catch (error) {
    console.error("Erro ao apagar as salas do Redis:", error);
  }
})();

module.exports = (io) => {
  io.use(autenticarJWT);

  io.on("connection", async (socket) => {
    console.log(`🎮 Jogador conectado: ${socket.id}`);

    const jogador = {
      idJogador: socket.user.idJogador,
      nicknameJogador: socket.user.nicknameJogador,
    };

    await redis.set(`jogador:${socket.user.idJogador}`, JSON.stringify(jogador));
    refreshPlayers(io);

    // ===============================
    // Eventos do Socket
    // ===============================

    // Criar Sala
    socket.on("criarSala", async (data, callback) => {
      try {
        const idSala = Math.floor(Date.now() / 1000);
        const novaSala = {
          idSala,
          jogador1: data.jogador,
          jogador2: null,
          tabuleiro: Array(9).fill(null),
          emAndamento: true,
        };

        await redis.set(`sala:${idSala}`, JSON.stringify(novaSala));
        await Sala.create({
          idSala,
          idJogadorCriouSala: data.jogador.idJogador,
          qtdPartidasTotal: 0,
          dataCriacao: new Date(),
        });

        socket.join(idSala);
        console.log(`🟢 Sala criada: ${idSala}`);
        refreshRooms(io);

        callback?.({ sucesso: true, idSala, mensagem: "Sala criada com sucesso!" });
      } catch (error) {
        console.error("Erro ao criar sala:", error);
        callback?.({ sucesso: false, mensagem: "Erro interno ao criar sala." });
      }
    });

    // Entrar na Sala
    socket.on("entrarSala", async ({ idSala }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) return callback({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (sala.jogador2) return callback({ sucesso: false, mensagem: "Sala cheia." });

        sala.jogador2 = jogador;
        await redis.set(`sala:${idSala}`, JSON.stringify(sala));

        socket.join(idSala);
        io.to(idSala).emit("atualizarSala", sala);
        refreshRooms(io);

        callback({ sucesso: true, idSala });
      } catch (error) {
        console.error("Erro ao entrar na sala:", error);
        callback({ sucesso: false, mensagem: "Erro ao entrar na sala." });
      }
    });

    // Fazer Jogada
    socket.on("fazerJogada", async ({ idSala, index }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) return callback({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (!sala.emAndamento || sala.tabuleiro[index] !== null) {
          return callback({ sucesso: false, mensagem: "Jogada inválida." });
        }

        const simboloAtual = sala.tabuleiro.filter((c) => c !== null).length % 2 === 0 ? "X" : "O";
        sala.tabuleiro[index] = simboloAtual;

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        io.to(idSala).emit("atualizarTabuleiro", sala.tabuleiro);

        const vencedor = verificarVencedor(sala.tabuleiro);
        if (vencedor || sala.tabuleiro.every((c) => c !== null)) {
          sala.emAndamento = false;
          await redis.del(`sala:${idSala}`);

          await Historico.create({
            idSala,
            idJogador1: sala.jogador1.idJogador,
            idJogador2: sala.jogador2.idJogador,
            pontuacaoJogador1: vencedor === "X" ? 1 : 0,
            pontuacaoJogador2: vencedor === "O" ? 1 : 0,
          });

          io.to(idSala).emit("fimDeJogo", { vencedor });
        }

        callback({ sucesso: true });
      } catch (error) {
        console.error("Erro ao fazer jogada:", error);
        callback({ sucesso: false, mensagem: "Erro ao processar jogada." });
      }
    });

    // Sair da Sala
    socket.on("sairSala", async ({ idSala }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) return callback({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (sala.jogador1?.idJogador === jogador.idJogador) sala.jogador1 = null;
        else if (sala.jogador2?.idJogador === jogador.idJogador) sala.jogador2 = null;

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        socket.leave(idSala);
        refreshRooms(io);

        callback({ sucesso: true });
      } catch (error) {
        console.error("Erro ao sair da sala:", error);
        callback({ sucesso: false, mensagem: "Erro ao sair da sala." });
      }
    });

    // Buscar Salas
    socket.on("pegarSalas", async (callback) => {
      try {
        const salasKeys = await redis.keys("sala:*");
        const salas = await Promise.all(
          salasKeys.map(async (key) => JSON.parse(await redis.get(key)))
        );

        const salasDisponiveis = salas.filter((sala) => sala && sala.jogador2 === null);
        callback?.(salasDisponiveis);
      } catch (error) {
        console.error("Erro ao buscar salas:", error);
        callback?.([]);
      }
    });

    // Desconectar Jogador
    socket.on("disconnect", async () => {
      console.log(`🔴 Jogador desconectado: ${socket.id}`);
      await redis.del(`jogador:${jogador.idJogador}`);
      refreshRooms(io);
    });
  });

  // ===============================
  // Funções Auxiliares
  // ===============================

  async function refreshPlayers(io) {
    const playersKeys = await redis.keys("jogador:*");
    const players = await Promise.all(
      playersKeys.map(async (key) => JSON.parse(await redis.get(key)))
    );
    io.emit("PlayersRefresh", players);
  }

  async function refreshRooms(io) {
    const salasKeys = await redis.keys("sala:*");
    const salas = await Promise.all(
      salasKeys.map(async (key) => JSON.parse(await redis.get(key)))
    );
    io.emit("updateRooms", salas.filter((sala) => sala.jogador1 || sala.jogador2));
  }

  function verificarVencedor(tabuleiro) {
    const linhas = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of linhas) {
      if (tabuleiro[a] && tabuleiro[a] === tabuleiro[b] && tabuleiro[a] === tabuleiro[c]) {
        return tabuleiro[a];
      }
    }
    return null;
  }
};
