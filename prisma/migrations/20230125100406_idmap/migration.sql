-- AlterTable
ALTER TABLE "mylist_group_mylist_inclusions" RENAME CONSTRAINT "PK_e0d0b6a037fdb9633296d165914" TO "mylist_group_mylist_inclusions_pkey";

-- AlterTable
ALTER TABLE "mylist_groups" RENAME CONSTRAINT "PK_283e995beb055f327e92afeb787" TO "mylist_groups_pkey";

-- AlterTable
ALTER TABLE "mylist_registrations" RENAME CONSTRAINT "PK_7f7232b504749e2c3d916353e89" TO "mylist_registrations_pkey";

-- AlterTable
ALTER TABLE "mylists" RENAME CONSTRAINT "PK_2d3fcd4c9328d290bd0268dc1c8" TO "mylists_pkey";

-- AlterTable
ALTER TABLE "nicovideo_video_sources" RENAME CONSTRAINT "PK_7acd648a4ecaada5bbeec79fe5c" TO "nicovideo_video_sources_pkey";

-- AlterTable
ALTER TABLE "semitags" RENAME CONSTRAINT "PK_27c9b8f9e08f86a3576c300b2e1" TO "semitags_pkey";

-- AlterTable
ALTER TABLE "sessions" RENAME CONSTRAINT "PK_3238ef96f18b355b671619111bc" TO "sessions_pkey";

-- AlterTable
ALTER TABLE "tag_names" RENAME CONSTRAINT "PK_844280ab35721a1e89497db5617" TO "tag_names_pkey";

-- AlterTable
ALTER TABLE "tag_parents" RENAME CONSTRAINT "PK_cc4322310226e2a49d6edc80d71" TO "tag_parents_pkey";

-- AlterTable
ALTER TABLE "tags" RENAME CONSTRAINT "PK_e7dc17249a1148a1970748eda99" TO "tags_pkey";

-- AlterTable
ALTER TABLE "users" RENAME CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" TO "users_pkey";

-- AlterTable
ALTER TABLE "video_tags" RENAME CONSTRAINT "PK_46a3780fea7f7e85204356a3b4b" TO "video_tags_pkey";

-- AlterTable
ALTER TABLE "video_thumbnails" RENAME CONSTRAINT "PK_9540a7e1a10bcaad41085ca7dca" TO "video_thumbnails_pkey";

-- AlterTable
ALTER TABLE "video_titles" RENAME CONSTRAINT "PK_1eb43f207970e996784be5ff478" TO "video_titles_pkey";

-- AlterTable
ALTER TABLE "videos" RENAME CONSTRAINT "PK_e4c86c0cf95aff16e9fb8220f6b" TO "videos_pkey";
