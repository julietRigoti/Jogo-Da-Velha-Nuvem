import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";
import stylesLogin from "../style/Login.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../assets/X.gif";
import imagemO from "../assets/O.gif";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.nuvem' });

const Login = () => {
  const [formData, setFormData] = useState({
    emailJogador: "",
    passwordJogador: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useContext(GameContext);
  const navigate = useNavigate();

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Função para lidar com o login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    if (!formData.emailJogador || !formData.passwordJogador) {
      setError("Por favor, preencha todos os campos.");
      setIsLoading(false);
      return;
    }
  
    try {
      const backendUrl = process.env.VITE_REACT_APP_BACKEND_URL_NUVEM;

      const response = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro no servidor");
  
      const { jogador, token } = data;
  
      // Salva o token e informações do jogador no sessionStorage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("idJogador", jogador.idJogador);
      sessionStorage.setItem("nicknameJogador", jogador.nicknameJogador);
  
      console.log("Token salvo no sessionStorage:", token);
  
      dispatch({
        type: "SET_PLAYER",
        payload: {
          token: token,
          idJogador: jogador.idJogador,
          nicknameJogador: jogador.nicknameJogador,
        },
      });
  
      console.log("Login bem-sucedido. Redirecionando para criar sala...");
      navigate("/criar-sala");
    } catch (error) {
      setError(error.message || "Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={stylesHome.principalDiv}>
      <h1 className={stylesHome.h1}>Jogo da Velha</h1>
      <div className={stylesLogin.loginContainer}>
        <h2 className={stylesHome.h2}>Entrar</h2>
        {error && <p className={stylesLogin.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className={stylesLogin.formControlContainer}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="emailJogador"
              name="emailJogador"
              className={stylesLogin.formControl}
              placeholder="Digite seu e-mail"
              value={formData.emailJogador}
              onChange={handleChange}
              required
            />
          </div>

          <div className={stylesLogin.formControlContainer}>
            <label htmlFor="passwordJogador">Senha</label>
            <input
              type="password"
              id="passwordJogador"
              name="passwordJogador"
              className={stylesLogin.formControl}
              placeholder="Digite sua senha"
              value={formData.passwordJogador}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={stylesLogin.btnPrimary} disabled={isLoading}>
            {isLoading ? "Carregando..." : "Entrar"}
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
