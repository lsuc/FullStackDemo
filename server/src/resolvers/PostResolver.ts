import { Resolver, Query, Arg, Mutation } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  /*async*/
  posts(): Promise<Post[]> {
    //await sleep(3000);
    return Post.find();
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
  async createPost(@Arg("title") title: string): Promise<Post> {
    const post = Post.create({ title }).save();
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
