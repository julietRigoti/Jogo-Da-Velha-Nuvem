const express = require("express");
const { criarSala, entrarSala } = require("../controllers/salaController");
const router = express.Router();

router.post("/criar-sala", criarSala);
router.post("/entrar-sala/:idSala", entrarSala);

module.exports = router;
