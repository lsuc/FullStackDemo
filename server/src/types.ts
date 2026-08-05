import { Request, Response } from "express";
import Redis from "ioredis";
import { DataSource } from "typeorm";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
  dataSource: DataSource;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
