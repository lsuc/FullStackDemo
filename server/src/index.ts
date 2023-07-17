import { MikroORM } from "@mikro-orm/core" 
import { __prod__ } from "./constants"
import mikroConfig from './mikro-orm.config'
import express from 'express'
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolvers/HelloResolver"
import { createHandler } from 'graphql-http/lib/use/express';
import { PostResolver } from "./resolvers/PostResolver"
import { UserResolver } from "./resolvers/UserResolver"
import RedisStore from "connect-redis"
import session from "express-session"
import {createClient} from "redis"
import { MyContext } from "./types"

console.log("dirname: ", __dirname)

const main = async () => {
   
    const orm = await MikroORM.init(mikroConfig);

    // run migration automatically in the code, instead of on cli
    await orm.getMigrator().up();

    // Initialize redis client.
    let redisClient = createClient()
    redisClient.connect().catch(console.error)

    // Initialize store.
    let redisStore = new RedisStore({
        client: redisClient,
        prefix: "myapp:",
        disableTouch: true
    }) 

    const app = express()
    /*
    import cors from "cors";
    const corsOptions = {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    };
      
    app.use(cors(corsOptions));*/

    // Initialize sesssion storage.
    app.use (
    session({
        name: 'qid',
        store: redisStore,
        resave: false, // required: force lightweight session keep alive (touch)
        saveUninitialized: false, // recommended: only save session when data exists
        secret: process.env.SESSION_SECRET!,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
            httpOnly: true,
            secure: __prod__, // cookie only works in https
            sameSite: "lax", 
        }
    })); 

    const schema = await buildSchema({resolvers: [ HelloResolver, PostResolver, UserResolver], validate: false});

   // Create the GraphQL over HTTP Node request handler for express 
    app.all('/graphql',  (req, res, next) => {
        const handler = createHandler({schema, context: () : MyContext => {
            return ({ em: orm.em.fork(), req, res })
        }});
         handler(req, res, next);
    }); 

    app.listen(4000, ()=>{console.log("server started on localhost:4000")});
}

main().catch(e => {console.error(e);});

