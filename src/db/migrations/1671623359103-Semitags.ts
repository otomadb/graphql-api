import { MigrationInterface, QueryRunner } from "typeorm";

export class Semitags1671623359103 implements MigrationInterface {
    name = 'Semitags1671623359103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "semitag" (
                "id" character varying(26) NOT NULL,
                "name" text NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "resolved" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_30b452af5c6da9c3716e0ada710" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "semitag"
        `);
    }

}
