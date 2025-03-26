import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import styles from '../style/JogoVelha.module.css'; // Importando o CSS

const JogoDaVelha = () => {
  const [symbol, setSymbol] = useState('');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [winner, setWinner] = useState('');
  const location = useLocation();
  const { idSala } = useParams();
  
  console.log("ID da Sala: ", idSala);

  // Recupera o socket do localStorage
  useEffect(() => {
    let storedSocket = localStorage.getItem("socket");

    if (!storedSocket) return;

    const socket = JSON.parse(storedSocket);

    if (!idSala) return;

    console.log(`Entrando na sala: ${idSala}`);
    socket.emit('joinRoom', idSala);

    socket.on('assignSymbol', (playerSymbol) => {
      setSymbol(playerSymbol);
      console.log(`Seu símbolo é: ${playerSymbol}`);
    });

    socket.on('updateBoard', (newBoard) => {
      setBoard(newBoard);
    });

    socket.on('updateScores', (updatedScores) => {
      setScores(updatedScores);
    });

    socket.on('updateCurrentPlayer', (player) => {
      setCurrentPlayer(player);
    });

    socket.on('gameOver', (winner) => {
      setWinner(winner === 'Empate' ? 'Empate!' : `Jogador ${winner} venceu!`);
    });

    socket.on('restartGame', () => {
      setBoard(Array(9).fill(null));
      setWinner('');
    });

    return () => {
      socket.off('assignSymbol');
      socket.off('updateBoard');
      socket.off('updateScores');
      socket.off('updateCurrentPlayer');
      socket.off('gameOver');
      socket.off('restartGame');
    };
  }, [idSala]);

  const makeMove = (index) => {
    if (board[index] === null && currentPlayer === symbol) {
      socket.emit('makeMove', { index, symbol, idSala });
    }
  };

  return (
    <div className={styles.container}>
      <h1>Jogo da Velha Online</h1>
      <div className={styles.board}>
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => makeMove(index)}
            className={styles.cell}
          >
            {value}
          </button>
        ))}
      </div>
      <div className={styles.status}>
        <p>Jogador Atual: <span>{currentPlayer}</span></p>
        <p>Pontuação - X: <span>{scores.X}</span> | O: <span>{scores.O}</span></p>
        <p>Vencedor: <span>{winner}</span></p>
      </div>
    </div>
  );
};

export default JogoDaVelha;
