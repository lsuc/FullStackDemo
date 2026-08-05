import {
  Box,
  Button,
  Flex,
  Link as ChakraLink,
  Heading,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useMutation, useQuery } from "urql";
import { MeDocument, LogoutDocument } from "../generated/graphql";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const NavBar = () => {
  const router = useRouter();
  const [{ fetching: logoutFetching }, logout] = useMutation(LogoutDocument);
  // This would be rendered on the server because we wrapped index page with NavBar in urql client with SSR: true.
  // We don't want me query to be run on the server (even though that would work since we're forwarding cookie to nextjs server),
  // so we use mounted as a workaround.
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
      <Flex align="center">
        <Button as={NextLink} mr={4} href="/create-post">
          Create post
        </Button>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout({});
            router.reload();
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
    <Flex zIndex={1} bg="tan" position="sticky" top={0} p={4} align="center">
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <ChakraLink as={NextLink} href="/">
          <Heading>LiReddit</Heading>
        </ChakraLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
