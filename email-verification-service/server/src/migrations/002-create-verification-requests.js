'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('verification_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'user_id'
      },
      batchId: {
        type: Sequelize.STRING,
        field: 'batch_id'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      isValid: {
        type: Sequelize.BOOLEAN,
        field: 'is_valid'
      },
      isDisposable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_disposable'
      },
      isRoleAccount: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_role_account'
      },
      mxRecords: {
        type: Sequelize.JSON,
        field: 'mx_records'
      },
      smtpResponse: {
        type: Sequelize.TEXT,
        field: 'smtp_response'
      },
      validationSource: {
        type: Sequelize.STRING,
        field: 'validation_source'
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
    await queryInterface.dropTable('verification_requests');
  }
};