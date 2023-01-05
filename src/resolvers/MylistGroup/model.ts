export class MylistGroupModel {
  constructor(private readonly entity: { id: string; title: string; createdAt: Date; updatedAt: Date }) {}

  get id() {
    return this.entity.id;
  }

  get title() {
    return this.entity.title;
  }

  get createdAt() {
    return this.entity.createdAt;
  }

  get updatedAt() {
    return this.entity.updatedAt;
  }
}
