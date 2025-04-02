require("dotenv").config(); // Certifique-se que o dotenv está carregado

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL", // Pegando direto do .env
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, // Se o banco do Railway exigir SSL
        rejectUnauthorized: false,
      },
    },
  },
};
