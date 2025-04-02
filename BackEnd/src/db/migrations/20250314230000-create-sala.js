"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sala", {
      idSala: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      idJogadorCriouSala: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Jogador", // Nome da tabela referenciada
          key: "idJogador", // Chave primária da tabela Jogador
        },
        onUpdate: "CASCADE", // Caso o idJogador seja alterado, atualiza a chave estrangeira
        onDelete: "CASCADE", // Se o jogador for deletado, apaga os registros associados
      },
      qtdPartidasTotal: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      dataCriacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Sala");
  },
};
