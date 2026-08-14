import { FixtureServer } from './server'

// Overridable so a second instance can run alongside one that's already holding 3001.
const port = Number(process.env['FIXTURE_PORT'] ?? 3001);

const server = new FixtureServer();

server.app.listen(port, '0.0.0.0', (err?: any) => {
  console.log('Fixture server listening on port:' + port);
  if (err) {
    console.log(err);
  }
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
