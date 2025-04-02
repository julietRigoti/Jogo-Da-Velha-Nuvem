const {DATABASE_URL} = process.env;
const {Sequelize} = require("sequelize");

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Importante para Railway
    },
  },
});