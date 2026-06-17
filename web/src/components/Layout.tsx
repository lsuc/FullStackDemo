import React from "react";
import NavBar from "./NavBar";
import Wrapper, { WrapperVariant } from "./Wrapper";

interface LayoutProps {
  variant?: WrapperVariant;
  children: React.ReactNode;
}

const Layout = ({ children, variant }: LayoutProps) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;
