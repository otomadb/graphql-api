export class MylistVideoRecommendationModel {
  constructor(
    private readonly entity: {
      score: number;
      originMylistId: string;
      toVideoId: string;
    },
  ) {}

  get score() {
    return this.entity.score;
  }

  get originMylistId() {
    return this.entity.originMylistId;
  }

  get toVideoId() {
    return this.entity.toVideoId;
  }
}
