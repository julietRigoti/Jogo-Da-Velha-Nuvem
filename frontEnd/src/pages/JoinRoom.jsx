import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../style/Room.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { GameContext } from '../contexts/GameContext'; // Importe o contexto para acessar o socket

const BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "jogo-da-velha-nuvem-production.up.railway.app"; // Substituir pelo link real

    const JoinRoom = () => {
        const { idSala } = useParams(); // Pega o ID da sala da URL
        const navigate = useNavigate();
        const { socket } = useContext(GameContext); // Use o socket do contexto
        const [error, setError] = useState('');
        const [success, setSuccess] = useState(false);
    
        useEffect(() => {
            const joinRoom = () => {
                const idJogador = localStorage.getItem('idJogador'); // Verifica se o usuário está autenticado
                console.log("idSala recebido:", idSala);
                console.log("idJogador encontrado no localStorage:", idJogador);
                
                if (!idJogador) {
                    localStorage.setItem('pendingidSala', idSala);
                    navigate('/login');
                    return;
                }
    
                // Emite o evento 'joinRoom' para o servidor via WebSocket
                socket.emit('joinRoom', { idJogador, idSala }, (response) => {
                    if (response.error) {
                        console.error('Erro ao entrar na sala:', response.error);
                        setError('Erro ao entrar na sala. Tente novamente.');
                    } else {
                        setSuccess(true);
                        navigate(`/room/${idSala}`);
                    }
                });
            };
    
            joinRoom();
        }, [idSala, navigate, socket]);
    
        const handleJoinRoom = () => {
            navigate(`/join-room/${idSala}`);
        };
    
        return (
            <div className={styles.roomPanel}>
                <h1>Entrar em uma Sala</h1>
                <input
                    type="text"
                    placeholder="ID da sala"
                    value={idSala}
                    onChange={(e) => navigate(`/join-room/${e.target.value}`)}
                />
                <button onClick={handleJoinRoom}>Entrar na Sala</button>
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Exibe erro, se houver */}
                {success && <p style={{ color: 'green' }}>Você entrou na sala com sucesso!</p>}
            </div>
        );
    };
    
    export default JoinRoom;
    
