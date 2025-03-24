import * as express from 'express';
import {GetPostsDto} from '../src/app/services/kitty-corner-api/dtos/posts.dto';
import * as data from './data/data';
import {PostJson, UserProfileJson} from './data/data';

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

function generatePosts() {
  const posts: PostJson[] = [];
  const postDate: Date = new Date('2025-02-23T08:30-06:00');
  for (let i = 0; i < 30; i++) {
    const postId = 100 - i;
    postDate.setMinutes(postDate.getSeconds() - 30);
    const fillerPost: data.PostJson = {
      postId: postId,
      username: 'minathecat',
      body: `meow ${postId}`,
      distanceKm: 0,
      totalLikes: 0,
      totalDislikes: 0,
      totalComments: 0,
      createdAt: postDate.toString(),
      updatedAt: null,
      myReaction: null
    };
    posts.push(fillerPost);
  }
  return posts;
}

const POSTS: data.PostJson[] = function(){
  const posts: data.PostJson[] = require('./data/post-data.json').posts;
  generatePosts().forEach(post => posts.push(post));
  posts.sort((a, b) => new Date(a.createdAt).getUTCSeconds() - new Date(b.createdAt).getUTCSeconds());
  return posts;
}();

const POSTS_BY_ID: Map<number, data.PostJson> = function() {
  const postsById: Map<number, data.PostJson> = new Map();
  for (const post of POSTS) {
    postsById.set(post.postId, post);
  }
  return postsById;
}();

const USERS: Map<string, data.UserProfileJson> =  new Map(Object.entries(require('./data/user-profile-data.json')));

router.get('/api/posts/', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const cursor: number = Number(req.query['cursor'] ?? 0);
    const limit: number = Number(req.query['limit'] ?? 10);
    const startAge: number = Number(req.query['startAge'] ?? 18);
    const endAge: number = Number(req.query['endAge']);

    const selectedPosts: PostJson[] = [];
    for (const post of POSTS) {
      if (selectedPosts.length > limit) {
        break;
      }
      if (USERS.get(post.username)!.age < startAge || USERS.get(post.username)!.age > endAge) {
        continue;
      }
      if (post.postId <= cursor || cursor === 0) {
        selectedPosts.push(post);
      }
    }

    res.status(200);
    res.json({
      posts: selectedPosts.map((post: data.PostJson) => data.toPostDto(post)),
      nextCursor: selectedPosts.length == 0 ? 0 : selectedPosts[selectedPosts.length-1].postId - 1
    } as GetPostsDto)
  }, 2000);
});

router.get('/api/users/:username/profile', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const testResponses: TestResponses<ErrorResponse> = require('./data/get-user-profile.json');

    if (USERS.has(req.params["username"])) {
      res.status(200);
      res.json(data.toUserProfileDto(USERS.get(req.params["username"])!));
    } else {
      res.status(404);
      res.json(testResponses[404]);
    }
  }, 500);
});

router.put('/api/posts/:postId/my-reactions', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const postId: number = Number(req.params['postId']);
    if (POSTS_BY_ID.has(postId)) {
      const post: PostJson = POSTS_BY_ID.get(Number(req.params["postId"]))!;

      if (post.myReaction == 'like') {
        if (req.body.type == 'dislike') {
          post.totalDislikes++;
          post.totalLikes--;
        } else if (req.body.type == null) {
          post.totalLikes--;
        }
      } else if (post.myReaction == 'dislike') {
        if (req.body.type == 'like') {
          post.totalLikes++;
          post.totalDislikes--;
        } else if (req.body.type == null) {
          post.totalDislikes--;
        }
      } else {
        if (req.body.type == 'like') {
          post.totalLikes++;
        } else if (req.body.type == 'dislike') {
          post.totalDislikes++;
        }
      }

      post.myReaction = req.body.type;

      res.status(204);
      res.json({});
      return;
    }

    res.status(404);
    res.json({});
  }, 50)
})
