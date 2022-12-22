import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSemitag1671678056667 implements MigrationInterface {
    name = 'AddSemitag1671678056667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "semitags" (
                "id" character varying(26) NOT NULL,
                "name" text NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "resolved" boolean NOT NULL DEFAULT false,
                "videoId" character varying(26),
                "tagId" character varying(26),
                CONSTRAINT "PK_27c9b8f9e08f86a3576c300b2e1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "FK_037d6465fa7dd9a195533416f63" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "FK_3e324d47c1a1d957e2e6f2d9afc" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "FK_3e324d47c1a1d957e2e6f2d9afc"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "FK_037d6465fa7dd9a195533416f63"
        `);
        await queryRunner.query(`
            DROP TABLE "semitags"
        `);
    }

}
