import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { GameContext } from '../contexts/GameContext';
import styles from '../style/Room.module.css';

const BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://meujogo.vercel.app"; // Substituir pelo link real

    const Rooms = () => {
        const { socket } = useContext(GameContext); // Use o socket do contexto
        const [idSala, setRoomId] = useState("");
        const [shortUrl, setShortUrl] = useState("");
        const [error, setError] = useState("");
        const [isLoading, setIsLoading] = useState(false);
    
        const handleCreateRoom = () => {
            setError("");
            setIsLoading(true);
    
            // Emita o evento 'createRoom' para o servidor via WebSocket
            socket.emit('createRoom', (roomId) => {
                if (!roomId) {
                    setError("Erro ao criar sala. Tente novamente.");
                    setIsLoading(false);
                    return;
                }
    
                // Atualizar o estado da sala com o ID da sala retornado pelo servidor
                setRoomId(roomId);
                const longUrl = `http://localhost:8080/join-room/${roomId}`;
    
                // Encurtar a URL para compartilhamento
                try {
                    const urlResponse = fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`)
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
            socket.on('roomCreated', (roomId) => {
                setRoomId(roomId);
            });
    
            // Cleanup ao desmontar o componente
            return () => {
                socket.off('roomCreated');
            };
        }, [socket]);
    
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
                            {shortUrl || `http://localhost:8080/join-room/${idSala}`}
                        </a>
                    </>
                )}
            </div>
        );
    };
    
    export default Rooms;
