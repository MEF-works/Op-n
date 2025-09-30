import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Chip, IconButton, Text, TextInput } from 'react-native-paper';
import { listFiles, uploadFile, deleteFile, renameFile, setTags, VaultFile } from '../services/storage';
import { useOpenAI } from '../services/openai';
import { useSettings } from '../contexts/SettingsContext';
import * as FileSystem from 'expo-file-system';

export default function VaultScreen() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTags, setNewTags] = useState('');
  const { sendChat } = useOpenAI();
  const { openaiKey } = useSettings();

  const refresh = async () => {
    setLoading(true);
    const items = await listFiles();
    setFiles(items);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleUpload = async () => {
    const file = await uploadFile();
    if (file) {
      setFiles((prev) => [file, ...prev]);
    }
  };

  const openRename = (file: VaultFile) => {
    setSelectedFile(file);
    setNewName(file.name);
    setRenameModalVisible(true);
  };

  const openTag = (file: VaultFile) => {
    setSelectedFile(file);
    setNewTags(file.tags.join(', '));
    setTagModalVisible(true);
  };

  const applyRename = async () => {
    if (!selectedFile) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Invalid name', 'Name cannot be empty');
      return;
    }
    const updated = await renameFile(selectedFile, trimmed);
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setRenameModalVisible(false);
    setSelectedFile(null);
  };

  const applyTags = async () => {
    if (!selectedFile) return;
    const tags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);
    await setTags(selectedFile.id, tags);
    setFiles((prev) =>
      prev.map((f) => (f.id === selectedFile.id ? { ...f, tags } : f)),
    );
    setTagModalVisible(false);
    setSelectedFile(null);
  };

  const handleDelete = (file: VaultFile) => {
    Alert.alert('Delete file', `Are you sure you want to delete ${file.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFile(file);
          setFiles((prev) => prev.filter((f) => f.id !== file.id));
        },
      },
    ]);
  };

  const handleAsk = async (file: VaultFile) => {
    if (!openaiKey) {
      Alert.alert('OpenAI API key missing', 'Please set your OpenAI API key in Settings.');
      return;
    }
    try {
      const info = await FileSystem.getInfoAsync(file.uri);
      if (info.size && info.size > 500_000) {
        Alert.alert('File too large', 'Files larger than 500KB are not supported for analysis.');
        return;
      }
      const content = await FileSystem.readAsStringAsync(file.uri);
      const prompt = `Here is the content of a file named ${file.name}. Please provide a summary or relevant insights:\n\n${content}`;
      const reply = await sendChat([{ role: 'user', content: prompt }]);
      Alert.alert('Levy on ' + file.name, reply);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'An error occurred while reading the file.');
    }
  };

  const filteredFiles = files.filter((f) => {
    const lower = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(lower) ||
      f.tags.some((t) => t.toLowerCase().includes(lower))
    );
  });

  const renderFile = ({ item }: { item: VaultFile }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.name}
        subtitle={`${(item.size / 1024).toFixed(1)} KB • ${new Date(item.modified).toLocaleDateString()}`}
        right={(props) => (
          <View style={{ flexDirection: 'row' }}>
            <IconButton {...props} icon="pencil" onPress={() => openRename(item)} />
            <IconButton {...props} icon="label" onPress={() => openTag(item)} />
            <IconButton {...props} icon="comment-question-outline" onPress={() => handleAsk(item)} />
            <IconButton {...props} icon="delete" onPress={() => handleDelete(item)} />
          </View>
        )}
      />
      {item.tags.length > 0 && (
        <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {item.tags.map((tag) => (
            <Chip key={tag} style={{ marginRight: 4, marginBottom: 4 }}>
              {tag}
            </Chip>
          ))}
        </Card.Content>
      )}
    </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Vault" />
        <Appbar.Action icon="refresh" onPress={refresh} />
        <Appbar.Action icon="upload" onPress={handleUpload} />
      </Appbar.Header>
      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Search files…"
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1 }}
        />
      </View>
      <FlatList
        data={filteredFiles}
        keyExtractor={(item) => item.id}
        renderItem={renderFile}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        onRefresh={refresh}
      />
      {/* Rename Modal */}
      <Modal visible={renameModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Title title="Rename File" />
            <Card.Content>
              <TextInput
                label="New Name"
                value={newName}
                onChangeText={setNewName}
              />
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setRenameModalVisible(false)}>Cancel</Button>
              <Button onPress={applyRename}>Save</Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
      {/* Tag Modal */}
      <Modal visible={tagModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Title title="Edit Tags" />
            <Card.Content>
              <TextInput
                label="Tags (comma-separated)"
                value={newTags}
                onChangeText={setNewTags}
              />
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setTagModalVisible(false)}>Cancel</Button>
              <Button onPress={applyTags}>Save</Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
  },
});