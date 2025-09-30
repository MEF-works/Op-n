import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { TextInput, Button, ActivityIndicator, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { useOpenAI } from '../services/openai';
import { useSettings } from '../contexts/SettingsContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

const HISTORY_KEY = 'opn_chat_history';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const { sendChat } = useOpenAI();
  const { openaiKey } = useSettings();

  useEffect(() => {
    // load conversation on mount
    (async () => {
      const json = await AsyncStorage.getItem(HISTORY_KEY);
      if (json) {
        try {
          const stored: ChatMessage[] = JSON.parse(json);
          setMessages(stored);
        } catch {
          // ignore
        }
      }
    })();
  }, []);

  // Save conversation whenever messages change
  useEffect(() => {
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(messages)).catch(() => {});
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (!openaiKey) {
      const reply: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Please set your OpenAI API key in Settings before chatting.',
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
      return;
    }
    setLoading(true);
    try {
      // Build conversation for OpenAI
      const promptMessages = [...messages, userMessage].map((m) => ({ role: m.role, content: m.content }));
      const replyContent = await sendChat(promptMessages);
      const reply: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: replyContent,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: err?.message || 'An error occurred while contacting OpenAI API.',
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      // scroll to bottom
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating size="small" />
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          placeholder="Type a message…"
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <Button mode="contained" onPress={sendMessage} style={styles.sendButton}>
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 70,
  },
  messageContainer: {
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: '#0A84FF',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#3A3F47',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: 'white',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#101728',
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#181f2e',
  },
  sendButton: {
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
});