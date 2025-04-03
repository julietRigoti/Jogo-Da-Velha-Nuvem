const express = require("express");
const cors = require("cors");

const { signup, login } = require("../controllers/authController");

const router = express.Router();

// Rota de cadastro (signup)
router.post("/signup", cors(corsOptions), signup);

// Rota de login
router.post("/login", cors(corsOptions), login);

module.exports = router;
