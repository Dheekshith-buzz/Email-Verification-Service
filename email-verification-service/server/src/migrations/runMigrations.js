require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');
const VerificationRequest = require('../models/VerificationRequest');
const VerificationStats = require('../models/VerificationStats');
const ApiKey = require('../models/ApiKey');

const createTables = async () => {
  try {
    console.log('🔄 Creating database tables...');
    
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully!');
    
    // Create admin user
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      credits: 1000
    });
    
    console.log('✅ Admin user created:', adminUser.email);
    console.log('🔑 API Key:', adminUser.apiKey);
    
    // Create test data
    const testEmails = [
      'test@gmail.com',
      'invalid-email',
      'admin@company.com',
      'user@tempmail.com',
      'nonexistent@domain12345.com'
    ];
    
    for (const email of testEmails) {
      await VerificationRequest.create({
        userId: adminUser.id,
        email,
        status: 'completed',
        isValid: email.includes('gmail') || email.includes('company'),
        isDisposable: email.includes('tempmail'),
        isRoleAccount: email.includes('admin')
      });
    }
    
    console.log('✅ Test data created');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTables();