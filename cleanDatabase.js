const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  cleanDatabase();
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

async function cleanDatabase() {
  try {
    // Delete documents with null email or null username
    const result = await mongoose.connection.db.collection('users').deleteMany({ 
      $or: [{ email: null }, { username: null }] 
    });
    console.log(`Deleted ${result.deletedCount} documents with null email or username`);
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning database', err);
    process.exit(1);
  }
}
