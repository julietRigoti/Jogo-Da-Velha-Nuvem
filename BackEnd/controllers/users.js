// Incluir as bibliotecas
// Gerenciar as requisicoes, rotas e URLs, entre outras funcionalidades
const express = require('express');
// Chamar a funcao express
const router = express.Router();
// Incluir o arquivo que possui a conexao com o banco de dados
const db = require('./../db/models/index');

// Criar a rota listar 
router.get("/listar", async (req, res) => {
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

// Criar a rota cadastrar
router.post("/cadastrar", async (req, res) => {
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

// Exportar a instrução que está dentro da constante router
module.exports = router;