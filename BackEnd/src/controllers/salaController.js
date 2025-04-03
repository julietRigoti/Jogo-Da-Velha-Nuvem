const db = require("../models");

exports.criarSala = async (req, res) => {
  try {
    const { idJogador1 } = req.body;
    const newRoom = await db.Sala.create({
      idJogadorCriouSala: idJogador1, // Corrigido de "idJogadorCriouPartida"
      dataCriacao: new Date(),
      qtdPartidas: 0,
    });
    res.json({ mensagem: "Sala criada com sucesso!", room: newRoom });
  } catch (err) {
    console.error("Erro ao criar sala:", err);
    res.status(500).json({ mensagem: "Erro ao criar sala." });
  }
};

