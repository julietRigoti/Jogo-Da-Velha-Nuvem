'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Historico', {
      idHistorico: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idJogador1: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Jogador',  // Nome da tabela referenciada
          key: 'idJogador'   // Chave primária da tabela Jogador
        },
        onUpdate: 'CASCADE',  // Caso o idJogador seja alterado, atualiza a chave estrangeira
        onDelete: 'CASCADE'   // Se o jogador for deletado, apaga os registros associados
      },
      idJogador2: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Jogador',
          key: 'idJogador'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      qtdDeXPQueVaiReceber: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      dataCriada: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Valor padrão de data de criação
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Historico');
  }
};
