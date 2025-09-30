import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import { useSettings } from '../contexts/SettingsContext';
import { listRepos } from '../services/github';
import { listDatabasePages } from '../services/notion';
import { listDriveFiles } from '../services/googleDrive';

export default function ConnectorsScreen() {
  const {
    githubToken,
    notionToken,
    notionDatabaseId,
    googleToken,
  } = useSettings();

  const testGitHub = async () => {
    if (!githubToken) {
      Alert.alert('Not configured', 'Please add your GitHub token in Settings.');
      return;
    }
    try {
      const repos = await listRepos(githubToken);
      const names = repos.map((r: any) => r.full_name).join('\n');
      Alert.alert('GitHub Repositories', names || 'No repositories found');
    } catch (err: any) {
      Alert.alert('GitHub Error', err?.message || 'Failed to fetch repos');
    }
  };

  const testNotion = async () => {
    if (!notionToken || !notionDatabaseId) {
      Alert.alert('Not configured', 'Please add your Notion token and database ID in Settings.');
      return;
    }
    try {
      const pages = await listDatabasePages(notionToken, notionDatabaseId);
      const titles = pages
        .map((p: any) => {
          const titleProp = p.properties?.Name || p.properties?.title;
          const text = titleProp?.title?.[0]?.plain_text || 'Untitled';
          return text;
        })
        .join('\n');
      Alert.alert('Notion Pages', titles || 'No pages found');
    } catch (err: any) {
      Alert.alert('Notion Error', err?.message || 'Failed to fetch pages');
    }
  };

  const testDrive = async () => {
    if (!googleToken) {
      Alert.alert('Not configured', 'Please connect Google Drive in Settings.');
      return;
    }
    try {
      const files = await listDriveFiles(googleToken);
      const names = files.map((f: any) => f.name).join('\n');
      Alert.alert('Drive Files', names || 'No files found');
    } catch (err: any) {
      Alert.alert('Drive Error', err?.message || 'Failed to fetch drive files');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Connectors" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={styles.card}>
          <Card.Title title="GitHub" subtitle={githubToken ? 'Connected' : 'Not connected'} />
          <Card.Content>
            <Text>
              Integrate with GitHub to browse repositories and push code changes directly from the
              canvas.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={testGitHub}>Test</Button>
          </Card.Actions>
        </Card>
        <Card style={styles.card}>
          <Card.Title title="Notion" subtitle={notionToken && notionDatabaseId ? 'Connected' : 'Not connected'} />
          <Card.Content>
            <Text>
              Connect to Notion to fetch and append pages to your databases.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={testNotion}>Test</Button>
          </Card.Actions>
        </Card>
        <Card style={styles.card}>
          <Card.Title title="Google Drive" subtitle={googleToken ? 'Connected' : 'Not connected'} />
          <Card.Content>
            <Text>
              Pull and push files from Google Drive once connected via OAuth 2.0.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={testDrive}>Test</Button>
          </Card.Actions>
        </Card>
        {/* Placeholder for custom API connectors */}
        <Card style={styles.card}>
          <Card.Title title="Custom API" subtitle="Configure endpoints" />
          <Card.Content>
            <Text>
              Add your own REST endpoints here to extend Op’n’s capabilities.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button disabled>Coming Soon</Button>
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