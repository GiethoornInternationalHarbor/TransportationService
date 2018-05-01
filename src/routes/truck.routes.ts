import express = require('express');
import { expressAsync } from '../utils/express.async';

const routes = express.Router();

// TODO: Correct urls
routes.get(
  '/',
  expressAsync(async (req, res, next) => {
    res.json({
      any: 3
    });
  })
);

export default routes;
