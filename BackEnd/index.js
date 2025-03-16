// index.js (servidor Express)

const express = require('express');
const router = require('./controllers/users');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db/models'); // Importar o arquivo de configuração do Sequelize para garantir que a conexão com o banco seja feita

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/', router);

app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});
