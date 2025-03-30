import {UserProfileDto} from '../dtos/user.dto';
import * as util from '../../../common/util';

export type UserProfileModel = {
  username: string;
  name: string;
  photoUrl: string;
  pronouns: string;
  age: number;
  location: string;
  joinedAt: Date;
  totalPosts: number;
  yourInfo?: {
    birthday: string
    latitude: number;
    longitude: number;
  }
};

export function toUserProfileModel(userProfile: UserProfileDto) {
  let myInfo = null;
  if (userProfile.birthday !== null) {
    myInfo = {
      birthday: userProfile.birthday,
      latitude: userProfile.latitude,
      longitude: userProfile.longitude,
    }
  }
  return {
    username: userProfile.username,
    name: userProfile.name,
    photoUrl: `/assets/${userProfile.username}.png`,
    pronouns: userProfile.pronouns,
    age: userProfile.age,
    location: userProfile.location,
    joinedAt: util.fromEpochSeconds(userProfile.joinedAtEpochSeconds),
    totalPosts: userProfile.totalPosts,
    yourInfo: myInfo
  } as UserProfileModel;
}
