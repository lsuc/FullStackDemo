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
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 100);
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

    await dataSource.query(
      `
      START_TRANSACTION;
      
      insert into upvote ("userId", "postId", "value")
      values(${userId}, ${postId}, ${realValue});
      
      update post
      set points = points + ${realValue}
      where id = ${postId};
      COMMIT;
      `,
    );

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { dataSource }: MyContext,
  ): Promise<PaginatedPosts> {
    //await sleep(3000);
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await dataSource.query(
      `
      select p.*, 
      json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements,
    );

    // const qb = dataSource
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   //.innerJoinAndSelect("p.creator", "creator")
    //   .orderBy('p."createdAt"', "DESC") // get newest posts first
    //   .take(realLimitPlusOne);
    // if (cursor) {
    //   qb.andWhere('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }
    //const posts = await qb.getMany();
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | null> {
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
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", { nullable: true }) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne({
      where: {
        id,
      },
    });
    if (!post) {
      return null;
    }

    if (typeof title === undefined || title === post.title) {
      return post;
    }
    await Post.update({ id }, { title });
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete({ id });
    return true;
  }
}
