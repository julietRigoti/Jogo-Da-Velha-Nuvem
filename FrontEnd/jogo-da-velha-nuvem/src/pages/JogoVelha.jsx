import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";
import stylesGame from "../style/Game.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../assets/X.gif";
import imagemO from "../assets/O.gif";

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

  // Define de quem é a vez
  const getCurrentPlayer = (sala) => sala?.currentPlayer || "X";

  const handleAtualizarSala = (salaAtualizada) => {
    console.log("🧠 RECEBIDO do SOCKET -> atualizarSala:", salaAtualizada);
    setSala(salaAtualizada);
    setGameState({
      board: salaAtualizada.tabuleiro,
      winner: salaAtualizada.winner || null,
      scores: salaAtualizada.scores || { X: 0, O: 0 },
      currentPlayer: salaAtualizada.currentPlayer || "X",
    });
  };

  // Recupera sala e registra o listener
  useEffect(() => {
    if (!socket || !isConnected || !idSala) return;

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
      console.log("❌ Limpando listener atualizarSala");
      socket.off("atualizarSala", handleAtualizarSala);
    };
  }, [socket, isConnected, idSala]);


  // Define símbolo do jogador
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
  }, [player?.idJogador, sala?.idSala]);

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

  const handleCellClick = (index) => {
    console.log("Tentando clicar na célula:", index);
    console.log("Simbolo do jogador:", playerInfo?.simbolo);
    console.log("Player atual do jogo:", gameState.currentPlayer);
    console.log("Tabuleiro atual:", gameState.board);

    if (!canMakeMove(index)) return;

    socket.emit(
      "fazerJogada",
      { idSala, index, simbolo: playerInfo.simbolo },
      (response) => {
        if (!response.sucesso) {
          setError(response.mensagem || "Erro ao fazer jogada.");
          return;
        }
        console.log("Jogada feita com sucesso:", response);
        handleAtualizarSala(response.sala);
        console.log("Estado do jogo atualizado:", {
          board: response.sala.tabuleiro,
          currentPlayer: getCurrentPlayer(response.sala),
          winner: response.sala.winner || null,
        });
      }
    );
  };

  const handleRestart = () => {
    if (!socket) return;
    socket.emit("reiniciarJogo", { idSala }, (response) => {
      if (!response.sucesso) {
        setError(response.mensagem || "Erro ao reiniciar jogo.");
      }
    });
  };

  if (isLoading) {
    return <p className={stylesHome.h1}>Carregando jogo...</p>;
  }

  if (!playerInfo) {
    return <p className={stylesHome.h1}>Carregando informações do jogador...</p>;
  }

  return (
    <div className={stylesHome.principalDiv}>
      <div className={stylesGame.gameContainer}>
        {/* Tabuleiro */}
        <div className={stylesGame.board}>
          {gameState.board.map((symbol, index) => (
            <div
              key={index}
              className={`${stylesGame.cell} ${symbol ? stylesGame[symbol] : ""}`}
              onClick={() => handleCellClick(index)}
              style={{
                cursor:
                  playerInfo.simbolo && symbol === null
                    ? "pointer"
                    : "not-allowed",
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
          <p>{playerInfo.nicknameJogador} é: {playerInfo.simbolo}</p>

          {gameState.winner ? (
            <div className={stylesGame.winnerMessage}>
              <h2>Vencedor: {gameState.winner}</h2>
            </div>
          ) : gameState.board.every((cell) => cell !== null) ? (
            <p>Empate! Tabuleiro cheio.</p>
          ) : (
            <p>Vez de: {gameState.currentPlayer}</p>
          )}

          {!sala.jogador2?.idJogador ? (
            <p>Aguardando outro jogador entrar...</p>
          ) : (
            <p>Jogadores prontos: {sala.jogador1.nicknameJogador} vs {sala.jogador2.nicknameJogador}</p>
          )}

          <button onClick={handleRestart}>Reiniciar</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
        <img
          className={stylesHome.imagemX}
          src={imagemX}
          alt="Pixelart tabuleiro com X"
        />
        <img
          className={stylesHome.imagemO}
          src={imagemO}
          alt="Pixelart tabuleiro com O"
        />
      </div>
    </div>
  );
};

export default JogoVelha;
