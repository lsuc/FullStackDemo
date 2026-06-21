import { fetchExchange, ssrExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  CreatePostMutation,
  PostsQuery,
} from "../generated/graphql";
import { betterUpdateQuery } from "../utils/betterUpdateQuery";

import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";
import { cursorPagination } from "./cursorPagination";

export const errorExchange: Exchange =
  ({ forward }) =>
  (op$) => {
    return pipe(
      forward(op$),
      tap((result) => {
        if (result.error?.message.includes("Not authenticated")) {
          Router.replace("/login");
        }
      }),
    );
  };

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    cacheExchange({
      resolvers: {
        //         Keys are needed to fix the warning: Invalid key: The GraphQL query at the field at `Query.posts({"limit":10})` has a selection set, but no key could be generated for the data at this field.
        //         You have to request `id` or `_id` fields for all selection sets or create a custom `keys` config for `PaginatedPosts`.
        //          Entities without keys will be embedded directly on the parent entity. If this is intentional, create a `keys` config for `PaginatedPosts` that always returns null.
        keys: {
          PaginatedPosts: () => null,
        },
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          createPost: (_result, args, cache) => {
            cache
              .inspectFields("Query")
              .filter((field) => field.fieldName === "posts")
              .forEach((field) => {
                // Invalidate all cached pagination results on post creation
                cache.invalidate("Query", "posts", field.arguments);
              });
          },
          logout: (_result, args, cache, info) => {
            // me query should return null
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null }),
            );
          },
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              },
            );
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              },
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
