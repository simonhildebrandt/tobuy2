import { useEffect, useState } from "react";

const storageKey = "lists";

export const addListToState = (listId) => {
  saveList([...getListsFromState(), listId]);
};

export const getListsFromState = () => {
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
};

export const deleteListFromState = (listId) => {
  const lists = getListsFromState().filter((id) => id !== listId);
  saveList(lists);
};

export const saveList = (lists) => {
  localStorage.setItem(storageKey, JSON.stringify(lists));
};

export const useLists = () => {
  const [lists, setLists] = useState(getListsFromState());
  console.log("useLists", lists);

  const deleteList = (listId) => {
    deleteListFromState(listId);
    setLists(getListsFromState());
  };

  const addList = (listId) => {
    addListToState(listId);
    setLists(getListsFromState());
  };

  return [lists, addList, deleteList];
};
