import { Flex, IconButton, Box } from "@chakra-ui/react";
import React, { useState } from "react";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}
const UpvoteSection = ({ post }: UpvoteSectionProps) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" align="center" width="40px" mr={4}>
      <IconButton
        icon={<BsChevronUp />}
        bgColor={post.voteStatus === 1 ? "green.400" : undefined}
        textColor={post.voteStatus === 1 ? "white" : undefined}
        onClick={async () => {
          if (post.voteStatus === 1) return;
          setLoadingState("upvote-loading");
          await vote({ postId: post.id, value: 1 });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "upvote-loading"}
        aria-label="Upvote"
        boxSize={5}
      />
      <Box>{post.points}</Box>
      <IconButton
        icon={<BsChevronDown />}
        bgColor={post.voteStatus === -1 ? "red.400" : undefined}
        textColor={post.voteStatus === -1 ? "white" : undefined}
        onClick={async () => {
          if (post.voteStatus === -1) return;
          setLoadingState("downvote-loading");
          await vote({ postId: post.id, value: -1 });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downvote-loading"}
        aria-label="Downvote"
        boxSize={5}
      />
    </Flex>
  );
};

export default UpvoteSection;
