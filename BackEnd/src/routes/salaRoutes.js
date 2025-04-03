const express = require("express");
const { criarSala, entrarSala } = require("../controllers/salaController");
const cors = require("cors");

const router = express.Router();

// Rota para criar uma sala
router.post("/criar-sala", criarSala);

// Rota para entrar em uma sala
router.post("/entrar-sala/:idSala", entrarSala);

module.exports = router;
