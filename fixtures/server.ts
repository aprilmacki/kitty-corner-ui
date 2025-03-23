import express from 'express';
import * as routes from './routes'

export class FixtureServer {
  app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(routes.router);
  }
}
