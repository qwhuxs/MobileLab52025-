import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";
import {
  APP_DIR,
  getDirectoryContent,
  getStorageStats,
} from "../utils/fileSystemUtils";

const FileManager = () => {
  const [currentPath, setCurrentPath] = useState(APP_DIR);
  const [items, setItems] = useState([]);
  const [storageInfo, setStorageInfo] = useState({});

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

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={styles.path}>Поточний шлях: {currentPath}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Button
            title={item}
            onPress={() => (item.endsWith("/") ? handleOpenFolder(item) : null)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  path: { fontSize: 12, marginVertical: 5 },
  storage: { marginTop: 10, fontSize: 12, color: "gray" },
});

export default FileManager;
