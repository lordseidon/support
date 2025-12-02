const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adamanti-support';
    
    await mongoose.connect(mongoURI);

    console.log('\n✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}\n`);
  } catch (error) {
    console.error('\n❌ MongoDB connection error:', error.message);
    console.error('Please ensure MongoDB is running and accessible.\n');
    // Don't exit process, allow server to run without DB
    console.log('⚠️  Server will run without database connectivity.\n');
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n🔌 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
