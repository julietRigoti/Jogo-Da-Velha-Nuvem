const express = require("express");
const cors = require("cors");

const { signup, login } = require("../controllers/authController");

const router = express.Router();

// Middleware de CORS específico para essas rotas
const corsOptions = {
  origin: "https://jogo-da-velha-nuvem.vercel.app",
};

// Rota de cadastro (signup)
router.post("/signup", cors(corsOptions), signup);

// Rota de login
router.post("/login", cors(corsOptions), login);

module.exports = router;
