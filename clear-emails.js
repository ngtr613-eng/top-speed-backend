import mongoose from 'mongoose';
import { User } from './src/models/User.js';

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://Bilal:Bilal1422005@cluster0.os3ng3l.mongodb.net/top_speed_db?retryWrites=true&w=majority';

async function clearEmails() {
  try {
    console.log('📌 Connecting to MongoDB...');
    await mongoose.connect(DATABASE_URL);
    console.log('⚙️  Clearing `email` field by replacing with unique placeholders (preserves unique index)...');

    const users = await User.find({}, { _id: 1 }).lean();
    let modified = 0;

    for (const u of users) {
      const placeholder = `deleted_${u._id}@deleted.local`;
      const res = await User.updateOne({ _id: u._id }, { $set: { email: placeholder } });
      if (res.modifiedCount && res.modifiedCount > 0) modified += 1;
    }

    console.log(`✅ Processed ${users.length} users, updated ${modified} email fields.`);

    await mongoose.disconnect();
    console.log('🎉 Email fields replaced with placeholders.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing emails:', error.message);
    console.error(error);
    process.exit(1);
  }
}

clearEmails();
