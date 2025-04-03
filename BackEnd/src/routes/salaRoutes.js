const express = require("express");
const { criarSala, entrarSala } = require("../controllers/salaController");
const cors = require("cors");

const router = express.Router();

// Configuração de CORS específica para essas rotas
const corsOptions = {
  origin: "https://jogo-da-velha-nuvem.vercel.app",
};

// Rota para criar uma sala
router.post("/criar-sala", cors(corsOptions), criarSala);

// Rota para entrar em uma sala
router.post("/entrar-sala/:idSala", cors(corsOptions), entrarSala);

module.exports = router;
