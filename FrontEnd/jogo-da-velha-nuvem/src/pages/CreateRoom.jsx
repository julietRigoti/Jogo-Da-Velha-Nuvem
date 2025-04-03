// CreateRoom.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";
import styles from "../style/Room.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../assets/X.gif";
import imagemO from "../assets/O.gif";

const CreateRoom = () => {
  const navigate = useNavigate();
  const { state, dispatch } = React.useContext(GameContext);
  const { rooms, player, isConnected, socket } = state;

  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Aguarda o socket e a conexão estarem disponíveis
    if (!socket || !isConnected) {
      return;
    }

    socket.emit("pegarSalas", (salasAtivas) => {
      if (Array.isArray(salasAtivas)) {
        console.log("Salas recebidas do servidor:", salasAtivas);
        dispatch({ type: "ROOMS", payload: salasAtivas });
      }
    });

    const handleRoomsRefresh = (salasAtivas) => {
      console.log("Atualização de salas recebida:", salasAtivas);
      dispatch({ type: "ROOMS", payload: salasAtivas });
    };

    socket.on("RoomsRefresh", handleRoomsRefresh);

    return () => {
      socket.off("RoomsRefresh", handleRoomsRefresh);
    };
  }, [socket, isConnected, dispatch]);

  const handleCreateRoom = () => {
    if (!socket || !isConnected || !player) {
      setError("Erro: Verifique sua conexão ou informações do jogador.");
      return;
    }
    setIsProcessing(true);

    console.log("Criando sala com o jogador:", player);

    socket.emit(
      "criarSala",
      {
        jogador: {
          idJogador: player.idJogador,
          nicknameJogador: player.nicknameJogador,
        },
      },
      (response) => {
        setIsProcessing(false);
        if (response.sucesso) {
          navigate(`/jogoVelha/${response.idSala}`);
        } else {
          alert(response.mensagem || "Erro ao criar a sala.");
        }
      }
    );
  };

  const handleEnterRoom = (idSala) => {
    if (!socket || !isConnected || !player) {
      setError("Erro: Verifique sua conexão ou informações do jogador.");
      return;
    }
    setIsProcessing(true);
    socket.emit(
      "entrarSala",
      {
        idSala,
        jogador2: {
          idJogador: player.idJogador,
          nicknameJogador: player.nicknameJogador,
        },
      },
      (response) => {
        setIsProcessing(false);
        if (response.sucesso) {
          navigate(`/jogoVelha/${idSala}`);
        } else {
          alert(response.mensagem || "Erro ao entrar na sala.");
        }
      }
    );
  };

  // Exibe uma mensagem de loading enquanto o socket não estiver disponível
  if (!socket || !isConnected) {
    return <p>Conectando ao servidor...</p>;
  }

  return (
    <div className={styles.roomPainel}>
      <h1>Criar Sala</h1>
      <button onClick={handleCreateRoom} disabled={isProcessing}>
        {isProcessing ? "Criando Sala..." : "Criar Nova Sala"}
      </button>
      <h2>Salas Disponíveis</h2>
      {rooms && rooms.length > 0 ? (
        <ul>
          {rooms.map((sala) => (
            <li key={sala.idSala}>
              Sala ID: {sala.idSala} - Criada por: {sala.jogador1.nicknameJogador}{" "}
              <button onClick={() => handleEnterRoom(sala.idSala)}>
                Entrar na Sala
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma sala disponível no momento.</p>
      )}
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
  );
};

export default CreateRoom;
