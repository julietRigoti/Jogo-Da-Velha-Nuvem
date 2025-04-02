const { Sala, Historico } = require("../models");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
  connectTimeout: 10000, // 10 segundos
});

// Log de conexão com o Redis
redis.on("connect", () => console.log("✅ Conectado ao Redis com sucesso."));
redis.on("error", (err) =>
  console.error("❌ Erro na conexão com o Redis:", err)
);

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
  const activeConnections = new Map(); // Mapeia jogadores para suas conexões ativas

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.error("Token não fornecido");
      return next(new Error("Token não fornecido"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔑 Usuário autenticado:", decoded);
      socket.user = decoded; // Adiciona os dados do usuário ao socket
      next();
    } catch (err) {
      console.error("Erro na autenticação JWT:", err);
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`🎮 Jogador conectado: ${socket.id}`);

    const jogador = {
      idJogador: socket.user.idJogador,
      nicknameJogador: socket.user.nicknameJogador,
    };

    // Adiciona a conexão ao mapa de conexões ativas
    if (!activeConnections.has(jogador.idJogador)) {
      activeConnections.set(jogador.idJogador, new Set());
    }
    activeConnections.get(jogador.idJogador).add(socket.id);

    await redis.set(
      `jogador:${socket.user.idJogador}`,
      JSON.stringify(jogador)
    );

    // Criar Sala
    socket.on("criarSala", async (data, callback) => {
      try {
        const idSala = Math.floor(Date.now() / 1000);
        const novaSala = {
          idSala: idSala,
          jogador1: {
            idJogador: data.jogador.idJogador,
            nicknameJogador: data.jogador.nicknameJogador,
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

        // 🔥 Atualiza a sala para todos
        atualizarSala(io, idSala);

        if (novaSala) {
          callback({ sucesso: true, idSala: novaSala.idSala });
        } else {
          callback({ sucesso: false, mensagem: "Erro ao criar a sala." });
        }
      } catch (error) {
        console.error("Erro ao criar sala:", error);
        callback?.({ sucesso: false, mensagem: "Erro interno ao criar sala." });
      }
    });

    socket.on("entrarSala", async (data, callback) => {
      try {
        const { idSala, jogador2 } = data;
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) {
          return callback?.({
            sucesso: false,
            mensagem: "Sala não encontrada.",
          });
        }

        const sala = JSON.parse(salaJSON);

        console.log("sala: ", sala);

        if (sala.jogador2.idJogador === null) {
          sala.jogador2.idJogador = jogador2.idJogador;
          sala.jogador2.nicknameJogador = jogador2.nicknameJogador;
          await redis.set(`sala:${idSala}`, JSON.stringify(sala));

          socket.join(idSala);
        } else {
          return callback?.({
            sucesso: false,
            mensagem: "Sala já está cheia.",
          });
        }

        console.log("Entrando na sala:", idSala);
        atualizarSala(io, idSala);

        callback?.({ sucesso: true, sala });
      } catch (error) {
        console.error("Erro ao entrar na sala:", error);
        callback?.({ sucesso: false, mensagem: "Erro ao entrar na sala." });
      }
    });

    // Fazer Jogada
    socket.on("fazerJogada", async ({ idSala, index, simbolo }, callback) => {
      try {
        console.debug("🔍 Recebendo jogada:", { idSala, index, simbolo });

        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) {
          console.debug("🚨 Sala não encontrada:", idSala);
          return callback?.({
            sucesso: false,
            mensagem: "Sala não encontrada.",
          });
        }

        const sala = JSON.parse(salaJSON);
        console.debug("📋 Estado atual da sala:", sala);

        // Verifica se já existe um vencedor ou se o tabuleiro está cheio
        if (sala.winner || sala.tabuleiro.every((cell) => cell !== null)) {
          console.debug("⚠️ Jogo já finalizado ou tabuleiro cheio.");
          return callback?.({
            sucesso: false,
            mensagem: "O jogo já foi finalizado.",
          });
        }

        console.debug("🔄 Verificando se é a vez do jogador:", simbolo);

        // Verifica se é a vez do jogador correto
        const isTurnoCorreto =
          (sala.jogador1.currentPlayer && simbolo === "X") ||
          (sala.jogador2.currentPlayer && simbolo === "O");

        if (!isTurnoCorreto) {
          console.debug("⛔ Jogador tentou jogar fora de sua vez:", simbolo);
          return callback?.({
            sucesso: false,
            mensagem: "Não é sua vez de jogar.",
          });
        }

        // Verifica se a jogada é válida (casa vazia)
        if (sala.tabuleiro[index] !== null) {
          console.debug("❌ Jogada inválida na posição:", index);
          return callback?.({
            sucesso: false,
            mensagem: "Jogada inválida.",
          });
        }

        // Registra a jogada no tabuleiro
        sala.tabuleiro[index] = simbolo;
        console.debug("✅ Jogada registrada no tabuleiro:", sala.tabuleiro);

        // Verifica se há um vencedor após a jogada
        const vencedor = verificarVencedor(sala.tabuleiro);
        if (vencedor) {
          sala.winner = vencedor;
          sala.emAndamento = false;
          console.debug("🏆 Vencedor encontrado:", vencedor);
        } else {
          if (simbolo === "X") {
            sala.jogador1.currentPlayer = false;
            sala.jogador2.currentPlayer = true;
          } else if (simbolo === "O") {
            sala.jogador1.currentPlayer = true;
            sala.jogador2.currentPlayer = false;
          }
        }

        // Atualiza a sala no Redis
        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        console.debug("💾 Sala atualizada no Redis:", sala);

        // Emite o estado atualizado da sala para todos os jogadores na sala
        io.to(idSala).emit("atualizarSala", sala);

        callback?.({ sucesso: true, sala });
      } catch (error) {
        console.error("❌ Erro ao fazer jogada:", error);
        callback?.({ sucesso: false, mensagem: "Erro ao processar jogada." });
      }
    });

    // Sair da Sala
    socket.on("sairSala", async ({ idSala }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON)
          return callback({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (sala.jogador1?.idJogador === jogador.idJogador)
          sala.jogador1 = null;
        else if (sala.jogador2?.idJogador === jogador.idJogador)
          sala.jogador2 = null;

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
        const salasKeys = await redis.keys("sala:*"); // Obtém todas as chaves de salas
        if (salasKeys.length === 0) {
          console.log("Nenhuma sala encontrada.");
          return callback([]); // Retorna uma lista vazia se não houver salas
        }

        const salas = await Promise.all(
          salasKeys.map(async (key) => JSON.parse(await redis.get(key))) // Converte as salas para objetos
        );

        // Filtra apenas as salas que estão ativas (com pelo menos um jogador)
        const salasAtivas = salas.filter(
          (sala) => sala && (sala.jogador1 || sala.jogador2)
        );

        console.log("Salas ativas:", salasAtivas); // Log das salas ativas
        callback(salasAtivas); // Retorna as salas ativas para o frontend
      } catch (error) {
        console.error("Erro ao buscar salas:", error);
        callback([]); // Retorna uma lista vazia em caso de erro
      }
    });

    socket.on("atualizarSala", (salaAtualizada) => {
      console.log("🔄 Atualizando sala com novos dados:", salaAtualizada);

      setGameState((prevState) => {
        const newState = {
          ...prevState,
          board: salaAtualizada.tabuleiro,
          winner: salaAtualizada.winner || null,
          currentPlayer: salaAtualizada.currentPlayer || "X",
          scores: salaAtualizada.scores || { X: 0, O: 0 },
        };
        console.log("🔄 Novo gameState após atualização:", newState);
        return newState;
      });
    });

    socket.on("recuperarSala", async ({ idSala }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) {
          return callback?.({
            sucesso: false,
            mensagem: "Sala não encontrada.",
          });
        }

        const sala = JSON.parse(salaJSON);
        console.log("sala: ", sala);
        callback?.({ sucesso: true, sala });
      } catch (error) {
        console.error("Erro ao recuperar informações da sala:", error);
        callback?.({
          sucesso: false,
          mensagem: "Erro ao recuperar informações da sala.",
        });
      }
    });

    // Atualizar Tabuleiro
    socket.on("atualizarTabuleiro", async ({ idSala, tabuleiro }, callback) => {
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) {
          return callback?.({
            sucesso: false,
            mensagem: "Sala não encontrada.",
          });
        }

        const sala = JSON.parse(salaJSON);
        sala.tabuleiro = tabuleiro;

        const vencedor = verificarVencedor(tabuleiro);
        if (vencedor) {
          sala.winner = vencedor;
          sala.emAndamento = false;
          await redis.set(`sala:${idSala}`, JSON.stringify(sala));
          atualizarSala(io, idSala);
          return callback?.({ sucesso: true, sala });
        }

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        atualizarSala(io, idSala);

        callback?.({ sucesso: true, sala });
      } catch (error) {
        console.error("Erro ao atualizar tabuleiro:", error);
        callback?.({
          sucesso: false,
          mensagem: "Erro ao atualizar tabuleiro.",
        });
      }
    });

    // Atualizar Jogador
    socket.on("atualizarJogador", async (data, callback) => {
      try {
        const jogador = data.jogador;
        await redis.set(
          `jogador:${jogador.idJogador}`,
          JSON.stringify(jogador)
        );
        callback?.({ sucesso: true });
      } catch (error) {
        console.error("Erro ao atualizar jogador:", error);
        callback?.({ sucesso: false, mensagem: "Erro ao atualizar jogador." });
      }
    });

    // Atualizar Estado do Jogo
    socket.on("atualizarEstadoJogo", async (data, callback) => {
      try {
        const { idSala, estado } = data;
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) {
          return callback?.({
            sucesso: false,
            mensagem: "Sala não encontrada.",
          });
        }

        const sala = JSON.parse(salaJSON);
        sala.estado = estado;

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        atualizarSala(io, idSala);

        callback?.({ sucesso: true, sala });
      } catch (error) {
        console.error("Erro ao atualizar estado do jogo:", error);
        callback?.({ sucesso: false, mensagem: "Erro ao atualizar estado." });
      }
    });

    // Desconectar Jogador
    socket.on("disconnect", async () => {
      console.log(`🔴 Jogador desconectado: ${socket.id}`);

      const conexoes = activeConnections.get(jogador.idJogador);
      if (conexoes) {
        conexoes.delete(socket.id);
        if (conexoes.size === 0) {
          activeConnections.delete(jogador.idJogador);
          await redis.del(`jogador:${jogador.idJogador}`);
          refreshRooms(io);
          console.log(`🗑️ Jogador removido: ${jogador.idJogador}`);
        }
      }
    });
  });

  // ===============================
  // Funções Auxiliares
  // ===============================

  async function atualizarSala(io, idSala) {
    try {
      const salaJSON = await redis.get(`sala:${idSala}`);
      if (!salaJSON) {
        console.warn(`🚨 Sala ${idSala} não encontrada no Redis.`);
        return;
      }

      const sala = JSON.parse(salaJSON);

      console.log(`🔄 Atualizando sala ${idSala}:`, sala);

      // 🔥 Emite o evento para todos os jogadores na sala
      io.to(idSala).emit("atualizarSala", sala);
    } catch (error) {
      console.error(`❌ Erro ao atualizar sala ${idSala}:`, error);
    }
  }

  async function refreshRooms(io) {
    const salasKeys = await redis.keys("sala:*");
    const salas = await Promise.all(
      salasKeys.map(async (key) => JSON.parse(await redis.get(key)))
    );
    const salasAtivas = salas.filter((sala) => sala.jogador1 || sala.jogador2);
    io.emit("atualizarSalas", salasAtivas); // Envia as salas ativas para todos os clientes
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
      if (
        tabuleiro[a] &&
        tabuleiro[a] === tabuleiro[b] &&
        tabuleiro[a] === tabuleiro[c]
      ) {
        return tabuleiro[a];
      }
    }
    return null;
  }
};
