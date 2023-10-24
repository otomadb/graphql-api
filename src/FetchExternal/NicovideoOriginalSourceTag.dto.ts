export class NicovideoOriginalSourceTagDTO {
  constructor(private readonly source: { name: string }) {}

  get name() {
    return this.source.name;
  }
}
