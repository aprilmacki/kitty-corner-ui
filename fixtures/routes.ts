import * as express from 'express';

export const router: express.Router = express.Router();

interface TestResponses {
  success: {
    status: number,
    response: {},
  },
  failures: [
    {
      status: number,
      response: {}
    }
  ]
}

function setResponse(res: express.Response, testResponses: TestResponses, isSuccessful: boolean, failureIndex?: number) {
  if (isSuccessful) {
    res.status(testResponses.success.status)
    res.json(testResponses.success.response);
  } else {
    res.status(testResponses.failures[failureIndex!].status)
    res.json(testResponses.failures[failureIndex!].response);
  }
}

router.get('/api/posts/', (req: express.Request, res: express.Response) => {
  const testResponses: TestResponses = require('./responses/get-posts.json');
  setResponse(res, testResponses, true);
});

