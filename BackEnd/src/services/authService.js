const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuarioJogador = require("../models/Jogador");

require("dotenv").config({
  path: process.env.NODE_ENV === "development" ? ".env" : ".env.nuvem",
});

console.log("A variável de ambiente NODE_ENV é:", process.env.NODE_ENV); // Verifica o ambiente

const generateToken = (usuario) =>
  jwt.sign({ id: usuario.idJogador }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });

const signup = async (nicknameJogador, emailJogador, passwordJogador) => {
  const existeUsuario = await usuarioJogador.findOne({
    where: { emailJogador },
  });
  if (existeUsuario) {
    throw new Error("Erro: Usuário já cadastrado!");
  }
  const hashPassword = await bcrypt.hash(passwordJogador, 10);
  const novoUsuario = await usuarioJogador.create({
    nicknameJogador,
    emailJogador,
    passwordJogador: hashPassword,
  });
  return generateToken(novoUsuario);
};

const login = async (emailJogador, passwordJogador) => {
  const jogador = await usuarioJogador.findOne({
    where: { emailJogador },
  });
  if (!jogador) {
    throw new Error("Erro: Usuário não encontrado!");
  }
  if (!(await bcrypt.compare(passwordJogador, jogador.passwordJogador))) {
    throw new Error("Erro: Senha incorreta!");
  }
  return generateToken(jogador);
};

module.exports = {
  signup,
  login,
};
