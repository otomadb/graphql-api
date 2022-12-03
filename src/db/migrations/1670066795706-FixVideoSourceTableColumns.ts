import { MigrationInterface, QueryRunner } from "typeorm";

export class FixVideoSourceTableColumns1670066795706 implements MigrationInterface {
    name = 'FixVideoSourceTableColumns1670066795706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "video_sources"
            ADD "source" text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources"
            ADD "sourceVideoId" text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources" DROP CONSTRAINT "FK_bbae903425b10f56551dc60148c"
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources" DROP COLUMN "videoId"
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources"
            ADD "videoId" character varying(26) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources"
            ADD CONSTRAINT "FK_bbae903425b10f56551dc60148c" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "video_sources" DROP CONSTRAINT "FK_bbae903425b10f56551dc60148c"
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources" DROP COLUMN "videoId"
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources"
            ADD "videoId" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources"
            ADD CONSTRAINT "FK_bbae903425b10f56551dc60148c" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources" DROP COLUMN "sourceVideoId"
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources" DROP COLUMN "source"
        `);
    }

}
