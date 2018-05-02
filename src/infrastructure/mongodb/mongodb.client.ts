import mongoose from 'mongoose';

export type MongoDbClient = mongoose.Mongoose;

/**
 * Gets the database client
 */
export async function getDatabaseClient() {
  return new Promise<MongoDbClient>((resolve, reject) => {
    const envConnString = process.env.DB_CONNECTION_STRING;
    if (!envConnString) {
      reject(new Error('No connection string was provided'));
      return;
    }

    mongoose.connect(envConnString);
    const db = mongoose.connection;
    db.on('error', (e: Error) => {
      console.error('Db connection error:', e);
      reject(e);
    });
    db.once('open', () => {
      console.log('Db connection success');
      resolve(mongoose);
    });
  });
}
