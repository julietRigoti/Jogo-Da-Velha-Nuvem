import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";
import stylesGame from "../style/Game.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../assets/X.gif";
import imagemO from "../assets/O.gif";

const JogoVelha = () => {
  const navigate = useNavigate();
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

    socket.on("atualizarSala", handleAtualizarSala);

    socket.emit("recuperarSala", { idSala }, (response) => {
      if (response.sucesso) {
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

    if (!socket || !isConnected) return false;
    if (!playerInfo?.simbolo) return false;
    if (gameState.board[index] !== null) return false;
    if (gameState.currentPlayer !== playerInfo.simbolo) return false;
    return true;
  };

  const handleCellClick = (index) => {

    if (!canMakeMove(index)) return;

    socket.emit(
      "fazerJogada",
      { idSala, index, simbolo: playerInfo.simbolo },
      (response) => {
        if (!response.sucesso) {
          setError(response.mensagem || "Erro ao fazer jogada.");
          return;
        }
        handleAtualizarSala(response.sala);
        
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

  const handleLeaveRoom = () => {
    if (!socket) return;
  
    socket.emit("sairSala", { idSala }, (response) => {
      if (response.sucesso) {
        navigate("/criar-sala"); // ou use `navigate("/sala")` se estiver usando `useNavigate()`
      } else {
        setError(response.mensagem || "Erro ao sair da sala.");
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
          <h2 className={stylesGame.h2}>Jogo da Velha</h2>

          <p>{playerInfo.nicknameJogador} é: {playerInfo.simbolo}</p>

          {gameState.winner ? (
            <p className={stylesGame.winnerMessage}> Vencedor: {gameState.winner}</p>
          ) : gameState.board.every((cell) => cell !== null) ? (
            <p>Empate! Tabuleiro cheio.</p>
          ) : (
            <p>Vez de: {gameState.currentPlayer}</p>
          )}

          <p>Placar:</p>
          <div className={stylesGame.placar}>
            <p>X ({sala.jogador1?.nicknameJogador || "?"}): {gameState.scores.X}</p>
            <p>O ({sala.jogador2?.nicknameJogador || "?"}): {gameState.scores.O}</p>
          </div>

          {!sala.jogador2?.idJogador ? (
            <p> Aguardando outro jogador entrar...</p>
          ) : (
            <p> Jogadores: {sala.jogador1.nicknameJogador} vs {sala.jogador2.nicknameJogador}</p>
          )}

          <div className={stylesGame.buttonContainer}>
            <button className={stylesGame.restartButton} onClick={handleRestart}>
              Reiniciar Jogo
            </button>
          </div>

          <button onClick={handleLeaveRoom}className={stylesGame.leaveButton} >Sair da Sala</button>

          {/* Imagens */}
          <div className={stylesGame.imagemContainer}>
            <img
              className={stylesGame.imagemXO}
              src={imagemX}
              alt="Pixelart tabuleiro com X"
            />
            <img
              className={stylesGame.imagemXO}
              src={imagemO}
              alt="Pixelart tabuleiro com O"
            />

            
          </div>
            
        </div>
      </div>
    </div>
  );
};

export default JogoVelha;
