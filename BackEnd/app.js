// Incluir as bibliotecas 
// Gerenciar as requisicoes, rotas e URLs, entre outras funcionalidades
const express = require('express');
// Chamar a funcao express
const app = express();

// Criar o middleware para receber os dados no corpo da requisicao 
app.use(express.json());


// Testar conexão com banco de dados
//const db = require("./db/models");

// Incluir as CONTROLLERS
const users = require('./controllers/users');

// Criar as rotas
app.use('/', users);

// Iniciar o servidor na porta 8080, criar a funcao utilizando modelo Arrow Function para retornar a mensagem de sucesso
app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});