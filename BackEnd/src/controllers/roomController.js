const db = require('../models');

exports.createRoom = async (req, res) => {
  try {
    const { idJogador1 } = req.body;
    const newRoom = await db.Sala.create({
      idJogadorCriouPartida: idJogador1,
      dataCriacao: new Date(),
      qtdPartidas: 0,
    });
    res.json({ mensagem: 'Sala criada com sucesso!', room: newRoom });
  } catch (err) {
    console.error('Erro ao criar sala:', err);
    res.status(500).json({ mensagem: 'Erro ao criar sala.' });
  }
};

exports.joinRoom = async (req, res) => {
  const { idSala } = req.params;
  const { idJogador } = req.body;

  try {
    const sala = await db.Sala.findByPk(idSala);
    if (!sala) return res.status(404).json({ error: 'Sala não encontrada.' });

    const jogador = await db.Jogador.findByPk(idJogador);
    if (!jogador) return res.status(404).json({ error: 'Jogador não encontrado.' });

    jogador.idSala = sala.idSala;
    await jogador.save();

    res.json({ message: 'Jogador entrou na sala com sucesso!' });
  } catch (err) {
    console.error('Erro ao entrar na sala:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
