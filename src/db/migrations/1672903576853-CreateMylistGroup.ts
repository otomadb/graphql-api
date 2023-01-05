import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMylistGroup1672903576853 implements MigrationInterface {
    name = 'CreateMylistGroup1672903576853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mylist_groups" ("id" character varying(26) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" text NOT NULL, "holderId" character varying(26) NOT NULL, CONSTRAINT "PK_283e995beb055f327e92afeb787" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mylist_group_mylist_inclusions" ("id" character varying(26) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "groupId" character varying(26), "mylistId" character varying(26), CONSTRAINT "PK_e0d0b6a037fdb9633296d165914" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mylist_groups" ADD CONSTRAINT "FK_715f1efaef409a44ec479f0e84f" FOREIGN KEY ("holderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ADD CONSTRAINT "FK_9e69a6b42c71dfae6fb726a73ac" FOREIGN KEY ("groupId") REFERENCES "mylist_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" ADD CONSTRAINT "FK_105128216044972f3ad4b507d03" FOREIGN KEY ("mylistId") REFERENCES "mylists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" DROP CONSTRAINT "FK_105128216044972f3ad4b507d03"`);
        await queryRunner.query(`ALTER TABLE "mylist_group_mylist_inclusions" DROP CONSTRAINT "FK_9e69a6b42c71dfae6fb726a73ac"`);
        await queryRunner.query(`ALTER TABLE "mylist_groups" DROP CONSTRAINT "FK_715f1efaef409a44ec479f0e84f"`);
        await queryRunner.query(`DROP TABLE "mylist_group_mylist_inclusions"`);
        await queryRunner.query(`DROP TABLE "mylist_groups"`);
    }

}
