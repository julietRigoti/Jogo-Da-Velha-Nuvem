import React, { useState, useEffect, useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import styles from '../style/Room.module.css';

const BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://meujogo.vercel.app"; // Substituir pelo link real

const Rooms = () => {
    const { createRoom } = useContext(GameContext); // Use a função createRoom do contexto
    const [idSala, setRoomId] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateRoom = () => {
        setError("");
        setIsLoading(true);

        // Chama a função createRoom do contexto
        createRoom((roomId) => {
            if (!roomId) {
                setError("Erro ao criar sala. Tente novamente.");
                setIsLoading(false);
                return;
            }

            // Atualizar o estado da sala com o ID da sala retornado pelo servidor
            setRoomId(roomId);
            const longUrl = `${BASE_URL}/join-room/${roomId}`;

            // Encurtar a URL para compartilhamento
            try {
                fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`)
                    .then((response) => response.text())
                    .then((shortUrlResponse) => {
                        setShortUrl(shortUrlResponse);
                    })
                    .catch((error) => {
                        console.error('Erro ao encurtar a URL:', error);
                        setShortUrl(longUrl); // Se der erro, usa o link normal
                    });
            } catch (error) {
                console.error('Erro ao encurtar a URL:', error);
                setShortUrl(longUrl); // Se der erro, usa o link normal
            }
            setIsLoading(false);
        });
    };

    useEffect(() => {
        // Ouve o evento 'roomCreated' e atualiza o estado caso a sala tenha sido criada
        const handleRoomCreated = (roomId) => {
            setRoomId(roomId);
        };

        socket.on('roomCreated', handleRoomCreated);

        return () => {
            socket.off('roomCreated', handleRoomCreated);
        };
    }, []);

    return (
        <div className={styles.roomPanel}>
            <h1>Criar Sala</h1>
            <button onClick={handleCreateRoom} disabled={isLoading}>
                {isLoading ? 'Criando sala...' : 'Criar Nova Sala'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Exibe erro, se houver */}
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
