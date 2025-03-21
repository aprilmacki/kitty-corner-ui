import { FixtureServer } from './server'

const port = 3001;

const server = new FixtureServer();

server.app.listen(port, '0.0.0.0', (err?: any) => {
  console.log('Fixture server listening on port:' + port);
  if (err) {
    console.log(err);
  }
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
