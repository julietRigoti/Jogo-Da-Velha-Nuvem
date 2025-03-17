import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import styles from '../style/Room.module.css';

const BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://meujogo.vercel.app"; // Substituir pelo link real

const Rooms = () => {
    const [idSala, setRoomId] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [error, setError] = useState("");

    const handleCreateRoom = async () => {
        setError("");
        try {
            const jogadorId = localStorage.getItem('idJogador');
            console.log('jogadorId:', jogadorId);
            if (!jogadorId) {
                throw new Error('Jogador não encontrado');
            }
            // Criando a sala
            const roomResponse = await axios.post(`${BASE_URL}/create-room`, {
                idJogador1: jogadorId,
            });

            if (!roomResponse.data || !roomResponse.data.room) {
                console.error('Erro ao criar a sala:', roomResponse.data);
                throw new Error('Erro ao criar a sala');
            }

            const newRoomId = roomResponse.data.room.idSala;
            setRoomId(newRoomId);

            const longUrl = `${BASE_URL}/join-room/${newRoomId}`;

            // Encurtando a URL
            try {
                const urlResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
                setShortUrl(urlResponse.data);
            } catch (error) {
                console.error('Erro ao encurtar a URL:', error);
                setShortUrl(longUrl); // Se der erro, usa o link normal
            }
        } catch (error) {
            console.error('Erro ao criar sala:', error);
            setError('Erro ao criar sala. Tente novamente.');
        }
    };

    return (
        <div className={styles.roomPanel}>
            <h1>Criar Sala</h1>
            <button onClick={handleCreateRoom}>Criar Nova Sala</button>
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