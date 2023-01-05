export class MylistGroupVideoAggregationModel {
  constructor(
    private readonly entity: {
      videoId: string;
      mylistIds: string[];
    }
  ) {}

  get videoId() {
    return this.entity.videoId;
  }

  get mylistIds() {
    return this.entity.mylistIds;
  }
}
