import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFile } from "fs/promises";
import { graphql } from "graphql";
import neo4j from "neo4j-driver";
import { dirname } from "path";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { entities } from "../db/entities/index.js";
import { Mylist, MylistShareRange } from "../db/entities/mylists.js";
import { User } from "../db/entities/users.js";
import { resolvers } from "../resolvers/index.js";

const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  migrations: [`${dirname(new URL(import.meta.url).pathname)}/migrations/*.ts`],
});
await dataSource.initialize();
await dataSource.dropDatabase();
await dataSource.synchronize();

const bot = new User();
bot.id = ulid();
bot.name = `bot`;
bot.displayName = "Bot";
bot.email = `bot@example.com`;
bot.password = "you can't login this user";
bot.icon = "";
await dataSource.getRepository(User).insert(bot);

const neo4jDriver = neo4j.driver(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  process.env.NEO4J_URL!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
);
const neo4jSession = neo4jDriver.session();
try {
  await neo4jSession.run("MATCH (n) DETACH DELETE n");
} finally {
  await neo4jSession.close();
}

const typeDefs = await readFile(new URL("../../schema.graphql", import.meta.url), { encoding: "utf-8" });
const schema = makeExecutableSchema({
  typeDefs,
  resolvers: resolvers({
    dataSource,
    neo4jDriver,
  }),
});

const getthumbnail = (v: string) => {
  const url = new URL(`/api/watch/v3_guest/${v}`, "https://www.nicovideo.jp");
  url.searchParams.set("_frontendId", "6");
  url.searchParams.set("_frontendVersion", "0");
  url.searchParams.set("actionTrackId", "PWbSs1_1");
  url.searchParams.set("skips", "harmful");

  return fetch(url.toString())
    .then((v) => v.json())
    .then((v) => v.data.video.thumbnail.player);
};

const querySearchTags = `
query($query: String!){
  searchTags(input:{query:$query,limit:1}) {
    result {
      tag {
        id
      }
    }
  }
}`;

const findTagIds = async (queries: string[]): Promise<string[]> =>
  Promise.all(
    queries.map((query) =>
      graphql({
        source: querySearchTags,
        schema,
        contextValue: {},
        variableValues: { query },
      }).then((result) => (result.data?.searchTags as { result: { tag: { id: string } }[] }).result.at(0)?.tag.id)
    )
  ).then((ids) => ids.filter((id): id is string => !!id));

const tags = [
  {
    primaryName: "曲",
    extraNames: ["MUSIC"],
    meaningless: true,
  },
  {
    primaryName: "作品",
    extraNames: ["COPYRIGHT"],
    meaningless: true,
  },
  {
    primaryName: "シリーズ",
    extraNames: ["SERIES"],
    meaningless: true,
  },
  {
    primaryName: "戦法",
    extraNames: ["TACTICS"],
    meaningless: true,
  },
  {
    primaryName: "作風",
    extraNames: ["STYLE"],
    meaningless: true,
  },
  {
    primaryName: "イベント",
    extraNames: ["EVENT"],
    meaningless: true,
  },
  {
    primaryName: "キャラクター",
    extraNames: ["CHARACTER"],
    meaningless: true,
  },
  {
    primaryName: "フレーズ",
    extraNames: ["PHRASE"],
    meaningless: true,
  },
  {
    primaryName: "東方Project",
    implicitParents: () => findTagIds(["COPYRIGHT"]),
  },
  {
    primaryName: "U.N.オーエンは彼女なのか？",
    extraNames: ["U.N. Owen Was Her?"],
    implicitParents: () => findTagIds(["東方Project", "MUSIC"]),
  },
  {
    primaryName: "最終鬼畜妹フランドール・S",
    implicitParents: () => findTagIds(["MUSIC", "東方Project", "U.N.オーエンは彼女なのか？"]),
  },
  {
    primaryName: "AIN'T NOTHING LIKE A FUNKY BEAT",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "ドナルド・マクドナルド",
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "米津玄師",
  },
  {
    primaryName: "KICK BACK",
    implicitParents: () => findTagIds(["米津玄師", "曲"]),
  },
  {
    primaryName: "momone - why did i enter the art course",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "ゆゆ式",
    implicitParents: () => findTagIds(["作品"]),
  },
  {
    primaryName: "日向縁",
    explicitParent: async () => (await findTagIds(["ゆゆ式"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "遠野妖怪前線",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "リゼリスペクト",
    implicitParents: () => findTagIds(["シリーズ"]),
  },
  {
    primaryName: "ベィスドロップ・フリークス",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "真夏の夜の淫夢",
  },
  {
    primaryName: "クッキー☆",
  },
  {
    primaryName: "TRIGGER★HAPPY",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "ぼっち・ざ・ろっく！",
    extraNames: ["ぼっち・ざ・まっど！"],
    implicitParents: () => findTagIds(["作品"]),
  },
  {
    primaryName: "後藤ひとり",
    explicitParent: async () => (await findTagIds(["ぼっち・ざ・ろっく！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "伊地知虹夏",
    explicitParent: async () => (await findTagIds(["ぼっち・ざ・ろっく！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "山田リョウ",
    explicitParent: async () => (await findTagIds(["ぼっち・ざ・ろっく！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "喜多郁代",
    explicitParent: async () => (await findTagIds(["ぼっち・ざ・ろっく！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "残酷な天使のテーゼ",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "Magical Higan Tour 2009",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "永谷園",
  },
  {
    primaryName: "Luv the lUNatic??",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "私に天使が舞い降りた！",
    implicitParents: () => findTagIds(["作品"]),
  },
  {
    primaryName: "白咲花",
    explicitParent: async () => (await findTagIds(["私に天使が舞い降りた！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "星野みやこ",
    explicitParent: async () => (await findTagIds(["私に天使が舞い降りた！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "星野ひなた",
    explicitParent: async () => (await findTagIds(["私に天使が舞い降りた！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "姫坂乃愛",
    explicitParent: async () => (await findTagIds(["私に天使が舞い降りた！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "種村小依",
    explicitParent: async () => (await findTagIds(["私に天使が舞い降りた！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "小之森夏音",
    explicitParent: async () => (await findTagIds(["私に天使が舞い降りた！"])).at(0),
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "真島茂樹",
  },
  {
    primaryName: "INTERNET OVERDOSE",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "さまぁ～ず",
  },
  {
    primaryName: "HIKAKIN",
    extraNames: ["ヒカキン"],
  },
  {
    primaryName: "SEIKIN",
    extraNames: ["セイキン"],
  },
  {
    primaryName: "今",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "地の色は黄色",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "ふ・れ・ん・ど・し・た・い",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "対武器ボス戦",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "スーパーマリオブラザーズ3",
  },
  {
    primaryName: "アスレチックBGM",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "自己参照",
    implicitParents: () => findTagIds(["作風"]),
  },
  {
    primaryName: "少女終末旅行",
    implicitParents: () => findTagIds(["作品"]),
  },
  {
    primaryName: "More One Night",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "ODESZA - All We Need ft. Shy Girls (Haywyre Remix)",
    implicitParents: () => findTagIds(["作品"]),
  },
  {
    primaryName: "咲-saki-",
    implicitParents: () => findTagIds(["作品"]),
  },
  {
    primaryName: "咲-saki- 全国編",
    implicitParents: () => findTagIds(["咲-saki-", "作品"]),
  },
  {
    primaryName: "YO-KAI Disco",
    implicitParents: () => findTagIds(["曲"]),
  },
  {
    primaryName: "愛宕洋榎",
    implicitParents: () => findTagIds(["キャラクター"]),
  },
  {
    primaryName: "BLU-RAY Discシリーズ",
    implicitParents: () => findTagIds(["シリーズ"]),
  },
  {
    primaryName: "超次元ゲイムネプテューヌ",
  },
  {
    primaryName: "serial experiments lain",
  },
  {
    primaryName: "ラグトレイン",
  },
  {
    primaryName: "ブレンド・S",
  },
  {
    primaryName: "ご注文はうさぎですか？",
  },
  {
    primaryName: "高音厨音域テスト",
  },
  {
    primaryName: "LEVEL5-judgelight-",
  },
  {
    primaryName: "物売るっていうレベルじゃねぇぞ！",
    implicitParents: () => findTagIds(["フレーズ"]),
  },
  {
    primaryName: "小林さんちのメイドラゴンS",
  },
  {
    primaryName: "久川凪",
  },
  {
    primaryName: "フラットゾーン",
  },
  {
    primaryName: "ストライクウィッチーズ",
  },
  {
    primaryName: "ブルーベリーシリーズ",
  },
  {
    primaryName: "ミスティック・ガール",
  },
  {
    primaryName: "ひぐらしのなく頃に",
  },
  {
    primaryName: "とある科学の超電磁砲",
  },
  {
    primaryName: "Zomboy - Mind Control",
  },
  {
    primaryName: "神っぽいな",
  },
  {
    primaryName: "マッドメカニズム",
  },
  {
    primaryName: "いっしょにシリーズ",
  },
  {
    primaryName: "アシュリーのテーマ",
  },
];
const mutationRegisterTag = `
mutation($input: RegisterTagInput!) {
  registerTag(input: $input) {
    tag {
      id
    }
  }
}`;
for (const { primaryName, extraNames, explicitParent, implicitParents, meaningless } of tags) {
  const result = await graphql({
    source: mutationRegisterTag,
    schema,
    contextValue: { user: bot },
    variableValues: {
      input: {
        primaryName,
        extraNames,
        meaningless,
        explicitParent: await explicitParent?.(),
        implicitParents: await implicitParents?.(),
      },
    },
  });
  if (result.errors) {
    console.dir(result.errors);
  }
}

const videos = [
  {
    primaryTitle: "M.C.ドナルドはダンスに夢中なのか？最終鬼畜道化師ドナルド・Ｍ",
    extraTitles: ["Ronald McDonald insanity"],
    tags: () => findTagIds(["ドナルド・マクドナルド", "U.N.オーエンは彼女なのか？", "最終鬼畜妹フランドール・S"]),
    sources: [{ type: "NICOVIDEO", sourceId: "sm2057168" }],
    primaryThumbnail: await getthumbnail("sm2057168"),
  },
  {
    primaryTitle: "オールスターダスト計画",
    extraTitles: [],
    tags: () =>
      findTagIds([
        "U.N.オーエンは彼女なのか？",
        "Bad Apple!! feat. nomico",
        "今",
        "HIKAKIN",
        "SEIKIN",
        "ドナルド・マクドナルド",
        "真島茂樹",
      ]),
    sources: [{ type: "NICOVIDEO", sourceId: "sm35331606" }],
    primaryThumbnail: await getthumbnail("sm35331606"),
  },
  {
    primaryTitle: "ノリノリなドンタコス",
    extraTitles: [],
    tags: () => findTagIds(["AIN'T NOTHING LIKE A FUNKY BEAT", "ドンタコス"]),
    sources: [{ type: "NICOVIDEO", sourceId: "sm41483073" }],
    primaryThumbnail: await getthumbnail("sm41483073"),
  },
  {
    primaryTitle: "R.P.カリアはラブホなのか？",
    extraTitles: [],
    tags: () => findTagIds(["U.N.オーエンは彼女なのか？", "ドナルド・マクドナルド"]),
    sources: [{ type: "NICOVIDEO", sourceId: "sm41245677" }],
    primaryThumbnail: await getthumbnail("sm41245677"),
  },
  {
    primaryTitle: "why did i enter the KICK BACK",
    extraTitles: [],
    tags: () => findTagIds(["米津玄師", "KICK BACK", "momone - why did i enter the art course"]),
    sources: [{ type: "NICOVIDEO", sourceId: "sm41415426" }],
    primaryThumbnail: await getthumbnail("sm41415426"),
  },
  {
    primaryTitle: "縁妖怪前線",
    extraTitles: [],
    tags: () => findTagIds(["日向縁", "遠野妖怪前線", "リゼリスペクト"]),
    sources: [{ type: "NICOVIDEO", sourceId: "sm35936521" }],
    primaryThumbnail: await getthumbnail("sm35936521"),
  },
  {
    primaryTitle: "小倉妖怪前線",
    extraTitles: [],
    tags: () => findTagIds(["ドナルド・マクドナルド", "遠野妖怪前線", "リゼリスペクト"]),
    sources: [{ type: "NICOVIDEO", sourceId: "sm36970839" }],
    primaryThumbnail: await getthumbnail("sm36970839"),
  },
  {
    primaryTitle: "HITRIGGER★BOCCHIY",
    extraTitles: [],
    tags: () =>
      findTagIds(["TRIGGER★HAPPY", "ぼっち・ざ・ろっく！", "後藤ひとり", "伊地知虹夏", "山田リョウ", "喜多郁代"]),
    sources: [{ type: "NICOVIDEO", sourceId: "sm41452822" }],
    primaryThumbnail: await getthumbnail("sm41452822"),
  },
  {
    primaryTitle: "Magical お茶漬け Tour 2009",
    extraTitles: [],
    tags: () => findTagIds(["永谷園", "Magical Higan Tour 2009"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm11419749"),
  },
  {
    primaryTitle: "Luv the Hanatic??",
    extraTitles: [],
    tags: () => findTagIds(["Luv the lUNatic??", "Magical Higan Tour 2009", "白咲花"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38891901"),
  },
  {
    primaryTitle: "おかやまミスティックガール",
    extraTitles: [],
    tags: () => [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm40783575"),
  },
  {
    primaryTitle: "アンビエント真真茂島茂樹島茂樹",
    extraTitles: [],
    tags: () => findTagIds(["真島茂樹"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40655147"),
  },
  {
    primaryTitle: "HIMESAKA OVERDOSE",
    extraTitles: [],
    tags: () => findTagIds(["私に天使が舞い降りた！", "INTERNET OVERDOSE", "姫坂乃愛", "白咲花", "星野ひなた"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41417198"),
  },
  {
    primaryTitle: "音を立てずに作れる音MAD",
    extraTitles: [],
    tags: () => findTagIds(["Magical Higan Tour 2009", "さまぁ～ず"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41408413"),
  },
  {
    primaryTitle: "わたてん跋扈 ～ Who taken it!",
    extraTitles: [],
    tags: () => findTagIds(["私に天使が舞い降りた！"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41394602"),
  },
  {
    primaryTitle: "術為遣る 捨て意地",
    extraTitles: [],
    tags: () => [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm40434906"),
  },
  {
    primaryTitle: "ナギットゾーン【久川凪】",
    extraTitles: [],
    tags: () => findTagIds(["久川凪", "フラットゾーン"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm37391126"),
  },
  {
    primaryTitle: "ぼっちのギターは黒色",
    extraTitles: [],
    tags: () => findTagIds(["地の色は黄色", "ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41315514"),
  },
  {
    primaryTitle: "ふ・れ・ん・ど・い・な・い",
    extraTitles: [],
    tags: () => findTagIds(["ふ・れ・ん・ど・し・た・い", "ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41399552"),
  },
  {
    primaryTitle: "危険なぼっち",
    extraTitles: [],
    tags: () => findTagIds(["対武器ボス戦", "ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41398486"),
  },
  {
    primaryTitle: "ぼっち・ざ・りふれくしょん！",
    extraTitles: [],
    tags: () => findTagIds(["ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41391770"),
  },
  {
    primaryTitle: "ぼっち・ざ・がらーじ",
    extraTitles: [],
    tags: () => findTagIds(["ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41362383"),
  },
  {
    primaryTitle: "ぼっち　ろっく",
    extraTitles: [],
    tags: () => findTagIds(["KICK BACK", "ぼっち・ざ・ろっく！", "後藤ひとり", "伊地知虹夏", "山田リョウ", "喜多郁代"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41367458"),
  },
  {
    primaryTitle: "スーパー社会が怖いブラザーズ3",
    extraTitles: [],
    tags: () =>
      findTagIds(["アスレチックBGM", "ぼっち・ざ・ろっく！", "後藤ひとり", "伊地知虹夏", "山田リョウ", "喜多郁代"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41357917"),
  },
  {
    primaryTitle: "突然のスーパーヒューマンビートデラックス！？",
    extraTitles: [],
    tags: () => [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm41390853"),
  },
  {
    primaryTitle: "四個分の靴嫁",
    extraTitles: [],
    tags: () => findTagIds(["ドナルド・マクドナルド"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40812025"),
  },
  {
    primaryTitle: "Nothing to Room 2009",
    extraTitles: [],
    tags: () => findTagIds(["Magical Higan Tour 2009"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm25042575"),
  },
  {
    primaryTitle: "ベィスドロップ・フリークス.1919810",
    extraTitles: [],
    tags: () => findTagIds(["クッキー☆", "真夏の夜の淫夢", "ベィスドロップ・フリークス"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm27602969"),
  },
  {
    primaryTitle: "カゲロウジジイズ",
    extraTitles: [],
    tags: () => findTagIds(["真島茂樹"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40926580"),
  },
  {
    primaryTitle: "気ままな天使たちが舞い降りた！",
    extraTitles: [],
    tags: () => findTagIds(["私に天使が舞い降りた！", "自己参照"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41333070"),
  },
  {
    primaryTitle: "fuuuuck we were supposed to KICKBACK",
    extraTitles: [],
    tags: () => findTagIds(["米津玄師", "KICK BACK"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41290210"),
  },
  {
    primaryTitle: "マイヤヒーのうわさ",
    extraTitles: [],
    tags: () => findTagIds(["ドナルド・マクドナルド"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm36859588"),
  },
  {
    primaryTitle: "All We Need",
    extraTitles: [],
    tags: () => findTagIds(["少女終末旅行", "More One Night", "ODESZA - All We Need ft. Shy Girls (Haywyre Remix)"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41069341"),
  },
  {
    primaryTitle: "ｱｰｲｷｿ診療所",
    extraTitles: [],
    tags: () => [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm39773689"),
  },
  {
    primaryTitle: "これは音MADです。",
    extraTitles: [],
    tags: () => [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm31841733"),
  },
  {
    primaryTitle: "小林さんちのメイドラゴンS Blu-ray & DVDisco",
    extraTitles: [],
    tags: () => findTagIds(["YO-KAI Disco", "小林さんちのメイドラゴンS", "BLU-RAY Discシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39199583"),
  },
  {
    primaryTitle: "私に天使が舞い降りた完全新作アニメ劇場公開決定Disco",
    extraTitles: [],
    tags: () => findTagIds(["YO-KAI Disco", "私に天使が舞い降りた！", "BLU-RAY Discシリーズ", "星野みやこ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39188862"),
  },
  {
    primaryTitle: "【咲-saki-全国編】BLU-RAY Disc",
    extraTitles: [],
    tags: () => findTagIds(["YO-KAI Disco", "愛宕洋榎", "BLU-RAY Discシリーズ", "咲-saki- 全国編"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm23628070"),
  },
  {
    primaryTitle: "【ゆゆ式】BLU-RAY Disc",
    extraTitles: [],
    tags: () => findTagIds(["YO-KAI Disco", "ゆゆ式", "BLU-RAY Discシリーズ", "日向縁"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm23657484"),
  },
  {
    primaryTitle: "連続和了 Disco",
    extraTitles: [],
    tags: () => findTagIds(["YO-KAI Disco", "BLU-RAY Discシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm28053934"),
  },
  {
    primaryTitle: "【超次元ゲイムネプテューヌ】BLU-RAY Disc",
    extraTitles: [],
    tags: () => findTagIds(["YO-KAI Disco", "BLU-RAY Discシリーズ", "超次元ゲイムネプテューヌ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm23752177"),
  },
  {
    primaryTitle: "【イカ娘】BLU-RAY Disc",
    extraTitles: [],
    tags: () => findTagIds(["YO-KAI Disco", "BLU-RAY Discシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm23750111"),
  },
  {
    primaryTitle: "Luv the BLUe berric??",
    extraTitles: [],
    tags: () => findTagIds(["ブルーベリーシリーズ", "ストライクウィッチーズ", "Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39829973"),
  },
  {
    primaryTitle: "Luv the MCDonaLD??",
    extraTitles: [],
    tags: () => findTagIds(["ドナルド・マクドナルド", "Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38789330"),
  },
  {
    primaryTitle: "Luv the SORamimic??",
    extraTitles: [],
    tags: () => findTagIds(["Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38408933"),
  },
  {
    primaryTitle: "6月3日ﾆﾁﾖｳﾋﾞﾆ!",
    extraTitles: [],
    tags: () => findTagIds(["Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38757330"),
  },
  {
    primaryTitle: "Luv the bROcCOlic??",
    extraTitles: [],
    tags: () => findTagIds(["Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38457760"),
  },
  {
    primaryTitle: "luv the nintendonotanoshimihamugendaidesu??",
    extraTitles: [],
    tags: () => findTagIds(["Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38514788"),
  },
  {
    primaryTitle: "ミスティック・ブルーベリー",
    extraTitles: [],
    tags: () => findTagIds(["ブルーベリーシリーズ", "ストライクウィッチーズ", "ミスティック・ガール"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm37722279"),
  },
  {
    primaryTitle: "いっしょにメイドインワリオ　イッショニーのテーマ",
    extraTitles: [],
    tags: () => findTagIds(["アシュリーのテーマ", "いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm34563179"),
  },
  {
    primaryTitle: "ラグ最終痴漢電車",
    extraTitles: [],
    tags: () => findTagIds(["ラグトレイン", "いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39358316"),
  },
  {
    primaryTitle: "マクドメカニズム",
    extraTitles: [],
    tags: () => findTagIds(["ドナルド・マクドナルド", "マッドメカニズム"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40949648"),
  },
  {
    primaryTitle: "アラーっぽいな",
    extraTitles: [],
    tags: () => findTagIds(["ドナルド・マクドナルド", "神っぽいな"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40074046"),
  },
  {
    primaryTitle: "各駅停車で旅をして",
    extraTitles: [],
    tags: () => findTagIds(["ラグトレイン", "少女終末旅行"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39702443"),
  },
  {
    primaryTitle: "物売るっていうレベル5-judgelight-",
    extraTitles: [],
    tags: () => findTagIds(["物売るっていうレベルじゃねぇぞ！", "とある科学の超電磁砲", "LEVEL5-judgelight-"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm36532704"),
  },
  {
    primaryTitle: "雛見沢症候群　LEVEL5 -judgelight-",
    extraTitles: [],
    tags: () =>
      findTagIds([
        "物売るっていうレベルじゃねぇぞ！",
        "LEVEL5-judgelight-",
        "とある科学の超電磁砲",
        "ひぐらしのなく頃に",
      ]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39191310"),
  },
  {
    primaryTitle: "Minm Control.Zunboy",
    extraTitles: [],
    tags: () => findTagIds(["クッキー☆", "真夏の夜の淫夢", "Zomboy - Mind Control"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm24820469"),
  },
  {
    primaryTitle: "ラグとレイン",
    extraTitles: [],
    tags: () => findTagIds(["ラグトレイン", "serial experiments lain"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39283556"),
  },
  {
    primaryTitle: "Raise Your Cookies.mp4",
    extraTitles: [],
    tags: () => findTagIds(["クッキー☆"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm24102888"),
  },
  {
    primaryTitle: "ドS妖怪前線 ver2",
    extraTitles: [],
    tags: () => findTagIds(["ブレンド・S", "遠野妖怪前線", "リゼリスペクト"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38132036"),
  },
  {
    primaryTitle: "紗路妖怪前線",
    extraTitles: [],
    tags: () => findTagIds(["ご注文はうさぎですか？", "遠野妖怪前線", "リゼリスペクト"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm36671690"),
  },
  {
    primaryTitle: "遠野道化前線",
    extraTitles: [],
    tags: () => findTagIds(["ドナルド・マクドナルド", "遠野妖怪前線"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40843640"),
  },
  {
    primaryTitle: "高音厨音域ティンコ",
    extraTitles: [],
    tags: () => findTagIds(["真島茂樹", "高音厨音域テスト"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41042641"),
  },
  {
    primaryTitle: "Magical Myaa-Nee Tour 2019",
    extraTitles: [],
    tags: () => findTagIds(["私に天使が舞い降りた！", "星野ひなた", "Magical Higan Tour 2009"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm36264241"),
  },
  {
    primaryTitle: "この音、フラットゾーンで使えるかな",
    extraTitles: [],
    tags: () =>
      findTagIds(["フラットゾーン", "ぼっち・ざ・ろっく！", "後藤ひとり", "伊地知虹夏", "山田リョウ", "喜多郁代"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41483678"),
  },
  {
    primaryTitle: "ドウモー・プランクトン・ゴトウデス",
    extraTitles: [],
    tags: () =>
      findTagIds([
        "トウキョウ・シャンディ・ランデヴ",
        "ぼっち・ざ・ろっく！",
        "後藤ひとり",
        "伊地知虹夏",
        "山田リョウ",
        "喜多郁代",
      ]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41455100"),
  },
  {
    primaryTitle: "終点",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39826021"),
  },
  {
    primaryTitle: "桜Trick",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ", "won(*3*)chu_kissme!"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39826012"),
  },
  {
    primaryTitle: "金星のダンス",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ", "金星のダンス"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39825990"),
  },
  {
    primaryTitle: "遠野妖怪前線",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ", "遠野妖怪前線"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39825985"),
  },
  {
    primaryTitle: "RUNNING IN THE 90's",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ", "RUNNING IN THE 90's"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41154467"),
  },
  {
    primaryTitle: "竹取飛翔",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ", "竹取飛翔"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40806249"),
  },
  {
    primaryTitle: "上海紅茶館",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39826029"),
  },
  {
    primaryTitle: "ネプテューヌ",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39825929"),
  },
  {
    primaryTitle: "ブクレシュティの人形師",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39825948"),
  },
  {
    primaryTitle: "プレインエイジア",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39825953"),
  },
  {
    primaryTitle: "マミさんのテーマ",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39825962"),
  },
  {
    primaryTitle: "リバースイデオロギー",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39825976"),
  },
  {
    primaryTitle: "ターゲットをこわせ！",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39825923"),
  },
  {
    primaryTitle: "カカカタ☆カタオモイ",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39825880"),
  },
  {
    primaryTitle: "Haunted Dance",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41247102"),
  },
  {
    primaryTitle: "マスクドデデデ",
    extraTitles: [],
    tags: () => findTagIds(["マスクドデデデ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41237850"),
  },
  {
    primaryTitle: "禁じられた遊び",
    extraTitles: [],
    tags: () => findTagIds(["いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41237826"),
  },
];

const mutationRegisterVideo = `
mutation($input: RegisterVideoInput!) {
  registerVideo(input: $input) {
    video {
      id
    }
  }
}`;

for (const { primaryTitle, extraTitles, primaryThumbnail, sources, tags } of videos) {
  const result = await graphql({
    source: mutationRegisterVideo,
    schema,
    contextValue: { user: bot },
    variableValues: {
      input: {
        primaryTitle,
        extraTitles,
        primaryThumbnail,
        sources,
        tags: await tags?.(),
      },
    },
  });
  if (result.errors) console.dir(result.errors);
}

const querySearchVideos = `
query($query: String!){
  searchVideos(input:{query:$query,limit:1}) {
    result {
      video {
        id
      }
    }
  }
}`;
const mutationLikeVideo = `
mutation($videoId: ID!){
  likeVideo(input:{videoId: $videoId}){
    registration{
      id
    }
  }
}`;
for (let i = 1; i <= 10; i++) {
  const testuser = new User();
  testuser.id = ulid();
  testuser.name = `testuser${i}`;
  testuser.displayName = `Test User ${i}`;
  testuser.email = `testuser${i}@example.com`;
  testuser.password = "you can't login this user";
  testuser.icon = "";

  await dataSource.getRepository(User).insert(testuser);
  await dataSource.getRepository(Mylist).insert({
    id: ulid(),
    title: `favorites for ${testuser.displayName}`,
    range: MylistShareRange.PRIVATE,
    holder: { id: testuser.id },
    isLikeList: true,
  });

  const likeIndexes = [...new Set([...new Array(15)].map(() => Math.floor(Math.random() * videos.length)))];
  for (const i of likeIndexes) {
    const videoId = await graphql({
      source: querySearchVideos,
      schema,
      contextValue: {},
      variableValues: { query: videos[i].primaryTitle },
    }).then((result) => (result.data?.searchVideos as { result: { video: { id: string } }[] }).result.at(0)?.video.id);
    if (!videoId) continue;
    await graphql({
      source: mutationLikeVideo,
      schema,
      contextValue: { user: testuser },
      variableValues: { videoId },
    });
  }
}

await dataSource.destroy();
await neo4jDriver.close();
process.exit(0);
