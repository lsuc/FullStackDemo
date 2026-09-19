import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import { PostDocument, UpdatePostDocument } from "../../../generated/graphql";
import useGetIntId from "../../../utils/useGetIntId";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client/react";

const EditPost = () => {
  const router = useRouter();
  const intId = useGetIntId();
  const { data, loading } = useQuery(PostDocument, {
    skip: intId === -1,
    variables: { id: intId },
  });
  const [updatePost] = useMutation(UpdatePostDocument);
  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({
            variables: { id: intId, title: values.title, text: values.text },
          });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" label="Title" placeholder="title" />
            <Box mt={4}>
              <InputField
                name="text"
                label="Body"
                placeholder="text..."
                textarea
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Update post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default EditPost;
