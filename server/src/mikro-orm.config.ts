import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core" 
import path from "path" //node.js import
import { User } from "./entities/User";

const Config : Parameters<typeof MikroORM.init>[0] = { // providing exact parameters type forbids us from defining non-existent property here
    migrations: {
        path: path.join(__dirname, './migrations'), // path to the folder with js migrations
        pathTs: path.join(__dirname, '../src/migrations'), // path to the folder with TS migrations
        glob: '!(*.d).{js,ts}' // how to match migration files (all .js and .ts files, but not .d.ts)
    },
    entities: [Post, User], // corresponds to all our db tables
    dbName: 'lireddit', 
    type: "postgresql",
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    debug: !__prod__ , // debug true when not in production,
}  

export default Config;
