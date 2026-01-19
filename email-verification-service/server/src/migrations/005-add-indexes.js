'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add indexes for better performance
    await queryInterface.addIndex('verification_requests', ['user_id']);
    await queryInterface.addIndex('verification_requests', ['batch_id']);
    await queryInterface.addIndex('verification_requests', ['email']);
    await queryInterface.addIndex('verification_requests', ['status']);
    await queryInterface.addIndex('verification_requests', ['created_at']);
    
    await queryInterface.addIndex('api_keys', ['user_id']);
    await queryInterface.addIndex('api_keys', ['key']);
    await queryInterface.addIndex('api_keys', ['is_active']);
    
    await queryInterface.addIndex('verification_stats', ['user_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('verification_requests', ['user_id']);
    await queryInterface.removeIndex('verification_requests', ['batch_id']);
    await queryInterface.removeIndex('verification_requests', ['email']);
    await queryInterface.removeIndex('verification_requests', ['status']);
    await queryInterface.removeIndex('verification_requests', ['created_at']);
    
    await queryInterface.removeIndex('api_keys', ['user_id']);
    await queryInterface.removeIndex('api_keys', ['key']);
    await queryInterface.removeIndex('api_keys', ['is_active']);
    
    await queryInterface.removeIndex('verification_stats', ['user_id']);
  }
};