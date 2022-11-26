import { MongoClient, ObjectId } from "mongodb";
import { readFile } from "node:fs/promises"
import { join, dirname } from "node:path"

const mongoClient = new MongoClient("mongodb://user:pass@127.0.0.1:27017/otomadb?authSource=admin");
await mongoClient.connect();
const currentDir = dirname(new URL(import.meta.url).pathname)
const collections = [
    "accounts",
    "tags",
    "users",
    "videos",
]

function crawler(o: any): any {
    if (Array.isArray(o)) {
        return o.map(crawler)
    }
    if (o == null) return o
    if (typeof o === "object") {
        if ("$oid" in o) {
            return new ObjectId(o.$oid)
        } else {
            return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, crawler(v)]))
        }
    }
    return o
}

for (const collection of collections) {
    const objects = JSON.parse(await readFile(join(currentDir, `${collection}.json`), { encoding: "utf-8" }))
    await mongoClient.db().collection(collection).deleteMany({})
    console.log(await mongoClient.db().collection(collection).insertMany(crawler(objects)))
}
process.exit(0)