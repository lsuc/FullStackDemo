import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType() // Convert to graphQL type, we can stack decorators
@Entity()
export class Post {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field()
  @Property({ type: 'date' })
  createdAt?: Date = new Date();

  @Field()
  @Property({ type: 'date', onUpdate: () => new Date() })  // In my Migrations I got the wrong type here also
  updatedAt?: Date = new Date();
  
  @Field()
  @Property({type: 'text'}) // In my Migrations I got varchar[255] type column, but I want it longer so I want to specify type here
  title!: string;

  fieldInTheClass?: string = "Just a field in the class because it's not decorated, not a database column" // also not exposed to GraphQL with @Field
}