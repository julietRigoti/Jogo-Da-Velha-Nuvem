const express = require('express');
const { createRoom, joinRoom } = require('../controllers/roomController');
const router = express.Router();

router.post('/create-room', createRoom);
router.post('/join-room/:idSala', joinRoom);

module.exports = router;
