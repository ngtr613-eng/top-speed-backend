import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

async function deleteTestEmails() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ Connected to MongoDB');
    
    // Delete all users to start fresh
    const result = await User.deleteMany({});
    console.log('✅ Deleted all users:', result.deletedCount);
    
    await mongoose.disconnect();
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteTestEmails();
