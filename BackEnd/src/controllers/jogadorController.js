const db = require("../models");

exports.checkPlayer = async (req, res) => {
  const { idJogador } = req.params;
  try {
    const jogador = await db.Jogador.findByPk(idJogador);
    if (!jogador) return res.status(404).json({ exists: false });
    res.json({ exists: true });
  } catch (err) {
    console.error("Erro ao verificar jogador:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};
