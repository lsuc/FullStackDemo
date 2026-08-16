import "reflect-metadata";
import { __prod__, COOKIE_NAME } from "./constants";
import express from "express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/HelloResolver";
import { PostResolver } from "./resolvers/PostResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { createHandler } from "graphql-http/lib/use/express";
import { MyContext } from "./types";
import RedisStore from "connect-redis";
import Redis from "ioredis";
import session from "express-session";
import cors from "cors";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import path from "path";
import { Upvote } from "./entities/Upvote";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

console.log("dirname: ", __dirname);

const main = async () => {
  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [User, Post, Upvote],
    migrations: [path.join(__dirname, "./migrations/*")],
    synchronize: true, // no need to run a migration
    logging: true,
  });

  await dataSource.initialize();

  // Run migration automatically on startup
  await dataSource.runMigrations();

  // Manually clear database
  // await Post.clear();

  // Initialize redis client.
  const redis = new Redis();

  // Initialize store.
  let redisStore = new RedisStore({
    client: redis,
    prefix: "myapp:",
    disableTouch: true,
  });

  // Create server
  const app = express();

  // Setup cors
  const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  };
  app.set("proxy", 1);
  app.use(cors(corsOptions));

  // Initialize sesssion storage.
  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: process.env.SESSION_SECRET!,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
        httpOnly: true,
        secure: __prod__, // cookie only works in https
        sameSite: "lax",
        // Not sure if this will work without a custom domain, so setup a custom domain and use it here
        domain: __prod__ ? ".mydomain.com" : undefined,
      },
    }),
  );

  // Create GraphQL schema and GraphQL endpoint on express
  const schema = await buildSchema({
    resolvers: [HelloResolver, PostResolver, UserResolver],
    validate: false,
  });
  app.all("/graphql", (req, res, next) => {
    const handler = createHandler({
      schema,
      context: (): MyContext => {
        return {
          req,
          res,
          redis,
          dataSource,
          userLoader: createUserLoader(),
          upvoteLoader: createUpvoteLoader(),
        };
      },
    });
    handler(req, res, next);
  });

  app.listen(process.env.PORT, () => {
    console.log("Server started on localhost:4000");
  });
};

main().catch((e) => {
  console.error(e);
});
