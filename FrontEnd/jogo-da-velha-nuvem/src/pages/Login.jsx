import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";
import stylesLogin from "../style/Login.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../assets/X.gif";
import imagemO from "../assets/O.gif";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { dispatch } = useContext(GameContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailJogador: email, passwordJogador: password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao fazer login.");

      const { jogador, token } = data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("idJogador", jogador.idJogador);
      sessionStorage.setItem("nicknameJogador", jogador.nicknameJogador);

      dispatch({
        type: "SET_PLAYER",
        payload: { id: jogador.idJogador, nickname: jogador.nicknameJogador },
      });

      navigate("/criar-sala", {
        state: {
          idJogador: jogador.idJogador,
          nicknameJogador: jogador.nicknameJogador,
          jwtToken: token,
        },
      });
    } catch (error) {
      console.error("Erro no login:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className={stylesHome.principalDiv}>
      <h1 className={stylesHome.h1}>Jogo da Velha</h1>
      <div className={stylesLogin.loginContainer}>
        <h2 className={stylesHome.h2}>Entrar</h2>
        {error && <p className={stylesLogin.error}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className={stylesLogin.formControlContainer}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              className={stylesLogin.formControl}
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={stylesLogin.formControlContainer}>
            <label htmlFor="password">Senha</label>
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
