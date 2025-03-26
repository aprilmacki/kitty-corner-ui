import * as express from 'express';
import {GetPostsDto} from '../src/app/services/kitty-corner-api/dtos/posts.dto';
import * as data from './data/data';
import {CommentJson, PostJson, UserProfileJson} from './data/data';
import {GetCommentsDto} from '../src/app/services/kitty-corner-api/dtos/comments.dto';
import * as util from 'node:util';
import {computeLikeDislikeChange} from '../src/app/common/util';

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
  const posts: data.PostJson[] = require('./data/posts.json').posts;
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

const USERS: Map<string, data.UserProfileJson> =  new Map(Object.entries(require('./data/user-profiles.json')));

let NEXT_COMMENT_ID = 0;
const COMMENTS_BY_POST: Map<number, data.CommentJson[]> = function() {
  const commentsByPost: Map<number, data.CommentJson[]> = new Map();
  for (let [postId, post] of POSTS_BY_ID) {
    const commentsForPost: data.CommentJson[] = [];
    for (let i = 0; i < post.totalComments; i++) {
      const commentId = NEXT_COMMENT_ID++;
      let commentDate: Date = new Date(post.createdAt);
      commentDate.setMinutes(commentDate.getMinutes() + i)
      commentsForPost.push({
        commentId: commentId,
        username: "minathecat",
        body: `cool comment ${commentId}`,
        totalLikes: 0,
        totalDislikes: 0,
        createdAt: commentDate.toString(),
        updatedAt: null,
        myReaction: null
      });
    }
    commentsForPost.sort((a, b) => new Date(a.createdAt).getUTCSeconds() - new Date(b.createdAt).getUTCSeconds());
    commentsByPost.set(postId, commentsForPost);
  }
  return commentsByPost;
}();

const COMMENTS_BY_ID: Map<number, data.CommentJson> = function() {
  const commentsById: Map<number, data.CommentJson> = new Map();
  for (let [postId, comments] of COMMENTS_BY_POST) {
    comments.forEach(comment => commentsById.set(comment.commentId, comment));
  }
  return commentsById;
}();

///////
// Router endpoints
///////


router.get('/api/v1/users/:username/profile', (req: express.Request, res: express.Response) => {
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

router.get('/api/v1/posts/', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const cursor: number = Number(req.query['cursor'] ?? 0);
    const limit: number = Number(req.query['limit'] ?? 10);
    const startAge: number = Number(req.query['startAge'] ?? 18);
    const endAge: number = Number(req.query['endAge']);
    const distanceKm: number = Number(req.query['distanceKm']);

    const selectedPosts: PostJson[] = [];
    for (const post of POSTS) {
      if (selectedPosts.length > limit) {
        break;
      }
      const userProfile: UserProfileJson = USERS.get(post.username)!
      if (userProfile.age < startAge) {
        continue;
      }
      if (!isNaN(endAge) && userProfile.age > endAge) {
        continue;
      }
      if (!isNaN(distanceKm) && post.distanceKm > distanceKm) {
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
  }, 1000);
});

router.get('/api/v1/posts/:postId', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const postId: number = Number(req.params['postId']);
    if (!POSTS_BY_ID.has(postId)) {
      res.status(404).send('Not Found');
      return;
    }
    const post: data.PostJson = POSTS_BY_ID.get(postId)!;

    res.status(200);
    res.json(data.toPostDto(post));
  }, 500);
});


router.put('/api/v1/posts/:postId/my-reactions', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const postId: number = Number(req.params['postId']);
    if (POSTS_BY_ID.has(postId)) {
      const post: PostJson = POSTS_BY_ID.get(Number(req.params["postId"]))!;
      const reactionChanges = computeLikeDislikeChange(post.myReaction, req.body.type);
      post.totalLikes += reactionChanges.likeChange;
      post.totalDislikes += reactionChanges.dislikeChange;
      post.myReaction = req.body.type;
      res.status(204);
      res.json({});
      return;
    }

    res.status(404);
    res.json({});
  }, 50)
});

router.get('/api/v1/posts/:postId/comments', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const postId: number = Number(req.params['postId']);
    const cursor: number = Number(req.query['cursor'] ?? 0);
    const limit: number = Number(req.query['limit'] ?? 10);

    if (!COMMENTS_BY_POST.has(postId)) {
      res.status(404).send('Not Found');
      return;
    }

    const selectedComments: CommentJson[] = [];
    for (const comment of COMMENTS_BY_POST.get(postId)!) {
      if (selectedComments.length > limit) {
        break;
      }
      if (comment.commentId <= cursor || cursor == 0) {
        selectedComments.push(comment);
      }
    }

    res.status(200);
    res.json({
      comments: selectedComments.map(comment => data.toCommentDto(comment)),
      nextCursor: selectedComments[selectedComments.length - 1].commentId,
    } as GetCommentsDto);
  }, 500);
});

router.post('/api/v1/posts/:postId/comments', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const postId: number = Number(req.params['postId']);
    const comment: CommentJson = {
      commentId: NEXT_COMMENT_ID++,
      username: 'aprilmack',
      body: req.body.body,
      totalLikes: 0,
      totalDislikes: 0,
      createdAt: new Date().toString(),
      updatedAt: null,
      myReaction: null
    };

    const comments = COMMENTS_BY_POST.get(postId)!;
    comments.push(comment);
    COMMENTS_BY_ID.set(comment.commentId, comment);

    res.status(200);
    res.json(data.toCommentDto(comment));
  }, 500);
});

router.put('/api/v1/posts/:postId/comments/:commentId/my-reactions', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const commentId: number = Number(req.params['commentId']);

    if (!COMMENTS_BY_ID.has(commentId)) {
      res.status(404).send('Not Found');
      return;
    }

    const comment: CommentJson = COMMENTS_BY_ID.get(commentId)!;
    const reactionChanges = computeLikeDislikeChange(comment.myReaction, req.body.type);
    comment.totalLikes += reactionChanges.likeChange;
    comment.totalDislikes += reactionChanges.dislikeChange;
    comment.myReaction = req.body.type;
    res.status(204);
    res.json({});
  });
});
