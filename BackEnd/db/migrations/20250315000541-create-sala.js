'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sala', {
      idSala: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idJogador1: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Jogador', // Nome da tabela referenciada
          key: 'idJogador'  // Chave primária da tabela Jogador
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idJogador2: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Jogador',
          key: 'idJogador'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      qtdPartidasTotal: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      idHistorico: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'Historico',
          key: 'idHistorico'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      resultadoTotalDasPartidas: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      dataCriacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sala');
  }
};
