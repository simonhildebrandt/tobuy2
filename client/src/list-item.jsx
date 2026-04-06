import { useState, useRef, useEffect } from "react";
import { Flex, Text, IconButton, Checkbox, Input } from "@chakra-ui/react";
import { LuTrash2, LuX } from "react-icons/lu";

export default function ListItem({
  item,
  onCheck,
  onDelete,
  onUpdate,
  checked,
  index,
}) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newDetails, setNewDetails] = useState(item.details || "");
  const inputRef = useRef();

  useEffect(() => {
    setNewDetails(item.details || "");
  }, [item.details]);

  const handleChecked = (e) => {
    onCheck(index);
  };

  function deleteItem() {
    onDelete(index);
  }

  function updateItem(e) {
    setNewDetails(e.target.value);
    onUpdate(index, e.target.value);
  }

  function handleEdit() {
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  return (
    <Flex
      p={2}
      bg={{ base: "gray.100", _dark: "gray.900" }}
      rounded="md"
      _hover={{ bg: { base: "gray.200", _dark: "gray.800" } }}
      gap={4}
    >
      <Checkbox.Root checked={checked} variant="outline">
        <Checkbox.HiddenInput />
        <Checkbox.Control onClick={handleChecked}>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label />
      </Checkbox.Root>
      <Flex align="center" gap={2}>
        <Text fontSize="lg" opacity={checked ? 0.5 : 1}>
          {item.name}
        </Text>
      </Flex>
      <Flex flexGrow={1} justify="flex-end" align="center">
        <Input
          value={newDetails}
          onChange={updateItem}
          size="sm"
          variant="outline"
          onBlur={() => setEditing(false)}
          display={editing ? "block" : "none"}
          ref={inputRef}
        />
        <Flex
          color="gray.500"
          onClick={handleEdit}
          display={editing ? "none" : "flex"}
          flexGrow={1}
          justify="flex-end"
        >
          {newDetails}&nbsp;
        </Flex>
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
