import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMylistGroupMylistInclusionNotNullable1672909696159 implements MigrationInterface {
    name = 'FixMylistGroupMylistInclusionNotNullable1672909696159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" DROP CONSTRAINT "FK_9e69a6b42c71dfae6fb726a73ac"`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" DROP CONSTRAINT "FK_105128216044972f3ad4b507d03"`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ALTER COLUMN "groupId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ALTER COLUMN "mylistId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ADD CONSTRAINT "FK_9e69a6b42c71dfae6fb726a73ac" FOREIGN KEY ("groupId") REFERENCES "mylist_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ADD CONSTRAINT "FK_105128216044972f3ad4b507d03" FOREIGN KEY ("mylistId") REFERENCES "mylists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" DROP CONSTRAINT "FK_105128216044972f3ad4b507d03"`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" DROP CONSTRAINT "FK_9e69a6b42c71dfae6fb726a73ac"`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ALTER COLUMN "mylistId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ALTER COLUMN "groupId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ADD CONSTRAINT "FK_105128216044972f3ad4b507d03" FOREIGN KEY ("mylistId") REFERENCES "mylists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ADD CONSTRAINT "FK_9e69a6b42c71dfae6fb726a73ac" FOREIGN KEY ("groupId") REFERENCES "mylist_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
