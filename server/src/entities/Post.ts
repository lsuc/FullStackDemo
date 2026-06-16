import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType() // Convert entity to a graphQL type, so graphql can work with it directly
@Entity()
export class Post extends BaseEntity {
  // Allows Post.find(), Post.insert(), etc.
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date;

  @Field()
  @Column()
  title!: string;

  fieldInTheClass?: string =
    "Just a field in the class because it's not decorated, not a database column"; // also not exposed to GraphQL with @Field
}
