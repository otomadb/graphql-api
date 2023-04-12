export class SemitagResolvingModel {
  private constructor(private readonly entity: { semitagId: string; videoTagId: string; note: string | null }) {}

  public static make(entity: { semitagId: string; videoTagId: string; note: string | null }) {
    return new SemitagResolvingModel(entity);
  }

  get semitagId() {
    return this.entity.semitagId;
  }

  get note() {
    return this.entity.note;
  }

  get videoTagId() {
    return this.entity.videoTagId;
  }
}
