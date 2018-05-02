import 'reflect-metadata';
// tslint:disable-next-line:ordered-imports
import dotenv from 'dotenv';
import { bootstrap } from './di/bootstrap';
import { diContainer } from './di/di.config';
dotenv.config();

async function runApp() {
  const app = await bootstrap(diContainer);
  return app;
}

(async () => {
  await runApp();
})();

export { runApp };
