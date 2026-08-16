import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import path from "path";

import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { Upvote } from "./entities/Upvote";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [User, Post, Upvote],
  migrations: [path.join(__dirname, "./migrations/*.{js,ts}")],
  synchronize: false,
  logging: true,
});
