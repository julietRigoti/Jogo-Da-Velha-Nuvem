import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../style/Room.module.css';

const BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "jogo-da-velha-nuvem-production.up.railway.app"; // Substituir pelo link real

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState("");

    // Função para buscar as salas existentes
    const fetchRooms = async () => {
        try {
            const response = await axios.get('http://localhost:8080/create-room'); // Endpoint que deve retornar todas as salas
            setRooms(response.data.rooms); // Supondo que a resposta contenha um array 'rooms'
        } catch (error) {
            console.error('Erro ao buscar as salas:', error);
            setError('Erro ao carregar as salas.');
        }
    };

    // Chama a função fetchRooms quando o componente for montado
    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div className={styles.roomPanel}>
            <h1>Salas Disponíveis</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Exibe erro, se houver */}
            {rooms.length > 0 ? (
                <ul>
                    {rooms.map(room => (
                        <li key={room.idSala}>
                            <a href={`${BASE_URL}/room/${room.idSala}`} target="_blank" rel="noopener noreferrer">
                                Sala {room.idSala} - Jogador 1: {room.jogador1.nicknameJogador}
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Não há salas disponíveis.</p>
            )}
        </div>
    );
};

export default RoomList;
