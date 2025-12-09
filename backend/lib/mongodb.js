import mongoose from 'mongoose';

let cached = global._mongo;

if (!cached) {
  cached = global._mongo = { conn: null, promise: null, disabled: false };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  // If no MongoDB URI, disable mongoose and return mock
  if (!MONGODB_URI) {
    if (!cached.disabled) {
      console.warn('⚠️  MONGODB_URI not defined. Running WITHOUT database (in-memory mode).');
      console.warn(
        '⚠️  Data will NOT persist. Install MongoDB or use MongoDB Atlas for production.'
      );
      cached.disabled = true;

      // Disable mongoose buffering completely
      mongoose.set('bufferCommands', false);
      mongoose.set('bufferTimeoutMS', 0);
    }

    cached.conn = { readyState: 0, disabled: true };
    return cached.conn;
  }

  // If we have a cached connection, return it
  if (cached.conn && !cached.disabled) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  // If we don't have a promise for a connection, create one
  if (!cached.promise && !cached.disabled) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    console.log('🔄 Creating new MongoDB connection...');

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        cached.promise = null;
        cached.disabled = true;

        console.warn('⚠️  Running WITHOUT database. Data will not persist.');
        cached.conn = { readyState: 0, disabled: true };
        return cached.conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed. Running without database.');
    cached.disabled = true;
    cached.conn = { readyState: 0, disabled: true };
  }

  return cached.conn;
}

async function disconnectDB() {
  if (cached.conn && !cached.disabled && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB disconnected');
  }
}

function isConnected() {
  return cached.conn !== null && !cached.disabled && mongoose.connection.readyState === 1;
}

function isDisabled() {
  return cached.disabled === true;
}

function getConnectionStatus() {
  if (cached.disabled) return 'disabled';

  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}

// Only setup event handlers if MongoDB is being used
if (process.env.MONGODB_URI) {
  mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
    cached.disabled = true;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from MongoDB');
  });

  process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
  });
}

export default connectDB;
export { disconnectDB, isConnected, isDisabled, getConnectionStatus };
