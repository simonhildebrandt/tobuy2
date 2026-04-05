import { Flex } from "@chakra-ui/react";
import { ColorModeButton } from "./components/ui/color-mode";
import Link from "./link";

export default ({ children }) => {
  return (
    <Flex width="100%" height="100%" direction="column" alignItems="center">
      <Flex
        as="header"
        width="100%"
        alignItems="center"
        px={4}
        py={2}
        bg={{ base: "gray.100", _dark: "gray.900" }}
        justify="space-between"
      >
        <Link to="/">
          <h1>StoreRun</h1>
        </Link>
        <ColorModeButton />
      </Flex>
      <Flex as="main" width="100%" maxWidth="800px" p={4} flex={1}>
        {children}
      </Flex>
    </Flex>
  );
};
