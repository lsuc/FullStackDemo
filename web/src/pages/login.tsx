import { Form, Formik } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { useMutation } from "urql";
import { LoginDocument } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/navigation";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Login = () => {
  const router = useRouter();
  const [, login] = useMutation(LoginDocument);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            console.log(response);
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // successful login
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              label="Username or Email"
              placeholder="username or email"
            />
            <Box mt={4}>
              <InputField
                name="password"
                label="Password"
                placeholder="password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
