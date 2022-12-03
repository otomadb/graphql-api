import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideoRelatedTables1669650701619 implements MigrationInterface {
    name = 'AddVideoRelatedTables1669650701619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tags" (
                "id" character varying(26) NOT NULL,
                "name" text NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"),
                CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "videos" (
                "id" character varying(26) NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e4c86c0cf95aff16e9fb8220f6b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "video_sources" (
                "id" character varying(26) NOT NULL,
                "videoId" character varying NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_2b4ff25794018ffbe9afdd25e95" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "video_tags" (
                "id" character varying(26) NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "tagId" character varying(26) NOT NULL,
                "videoId" character varying(26) NOT NULL,
                CONSTRAINT "UQ_7995bc8220363477e15fff8bcdc" UNIQUE ("tagId", "videoId"),
                CONSTRAINT "PK_46a3780fea7f7e85204356a3b4b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "video_thumbnails" (
                "id" character varying(26) NOT NULL,
                "imageUrl" text NOT NULL,
                "primary" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "videoId" character varying(26) NOT NULL,
                CONSTRAINT "PK_9540a7e1a10bcaad41085ca7dca" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "video_titles" (
                "id" character varying(26) NOT NULL,
                "title" text NOT NULL,
                "isPrimary" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "videoId" character varying(26) NOT NULL,
                CONSTRAINT "PK_1eb43f207970e996784be5ff478" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_b4f71a82a7f9dfab7e7921c7af" ON "video_titles" ("videoId")
            WHERE "isPrimary" = TRUE
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources"
            ADD CONSTRAINT "FK_bbae903425b10f56551dc60148c" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "video_tags"
            ADD CONSTRAINT "FK_6f9964c104164fb5eed88b52f4a" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "video_tags"
            ADD CONSTRAINT "FK_92a248c1d263a8eddb8ef92d750" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "video_thumbnails"
            ADD CONSTRAINT "FK_91f45ae79e0bf6f2dea2696112d" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "video_titles"
            ADD CONSTRAINT "FK_d69ac721691fba16dc5f08f0658" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "video_titles" DROP CONSTRAINT "FK_d69ac721691fba16dc5f08f0658"
        `);
        await queryRunner.query(`
            ALTER TABLE "video_thumbnails" DROP CONSTRAINT "FK_91f45ae79e0bf6f2dea2696112d"
        `);
        await queryRunner.query(`
            ALTER TABLE "video_tags" DROP CONSTRAINT "FK_92a248c1d263a8eddb8ef92d750"
        `);
        await queryRunner.query(`
            ALTER TABLE "video_tags" DROP CONSTRAINT "FK_6f9964c104164fb5eed88b52f4a"
        `);
        await queryRunner.query(`
            ALTER TABLE "video_sources" DROP CONSTRAINT "FK_bbae903425b10f56551dc60148c"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b4f71a82a7f9dfab7e7921c7af"
        `);
        await queryRunner.query(`
            DROP TABLE "video_titles"
        `);
        await queryRunner.query(`
            DROP TABLE "video_thumbnails"
        `);
        await queryRunner.query(`
            DROP TABLE "video_tags"
        `);
        await queryRunner.query(`
            DROP TABLE "video_sources"
        `);
        await queryRunner.query(`
            DROP TABLE "videos"
        `);
        await queryRunner.query(`
            DROP TABLE "tags"
        `);
    }

}
