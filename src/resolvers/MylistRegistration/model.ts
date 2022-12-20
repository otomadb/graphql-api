export class MylistRegistrationModel {
  public id;
  public note;
  public createdAt;
  public updatedAt;
  public videoId;
  public mylistId;

  constructor(
    private readonly reg: {
      id: string;
      note: string | null;
      createdAt: Date;
      updatedAt: Date;
      videoId: string;
      mylistId: string;
    }
  ) {
    this.id = reg.id;
    this.note = reg.note;
    this.createdAt = reg.createdAt;
    this.updatedAt = reg.updatedAt;
    this.videoId = reg.videoId;
    this.mylistId = reg.mylistId;
  }
}
