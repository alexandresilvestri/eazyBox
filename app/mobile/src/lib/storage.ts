import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const writeItem = async (key: string, value: string) => {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

export const readItem = (key: string) =>
  isWeb
    ? Promise.resolve(localStorage.getItem(key))
    : SecureStore.getItemAsync(key);

export const deleteItem = async (key: string) => {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};
