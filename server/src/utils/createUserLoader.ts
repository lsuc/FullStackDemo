import DataLoader from "dataloader";
import { User } from "../entities/User";
import { In } from "typeorm";

// Input - list of userIds [1, 7, 203]
// Output - list of fetched users: [{id: 1, username: 'tim'}, {id: 7, username: 'mark'}, {id: 203, username: 'ana'}]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findBy({ id: In(userIds) });
    // Add users to a map to guarantee ordering which SQL doesn't,
    // and handle missing users
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });
    // Return users now in the same order and same number of entities as in the input uid list
    return userIds.map((userId) => userIdToUser[userId]);
  });
