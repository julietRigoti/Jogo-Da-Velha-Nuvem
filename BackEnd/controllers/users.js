// Incluir as bibliotecas
const express = require("express");
const router = express.Router();
const db = require("./../db/models");

router.get("/check-player/:idJogador", async (req, res) => {
    const { idJogador } = req.params;
    try {
        console.log('Recebido jogadorId:', idJogador); // Log para depuração
        const jogador = await db.Jogador.findByPk(idJogador);
        if (!jogador) {
            return res.status(404).json({ exists: false });
        }
        res.json({ exists: true });
    } catch (error) {
        console.error('Erro ao verificar jogador:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});


// Criar a rota cadastrar
router.post("/signup", async (req, res) => {
    const { nicknameJogador, emailJogador, passwordJogador } = req.body;

    try {
        const jogador = await db.Jogador.create({
            nicknameJogador,
            emailJogador,
            passwordJogador,
        });
        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            jogador,
        });
    } catch (err) {
        console.error("Erro ao cadastrar usuário:", err);
        return res.status(500).json({
            mensagem: "Erro: Usuário não cadastrado",
            error: err.message,
        });
    }
});

// Criar a rota de login
router.post("/login", async (req, res) => {
    const { emailJogador, passwordJogador } = req.body;

    try {
        const jogador = await db.Jogador.findOne({
            where: { emailJogador },
        });

        if (!jogador) {
            return res.status(404).json({
                mensagem: "Erro: Usuário não encontrado!",
            });
        }

        if (jogador.passwordJogador !== passwordJogador) {
            return res.status(400).json({
                mensagem: "Erro: Senha incorreta!",
            });
        }

        return res.json({
            mensagem: "Login bem-sucedido!",
            jogador: jogador.dataValues,
        });
    } catch (err) {
        console.error("Erro ao realizar login:", err);
        return res.status(500).json({
            mensagem: "Erro ao tentar realizar login.",
            error: err.message,
        });
    }
});

router.post("/create-room", async (req, res) => {
    const {idJogador1} = req.body;
   

    try {
        const newRoom = await db.Sala.create({
            idJogador1,
            idJogador2: null,
            qtdPartidasTotal: 0,
            resultadoTotalDasPartidas: 0
        });

        return res.status(201).json({
            mensagem: "Sala criada com sucesso!",
            room: newRoom,
        });
    } catch (err) {
        console.error("Erro ao criar sala:", err);
        return res.status(500).json({
            mensagem: "Erro: Sala não criada",
            error: err.message,
        });
    }
});

router.post("/join-room/:idSala", async (req, res) => {
    const { idSala } = req.params;
    const { idJogador } = req.body;

    try {
        const sala = await db.Sala.findByPk(idSala);
        if (!sala) {
            return res.status(404).json({ error: 'Sala não encontrada.' });
        }

        const jogador = await db.Jogador.findByPk(idJogador);
        if (!jogador) {
            return res.status(404).json({ error: 'Jogador não encontrado.' });
        }

        // Atualiza o jogador para associá-lo à sala
        jogador.idSala = sala.idSala;
        await jogador.save();

        res.json({ message: 'Jogador entrou na sala com sucesso!' });
    } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

router.get("/room/:idSala", async (req, res) => {
    const { idSala } = req.params;

    try {
        const sala = await db.Sala.findByPk(idSala, {
            include: [
                { model: db.Jogador, as: 'jogador1' },
                { model: db.Jogador, as: 'jogador2' }
            ]
        });

        if (!sala) {
            return res.status(404).json({
                mensagem: "Erro: Sala não encontrada!",
            });
        }
        res.json({
            idSala: sala.idSala,
            jogadores: [
                sala.jogador1 ? {
                    idJogador: sala.jogador1.idJogador,
                    nicknameJogador: sala.jogador1.nicknameJogador,
                    simbolo: sala.jogador1.simbolo
                } : null,
                sala.jogador2 ? {
                    idJogador: sala.jogador2.idJogador,
                    nicknameJogador: sala.jogador2.nicknameJogador,
                    simbolo: sala.jogador2.simbolo
                } : null
            ].filter(j => j !== null)
        });
    } catch (err) {
        console.error("Erro ao buscar sala:", err);
        return res.status(500).json({
            mensagem: "Erro ao buscar sala.",
            error: err.message,
        });
    }
});

router.post("/room/:idSala/choose-symbol", async (req, res) => {
    const { idSala } = req.params;
    const { idJogador, simbolo } = req.body;

    try {
        const sala = await db.Sala.findByPk(idSala);
        const nicknameJogador = await db.Jogador.findByPk(idJogador);

        if (!sala) {
            return res.status(404).json({
                mensagem: "Erro: Sala não encontrada!",
            });
        }

        if (sala.idJogador1 !== idJogador && sala.idJogador2 !== idJogador) {
            return res.status(403).json({
                mensagem: "Erro: Jogador não pertence à sala!",
            });
        }

        if (sala.idJogador1 === idJogador) {
            sala.simboloJogador1 = simbolo;
        } else {
            sala.simboloJogador2 = simbolo;
        }

        await sala.save();

        return res.json({
            mensagem: "Símbolo escolhido com sucesso!",
        });
    } catch (err) {
        console.error("Erro ao escolher símbolo:", err);
        return res.status(500).json({
            mensagem: "Erro ao escolher símbolo.",
            error: err.message,
        });
    }
});


module.exports = router;
