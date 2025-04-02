import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";
import stylesGame from "../style/Game.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../assets/X.gif";
import imagemO from "../assets/O.gif";

const JogoDaVelha = () => {
  const { state } = useContext(GameContext);
  const { socket, isConnected } = state;
  const { idSala } = useParams();

  // Estado do jogo
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    winner: null,
    scores: { X: 0, O: 0 },
  });

  // Informações do jogador
  const [playerInfo, setPlayerInfo] = useState({
    idJogador: "",
    nicknameJogador: "",
    simbolo: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  function atualizarInterfaceDoJogo(sala) {
    // Atualiza o tabuleiro com base no estado atual
    sala.tabuleiro.forEach((simbolo, index) => {
      const celula = document.getElementById(`celula-${index}`);
      if (celula) {
        celula.textContent = simbolo || ""; // Preenche com "X", "O" ou vazio
      }
    });

    // Atualiza o status do jogo
    const status = document.getElementById("status-jogo");
    if (sala.winner) {
      status.textContent = `🏆 Vencedor: ${sala.winner}`;
    } else if (sala.tabuleiro.every((cell) => cell !== null)) {
      status.textContent = "Empate! O tabuleiro está cheio.";
    } else {
      const proximoJogador = sala.jogador1.currentPlayer ? "X" : "O";
      if (status) {
        status.textContent = `Próximo jogador: ${proximoJogador}`;
      }
    }
  }

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("recuperarSala", { idSala }, (response) => {
      if (response.sucesso) {
        console.log("🔹 Sala recuperada:", response.sala);

        setGameState((prevState) => ({
          ...prevState,
          board: response.sala.tabuleiro,
          winner: response.sala.winner || null,
          scores: response.sala.scores || { X: 0, O: 0 },
        }));

        if (state.player?.idJogador) {
          const isJogador1 = response.sala.jogador1?.idJogador === state.player.idJogador;
          setPlayerInfo({
            idJogador: state.player.idJogador,
            nicknameJogador: isJogador1
              ? response.sala.jogador1?.nicknameJogador
              : response.sala.jogador2?.nicknameJogador || "Desconhecido",
            simbolo: isJogador1 ? "X" : "O",
          });
        }

        setIsLoading(false);
      } else {
        console.error("❌ Erro ao recuperar sala:", response.mensagem);
        setError(response.mensagem || "Erro ao carregar a sala.");
        setIsLoading(false);
      }
    });

    const atualizarSalaListener = (salaAtualizada) => {
      console.log("🔄 Atualizando sala com novos dados:", salaAtualizada);
      atualizarInterfaceDoJogo(salaAtualizada); // Função que atualiza a interface
    };

    socket.on("atualizarSala", atualizarSalaListener);

    return () => {
      socket.off("atualizarSala", atualizarSalaListener);
    };
  }, [socket, isConnected, idSala, state.player?.idJogador]);

  // ==============================
  // 🔹 Função para realizar uma jogada
  // ==============================
  const handleCellClick = (index) => {
    if (!socket) {
      console.error("🚨 Socket não está disponível.");
      return;
    }
    if (!isConnected) {
      console.error("🚨 Conexão com o servidor ainda não foi estabelecida.");
      return;
    }
    if (!playerInfo.simbolo) {
      console.warn("⚠️ Seu símbolo ainda não foi carregado.");
      return;
    }
    if (gameState.board[index] !== null) {
      console.warn("⚠️ Jogada inválida! Célula já preenchida.");
      return;
    }
    const totalJogadas = gameState.board.filter((cell) => cell !== null).length;
    const simboloAtual = totalJogadas % 2 === 0 ? "X" : "O";

    if (simboloAtual !== playerInfo.simbolo) {
      console.warn("⚠️ Não é a sua vez de jogar.");
      return;
    }

    console.log(`🎯 Jogador ${playerInfo.simbolo} tentando jogar na posição ${index}`);

    socket.emit("fazerJogada", { idSala, index, simbolo: playerInfo.simbolo }, (response) => {
      if (response.sucesso) {
        console.log("🔄 Atualizando estado do jogo com a resposta do servidor:", response.sala);
        setGameState((prevState) => ({
          ...prevState,
          board: response.sala.tabuleiro,
          winner: response.sala.winner || null,
          scores: response.sala.scores || { X: 0, O: 0 },
        }));
        setPlayerInfo((prevState) => ({
          ...prevState,
          simbolo: response.sala.jogador1?.idJogador === state.player.idJogador ? "X" : "O",
        }));
        console.log("🔄 Estado do jogo atualizado com sucesso:", response.sala);
        console.log("✅ Jogada feita com sucesso:", response.sala);
      } else {
        console.error("❌ Erro ao fazer jogada:", response.mensagem);
      }
    });
  };

  // ==============================
  // 🔹 Reiniciar Jogo
  // ==============================
  const handleRestart = () => {
    if (!socket) return;

    socket.emit("reiniciarJogo", { idSala }, (response) => {
      if (response.sucesso) {
        setGameState({
          board: Array(9).fill(null),
          winner: null,
          scores: { X: 0, O: 0 },
        });
      } else {
        console.error("❌ Erro ao reiniciar o jogo:", response.mensagem);
      }
    });
  };

  // ==============================
  // 🔹 Tratamento para erro ou carregamento
  // ==============================
  if (!socket || !isConnected) {
    return <p>Conectando ao servidor...</p>;
  }

  // ==============================
  // 🔹 Renderização do tabuleiro e informações
  // ==============================
  return (
    <div className={stylesHome.principalDiv}>
      <div className={stylesGame.gameContainer}>
        <div className={stylesGame.board}>
          {gameState.board.map((symbol, index) => (
            <div
              key={`${symbol}-${index}`}
              className={`${stylesGame.cell} ${symbol ? stylesGame[symbol] : ""}`}
              onClick={() => handleCellClick(index)}
              style={{
                cursor: playerInfo.simbolo && symbol === null ? "pointer" : "not-allowed",
              }}
            >
              {symbol}
            </div>
          ))}
        </div>

        <div className={stylesGame.infoPainel}>
          <h2>Jogo da Velha</h2>
          <p>Você é: {playerInfo.simbolo}</p>
          {gameState.winner ? (
            <p>Vencedor: {gameState.winner}</p>
          ) : gameState.board.every((cell) => cell !== null) ? (
            <p>Empate! O tabuleiro está cheio.</p>
          ) : (
            <p>Próximo jogador: {gameState.board.filter((cell) => cell !== null).length % 2 === 0 ? "X" : "O"}</p>
          )}
          <button onClick={handleRestart}>Reiniciar Jogo</button>
        </div>
      </div>
    </div>
  );
};

export default JogoDaVelha;