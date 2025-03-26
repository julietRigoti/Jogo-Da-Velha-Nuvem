'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sala extends Model {
    static associate(models) {
      // Relacionamento com o Jogador1
      Sala.belongsTo(models.Jogador, {
        foreignKey: 'idJogadorCriouSala',  // Campo que referencia Jogador
        as: 'jogador1'             // Nome do alias
      });
    }
  }

  Sala.init({
    idSala: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    idJogadorCriouSala: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Jogador',  // Nome da tabela que está sendo referenciada
        key: 'idJogador'   // Chave primária da tabela referenciada
      }
    },
    qtdPartidasTotal: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    dataCriacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Sala',
    tableName: 'Sala', 
    timestamps: false,
    freezeTableName: true
  });

  return Sala;
};
