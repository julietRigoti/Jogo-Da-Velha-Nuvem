// Incluir as bibliotecas
// Gerenciar as requisicoes, rotas e URLs, entre outras funcionalidades
const express = require('express');
// Chamar a funcao express
const router = express.Router();
// Incluir o arquivo que possui a conexao com o banco de dados
const db = require('./../db/models/index');

// Criar a rota listar (Mostrar o Ranking dos Jogadores por meio da sua pontuacao)
router.get("/users", async (req, res) => {
    // Recuperar todos os usuarios do banco de dados 
    const users = await db.Jogador.findAll({
        // Indicar quais colunas recuperar 
        attributes: ['nicknameJogador', 'pontuacaoJogadorXP'],

        // Ordena os registros pela coluna id na forma decrescente 
        order: [['pontuacaoJogadorXP', 'DESC']]
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (users) {
        return res.json({
            users
        });
    } else {
        // Pausa o processamento e retorna a mensagem de erro
        return res.status(400).json({
            mensagem: "Erro: Usuario nao cadastrado com sucesso!"
        });
    }

});

// Criar a rota visualizar e receber o parametro id enviado na URL (Mostrar as informacoes especificas do jogador)
router.get("/users/:idJogador", async (req, res) => {
    // Receber um parametro enviado na URL
    const { idJogador } = req.params;

    // Recuperar o registro do banco de dados
    const user = await db.Jogador.findOne({
        // Indicar quais colunas recuperar
        attributes: ['idJogador', 'nicknameJogador', 'pontuacaoJogadorXP'],

        // Acrescentar condicao para indicar qual registro deve ser retornado do banco de dados
        where: { idJogador },
    });

    // Acessar o IF se encontrar o registro no banco de dados
    if (user) {
        // Pausar o processamento e retornar os dados
        return res.json({
            user: user.dataValues
        });
    } else {
        // Pausar o processamento e retornar a mensagem de erro
        return res.status(400).json({
            mensagem: "Erro: Usuário não encontrado!"
        });
    }
});

// Criar a rota cadastrar
router.post("/users", async (req, res) => {
    try {
        // Receber os dados enviados no corpo da requisicao
        var dados = req.body;
        console.log(dados);

        // Salvar no banco de dados
        const dadosJogador = await db.Jogador.create(dados);

        // Enviar resposta com sucesso
        return res.json({
            mensagem: "Usuário cadastrado com sucesso!",
            dadosJogador
        });
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);

        // Enviar resposta de erro
        return res.status(500).json({
            mensagem: "Erro: Usuário não cadastrado com sucesso!",
            error: err.message
        });
    }
});

// Criar a rota de login
router.post("/login", async (req, res) => {
    try {
        // Receber os dados enviados no corpo da requisição (email e senha)
        const { emailJogador, passwordJogador } = req.body;

        // Verificar se o usuário existe no banco de dados
        const jogador = await db.Jogador.findOne({
            where: { emailJogador }
        });

        // Se o jogador não for encontrado, retornar erro
        if (!jogador) {
            return res.status(400).json({
                mensagem: "Erro: Usuário não encontrado!"
            });
        }

        // Comparar a senha fornecida com a armazenada no banco
        if (jogador.passwordJogador !== passwordJogador) {
            return res.status(400).json({
                mensagem: "Erro: Senha incorreta!"
            });
        }

        // Se tudo estiver correto, retornar os dados do jogador
        return res.json({
            mensagem: "Login bem-sucedido!",
            jogador: jogador.dataValues
        });
    } catch (err) {
        console.error('Erro ao realizar login:', err);
        return res.status(500).json({
            mensagem: "Erro ao tentar realizar login.",
            error: err.message
        });
    }
});


// Criar a rota para editar (sera utilizada para atualizar o XP do jogador)
router.put("/users", async (req, res) => {
    // Receber os dados enviados no corpo da requisicao
    var dados = req.body;

    // Editar no banco de dados 
    await db.Jogador.update(dados, { where: { idJogador: dados.idJogador } })
        .then(() => {
            // Pausar o processamento e retornar a mensagem
            return res.json({
                mensagem: "Usuario editado com sucesso!"
            });
        }).catch(() => {
            // Pausar o processamento e retornar a mensagem
            return res.status(400).json({
                mensagem: "Erro: Usuario nao editado com sucesso!"
            });
        });
});

// Exportar a instrução que está dentro da constante router
module.exports = router;