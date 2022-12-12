import { MigrationInterface, QueryRunner } from "typeorm";

export class NicovideoVideoSource1670886139177 implements MigrationInterface {
    name = 'NicovideoVideoSource1670886139177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "nicovideo_video_source" (
                "id" character varying(26) NOT NULL,
                "sourceId" citext NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "videoId" character varying(26) NOT NULL,
                CONSTRAINT "UQ_208e64d42387623cad7f2e4fb6b" UNIQUE ("sourceId"),
                CONSTRAINT "UQ_76e7668f8eb32271df39070d2ca" UNIQUE ("videoId"),
                CONSTRAINT "PK_7acd648a4ecaada5bbeec79fe5c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "nicovideo_video_source"
            ADD CONSTRAINT "FK_76e7668f8eb32271df39070d2ca" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "nicovideo_video_source" DROP CONSTRAINT "FK_76e7668f8eb32271df39070d2ca"
        `);
        await queryRunner.query(`
            DROP TABLE "nicovideo_video_source"
        `);
    }

}
