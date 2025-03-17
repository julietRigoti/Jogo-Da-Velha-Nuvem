// Incluir as bibliotecas
const express = require("express");
const router = express.Router();
const db = require("./../db/models");

router.get("/check-player/:idJogador", async (req, res) => {
    const { idJogador } = req.params;

    try {
        const jogador = await db.Jogador.findByPk(idJogador);

        if (!jogador) {
            return res.json({
                exists: false,
            });
        }

        return res.json({
            exists: true,
        });
    } catch (err) {
        console.error("Erro ao verificar jogador:", err);
        return res.status(500).json({
            mensagem: "Erro ao verificar jogador.",
            error: err.message,
        });
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

router.post("/join-room/:idSala", (req, res) => {
    const { idSala } = req.params;
    const { idJogador2 } = req.body;

    try {
        const room = db.Sala.findOne({
            where: { idSala },
        });

        if (!room) {
            return res.status(404).json({
                mensagem: "Erro: Sala não encontrada!",
            });
        }

        if (room.idJogador2) {
            return res.status(400).json({
                mensagem: "Erro: Sala já possui dois jogadores!",
            });
        }

        const [updated] = db.Sala.update({ idJogador2 }, { where: { idSala } });

        if (updated) {
            return res.json({
                mensagem: "Jogador adicionado à sala com sucesso!",
            });
        } else {
            return res.status(404).json({
                mensagem: "Erro: Jogador não adicionado à sala!",
            });
        }
    } catch (err) {
        console.error("Erro ao adicionar jogador à sala:", err);
        return res.status(500).json({
            mensagem: "Erro ao adicionar jogador à sala.",
            error: err.message,
        });
    }
});

module.exports = router;
