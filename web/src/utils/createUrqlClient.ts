import { fetchExchange, gql, ssrExchange } from "urql";
import { cacheExchange, Cache } from "@urql/exchange-graphcache";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
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

function invalidatePosts(cache: Cache) {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");

  fieldInfos.forEach((field) => {
    // Invalidate all cached pagination results on post creation
    cache.invalidate("Query", "posts", field.arguments);
  });
}

export const createUrqlClient = (ssrExchange: any, ctx?: any) => {
  const isServer = !!ctx?.req;
  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: isServer ? ctx.req.headers : undefined,
    },
    exchanges: [
      cacheExchange({
        resolvers: {
          //         Keys are needed to fix the warning: Invalid key: The GraphQL query at the field at `Query.posts({"limit":10})` has a selection set, but no key could be generated for the data at this field.
          //         You have to request `id` or `_id` fields for all selection sets or create a custom `keys` config for `PaginatedPosts`.
          //          Entities without keys will be embedded directly on the parent entity. If this is intentional, create a `keys` config for `PaginatedPosts` that always returns null.
          keys: {
            PaginatedPosts: () => null,
            Post: (data) => data.id, // TODO not sure if this is helpful
          },
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, info) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_result, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any,
              );
              if (data) {
                if (data.voteStatus === value) {
                  return;
                }
                const newPoints =
                  (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value } as any,
                );
              }
            },
            createPost: (_result, args, cache, info) => {
              invalidatePosts(cache);
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
              invalidatePosts(cache);
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
  };
};
