import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/env';
import { Employee } from '../models/Employee';
mongoose.set('strictQuery', true);

export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('[db] Connected to MongoDB');
    console.log('employees count:', await Employee.countDocuments());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[db] MongoDB connection error:', error);
    throw error;
  }
}


