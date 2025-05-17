import {CommentJson, PostJson, TokenChainModel, UserProfileJson} from './data.model';
import * as data from './data.model';
import {randomUUID} from 'node:crypto';

export class Repository {
  private NEXT_POST_ID: number = 200;
  private readonly POSTS: PostJson[];
  private readonly POSTS_BY_ID: Map<number, PostJson>;

  private NEXT_CHAIN_ID: number = 100;
  private readonly USERS: Map<string, data.UserProfileJson>;
  private readonly TOKEN_CHAINS_BY_ID: Map<number, TokenChainModel> = new Map();

  private NEXT_COMMENT_ID = 0;
  private readonly COMMENTS_BY_POST: Map<number, data.CommentJson[]>;
  private COMMENTS_BY_ID: Map<number, data.CommentJson>;

  constructor() {
    this.POSTS = Repository.createPosts();
    this.POSTS_BY_ID = new Map<number, PostJson>(this.POSTS.map((post) => [post.postId, post]));
    this.USERS = new Map(Object.entries(require('./users.json')));
    this.COMMENTS_BY_POST = this.createComments();
    this.COMMENTS_BY_ID = new Map();
    for (let comments of this.COMMENTS_BY_POST.values()) {
      comments.forEach(comment => this.COMMENTS_BY_ID.set(comment.commentId, comment));
    }
  }

  public getUser(username: string): UserProfileJson | null {
    return this.USERS.get(username) ?? null;
  }

  public createUser(user: UserProfileJson) {
    this.USERS.set(user.username, user);
  }

  public createTokenChain(username: string): TokenChainModel {
    const tokenChain = {
      username: username,
      chainId: this.NEXT_CHAIN_ID++,
      refreshTokenId: randomUUID().toString(),
    } as TokenChainModel;
    this.TOKEN_CHAINS_BY_ID.set(tokenChain.chainId, tokenChain);
    return tokenChain;
  }

  public getTokenChain(chainId: number): TokenChainModel | null {
    return this.TOKEN_CHAINS_BY_ID.get(chainId) ?? null;
  }

  public invalidateTokenChain(chainId: number) {
    this.TOKEN_CHAINS_BY_ID.delete(chainId);
  }

  public getPostsForUser(username: string): PostJson[] {
    return this.POSTS.filter(post => post.username === username);
  }

  public getPosts(): PostJson[] {
    return this.POSTS;
  }

  public getPost(postId: number): PostJson | null {
    return this.POSTS_BY_ID.get(postId) ?? null;
  }

  public createPost(post: PostJson) {
    post.postId = this.NEXT_POST_ID++;

    this.POSTS_BY_ID.set(post.postId, post);
    this.POSTS.unshift(post);
    this.COMMENTS_BY_POST.set(post.postId, []);
  }

  public getComments(postId: number): CommentJson[] {
    return this.COMMENTS_BY_POST.get(postId) ?? [];
  }

  public getComment(commentId: number): CommentJson | null {
    return this.COMMENTS_BY_ID.get(commentId) ?? null;
  }

  public createComment(postId: number, comment: CommentJson) {
    comment.commentId = this.NEXT_COMMENT_ID++;
    this.COMMENTS_BY_POST.get(postId)!.push(comment);
    this.COMMENTS_BY_ID.set(comment.commentId, comment);
    this.POSTS_BY_ID.get(postId)!.totalComments++;
  }

  private static createPosts() {
    const posts: data.PostJson[] = require('./posts.json').posts;
    Repository.createFakePost().forEach(post => posts.push(post));
    posts.sort((a, b) => new Date(a.createdAt).getUTCSeconds() - new Date(b.createdAt).getUTCSeconds());
    return posts;
  }

  private createComments(): Map<number, CommentJson[]> {
    // Technically should make this static
    const commentsByPost: Map<number, data.CommentJson[]> = new Map();
    for (let [postId, post] of this.POSTS_BY_ID) {
      const commentsForPost: data.CommentJson[] = [];
      for (let i = 0; i < post.totalComments; i++) {
        const commentId = this.NEXT_COMMENT_ID++;
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
    return commentsByPost
  }

  private static createFakePost(): PostJson[] {
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
}
