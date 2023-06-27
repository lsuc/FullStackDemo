import ExpressServerTest from "./ExpressServerTest"
import { testGetPosts, testInsertPost } from "./mikroORMTests"

export function runExpressServerTests() {
    const test = new ExpressServerTest()
    test.test()
}

export async function runMikroORMTests() {
    await testInsertPost()
    await testGetPosts()
}