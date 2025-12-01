import * as express from 'express';
import {GetPostsDto, ReactionDto} from '../src/app/services/kitty-corner-api/dtos/posts.dto';
import * as data from './repos/data.model';
import {CommentJson, PostJson, TokenChainModel, UserProfileJson} from './repos/data.model';
import {GetCommentsDto} from '../src/app/services/kitty-corner-api/dtos/comments.dto';
import {computeLikeDislikeChange} from '../src/app/common/util';
import {ReverseGeocodeDto} from '../src/app/services/kitty-corner-api/dtos/utils.dto';
import moment, {Moment} from 'moment';
import {Repository} from './repos/repository';
import * as jwt from 'jsonwebtoken';
import {JwtPayload, TokenExpiredError} from 'jsonwebtoken';
import * as fs from 'node:fs';
import {v4 as uuidv4} from 'uuid';
import {TokenPairDto} from '../src/app/services/auth/dtos/auth.dto';

export const router: express.Router = express.Router();

const JWT_PRIVATE_KEY = fs.readFileSync('./fixtures/repos/auth/private.key');
const JWT_PUBLIC_KEY = fs.readFileSync('./fixtures/repos/auth/public.key');

interface TestResponses<Dto> {
  [status: number]: Dto | ErrorResponse
}

interface ErrorResponse {
  title: string,
  status: number,
  detail: string,
  path: string
}

interface SessionInfo {
  username: string
}

function validateAccessToken(req: express.Request): string | null{
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.error(`Auth header not found`);
    return null;
  }

  const jwtTokenIndex: number = authHeader.search(' ');
  if (jwtTokenIndex < 0) {
    console.error(`JWT token not found in auth header. ${authHeader}`);
    return null;
  }

  const jwtTokenEncoded = authHeader.substring(jwtTokenIndex + 1);

  let jwtToken;
  try {
    jwtToken = <JwtPayload>jwt.verify(jwtTokenEncoded, JWT_PRIVATE_KEY);
  } catch (error) {
    console.error(`JWT token verification failed. ${error}`);
    return null;
  }

  return jwtToken.sub!
}

function getTokenChain(req: express.Request): TokenChainModel | null {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.error(`Auth header not found`);
    return null;
  }

  const refreshTokenIndex: number = authHeader.search(' ');
  if (refreshTokenIndex < 0) {
    console.error(`JWT token not found in auth header. ${authHeader}`);
    return null;
  }

  const refreshTokenEncoded = authHeader.substring(refreshTokenIndex + 1);

  let refreshToken;
  try {
    refreshToken = <JwtPayload>jwt.verify(refreshTokenEncoded, JWT_PRIVATE_KEY);
  } catch (error) {
    console.error(`JWT token verification failed. ${error}`);
    return null;
  }

  const chainId = Number(refreshToken['chain_id']);
  return repository.getTokenChain(chainId);
}

const repository: Repository = new Repository();

router.post('/api/v1/auth/signin', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const username: string = req.body.username;
    const password: string = req.body.password;

    const user: UserProfileJson | null = repository.getUser(username);
    if (user == null || user.password !== password) {
      res.status(403).send({});
      return;
    }

    const accessToken = jwt.sign({}, JWT_PRIVATE_KEY, {
      algorithm: 'RS256',
      expiresIn: 120,
      subject: username,
    });

    const tokenInfo: TokenChainModel = repository.createTokenChain(username);
    tokenInfo.chainId++;
    tokenInfo.refreshTokenId = uuidv4();

    const refreshToken = jwt.sign({
      chain_id: tokenInfo.chainId,
      refresh_id: tokenInfo.refreshTokenId
    }, JWT_PRIVATE_KEY, {
      algorithm: 'RS256',
      expiresIn: 240,
      subject: username,
    });

    res.status(200);
    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken
    } as TokenPairDto);
  }, 500);
});

router.post('/api/v1/auth/signup', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const email: string = req.body.email;
    const username: string = req.body.username;
    const password: string = req.body.password;
    const profileName: string = req.body.profileName;
    const pronouns: string = req.body.pronouns;
    const birthday: string = req.body.birthday;

    const existingUser: UserProfileJson | null = repository.getUser(username);
    if (existingUser != null) {
      res.status(409).send({});
      return;
    }

    const newBirthday: Moment = moment(req.body.birthday, "YYYY-MM-DD");
    const age = moment().diff(newBirthday, 'years');

    const newUser: UserProfileJson = {
      email: email,
      username: username,
      name: profileName,
      pronouns: pronouns,
      age: age,
      birthday: birthday,
      joinedAt: new Date().toDateString(),
      totalPosts: 0,
      password: password
    };
    repository.createUser(newUser);

    const accessToken = jwt.sign({}, JWT_PRIVATE_KEY, {
      algorithm: 'RS256',
      expiresIn: 120,
      subject: username,
    });

    const tokenInfo: TokenChainModel = repository.createTokenChain(username);
    tokenInfo.chainId++;
    tokenInfo.refreshTokenId = uuidv4();

    const refreshToken = jwt.sign({
      chain_id: tokenInfo.chainId,
      refresh_id: tokenInfo.refreshTokenId
    }, JWT_PRIVATE_KEY, {
      algorithm: 'RS256',
      expiresIn: 240,
      subject: username,
    });

    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken
    } as TokenPairDto);
  }, 500);
});


router.post('/api/v1/auth/signout', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const tokenChain: TokenChainModel | null = getTokenChain(req);
    if (!tokenChain) {
      res.status(401).send({});
      return;
    }

    repository.invalidateTokenChain(tokenChain.chainId);
    res.status(204).send();
  }, 500);
});

router.get('/api/v1/users/:username/profile', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const testResponses: TestResponses<ErrorResponse> = require('./repos/data/get-user-profile.json');

    const user: UserProfileJson | null = repository.getUser(req.params["username"]);
    if (user != null) {
      res.status(200);
      res.json(data.toUserProfileDto(user));
    } else {
      res.status(404);
      res.json(testResponses[404]);
    }
  }, 500);
});

router.put('/api/v1/users/:username/profile', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const myUsername: string | null = validateAccessToken(req);
    if (!myUsername) {
      res.status(401).send({});
      return;
    }

    const username: string = req.params['username'];
    if (myUsername !== username) {
      res.status(403).send({});
      return;
    }

    let user: UserProfileJson | null = repository.getUser(username);
    if (user == null) {
      res.status(404).send('Not found');
      return;
    }

    user.name = req.body.name;
    user.pronouns = req.body.pronouns;
    user.birthday = req.body.birthday;

    const newBirthday: Moment = moment(req.body.birthday, "YYYY-MM-DD");
    user.age = moment().diff(newBirthday, 'years');

    res.status(200);
    res.json(data.toUserProfileDto(user));
  }, 500);
})

router.get('/api/v1/users/:username/posts', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const myUsername: string | null = validateAccessToken(req);
    if (!myUsername) {
      res.status(401).send({});
      return;
    }

    const requestedUsername: string = req.params['username'];
    const cursor: number = Number(req.query['cursor'] ?? 0);
    const limit: number = Number(req.query['limit'] ?? 10);

    const selectedPosts: PostJson[] = [];
    for (const post of repository.getPostsForUser(requestedUsername)) {
      if (selectedPosts.length > limit) {
        break;
      }
      if (post.postId <= cursor || cursor == 0) {
        selectedPosts.push(post);
      }
    }

    res.status(200);
    res.json({
      posts: selectedPosts.map((post: data.PostJson) => data.toPostDto(myUsername, post)),
      nextCursor: selectedPosts.length == 0 ? 0 : selectedPosts[selectedPosts.length-1].postId - 1
    } as GetPostsDto);
  }, 1000);
})

router.get('/api/v1/posts/', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const myUsername: string | null = validateAccessToken(req);
    if (!myUsername) {
      res.status(401).send({});
      return;
    }

    const cursor: number = Number(req.query['cursor'] ?? 0);
    const limit: number = Number(req.query['limit'] ?? 10);
    const startAge: number = Number(req.query['startAge'] ?? 18);
    const endAge: number = Number(req.query['endAge']);
    const distanceKm: number = Number(req.query['distanceKm']);

    const selectedPosts: PostJson[] = [];
    for (const post of repository.getPosts()) {
      if (selectedPosts.length > limit) {
        break;
      }
      const userProfile: UserProfileJson = repository.getUser(post.username)!
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
      posts: selectedPosts.map((post: data.PostJson) => data.toPostDto(myUsername, post)),
      nextCursor: selectedPosts.length == 0 ? 0 : selectedPosts[selectedPosts.length-1].postId - 1
    } as GetPostsDto)
  }, 1000);
});

router.get('/api/v1/posts/:postId', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const myUsername: string | null = validateAccessToken(req);
    if (!myUsername) {
      res.status(401).send({});
      return;
    }

    const postId: number = Number(req.params['postId']);
    const post: data.PostJson | null = repository.getPost(postId);
    if (post == null) {
      res.status(404).send('Not Found');
      return;
    }

    res.status(200);
    res.json(data.toPostDto(myUsername, post));
  }, 500);
});

router.post('/api/v1/posts', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const myUsername: string | null = validateAccessToken(req);
    if (!myUsername) {
      res.status(401).send({});
      return;
    }

    const newPost: PostJson = {
      postId: 0,
      username: myUsername,
      body: req.body.body,
      distanceKm: 0,
      totalLikes: 0,
      totalDislikes: 0,
      totalComments: 0,
      createdAt: new Date().toString(),
      updatedAt: null,
      reactionsByUsername: new Map<string, ReactionDto>()
    };

    repository.createPost(newPost);

    res.status(200);
    res.json(data.toPostDto(myUsername, newPost));
  }, 500);
});


router.put('/api/v1/posts/:postId/my-reactions', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const myUsername: string | null = validateAccessToken(req);
    if (!myUsername) {
      res.status(401).send({});
      return;
    }

    const postId: number = Number(req.params['postId']);

    const post: data.PostJson | null = repository.getPost(postId);
    if (post == null) {
      res.status(404).send('Not Found');
      return;
    }

    // TODO: Change PostJson to show reactions by username.

    const reactionChanges = computeLikeDislikeChange(post.reactionsByUsername.get(myUsername) ?? null, req.body.type);
    post.totalLikes += reactionChanges.likeChange;
    post.totalDislikes += reactionChanges.dislikeChange;
    post.reactionsByUsername.set(myUsername, req.body.type)
    res.status(204);
    res.json({});
  }, 50)
});

router.get('/api/v1/posts/:postId/comments', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const myUsername: string | null = validateAccessToken(req);
    if (!myUsername) {
      res.status(401).send({});
      return;
    }

    const postId: number = Number(req.params['postId']);
    const cursor: number = Number(req.query['cursor'] ?? 0);
    const limit: number = Number(req.query['limit'] ?? 10);

    if (repository.getPost(postId) == null) {
      res.status(404).send('Not Found');
      return;
    }

    const selectedComments: CommentJson[] = [];
    for (const comment of repository.getComments(postId)!) {
      if (selectedComments.length > limit) {
        break;
      }
      if (comment.commentId >= cursor || cursor == 0) {
        selectedComments.push(comment);
      }
    }

    res.status(200);
    res.json({
      comments: selectedComments.map(comment => data.toCommentDto(myUsername, comment)),
      nextCursor: selectedComments.length == 0 ? 0 : selectedComments[selectedComments.length - 1].commentId + 1,
    } as GetCommentsDto);
  }, 500);
});

router.post('/api/v1/posts/:postId/comments', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const myUsername: string | null = validateAccessToken(req);
    if (!myUsername) {
      res.status(401).send({});
      return;
    }

    const postId: number = Number(req.params['postId']);

    const comment: CommentJson = {
      commentId: 0,
      username: myUsername,
      body: req.body.body,
      totalLikes: 0,
      totalDislikes: 0,
      createdAt: new Date().toString(),
      updatedAt: null,
      reactionsByUsername: new Map<string, ReactionDto>()
    };

    repository.createComment(postId, comment);

    res.status(200);
    res.json(data.toCommentDto(myUsername, comment));
  }, 500);
});

router.put('/api/v1/posts/:postId/comments/:commentId/my-reactions', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    const myUsername: string | null = validateAccessToken(req);
    if (!myUsername) {
      res.status(401).send({});
      return;
    }

    const commentId: number = Number(req.params['commentId']);
    const comment: CommentJson | null = repository.getComment(commentId);
    if (comment == null) {
      res.status(404).send('Not Found');
      return;
    }

    const reactionChanges = computeLikeDislikeChange(comment.reactionsByUsername.get(myUsername) ?? null, req.body.type);
    comment.totalLikes += reactionChanges.likeChange;
    comment.totalDislikes += reactionChanges.dislikeChange;
    comment.reactionsByUsername.set(myUsername, req.body.type);

    res.status(204);
    res.json({});
  });
});

router.post('/api/v1/utils/reverse-geocode', (req: express.Request, res: express.Response) => {
  setTimeout(() => {
    res.status(200);
    res.json({
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      location: 'San Francisco, CA',
    } as ReverseGeocodeDto);
  }, 400);
});
