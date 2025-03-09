import React, { useReducer, useEffect } from 'react';
import socketClient from 'socket.io-client';

const socket = socketClient('http://localhost:4000', {
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
        case 'PLAYERS':
            return {
                ...state,
                players: action.payload
            };
        case 'ROOM':
            return {
                ...state,
                room: action.payload
            };
        case 'ROOMS':
            return {
                ...state,
                rooms: action.payload
            };
        case 'MATCH':
            return {
                ...state,
                match: action.payload
            };
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload]
            };
        default:
            return state;
    }
};

const initialState = {
    isConnected: false,
    player: {},
    room: {},
    rooms: {},
    players: {},
    messages: [],
    match: {}
};

const GameProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const onConnect = () => dispatch({ type: 'CONNECTED', payload: true });
        const onDisconnect = () => dispatch({ type: 'CONNECTED', payload: false });
        const onPlayersRefresh = (players) => {
            dispatch({ type: 'PLAYERS', payload: players });
            dispatch({ type: 'PLAYER', payload: players[socket.id] });
        };
        const onReceiveMessage = (receivedMessage) => {
            dispatch({ type: 'ADD_MESSAGE', payload: receivedMessage });
        };
        const onRoomsRefresh = (rooms) => {
            dispatch({ type: 'ROOMS', payload: rooms });
        };
        const onMatchRefresh = (match) => {
            dispatch({ type: 'MATCH', payload: match });
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('PlayersRefresh', onPlayersRefresh);
        socket.on('ReceiveMessage', onReceiveMessage);
        socket.on('RoomsRefresh', onRoomsRefresh);
        socket.on('MatchRefresh', onMatchRefresh);

        socket.open();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('PlayersRefresh', onPlayersRefresh);
            socket.off('ReceiveMessage', onReceiveMessage);
            socket.off('RoomsRefresh', onRoomsRefresh);
            socket.off('MatchRefresh', onMatchRefresh);
        };
    }, []);

    return (
        <GameContext.Provider value={{ ...state, dispatch }}>
            {props.children}
        </GameContext.Provider>
    );
};

const sendMessage = (message) => {
    socket.emit('SendMessage', message);
};

const createRoom = () => {
    socket.emit('CreateRoom');
};

const leaveRoom = () => {
    socket.emit('LeaveRoom');
};

const joinRoom = (roomId) => {
    socket.emit('JoinRoom', roomId);
};

const gameLoaded = () => {
    socket.emit('GameLoaded');
};

export {
    GameContext,
    GameProvider,
    sendMessage,
    createRoom,
    leaveRoom,
    joinRoom,
    gameLoaded,
};