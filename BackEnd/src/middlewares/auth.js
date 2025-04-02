const jwt = require("jsonwebtoken");
require('dotenv').config({
  path: process.env.NODE_ENV === 'development' ? '.env' : '.env.nuvem',
});

const autenticarJWT = (socket, next) => {
  console.debug("🔍 Autenticando jogador...");

  try {
    const token = socket.handshake.auth?.token;
    if (!token) throw new Error("Token não fornecido");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error(err.message || "Erro na autenticação"));
  }
};

module.exports = autenticarJWT;