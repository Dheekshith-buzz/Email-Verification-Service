const User = require('./User');
const VerificationRequest = require('./VerificationRequest');
const VerificationStats = require('./VerificationStats');
const ApiKey = require('./ApiKey');

// Define associations
User.hasMany(VerificationRequest, { foreignKey: 'userId', as: 'verifications' });
VerificationRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(VerificationStats, { foreignKey: 'userId', as: 'stats' });
VerificationStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ApiKey, { foreignKey: 'userId', as: 'apiKeys' });
ApiKey.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  VerificationRequest,
  VerificationStats,
  ApiKey,
  sequelize: require('../config/database').sequelize
};