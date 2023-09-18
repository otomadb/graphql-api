export class UserDTO {
  private constructor(private readonly entity: { id: string; name: string; displayName: string; icon: string }) {}

  public static make(a: { id: string; name: string; displayName: string; icon: string }) {
    return new UserDTO(a);
  }

  get id() {
    return this.entity.id;
  }

  get name() {
    return this.entity.name;
  }

  get displayName() {
    return this.entity.displayName;
  }

  get icon() {
    return this.entity.icon;
  }

  public toString() {
    return JSON.stringify(this.entity);
  }
}
