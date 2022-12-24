import { MigrationInterface, QueryRunner } from "typeorm"

export class RenameNicovideoVideoSource1671832311937 implements MigrationInterface {
  name = 'RenameNicovideoVideoSource1671832311937'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "nicovideo_video_source" RENAME TO "nicovideo_video_sources"`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "nicovideo_video_sources" RENAME TO "nicovideo_video_source"`)
    }

}
