import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { MeDocument } from "../generated/graphql";

export const useIsAuth = () => {
  const { data, loading } = useQuery(MeDocument);
  const router = useRouter();
  useEffect(() => {
    if (!loading && !data?.me) {
      router.replace("/login?next=" + router.asPath);
    }
  }, [loading, data, router]);
};
