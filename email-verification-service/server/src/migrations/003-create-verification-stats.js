'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('verification_stats', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'user_id'
      },
      totalVerified: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'total_verified'
      },
      validCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'valid_count'
      },
      invalidCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'invalid_count'
      },
      disposableCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'disposable_count'
      },
      roleAccountCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'role_account_count'
      },
      lastVerification: {
        type: Sequelize.DATE,
        field: 'last_verification'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('verification_stats');
  }
};