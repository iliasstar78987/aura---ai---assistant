import { AppSettings, ChatSession, MemoryFact } from '../types';
import { decryptData, encryptData } from '../utils/crypto';

const SETTINGS_KEY = 'aura_ai_settings_v1';
const SESSIONS_KEY = 'aura_ai_sessions_v1';
const ACTIVE_SESSION_KEY = 'aura_ai_active_session_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'bn',
  theme: 'dark',
  accentColor: 'cyan',
  openRouterApiKey: '',
  selectedModel: 'meta-llama/llama-3.3-70b-instruct:free',
  temperature: 0.7,
  systemPromptPreset: 'unrestricted',
  isEncrypted: false,
  autoSpeechOutput: false,
  userFacts: [
    {
      id: 'fact_1',
      key: 'ব্যক্তিত্ব / Personality',
      value: 'কৌতূহলী, স্বপ্নদর্শী এবং প্রযুক্তি অনুরাগী',
      category: 'personal',
      timestamp: Date.now(),
    },
  ],
  userName: '',
};

export async function loadSettings(passphrase: string = ''): Promise<AppSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    let decrypted = raw;
    if (raw.startsWith('enc:') || raw.startsWith('plain:')) {
      try {
        decrypted = await decryptData(raw, passphrase);
      } catch (e) {
        console.warn('Failed to decrypt settings with provided passphrase', e);
        return DEFAULT_SETTINGS;
      }
    }

    const parsed = JSON.parse(decrypted);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Error loading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings, passphrase: string = ''): Promise<void> {
  try {
    const jsonStr = JSON.stringify(settings);
    const stored = settings.isEncrypted && passphrase
      ? await encryptData(jsonStr, passphrase)
      : jsonStr;
    localStorage.setItem(SETTINGS_KEY, stored);
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export async function loadSessions(passphrase: string = ''): Promise<ChatSession[]> {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];

    let decrypted = raw;
    if (raw.startsWith('enc:') || raw.startsWith('plain:')) {
      try {
        decrypted = await decryptData(raw, passphrase);
      } catch (e) {
        console.warn('Failed to decrypt sessions with provided passphrase', e);
        return [];
      }
    }

    const parsed = JSON.parse(decrypted);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading sessions:', err);
    return [];
  }
}

export async function saveSessions(
  sessions: ChatSession[],
  isEncrypted: boolean,
  passphrase: string = ''
): Promise<void> {
  try {
    const jsonStr = JSON.stringify(sessions);
    const stored = isEncrypted && passphrase
      ? await encryptData(jsonStr, passphrase)
      : jsonStr;
    localStorage.setItem(SESSIONS_KEY, stored);
  } catch (err) {
    console.error('Error saving sessions:', err);
  }
}

export function loadActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

export function saveActiveSessionId(id: string): void {
  localStorage.setItem(ACTIVE_SESSION_KEY, id);
}

export function createNewSession(
  title: string = 'নতুন কথোপকথন',
  model: string = 'meta-llama/llama-3.3-70b-instruct:free'
): ChatSession {
  return {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    mood: 'friendly',
    model,
  };
}

export function exportBackupData(
  settings: AppSettings,
  sessions: ChatSession[],
  passphrase: string = ''
): string {
  const payload = {
    settings,
    sessions,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  return JSON.stringify(payload, null, 2);
}

export function importBackupData(jsonString: string): {
  settings?: AppSettings;
  sessions?: ChatSession[];
} {
  const parsed = JSON.parse(jsonString);
  return {
    settings: parsed.settings,
    sessions: parsed.sessions,
  };
}
