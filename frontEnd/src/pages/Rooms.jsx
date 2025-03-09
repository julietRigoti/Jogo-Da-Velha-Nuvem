import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';  
import axios from 'axios';
import styles from '../style/Room.module.css';

const BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://meujogo.vercel.app"; // Substituir pelo link real

const Rooms = () => {
    const [roomId, setRoomId] = useState("");
    const [shortUrl, setShortUrl] = useState("");

    const handleCreateRoom = async () => {
        const newRoomId = uuidv4();
        setRoomId(newRoomId);

        const longUrl = `${BASE_URL}/room/${newRoomId}`;
        
        try {
            const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
            setShortUrl(response.data);
        } catch (error) {
            console.error('Erro ao encurtar a URL:', error);
            setShortUrl(longUrl); // Se der erro, usa o link normal
        }
    };

    return (
        <div className={styles.roomPanel}>
            <h1>Sala</h1>
            <button onClick={handleCreateRoom}>Criar Nova Sala</button>
            {roomId && (
                <>
                    <p>Compartilhe este link para convidar outras pessoas:</p>
                    <a href={shortUrl || `${BASE_URL}/room/${roomId}`} target="_blank" rel="noopener noreferrer">
                        {shortUrl || `${BASE_URL}/room/${roomId}`}
                    </a>
                </>
            )}
        </div>
    );
};

export default Rooms;
