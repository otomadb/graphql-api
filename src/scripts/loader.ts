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

const typeDefs = await readFile(new URL("../../schema.gql", import.meta.url), { encoding: "utf-8" });
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

const tags = [
  {
    primaryName: "U.N.オーエンは彼女なのか？",
    extraNames: ["U.N. Owen Was Her?"],
  },
  {
    primaryName: "最終鬼畜妹フランドール・S",
  },
  {
    primaryName: "AIN'T NOTHING LIKE A FUNKY BEAT",
  },
  {
    primaryName: "ドナルド・マクドナルド",
  },
  {
    primaryName: "KICK BACK",
  },
  {
    primaryName: "momone - why did i enter the art course",
  },
  {
    primaryName: "米津玄師",
  },
  {
    primaryName: "ゆゆ式",
  },
  {
    primaryName: "日向縁",
  },
  {
    primaryName: "遠野妖怪前線",
  },
  {
    primaryName: "リゼリスペクト",
  },
  {
    primaryName: "ベィスドロップ・フリークス",
  },
  {
    primaryName: "真夏の夜の淫夢",
  },
  {
    primaryName: "クッキー☆",
  },
  {
    primaryName: "TRIGGER★HAPPY",
  },
  {
    primaryName: "ぼっち・ざ・ろっく！",
    extraNames: ["ぼっち・ざ・まっど！"],
  },
  {
    primaryName: "後藤ひとり",
  },
  {
    primaryName: "伊地知虹夏",
  },
  {
    primaryName: "山田リョウ",
  },
  {
    primaryName: "喜多郁代",
  },
  {
    primaryName: "残酷な天使のテーゼ",
  },
  {
    primaryName: "Magical Higan Tour 2009",
  },
  {
    primaryName: "永谷園",
  },
  {
    primaryName: "Luv the lUNatic??",
  },
  {
    primaryName: "私に天使が舞い降りた！",
  },
  {
    primaryName: "白咲花",
  },
  {
    primaryName: "星野みやこ",
  },
  {
    primaryName: "星野ひなた",
  },
  {
    primaryName: "姫坂乃愛",
  },
  {
    primaryName: "種村小依",
  },
  {
    primaryName: "小之森夏音",
  },
  {
    primaryName: "真島茂樹",
  },
  {
    primaryName: "INTERNET OVERDOSE",
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
  },
  {
    primaryName: "地の色は黄色",
  },
  {
    primaryName: "ふ・れ・ん・ど・し・た・い",
  },
  {
    primaryName: "対武器ボス戦",
  },
  {
    primaryName: "スーパーマリオブラザーズ3",
  },
  {
    primaryName: "アスレチックBGM",
  },
  {
    primaryName: "自己参照",
  },
  {
    primaryName: "少女終末旅行",
  },
  {
    primaryName: "More One Night",
  },
  {
    primaryName: "ODESZA - All We Need ft. Shy Girls (Haywyre Remix)",
  },
  {
    primaryName: "YO-KAI Disco",
  },
  {
    primaryName: "愛宕洋榎",
  },
  {
    primaryName: "BLU-RAY Discシリーズ",
  },
  {
    primaryName: "咲-saki- 全国編",
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
for (const tag of tags) {
  await graphql({
    source: mutationRegisterTag,
    schema,
    contextValue: { user: bot },
    variableValues: { input: tag },
  });
}

const querySearchTags = `
query($query: String!){
  searchTags(query: $query) {
    result {
      tag {
        id
      }
    }
  }
}`;

const fetchTagsId = async (queries: string[]) =>
  Promise.all(
    queries
      .map((query) =>
        graphql({
          source: querySearchTags,
          schema,
          contextValue: {},
          variableValues: { query },
        }).then((result) => (result.data?.searchTags as { result: { tag: { id: string } }[] }).result.at(0)?.tag.id)
      )
      .filter((id) => !!id)
  );

const videos = [
  {
    primaryTitle: "M.C.ドナルドはダンスに夢中なのか？最終鬼畜道化師ドナルド・Ｍ",
    extraTitles: ["Ronald McDonald insanity"],
    tags: await fetchTagsId(["ドナルド・マクドナルド", "U.N.オーエンは彼女なのか？", "最終鬼畜妹フランドール・S"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm2057168"),
  },
  {
    primaryTitle: "オールスターダスト計画",
    extraTitles: [],
    tags: await fetchTagsId([
      "U.N.オーエンは彼女なのか？",
      "Bad Apple!! feat. nomico",
      "今",
      "HIKAKIN",
      "SEIKIN",
      "ドナルド・マクドナルド",
      "真島茂樹",
    ]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm35331606"),
  },
  {
    primaryTitle: "ノリノリなドンタコス",
    extraTitles: [],
    tags: await fetchTagsId(["AIN'T NOTHING LIKE A FUNKY BEAT", "ドンタコス"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41483073"),
  },
  {
    primaryTitle: "R.P.カリアはラブホなのか？",
    extraTitles: [],
    tags: await fetchTagsId(["U.N.オーエンは彼女なのか？", "ドナルド・マクドナルド"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41245677"),
  },
  {
    primaryTitle: "why did i enter the KICK BACK",
    extraTitles: [],
    tags: await fetchTagsId(["米津玄師", "KICK BACK", "momone - why did i enter the art course"]),
    sources: [],

    primaryThumbnail: await getthumbnail("sm41415426"),
  },
  {
    primaryTitle: "縁妖怪前線",
    extraTitles: [],
    tags: await fetchTagsId(["日向縁", "遠野妖怪前線", "リゼリスペクト"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm35936521"),
  },
  {
    primaryTitle: "小倉妖怪前線",
    extraTitles: [],
    tags: await fetchTagsId(["ドナルド・マクドナルド", "遠野妖怪前線", "リゼリスペクト"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm36970839"),
  },
  {
    primaryTitle: "HITRIGGER★BOCCHIY",
    extraTitles: [],
    tags: await fetchTagsId([
      "TRIGGER★HAPPY",
      "ぼっち・ざ・ろっく！",
      "後藤ひとり",
      "伊地知虹夏",
      "山田リョウ",
      "喜多郁代",
    ]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41452822"),
  },
  {
    primaryTitle: "Magical お茶漬け Tour 2009",
    extraTitles: [],
    tags: await fetchTagsId(["永谷園", "Magical Higan Tour 2009"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm11419749"),
  },
  {
    primaryTitle: "Luv the Hanatic??",
    extraTitles: [],
    tags: await fetchTagsId(["Luv the lUNatic??", "Magical Higan Tour 2009", "白咲花"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38891901"),
  },
  {
    primaryTitle: "おかやまミスティックガール",
    extraTitles: [],
    tags: [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm40783575"),
  },
  {
    primaryTitle: "アンビエント真真茂島茂樹島茂樹",
    extraTitles: [],
    tags: await fetchTagsId(["真島茂樹"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40655147"),
  },
  {
    primaryTitle: "HIMESAKA OVERDOSE",
    extraTitles: [],
    tags: await fetchTagsId(["私に天使が舞い降りた！", "INTERNET OVERDOSE", "姫坂乃愛", "白咲花", "星野ひなた"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41417198"),
  },
  {
    primaryTitle: "音を立てずに作れる音MAD",
    extraTitles: [],
    tags: await fetchTagsId(["Magical Higan Tour 2009", "さまぁ～ず"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41408413"),
  },
  {
    primaryTitle: "わたてん跋扈 ～ Who taken it!",
    extraTitles: [],
    tags: await fetchTagsId(["私に天使が舞い降りた！"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41394602"),
  },
  {
    primaryTitle: "術為遣る 捨て意地",
    extraTitles: [],
    tags: [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm40434906"),
  },
  {
    primaryTitle: "ナギットゾーン【久川凪】",
    extraTitles: [],
    tags: await fetchTagsId(["久川凪", "フラットゾーン"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm37391126"),
  },
  {
    primaryTitle: "ぼっちのギターは黒色",
    extraTitles: [],
    tags: await fetchTagsId(["地の色は黄色", "ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41315514"),
  },
  {
    primaryTitle: "ふ・れ・ん・ど・い・な・い",
    extraTitles: [],
    tags: await fetchTagsId(["ふ・れ・ん・ど・し・た・い", "ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41399552"),
  },
  {
    primaryTitle: "危険なぼっち",
    extraTitles: [],
    tags: await fetchTagsId(["対武器ボス戦", "ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41398486"),
  },
  {
    primaryTitle: "ぼっち・ざ・りふれくしょん！",
    extraTitles: [],
    tags: await fetchTagsId(["ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41391770"),
  },
  {
    primaryTitle: "ぼっち・ざ・がらーじ",
    extraTitles: [],
    tags: await fetchTagsId(["ぼっち・ざ・ろっく！", "後藤ひとり"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41362383"),
  },
  {
    primaryTitle: "ぼっち　ろっく",
    extraTitles: [],
    tags: await fetchTagsId([
      "KICK BACK",
      "ぼっち・ざ・ろっく！",
      "後藤ひとり",
      "伊地知虹夏",
      "山田リョウ",
      "喜多郁代",
    ]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41367458"),
  },
  {
    primaryTitle: "スーパー社会が怖いブラザーズ3",
    extraTitles: [],
    tags: await fetchTagsId([
      "アスレチックBGM",
      "ぼっち・ざ・ろっく！",
      "後藤ひとり",
      "伊地知虹夏",
      "山田リョウ",
      "喜多郁代",
    ]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41357917"),
  },
  {
    primaryTitle: "突然のスーパーヒューマンビートデラックス！？",
    extraTitles: [],
    tags: [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm41390853"),
  },
  {
    primaryTitle: "四個分の靴嫁",
    extraTitles: [],
    tags: await fetchTagsId(["ドナルド・マクドナルド"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40812025"),
  },
  {
    primaryTitle: "Nothing to Room 2009",
    extraTitles: [],
    tags: await fetchTagsId(["Magical Higan Tour 2009"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm25042575"),
  },
  {
    primaryTitle: "ベィスドロップ・フリークス.1919810",
    extraTitles: [],
    tags: await fetchTagsId(["クッキー☆", "真夏の夜の淫夢", "ベィスドロップ・フリークス"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm27602969"),
  },
  {
    primaryTitle: "カゲロウジジイズ",
    extraTitles: [],
    tags: await fetchTagsId(["真島茂樹"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40926580"),
  },
  {
    primaryTitle: "気ままな天使たちが舞い降りた！",
    extraTitles: [],
    tags: await fetchTagsId(["私に天使が舞い降りた！", "自己参照"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41333070"),
  },
  {
    primaryTitle: "fuuuuck we were supposed to KICKBACK",
    extraTitles: [],
    tags: await fetchTagsId(["米津玄師", "KICK BACK"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41290210"),
  },
  {
    primaryTitle: "マイヤヒーのうわさ",
    extraTitles: [],
    tags: await fetchTagsId(["ドナルド・マクドナルド"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm36859588"),
  },
  {
    primaryTitle: "All We Need",
    extraTitles: [],
    tags: await fetchTagsId(["少女終末旅行", "More One Night", "ODESZA - All We Need ft. Shy Girls (Haywyre Remix)"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41069341"),
  },
  {
    primaryTitle: "ｱｰｲｷｿ診療所",
    extraTitles: [],
    tags: [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm39773689"),
  },
  {
    primaryTitle: "これは音MADです。",
    extraTitles: [],
    tags: [],
    sources: [],
    primaryThumbnail: await getthumbnail("sm31841733"),
  },
  {
    primaryTitle: "小林さんちのメイドラゴンS Blu-ray & DVDisco",
    extraTitles: [],
    tags: await fetchTagsId(["YO-KAI Disco", "小林さんちのメイドラゴンS", "BLU-RAY Discシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39199583"),
  },
  {
    primaryTitle: "私に天使が舞い降りた完全新作アニメ劇場公開決定Disco",
    extraTitles: [],
    tags: await fetchTagsId(["YO-KAI Disco", "私に天使が舞い降りた！", "BLU-RAY Discシリーズ", "星野みやこ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39188862"),
  },
  {
    primaryTitle: "【咲-saki-全国編】BLU-RAY Disc",
    extraTitles: [],
    tags: await fetchTagsId(["YO-KAI Disco", "愛宕洋榎", "BLU-RAY Discシリーズ", "咲-saki- 全国編"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm23628070"),
  },
  {
    primaryTitle: "【ゆゆ式】BLU-RAY Disc",
    extraTitles: [],
    tags: await fetchTagsId(["YO-KAI Disco", "ゆゆ式", "BLU-RAY Discシリーズ", "日向縁"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm23657484"),
  },
  {
    primaryTitle: "連続和了 Disco",
    extraTitles: [],
    tags: await fetchTagsId(["YO-KAI Disco", "BLU-RAY Discシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm28053934"),
  },
  {
    primaryTitle: "【超次元ゲイムネプテューヌ】BLU-RAY Disc",
    extraTitles: [],
    tags: await fetchTagsId(["YO-KAI Disco", "BLU-RAY Discシリーズ", "超次元ゲイムネプテューヌ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm23752177"),
  },
  {
    primaryTitle: "【イカ娘】BLU-RAY Disc",
    extraTitles: [],
    tags: await fetchTagsId(["YO-KAI Disco", "BLU-RAY Discシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm23750111"),
  },
  {
    primaryTitle: "Luv the BLUe berric??",
    extraTitles: [],
    tags: await fetchTagsId(["ブルーベリーシリーズ", "ストライクウィッチーズ", "Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39829973"),
  },
  {
    primaryTitle: "Luv the MCDonaLD??",
    extraTitles: [],
    tags: await fetchTagsId(["ドナルド・マクドナルド", "Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38789330"),
  },
  {
    primaryTitle: "Luv the SORamimic??",
    extraTitles: [],
    tags: await fetchTagsId(["Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38408933"),
  },
  {
    primaryTitle: "6月3日ﾆﾁﾖｳﾋﾞﾆ!",
    extraTitles: [],
    tags: await fetchTagsId(["Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38757330"),
  },
  {
    primaryTitle: "Luv the bROcCOlic??",
    extraTitles: [],
    tags: await fetchTagsId(["Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38457760"),
  },
  {
    primaryTitle: "luv the nintendonotanoshimihamugendaidesu??",
    extraTitles: [],
    tags: await fetchTagsId(["Luv the lUNatic??"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38514788"),
  },
  {
    primaryTitle: "ミスティック・ブルーベリー",
    extraTitles: [],
    tags: await fetchTagsId(["ブルーベリーシリーズ", "ストライクウィッチーズ", "ミスティック・ガール"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm37722279"),
  },
  {
    primaryTitle: "いっしょにメイドインワリオ　イッショニーのテーマ",
    extraTitles: [],
    tags: await fetchTagsId(["アシュリーのテーマ", "いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm34563179"),
  },
  {
    primaryTitle: "ラグ最終痴漢電車",
    extraTitles: [],
    tags: await fetchTagsId(["ラグトレイン", "いっしょにシリーズ"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39358316"),
  },
  {
    primaryTitle: "マクドメカニズム",
    extraTitles: [],
    tags: await fetchTagsId(["ドナルド・マクドナルド", "マッドメカニズム"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40949648"),
  },
  {
    primaryTitle: "アラーっぽいな",
    extraTitles: [],
    tags: await fetchTagsId(["ドナルド・マクドナルド", "神っぽいな"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40074046"),
  },
  {
    primaryTitle: "各駅停車で旅をして",
    extraTitles: [],
    tags: await fetchTagsId(["ラグトレイン", "少女終末旅行"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39702443"),
  },
  {
    primaryTitle: "物売るっていうレベル5-judgelight-",
    extraTitles: [],
    tags: await fetchTagsId(["物売るっていうレベルじゃねぇぞ！", "とある科学の超電磁砲", "LEVEL5-judgelight-"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm36532704"),
  },
  {
    primaryTitle: "雛見沢症候群　LEVEL5 -judgelight-",
    extraTitles: [],
    tags: await fetchTagsId([
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
    tags: await fetchTagsId(["クッキー☆", "真夏の夜の淫夢", "Zomboy - Mind Control"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm24820469"),
  },
  {
    primaryTitle: "ラグとレイン",
    extraTitles: [],
    tags: await fetchTagsId(["ラグトレイン", "serial experiments lain"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm39283556"),
  },
  {
    primaryTitle: "Raise Your Cookies.mp4",
    extraTitles: [],
    tags: await fetchTagsId(["クッキー☆"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm24102888"),
  },
  {
    primaryTitle: "ドS妖怪前線 ver2",
    extraTitles: [],
    tags: await fetchTagsId(["ブレンド・S", "遠野妖怪前線", "リゼリスペクト"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm38132036"),
  },
  {
    primaryTitle: "紗路妖怪前線",
    extraTitles: [],
    tags: await fetchTagsId(["ご注文はうさぎですか？", "遠野妖怪前線", "リゼリスペクト"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm36671690"),
  },
  {
    primaryTitle: "遠野道化前線",
    extraTitles: [],
    tags: await fetchTagsId(["ドナルド・マクドナルド", "遠野妖怪前線"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm40843640"),
  },
  {
    primaryTitle: "高音厨音域ティンコ",
    extraTitles: [],
    tags: await fetchTagsId(["真島茂樹", "高音厨音域テスト"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41042641"),
  },
  {
    primaryTitle: "Magical Myaa-Nee Tour 2019",
    extraTitles: [],
    tags: await fetchTagsId(["私に天使が舞い降りた！", "星野ひなた", "Magical Higan Tour 2009"]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm36264241"),
  },
  {
    primaryTitle: "この音、フラットゾーンで使えるかな",
    extraTitles: [],
    tags: await fetchTagsId([
      "フラットゾーン",
      "ぼっち・ざ・ろっく！",
      "後藤ひとり",
      "伊地知虹夏",
      "山田リョウ",
      "喜多郁代",
    ]),
    sources: [],
    primaryThumbnail: await getthumbnail("sm41483678"),
  },
  {
    primaryTitle: "ドウモー・プランクトン・ゴトウデス",
    extraTitles: [],
    tags: await fetchTagsId([
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
];

const mutationRegisterVideo = `
mutation($input: RegisterVideoInput!) {
  registerVideo(input: $input) {
    video {
      id
    }
  }
}`;

for (const video of videos) {
  await graphql({
    source: mutationRegisterVideo,
    schema,
    contextValue: { user: bot },
    variableValues: { input: video },
  });
}

const querySearchVideos = `
query($query: String!){
  searchVideos(query: $query) {
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
    }).then(({ data }) => (data?.searchVideos as { result: { video: { id: string } }[] }).result.at(0)?.video.id);
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
