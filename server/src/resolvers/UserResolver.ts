import {
  Resolver,
  Mutation,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import * as argon2 from "argon2";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";

@ObjectType()
class FieldError {
  @Field()
  field?: string;
  @Field()
  message?: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
  if ("code" in (e as any)) return true;
  else return false;
}

@Resolver()
export class UserResolver {
  /* @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { em }: MyContext) {
    //const user = await em.findOne(User, {email})
    return true;
  }*/

  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    console.log(req.session);
    // You are not logged in
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPass = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPass,
      email: options.email,
    });
    //let user;
    try {
      /* const result = await (em as EntityManager)
            .createQueryBuilder(User)
            .getKnexQuery()
            .insert({
                    username: options.username, 
                    password: hashedPass,
                    created_at: new Date(),
                    updated_at: new Date(),
            })
            .returning("*");
            user = result[0]; */
      await em.persistAndFlush(user);
    } catch (err) {
      if (
        err instanceof UniqueConstraintViolationException ||
        (isErrnoException(err) && err.code === "23505")
      ) {
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
        return {
          errors: [{ field: "username", message: "Username already taken" }],
        };
      } else {
        console.error("Error: ", err);
        return { errors: [{ field: "unknown", message: "Unknown error" }] };
      }
    }
    // store user id session - will keep user logged in
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "User " + usernameOrEmail + " doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "Incorrect password" }],
      };
    }

    req.session.userId = user.id;
    console.log(req.session.userId);
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      // destroy session in redis
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME); // clear the cookie
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      }),
    );
  }
}
