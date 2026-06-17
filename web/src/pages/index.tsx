import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { PostsDocument } from "../generated/graphql";
import { useQuery } from "urql";
import Layout from "../components/Layout";
import { Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
  const [{ data }] = useQuery({ query: PostsDocument });
  return (
    <Layout>
      <ChakraLink as={NextLink} ml="auto" mt={2} href="/create-post">
        Create post
      </ChakraLink>

      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
