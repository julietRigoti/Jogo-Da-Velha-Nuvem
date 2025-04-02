"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Historico", {
      idHistorico: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      idSala: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Sala", // Nome da tabela referenciada
          key: "idSala", // Chave primária da tabela Sala
        },
        onUpdate: "CASCADE", // Caso o idJogador seja alterado, atualiza a chave estrangeira
        onDelete: "CASCADE", // Se o jogador for deletado, apaga os registros associados
      },

      idJogador1: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Jogador", // Nome da tabela referenciada
          key: "idJogador", // Chave primária da tabela Jogador
        },
        onUpdate: "CASCADE", // Caso o idJogador seja alterado, atualiza a chave estrangeira
        onDelete: "CASCADE", // Se o jogador for deletado, apaga os registros associados
      },
      idJogador2: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Jogador",
          key: "idJogador",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      dataCriada: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"), // Valor padrão de data de criação
      },
      pontuacaoJogador1: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      pontuacaoJogador2: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Historico");
  },
};
