// Normalizar o codigo, ajuda evitar gambiarras
'use strict';
require('dotenv').config();

// Permite trabalhar com o sistema de arquivos do computador
const fs = require('fs');
// Fornece utilitarios para trabalhar com caminhos de arquivos e diretorios
const path = require('path');
// Sequelize é um ORM para Node.js, que tem suporte vários bancos de dados
// ORM mapeamento objeto-relacional, as tabelas do banco de dados sao 
// representadas em classes e os registros das tabelas seriam instancias dessas classes
const Sequelize = require('sequelize');
// Permite obter informacoes do processo na pagina atual
const process = require('process');
// Permite obter parte do caminho para o arquivo
const basename = path.basename(__filename);
// Verificar se deve utilizar a variavel global ou 'development'
const env = process.env.NODE_ENV || 'development';
// Incluir o arquivo
const config = require(__dirname + '/../config/database.js')[env];
// Criar a constate com objeto vazio
const db = {};

// Criar a variavel que recebe a conexao com banco de dados
let sequelize;
// Verifica qual configuracao de banco de dados voce deseja usar
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Usar as configuracoes do arquivo "config/database.js"
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Verificar a conexao com banco de dados
try {
  console.log("Conexão com o banco de dados realizado com sucesso!");
} catch (error) {
  console.log('Erro: Conexão com o banco de dados não realizado com sucesso!', error);
}

// Identificar o MODEL
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
