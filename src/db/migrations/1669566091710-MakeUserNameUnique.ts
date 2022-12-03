import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserNameUnique1669566091710 implements MigrationInterface {
    name = 'MakeUserNameUnique1669566091710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf" UNIQUE ("name")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf"
        `);
    }

}
