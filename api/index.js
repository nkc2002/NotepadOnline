// Vercel Serverless Function - Bridge to Backend Express App
// Re-export the serverless handler from backend
import handler from '../backend/index.js';

export default handler;
