import { Box, Button, Flex, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { useMutation, useQuery } from "urql";
import { MeDocument, LogoutDocument } from "../generated/graphql";

const NavBar = () => {
  const [{ fetching: logoutFetching }, logout] = useMutation(LogoutDocument);
  const [{ data, fetching }] = useQuery({ query: MeDocument });
  let body = null;

  // data is loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <ChakraLink as={NextLink} href="/login" color="white" mr={2}>
          login
        </ChakraLink>
        <ChakraLink href="/register" color="white">
          register
        </ChakraLink>
      </>
    );
    // user logged in
  } else {
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
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
