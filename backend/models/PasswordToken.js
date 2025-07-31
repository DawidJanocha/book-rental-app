// src/models/PasswordToken.js
import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const PasswordToken = sequelize.define('PasswordToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // όνομα πίνακα User
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  tokenHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'password_tokens',
  timestamps: true,
  updatedAt: false
});

export default PasswordToken;


// migrations/20250730-create-password-token.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('password_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      tokenHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      used: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
},
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('password_tokens');
  }

};
