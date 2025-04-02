// Exportar as credenciais do banco de dados
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_BASE,
    host: process.env.DB_HOST,
    dialect: (process.env.DB_DIALECT || "postgres").trim(), // Garantir que o dialeto seja definido
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_BASE,
    host: process.env.DB_HOST,
    dialect: (process.env.DB_DIALECT || "postgres").trim(), // Garantir que o dialeto seja definido
  },
};
