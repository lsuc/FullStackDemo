import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import * as argon2 from "argon2";
import { UniqueConstraintViolationException } from "@mikro-orm/core";

@InputType()
class UserNamePasswordInput {
    @Field()
    username!: string
    @Field()
    password!: string
}

@ObjectType()
class FieldError {
    @Field()
    field!: string
    @Field()
    message?: string
}

@ObjectType()
class UserResponse {
    @Field(()=>[FieldError], {nullable: true})
    errors?: FieldError[]
    @Field(()=>User, {nullable: true})
    user?: User
}

/*function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
    if ('code' in (e as any)) return true;
    else return false;
  }*/

export class UserResolver {
    @Mutation(()=>UserResponse)
    async register(
        @Arg('options') options: UserNamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        if (options.username.length < 2)
        {
            return { errors: [{field: 'username',  message: 'Length must be greater than 2'}]};
        }
        if (options.password.length <= 4)
        {
            return { errors: [{field: 'password', message: 'Length must be greater than 4'}]};
        }
        const hashedPass = await argon2.hash(options.password);
        const user = em.create(User, { username: options.username, password: hashedPass});
        try {
            await em.persistAndFlush(user);
        } catch (err) {
            if (err instanceof UniqueConstraintViolationException) {
                console.error("Error code:", err.code);
                console.error("Error message:", err.message);
                return { errors: [{field: 'username', message: 'Username already exists'}]};
            }
            else {
                console.error("Error: ", err);
                return { errors: [{field: 'unknown', message: 'Unknown error'}]};
            }
        }
        return { user };
    }

    @Mutation(()=>UserResponse)
    async login(
        @Arg('options') options: UserNamePasswordInput,
        @Ctx() {em}: MyContext
    ) : Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username});
        if (!user) {
            return {
                errors: [{field: "username", message: "Username " + options.username + " doesn't exist"}]
            };
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{field: "password", message: "Incorrect password"}]
            };
        }
  
        return { user };
    }
}