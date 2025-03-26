'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Jogador', {
      idJogador: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nicknameJogador: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pontuacaoJogadorXP: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      emailJogador: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      passwordJogador: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Jogador');
  }
};