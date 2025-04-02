const express = require("express");
const { criarSala, entrarSala } = require("../controllers/salaController");
const router = express.Router();

router.post(
    '/criar-sala',
    cors({
      origin: 'https://jogo-da-velha-nuvem.vercel.app',
    }),
    (req, res) => {
      // Lógica do signup
      res.json({ message: 'Sala criada com sucesso!' });
    }
  );
router.post("/entrar-sala/:idSala", entrarSala);

module.exports = router;
