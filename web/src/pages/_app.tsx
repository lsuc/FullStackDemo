import { ChakraProvider } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client/react";

import theme from "../theme";
import { AppProps } from "next/app";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { PaginatedPosts } from "../generated/graphql";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: {
          // TODO: Replace keyArgs: [] with keyArgs: ["subreddit"]
          // when posts can be filtered by subreddit.
          keyArgs: [],

          merge(
            existing: PaginatedPosts | undefined,
            incoming: PaginatedPosts,
          ): PaginatedPosts {
            if (!existing) {
              return incoming;
            }

            return {
              ...incoming,
              posts: [...existing.posts, ...incoming.posts],
            };
          },
        },
      },
    },
  },
});
const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
  }),
  cache: cache,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default MyApp;
