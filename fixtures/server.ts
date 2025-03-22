import express from 'express';
import * as routes from './routes'
import * as bodyParser from 'body-parser';

export class FixtureServer {
  app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(bodyParser.json( {
      limit : '2mb',
      type: ['application/*+json', 'application/json']
    }));
    this.app.use(routes.router);
  }
}
