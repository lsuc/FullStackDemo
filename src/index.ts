import { MikroORM } from "@mikro-orm/core" 
import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import mikroConfig from './mikro-orm.config'

console.log("Hello Lea Suc, you are amazing <3")
console.log("dirname: ", __dirname)

const a = 3

const main = async () => {
   
    const orm = await MikroORM.init(mikroConfig);

    // run migration automatically in the code, instead of on cli
    await orm.getMigrator().up();

    const ormFork = orm.em.fork() // orm.em is using the global entity manager instance, and we should use forked one for each request
    //const post = ormFork.create(Post, {title: 'my second post'}); // just create Post object, equivalent to const post = new Post('my first post'), if Post had a ctor. Easier to use it like this than creating a ctor and other OOP stuff just to create a Post
    //await ormFork.persistAndFlush(post); // insert post into database

    //Equivalent to create and persist and flush, if I don't need post object:
    //await orm.em.insert(Post, {title: 'My first post'})  //this line could work with the global EM too, why? because `nativeInsert` is not touching the identity map = the context

    const posts = await ormFork.find(Post, {})
    console.log(posts)
} ;

main().catch(e => {console.error(e);});