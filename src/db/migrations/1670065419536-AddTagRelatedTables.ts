import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagRelatedTables1670065419536 implements MigrationInterface {
    name = 'AddTagRelatedTables1670065419536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tag_names" (
                "id" character varying(26) NOT NULL,
                "name" text NOT NULL,
                "primary" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "tagId" character varying(26),
                CONSTRAINT "PK_844280ab35721a1e89497db5617" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "tag_parents" (
                "id" character varying(26) NOT NULL,
                "explicit" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "tagId" character varying(26),
                CONSTRAINT "PK_cc4322310226e2a49d6edc80d71" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "tags"
            ADD "meaningless" boolean NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "tag_names"
            ADD CONSTRAINT "FK_551baf525c6a275793afce4125e" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "tag_parents"
            ADD CONSTRAINT "FK_c3366628a58a2ffe51f87c02458" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tag_parents" DROP CONSTRAINT "FK_c3366628a58a2ffe51f87c02458"
        `);
        await queryRunner.query(`
            ALTER TABLE "tag_names" DROP CONSTRAINT "FK_551baf525c6a275793afce4125e"
        `);
        await queryRunner.query(`
            ALTER TABLE "tags" DROP COLUMN "meaningless"
        `);
        await queryRunner.query(`
            DROP TABLE "tag_parents"
        `);
        await queryRunner.query(`
            DROP TABLE "tag_names"
        `);
    }

}
