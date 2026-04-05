import { Fragment, useState } from "react";
import { IconButton, Input, Flex } from "@chakra-ui/react";
import { HiChevronDoubleRight } from "react-icons/hi2";

import Page from "./page";
import { useLists } from "./state";
import { ListDetails } from "./list-details";
import { repo } from "./repo";

export default function Lists() {
  const [newListName, setNewListName] = useState("");
  const [lists, addList, deleteList] = useLists();
  const createList = () => {
    if (!newListName.trim()) return;

    const handle = repo.create({
      name: newListName,
      items: [],
      inactiveItems: [],
      createdAt: Date.now(),
    });
    addList(handle.url);

    setNewListName("");
  };

  return (
    <Page>
      <Flex direction="column" w="100%" height="100%">
        <Flex w="100%" gap={4} p={4} pb={1}>
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New list name..."
            mb={4}
          />
          <IconButton
            onClick={createList}
            aria-label="Add list"
            variant="subtle"
            colorPalette="teal"
          >
            <HiChevronDoubleRight />
          </IconButton>
        </Flex>
        <Flex direction="column" w="100%" overflowY="auto" flex="1 1 auto">
          <Flex
            direction="column"
            h="0"
            gap={4}
            flexShrink={1}
            flexGrow={0}
            px={4}
          >
            {lists.map((listId) => (
              <Fragment key={listId}>
                <ListDetails docUrl={listId} onDelete={deleteList} />
              </Fragment>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Page>
  );
}
