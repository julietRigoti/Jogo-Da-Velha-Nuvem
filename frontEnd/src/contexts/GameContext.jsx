import React, { createContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';

// URL do servidor onde o socket está rodando
const socket = io("http://localhost:8080");

// Estado inicial
const initialState = {
  roomId: null,
  board: Array(9).fill(null),
  currentPlayer: 'X',
  scores: { X: 0, O: 0 },
  players: [],
};

// Função reducer para gerenciar as ações do estado
const gameReducer = (state, action) => {
  switch (action.type) {
    case "SET_ROOM_ID":
      return { ...state, roomId: action.payload };
    case "SET_BOARD":
      return { ...state, board: action.payload };
    case "SET_CURRENT_PLAYER":
      return { ...state, currentPlayer: action.payload };
    case "SET_SCORES":
      return { ...state, scores: action.payload };
    case "SET_PLAYERS":
      return { ...state, players: action.payload };
    default:
      return state;
  }
};

export const GameContext = createContext(); // Exporta o GameContext

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {

    socket.on("connect", () => {
      console.log("Conectado ao servidor!", socket.id);
    });


    // Recebe a notificação quando uma sala for criada
    socket.on("roomCreated", (id) => {
      dispatch({ type: "SET_ROOM_ID", payload: id });
      console.log(`Sala criada: ${id}`);
    });

    // Atribui o símbolo ao jogador
    socket.on("assignSymbol", (symbol) => {
      dispatch({ type: "SET_CURRENT_PLAYER", payload: symbol });
    });

    // Atualiza o tabuleiro quando o jogo for atualizado
    socket.on("updateBoard", (newBoard) => {
      dispatch({ type: "SET_BOARD", payload: newBoard });
    });

    // Atualiza o placar do jogo
    socket.on("updateScores", (newScores) => {
      dispatch({ type: "SET_SCORES", payload: newScores });
    });

    // Notifica quando o jogo termina (vitória ou empate)
    socket.on("gameOver", (result) => {
      alert(result === "Empate" ? "Empate!" : `Jogador ${result} venceu!`);
      resetBoard();
    });

    // Atualiza os jogadores na sala
    socket.on("playersUpdate", (playersInRoom) => {
      dispatch({ type: "SET_PLAYERS", payload: playersInRoom });
    });

    socket.on("login", (player) => {
        dispatch({ type: "SET_PLAYER", payload: player});
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
    if (state.board[index] === null && state.currentPlayer) {
      socket.emit("makeMove", { index, symbol: state.currentPlayer });
    }
  };

   // Função para entrar em uma sala existente
   const joinRoom = (roomId, playerId) => {
    socket.emit("join-room", roomId, playerId);
    dispatch({ type: "SET_ROOM_ID", payload: roomId });
  };

  // Função para reiniciar o jogo
  const restartGame = () => {
    socket.emit("restartGame");
    resetBoard();
  };

  // Função para resetar o tabuleiro
  const resetBoard = () => {
    dispatch({ type: "SET_BOARD", payload: Array(9).fill(null) });
    dispatch({ type: "SET_CURRENT_PLAYER", payload: "X" });
  };

  return (
    <GameContext.Provider value={{
      ...state,
      dispatch,
      createRoom,
      makeMove,
      restartGame, 
      joinRoom, 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
