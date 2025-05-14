import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import {
  APP_DIR,
  getDirectoryContent,
  getStorageStats,
  createFolder,
  createFile,
  readFile,
  writeFile,
} from "../utils/fileSystemUtils";

const FileManager = () => {
  const [currentPath, setCurrentPath] = useState(APP_DIR);
  const [items, setItems] = useState([]);
  const [storageInfo, setStorageInfo] = useState({});
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const refreshDirectory = async () => {
    const content = await getDirectoryContent(currentPath);
    setItems(content);
    const stats = await getStorageStats();
    setStorageInfo(stats);
  };

  useEffect(() => {
    refreshDirectory();
  }, [currentPath]);

  const handleOpenFolder = (folder) => {
    setCurrentPath(`${currentPath}${folder}/`);
  };

  const handleGoUp = () => {
    if (currentPath !== APP_DIR) {
      const parts = currentPath.split("/").filter(Boolean);
      parts.pop();
      setCurrentPath(FileSystem.documentDirectory + parts.join("/") + "/");
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName) {
      await createFolder(currentPath, newFolderName);
      setNewFolderName("");
      refreshDirectory();
    }
  };

  const handleCreateFile = async () => {
    if (newFileName && fileContent) {
      await createFile(currentPath, newFileName, fileContent);
      setNewFileName("");
      setFileContent("");
      refreshDirectory();
    }
  };

  const handleOpenFile = async (file) => {
    const content = await readFile(currentPath, file);
    setSelectedFile(file);
    setFileContent(content);
  };

  const handleSaveFile = async () => {
    if (selectedFile) {
      await writeFile(currentPath, selectedFile, fileContent);
      Alert.alert("Файл збережено");
      setSelectedFile(null);
      setFileContent("");
      refreshDirectory();
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={styles.path}>Поточний шлях: {currentPath}</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Button
            title={item}
            onPress={() =>
              item.endsWith("/") ? handleOpenFolder(item) : handleOpenFile(item)
            }
          />
        )}
      />

      <Button title="⬆️ Вгору" onPress={handleGoUp} />

      <Text style={styles.storage}>
        📊 Памʼять:{" "}
        {storageInfo.totalSpace
          ? `${(storageInfo.usedSpace / 1024 / 1024).toFixed(2)}MB / ${(
              storageInfo.totalSpace /
              1024 /
              1024
            ).toFixed(2)}MB`
          : "..."}
      </Text>

      <View style={styles.section}>
        <TextInput
          placeholder="Назва папки"
          value={newFolderName}
          onChangeText={setNewFolderName}
          style={styles.input}
        />
        <Button title="Створити папку" onPress={handleCreateFolder} />
      </View>

      <View style={styles.section}>
        <TextInput
          placeholder="Назва файлу"
          value={newFileName}
          onChangeText={setNewFileName}
          style={styles.input}
        />
        <TextInput
          placeholder="Вміст файлу"
          value={fileContent}
          onChangeText={setFileContent}
          style={styles.input}
          multiline
        />
        <Button
          title={selectedFile ? "Зберегти файл" : "Створити файл"}
          onPress={selectedFile ? handleSaveFile : handleCreateFile}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  path: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  storage: {
    marginTop: 10,
    marginBottom: 10,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
  section: {
    marginTop: 15,
  },
});

export default FileManager;
