import { Box, IconButton } from "@chakra-ui/react";
import React from "react";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import NextLink from "next/link";
import { DeletePostDocument, MeDocument } from "../generated/graphql";
import { useMutation, useQuery } from "@apollo/client/react";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

const EditDeletePostButtons = ({
  id,
  creatorId,
}: EditDeletePostButtonsProps) => {
  const { data: meData } = useQuery(MeDocument);
  const [deletePost] = useMutation(DeletePostDocument);
  if (meData?.me?.id !== creatorId) {
    return null;
  }
  return (
    <Box>
      <IconButton
        as={NextLink}
        href={`/post/edit/${id}`}
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
          deletePost({ variables: { id } });
        }}
      />
    </Box>
  );
};

export default EditDeletePostButtons;
