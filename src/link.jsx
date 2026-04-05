import { Link } from "@chakra-ui/react";
import { NavLink } from "react-router";

export default ({ to, children, ...rest }) => (
  <Link asChild {...rest}>
    <NavLink to={to}>{children}</NavLink>
  </Link>
);
