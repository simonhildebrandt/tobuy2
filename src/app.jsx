import { useState, StrictMode, Fragment } from "react";
import { Provider } from "./components/ui/provider";
import { ColorModeProvider } from "./components/ui/color-mode";
import {
  Repo,
  RepoContext,
  BroadcastChannelNetworkAdapter,
  IndexedDBStorageAdapter,
} from "@automerge/react";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router";
import { IconButton, Input, Flex } from "@chakra-ui/react";
import { HiChevronDoubleRight } from "react-icons/hi2";

import Page from "./page";
import { addListToState, getListsFromState, useLists } from "./state";
import { ListDetails } from "./list-details";

const repo = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
  storage: new IndexedDBStorageAdapter(),
});

window.repo = repo;

function Lists() {
  const [newListName, setNewListName] = useState("");
  const [lists, deleteList] = useLists();
  const createList = () => {
    if (!newListName.trim()) return;

    const handle = repo.create({
      name: newListName,
      items: [],
      inactiveItems: [],
      createdAt: Date.now(),
    });
    addListToState(handle.url);

    setNewListName("");
  };

  return (
    <Page>
      <Flex direction="column" w="100%">
        <Flex w="100%" mb={4} gap={4}>
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
        <Flex direction="column" w="100%" gap={4}>
          {lists.map((listId) => (
            <Fragment key={listId}>
              <ListDetails docUrl={listId} onDelete={deleteList} />
            </Fragment>
          ))}
        </Flex>
      </Flex>
    </Page>
  );
}

const List = () => {
  return <Page>List Page!</Page>;
};

export default function App() {
  return (
    <StrictMode>
      <Provider>
        <ColorModeProvider>
          <RepoContext.Provider value={repo}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Lists />} />
                <Route path="/list/:id" element={<List />} />
              </Routes>
            </BrowserRouter>
          </RepoContext.Provider>
        </ColorModeProvider>
      </Provider>
    </StrictMode>
  );
}
