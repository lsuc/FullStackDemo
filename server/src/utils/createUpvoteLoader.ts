import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";

// [{postId: 5, userId: 10}]
// load {postId: 5, userId: 10, value: 1}
// return [{postId: 5, userId: 10, value: 1}]
export const createUpvoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Upvote | null>(
    async (keys) => {
      const upvotes = await Upvote.find({
        where: keys.map(({ postId, userId }) => ({
          postId,
          userId,
        })),
      });
      const upvoteMap = new Map(
        upvotes.map((upvote) => [`${upvote.postId}:${upvote.userId}`, upvote]),
      );
      return keys.map(
        ({ postId, userId }) => upvoteMap.get(`${postId}:${userId}`) ?? null,
      );
    },
  );
