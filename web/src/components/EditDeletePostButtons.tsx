import { Box, IconButton } from "@chakra-ui/react";
import React from "react";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

const EditDeletePostButtons = ({
  id,
  creatorId,
}: EditDeletePostButtonsProps) => {
  const [{ data: meData }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();
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
          deletePost({ id });
        }}
      />
    </Box>
  );
};

export default EditDeletePostButtons;
