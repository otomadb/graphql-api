import { MigrationInterface, QueryRunner } from "typeorm";

export class NicovideoSource1670880309880 implements MigrationInterface {
    name = 'NicovideoSource1670880309880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "nicovideo_source" (
                "id" character varying(26) NOT NULL,
                "sourceId" citext NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "videoId" character varying(26) NOT NULL,
                CONSTRAINT "UQ_1f179ba67d4be38709d2dd5064b" UNIQUE ("sourceId"),
                CONSTRAINT "UQ_969f565dda65a00fc0f7df1a55a" UNIQUE ("videoId"),
                CONSTRAINT "PK_c431d59dae39a622ce25dfce807" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "nicovideo_source"
            ADD CONSTRAINT "FK_969f565dda65a00fc0f7df1a55a" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "nicovideo_source" DROP CONSTRAINT "FK_969f565dda65a00fc0f7df1a55a"
        `);
        await queryRunner.query(`
            DROP TABLE "nicovideo_source"
        `);
    }

}
