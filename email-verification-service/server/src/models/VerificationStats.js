const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificationStats = sequelize.define('VerificationStats', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  totalVerified: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  validCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  invalidCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  disposableCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  roleAccountCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastVerification: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true
});

module.exports = VerificationStats;