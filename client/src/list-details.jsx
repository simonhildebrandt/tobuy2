import { useEffect, useState, useRef } from "react";
import { useDocument } from "@automerge/react";
import { Flex, IconButton, Text, Input } from "@chakra-ui/react";
import { LuPencilLine, LuX, LuTrash2, LuCheck, LuShare2 } from "react-icons/lu";
import { useNavigate } from "react-router";

export const ListDetails = ({ docUrl, onDelete }) => {
  const [doc, changeDoc] = useDocument(docUrl);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef();
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (doc) {
      setName(doc.name);
    }
  }, [doc]);

  if (!doc) return <div>Loading...</div>;

  function changeName() {
    changeDoc((d) => {
      d.name = name;
    });
    setEditing(false);
  }

  function startEditing(e) {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => inputRef.current.focus(), 0);
  }

  function deleteList() {
    onDelete(docUrl);
  }

  function copyLink(e) {
    e.stopPropagation();
    const type = "text/plain";
    const clipboardItemData = {
      [type]: window.location.origin + "/list/" + docUrl,
    };
    const clipboardItem = new ClipboardItem(clipboardItemData);
    navigator.clipboard.write([clipboardItem]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Flex
      w="100%"
      p={4}
      bg={{ base: "gray.100", _dark: "gray.900" }}
      rounded="md"
      _hover={{ bg: { base: "gray.200", _dark: "gray.800" } }}
      justify="space-between"
      onClick={() => !editing && navigate(`/list/${docUrl}`)}
      cursor="pointer"
    >
      <Flex
        direction="column"
        height="4rem"
        justify="space-between"
        flexGrow={1}
        mr={6}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          display={editing ? "block" : "none"}
          ref={inputRef}
          w="100%"
        />
        <Text
          fontSize="lg"
          fontWeight="bold"
          display={!editing ? "block" : "none"}
        >
          {doc.name}
        </Text>
        <Text fontSize="xs">
          Created at: {new Date(doc.createdAt).toLocaleString()}
        </Text>
      </Flex>

      <Flex align="center">
        {editing ? (
          <Flex gap={2}>
            {deleting ? (
              <>
                <IconButton
                  aria-label="Delete list"
                  variant="ghost"
                  colorPalette="red"
                  onClick={deleteList}
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
              <>
                <IconButton
                  aria-label="Save list name"
                  variant="ghost"
                  colorPalette="green"
                  onClick={changeName}
                >
                  <LuCheck />
                </IconButton>
                <IconButton
                  aria-label="Delete list"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => setDeleting(true)}
                >
                  <LuTrash2 />
                </IconButton>
              </>
            )}

            <IconButton
              aria-label="cancel editing"
              variant="ghost"
              onClick={() => {
                changeName({ value: name });
                setEditing(false);
              }}
            >
              <LuX />
            </IconButton>
          </Flex>
        ) : (
          <>
            <IconButton
              aria-label="Share list"
              variant="ghost"
              colorPalette="blue"
              onClick={copyLink}
            >
              {copied ? <LuCheck /> : <LuShare2 />}
            </IconButton>

            <IconButton
              aria-label="Edit list name"
              variant="ghost"
              onClick={startEditing}
            >
              <LuPencilLine />
            </IconButton>
          </>
        )}
      </Flex>
    </Flex>
  );
};
