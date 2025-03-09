import React from 'react';
import styles from './ChoosePlayer.module.css';

const ChoosePlayer = () => {
  const choosePlayer = (symbol) => {
    localStorage.setItem("playerSymbol", symbol);
    window.location.href = "game.html"; // Isso pode ser ajustado dependendo da navegação no seu app React.
  };

  return (
    <div className={styles.principalDiv}>
      <h1>Jogo da Velha</h1>
      <div className="container-fluid text-center py-5">
        <div className={`${styles.chooseContainer} mx-auto p-4`}>
          <h3 className="mb-4">Escolha X ou O</h3>
          <div className={styles.playerSelection}>
            <button className="btn btn-primary btn-lg" onClick={() => choosePlayer('X')}>
              X
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => choosePlayer('O')}>
              O
            </button>
          </div>
        </div>
      </div>
      <img
        className={styles.imagemX}
        src="imagens/X.gif"
        alt="Pixelart tabuleiro com X"
      />
      <img
        className={styles.imagemO}
        src="imagens/O.gif"
        alt="Pixelart tabuleiro com O"
      />
    </div>
  );
};

export default ChoosePlayer;
