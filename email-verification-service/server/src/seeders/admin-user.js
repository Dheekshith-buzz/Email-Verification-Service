require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');
const VerificationStats = require('../models/VerificationStats');

const seedAdminUser = async () => {
  try {
    console.log('🌱 Seeding admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@example.com' } 
    });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      credits: 1000,
      isActive: true
    });
    
    // Create stats record for admin
    await VerificationStats.create({
      userId: adminUser.id
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('🔑 API Key:', adminUser.apiKey);
    console.log('💳 Credits:', adminUser.credits);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdminUser();