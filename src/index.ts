import dotenv from 'dotenv';
dotenv.config();

import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { ApiError } from './errors/api.error';
import truckRoutes from './routes/truck.routes';

const port = process.env.PORT || 3000;
const app = express();

app.use(helmet());

app.use(bodyParser.json());

app.use('/api/truck', truckRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found.'
  });
});

app.use(
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

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof ApiError) {
      const apiError = err as ApiError;
      res.status(apiError.statusCode).json({
        errors: [apiError.message]
      });
    } else {
      next(err);
    }
  }
);

app.use(
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

const server = app.listen(port, () => {
  console.log(`Started listening on port ${port}`);
});

process.on('SIGINT', shutdown);

// Do graceful shutdown
function shutdown() {
  server.close(() => {
    console.log('Everything shutdown');
  });
}
