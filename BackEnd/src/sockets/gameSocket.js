const { Sala, Jogador, Historico } = require("../models");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");
const autenticarJWT = require("../middlewares/auth"); // Middleware de autenticação JWT

const redis = new Redis();
const game = { players: {} }; // Armazena jogadores conectados


// ===============================
// Limpar salas ao iniciar o servidor
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


// ===============================
// 🔒 Middleware de autenticação JWT
// ===============================

module.exports = (io) => {
  io.use(autenticarJWT); // Aplica autenticação para todas as conexões

  io.on("connection", async (socket) => {
    console.log(`🎮 Jogador conectado: ${socket.id}`);

    const jogador = {
      idJogador: socket.user.idJogador,
      nickname: socket.user.nickname,
    };

    game.players[socket.id] = jogador;
    await redis.set(`player:${socket.user.idJogador}`, JSON.stringify(jogador));
    refreshPlayers(io);

    // ===============================
    // 🏠 Criar uma nova sala
    // ===============================
    socket.on("criarSala", async (data, callback) => {
      try {
        const jogador = data.jogador; // Dados do jogador enviados pelo cliente
        const idSala = Math.floor(Date.now() / 1000); // Gera um ID único para a sala

        const novaSala = {
          idSala,
          jogador1: jogador,
          jogador2: null,
          tabuleiro: Array(9).fill(null),
          emAndamento: true,
        };

        // Salva a sala no Redis
        await redis.set(`sala:${idSala}`, JSON.stringify(novaSala));

        // Salva a sala no banco de dados
        await Sala.create({
          idSala,
          idJogadorCriouSala: jogador.idJogador,
          qtdPartidasTotal: 0,
          dataCriacao: new Date(),
        });

        // Adiciona o jogador à sala
        socket.join(idSala);
        console.log(`🟢 Sala criada: ${idSala}`);

        // Atualiza a lista de salas para todos os clientes
        refreshRooms(io);

        // Retorna sucesso para o cliente
        if (typeof callback === "function") {
          callback({ sucesso: true, idSala });
        }
      } catch (error) {
        console.error("Erro ao criar sala:", error);

        // Retorna erro para o cliente
        if (typeof callback === "function") {
          callback({ sucesso: false, mensagem: "Erro interno ao criar sala." });
        }
      }
    });

    // ===============================
    // 🔄 Entrar em uma sala
    // ===============================
    socket.on("entrarSala", async ({ idSala }, callback) => {
      try {
        const salaJSON = await redis.get(idSala);
        if (!salaJSON)
          return callback({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (sala.jogador2)
          return callback({ sucesso: false, mensagem: "Sala cheia." });

        sala.jogador2 = jogador;
        await redis.set(`sala:${idSala}`, JSON.stringify(novaSala));

        socket.join(idSala);
        console.log(`🟢 Jogador entrou na sala: ${idSala}`);
        io.to(idSala).emit("atualizarSala", sala);
        callback({ sucesso: true, idSala });

        refreshRooms(io);
      } catch (error) {
        console.error("Erro ao entrar na sala:", error);
        callback({ sucesso: false, mensagem: "Erro ao entrar na sala." });
      }
    });

    // ===============================
    // 🎲 Fazer uma jogada
    // ===============================
    socket.on("fazerJogada", async ({ idSala, index }, callback) => {
      try {
        const salaJSON = await redis.get(idSala);
        if (!salaJSON)
          return callback({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (!sala.emAndamento || sala.tabuleiro[index] !== null) {
          return callback({ sucesso: false, mensagem: "Jogada inválida." });
        }

        const simboloAtual =
          sala.tabuleiro.filter((c) => c !== null).length % 2 === 0 ? "X" : "O";
        const jogadorAtual =
          sala.jogador1.idJogador === jogador.idJogador
            ? sala.jogador1
            : sala.jogador2;

        if (jogadorAtual.simbolo !== simboloAtual) {
          return callback({ sucesso: false, mensagem: "Não é sua vez." });
        }

        sala.tabuleiro[index] = simboloAtual;
        await redis.set(`sala:${idSala}`, JSON.stringify(novaSala));
        io.to(idSala).emit("atualizarTabuleiro", sala.tabuleiro);

        const vencedor = verificarVencedor(sala.tabuleiro);
        if (vencedor || sala.tabuleiro.every((c) => c !== null)) {
          sala.emAndamento = false;
          await redis.del(idSala);

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

    // ===============================
    // ❌ Sair da sala
    // ===============================
    socket.on("sairSala", async ({ idSala }, callback) => {
      try {
        const salaJSON = await redis.get(idSala);
        if (!salaJSON)
          return callback({ sucesso: false, mensagem: "Sala não encontrada." });

        const sala = JSON.parse(salaJSON);
        if (sala.jogador1.idJogador === jogador.idJogador) sala.jogador1 = null;
        else if (sala.jogador2?.idJogador === jogador.idJogador)
          sala.jogador2 = null;

        await redis.set(`sala:${idSala}`, JSON.stringify(novaSala));
        socket.leave(idSala);
        console.log(`🔴 Jogador saiu da sala: ${idSala}`);
        refreshRooms(io);
        callback({ sucesso: true });
      } catch (error) {
        console.error("Erro ao sair da sala:", error);
        callback({ sucesso: false, mensagem: "Erro ao sair da sala." });
      }
    });

    socket.on("getRooms", async (callback) => {
      try {
          console.log("🔄 Buscando salas disponíveis...");
          const salasKeys = await redis.keys("sala:*");
          const salas = [];
  
          if (salasKeys.length === 0) {
              console.warn("⚠ Nenhuma sala encontrada no Redis.");
              //callback([]);
              return;
          }
  
          for (const key of salasKeys) {
              const type = await redis.type(key);
              console.log(`Tipo da chave ${key}: ${type}`);
  
              if (type === "string") {
                  const sala = JSON.parse(await redis.get(key));
                  salas.push(sala);
              } else {
                  console.warn(`Chave ignorada (${key}): Tipo inesperado (${type})`);
              }
          }
  
          const salasDisponiveis = salas.filter((sala) => sala && sala.jogador2 === null);
          console.log("Salas disponíveis:", salasDisponiveis); // ✅ Correção feita aqui
          refreshRooms(io); // Atualiza as salas após a criação ou entrada

          if (typeof callback === "function") {
              callback(salasDisponiveis);
          }
      } catch (error) {
          console.error("Erro ao buscar salas:", error);
          if (typeof callback === "function") {
              callback([]);
          }
      }
  });

    // ===============================
    // 🔌 Desconectar jogador
    // ===============================
    socket.on("disconnect", async () => {
      console.log(`🔴 Jogador desconectado: ${socket.id}`);
  
      const idJogador = jogador.idJogador;
      await redis.del(`player:${idJogador}`);
      delete game.players[socket.id];
  
      // Verifica se esse jogador estava em alguma sala
      const salasKeys = await redis.keys("sala:*");
      for (const key of salasKeys) {
          const salaJSON = await redis.get(key);
          if (!salaJSON) continue;
          
          const sala = JSON.parse(salaJSON);
  
          if (sala.jogador1?.idJogador === idJogador) {
              sala.jogador1 = null;
          } else if (sala.jogador2?.idJogador === idJogador) {
              sala.jogador2 = null;
          }
  
          // Se a sala ficou vazia, remove do Redis e do Banco de Dados
          if (!sala.jogador1 && !sala.jogador2) {
              console.log(`🗑️ Removendo sala ${sala.idSala} pois ficou vazia.`);
              await redis.del(`sala:${sala.idSala}`);
              await Sala.destroy({ where: { idSala: sala.idSala } });
          } else {
              // Atualiza a sala no Redis caso ainda tenha um jogador ativo
              await redis.set(`sala:${sala.idSala}`, JSON.stringify(sala));
          }
      }
  
      refreshRooms(io);
  });

  });

  // ===============================
  // 🔄 Atualizar lista de jogadores
  // ===============================
  async function refreshPlayers(io) {
    const playersKeys = await redis.keys("player:*");
    const players = await Promise.all(
      playersKeys.map(async (key) => JSON.parse(await redis.get(key)))
    );
    io.emit("PlayersRefresh", players);
  }

  // ===============================
  // 🔄 Atualizar lista de salas
  // ===============================
  async function refreshRooms(io) {
    try {
        const salasKeys = await redis.keys("sala:*");
        const salas = [];

        for (const key of salasKeys) {
            const type = await redis.type(key);
            if (type === "string") {
                const sala = JSON.parse(await redis.get(key));

                // Apenas adiciona salas que tenham pelo menos um jogador ativo
                if (sala.jogador1 || sala.jogador2) {
                    salas.push(sala);
                } else {
                    // Se a sala estiver vazia, remove do Redis
                    console.log(`🗑️ Removendo sala vazia: ${sala.idSala}`);
                    await redis.del(`sala:${sala.idSala}`);
                }
            }
        }

        io.emit("updateRooms", salas);
    } catch (error) {
        console.error("Erro ao atualizar salas:", error);
    }
}


  // ===============================
  // 🏆 Verificar vencedor
  // ===============================
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
