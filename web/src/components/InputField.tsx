import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { useField } from "formik";
import { InputProps, Textarea, TextareaProps } from "@chakra-ui/react";

type InputFieldProps =
  | ({
      textarea?: false;
      name: string;
      label: string;
    } & InputProps)
  | ({
      textarea: true;
      name: string;
      label: string;
    } & TextareaProps);

const InputField = (props: InputFieldProps) => {
  const [field, { error }] = useField(props.name);

  const { label, textarea, ...rest } = props as any;

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      {props.textarea ? (
        <Textarea {...field} {...rest} id={field.name} />
      ) : (
        <Input {...field} {...rest} id={field.name} />
      )}

      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
