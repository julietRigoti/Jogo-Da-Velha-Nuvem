// src/pages/Home/Home.js

import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../style/Home.module.css";
import imagemX from "../assets/X.gif";
import imagemO from "../assets/O.gif";

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const chooseLoginOrSignup = (path) => {
    setIsLoading(true);
    navigate(`/${path}`);
  };

  return (
    <div className={styles.principalDiv}>
      <h1 className={styles.h1}>Jogo da Velha</h1>

      <div className={styles.loginButtonsContainer}>
        <button
          className={styles.pixelBtnLogin}
          onClick={() => chooseLoginOrSignup("login")}
          disabled={isLoading}
        >
          {isLoading ? "Carregando..." : "Entrar"}
        </button>
        <button
          className={styles.pixelBtnSignup}
          onClick={() => chooseLoginOrSignup("signup")}
          disabled={isLoading}
        >
          {isLoading ? "Carregando..." : "Criar conta"}
        </button>
      </div>

      <img
        className={styles.imagemX}
        src={imagemX}
        alt="Pixelart tabuleiro com X"
        loading="lazy"
      />
      <img
        className={styles.imagemO}
        src={imagemO}
        alt="Pixelart tabuleiro com O"
        loading="lazy"
      />
    </div>
  );
};

export default Home;