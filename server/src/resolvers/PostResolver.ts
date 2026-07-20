import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[] = [];
  @Field()
  hasMore: boolean = false;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 100);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req, dataSource }: MyContext,
  ): Promise<boolean> {
    const isUpvote = value > 0;
    const realValue = isUpvote ? 1 : -1;
    const { userId } = req.session;
    const upvote = await Upvote.findOne({ where: { postId, userId } });

    // The user has voted on the post before
    if (upvote && upvote.value !== realValue) {
      await dataSource.transaction(async (tm) => {
        await tm.query(
          `
          UPDATE upvote
          SET value = $1
          WHERE "postId" = $2 AND "userId" = $3
          `,
          [realValue, postId, userId],
        );

        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2
          `,
          [2 * realValue, postId],
        );
      });
    } else if (!upvote) {
      // Has never voted before
      await dataSource.transaction(async (tm) => {
        await tm.query(
          `
          INSERT INTO upvote ("userId", "postId", "value")
          values($1, $2, $3);
          `,
          [userId, postId, realValue],
        );
        await tm.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2
          `,
          [realValue, postId],
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req, dataSource }: MyContext,
  ): Promise<PaginatedPosts> {
    //await sleep(3000);
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];
    let userIdIdx: number | null = null;
    let cursorIdx: number | null = null;

    if (req.session.userId) {
      replacements.push(req.session.userId);
      userIdIdx = replacements.length;
    }

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIdx = replacements.length;
    }

    const posts = await dataSource.query(
      `
      select p.*, 
      ${
        userIdIdx
          ? `(select value from upvote where "userId"=$${userIdIdx} and "postId"=p.id) "voteStatus"`
          : 'null as "voteStatus"'
      }
      from post p
      ${cursorIdx ? `where p."createdAt" < $${cursorIdx}` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements,
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({
      where: {
        id,
      },
    });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext,
  ): Promise<Post> {
    const post = Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req, dataSource }: MyContext,
  ): Promise<Post | null> {
    const result = await dataSource
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();
    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext,
  ): Promise<boolean> {
    // const post = await Post.findOne({
    //   where: {
    //     id,
    //   },
    // });
    // if (!post) {
    //   return false;
    // }
    // if (post?.creatorId !== req.session.userId) {
    //   throw new Error("Not authorized");
    // }
    // await Upvote.delete({ postId: id });
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
