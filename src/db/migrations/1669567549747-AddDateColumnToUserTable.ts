import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateColumnToUserTable1669567549747 implements MigrationInterface {
    name = 'AddDateColumnToUserTable1669567549747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "updatedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "createdAt"
        `);
    }

}
