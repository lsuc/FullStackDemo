import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import InputField from "../components/InputField";
import { CreatePostDocument } from "../generated/graphql";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";
import { useMutation } from "@apollo/client/react";

const CreatePost = () => {
  const router = useRouter();
  useIsAuth();
  const [createPost] = useMutation(CreatePostDocument);
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { error } = await createPost({ variables: { input: values } });
          if (!error) {
            router.push("/");
          }
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
              Create post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default CreatePost;
