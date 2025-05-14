import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
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
  deleteItem,
  getFileInfo,
  renameItem,
} from "../utils/fileSystemUtils";

const FileManager = () => {
  const [currentPath, setCurrentPath] = useState(APP_DIR);
  const [items, setItems] = useState([]);
  const [storageInfo, setStorageInfo] = useState({});
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [newItemName, setNewItemName] = useState("");

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

  const handleDelete = async (item) => {
    Alert.alert("Підтвердження", `Видалити "${item}"?`, [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Видалити",
        style: "destructive",
        onPress: async () => {
          await deleteItem(currentPath, item);
          refreshDirectory();
        },
      },
    ]);
  };

  const handleFileInfo = async (item) => {
    const info = await getFileInfo(currentPath, item);
    Alert.alert("Інформація про файл", JSON.stringify(info, null, 2));
  };

  const handleRenameItem = (item) => {
    setItemToRename(item);
    setNewItemName(item.replace("/", ""));
    setRenameModalVisible(true);
  };

  const confirmRename = async () => {
    if (newItemName && itemToRename) {
      await renameItem(currentPath, itemToRename, newItemName);
      setRenameModalVisible(false);
      setItemToRename(null);
      setNewItemName("");
      refreshDirectory();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <TouchableOpacity
        style={styles.itemButton}
        onPress={() =>
          item.endsWith("/") ? handleOpenFolder(item) : handleOpenFile(item)
        }
      >
        <Text>{item}</Text>
      </TouchableOpacity>
      <View style={styles.itemActions}>
        <Button title="✏️" onPress={() => handleRenameItem(item)} />
        <Button title="ℹ️" onPress={() => handleFileInfo(item)} />
        <Button title="🗑" onPress={() => handleDelete(item)} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={styles.path}>Поточний шлях: {currentPath}</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item}
        renderItem={renderItem}
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

      <Modal visible={renameModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Нова назва для "{itemToRename}"</Text>
            <TextInput
              value={newItemName}
              onChangeText={setNewItemName}
              style={styles.input}
            />
            <Button title="Перейменувати" onPress={confirmRename} />
            <Button
              title="Скасувати"
              onPress={() => setRenameModalVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>
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
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  itemButton: {
    flex: 1,
  },
  itemActions: {
    flexDirection: "row",
    gap: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
});

export default FileManager;
