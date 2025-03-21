import * as express from 'express';
import {UserProfileDto} from '../src/app/services/kitty-corner-api/dtos/user.dto';
import {GetPostsDto} from '../src/app/services/kitty-corner-api/dtos/posts.dto';

export const router: express.Router = express.Router();

interface TestResponses<Dto> {
  [status: number]: Dto | ErrorResponse
}

interface ErrorResponse {
  title: string,
  status: number,
  detail: string,
  path: string
}

function setResponse(res: express.Response, testResponses: TestResponses<GetPostsDto>, status: number) {
  res.status(status);
  res.json(testResponses[status])
}

router.get('/api/posts/', (req: express.Request, res: express.Response) => {
  const testResponses: TestResponses<GetPostsDto> = require('./responses/get-posts.json');
  res.status(200);
  res.json(testResponses[200])
});

router.get('/api/users/:username/profile', (req: express.Request, res: express.Response) => {
  const testData: Map<string, UserProfileDto> = new Map(Object.entries(require('./responses/get-user-profile-data.json')));
  const testResponses: TestResponses<UserProfileDto> = require('./responses/get-user-profile.json');

  if (testData.has(req.params["username"])) {
    res.status(200);
    res.json(testData.get(req.params["username"]));
  } else {
    res.status(404);
    res.json(testResponses[404]);
  }
});
