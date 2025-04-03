const { Sala, Historico } = require("../models");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL);

// ========== 🔌 Logs de Conexão Redis ==========
redis.on("connect", () => console.log("✅ Conectado ao Redis com sucesso."));
redis.on("error", (err) => console.error("❌ Erro na conexão com o Redis:", err));

// ========== 🧹 Limpeza de salas ao iniciar ==========
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

// ========== 🚀 Função principal exportada ==========
module.exports = (io) => {
  const activeConnections = new Map(); // Map de jogadorID → Set(socketID)

  // ========== 🔐 Autenticação com JWT ==========
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Token não fornecido"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔑 Usuário autenticado:", decoded);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error("Erro na autenticação JWT:", err);
      next(new Error("Token inválido"));
    }
  });

  // ========== 📡 Conexão do jogador ==========
  io.on("connection", async (socket) => {
    console.log(`🎮 Jogador conectado: ${socket.id}`);

    const jogador = {
      idJogador: socket.user.idJogador,
      nicknameJogador: socket.user.nicknameJogador,
    };

    // ➕ Armazena conexão
    if (!activeConnections.has(jogador.idJogador)) {
      activeConnections.set(jogador.idJogador, new Set());
    }
    activeConnections.get(jogador.idJogador).add(socket.id);

    await redis.set(`jogador:${jogador.idJogador}`, JSON.stringify(jogador));

    // ========== 🧱 Criar Sala ==========
    socket.on("criarSala", async (data, callback) => {
      try {
        const idSala = Math.floor(Date.now() / 1000);
        const novaSala = {
          idSala,
          jogador1: {
            ...data.jogador,
            simbolo: "X",
            currentPlayer: "X",
          },
          jogador2: {
            idJogador: null,
            nicknameJogador: null,
            simbolo: "O",
            currentPlayer: "O",
          },
          tabuleiro: Array(9).fill(null),
          emAndamento: true,
        };

        await redis.set(`sala:${idSala}`, JSON.stringify(novaSala));
        socket.join(idSala);
        await atualizarSala(io, idSala);

        callback?.({ sucesso: true, idSala });
      } catch (err) {
        console.error("Erro ao criar sala:", err);
        callback?.({ sucesso: false, mensagem: "Erro interno ao criar sala." });
      }
    });

    // ========== 🚪 Entrar em Sala ==========
    socket.on("entrarSala", async ({ idSala, jogador2 }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) return callback?.({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (sala.jogador2.idJogador !== null) {
          return callback?.({ sucesso: false, mensagem: "Sala já está cheia." });
        }

        sala.jogador2.idJogador = jogador2.idJogador;
        sala.jogador2.nicknameJogador = jogador2.nicknameJogador;

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        socket.join(idSala);
        console.log(`🧩 Socket ${socket.id} entrou na sala ${idSala}`);

        await atualizarSala(io, idSala);
        callback?.({ sucesso: true, sala });
      } catch (err) {
        console.error("Erro ao entrar na sala:", err);
        callback?.({ sucesso: false, mensagem: "Erro ao entrar na sala." });
      }
    });

    // ========== 🎯 Fazer Jogada ==========
    socket.on("fazerJogada", async ({ idSala, index, simbolo }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) return callback?.({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);

        if (sala.winner || sala.tabuleiro.every(cell => cell !== null)) {
          return callback?.({ sucesso: false, mensagem: "O jogo já foi finalizado." });
        }

        const isTurnoCorreto =
          (sala.jogador1.currentPlayer && simbolo === "X") ||
          (sala.jogador2.currentPlayer && simbolo === "O");

        if (!isTurnoCorreto) {
          return callback?.({ sucesso: false, mensagem: "Não é sua vez de jogar." });
        }

        if (sala.tabuleiro[index] !== null) {
          return callback?.({ sucesso: false, mensagem: "Jogada inválida." });
        }

        sala.tabuleiro[index] = simbolo;

        const vencedor = verificarVencedor(sala.tabuleiro);
        if (vencedor) {
          sala.winner = vencedor;
          sala.emAndamento = false;
        } else {
          sala.jogador1.currentPlayer = simbolo === "O";
          sala.jogador2.currentPlayer = simbolo === "X";
        }

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        await atualizarSala(io, idSala);

        callback?.({ sucesso: true, sala });
      } catch (err) {
        console.error("Erro ao fazer jogada:", err);
        callback?.({ sucesso: false, mensagem: "Erro ao processar jogada." });
      }
    });

    // ========== 🔁 Recuperar Sala ==========
    socket.on("recuperarSala", async ({ idSala }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) return callback?.({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        callback?.({ sucesso: true, sala });
      } catch (err) {
        console.error("Erro ao recuperar sala:", err);
        callback?.({ sucesso: false, mensagem: "Erro ao recuperar sala." });
      }
    });

    // ========== 🔍 Buscar Salas ==========
    socket.on("pegarSalas", async (callback) => {
      try {
        const keys = await redis.keys("sala:*");
        const salas = await Promise.all(keys.map(key => redis.get(key).then(JSON.parse)));
        const ativas = salas.filter(s => s.jogador1 || s.jogador2);
        callback(ativas);
      } catch (err) {
        console.error("Erro ao buscar salas:", err);
        callback([]);
      }
    });

    // ========== 📴 Sair da Sala ==========
    socket.on("sairSala", async ({ idSala }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) return callback?.({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (sala.jogador1?.idJogador === jogador.idJogador) sala.jogador1 = null;
        if (sala.jogador2?.idJogador === jogador.idJogador) sala.jogador2 = null;

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        socket.leave(idSala);
        await refreshRooms(io);

        callback?.({ sucesso: true });
      } catch (err) {
        console.error("Erro ao sair da sala:", err);
        callback?.({ sucesso: false, mensagem: "Erro ao sair da sala." });
      }
    });

    // ========== ❌ Desconexão ==========
    socket.on("disconnect", async () => {
      console.log(`🔴 Jogador desconectado: ${socket.id}`);
      const conexoes = activeConnections.get(jogador.idJogador);
      if (conexoes) {
        conexoes.delete(socket.id);
        if (conexoes.size === 0) {
          activeConnections.delete(jogador.idJogador);
          await redis.del(`jogador:${jogador.idJogador}`);
          await refreshRooms(io);
          console.log(`🗑️ Jogador removido: ${jogador.idJogador}`);
        }
      }
    });
  });

  // ========== 📤 Funções auxiliares ==========

  async function atualizarSala(io, idSala) {
    try {
      const salaJSON = await redis.get(`sala:${idSala}`);
      if (!salaJSON) return;
      const sala = JSON.parse(salaJSON);
      io.to(idSala).emit("atualizarSala", sala);
    } catch (err) {
      console.error("Erro ao atualizar sala:", err);
    }
  }

  async function refreshRooms(io) {
    const keys = await redis.keys("sala:*");
    const salas = await Promise.all(keys.map(key => redis.get(key).then(JSON.parse)));
    const ativas = salas.filter(s => s.jogador1 || s.jogador2);
    io.emit("atualizarSalas", ativas);
  }

  function verificarVencedor(tabuleiro) {
    const linhas = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of linhas) {
      if (tabuleiro[a] && tabuleiro[a] === tabuleiro[b] && tabuleiro[a] === tabuleiro[c]) {
        return tabuleiro[a];
      }
    }
    return null;
  }
};
