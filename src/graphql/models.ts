import { Mylist } from "../db/entities/mylists.js";
import { User } from "../db/entities/users.js";
import { Video } from "../db/entities/videos.js";

export class VideoModel {
  public id;
  public createdAt;

  constructor(video: Video) {
    this.id = video.id;
    this.createdAt = video.createdAt;
  }
}

export class TagModel {
  public id;
  public meaningless;

  constructor(tag: { id: string; meaningless: boolean }) {
    this.id = tag.id;
    this.meaningless = tag.meaningless;
  }
}

export class UserModel {
  public id;
  public name;
  public displayName;
  public icon;

  constructor(private readonly user: User) {
    this.id = user.id;
    this.name = user.name;
    this.displayName = user.displayName;
    this.icon = user.icon;
  }
}

export class MylistModel {
  public id;
  public range;
  public title;
  public isLikeList: boolean;

  constructor(private readonly mylist: Mylist) {
    this.id = mylist.id;
    this.range = mylist.range;
    this.title = mylist.title;
    this.isLikeList = mylist.isLikeList;
  }
}

export class MylistRegistrationModel {
  public id;
  public note;
  public createdAt;
  public updatedAt;
  public videoId;
  public mylistId;

  constructor(
    private readonly reg: {
      id: string;
      note: string | null;
      createdAt: Date;
      updatedAt: Date;
      videoId: string;
      mylistId: string;
    }
  ) {
    this.id = reg.id;
    this.note = reg.note;
    this.createdAt = reg.createdAt;
    this.updatedAt = reg.updatedAt;
    this.videoId = reg.videoId;
    this.mylistId = reg.mylistId;
  }
}

export class NicovideoVideoSourceModel {
  public id;
  public sourceId;
  public videoId;

  constructor(private readonly source: { id: string; sourceId: string; videoId: string }) {
    this.id = source.id;
    this.sourceId = source.sourceId;
    this.videoId = source.videoId;
  }
}
