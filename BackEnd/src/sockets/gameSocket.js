const { Sala, Jogador, Historico } = require("../models");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");

// Conexão com o Redis - Redis é um banco de dados em memória que armazena dados-chave e valores em cache para melhorar o desempenho do aplicativo em tempo real
const redis = new Redis();

const game = {
  players: {} // Armazena os jogadores conectados
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`🎮 Novo jogador conectado: ${socket.id}`);

    // Nessa parte sera criado uma lista de players que se conectaram ao servidor
    // e sera enviado para todos os clientes conectados
    const name = socket.idJogador || `Jogador ${Math.floor(Math.random() * 1000)}`;
    game.players[socket.id] = { name };
    refreshPlayers(io);
    console.log("Jogadores no server");
    console.log(game);




    // Middleware para autenticação JWT
    socket.use((packet, next) => {
      console.debug("🔍 Middleware de autenticação JWT iniciado.");
      console.debug("🔍 socket.handshake.auth:", socket.handshake.auth); // ✅ Verificar todo o objeto de autenticação

      const token = socket.handshake.auth.token;
      console.debug("🔍 Token recebido:", token);

      if (!token) {
        console.debug("⚠️ Token não fornecido.");
        return next(new Error("Token não fornecido"));
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.debug("⚠️ Erro ao verificar token:", err.message);
          return next(new Error("Token inválido"));
        }
        console.debug("✅ Token verificado com sucesso:", decoded);
        socket.user = decoded; // Armazena o usuário autenticado
        next();
      });
    });

    // Criar uma nova sala e salvar no Redis e no Banco de Dados
    socket.on("criarSala", async ({ nicknameJogador }, callback) => {
      if (!socket.user || !socket.user.idJogador) {
        console.debug("⚠️ Usuário não autenticado corretamente.");
        return callback({ sucesso: false, mensagem: "Usuário não autenticado." });
      }

      try {
        console.debug("🔍 Evento criarSala recebido:", { nicknameJogador });

        const jogador = {
          idJogador: socket.user.idJogador,
          nickname: nicknameJogador,
        };
        const idSala = Math.floor(Date.now() / 1000); // Timestamp em segundos

        console.debug("🔍 Dados do jogador:", jogador);
        console.debug("🔍 ID da sala gerado:", idSala);

        if (!jogador) {
          console.debug("⚠️ Jogador não encontrado.");
          return callback({
            sucesso: false,
            mensagem: "Jogador não encontrado.",
          });
        }

        // Salvar a sala no banco de dados
        await Sala.create({
          idSala,
          idJogadorCriouSala: jogador.idJogador,
          qtdPartidasTotal: 0,
          dataCriacao: new Date(),
        });

        console.debug("✅ Sala salva no banco de dados:", { idSala });

        // Armazenar no Redis
        const novaSala = {
          jogador1: {
            id: jogador.idJogador,
            nickname: nicknameJogador,
            simbolo: "X",
          },
          jogador2: null,
          tabuleiro: Array(9).fill(null),
          emAndamento: true,
        };

        await redis.set(`sala:${idSala}`, JSON.stringify(novaSala));

        console.debug("✅ Sala armazenada no Redis:", novaSala);

        socket.join(idSala);
        console.log(`🟢 Sala criada: ${idSala}`);
        callback({ sucesso: true, idSala, idJogador: jogador.idJogador });
      } catch (error) {
        console.error("Erro ao criar sala:", error);
        callback({ sucesso: false, mensagem: "Erro interno ao criar sala." });
      }
    });

    // Entrar em uma sala
    socket.on("entrarSala", async ({ idSala, nicknameJogador }, callback) => {
      if (!socket.user || !socket.user.idJogador) {
        console.debug("⚠️ Usuário não autenticado corretamente.");
        return callback({ sucesso: false, mensagem: "Usuário não autenticado." });
      }

      try {
        console.debug("🔍 Evento entrarSala recebido:", {
          idSala,
          nicknameJogador,
        });

        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) {
          console.debug("⚠️ Sala não encontrada:", { idSala });
          return callback({ sucesso: false, mensagem: "Sala não encontrada." });
        }

        const sala = JSON.parse(salaJSON);
        console.debug("🔍 Sala encontrada:", sala);

        const jogador = {
          idJogador: socket.user.idJogador,
          nickname: nicknameJogador,
        };
        console.debug("🔍 Dados do jogador:", jogador);

        if (
          sala.jogador1.id === jogador.idJogador ||
          (sala.jogador2 && sala.jogador2.id === jogador.idJogador)
        ) {
          console.debug("⚠️ Jogador já está na sala:", { jogador });
          return callback({
            sucesso: false,
            mensagem: "Você já está na sala.",
          });
        }

        if (sala.jogador2) {
          console.debug("⚠️ Sala já está cheia:", { idSala });
          return callback({ sucesso: false, mensagem: "Sala já está cheia." });
        }

        sala.jogador2 = {
          id: jogador.idJogador,
          nickname: nicknameJogador,
          simbolo: "O",
        };
        console.debug("✅ Jogador adicionado à sala:", sala.jogador2);

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        console.debug("✅ Sala atualizada no Redis:", sala);

        socket.join(idSala);
        console.debug(`🟢 Jogador entrou na sala: ${idSala}`);

        io.to(idSala).emit("atualizarSala", sala);
        callback({ sucesso: true, idSala });
      } catch (error) {
        console.error("Erro ao entrar na sala:", error);
        callback({
          sucesso: false,
          mensagem: "Erro interno ao entrar na sala.",
        });
      }
    });

    // Fazer uma jogada
    socket.on("fazerJogada", async ({ idSala, index, nicknameJogador }) => {
      try {
        console.debug("🔍 Evento fazerJogada recebido:", { idSala, index, nicknameJogador });

        const salaJSON = await redis.get(`sala:${idSala}`);
        if (!salaJSON) {
          console.debug("⚠️ Sala não encontrada no Redis:", { idSala });
          return;
        }

        const sala = JSON.parse(salaJSON);
        console.debug("🔍 Sala carregada do Redis:", sala);

        if (!sala || !sala.emAndamento) {
          console.debug("⚠️ Sala inválida ou jogo já encerrado:", { sala });
          return;
        }

        const jogadorAtual =
          nicknameJogador === sala.jogador1.nickname
            ? sala.jogador1
            : sala.jogador2;
        console.debug("🔍 Jogador atual identificado:", jogadorAtual);

        const simboloAtual =
          sala.tabuleiro.filter((c) => c !== null).length % 2 === 0 ? "X" : "O";
        console.debug("🔍 Símbolo esperado para a jogada:", simboloAtual);

        if (
          sala.tabuleiro[index] !== null ||
          jogadorAtual.simbolo !== simboloAtual
        ) {
          console.debug(
            "⚠️ Jogada inválida. Verifique se a posição está ocupada ou se é a vez do jogador:",
            { index, simboloAtual, tabuleiro: sala.tabuleiro }
          );
          return;
        }

        sala.tabuleiro[index] = jogadorAtual.simbolo;
        console.debug("✅ Jogada registrada no tabuleiro:", sala.tabuleiro);

        await redis.set(`sala:${idSala}`, JSON.stringify(sala));
        console.debug("✅ Sala atualizada no Redis após a jogada:", sala);

        io.to(idSala).emit("atualizarTabuleiro", sala.tabuleiro);
        console.debug("📤 Tabuleiro atualizado enviado para a sala:", idSala);

        // Verificar o vencedor ou empate
        const vencedor = verificarVencedor(sala.tabuleiro);
        if (vencedor || sala.tabuleiro.every((c) => c !== null)) {
          sala.emAndamento = false;
          console.debug(
            vencedor
              ? `🏆 Vencedor identificado: ${vencedor}`
              : "🤝 Jogo terminou em empate."
          );

          await Historico.create({
            idSala,
            idJogador1: sala.jogador1.id,
            idJogador2: sala.jogador2.id,
            pontuacaoJogador1: vencedor === sala.jogador1.simbolo ? 1 : 0,
            pontuacaoJogador2: vencedor === sala.jogador2.simbolo ? 1 : 0,
          });
          console.debug("✅ Histórico do jogo salvo no banco de dados.");

          await redis.del(`sala:${idSala}`); // Limpar a sala após o término
          console.debug("🗑️ Sala removida do Redis após o término do jogo.");

          io.to(idSala).emit("fimDeJogo", {
            vencedor: vencedor ? jogadorAtual.nickname : null,
          });
          console.debug("📤 Evento fimDeJogo enviado para a sala:", idSala);
        }
      } catch (error) {
        console.error("Erro ao processar jogada:", error);
      }
    });




    // =====================================================================
    socket.on("LeaveRoom", async () => {
      try {
        const roomId = game.players[socket.id].room;
        if (!roomId) return;

        console.debug("🔍 Evento LeaveRoom recebido:", { roomId });

        // Atualizar o estado da sala no Redis
        const salaJSON = await redis.get(`sala:${roomId}`);
        if (!salaJSON) return;

        const sala = JSON.parse(salaJSON);
        if (sala.jogador1.id === socket.user.idJogador) {
          sala.jogador1 = null;
        } else if (sala.jogador2?.id === socket.user.idJogador) {
          sala.jogador2 = null;
        }

        // Atualizar no Redis
        await redis.set(`sala:${roomId}`, JSON.stringify(sala));

        // Sair da sala
        socket.leave(roomId);
        game.players[socket.id].room = null;

        console.log(`🔴 Jogador saiu da sala: ${roomId}`);

        // Atualizar a lista de jogadores e salas
        refreshPlayers();
        refreshRooms();
      } catch (error) {
        console.error("Erro ao sair da sala:", error);
        socket.emit("erro", { mensagem: "Erro ao sair da sala." });
      }
    });

    socket.on("JoinRoom", async (roomId) => {
      try {
        console.debug("🔍 Evento JoinRoom recebido:", { roomId });

        // Verificar se a sala existe no Redis
        const salaJSON = await redis.get(`sala:${roomId}`);
        if (!salaJSON) {
          console.debug("⚠️ Sala não encontrada:", { roomId });
          return socket.emit("erro", { mensagem: "Sala não encontrada." });
        }

        const sala = JSON.parse(salaJSON);
        if (sala.jogador1.id === socket.user.idJogador || sala.jogador2?.id === socket.user.idJogador) {
          return socket.emit("erro", { mensagem: "Você já está nessa sala." });
        }

        // Verificar se a sala tem espaço para um segundo jogador
        if (sala.jogador2) {
          console.debug("⚠️ Sala já está cheia:", { roomId });
          return socket.emit("erro", { mensagem: "Sala já está cheia." });
        }

        // Adicionar jogador à sala
        const jogador = {
          idJogador: socket.user.idJogador,
          nickname: game.players[socket.id].name,
        };

        sala.jogador2 = {
          id: jogador.idJogador,
          nickname: jogador.nickname,
          simbolo: "O",
        };

        // Atualizar a sala no Redis
        await redis.set(`sala:${roomId}`, JSON.stringify(sala));

        // Adicionar o jogador à sala
        socket.join(roomId);
        game.players[socket.id].room = roomId;

        console.log(`🟢 Jogador entrou na sala: ${roomId}`);
        io.to(roomId).emit("atualizarSala", sala); // Enviar atualização para a sala
        sendMessage(game.players[socket.id], 'entrou numa sala');

        refreshPlayers();
        refreshRooms();
      } catch (error) {
        console.error("Erro ao entrar na sala:", error);
        socket.emit("erro", { mensagem: "Erro ao entrar na sala." });
      }
    });

    // Jogador desconectado
    socket.on("disconnect", async () => {
      console.log(`🔴 Jogador desconectado: ${socket.id}`);

      const salasAtivas = await redis.keys("sala:*");
      for (const salaKey of salasAtivas) {
        const sala = JSON.parse(await redis.get(salaKey));
        if (sala.jogador1?.id === socket.user.idJogador) {
          sala.jogador1.desconectado = true;
        } else if (sala.jogador2?.id === socket.user.idJogador) {
          sala.jogador2.desconectado = true;
        }
        await redis.set(salaKey, JSON.stringify(sala));
      }
      delete game.players[socket.id];
      refreshPlayers();
    });
  });


  // Função auxiliar para verificar o vencedor
  function verificarVencedor(tabuleiro) {
    const combinacoesVencedoras = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Linhas
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Colunas
      [0, 4, 8],
      [2, 4, 6], // Diagonais
    ];

    for (const [a, b, c] of combinacoesVencedoras) {
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

const refreshPlayers = async (io) => {
  try {
    // Recupere todos os jogadores conectados a partir do Redis
    const playersKeys = await redis.keys("player:*"); // Exemplo de chave de jogador no Redis
    const players = [];

    for (let key of playersKeys) {
      const player = JSON.parse(await redis.get(key)); // Supondo que o jogador esteja armazenado no Redis
      players.push(player);
    }

    // Enviar a lista de jogadores para todos os clientes conectados
    io.emit('PlayersRefresh', game.players);
    console.debug("🔄 Lista de jogadores atualizada e enviada.");
  } catch (error) {
    console.error("Erro ao atualizar jogadores:", error);
  }
};

const refreshRooms = async () => {
  try {
    // Recupere todas as salas ativas do Redis
    const roomKeys = await redis.keys("sala:*"); // Exemplo de chave de sala no Redis
    const rooms = [];

    for (let key of roomKeys) {
      const room = JSON.parse(await redis.get(key)); // Recupera o estado da sala
      rooms.push(room);
    }

    // Enviar a lista de salas para todos os clientes conectados
    io.emit('RoomsRefresh', rooms);
    console.debug("🔄 Lista de salas atualizada e enviada.");
  } catch (error) {
    console.error("Erro ao atualizar salas:", error);
  }
};

