import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Conectar ao servidor WebSocket
const socket = io('http://localhost:8080');  // Certifique-se de que a URL do servidor está correta

const JogoDaVelha = () => {
  const [symbol, setSymbol] = useState('');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [winner, setWinner] = useState('');
 
  // Conectar ao servidor e configurar eventos
  useEffect(() => {
    // Se conecta ao servidor
    socket.on('connect', () => {
      console.log('Conectado ao servidor WebSocket!');
      socket.emit('createRoom'); // Criar sala
    });

    socket.on('roomCreated', (roomId) => {
      console.log(`Sala criada com ID: ${roomId}`);
    });

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
      if (winner === 'Empate') {
        setWinner('Empate!');
      } else {
        setWinner(`Jogador ${winner} venceu!`);
      }
    });

    socket.on('restartGame', () => {
      setBoard(Array(9).fill(null));
      setWinner('');
    });

    // Cleanup na desconexão
    return () => {
      socket.off('connect');
      socket.off('roomCreated');
      socket.off('assignSymbol');
      socket.off('updateBoard');
      socket.off('updateScores');
      socket.off('updateCurrentPlayer');
      socket.off('gameOver');
      socket.off('restartGame');
    };
  }, []);

  // Função para fazer jogada
  const makeMove = (index) => {
    if (board[index] === null && currentPlayer === symbol) {
      socket.emit('makeMove', { index, symbol });
    }
  };

  // Renderizar o tabuleiro
  const renderBoard = () => {
    return (
      <div id="board">
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => makeMove(index)}
            style={{ width: '60px', height: '60px', fontSize: '24px' }}
          >
            {value}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1>Jogo da Velha Online</h1>
      <div id="game">
        {renderBoard()}
        <div id="status">
          <p>Jogador Atual: <span>{currentPlayer}</span></p>
          <p>Pontuação - X: <span>{scores.X}</span> | O: <span>{scores.O}</span></p>
          <p>Vencedor: <span>{winner}</span></p>
        </div>
      </div>
    </div>
  );
};

export default JogoDaVelha;
