export class User {
  private _id;
  private _name;
  private _displayName;

  constructor({ id, name, displayName }: { id: string; name: string; displayName: string }) {
    this._id = id;
    this._name = name;
    this._displayName = displayName;
  }

  id() {
    return this._id;
  }

  name() {
    return this._name;
  }

  displayName() {
    return this._displayName;
  }
}
