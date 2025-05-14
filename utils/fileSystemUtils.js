import * as FileSystem from "expo-file-system";
import { useEffect } from "react";

export const useInitializeAppData = () => {
  useEffect(() => {
    const initAppData = async () => {
      const dirInfo = await FileSystem.getInfoAsync(APP_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(APP_DIR, { intermediates: true });
        console.log("AppData directory created");
      }
    };
    initAppData();
  }, []);
};

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

export const getFileInfo = async (path, name) => {
  return await FileSystem.getInfoAsync(`${path}${name}`);
};

export const getStorageStats = async () => {
  const freeSpace = await FileSystem.getFreeDiskStorageAsync();
  const totalSpace = await FileSystem.getTotalDiskCapacityAsync();
  return { totalSpace, freeSpace, usedSpace: totalSpace - freeSpace };
};

export const renameItem = async (path, oldName, newName) => {
  const oldPath = path + oldName;
  const newPath = path + newName + (oldName.endsWith("/") ? "/" : "");
  await FileSystem.moveAsync({ from: oldPath, to: newPath });
};
