import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Text,
  TextInput,
} from 'react-native-paper';
import { useSettings } from '../contexts/SettingsContext';
import { listFiles } from '../services/storage';
import { formatBytes } from '../utils';

export default function SettingsScreen() {
  const {
    openaiKey,
    setOpenaiKey,
    githubToken,
    setGithubToken,
    notionToken,
    setNotionToken,
    notionDatabaseId,
    setNotionDatabaseId,
    googleToken,
    setGoogleToken,
    clearAll,
  } = useSettings();
  const [vaultUsage, setVaultUsage] = useState<number>(0);

  // local state for forms
  const [openaiInput, setOpenaiInput] = useState(openaiKey || '');
  const [githubInput, setGithubInput] = useState(githubToken || '');
  const [notionTokenInput, setNotionTokenInput] = useState(notionToken || '');
  const [notionDbInput, setNotionDbInput] = useState(notionDatabaseId || '');
  const [googleInput, setGoogleInput] = useState(googleToken || '');

  useEffect(() => {
    // calculate storage usage
    (async () => {
      const files = await listFiles();
      const total = files.reduce((sum, f) => sum + f.size, 0);
      setVaultUsage(total);
    })();
  }, []);

  const saveOpenAI = async () => {
    await setOpenaiKey(openaiInput.trim());
  };
  const saveGithub = async () => {
    await setGithubToken(githubInput.trim());
  };
  const saveNotion = async () => {
    await setNotionToken(notionTokenInput.trim());
    await setNotionDatabaseId(notionDbInput.trim());
  };
  const saveGoogle = async () => {
    await setGoogleToken(googleInput.trim());
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={styles.card}>
          <Card.Title title="OpenAI" />
          <Card.Content>
            <Text>API Key</Text>
            <TextInput
              mode="outlined"
              placeholder="sk-..."
              value={openaiInput}
              onChangeText={setOpenaiInput}
              secureTextEntry
            />
          </Card.Content>
          <Card.Actions>
            <Button onPress={saveOpenAI}>Save</Button>
          </Card.Actions>
        </Card>
        <Card style={styles.card}>
          <Card.Title title="GitHub" />
          <Card.Content>
            <Text>Personal Access Token</Text>
            <TextInput
              mode="outlined"
              placeholder="ghp_..."
              value={githubInput}
              onChangeText={setGithubInput}
              secureTextEntry
            />
          </Card.Content>
          <Card.Actions>
            <Button onPress={saveGithub}>Save</Button>
          </Card.Actions>
        </Card>
        <Card style={styles.card}>
          <Card.Title title="Notion" />
          <Card.Content>
            <Text>Integration Token</Text>
            <TextInput
              mode="outlined"
              placeholder="secret_..."
              value={notionTokenInput}
              onChangeText={setNotionTokenInput}
              secureTextEntry
            />
            <Text style={{ marginTop: 8 }}>Database ID</Text>
            <TextInput
              mode="outlined"
              placeholder="XXXXXXXXXXXXXXX"
              value={notionDbInput}
              onChangeText={setNotionDbInput}
            />
          </Card.Content>
          <Card.Actions>
            <Button onPress={saveNotion}>Save</Button>
          </Card.Actions>
        </Card>
        <Card style={styles.card}>
          <Card.Title title="Google Drive" />
          <Card.Content>
            <Text>Access Token</Text>
            <TextInput
              mode="outlined"
              placeholder="ya29..."
              value={googleInput}
              onChangeText={setGoogleInput}
              secureTextEntry
            />
          </Card.Content>
          <Card.Actions>
            <Button onPress={saveGoogle}>Save</Button>
          </Card.Actions>
        </Card>
        <Card style={styles.card}>
          <Card.Title title="Storage Usage" />
          <Card.Content>
            <Text>The Vault is currently using {formatBytes(vaultUsage)} of space.</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Title title="Danger Zone" />
          <Card.Content>
            <Text>Clear all saved API keys and tokens from the device.</Text>
          </Card.Content>
          <Card.Actions>
            <Button color="red" onPress={clearAll}>
              Clear All
            </Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
});