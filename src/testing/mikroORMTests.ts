import { MikroORM } from "@mikro-orm/core" 
import mikroConfig from '../mikro-orm.config'
import { Post } from "../entities/Post"

export async function testInsertPost() {
    const orm = await MikroORM.init(mikroConfig);
    const ormFork = orm.em.fork() // orm.em is using the global entity manager instance, and we should use forked one for each request
    const post = ormFork.create(Post, {title: 'my best post'}); // just create Post object, equivalent to const post = new Post('my first post'), if Post had a ctor. Easier to use it like this than creating a ctor and other OOP stuff just to create a Post
    await ormFork.persistAndFlush(post); // insert post into database
}

export async function testGetPosts() {
    const orm = await MikroORM.init(mikroConfig);
    const ormFork = orm.em.fork() // orm.em is using the global entity manager instance, and we should use forked one for each request
    const posts = await ormFork.find(Post, {})
    console.log(posts)
}