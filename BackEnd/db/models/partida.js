'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Partida extends Model {
    static associate(models) {
      // Relacionamento com Sala
      Partida.belongsTo(models.Sala, {
        foreignKey: 'idSala',
        as: 'sala'
      });
    }
  }

  Partida.init({
    idPartida: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    idSala: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Sala',
        key: 'idSala'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    resultadosPartidas: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Partida',
    tableName: 'Partida',
    timestamps: false,
    freezeTableName: true
  });

  return Partida;
};
