import { Box } from "@chakra-ui/layout";

export type WrapperVariant = "small" | "regular";

interface WrapperProps {
  variant?: WrapperVariant;
  children: React.ReactNode;
}

const Wrapper = ({ children, variant = "regular" }: WrapperProps) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
    >
      {children}
    </Box>
  );
};

export default Wrapper;
