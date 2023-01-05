import { MigrationInterface, QueryRunner } from "typeorm";

export class FixNicovideoSources1672903489999 implements MigrationInterface {
    name = 'FixNicovideoSources1672903489999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicovideo_video_sources" DROP CONSTRAINT "FK_76e7668f8eb32271df39070d2ca"`);
        await queryRunner.query(`ALTER TABLE "nicovideo_video_sources" ADD CONSTRAINT "FK_2d2697091069023ae1fffac0ea8" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicovideo_video_sources" DROP CONSTRAINT "FK_2d2697091069023ae1fffac0ea8"`);
        await queryRunner.query(`ALTER TABLE "nicovideo_video_sources" ADD CONSTRAINT "FK_76e7668f8eb32271df39070d2ca" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
