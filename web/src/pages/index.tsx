import { PostsDocument, PostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import {
  Box,
  Button,
  Link as ChakraLink,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import UpvoteSection from "../components/UpvoteSection";
import EditDeletePostButtons from "../components/EditDeletePostButtons";
import { useQuery } from "@apollo/client/react";
import { NetworkStatus } from "@apollo/client";

const Index = () => {
  const { data, error, loading, fetchMore, variables, networkStatus } =
    useQuery(PostsDocument, {
      variables: {
        limit: 15,
        cursor: null,
      },
      notifyOnNetworkStatusChange: true,
    });

  if (!loading && !data) {
    return (
      <div>
        <div>Couldn't fetch any posts to show.</div>
        <div>{error?.message}</div>
      </div>
    );
  }

  return (
    <Layout>
      {!data && loading ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <Flex direction="column" align="center" width="40px" mr={4}>
                  <UpvoteSection post={p} />
                </Flex>
                <Box flex={1}>
                  <ChakraLink
                    as={NextLink}
                    ml="auto"
                    mt={2}
                    href={`/post/${p.id}`}
                  >
                    <Heading fontSize="xl">{p.title}</Heading>
                  </ChakraLink>
                  <Text>Posted by {p.creator?.username}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {p.textSnippet}
                    </Text>
                    <Box ml="auto">
                      <EditDeletePostButtons
                        id={p.id}
                        creatorId={p.creator.id}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            ),
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() =>
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data?.posts.posts[data.posts.posts.length - 1]?.createdAt,
                },
              })
            }
            isLoading={networkStatus === NetworkStatus.fetchMore}
            m="auto"
            my={8}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default Index;
