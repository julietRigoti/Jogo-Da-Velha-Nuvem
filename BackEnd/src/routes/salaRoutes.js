const express = require("express");
const { criarSala} = require("../controllers/salaController");

const router = express.Router();

// Rota para criar uma sala
router.post("/criar-sala", criarSala);

module.exports = router;
