import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../style/Room.module.css';
import { io } from 'socket.io-client';

const CreateRoom = () => {
    
    const location = useLocation(); // Acessar location aqui, dentro do componente
    const navigate = useNavigate();

    // Extraindo dados da location de maneira segura
    const [idJogador, setIdJogador] = useState(null);
    const [nicknameJogador, setNicknameJogador] = useState(null);
    const [jwtToken, setJwtToken] = useState(null);

    useEffect(() => {
        // Verificar se location.state está disponível
        if (location.state) {
            const { idJogador, nicknameJogador, jwtToken } = location.state;
            setIdJogador(idJogador || null);
            setNicknameJogador(nicknameJogador || null);
            setJwtToken(jwtToken || null);
        }
    }, [location.state]);

    console.log("Token JWT: ", jwtToken); // Aqui você pode usar o token

    // Conexão com o servidor WebSocket
    const socket = io("http://localhost:8080", {
        auth: {
            token: jwtToken || localStorage.getItem('jwtToken'), // Usando jwtToken vindo da state ou localStorage
        }
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [salas, setSalas] = useState([]);

    // Função para criar uma nova sala
    const handleCreateRoom = () => {
        setError("");
        setIsLoading(true);

        if (!idJogador || !nicknameJogador) {
            setError("Erro: Dados do jogador não encontrados.");
            setIsLoading(false);
            return;
        }

        // Emitir evento para criar a sala no back-end
        socket.emit("criarSala", { idJogador, nicknameJogador }, (response) => {
            if (response.sucesso) {
                setIsLoading(false);
                navigate(`/jogoVelha/${response.idSala}`); // Redireciona para a sala criada
            } else {
                setIsLoading(false);
                setError(response.mensagem || "Erro ao criar a sala.");
            }
        });
    };

    // Efeito para ouvir a resposta do servidor e atualizar as salas
    useEffect(() => {
        const handleRoomCreated = (data) => {
            if (data.sucesso) {
                setIsLoading(false); // Desativa o estado de carregamento
                navigate(`/jogoVelha/${data.idSala}`); // Redireciona para a sala criada
            } else {
                setIsLoading(false); // Caso o idSala não seja válido, desativa o carregamento
                setError(data.mensagem || "Erro: Não foi possível criar a sala.");
            }
        };

        const handleSalasAtualizadas = (salasAtivas) => {
            // Filtra as salas que tem apenas um jogador
            const salasComUmJogador = salasAtivas.filter((sala) => sala.jogadores.length === 1);
            setSalas(salasComUmJogador);
        };

        socket.on("roomCreated", handleRoomCreated);
        socket.on("updateRooms", handleSalasAtualizadas);

        // Solicita a lista de salas ao servidor
        socket.emit("getRooms");

        return () => {
            socket.off("roomCreated", handleRoomCreated);
            socket.off("updateRooms", handleSalasAtualizadas);
        };
    }, [navigate]);

    // Função para entrar na sala
    const handleJoinRoom = (salaId) => {
        socket.emit("entrarSala", { idSala: salaId, idJogador, nicknameJogador }, (response) => {
            if (response.sucesso) {
                navigate(`/jogoVelha/${salaId}`); // Redireciona para a sala
            } else {
                setError(response.mensagem || "Erro ao entrar na sala.");
            }
        });
    };


    return (
        <div className={styles.roomPanel}>
            <h1>Criar Sala</h1>
            <button onClick={handleCreateRoom} disabled={isLoading}>
                {isLoading ? 'Criando sala...' : 'Criar Nova Sala'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Lista de Salas Disponíveis */}
            <h2>Salas Disponíveis</h2>
            {salas.length > 0 ? (
                <ul className={styles.roomList}>
                    {salas.map((sala) => (
                        <li key={sala.id}>
                            <span>{sala.nome}</span>
                            <button onClick={() => handleJoinRoom(sala.id)} disabled={isLoading}>
                                Entrar
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhuma sala disponível no momento.</p>
            )}
        </div>
    );
};

export default CreateRoom;
