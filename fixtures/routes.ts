import * as express from 'express';
import {UserProfileDto} from '../src/app/services/kitty-corner-api/dtos/user.dto';
import {GetPostsDto, PostDto, ReactionDto} from '../src/app/services/kitty-corner-api/dtos/posts.dto';

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

const postIdToReaction: Map<number, ReactionDto> = new Map();

router.get('/api/posts/', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const testResponses: TestResponses<GetPostsDto> = require('./responses/get-posts.json');

    const posts: PostDto[] = (<GetPostsDto>testResponses[200]).posts;
    posts.forEach((post: PostDto) => {
      if (postIdToReaction.has(post.postId)) {
        if (post.myReaction == 'like') {
          post.totalLikes--;
        } else if (post.myReaction == 'dislike') {
          post.totalDislikes--;
        }
        post.myReaction = postIdToReaction.get(post.postId)!;
        if (post.myReaction == 'like') {
          post.totalLikes++;
        } else if (post.myReaction == 'dislike') {
          post.totalDislikes++;
        }
      }
    })

    res.status(200);
    res.json(testResponses[200]);
  }, 10000)
});

router.get('/api/users/:username/profile', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const testData: Map<string, UserProfileDto> = new Map(Object.entries(require('./responses/get-user-profile-data.json')));
    const testResponses: TestResponses<UserProfileDto> = require('./responses/get-user-profile.json');

    if (testData.has(req.params["username"])) {
      res.status(200);
      res.json(testData.get(req.params["username"]));
    } else {
      res.status(404);
      res.json(testResponses[404]);
    }
  }, 500);
});

router.put('/api/posts/:postId/my-reactions', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    postIdToReaction.set(Number(req.params['postId']), req.body.type);
    res.status(204);
    res.json({});
  }, 50)
})
