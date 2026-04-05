import { Fragment, useState } from "react";
import { useDocument } from "@automerge/react";
import {
  Flex,
  Input,
  InputGroup,
  IconButton,
  Checkbox,
  Text,
  Button,
} from "@chakra-ui/react";
import { useParams } from "react-router";
import { HiChevronDoubleRight } from "react-icons/hi2";
import { LuX, LuTrash2, LuEyeOff, LuEye } from "react-icons/lu";

import Page from "./page";
import { useLists } from "./state";

function ListItem({ item, onCheck, onDelete, checked, index }) {
  const [deleting, setDeleting] = useState(false);

  const handleChecked = (e) => {
    onCheck(index);
  };

  function deleteItem() {
    onDelete(index);
  }

  return (
    <Flex
      p={2}
      bg={{ base: "gray.100", _dark: "gray.900" }}
      rounded="md"
      _hover={{ bg: { base: "gray.200", _dark: "gray.800" } }}
    >
      <Checkbox.Root
        onCheckedChange={handleChecked}
        checked={checked}
        variant="outline"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label />
      </Checkbox.Root>
      <Flex flexGrow={1} align="center" gap={2}>
        <Text fontSize="lg" opacity={checked ? 0.5 : 1}>
          {item.name}
        </Text>
      </Flex>
      {deleting ? (
        <>
          <IconButton
            aria-label="Delete item"
            variant="ghost"
            colorPalette="red"
            onClick={deleteItem}
          >
            <LuTrash2 />
          </IconButton>
          <IconButton
            aria-label="cancel deleting"
            variant="ghost"
            colorPalette="red"
            onClick={() => setDeleting(false)}
          >
            <LuX />
          </IconButton>
        </>
      ) : (
        <IconButton
          aria-label="Delete item"
          variant="ghost"
          colorPalette="red"
          onClick={() => setDeleting(true)}
        >
          <LuTrash2 />
        </IconButton>
      )}
    </Flex>
  );
}

export const List = () => {
  let { id } = useParams();
  const [lists, addList] = useLists();

  const [doc, changeDoc] = useDocument(id);
  const [newItemName, setNewItemName] = useState("");
  const [showHidden, setShowHidden] = useState(true);

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
        createdAt: item.createdAt,
        checkedAt: Date.now(),
      });
    });
  }

  function handleUncheck(index) {
    changeDoc((d) => {
      const [item] = d.inactiveItems.splice(index, 1);
      d.items.push({ name: item.name, createdAt: item.createdAt });
    });
  }

  function handleDelete(listName) {
    return (index) => {
      changeDoc((d) => {
        d[listName].splice(index, 1);
      });
    };
  }

  const { items, inactiveItems } = doc;

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
                  />
                </Fragment>
              ))}
          </Flex>
        </Flex>
      </Flex>
    </Page>
  );
};
