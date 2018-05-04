import 'reflect-metadata';
// tslint:disable-next-line:ordered-imports
import dotenv from 'dotenv';
import { bootstrap } from './di/bootstrap';
import { diContainer } from './di/di.config';
import { TYPES } from './di/types';
dotenv.config();

async function runApp() {
  const expressApp = await bootstrap(diContainer);
  const messageHandler = diContainer.get(TYPES.MessageHandler);

  return Promise.all([messageHandler, expressApp]);
}

(async () => {
  try {
    await runApp();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

export { runApp };
