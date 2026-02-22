import mongoose from 'mongoose';
import { User } from './src/models/User.js';

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://Bilal:Bilal1422005@cluster0.os3ng3l.mongodb.net/top_speed_db?retryWrites=true&w=majority';

async function cleanupAllUsers() {
  try {
    console.log('📌 Connecting to MongoDB...');
    await mongoose.connect(DATABASE_URL);
    
    console.log('⚠️  WARNING: This will delete ALL user accounts from the database!');
    console.log('✨ Proceeding with cleanup...\n');
    
    const result = await User.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} user accounts`);
    console.log('✅ Database is now clean and ready for deployment!');
    console.log('\n🎉 Cleanup Complete - Ready for exhibit manager');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanupAllUsers();
