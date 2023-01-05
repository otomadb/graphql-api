export class MylistGroupMylistInclusionModel {
  constructor(private readonly entity: { id: string; createdAt: Date; updatedAt: Date }) {}

  get id() {
    return this.entity.id;
  }

  get createdAt() {
    return this.entity.createdAt;
  }

  get updatedAt() {
    return this.entity.updatedAt;
  }
}
