// src/pages/Home/Home.js

import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../style/Home.module.css";
import imagemX from "../imagens/X.gif";
import imagemO from "../imagens/O.gif";

const Home = () => {
  const navigate = useNavigate();

  const chooseLoginOrSignup = (tipo) => {
    navigate(tipo === "login" ? "/login" : "/signup");
  };

  return (
    <div className={styles.principalDiv}>
      <h1 className={styles.h1}>Jogo da Velha</h1>

      <div className={styles.loginButtonsContainer}>
        <button
          className={styles.pixelBtnLogin}
          onClick={() => chooseLoginOrSignup("login")}
        >
          Entrar
        </button>
        <button
          className={styles.pixelBtnSignup}
          onClick={() => chooseLoginOrSignup("signup")}
        >
          Criar conta
        </button>
      </div>

      <img
        className={styles.imagemX}
        src= {imagemX}
        alt="Pixelart tabuleiro com X"
      />
      <img
        className={styles.imagemO}
        src= {imagemO}
        alt="Pixelart tabuleiro com O"
      />
    </div>
  );
};

export default Home;