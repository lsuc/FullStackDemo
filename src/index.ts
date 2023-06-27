import { MikroORM } from "@mikro-orm/core" 
import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import mikroConfig from './mikro-orm.config'
import express from 'express'
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolvers/HelloResolver"
import { createHandler } from 'graphql-http/lib/use/express';

console.log("dirname: ", __dirname)

const main = async () => {
   
    const orm = await MikroORM.init(mikroConfig);

    // run migration automatically in the code, instead of on cli
    await orm.getMigrator().up();

    const graphqlServer = express()
    const schema = await buildSchema({resolvers: [HelloResolver], validate: false})
    // Create the GraphQL over HTTP Node request handler for express 
    graphqlServer.all('/graphql', createHandler({ schema }));

    graphqlServer.listen(4000, ()=>{console.log("server started on localhost:4000")});
}

main().catch(e => {console.error(e);});