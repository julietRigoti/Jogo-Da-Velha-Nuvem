import React, {
  useReducer,
  useEffect,
  createContext,
  useState,
} from "react";
import socketClient from "socket.io-client";

// 🔧 Carrega a URL do backend do .env
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

if (!backendUrl) {
  throw new Error(
    "Backend URL não está configurado. Verifique o .env e a variável VITE_REACT_APP_BACKEND_URL."
  );
}

// 🔌 Configuração inicial do socket
const socket = socketClient(backendUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// 🎮 Ações para o reducer
const ACTIONS = {
  CONNECTED: "CONNECTED",
  SET_PLAYER: "SET_PLAYER",
  ROOMS: "ROOMS",
  SET_SOCKET: "SET_SOCKET",
  ID_SALA: "ID_SALA",
  SIMBOLO: "SIMBOLO",
};

// 📦 Estado inicial do contexto
const storedToken = sessionStorage.getItem("token");
const storedId = sessionStorage.getItem("idJogador");
const storedNickname = sessionStorage.getItem("nicknameJogador");

const initialState = {
  player:
    storedToken && storedId && storedNickname
      ? {
          token: storedToken,
          idJogador: parseInt(storedId),
          nicknameJogador: storedNickname,
        }
      : null,
  rooms: [],
  isConnected: false,
  socket: null,
};

// 🎯 Reducer central para controle do estado global
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

// 🌐 Criação do contexto
const GameContext = createContext();

const GameProvider = ({ children, navigate }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [error, setError] = useState("");

  // 🔁 Rehidratação após refresh: garante player no contexto
  useEffect(() => {
    if (!state.player && storedToken && storedId && storedNickname) {
      dispatch({
        type: ACTIONS.SET_PLAYER,
        payload: {
          token: storedToken,
          idJogador: parseInt(storedId),
          nicknameJogador: storedNickname,
        },
      });
    }
  }, []);

  // 🔐 Redireciona para home se não estiver autenticado
  useEffect(() => {
    if (!storedToken && window.location.pathname !== "/") {
      setTimeout(() => navigate("/"), 100);
    }
  }, [navigate]);

  // 🔌 Conecta o socket quando o token estiver pronto
  useEffect(() => {
    if (state.player?.token && !socket.connected) {
      socket.auth = { token: state.player.token };
      socket.connect();
      dispatch({ type: ACTIONS.SET_SOCKET, payload: socket });
    }
  }, [state.player?.token]);

  // 📡 Listeners de conexão do socket
  useEffect(() => {
    socket.on("connect", () => {
      dispatch({ type: ACTIONS.CONNECTED, payload: true });
    });

    socket.on("disconnect", () => {
      dispatch({ type: ACTIONS.CONNECTED, payload: false });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erro de conexão do socket:", err.message);
      setError("Erro ao conectar ao servidor. Tente novamente mais tarde.");
      dispatch({ type: ACTIONS.CONNECTED, payload: false });
    });

    return () => {
      socket.offAny();
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  // 🧠 Exporta contexto e ações
  return (
    <GameContext.Provider value={{ state, dispatch, error }}>
      {children}
    </GameContext.Provider>
  );
};

export { GameContext, GameProvider, ACTIONS };
