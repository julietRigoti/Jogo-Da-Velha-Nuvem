import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";
import stylesLogin from "../style/Login.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../imagens/X.gif";
import imagemO from "../imagens/O.gif";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { dispatch } = useContext(GameContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simula a autenticação do usuário
    const player = { name: username, room: null };
    dispatch({ type: 'PLAYER', payload: player });
    navigate("/menu");
  };

  return (
    <div className={stylesHome.principalDiv}>
      <h1 className={stylesHome.h1}>Jogo da Velha</h1>
      <div className={stylesLogin.loginContainer}>
        <h2 className={stylesHome.h2}>Entrar</h2>
        <form onSubmit={handleLogin}>
          <div className={stylesLogin.formControlContainer}>
            <label htmlFor="username">
              Usuário
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={stylesLogin.formControl}
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={stylesLogin.formControlContainer}>
            <label htmlFor="password">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={stylesLogin.formControl}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={stylesLogin.btnPrimary}>
            Entrar
          </button>
        </form>
        <div className={stylesLogin.mt3}>
          <a href="/signup" className={stylesLogin.textDecorationNone}>
            Não tem uma conta? Cadastre-se
          </a>
        </div>
      </div>
      <img
        className={stylesHome.imagemX}
        src={imagemX}
        alt="Pixelart tabuleiro com X"
      />
      <img
        className={stylesHome.imagemO}
        src={imagemO}
        alt="Pixelart tabuleiro com O"
      />
    </div>
  );
};

export default Login;