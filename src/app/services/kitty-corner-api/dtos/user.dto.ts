

export interface UserProfileDto {
  username: string;
  name: string;
  pronouns: string;
  age: number;
  birthday?: string
  location: string;
  latitude?: number;
  longitude?: number;
  joinedAtEpochSeconds: number;
  totalPosts: number;
}

export interface UpdateUserProfileDto {
  name: string;
  pronouns: string;
  birthday?: string
  latitude?: number;
  longitude?: number;
}
