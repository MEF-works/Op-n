import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { v4 as uuidv4 } from 'uuid';

export interface VaultFile {
  id: string;
  name: string;
  uri: string;
  size: number;
  modified: number;
  tags: string[];
}

const VAULT_DIR = FileSystem.documentDirectory + 'vault/';
const TAGS_STORAGE_KEY = 'opn_file_tags';

/**
 * Ensure the vault directory exists. If not, create it.
 */
async function ensureVaultDir() {
  const dirInfo = await FileSystem.getInfoAsync(VAULT_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
  }
}

/**
 * Returns the stored tag mapping: fileId -> string[]
 */
async function loadTags(): Promise<Record<string, string[]>> {
  const json = await AsyncStorage.getItem(TAGS_STORAGE_KEY);
  return json ? JSON.parse(json) : {};
}

/**
 * Persist tags mapping
 */
async function saveTags(map: Record<string, string[]>) {
  await AsyncStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(map));
}

export async function listFiles(): Promise<VaultFile[]> {
  await ensureVaultDir();
  const fileNames = await FileSystem.readDirectoryAsync(VAULT_DIR);
  const tagsMap = await loadTags();
  const files: VaultFile[] = [];
  for (const fileName of fileNames) {
    const uri = VAULT_DIR + fileName;
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) continue;
    const [id, name] = fileName.split('__', 2);
    files.push({
      id,
      name: name || fileName,
      uri,
      size: info.size ?? 0,
      modified: info.modificationTime ?? Date.now(),
      tags: tagsMap[id] || [],
    });
  }
  // sort by modified desc
  files.sort((a, b) => b.modified - a.modified);
  return files;
}

export async function uploadFile(): Promise<VaultFile | null> {
  await ensureVaultDir();
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }
  const asset = result.assets[0];
  const id = uuidv4();
  const fileName = `${id}__${asset.name}`;
  const dest = VAULT_DIR + fileName;
  // copy file to vault
  await FileSystem.copyAsync({ from: asset.uri, to: dest });
  const fileInfo = await FileSystem.getInfoAsync(dest);
  return {
    id,
    name: asset.name ?? fileName,
    uri: dest,
    size: fileInfo.size ?? 0,
    modified: fileInfo.modificationTime ?? Date.now(),
    tags: [],
  };
}

export async function deleteFile(file: VaultFile): Promise<void> {
  try {
    await FileSystem.deleteAsync(file.uri, { idempotent: true });
    const tagsMap = await loadTags();
    delete tagsMap[file.id];
    await saveTags(tagsMap);
  } catch (err) {
    console.warn('Failed to delete file', err);
  }
}

export async function renameFile(file: VaultFile, newName: string): Promise<VaultFile> {
  const newFileName = `${file.id}__${newName}`;
  const newUri = VAULT_DIR + newFileName;
  await FileSystem.moveAsync({ from: file.uri, to: newUri });
  return { ...file, name: newName, uri: newUri };
}

export async function setTags(fileId: string, tags: string[]): Promise<void> {
  const tagsMap = await loadTags();
  tagsMap[fileId] = tags;
  await saveTags(tagsMap);
}

export async function getTags(fileId: string): Promise<string[]> {
  const tagsMap = await loadTags();
  return tagsMap[fileId] || [];
}