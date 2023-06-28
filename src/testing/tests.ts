import ExpressServerTest from "./express-server-test"
import { testGetPosts, testInsertPost } from "./mikro-orm-tests"

export function runExpressServerTests() {
    const test = new ExpressServerTest()
    test.test()
}

export async function runMikroORMTests() {
    await testInsertPost()
    await testGetPosts()
}