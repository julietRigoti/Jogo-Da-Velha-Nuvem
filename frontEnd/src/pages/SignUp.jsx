import React, { useState, useContext } from "react";
import stylesSignUp from "../style/SignUp.module.css";
import stylesHome from "../style/Home.module.css";
import imagemX from "../imagens/X.gif";
import imagemO from "../imagens/O.gif";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../contexts/GameContext";

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const { dispatch } = useContext(GameContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }
        // Simula a inscrição do usuário
        const player = { name: formData.username, room: null };
        dispatch({ type: 'PLAYER', payload: player });
        console.log("Usuário cadastrado:", formData);
        navigate("/Menu");
    };

    return (
        <div className={stylesSignUp.principalDiv}>
            <h1 className={stylesHome.h1}>Jogo da Velha</h1>
            <div className={stylesSignUp.signUpContainer}>
                <h2>Cadastre-se</h2>
                <form onSubmit={handleSubmit} className={stylesSignUp.signUpForm}>
                    <div className={stylesSignUp.inputGroup}>
                        <label htmlFor="username">Usuário</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Digite seu usuário"
                            required
                        />
                    </div>
                    <div className={stylesSignUp.inputGroup}>
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Digite seu e-mail"
                            required
                        />
                    </div>
                    <div className={stylesSignUp.inputGroup}>
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
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
                    <button className={stylesSignUp.btnLink} onClick={() => navigate("/login")}>
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
