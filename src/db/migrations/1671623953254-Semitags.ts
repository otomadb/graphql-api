import { MigrationInterface, QueryRunner } from "typeorm";

export class Semitags1671623953254 implements MigrationInterface {
    name = 'Semitags1671623953254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "semitags" (
                "id" character varying(26) NOT NULL,
                "name" text NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "resolved" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_27c9b8f9e08f86a3576c300b2e1" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "semitags"
        `);
    }

}
