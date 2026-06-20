import { Resolver } from "@urql/exchange-graphcache";
import { stringifyVariables } from "urql";

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    // Printing gives this:
    // {fieldKey: 'posts({"cursor":"1781809143356","limit":10})', fieldName: 'posts', arguments: {cursor: '1781809143356', limit: 10}
    const isInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts",
    );
    // Pass in partial to tell urql we haven't found anything in the cache and force urql to fetch data
    info.partial = !isInTheCache;

    let hasMore = true;
    const results: string[] = [];
    // Query
    //  - posts({"limit":10}) -> PaginatedPosts:abc
    // PaginatedPosts:abc
    //  - posts -> [Post:1, Post:2, Post:3]
    //  - hasMore -> true
    fieldInfos.forEach((fi) => {
      const paginatedKey = cache.resolve(entityKey, fi.fieldKey) as string;
      const posts = cache.resolve(paginatedKey, "posts") as string[];
      const _hasMore = cache.resolve(paginatedKey, "hasMore") as boolean;
      if (!_hasMore) {
        hasMore = _hasMore;
      }

      results.push(...posts);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};
