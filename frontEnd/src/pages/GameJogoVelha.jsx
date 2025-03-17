import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import stylesGame from "../style/GameJogoVelha.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../imagens/X.gif";
import imagemO from "../imagens/O.gif";

const initialBoard = Array(9).fill(null);

export default function JogoDaVelha() {
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);

  const handleClick = (index) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setWinner(calculateWinner(newBoard));
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const restartGame = () => {
    setBoard(initialBoard);
    setCurrentPlayer("X");
    setWinner(null);
  };

  return (
    <div className={stylesHome.principalDiv}>
      <h1 className={stylesHome.h1}>Jogo da Velha</h1>
      <div className="d-flex gap-5 justify-content-center">
        <div id= {stylesGame.board} className="d-grid" style={{ gridTemplateColumns: "repeat(3, 100px)" }}>
          {board.map((cell, index) => (
            <button
              key={index}
              className="btn btn-outline-dark fs-1"
              style={{ width: "100px", height: "100px" }}
              onClick={() => handleClick(index)}
            >
              {cell}
            </button>
          ))}
        </div>
        <div id="info-painel" className="p-3 border rounded">
          <h3>Informações</h3>
          <h5>Jogador: <span>{currentPlayer}</span></h5>
          <h5>Status: <span>{winner ? "Jogo Encerrado" : "Em andamento"}</span></h5>
          <h5>Vencedor: <span>{winner || " - "}</span></h5>
          <button className="btn btn-primary mt-3" onClick={restartGame}>Reiniciar</button>
          <div className="d-flex w-100 justify-content-center mt-3">
            <img className="imagem-x-game" src={imagemX} alt="Pixelart X" />
            <img className="imagem-o-game" src={imagemO} alt="Pixelart O" />
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}
