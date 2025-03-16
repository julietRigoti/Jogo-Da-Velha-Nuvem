'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Sala', 'idJogador2', {
      type: Sequelize.BIGINT,
      allowNull: true, // Permite que idJogador2 seja nulo
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Sala', 'idJogador2', {
      type: Sequelize.BIGINT,
      allowNull: false, // Reverte para não permitir null
    });
  }
};
