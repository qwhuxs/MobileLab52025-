import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import FileManager from './components/FileManager';
import { useInitializeAppData } from './utils/fileSystemUtils';

export default function App() {
  useInitializeAppData();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📁 Файловий Менеджер</Text>
      <FileManager />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});
