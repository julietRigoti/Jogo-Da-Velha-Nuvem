import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import { gameLoaded } from '../contexts/GameContext';
import styles from '../style/JogoVelha.module.css';

const socket = io("http://localhost:8080");

const JogoVelha = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [playerSymbol, setPlayerSymbol] = useState("-");
    const [currentPlayer, setCurrentPlayer] = useState("-");
    const [score, setScore] = useState({ X: 0, O: 0 });

    useEffect(() => {
        gameLoaded();

        socket.on("assignSymbol", (symbol) => setPlayerSymbol(symbol));
        socket.on("updateBoard", ({ board, currentPlayer }) => {
            setBoard([...board]);
            setCurrentPlayer(currentPlayer);
        });

        socket.on("gameOver", (result) => {
            alert(result === "Empate" ? "O jogo empatou!" : `Jogador ${result} venceu!`);
        });

        socket.on("updateCurrentPlayer", setCurrentPlayer);
        socket.on("updateScores", setScore);
        socket.on("MatchRefresh", (match) => {
            setBoard([...match.board]);
            setCurrentPlayer(match.currentPlayer);
            setScore(match.score);
        });

        return () => {
            socket.off("assignSymbol");
            socket.off("updateBoard");
            socket.off("gameOver");
            socket.off("updateCurrentPlayer");
            socket.off("updateScores");
        };
    }, []);

    const handleMove = (index) => {
        if (!board[index] && currentPlayer === playerSymbol) {
            socket.emit("makeMove", { index, symbol: playerSymbol });
        }
    };

    return (
        <div className={styles.gameContainer}>
            <h1 className={styles.title}>Jogo da Velha</h1>
            <div className={styles.content}>
                <GameBoard board={board} onMove={handleMove} />
                <InfoPanel
                    playerSymbol={playerSymbol}
                    currentPlayer={currentPlayer}
                    score={score}
                />
            </div>
        </div>
    );
};

const GameBoard = ({ board, onMove }) => (
    <div className={styles.board}>
        {board.map((cell, index) => (
            <div
                key={index}
                className={styles.cell}
                onClick={() => onMove(index)}
            >
                {cell}
            </div>
        ))}
    </div>
);

const InfoPanel = ({ playerSymbol, currentPlayer, score }) => (
    <div className={styles.infoPanel}>
        <h2>Placar</h2>
        <p>Vitórias X: {score.X}</p>
        <p>Vitórias O: {score.O}</p>
        <p>Vez de: {currentPlayer}</p>
        <p>Seu símbolo: <span>{playerSymbol}</span></p>
    </div>
);

export default JogoVelha;
