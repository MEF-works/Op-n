import OpenAI from 'openai';
import { useSettings } from '../contexts/SettingsContext';
import { useMemo } from 'react';

// System prompt that defines Levy's personality and behaviour
const SYSTEM_PROMPT =
  'You are Levy, a sharp, resourceful, ultra-intelligent mobile assistant. You respond with clarity, wit, and elite-level insight. Your job is to help the user plan, code, organize files, and take action on their digital life. Be fast. Be sharp. Be useful. If asked about a file, scan it and reply with specific help. If you don\'t know something, say so — but always try to assist.';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export const useOpenAI = () => {
  const { openaiKey } = useSettings();

  const openai = useMemo(() => {
    if (!openaiKey) return null;
    // React Native/Expo requires enabling browser-like usage
    return new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
  }, [openaiKey]);

  /**
   * Sends a chat completion request to OpenAI using the messages provided.  The system prompt
   * will automatically be inserted at the beginning of the conversation.
   * @param messages The conversation history, excluding the system prompt.
   */
  const sendChat = async (messages: ChatMessage[]) => {
    if (!openai) {
      throw new Error('OpenAI key is not set. Please set your OpenAI API key in Settings.');
    }
    // Prepend system message
    const conversation: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: conversation,
        max_tokens: 800,
        temperature: 0.6,
      });
      const reply = completion.choices?.[0]?.message?.content;
      if (!reply) {
        throw new Error('No reply from OpenAI API');
      }
      return reply.trim();
    } catch (err: any) {
      console.error('OpenAI API error', err);
      throw err;
    }
  };

  return { sendChat };
};