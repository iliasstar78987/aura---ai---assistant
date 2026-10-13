export type Language = 'bn' | 'en';

export type MoodType = 'friendly' | 'analytical' | 'humorous' | 'empathetic' | 'creative' | 'intimate';

export interface LinkMetadata {
  url: string;
  title: string;
  description: string;
  image?: string;
  domain: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  aspectRatio: string;
  style?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mood?: MoodType;
  images?: GeneratedImage[];
  links?: LinkMetadata[];
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  mood: MoodType;
  model: string;
}

export interface MemoryFact {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'personal' | 'work' | 'interest' | 'general';
  timestamp: number;
}

export interface AppSettings {
  language: Language;
  theme: 'dark' | 'light' | 'oled';
  accentColor: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  openRouterApiKey: string;
  selectedModel: string;
  customModelName?: string;
  temperature: number;
  systemPromptPreset: string;
  isEncrypted: boolean;
  encryptionKeySalt?: string;
  autoSpeechOutput: boolean;
  userFacts: MemoryFact[];
  userName?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
  description: string;
  contextLength: string;
}
