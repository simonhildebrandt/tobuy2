import { Fragment, useState } from "react";
import { useDocument } from "@automerge/react";
import {
  Flex,
  Input,
  InputGroup,
  IconButton,
  Text,
  Button,
  Tag,
} from "@chakra-ui/react";
import { useParams } from "react-router";
import { HiChevronDoubleRight } from "react-icons/hi2";
import { LuX, LuEyeOff, LuEye, LuCheck } from "react-icons/lu";

import Page from "./page";
import { useLists } from "./state";
import ListItem from "./list-item";

export const List = () => {
  let { id } = useParams();
  const [lists, addList] = useLists();

  const [doc, changeDoc] = useDocument(id);
  const [newItemName, setNewItemName] = useState("");
  const [showHidden, setShowHidden] = useState(false);

  if (!doc) return <div>Loading...</div>;

  function addItem() {
    if (!newItemName.trim()) return;

    changeDoc((d) => {
      d.items.push({ name: newItemName, createdAt: Date.now() });
    });

    setNewItemName("");
  }

  function handleCheck(index) {
    changeDoc((d) => {
      const [item] = d.items.splice(index, 1);
      d.inactiveItems.push({
        name: item.name,
        details: item.details,
        createdAt: item.createdAt,
        checkedAt: Date.now(),
      });
    });
  }

  function handleUncheck(index) {
    changeDoc((d) => {
      const [item] = d.inactiveItems.splice(index, 1);
      d.items.push({
        name: item.name,
        details: item.details,
        createdAt: item.createdAt,
      });
    });
  }

  function handleDelete(listName) {
    return (index) => {
      changeDoc((d) => {
        d[listName].splice(index, 1);
      });
    };
  }

  function handleUpdate(listName) {
    return (index, newDetails) => {
      changeDoc((d) => {
        d[listName][index].details = newDetails;
      });
    };
  }

  const { items, inactiveItems } = doc;

  let suggestions = [];
  if (newItemName.trim()) {
    const lowerCaseInput = newItemName.toLowerCase();
    const lowerCaseItems = items.map((item) => item.name.toLowerCase());
    const lowerCaseInactiveItems = inactiveItems.map((item) =>
      item.name.toLowerCase(),
    );
    const allItems = [...lowerCaseInactiveItems, ...lowerCaseItems];
    const matchingItems = allItems.filter((item) => {
      return item.includes(lowerCaseInput);
    });
    suggestions = matchingItems.slice(0, 5).map((item) => ({
      name: item,
      active: lowerCaseItems.includes(item),
      index: lowerCaseInactiveItems.indexOf(item),
    }));
  }

  return (
    <Page>
      <Flex direction="column" w="100%" h="100%" gap={4}>
        {!lists.includes(id) && (
          <Flex
            mt={4}
            w="100%"
            p={4}
            bg="red.100"
            color="red.800"
            rounded="md"
            justify="space-between"
            align="center"
          >
            <Text>This list is not in your lists.</Text>
            <Button ml={4} onClick={() => addList(id)} colorPalette="red">
              Add to my lists
            </Button>
          </Flex>
        )}
        <Flex gap={4} align="center" px={4} pt={2}>
          <InputGroup
            endElement={
              <IconButton
                size="xs"
                onClick={() => setNewItemName("")}
                aria-label="Clear input"
                variant="subtle"
                disabled={!newItemName.trim()}
              >
                <LuX />
              </IconButton>
            }
          >
            <Input
              size="xl"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </InputGroup>
          <IconButton
            onClick={addItem}
            aria-label="Add item"
            variant="subtle"
            colorPalette="teal"
            disabled={!newItemName.trim()}
          >
            <HiChevronDoubleRight />
          </IconButton>
          <IconButton
            onClick={() => setShowHidden(!showHidden)}
            aria-label="Show hide hidden items"
            variant="subtle"
            colorPalette="yellow"
          >
            {showHidden ? <LuEye /> : <LuEyeOff />}
          </IconButton>
        </Flex>
        {suggestions.length > 0 && (
          <Flex
            gap={2}
            align="center"
            px={4}
            w="100%"
            overflowX="scroll"
            scrollbar="hidden"
          >
            {suggestions.map((suggestion, index) =>
              suggestion.active ? (
                <Button
                  key={index}
                  size="xl"
                  colorPalette="gray"
                  disabled="true"
                >
                  {suggestion.name}
                </Button>
              ) : (
                <Button
                  key={index}
                  size="xl"
                  colorPalette="green"
                  onClick={() => handleUncheck(suggestion.index)}
                >
                  {suggestion.name}
                </Button>
              ),
            )}
          </Flex>
        )}
        <Flex direction="column" w="100%" overflowY="auto" flex="1 1 auto">
          <Flex
            direction="column"
            gap={4}
            flexShrink={1}
            flexGrow={0}
            height="0"
            px={4}
          >
            {items.map((item, index) => (
              <Fragment key={index}>
                <ListItem
                  item={item}
                  index={index}
                  checked={false}
                  onCheck={handleCheck}
                  onDelete={handleDelete("items")}
                  onUpdate={handleUpdate("items")}
                />
              </Fragment>
            ))}
            {showHidden &&
              inactiveItems.map((item, index) => (
                <Fragment key={index}>
                  <ListItem
                    item={item}
                    index={index}
                    checked={true}
                    onCheck={handleUncheck}
                    onDelete={handleDelete("inactiveItems")}
                    onUpdate={handleUpdate("inactiveItems")}
                  />
                </Fragment>
              ))}
          </Flex>
        </Flex>
      </Flex>
    </Page>
  );
};
