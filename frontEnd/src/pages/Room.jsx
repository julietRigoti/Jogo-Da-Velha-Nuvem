import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Substitua useHistory por useNavigate
import axios from 'axios';
import io from 'socket.io-client';
import styles from '../style/Room.module.css';

const BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://meujogo.vercel.app"; // Ajuste para produção

const socket = io(BASE_URL);

const Room = () => {
    const { idSala } = useParams(); // Captura o ID da sala pela URL
    const navigate = useNavigate(); // Substitua useHistory por useNavigate
    const [jogadorAtual, setJogadorAtual] = useState(null); // Jogador que acessou
    const [jogadores, setJogadores] = useState([]); // Lista de jogadores na sala
    const [simboloEscolhido, setSimboloEscolhido] = useState(""); // Símbolo do jogador
    const [erro, setErro] = useState("");

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const idJogador = localStorage.getItem('idJogador');
                if (!idJogador) {
                    throw new Error('Jogador não autenticado.');
                }
                setJogadorAtual(idJogador);

                // Buscar dados da sala
                const response = await axios.get(`${BASE_URL}/room/${idSala}`);
                if (response.data && response.data.jogadores) {
                    setJogadores(response.data.jogadores);
                } else {
                    throw new Error('Dados da sala inválidos.');
                }

            } catch (error) {
                console.error("Erro ao carregar a sala:", error);
                setErro("Erro ao carregar a sala.");
            }
        };
        fetchRoomData();

        // Ouve os eventos do servidor
        socket.on("roomCreated", (idSala) => {
            setJogadores([]);  // Limpa a lista de jogadores na sala
            socket.emit("getRoomData", { idSala }, (response) => {
                if (response.error) {
                    setErro(response.error);
                } else {
                    setJogadores(response.jogadores);
                }
            });
        });

        socket.on("assignSymbol", (symbol) => {
            setSimboloEscolhido(symbol);
            alert(`Você foi atribuído o símbolo ${symbol}`);
        });

        socket.on("playersUpdate", (players) => {
            setJogadores(players);
        });

        return () => {
            socket.off("roomCreated");
            socket.off("assignSymbol");
            socket.off("playersUpdate");
        };
    }, [idSala]);

    const handleChooseSymbol = (symbol) => {
        socket.emit("chooseSymbol", { idSala, idJogador: jogadorAtual, simbolo: symbol }, (response) => {
            if (response.sucesso) {
                setSimboloEscolhido(response.simbolo);
            } else {
                setErro(response.error);
            }
        });
    };

    return (
        <div className={styles.roomPanel}>
            <h1>Sala {idSala}</h1>

            {erro && <p style={{ color: 'red' }}>{erro}</p>}

            <h2>Jogadores na Sala:</h2>
            <ul>
                {jogadores.length > 0 ? (
                    jogadores.map((jogador) => (
                        <li key={jogador?.idJogador}>
                            {jogador?.nome || "Jogador Desconhecido"} - {jogador?.simbolo || "Aguardando símbolo"}
                        </li>
                    ))
                ) : (
                    <li>Nenhum jogador na sala.</li>
                )}
            </ul>

            {!simboloEscolhido && (
                <div>
                    <h3>Escolha seu símbolo:</h3>
                    <button onClick={() => handleChooseSymbol("X")}>X</button>
                    <button onClick={() => handleChooseSymbol("O")}>O</button>
                </div>
            )}

            {simboloEscolhido && <p>Você escolheu: {simboloEscolhido}</p>}
        </div>
    );
};

export default Room;