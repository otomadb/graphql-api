import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1669563444736 implements MigrationInterface {
    name = 'Init1669563444736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" character varying(26) NOT NULL,
                "name" text NOT NULL,
                "displayName" text NOT NULL,
                "icon" text NOT NULL,
                "email" text NOT NULL,
                "emailConfirmed" boolean NOT NULL DEFAULT false,
                "password" text NOT NULL,
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }

}
