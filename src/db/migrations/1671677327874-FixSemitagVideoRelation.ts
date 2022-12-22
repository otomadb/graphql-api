import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSemitagVideoRelation1671677327874 implements MigrationInterface {
    name = 'FixSemitagVideoRelation1671677327874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "FK_037d6465fa7dd9a195533416f63"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "UQ_037d6465fa7dd9a195533416f63"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "FK_037d6465fa7dd9a195533416f63" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "FK_037d6465fa7dd9a195533416f63"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "UQ_037d6465fa7dd9a195533416f63" UNIQUE ("videoId")
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "FK_037d6465fa7dd9a195533416f63" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
