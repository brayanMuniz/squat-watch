export class User {
  userName: string;
  dateJoined: string;
  visibility: "Public" | "Friends Only" | "Private";
  exercises: Array<string>;
  initialLifts: Array<BestLifts>;
  weight?: number;
  description?: string;
  profileImageUrl?: string;

  constructor(
    userName: string,
    dateJoined: string,
    visibility: "Public" | "Friends Only" | "Private",
    exercises: Array<string>,
    initialLifts: Array<BestLifts>,
    weight?: number,
    description?: string,
    profileImageUrl?: string
  ) {
    this.userName = userName;
    this.dateJoined = dateJoined;
    this.visibility = visibility;
    this.exercises = exercises;
    this.initialLifts = initialLifts;
    this.weight = weight;
    this.description = description;
    this.profileImageUrl = profileImageUrl;
  }
}

export interface BestLifts {
  name: string;
  reps: number;
  weight: number;
}

export interface User {
  userName: string;
  dateJoined: string;
  visibility: "Public" | "Friends Only" | "Private";
  exercises: Array<string>;
  initialLifts: Array<BestLifts>;
  age: string;
  weight?: number;
  description?: string;
  profileImageUrl?: string;
}
