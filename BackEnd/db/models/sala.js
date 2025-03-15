'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sala extends Model {
    static associate(models) {
      // Relacionamento com o Jogador1
      Sala.belongsTo(models.Jogador, {
        foreignKey: 'idJogador1',
        as: 'jogador1'
      });

      // Relacionamento com o Jogador2
      Sala.belongsTo(models.Jogador, {
        foreignKey: 'idJogador2',
        as: 'jogador2'
      });

      // Relacionamento com o Histórico
      Sala.belongsTo(models.Historico, {
        foreignKey: 'idHistorico',
        as: 'historico'
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
    idJogador1: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Jogador',
        key: 'idJogador'
      }
    },
    idJogador2: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Jogador',
        key: 'idJogador'
      }
    },
    qtdPartidasTotal: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    idHistorico: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'Historico',
        key: 'idHistorico'
      }
    },
    resultadoTotalDasPartidas: {
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
