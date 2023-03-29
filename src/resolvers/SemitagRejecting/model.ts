export class SemitagRejectingModel {
  private constructor(
    private readonly entity: {
      semitagId: string;
      note: string | null;
    }
  ) {}

  public static make(entity: { semitagId: string; note: string | null }) {
    return new SemitagRejectingModel(entity);
  }

  get semitagId() {
    return this.entity.semitagId;
  }

  get note() {
    return this.entity.note;
  }
}
