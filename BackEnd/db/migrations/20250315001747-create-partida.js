'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Partida', {
      idPartida: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      idSala: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Sala', // Nome da tabela referenciada
          key: 'idSala'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      resultadosPartidas: {
        type: Sequelize.BIGINT,
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Partida');
  }
};
