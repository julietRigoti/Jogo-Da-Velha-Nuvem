import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext"; // Já está assim, mas vale reforçar.
import stylesLogin from "../style/Login.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../imagens/X.gif";
import imagemO from "../imagens/O.gif";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { dispatch } = useContext(GameContext);
  const navigate = useNavigate();

  const [ws, setWs] = useState(null); // Para armazenar a conexão WebSocket

  // Função para autenticar o usuário
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpa mensagens de erro anteriores

    try {
      // Requisição para a rota de login do back-end
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailJogador: email,
          passwordJogador: password,
        }),
      });

      // Verificar se a resposta é JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta do servidor não é JSON.");
      }

      const data = await response.json();

      // Verifica se o login foi bem-sucedido
      if (!response.ok) {
        throw new Error(data.mensagem || "Erro ao fazer login.");
      }

      // Salva os dados do jogador no contexto
      const player = {
        name: data.jogador.nicknameJogador,
        id: data.jogador.idJogador,
        xp: data.jogador.pontuacaoJogadorXP,
      };

      dispatch({ type: "PLAYER", payload: player });
      localStorage.setItem("idJogador", data.jogador.idJogador);
      console.log("idJogador:", localStorage.getItem("idJogador"));


      const pendingidSala = localStorage.getItem("pendingidSala");
      if (pendingidSala) {
        localStorage.removeItem("pendingidSala");
        navigate(`/join-room/${pendingidSala}`);
      } else {
        navigate("/create-room");
      }
    } catch (error) {
      console.error("Erro no login:", error.message);
      setError(error.message); // Exibe a mensagem de erro
    }
  };



  return (
    <div className={stylesHome.principalDiv}>
      <h1 className={stylesHome.h1}>Jogo da Velha</h1>
      <div className={stylesLogin.loginContainer}>
        <h2 className={stylesHome.h2}>Entrar</h2>

        {error && <p className={stylesLogin.error}>{error}</p>} {/* Exibe erro caso haja */}

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
              onChange={(e) => setEmail(e.target.value)} // Atualiza email
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
              onChange={(e) => setPassword(e.target.value)} // Atualiza senha
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