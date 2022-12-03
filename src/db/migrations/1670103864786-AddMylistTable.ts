import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMylistTable1670103864786 implements MigrationInterface {
    name = 'AddMylistTable1670103864786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."mylists_range_enum" AS ENUM('PUBLIC', 'KNOW_LINK', 'PRIVATE')
        `);
        await queryRunner.query(`
            CREATE TABLE "mylists" (
                "id" character varying(26) NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "title" text NOT NULL,
                "range" "public"."mylists_range_enum" NOT NULL,
                "isLikeList" boolean NOT NULL,
                "holderId" character varying(26) NOT NULL,
                CONSTRAINT "PK_2d3fcd4c9328d290bd0268dc1c8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_mylists_holder_mylists" ON "mylists" ("holderId")
            WHERE "isLikeList" == false
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_mylists_holder_like_list" ON "mylists" ("holderId")
            WHERE "isLikeList" == true
        `);
        await queryRunner.query(`
            CREATE TABLE "mylist_registrations" (
                "id" character varying(26) NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "note" text,
                "videoId" character varying(26),
                "mylistId" character varying(26),
                CONSTRAINT "PK_7f7232b504749e2c3d916353e89" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "mylists"
            ADD CONSTRAINT "FK_a6e470bf3e6bbfb270f9295cb2e" FOREIGN KEY ("holderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "mylist_registrations"
            ADD CONSTRAINT "FK_30b4c5755140583330020e4639e" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "mylist_registrations"
            ADD CONSTRAINT "FK_abda40557147e25d8cb95fee078" FOREIGN KEY ("mylistId") REFERENCES "mylists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "mylist_registrations" DROP CONSTRAINT "FK_abda40557147e25d8cb95fee078"
        `);
        await queryRunner.query(`
            ALTER TABLE "mylist_registrations" DROP CONSTRAINT "FK_30b4c5755140583330020e4639e"
        `);
        await queryRunner.query(`
            ALTER TABLE "mylists" DROP CONSTRAINT "FK_a6e470bf3e6bbfb270f9295cb2e"
        `);
        await queryRunner.query(`
            DROP TABLE "mylist_registrations"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_mylists_holder_like_list"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_mylists_holder_mylists"
        `);
        await queryRunner.query(`
            DROP TABLE "mylists"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."mylists_range_enum"
        `);
    }

}
