const express = require("express");
const cors = require("cors");

const { signup, login } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  cors({
    origin: "https://jogo-da-velha-nuvem.vercel.app",
  }),
  (req, res) => {
    // Lógica do signup
    res.json({ message: "Usuário cadastrado com sucesso!" });
  }
);
router.post(
  "/login",
  cors({
    origin: "https://jogo-da-velha-nuvem.vercel.app",
  }),
  (req, res) => {
    // Lógica do signup
    res.json({ message: "Login com sucesso!" });
  }
);

module.exports = router;
