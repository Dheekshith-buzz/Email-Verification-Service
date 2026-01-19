const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificationRequest = sequelize.define('VerificationRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  batchId: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  isValid: {
    type: DataTypes.BOOLEAN
  },
  isDisposable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isRoleAccount: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mxRecords: {
    type: DataTypes.JSON
  },
  smtpResponse: {
    type: DataTypes.TEXT
  },
  validationSource: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['batchId']
    },
    {
      fields: ['email']
    }
  ]
});

module.exports = VerificationRequest;
