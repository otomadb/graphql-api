export class MylistGroupVideoAggregationModel {
  constructor(
    private readonly entity: {
      count: number;
      videoId: string;
    }
  ) {}

  get videoId() {
    return this.entity.videoId;
  }
}
