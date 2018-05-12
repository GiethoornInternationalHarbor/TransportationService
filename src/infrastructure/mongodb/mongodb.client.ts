import retry from 'async-retry';
import mongoose from 'mongoose';

export type MongoDbClient = mongoose.Mongoose;

/**
 * Gets the database client
 */
export async function getDatabaseClient() {
  const envConnString = process.env.DB_CONNECTION_STRING;
  if (!envConnString) {
    throw new Error('No connection string was provided');
  }

  return retry(
    async () => {
      await mongoose.connect(envConnString);

      console.log('MongoDB connection success');

      return mongoose;
    },
    {
      factor: 1,
      onRetry: err => {
        console.warn('Retrying to connect to MongoDB', err);
      }
    }
  );
}
