import React, { useState, useContext } from "react";
import stylesSignUp from "../style/SignUp.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../imagens/X.gif";
import imagemO from "../imagens/O.gif";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";

const SignUp = () => {
  const [formData, setFormData] = useState({
    nicknameJogador: "",
    emailJogador: "",
    passwordJogador: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const { dispatch } = useContext(GameContext);
  const navigate = useNavigate();

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Função para enviar os dados ao backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpar mensagens de erro anteriores

    // Verificar se as senhas coincidem
    if (formData.passwordJogador !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
    }

    try {
      // Requisição para o endpoint do backend
      const response = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicknameJogador: formData.nicknameJogador,
          emailJogador: formData.emailJogador,
          passwordJogador: formData.passwordJogador,
        }),
      });

      const data = await response.json();
      console.log('Usuário cadastrado:', data);

      if (!response.ok) {
        throw new Error('Erro no servidor');
      }

      navigate("/create-room");
    } catch (error) {
      console.error("Erro no cadastro:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className={stylesSignUp.principalDiv}>
      <h1 className={stylesHome.h1}>Jogo da Velha</h1>

      <div className={stylesSignUp.signUpContainer}>
        <h2>Cadastre-se</h2>

        {error && <p className={stylesSignUp.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={stylesSignUp.signUpForm}>
          <div className={stylesSignUp.inputGroup}>
            <label htmlFor="nicknameJogador">Usuário</label>
            <input
              type="text"
              id="nicknameJogador"
              name="nicknameJogador"
              value={formData.nicknameJogador}
              onChange={handleChange}
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div className={stylesSignUp.inputGroup}>
            <label htmlFor="emailJogador">E-mail</label>
            <input
              type="email"
              id="emailJogador"
              name="emailJogador"
              value={formData.emailJogador}
              onChange={handleChange}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className={stylesSignUp.inputGroup}>
            <label htmlFor="passwordJogador">Senha</label>
            <input
              type="password"
              id="passwordJogador"
              name="passwordJogador"
              value={formData.passwordJogador}
              onChange={handleChange}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <div className={stylesSignUp.inputGroup}>
            <label htmlFor="confirmPassword">Confirme a senha</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              required
            />
          </div>

          <button type="submit" className={stylesSignUp.btnSubmit}>
            Cadastrar
          </button>
        </form>

        <div className={stylesSignUp.loginLink}>
          <button
            className={stylesSignUp.btnLink}
            onClick={() => navigate("/login")}
          >
            Já tem uma conta? Faça login
          </button>
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

export default SignUp;
