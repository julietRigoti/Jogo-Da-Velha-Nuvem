const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

const gerarToken = (idJogador) => {
  return jwt.sign({ idJogador }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

// Cadastro de jogador
exports.signup = async (req, res) => {
  const { nicknameJogador, emailJogador, passwordJogador } = req.body;

  try {
    const senhaHash = await bcrypt.hash(passwordJogador, 10);
    const jogador = await db.Jogador.create({
      nicknameJogador,
      emailJogador,
      passwordJogador: senhaHash,
    });

    const token = gerarToken(jogador.idJogador);

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      jogador,
      token,
    });
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    res.status(500).json({ mensagem: 'Erro interno ao cadastrar usuário.' });
  }
};

// Login de jogador
exports.login = async (req, res) => {
  const { emailJogador, passwordJogador } = req.body;

  try {
    const jogador = await db.Jogador.findOne({ where: { emailJogador } });

    if (!jogador || !(await bcrypt.compare(passwordJogador, jogador.passwordJogador))) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas!' });
    }

    const token = gerarToken(jogador.idJogador);
    res.json({ mensagem: 'Login bem-sucedido!', jogador, token });
  } catch (err) {
    console.error('Erro ao realizar login:', err);
    res.status(500).json({ mensagem: 'Erro ao tentar realizar login.' });
  }
};
