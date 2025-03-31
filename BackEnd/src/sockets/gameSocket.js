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
          jogador1: { ...data.jogador },
          jogador2: null,
          tabuleiro: Array(9).fill(null),
          emAndamento: true,
        };

        await Sala.create({
          idSala: idSala,
          idJogadorCriouSala: data.jogador.idJogador,
          qtdPartidasTotal: 0,
          dataCriacao: new Date(),
        });

        await redis.set(`sala:${idSala}`, JSON.stringify(novaSala)); // Corrigido para usar o ID da sala

        socket.join(novaSala.idSala); // Adiciona o jogador à sala
        io.to(novaSala.idSala).emit("atualizarSala", novaSala);
        refreshRooms(io); // Atualiza as salas para todos os jogadores

        callback?.({
          sucesso: true,
          novaSala,
          idSala: novaSala.idSala,
          mensagem: "Sala criada com sucesso!",
        });
      } catch (error) {
        console.error("Erro ao criar sala:", error);
        callback?.({ sucesso: false, mensagem: "Erro interno ao criar sala." });
      }
    });

    // Entrar na Sala
    socket.on("entrarSala", async (data, callback) => {
      console.log("Dados recebidos no evento entrarSala:", data);
     
      try {
        const { idSala, jogador2 } = data;
    
        if (!idSala || !jogador2) {
          console.error("Dados inválidos fornecidos:", data);
          return callback?.({ sucesso: false, mensagem: "Dados inválidos fornecidos." });
        }
    
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) {
          console.error("Sala não encontrada:", idSala);
          return callback?.({ sucesso: false, mensagem: "Sala não encontrada." });
        }
    
        const sala = JSON.parse(salaJSON);
    
        if (!sala.jogador2) {
          sala.jogador2 = jogador2;
          await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        }
    
        callback?.({ sucesso: true, sala });
      } catch (error) {
        console.error("Erro ao entrar na sala:", error);
        callback?.({ sucesso: false, mensagem: "Erro ao entrar na sala." });
      }
    });

    socket.on("atualizarTabuleiro", (data) => {
      console.log("Dados recebidos do socket:", data);
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setWinner(data.winner);
      setScores(data.scores);
    });

    socket.on("atualizarSala", (sala) => {
      console.log("Dados da sala recebidos:", sala);
      const jogadorAtual =
        sala.jogador1.idJogador === jogador ? sala.jogador1 : sala.jogador2;
      console.log("Jogador atual identificado:", jogadorAtual);
      setSymbol(jogadorAtual.simbolo); // Define o símbolo do jogador
      setCurrentPlayer(sala.currentPlayer); // Atualiza o jogador atual
      console.log("Símbolo do jogador definido:", jogadorAtual.simbolo);
      console.log("Jogador atual atualizado:", sala.currentPlayer);
    });

    // Fazer Jogada
    socket.on("fazerJogada", async ({ idSala, index, symbol }, callback) => {
      console.log("Jogador autenticado no socket:", socket.user);
      console.log(
        `Recebida jogada: idSala=${idSala}, index=${index}, jogador=${socket.user?.nicknameJogador}, symbol=${symbol}`
      );
      try {
        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON)
          return callback({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (
          !sala.emAndamento ||
          sala.tabuleiro[index] !== null ||
          index < 0 ||
          index > 8 ||
          (symbol !== sala.jogador1.simbolo && symbol !== sala.jogador2.simbolo)
        ) {
          console.log("Jogada inválida:", {
            emAndamento: sala.emAndamento,
            tabuleiro: sala.tabuleiro,
            index,
            symbol,
          });
          return callback({ sucesso: false, mensagem: "Jogada inválida." });
        }

        const simboloAtual =
          sala.tabuleiro.filter((c) => c !== null).length % 2 === 0 ? "X" : "O";
        sala.tabuleiro[index] = simboloAtual;

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        console.log(
          `📢 Evento "atualizarTabuleiro" enviado para a sala ${idSala}`
        );

        io.to(idSala).emit("atualizarSala", sala);
        console.log(`📢 Evento "atualizarSala" enviado para a sala ${idSala}`);

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
