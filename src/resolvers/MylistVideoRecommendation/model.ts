export class MylistVideoRecommendationModel {
  constructor(
    private readonly entity: {
      score: number;
      originId: string;
      toId: string;
    }
  ) {}

  get score() {
    return this.entity.score;
  }

  get originId() {
    return this.entity.originId;
  }

  get toId() {
    return this.entity.toId;
  }
}
