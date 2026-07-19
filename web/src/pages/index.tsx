import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import Layout from "../components/Layout";
import {
  Box,
  Button,
  Link as ChakraLink,
  Flex,
  Heading,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import UpvoteSection from "../components/UpvoteSection";
import { BsTrash, BsPencilSquare } from "react-icons/bs";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 20,
    cursor: null as null | string,
  });

  const [{ data: meData }] = useMeQuery();
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: variables.limit,
      cursor: variables.cursor,
    },
  });
  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>Couldn't fetch any posts to show.</div>;
  }
  return (
    <Layout>
      {!data && fetching ? (
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
                    {meData?.me?.id !== p.creator?.id ? null : (
                      <Box ml="auto">
                        <IconButton
                          as={NextLink}
                          href={`/post/edit/${p.id}`}
                          ml="auto"
                          mr={4}
                          textColor="blue.500"
                          icon={<BsPencilSquare />}
                          aria-label="Edit post"
                        />
                        <IconButton
                          ml="auto"
                          textColor="red.500"
                          icon={<BsTrash />}
                          aria-label="Delete post"
                          onClick={() => {
                            deletePost({ id: p.id });
                          }}
                        />
                      </Box>
                    )}
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
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            isLoading={fetching}
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
