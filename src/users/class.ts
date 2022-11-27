export class User {
  private _id;
  private _name;
  private _displayName;
  public icon;

  constructor({ id, name, displayName, icon }: {
    id: string;
    name: string;
    displayName: string;
    icon: string;
  }) {
    this._id = id;
    this._name = name;
    this._displayName = displayName;
    this.icon = icon;
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
