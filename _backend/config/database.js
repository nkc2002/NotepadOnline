// This file is deprecated, use api/lib/mongodb.js instead
// Kept for backward compatibility

import connectDB, { disconnectDB, isConnected, getConnectionStatus } from '../lib/mongodb.js';

export const connectDatabase = connectDB;
export const disconnectDatabase = disconnectDB;
export { isConnected, getConnectionStatus };

