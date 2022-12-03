import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTagTableColumns1670073904067 implements MigrationInterface {
    name = 'FixTagTableColumns1670073904067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tags" DROP CONSTRAINT "UQ_d90243459a697eadb8ad56e9092"
        `);
        await queryRunner.query(`
            ALTER TABLE "tags" DROP COLUMN "name"
        `);
        await queryRunner.query(`
            ALTER TABLE "tags"
            ALTER COLUMN "meaningless"
            SET DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tags"
            ALTER COLUMN "meaningless" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "tags"
            ADD "name" text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "tags"
            ADD CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name")
        `);
    }

}
