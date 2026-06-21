import { Box, Button, Flex, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { useMutation, useQuery } from "urql";
import { MeDocument, LogoutDocument } from "../generated/graphql";
import { useState, useEffect } from "react";

const NavBar = () => {
  const [{ fetching: logoutFetching }, logout] = useMutation(LogoutDocument);
  // Additional me query is run on the server because we wrapped index page with NavBar in urql SSR client.
  // But nextjs server doesn't have a cookie set, so it doesn't know the current user and returns null.
  // The issue is that when the page is rendered on the server, the GraphQL request for me doesn't have access
  // to the browser's session cookie unless you explicitly forward cookies from the incoming Next.js request to your GraphQL server.
  // Use mounted as a temporary workaround, to avoid nav bar displaying that user is not logged in on refresh.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [{ data, fetching }] = useQuery({
    query: MeDocument,
    pause: !mounted,
  });

  let body = null;

  // printed "data: { me: null }" due to SSR and additional query on the server
  // prints "data: undefined" with mounted workaround - no query happening on the server anymore
  //console.log("data:", data);

  if (fetching) {
    // data is loading
    return null;
  } else if (!data?.me) {
    // user not logged in
    body = (
      <Flex>
        <ChakraLink as={NextLink} href="/login" color="white" mr={2}>
          Log in
        </ChakraLink>
        <ChakraLink as={NextLink} ml={2} href="/register" color="white">
          Register
        </ChakraLink>
      </Flex>
    );
  } else {
    // user logged in
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => {
            logout({});
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          Log out
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} bg="tan" position="sticky" top={0} p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
