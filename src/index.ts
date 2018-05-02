import 'reflect-metadata';
// tslint:disable-next-line:ordered-imports
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import {
  interfaces,
  InversifyExpressServer,
  TYPE
} from 'inversify-express-utils';
import { diContainer } from './di/di.config';
// tslint:disable-next-line:ordered-imports
import './controllers/truck.controller';
dotenv.config();

const port = process.env.PORT || 3000;
const server = new InversifyExpressServer(diContainer);
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
