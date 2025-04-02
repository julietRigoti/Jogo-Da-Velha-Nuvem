"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development"; // Usa o NODE_ENV ou 'development' como padrão
const config = require(path.join(__dirname, "../db/config/database.js"))[env];
const db = {};

const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Configuração do Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
});

// Teste de conexão com o banco de dados
sequelize
  .authenticate()
  .then(() => console.log("🔥 Conectado ao PostgreSQL no Railway!"))
  .catch((err) => console.error("❌ Erro ao conectar ao banco:", err));

// Carregar os models
const modelsPath = __dirname;

fs.readdirSync(modelsPath)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(modelsPath, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Configurar associações entre os models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
