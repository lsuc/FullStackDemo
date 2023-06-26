import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {

  @PrimaryKey()
  id!: number;

  @Property({ type: 'date' })
  createdAt?: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })  // In my Migrations I got the wrong type here also
  updatedAt? = new Date();

  @Property({type: 'text'}) // In my Migrations I got varchar[255] type column, but I want it longer so I want to specify type here
  title!: string;

  fieldInTheClass? = "Just a field in the class because it's not decorated, not a database column"
}