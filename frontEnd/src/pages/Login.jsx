import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext"; 
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

  // Função para autenticar o usuário
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpa mensagens de erro anteriores

    try {
      // Requisição para a rota de login do backend
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailJogador: email, passwordJogador: password }),
      });

      const data = await response.json();

      // Se o login falhar, lança erro
      if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login.");
      }

      // Salva o token JWT no localStorage
      localStorage.setItem("token", data.token);

      // Atualiza o estado do jogador no contexto
      dispatch({ 
        type: "SET_PLAYER", 
        payload: { email: email } // Apenas email (evita expor mais dados do necessário)
      });

      // Redireciona para a sala apropriada
      const pendingidSala = localStorage.getItem("pendingidSala");
      if (pendingidSala) {
        localStorage.removeItem("pendingidSala");
        navigate(`/join-room/${pendingidSala}`);
      } else {
        navigate("/create-room");
      }
    } catch (error) {
      console.error("Erro no login:", error.message);
      setError(error.message); // Exibe erro na tela
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

      <img className={stylesHome.imagemX} src={imagemX} alt="Pixelart tabuleiro com X" />
      <img className={stylesHome.imagemO} src={imagemO} alt="Pixelart tabuleiro com O" />
    </div>
  );
};

export default Login;
