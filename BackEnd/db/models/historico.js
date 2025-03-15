'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Historico extends Model {
    
    static associate(models) {
      // Relacionamento com o Jogador1
      Historico.belongsTo(models.Jogador, {
        foreignKey: 'idJogador1',  // Campo que referencia Jogador
        as: 'jogador1'             // Nome do alias
      });

      // Relacionamento com o Jogador2
      Historico.belongsTo(models.Jogador, {
        foreignKey: 'idJogador2',  // Campo que referencia Jogador
        as: 'jogador2'             // Nome do alias
      });
    }
  }

  Historico.init({
    idHistorico: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Isso irá gerar a auto-incrementação
      allowNull: false,
    },
    idJogador1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Jogador',  // Nome da tabela que está sendo referenciada
        key: 'idJogador'   // Chave primária da tabela referenciada
      }
    },
    idJogador2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Jogador',
        key: 'idJogador'
      }
    },
    qtdDeXPQueVaiReceber: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    dataCriada: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    modelName: 'Historico',
    tableName: 'Historico', // Especificando o nome da tabela
    timestamps: false,       // Não utilizar timestamps automáticos (createdAt, updatedAt)
    freezeTableName: true, 
  });

  return Historico;
};
