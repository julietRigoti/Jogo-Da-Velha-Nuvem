import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";
import stylesGame from "../style/Game.module.css";
import stylesHome from "../style/Home.module.css";

const JogoVelha = () => {
  const { idSala } = useParams();
  const { state } = useContext(GameContext);
  const { socket, isConnected, player } = state;

  const [sala, setSala] = useState(null);
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    winner: null,
    scores: { X: 0, O: 0 },
    currentPlayer: "X",
  });
  const [playerInfo, setPlayerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 Define de quem é a vez
  const getCurrentPlayer = (sala) => {
    return sala?.currentPlayer || "X";
  };

  // 🔁 Recupera sala ao montar componente
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleAtualizarSala = (salaAtualizada) => {
      console.log("🧠 RECEBIDO do SOCKET -> atualizarSala:", salaAtualizada);
      setSala(salaAtualizada);
      setGameState({
        board: salaAtualizada.tabuleiro,
        winner: salaAtualizada.winner || null,
        scores: salaAtualizada.scores || { X: 0, O: 0 },
        currentPlayer: getCurrentPlayer(salaAtualizada),
      });
    };

    console.log("🟢 Registrando listener de atualizarSala...");
    socket.on("atualizarSala", handleAtualizarSala);

    socket.emit("recuperarSala", { idSala }, (response) => {
      if (response.sucesso) {
        console.log("🔹 Sala recuperada:", response.sala);
        handleAtualizarSala(response.sala);
        setIsLoading(false);
      } else {
        setError("Erro ao carregar a sala.");
        setIsLoading(false);
      }
    });


    return () => {
      socket.off("atualizarSala", handleAtualizarSala);
    };
  }, [socket, isConnected, idSala]);

  // ✅ Define o símbolo do jogador assim que `player` e `sala` estiverem disponíveis
  useEffect(() => {
    if (!player?.idJogador || !sala) return;

    const isJogador1 = sala.jogador1?.idJogador === parseInt(player.idJogador);
    setPlayerInfo({
      idJogador: player.idJogador,
      nicknameJogador: isJogador1
        ? sala.jogador1.nicknameJogador
        : sala.jogador2?.nicknameJogador || "Desconhecido",
      simbolo: isJogador1 ? "X" : "O",
    });
  }, [player?.idJogador, sala]);

  // 🔍 Validação de jogada
  const canMakeMove = (index) => {
    console.log("VALIDANDO JOGADA:");
    console.log("Simbolo:", playerInfo?.simbolo);
    console.log("Jogador:", playerInfo?.idJogador);
    console.log("Current Player:", gameState.currentPlayer);
    console.log("Tabuleiro:", gameState.board);

    if (!socket || !isConnected) return false;
    if (!playerInfo?.simbolo) return false;
    if (gameState.board[index] !== null) return false;
    if (gameState.currentPlayer !== playerInfo.simbolo) return false;
    return true;
  };

  // 🔄 Envia jogada
  const handleCellClick = (index) => {
    if (!canMakeMove(index)) return;

    socket.emit("fazerJogada", {
      idSala,
      index,
      simbolo: playerInfo.simbolo,
    }, (response) => {
      if (!response.sucesso) {
        setError(response.mensagem || "Erro ao fazer jogada.");
      }
    });
  };

  // 🔁 Reiniciar jogo
  const handleRestart = () => {
    if (!socket) return;
    socket.emit("reiniciarJogo", { idSala }, (response) => {
      if (!response.sucesso) {
        setError(response.mensagem || "Erro ao reiniciar jogo.");
      }
    });
  };

  // 🧭 Espera carregamento
  if (
    isLoading ||
    !playerInfo?.idJogador ||
    !playerInfo?.simbolo ||
    !sala ||
    !socket ||
    !isConnected
  ) {
    return <p className={stylesHome.h1}>Carregando jogo...</p>;
  }

  // 🧩 Render principal
  return (
    <div className={stylesHome.principalDiv}>
      <div className={stylesGame.gameContainer}>
        {/* Tabuleiro */}
        <div className={stylesGame.board}>
          {gameState.board.map((symbol, index) => (
            <div
              key={index}
              className={`${stylesGame.cell} ${symbol ? stylesGame[symbol] : ""}`}
              onClick={() => {
                if (playerInfo && sala && gameState.currentPlayer && socket && isConnected) {
                  handleCellClick(index);
                }
              }}
              role="button"
              aria-label={`Célula ${index + 1}, ${symbol || "vazia"}`}
            >
              {symbol}
            </div>
          ))}
        </div>

        {/* Painel lateral */}
        <div className={stylesGame.infoPainel}>
          <h2>Jogo da Velha</h2>
          <p>Você é: {playerInfo.simbolo}</p>

          {gameState.winner ? (
            <div className={stylesGame.winnerMessage}>
              <h2>Vencedor: {gameState.winner}</h2>
              <button onClick={handleRestart}>Reiniciar</button>
            </div>
          ) : gameState.board.every((cell) => cell !== null) ? (
            <p>Empate! Tabuleiro cheio.</p>
          ) : (
            <p>Vez de: {gameState.currentPlayer}</p>
          )}

          <button onClick={handleRestart}>Reiniciar Jogo</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
};
export default JogoVelha;
