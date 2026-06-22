import { Field, ObjectType, Int } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Upvote } from "./Upvote";

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

  @Field(() => Int, { nullable: true }) // Current user's voting status on the post
  voteStatus?: number | null; // upvote: 1, downvote: -1, not voted: null

  @Field()
  @Column()
  creatorId?: number;

  @Field({ nullable: true })
  @ManyToOne(() => User, (user) => user.posts)
  creator?: User;

  @OneToMany(() => Upvote, (upvote) => upvote.post)
  upvotes?: Upvote[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date;

  fieldInTheClass?: string =
    "Just a field in the class because it's not decorated, not a database column"; // also not exposed to GraphQL with @Field
}
