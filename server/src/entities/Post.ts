import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType() // Convert entity to a graphQL type, so graphql can work with it directly
@Entity()
export class Post extends BaseEntity {
  // Allows Post.find(), Post.insert(), etc.
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId?: number;

  @ManyToOne(() => User, (user) => user.posts)
  creator?: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date;

  fieldInTheClass?: string =
    "Just a field in the class because it's not decorated, not a database column"; // also not exposed to GraphQL with @Field
}
