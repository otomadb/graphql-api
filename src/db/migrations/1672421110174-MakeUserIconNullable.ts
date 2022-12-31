import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserIconNullable1672421110174 implements MigrationInterface {
    name = 'MakeUserIconNullable1672421110174'

    public async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "icon" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "icon" SET NOT NULL`);
    }

}
