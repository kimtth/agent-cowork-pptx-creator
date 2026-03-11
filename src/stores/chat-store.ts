/**
 * Store: Chat messages
 */

import { create } from 'zustand';
import type { ChatMessage } from '../application/chat-use-case';

interface ChatStore {
  messages: ChatMessage[];
  pendingContent: string;
  pendingThinking: string;

  addMessage(msg: ChatMessage): void;
  removeMessage(id: string): void;
  appendContent(delta: string): void;
  appendThinking(delta: string): void;
  flushAssistantMessage(): void;
  clear(): void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  pendingContent: '',
  pendingThinking: '',

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((msg) => msg.id !== id) })),

  appendContent: (delta) =>
    set((s) => ({ pendingContent: s.pendingContent + delta })),

  appendThinking: (delta) =>
    set((s) => ({ pendingThinking: s.pendingThinking + delta })),

  flushAssistantMessage() {
    const { pendingContent, pendingThinking } = get();
    if (!pendingContent && !pendingThinking) return;
    const msg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'assistant',
      content: pendingContent,
      thinking: pendingThinking || undefined,
      timestamp: Date.now(),
    };
    set((s) => ({
      messages: [...s.messages, msg],
      pendingContent: '',
      pendingThinking: '',
    }));
  },

  clear: () => set({ messages: [], pendingContent: '', pendingThinking: '' }),
}));
