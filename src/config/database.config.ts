import mongoose from 'mongoose';
import { config } from '@/config';

// Database configuration options type
export interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

/**
 * Get the database configuration
 * @returns Database configuration object
 */
export const getDatabaseConfig = (): DatabaseConfig => {
  const uri = config.database.uri || 'mongodb://localhost:27017/user_management_db';

  return {
    uri,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      // Add auth source if using authentication
      ...(uri.includes('@') && { authSource: 'admin' }),
    },
  };
};

// Function to create database if it doesn't exist
const ensureDatabaseExists = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (db) {
      // This will create the database if it doesn't exist
      const collections = await db.listCollections().toArray();
      if (collections.length === 0) {
        // Create a temporary collection to initialize the database
        await db.createCollection('__temp__');
        await db.dropCollection('__temp__');
        console.info('Database created and initialized');
      } else {
        console.info('Database already exists');
      }
    }
  } catch (error) {
    console.warn('Warning: Could not verify database existence:', error);
    // Don't throw error here as database might be created automatically on first write
  }
};

export const connectDatabase = async (): Promise<void> => {
  try {
    // Get database configuration
    const dbConfig = getDatabaseConfig();

    console.log('Connecting to MongoDB...');

    // Connect to MongoDB
    await mongoose.connect(dbConfig.uri, dbConfig.options);

    console.log('MongoDB connected successfully');
    console.info(`Database: ${mongoose.connection.name}`);

    // Ensure database exists
    await ensureDatabaseExists();

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error('Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown handlers
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.info('Mongoose connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error closing mongoose connection:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.info('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

export const clearDatabase = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'test') {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        if (collection) {
          await collection.deleteMany({});
        }
      }
      console.info('Test database cleared');
    } else {
      throw new Error('Database clearing is only allowed in test environment');
    }
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};
