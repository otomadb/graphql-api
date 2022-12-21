import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSemitagTagRelation1671627859508 implements MigrationInterface {
    name = 'FixSemitagTagRelation1671627859508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "FK_3e324d47c1a1d957e2e6f2d9afc"
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags" DROP CONSTRAINT "UQ_3e324d47c1a1d957e2e6f2d9afc"
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
            ALTER TABLE "semitags"
            ADD CONSTRAINT "UQ_3e324d47c1a1d957e2e6f2d9afc" UNIQUE ("tagId")
        `);
        await queryRunner.query(`
            ALTER TABLE "semitags"
            ADD CONSTRAINT "FK_3e324d47c1a1d957e2e6f2d9afc" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
