import { PrismaClient } from "@prisma/client";
import { Logger } from "pino";

import { groups } from "./AbstractGroups.js";

export const mkAbstractGroupService = ({ prisma, logger }: { prisma: PrismaClient; logger: Logger }) => {
  return {
    async initGroups() {
      logger.info("Start to update abstract groups");
      try {
        await prisma.$transaction(
          Object.entries(groups).map(([keyword, group]) =>
            prisma.abstractGroup.upsert({
              where: {
                keyword,
              },
              create: {
                keyword,
                names: {
                  createMany: {
                    skipDuplicates: true,
                    data: Object.entries(group.names).map(([lang, name]) => ({
                      locale: lang,
                      name,
                    })),
                  },
                },
              },
              update: {
                names: {
                  createMany: {
                    skipDuplicates: true,
                    data: Object.entries(group.names).map(([lang, name]) => ({
                      locale: lang,
                      name,
                    })),
                  },
                },
              },
            }),
          ),
        );
        logger.info("Succeeded!");
      } catch (e) {
        logger.error(e, "Failed to update abstract groups");
      }
    },
  };
};

export type AbstractGroupService = ReturnType<typeof mkAbstractGroupService>;
