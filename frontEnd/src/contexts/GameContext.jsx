import React, { useReducer, useEffect, createContext } from 'react';
import socketClient from 'socket.io-client';

const socket = socketClient('http://localhost:8080', {
    autoConnect: false,
});

const GameContext = React.createContext();

const reducer = (state, action) => {
    switch (action.type) {
        case 'CONNECTED':
            return {
                ...state,
                isConnected: action.payload
            };
        case 'PLAYER':
            return {
                ...state,
                player: action.payload
            };
        case 'SET_PLAYER': // Novo tipo de ação para salvar id e nickname
            return {
                ...state,
                player: {
                    id: action.payload.id, 
                    nickname: action.payload.nickname, 
                    jwtToken: action.payload.jwtToken 
                }
            };
        case 'PLAYERS':
            return {
                ...state,
                players: action.payload
            };
        case 'ROOM':
            return {
                ...state,
                room: state.rooms[state.players[action.payload].room]
            };
        case 'ROOMS':
            return {
                ...state,
                rooms: action.payload
            };
        default:
            return state;
    }
};

const initialState = {
    isConnected: false,
    player: {
        id: null,
        nickname: null,
        jwtToken: localStorage.getItem("jwtToken") || null
    },
    room: {},
    rooms: {},
    players: {},
    messages: []
};

const GameProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        socket.on('connect', () => {
            dispatch({ type: 'CONNECTED', payload: true });
        });
        socket.on('disconnect', () => {
            dispatch({ type: 'CONNECTED', payload: false });
        });
        socket.on('PlayersRefresh', (players) => {
            dispatch({ type: 'PLAYERS', payload: players });
            dispatch({ type: 'PLAYER', payload: players[socket.id] });
        });
        socket.on('RoomsRefresh', (rooms) => {
            dispatch({ type: 'ROOMS', payload: rooms });
            dispatch({ type: 'ROOM', payload: socket.id });
        });

        socket.open();
    }, []);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {props.children}
        </GameContext.Provider>
    );
};

const createRoom = () => {
    socket.emit('criarSala');
};

const leaveRoom = () => {
    socket.emit('LeaveRoom');
};

const joinRoom = (roomId) => {
    socket.emit('JoinRoom', roomId);
};

export {
    GameContext,
    GameProvider,
    createRoom,
    leaveRoom,
    joinRoom
};
