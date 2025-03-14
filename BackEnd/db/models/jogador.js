'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jogador extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Jogador.init(
    {
      idJogador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Isso irá gerar a auto-incrementação
        allowNull: false,
      },
      nicknameJogador: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pontuacaoJogadorXP: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      emailJogador: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      passwordJogador: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
    sequelize,
    tableName: 'Jogador',
    modelName: 'Jogador',
    timestamps: false,
    freezeTableName: true, // Isso impede o Sequelize de pluralizar a tabela
  });
  return Jogador;
};