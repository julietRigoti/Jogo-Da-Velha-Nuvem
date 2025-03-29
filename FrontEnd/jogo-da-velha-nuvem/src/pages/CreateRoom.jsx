import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../style/Room.module.css';
import { io } from 'socket.io-client';

const CreateRoom = () => {
    
    const location = useLocation(); // Acessar location aqui, dentro do componente
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);

    // Extraindo dados da location de maneira segura
    const [idJogador, setIdJogador] = useState(null);
    const [nicknameJogador, setNicknameJogador] = useState(null);
    const [jwtToken, setJwtToken] = useState(null);

    useEffect(() => {
        const idJogador = location.state?.idJogador || sessionStorage.getItem("idJogador");
        const nicknameJogador = location.state?.nicknameJogador || sessionStorage.getItem("nicknameJogador");
        const jwtToken = location.state?.jwtToken || sessionStorage.getItem("token");
    
        if (!idJogador || !nicknameJogador || !jwtToken) {
            console.error("Erro: Dados do jogador não encontrados. Redirecionando para o login...");
            navigate("/login"); // Redireciona para o login se os dados estiverem ausentes
        } else {
            setIdJogador(idJogador);
            setNicknameJogador(nicknameJogador);
            setJwtToken(jwtToken);
        }
    }, [location.state, navigate]);

    console.log("Token JWT: ", jwtToken); // Aqui você pode usar o token
    console.log("ID Jogador: ", idJogador); // Aqui você pode usar o idJogador
    console.log("Nickname Jogador: ", nicknameJogador); // Aqui você pode usar o nicknameJogador

    // Conexão com o servidor WebSocket
    useEffect(() => {
        if (jwtToken) {
            const newSocket = io("http://localhost:8080", {
                auth: { token: jwtToken }
            });
    
            setSocket(newSocket);
    
            return () => {
                newSocket.disconnect(); // Garante que a conexão seja fechada ao desmontar o componente
            };
        }
    }, [jwtToken]);

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [salas, setSalas] = useState([]);

    // Função para criar uma nova sala
    const handleCreateRoom = () => {
        if (!socket) {
            setError("Erro: Conexão com o servidor ainda não estabelecida.");
            return;
        }
    
        if (!idJogador || !nicknameJogador) {
            setError("Erro: Dados do jogador não encontrados.");
            return;
        }
    
        setIsLoading(true);
        setError("");

     socket.emit("criarSala", { jogador: { idJogador, nicknameJogador } }, (response) => {
        console.log("Resposta do servidor ao criar sala:", response);
        if (response.sucesso) {
            navigate(`/jogoVelha/${response.idSala}`); // Redireciona para a sala criada
        } else {
            setError(response.mensagem || "Erro ao criar a sala.");
        }
    });
    };

    // Efeito para ouvir a resposta do servidor e atualizar as salas
    useEffect(() => {
        if (!socket) return;

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
            console.log("Salas atualizadas recebidas:", salasAtivas);
            if (!Array.isArray(salasAtivas)) return;
    
            // Atualiza o estado com as salas disponíveis
            setSalas(salasAtivas);
        };

        socket.on("roomCreated", handleRoomCreated);
      

        // Solicita a lista de salas ao servidor
        socket.emit("getRooms");
        console.log("Solicitando salas disponíveis...");
        socket.on("updateRooms", handleSalasAtualizadas);


        return () => {
            socket.off("updateRooms", handleSalasAtualizadas);
            socket.off("roomCreated", handleRoomCreated);
            socket.off("availableRooms");
        }
        
    }, [socket]);

    // Função para entrar na sala
    const handleJoinRoom = (salaId) => {
        socket.emit("entrarSala", { idSala: salaId, idJogador, nicknameJogador }, (response) => {
            if (response.sucesso) {
                navigate(`/jogoVelha/${idSala}`); // Redireciona para a sala
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
                        <li key={sala.idSala}>
                            <span>Sala ID: {sala.idSala}</span>
                            <button onClick={() => handleJoinRoom(sala.idSala)} disabled={isLoading}>
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
