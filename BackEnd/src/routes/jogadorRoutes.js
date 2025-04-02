const express = require('express');
const { checkPlayer } = require('../controllers/jogadorController');
const router = express.Router();

router.get('/check-jogador/:idJogador', checkPlayer);

module.exports = router;
