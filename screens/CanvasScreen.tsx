import React, { useEffect, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import { listFiles, VaultFile } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { github as codeTheme } from 'react-syntax-highlighter/styles/hljs';
import * as languages from 'react-syntax-highlighter/languages/prism';
import { Platform, Alert } from 'react-native';

// Register languages for syntax highlighter (JS, TS, JSON, HTML, CSS, MD)
const supportedLanguages: Record<string, any> = {
  js: require('react-syntax-highlighter/languages/prism/javascript').default,
  ts: require('react-syntax-highlighter/languages/prism/typescript').default,
  json: require('react-syntax-highlighter/languages/prism/json').default,
  html: require('react-syntax-highlighter/languages/prism/markup').default,
  css: require('react-syntax-highlighter/languages/prism/css').default,
  md: require('react-syntax-highlighter/languages/prism/markdown').default,
};

Object.entries(supportedLanguages).forEach(([name, def]) => {
  // @ts-ignore
  languages[name] = def;
});

const VAULT_DIR = FileSystem.documentDirectory + 'vault/';

export default function CanvasScreen() {
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentFile, setCurrentFile] = useState<VaultFile | null>(null);
  const [content, setContent] = useState('');
  const [newFileModal, setNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [language, setLanguage] = useState('js');

  useEffect(() => {
    (async () => {
      const files = await listFiles();
      setVaultFiles(files);
    })();
  }, []);

  const openFilePicker = async () => {
    const files = await listFiles();
    setVaultFiles(files);
    setOpenModal(true);
  };

  const openFile = async (file: VaultFile) => {
    setCurrentFile(file);
    const text = await FileSystem.readAsStringAsync(file.uri);
    setContent(text);
    // guess language from extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
        setLanguage('js');
        break;
      case 'ts':
        setLanguage('ts');
        break;
      case 'json':
        setLanguage('json');
        break;
      case 'html':
        setLanguage('html');
        break;
      case 'css':
        setLanguage('css');
        break;
      case 'md':
      case 'markdown':
        setLanguage('md');
        break;
      default:
        setLanguage('js');
        break;
    }
    setOpenModal(false);
  };

  const createFile = async () => {
    const name = newFileName.trim();
    if (!name) return;
    const id = uuidv4();
    const fileName = `${id}__${name}`;
    const uri = VAULT_DIR + fileName;
    await FileSystem.writeAsStringAsync(uri, '');
    const stats = await FileSystem.getInfoAsync(uri);
    const file: VaultFile = {
      id,
      name,
      uri,
      size: stats.size || 0,
      modified: stats.modificationTime || Date.now(),
      tags: [],
    };
    setVaultFiles((prev) => [file, ...prev]);
    setCurrentFile(file);
    setContent('');
    setNewFileName('');
    setNewFileModal(false);
  };

  const saveFile = async () => {
    if (!currentFile) return;
    await FileSystem.writeAsStringAsync(currentFile.uri, content);
    const stats = await FileSystem.getInfoAsync(currentFile.uri);
    setCurrentFile({ ...currentFile, size: stats.size || currentFile.size, modified: stats.modificationTime || Date.now() });
    Alert.alert('Saved', `${currentFile.name} saved successfully.`);
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Code Canvas" subtitle={currentFile ? currentFile.name : 'No file selected'} />
        <Appbar.Action icon="folder-open" onPress={openFilePicker} />
        <Appbar.Action icon="file-plus" onPress={() => setNewFileModal(true)} />
        <Appbar.Action icon="content-save" onPress={saveFile} disabled={!currentFile} />
      </Appbar.Header>
      {currentFile ? (
        <ScrollView style={{ flex: 1, padding: 12 }}>
          <TextInput
            mode="outlined"
            multiline
            value={content}
            onChangeText={setContent}
            style={{ minHeight: 300, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) }}
            placeholder="Start coding..."
          />
          {/* Render syntax-highlighted preview */}
          <Text style={{ marginTop: 12, marginBottom: 4, fontWeight: 'bold' }}>Preview:</Text>
          <SyntaxHighlighter
            language={language}
            style={codeTheme}
            highlighter="prism"
            customStyle={{ padding: 12, borderRadius: 6, backgroundColor: '#1e1e1e' }}
          >
            {content || '// code preview'}
          </SyntaxHighlighter>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text>No file selected. Tap the folder icon to open or create a file.</Text>
        </View>
      )}
      {/* File picker modal */}
      <Modal visible={openModal} animationType="slide">
        <Appbar.Header>
          <Appbar.BackAction onPress={() => setOpenModal(false)} />
          <Appbar.Content title="Select a file" />
        </Appbar.Header>
        <FlatList
          data={vaultFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={{ margin: 12 }} onPress={() => openFile(item)}>
              <Card.Title title={item.name} subtitle={`${(item.size / 1024).toFixed(1)} KB`} />
            </Card>
          )}
          ListEmptyComponent={<Text style={{ padding: 16 }}>No files found.</Text>}
        />
      </Modal>
      {/* New file modal */}
      <Modal visible={newFileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Title title="New File" />
            <Card.Content>
              <TextInput
                label="File name (with extension)"
                value={newFileName}
                onChangeText={setNewFileName}
              />
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setNewFileModal(false)}>Cancel</Button>
              <Button onPress={createFile}>Create</Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
  },
});