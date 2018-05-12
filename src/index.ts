import dotenv from 'dotenv';
import { diContainer } from './di/di.config';
// tslint:disable-next-line:ordered-imports
import { bootstrap } from './di/bootstrap';
import { TYPES } from './di/types';
import { IMessageHandler } from './infrastructure/messaging/imessage.handler';
import { MessageBrokerHandlerTruckService } from './infrastructure/services/messagebroker.handler.truck.service';
dotenv.config();

async function runApp() {
  const expressApp = bootstrap(diContainer);
  const messageHandler = diContainer.get<MessageBrokerHandlerTruckService>(
    TYPES.MessageHandler
  );

  return Promise.all([expressApp, messageHandler.postInit()]);
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
