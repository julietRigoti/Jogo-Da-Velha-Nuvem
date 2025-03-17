import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

// URL do servidor onde o socket está rodando
const socket = io("http://localhost:8080");

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Recebe a notificação quando uma sala for criada
    socket.on("roomCreated", (id) => {
      setRoomId(id);
      console.log(`Sala criada: ${id}`);
    });

    // Atribui o símbolo ao jogador
    socket.on("assignSymbol", (symbol) => {
      setCurrentPlayer(symbol);
    });

    // Atualiza o tabuleiro quando o jogo for atualizado
    socket.on("updateBoard", (newBoard) => {
      setBoard(newBoard);
    });

    // Atualiza o placar do jogo
    socket.on("updateScores", (newScores) => {
      setScores(newScores);
    });

    // Notifica quando o jogo termina (vitória ou empate)
    socket.on("gameOver", (result) => {
      alert(result === "Empate" ? "Empate!" : `Jogador ${result} venceu!`);
      resetBoard();
    });

    // Atualiza os jogadores na sala
    socket.on("playersUpdate", (playersInRoom) => {
      setPlayers(playersInRoom);
    });

    // Limpa os eventos quando o componente for desmontado
    return () => {
      socket.off();
    };
  }, []);

  // Função para criar uma nova sala
  const createRoom = () => {
    socket.emit("createRoom");
  };

  // Função para fazer uma jogada
  const makeMove = (index) => {
    if (board[index] === null && currentPlayer) {
      socket.emit("makeMove", { index, symbol: currentPlayer });
    }
  };

  // Função para reiniciar o jogo
  const restartGame = () => {
    socket.emit("restartGame");
    resetBoard();
  };

  // Função para resetar o tabuleiro
  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
  };

  return (
    <GameContext.Provider value={{
      roomId,
      board,
      currentPlayer,
      scores,
      players,
      createRoom,
      makeMove,
      restartGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
