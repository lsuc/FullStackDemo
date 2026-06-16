import ExpressServerTest from "./express-server-test";

export function runExpressServerTests() {
  const test = new ExpressServerTest();
  test.test();
}
