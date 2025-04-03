const express = require("express");
const cors = require("cors");

const { signup, login } = require("../controllers/authController");

const router = express.Router();

// Rota de cadastro (signup)
router.post("/signup", signup);

// Rota de login
router.post("/login", login);

module.exports = router;
