import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { PostsDocument } from "../generated/graphql";
import { useQuery } from "urql";
import Layout from "../components/Layout";
import {
  Box,
  Link as ChakraLink,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
  const [{ data }] = useQuery({
    query: PostsDocument,
    variables: {
      limit: 10,
    },
  });
  return (
    <Layout>
      <ChakraLink as={NextLink} ml="auto" mt={2} href="/create-post">
        Create post
      </ChakraLink>

      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data.posts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.text.slice(0, 200)}</Text>
            </Box>
          ))}
        </Stack>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
