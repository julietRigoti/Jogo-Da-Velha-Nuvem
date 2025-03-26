const express = require('express');
const { checkPlayer } = require('../controllers/playerController');
const router = express.Router();

router.get('/check-player/:idJogador', checkPlayer);

module.exports = router;
