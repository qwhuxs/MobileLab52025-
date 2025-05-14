import * as FileSystem from "expo-file-system";

export const APP_DIR = FileSystem.documentDirectory + "AppData/";

export const getDirectoryContent = async (path) => {
  return await FileSystem.readDirectoryAsync(path);
};

export const createFolder = async (path, name) => {
  await FileSystem.makeDirectoryAsync(`${path}${name}/`);
};

export const createFile = async (path, name, content) => {
  await FileSystem.writeAsStringAsync(`${path}${name}.txt`, content);
};

export const readFile = async (path, fileName) => {
  return await FileSystem.readAsStringAsync(`${path}${fileName}`);
};

export const writeFile = async (path, fileName, content) => {
  await FileSystem.writeAsStringAsync(`${path}${fileName}`, content);
};

export const deleteItem = async (path, name) => {
  await FileSystem.deleteAsync(`${path}${name}`, { idempotent: true });
};
