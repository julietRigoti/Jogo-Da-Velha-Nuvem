import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../style/Room.module.css';
import { useNavigate, useParams } from 'react-router-dom';

const BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://meujogo.vercel.app"; // Substituir pelo link real

    const JoinRoom = () => {
        const { idSala } = useParams(); // Pega o ID da sala da URL
        const navigate = useNavigate();
        const [error, setError] = useState('');
        const [success, setSuccess] = useState(false);
    
        useEffect(() => {
            const joinRoom = async () => {
                const jogadorId = localStorage.getItem('idJogador'); // Verifica se o usuário está autenticado
                console.log('jogadorId:', jogadorId);
                try {
                    const response = await axios.get(`${BASE_URL}/check-player/${jogadorId}`);
                    if (!response.data.exists) {
                        console.error('Jogador não encontrado:', response.data);
                        localStorage.setItem('pendingidSala', idSala);
                        navigate('/login');
                        return;
                    }
                } catch (error) {
                    console.error('Erro ao verificar jogador:', error);
                    setError('Erro ao verificar jogador.');
                    return;
                }
                try {
                    // Adiciona o jogador à sala
                    await axios.post(`${BASE_URL}/join-room/${idSala}`, {
                        jogadorId
                    });
                    // Redireciona para a sala após entrar
                    navigate(`/room/${idSala}`);
                } catch (error) {
                    console.error('Erro ao entrar na sala:', error);
                    setError('Não foi possível entrar na sala.');
                }
            };
    
            joinRoom();
        }, [idSala, navigate]);

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
