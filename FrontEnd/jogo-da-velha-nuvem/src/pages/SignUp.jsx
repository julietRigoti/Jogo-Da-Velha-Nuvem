import React, { useState, useContext } from "react";
import stylesSignUp from "../style/Signup.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../assets/X.gif";
import imagemO from "../assets/O.gif";
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
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useContext(GameContext);
  const navigate = useNavigate();

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Função para enviar os dados ao backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validações organizadas
    if (formData.nicknameJogador.trim().length < 3) {
      return setError("O nickname deve ter pelo menos 3 caracteres!");
    }
    if (!/\S+@\S+\.\S+/.test(formData.emailJogador)) {
      return setError("O e-mail deve ser válido!");
    }
    if (formData.passwordJogador.length < 6) {
      return setError("A senha deve ter pelo menos 6 caracteres!");
    }
    if (formData.passwordJogador !== formData.confirmPassword) {
      return setError("As senhas não coincidem!");
    }

    console.log("Dados do jogador:", formData); // Aqui você pode ver os dados antes de enviar

    try {
      const backendUrl =
      import.meta.env.VITE_REACT_APP_ENV === "development"
        ? import.meta.env.VITE_REACT_APP_BACKEND_URL_LOCAL
        : import.meta.env.nuvem.VITE_REACT_APP_BACKEND_URL_NUVEM;
      if (!backendUrl) {
        throw new Error("Backend URL não está configurado.");
      }
      console.log("URL do backend:", backendUrl); // Aqui você pode ver a URL do backend
      const response = await fetch(`${backendUrl}/auth/signup`, { //precisa mudar esse link para o do backend na nuvem
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicknameJogador: formData.nicknameJogador,
          emailJogador: formData.emailJogador,
          passwordJogador: formData.passwordJogador,
        }),
      });

      const data = await response.json();

      console.log("Resposta do servidor:", data); // Aqui você pode ver a resposta do servidor
      if (!response.ok) throw new Error(data.message || "Erro no servidor");

      const { jogador, token } = data; // Extrair os dados do jogador e o token
      if (!jogador || !token) {
        throw new Error("Dados incompletos recebidos do servidor.");
      }

      // Atualiza o contexto global
      dispatch({
        type: "SET_PLAYER",
        payload: {
          id: jogador.idJogador,
          nickname: jogador.nicknameJogador,
          token: token,
        },
      });

      // Salva informações do jogador no sessionStorage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("idJogador", jogador.idJogador);
      sessionStorage.setItem("nicknameJogador", jogador.nicknameJogador);

      // Redireciona para a página de criação de sala
      navigate("/criar-sala");
    } catch (error) {
      if (error.message === "Failed to fetch") {
        setError("Erro de conexão com o servidor. Tente novamente mais tarde.");
      } else {
        setError(error.message || "Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
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
