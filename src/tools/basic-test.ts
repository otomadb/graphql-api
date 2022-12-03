import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql } from "graphql";
import { readFile } from "node:fs/promises";
import { ulid } from "ulid";
import { z } from "zod";
import { dataSource } from "../db/data-source.js";
import { User } from "../db/entities/users.js";
import { resolvers } from "../resolvers/index.js";

export const typeDefs = await readFile(new URL("../../schema.gql", import.meta.url), { encoding: "utf-8" });

await dataSource.initialize()
const schema = makeExecutableSchema({ typeDefs, resolvers });

const user = new User()
user.id = ulid()
user.name = `TestUser_${user.id}`
user.displayName = user.name
user.email = `${user.id}@example.com`
user.password = "fakeuser"
user.icon = ""

await dataSource.getRepository(User).insert(user)

const zCreateTagRes = z.object({
    data: z.object({
        registerTag: z.object({
            tag: z.object({
                id: z.string(),
            })
        })
    })
})

const queryForRegisterTag = `mutation ($input: RegisterTagInput!) { 
    registerTag(input: $input) {
        tag {
            id
        }
    }
}`

const createParentTag = await graphql({
    contextValue: { user },
    source: queryForRegisterTag,
    schema,
    variableValues: {
        input: {
            primaryName: "東方",
            extraNames: ["Touhou"]
        }
    }
}).then(r => zCreateTagRes.parse(r))

const createTag = await graphql({
    contextValue: { user },
    source: queryForRegisterTag,
    schema,
    variableValues: {
        input: {
            primaryName: "U.N.オーエンは彼女なのか？",
            extraNames: ["U.N. Owen Was Her?"],
            explicitParent: createParentTag.data.registerTag.tag.id
        }
    }
}).then(r => zCreateTagRes.parse(r))

const queryForRegisterVideo = `mutation ($input: RegisterVideoInput!) {
    registerVideo(input: $input) {
        video {
            id
        }
    }
}`
const zCreateVideoRes = z.object({
    data: z.object({
        registerVideo: z.object({
            video: z.object({
                id: z.string()
            })
        })
    })
})

const createVideo = await graphql({
    contextValue: { user },
    source: queryForRegisterVideo,
    schema,
    variableValues: {
        input: {
            primaryTitle: "M.C.ドナルドはダンスに夢中なのか？最終鬼畜道化師ドナルド・Ｍ",
            extraTitles: ["Ronald McDonald insanity"],
            tags: [createTag.data.registerTag.tag.id],
            primaryThumbnail: "https://img.cdn.nimg.jp/s/nicovideo/thumbnails/2057168/2057168.original/r1280x720l?key=64c3379f18890e6747830c596be0a7276dab4e0fe574a98671b3b0c58c1f54c8",
            sources: [{
                type: "NICOVIDEO",
                sourceId: "sm2057168"
            }]
        }
    }
}).then(v => zCreateVideoRes.parse(v))

console.log(createVideo)

await dataSource.destroy()