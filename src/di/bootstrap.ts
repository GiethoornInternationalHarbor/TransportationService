import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';
import { Container } from 'inversify';
import {
  interfaces,
  InversifyExpressServer,
  TYPE
} from 'inversify-express-utils';
import '../controllers/truck.controller';
import {
  getDatabaseClient,
  MongoDbClient
} from '../infrastructure/mongodb/mongodb.client';
import {
  getRabbitMQChannel,
  RabbitMQChannel
} from '../infrastructure/rabbitmq/rabbitmq.channel';
import { TYPES } from './types';

export async function bootstrap(container: Container) {
  const port = process.env.PORT || 3000;

  if (container.isBound(TYPES.App) === false) {
    const [dbClient, rabbitMqClient] = await Promise.all([
      getDatabaseClient(),
      getRabbitMQChannel()
    ]);

    // Add the db/rabbitmq to the di container
    container
      .bind<MongoDbClient>(TYPES.MongoDbClient)
      .toConstantValue(dbClient);
    container
      .bind<RabbitMQChannel>(TYPES.RabbitMQChannel)
      .toConstantValue(rabbitMqClient);

    const server = new InversifyExpressServer(container);
    server.setConfig(expressApp => {
      expressApp.use(helmet());

      expressApp.use(bodyParser.json());
    });

    server.setErrorConfig(expressApp => {
      expressApp.use('*', (req, res) => {
        res.status(404).json({
          error: 'Not found.'
        });
      });

      expressApp.use(
        (
          err: Error,
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          if (err) {
            console.error('An error has occurred!', err.message);
          }

          next(err);
        }
      );

      expressApp.use(
        (
          err: Error,
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          res.status(500).json({
            errors: [err.message]
          });
        }
      );
    });

    const app = server.build();

    const listeningApp = app.listen(port, () => {
      console.log(`Started listening on port ${port}`);
    });

    process.on('SIGINT', shutdown);

    // Do graceful shutdown
    function shutdown() {
      listeningApp.close(() => {
        console.log('Everything shutdown');
      });
    }

    container.bind<express.Application>(TYPES.App).toConstantValue(app);

    return app;
  } else {
    return container.get<express.Application>(TYPES.App);
  }
}
