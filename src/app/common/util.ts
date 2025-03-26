import {ReactionDto} from '../services/kitty-corner-api/dtos/posts.dto';

export function fromEpochSeconds(seconds: number) {
  const date: Date = new Date(0);
  date.setUTCSeconds(seconds);
  return date;
}

export function computeLikeDislikeChange(existingReaction: ReactionDto, newReaction: ReactionDto): {likeChange: number, dislikeChange: number} {
  const reactionChanges = {
    likeChange: 0,
    dislikeChange: 0
  };

  if (existingReaction === 'like') {
    if (newReaction === 'dislike') {
      reactionChanges.dislikeChange = 1;
      reactionChanges.likeChange = -1;
    } else if (newReaction == null) {
      reactionChanges.likeChange = -1;
    }
  } else if (existingReaction === 'dislike') {
    if (newReaction === 'like') {
      reactionChanges.dislikeChange = -1;
      reactionChanges.likeChange = 1;
    } else if (newReaction == null) {
      reactionChanges.dislikeChange = -1;
    }
  } else {
    if (newReaction === 'like') {
      reactionChanges.likeChange = 1;
    } else if (newReaction === 'dislike') {
      reactionChanges.dislikeChange = 1;
    }
  }

  return reactionChanges;
}
