import { UserRole } from "@prisma/client";
import { AppMetadata, User, UserMetadata } from "auth0";
import { z } from "zod";

export class UserModel {
  private constructor(private readonly entity: { id: string; name: string; displayName: string; icon: string }) {}

  public static async fromAuth0User(user: User<AppMetadata, UserMetadata>) {
    const parsed = z
      .object({
        user_id: z.string(),
        username: z.string(),
        nickname: z.string(),
        picture: z.string(),
      })
      .safeParse(user);

    if (!parsed.success) throw new Error();

    return new UserModel({
      id: parsed.data.user_id,
      name: parsed.data.username,
      displayName: parsed.data.nickname,
      icon: parsed.data.picture,
    });
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

  get role(): UserRole {
    return UserRole.NORMAL;
  }
}
