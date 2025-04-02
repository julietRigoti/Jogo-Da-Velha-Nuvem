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
    currentPlayer: "X",
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

  // ==============================
  // 🔹 Efeito para recuperar o estado da sala ao conectar
  // ==============================
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("recuperarSala", { idSala }, (response) => {
      if (response.sucesso) {
        console.log("🔹 Sala recuperada:", response.sala);

        setGameState({
          board: response.sala.tabuleiro,
          winner: response.sala.winner || null,
          currentPlayer: response.sala.currentPlayer || "X",
          scores: response.sala.scores || { X: 0, O: 0 },
        });

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

      setGameState({
        board: salaAtualizada.tabuleiro,
        winner: salaAtualizada.winner || null,
        currentPlayer: salaAtualizada.currentPlayer || "X",
        scores: salaAtualizada.scores || { X: 0, O: 0 },
      });
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
    if (gameState.currentPlayer !== playerInfo.simbolo) {
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
          currentPlayer: response.sala.currentPlayer || "X",
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
          currentPlayer: "X",
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
                cursor: gameState.currentPlayer === playerInfo.simbolo && !symbol ? "pointer" : "not-allowed",
              }}
            >
              {symbol}
            </div>
          ))}
        </div>

        <div className={stylesGame.infoPainel}>
          <h2>Jogo da Velha</h2>
          <p>Você é: {playerInfo.simbolo}</p>
          <p>Próximo jogador: {gameState.currentPlayer}</p>
          <p>Vencedor: {gameState.winner || "Nenhum"}</p>
          <button onClick={handleRestart}>Reiniciar Jogo</button>
        </div>
      </div>
    </div>
  );
};

export default JogoDaVelha;