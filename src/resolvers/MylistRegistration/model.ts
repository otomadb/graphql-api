export class MylistRegistrationModel {
  constructor(
    private readonly entity: {
      id: string;
      note: string | null;
      createdAt: Date;
      updatedAt: Date;
    }
  ) {}

  get id() {
    return this.entity.id;
  }

  get note() {
    return this.entity.note;
  }

  get createdAt() {
    return this.entity.createdAt;
  }

  get updatedAt() {
    return this.entity.updatedAt;
  }
}
