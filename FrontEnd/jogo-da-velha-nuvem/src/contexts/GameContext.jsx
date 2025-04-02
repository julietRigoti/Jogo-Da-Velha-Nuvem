// GameProvider.jsx (ou GameContext.js)
import React, { useReducer, useEffect, createContext, useState } from "react";
import socketClient from "socket.io-client";

const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

if (!backendUrl) {
  throw new Error(
    "Backend URL não está configurado. Verifique o arquivo .env.production e certifique-se de que a variável VITE_REACT_APP_BACKEND_URL_NUVEM está definida."
  );
}

if (import.meta.env.VITE_REACT_APP_ENV === "development") {
  console.log("URL do backend:", backendUrl);
}

const socket = socketClient(backendUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const ACTIONS = {
  CONNECTED: "CONNECTED",
  SET_PLAYER: "SET_PLAYER",
  ROOMS: "ROOMS",
  SET_SOCKET: "SET_SOCKET",
  ID_SALA: "ID_SALA",
  SIMBOLO: "SIMBOLO",
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.CONNECTED:
      return { ...state, isConnected: action.payload };
    case ACTIONS.SET_PLAYER:
      return {
        ...state,
        player: {
          token: action.payload.token,
          idJogador: action.payload.idJogador,
          nicknameJogador: action.payload.nicknameJogador,
        },
      };
    case ACTIONS.ROOMS:
      return { ...state, rooms: action.payload };
    case ACTIONS.SET_SOCKET:
      return { ...state, socket: action.payload };
    case ACTIONS.ID_SALA:
      return { ...state, idSala: action.payload };
    case ACTIONS.SIMBOLO:
      return { ...state, simbolo: action.payload };
    default:
      return state;
  }
};

const GameContext = createContext();

const GameProvider = ({ children, navigate }) => {
  const initialState = {
    player: {
      idJogador: sessionStorage.getItem("idJogador") || null,
      nicknameJogador: sessionStorage.getItem("nicknameJogador") || null,
      token: sessionStorage.getItem("token") || null,
    },
    rooms: [],
    isConnected: false,
    socket: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (!storedToken) {
      if (window.location.pathname !== "/") {
        setTimeout(() => navigate("/"), 100);
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (state.player.token && !socket.connected) {
      socket.auth = { token: state.player.token };
      socket.connect();
      dispatch({ type: ACTIONS.SET_SOCKET, payload: socket });
    }
  }, [state.player.token]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket conectado com sucesso:", socket.id);
      dispatch({ type: ACTIONS.CONNECTED, payload: true });
    });

    socket.on("disconnect", () => {
      dispatch({ type: ACTIONS.CONNECTED, payload: false });
    });

    socket.on("connect_error", (err) => {
      console.error("Erro de conexão do socket:", err.message);
      setError("Erro ao conectar ao servidor. Tente novamente mais tarde.");
      dispatch({ type: ACTIONS.CONNECTED, payload: false });
    });

    return () => {
      socket.offAny();
      if (socket.connected) {
        console.log("Desconectando socket:", socket.id);
        socket.disconnect();
      }
    };
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, error }}>
      {children}
    </GameContext.Provider>
  );
};

export { GameContext, GameProvider, ACTIONS };