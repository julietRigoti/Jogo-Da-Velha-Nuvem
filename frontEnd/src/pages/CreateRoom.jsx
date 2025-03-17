import React, { useState, useEffect } from 'react';
import styles from '../style/Room.module.css';
import { io } from 'socket.io-client';

// Conexão com o servidor WebSocket
const socket = io(process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://meujogo.vercel.app");

const BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://meujogo.vercel.app";

const Rooms = () => {
    const [idSala, setIdSala] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Função para criar uma nova sala
    const handleCreateRoom = () => {
        setError("");
        setIsLoading(true);

        // Simula um ID do jogador (substitua com o ID real, se necessário)
        const idJogador = localStorage.getItem("idJogador");
        const nicknameJogador = localStorage.getItem("nicknameJogador"); // Suponha que você tenha salvo o nickname
        const emailJogador = localStorage.getItem("emailJogador"); // Da mesma forma, o email pode estar salvo
        const passwordJogador = localStorage.getItem("passwordJogador"); // E a senha também

        if (!idJogador || !nicknameJogador || !emailJogador ||!passwordJogador) {
            setError("Erro: Dados do jogador não encontrados.");
            setIsLoading(false);
            return;
          }

          console.log({
            idJogador,
            nicknameJogador,
            emailJogador,
            passwordJogador,
          });
        
          // Envia o evento 'createRoom' com os dados completos do jogador
          socket.emit("createRoom", {
            idJogador,
            nicknameJogador,
            emailJogador,
            passwordJogador,
          });
    };

    // Efeito para ouvir a resposta do servidor (roomCreated)
    useEffect(() => {
        const handleRoomCreated = (idSala) => {
            setIdSala(idSala);
            setIsLoading(false);

            const longUrl = `${BASE_URL}/join-room/${idSala}`;

            // Encurtar a URL para compartilhar
            fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`)
                .then((response) => response.text())
                .then((shortUrlResponse) => {
                    setShortUrl(shortUrlResponse);
                })
                .catch((error) => {
                    console.error('Erro ao encurtar a URL:', error);
                    setShortUrl(longUrl); // Usa a URL completa se houver erro
                });
        };

        // Ouve o evento do servidor
        socket.on("roomCreated", handleRoomCreated);

        // Limpa o listener ao desmontar o componente
        return () => {
            socket.off("roomCreated", handleRoomCreated);
        };
    }, []);

    return (
        <div className={styles.roomPanel}>
            <h1>Criar Sala</h1>
            <button onClick={handleCreateRoom} disabled={isLoading}>
                {isLoading ? 'Criando sala...' : 'Criar Nova Sala'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {idSala && (
                <>
                    <p>Compartilhe este link para convidar outras pessoas:</p>
                    <a href={`/join-room/${idSala}`} target="_blank" rel="noopener noreferrer">
                        {shortUrl || `${BASE_URL}/join-room/${idSala}`}
                    </a>
                </>
            )}
        </div>
    );
};

export default Rooms;
