import React, { useState, useEffect, useCallback } from 'react';
import {
  AppSettings,
  ChatMessage,
  ChatSession,
  GeneratedImage,
  LinkMetadata,
  MoodType,
} from './types';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  loadSessions,
  saveSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  createNewSession,
  exportBackupData,
  importBackupData,
} from './services/storageService';
import { sendChatMessage } from './services/aiService';
import {
  detectImagePrompt,
  createGeneratedImageObj,
} from './services/imageService';
import { extractUrls, fetchLinkMetadata } from './utils/linkPreview';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { InputBox } from './components/InputBox';
import { SettingsModal } from './components/SettingsModal';
import { ImageGenModal } from './components/ImageGenModal';
import { MemoryModal } from './components/MemoryModal';
import { LinkEmbedModal } from './components/LinkEmbedModal';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [passphrase, setPassphrase] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState<boolean>(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState<boolean>(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        settings.language === 'bn'
          ? 'আপনার ব্রাউজারের মেনু (⋮) থেকে "Install app" অথবা "Add to Home screen" এ ক্লিক করে ইনস্টল করতে পারেন।'
          : 'You can install this app by opening browser menu (⋮) and selecting "Install app" or "Add to Home screen".'
      );
    }
  };

  // Initialize and load persisted data
  useEffect(() => {
    async function initData() {
      const loadedSettings = await loadSettings('');
      setSettings(loadedSettings);

      const loadedSessions = await loadSessions('');
      if (loadedSessions.length > 0) {
        setSessions(loadedSessions);
        const savedActiveId = loadActiveSessionId();
        if (savedActiveId && loadedSessions.some((s) => s.id === savedActiveId)) {
          setActiveSessionId(savedActiveId);
        } else {
          setActiveSessionId(loadedSessions[0].id);
        }
      } else {
        const initial = createNewSession(
          loadedSettings.language === 'bn' ? 'প্রথম আলোচনা' : 'First Chat',
          loadedSettings.selectedModel
        );
        setSessions([initial]);
        setActiveSessionId(initial.id);
        saveActiveSessionId(initial.id);
      }
    }

    initData();
  }, []);

  // Sync theme to document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (settings.theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
    }
  }, [settings.theme]);

  // Persist sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions, settings.isEncrypted, passphrase);
    }
  }, [sessions, settings.isEncrypted, passphrase]);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings, passphrase);
  }, [settings, passphrase]);

  // Active Session reference
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Create new session
  const handleNewSession = () => {
    const newSession = createNewSession(
      settings.language === 'bn' ? 'নতুন কথোপকথন' : 'New Conversation',
      settings.selectedModel
    );
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSession.id);
    saveActiveSessionId(newSession.id);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    if (updated.length === 0) {
      const fresh = createNewSession(
        settings.language === 'bn' ? 'নতুন কথোপকথন' : 'New Conversation',
        settings.selectedModel
      );
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      saveActiveSessionId(fresh.id);
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
        saveActiveSessionId(updated[0].id);
      }
    }
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    const fresh = createNewSession(
      settings.language === 'bn' ? 'নতুন কথোপকথন' : 'New Conversation',
      settings.selectedModel
    );
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    saveActiveSessionId(fresh.id);
  };

  // Change mood of current session
  const handleChangeMood = (newMood: MoodType) => {
    if (!currentSession) return;
    const updatedSessions = sessions.map((s) =>
      s.id === currentSession.id ? { ...s, mood: newMood } : s
    );
    setSessions(updatedSessions);
  };

  // Send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !currentSession) return;

    const userMessageText = text.trim();

    // Check if user attached links directly in text
    const foundUrls = extractUrls(userMessageText);
    let attachedLinks: LinkMetadata[] = [];
    if (foundUrls.length > 0) {
      try {
        const metadata = await fetchLinkMetadata(foundUrls[0]);
        attachedLinks.push(metadata);
      } catch (err) {
        console.warn('URL metadata extract error:', err);
      }
    }

    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: userMessageText,
      timestamp: Date.now(),
      links: attachedLinks.length > 0 ? attachedLinks : undefined,
    };

    // Update session title on first message if default
    let updatedTitle = currentSession.title;
    if (currentSession.messages.length === 0) {
      updatedTitle = userMessageText.slice(0, 28) + (userMessageText.length > 28 ? '...' : '');
    }

    const messagesWithUser = [...currentSession.messages, userMsg];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? {
              ...s,
              title: updatedTitle,
              messages: messagesWithUser,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsLoading(true);

    try {
      // 1. Check if the message is an image generation request
      const imagePrompt = detectImagePrompt(userMessageText);
      if (imagePrompt) {
        const generatedImg = createGeneratedImageObj({
          prompt: imagePrompt,
          aspectRatio: '1:1',
          style: 'photorealistic',
        });

        const replyContent =
          settings.language === 'bn'
            ? `আপনার অনুরোধ অনুযায়ী **"${imagePrompt}"** এর একটি হাই-রেজোলিউশন ভিজ্যুয়াল ছবি নিচে প্রস্তুত করা হলো:`
            : `Here is the high-resolution visual artwork generated for **"${imagePrompt}"**:`;

        const assistantMsg: ChatMessage = {
          id: 'msg_bot_' + Date.now(),
          role: 'assistant',
          content: replyContent,
          timestamp: Date.now(),
          mood: currentSession.mood,
          images: [generatedImg],
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSession.id
              ? {
                  ...s,
                  messages: [...messagesWithUser, assistantMsg],
                  updatedAt: Date.now(),
                }
              : s
          )
        );
        setIsLoading(false);
        return;
      }

      // 2. Otherwise send to OpenRouter / AI Intelligence
      const botResponse = await sendChatMessage({
        apiKey: settings.openRouterApiKey,
        model: currentSession.model || settings.selectedModel,
        messages: messagesWithUser,
        mood: currentSession.mood,
        language: settings.language,
        memoryFacts: settings.userFacts,
        userName: settings.userName,
      });

      // Check if bot response mentions or introduces website links with imagery
      let botLinks: LinkMetadata[] | undefined = undefined;
      const botUrls = extractUrls(botResponse);
      if (botUrls.length > 0) {
        try {
          const m = await fetchLinkMetadata(botUrls[0]);
          botLinks = [m];
        } catch {
          // ignore
        }
      }

      const assistantMsg: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        content: botResponse,
        timestamp: Date.now(),
        mood: currentSession.mood,
        links: botLinks,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? {
                ...s,
                messages: [...messagesWithUser, assistantMsg],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Chat generation error:', err);
      const errMsg =
        settings.language === 'bn'
          ? `দুঃখিত, সংযোগে একটি সমস্যা হয়েছে: ${err?.message || 'অজানা ত্রুটি'}। আপনি সেটিংস থেকে OpenRouter API Key যাচাই করে দেখতে পারেন।`
          : `Connection error: ${err?.message || 'Unknown error'}. Please verify your OpenRouter API Key in Settings.`;

      const assistantErr: ChatMessage = {
        id: 'msg_bot_err_' + Date.now(),
        role: 'assistant',
        content: errMsg,
        timestamp: Date.now(),
        mood: currentSession.mood,
        error: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? {
                ...s,
                messages: [...messagesWithUser, assistantErr],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Add generated image into active chat
  const handleSendImageToChat = (image: GeneratedImage) => {
    if (!currentSession) return;

    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content:
        settings.language === 'bn'
          ? `/image ${image.prompt}`
          : `/image ${image.prompt}`,
      timestamp: Date.now(),
    };

    const botMsg: ChatMessage = {
      id: 'msg_bot_' + Date.now(),
      role: 'assistant',
      content:
        settings.language === 'bn'
          ? `আপনার তৈরি করা ছবি চ্যাটে যুক্ত করা হলো:`
          : `Your generated image has been added to the chat:`,
      timestamp: Date.now() + 10,
      mood: currentSession.mood,
      images: [image],
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? {
              ...s,
              messages: [...s.messages, userMsg, botMsg],
              updatedAt: Date.now(),
            }
          : s
      )
    );
  };

  // Add analyzed web link into active chat
  const handleSendLinkToChat = async (link: LinkMetadata) => {
    if (!currentSession) return;

    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: `${link.url}\n(এই ওয়েবসাইটটি পর্যালোচনা করো)`,
      timestamp: Date.now(),
      links: [link],
    };

    const messagesWithUser = [...currentSession.messages, userMsg];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? {
              ...s,
              messages: messagesWithUser,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsLoading(true);

    try {
      const prompt = `User shared this website: ${link.url} (Title: ${link.title}, Description: ${link.description}).
Please provide a helpful, engaging overview of this website, its key topics, and why it is interesting or valuable.`;

      const botResponse = await sendChatMessage({
        apiKey: settings.openRouterApiKey,
        model: currentSession.model || settings.selectedModel,
        messages: [
          ...currentSession.messages,
          { role: 'user', content: prompt, id: 'tmp', timestamp: Date.now() },
        ],
        mood: currentSession.mood,
        language: settings.language,
        memoryFacts: settings.userFacts,
        userName: settings.userName,
      });

      const botMsg: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        content: botResponse,
        timestamp: Date.now(),
        mood: currentSession.mood,
        links: [link],
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? {
                ...s,
                messages: [...messagesWithUser, botMsg],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (err: any) {
      console.warn('Error summarizing link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export encrypted backup
  const handleExportBackup = () => {
    const json = exportBackupData(settings, sessions, passphrase);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import backup file
  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const imported = importBackupData(text);
        if (imported.settings) {
          setSettings(imported.settings);
        }
        if (imported.sessions && imported.sessions.length > 0) {
          setSessions(imported.sessions);
          setActiveSessionId(imported.sessions[0].id);
        }
        alert(
          settings.language === 'bn'
            ? 'ব্যাকআপ সফলভাবে পুনরুদ্ধার করা হয়েছে!'
            : 'Backup successfully restored!'
        );
      } catch (err) {
        alert(
          settings.language === 'bn'
            ? 'ব্যাকআপ ফাইলে ত্রুটি!'
            : 'Invalid backup file structure!'
        );
      }
    };
    reader.readAsText(file);
  };

  // Background styling based on theme
  const themeBgClass =
    settings.theme === 'oled'
      ? 'bg-black text-slate-100'
      : settings.theme === 'light'
      ? 'bg-slate-50 text-slate-900'
      : 'bg-slate-950 text-slate-100';

  return (
    <div className={`min-h-screen flex flex-col font-sans ${themeBgClass}`}>
      {/* 3-Zone Top Navigation Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImageStudio={() => setIsImageStudioOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenLinkModal={() => setIsLinkModalOpen(true)}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        canInstall={true}
        onInstallApp={handleInstallApp}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left History Sidebar */}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            saveActiveSessionId(id);
          }}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onClearAllSessions={handleClearAllSessions}
          settings={settings}
          onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
          onExportBackup={handleExportBackup}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          canInstall={true}
          onInstallApp={handleInstallApp}
        />

        {/* Central Chat Viewport */}
        <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-57px)]">
          <ChatArea
            messages={currentSession?.messages || []}
            currentMood={currentSession?.mood || 'friendly'}
            settings={settings}
            isLoading={isLoading}
            onSelectPrompt={(p) => handleSendMessage(p)}
          />

          {/* Interactive Bottom Console Dock */}
          <InputBox
            onSendMessage={handleSendMessage}
            onOpenImageStudio={() => setIsImageStudioOpen(true)}
            onOpenLinkModal={() => setIsLinkModalOpen(true)}
            currentMood={currentSession?.mood || 'friendly'}
            onChangeMood={handleChangeMood}
            settings={settings}
            isLoading={isLoading}
          />
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings, newPassphrase) => {
          setSettings(newSettings);
          if (newPassphrase !== undefined) {
            setPassphrase(newPassphrase);
          }
        }}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Image Creation Studio Modal */}
      <ImageGenModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        settings={settings}
        onSendImageToChat={handleSendImageToChat}
      />

      {/* Long-term Memory Vault Modal */}
      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        settings={settings}
        onUpdateFacts={(facts) => setSettings((prev) => ({ ...prev, userFacts: facts }))}
      />

      {/* Web Link Inspector Modal */}
      <LinkEmbedModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        settings={settings}
        onSendLinkToChat={handleSendLinkToChat}
      />
    </div>
  );
}
