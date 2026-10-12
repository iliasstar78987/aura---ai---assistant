import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Bot,
  User,
  ZoomIn,
  RefreshCw,
} from 'lucide-react';
import { AppSettings, ChatMessage, MoodType } from '../types';
import { translations, moodIcons } from '../utils/translations';
import { speakText, stopSpeaking } from '../utils/speech';

// Import generated visual assets
import assistantAvatar from '../assets/images/assistant_avatar_1791831860125.jpg';
import workspaceHero from '../assets/images/ai_workspace_hero_1791831875118.jpg';

interface ChatAreaProps {
  messages: ChatMessage[];
  currentMood: MoodType;
  settings: AppSettings;
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
  onRetryLast?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentMood,
  settings,
  isLoading,
  onSelectPrompt,
  onRetryLast,
}) => {
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[settings.language];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingMessageId === id) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(id);
      speakText(text, settings.language, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const handleDownloadImage = (url: string, filename: string = 'aura-generated-art.jpg') => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Empty State */}
      {messages.length === 0 ? (
        <div className="max-w-3xl mx-auto py-6 space-y-8">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl">
            <div className="relative h-48 md:h-64 w-full overflow-hidden">
              <img
                src={workspaceHero}
                alt="Aura AI Workspace"
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{moodIcons[currentMood]}</span>
                  <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
                    {t.moods[currentMood]}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {settings.language === 'bn'
                    ? 'আপনার ব্যক্তিগত সুপার এআই অ্যাসিস্ট্যান্ট'
                    : 'Your Personal Super AI Assistant'}
                </h1>
                <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
                  {settings.language === 'bn'
                    ? 'সীমাহীন ওপেন রাউটার ইন্টেলিজেন্স, আনলিমিটেড ছবি তৈরি, ওয়েব লিংক বিশ্লেষণ এবং মিলিটারি গ্রেড এনক্রিপশন।'
                    : 'Unlimited OpenRouter intelligence, free visual generation, web link analysis, and military-grade client encryption.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Starter Cards */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              {settings.language === 'bn' ? 'শুরু করার জন্য কিছু প্রশ্ন ও কাজ:' : 'Try asking or creating:'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {t.promptExamples.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(prompt)}
                  className="text-left p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-slate-200 hover:text-white transition-all text-xs leading-relaxed group"
                >
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span>{prompt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Conversation Stream */
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const isSpeaking = speakingMessageId === message.id;

            return (
              <div
                key={message.id}
                className={`flex gap-3 md:gap-4 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-indigo-600/90 text-white flex items-center justify-center font-bold text-xs shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/40 shadow-md shadow-cyan-500/20">
                      <img
                        src={assistantAvatar}
                        alt="Aura AI"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                {/* Message Content Container */}
                <div
                  className={`flex-1 max-w-[85%] md:max-w-[78%] space-y-2 ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Mood Tag & Metadata for Bot */}
                  {!isUser && message.mood && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{moodIcons[message.mood]}</span>
                      <span>{t.moods[message.mood]}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  {/* Main Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {renderFormattedMessage(message.content, handleCopyText)}
                    </div>

                    {/* Inline Generated Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 gap-3">
                        {message.images.map((img) => (
                          <div
                            key={img.id}
                            className="group relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950"
                          >
                            <img
                              src={img.url}
                              alt={img.prompt}
                              className="w-full max-h-96 object-contain bg-black/40 cursor-pointer"
                              onClick={() => setPreviewImageUrl(img.url)}
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setPreviewImageUrl(img.url)}
                                className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs backdrop-blur-xs transition-colors"
                                title="Zoom"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownloadImage(img.url)}
                                className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs backdrop-blur-xs transition-colors"
                                title={t.downloadImage}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Attached Web Links */}
                    {message.links && message.links.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2">
                        {message.links.map((link, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800"
                          >
                            {link.image && (
                              <img
                                src={link.image}
                                alt={link.title}
                                className="w-full sm:w-28 h-20 object-cover rounded-lg border border-slate-800"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-semibold text-white truncate">
                                  {link.title}
                                </h4>
                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                                  {link.description}
                                </p>
                              </div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 mt-1 font-medium"
                              >
                                <span>{link.domain}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs px-1">
                      <button
                        onClick={() => handleCopyText(message.id, message.content)}
                        className="flex items-center gap-1 hover:text-slate-300 transition-colors p-1"
                        title={t.copy}
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">{t.copied}</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(message.id, message.content)}
                        className={`flex items-center gap-1 transition-colors p-1 ${
                          isSpeaking ? 'text-cyan-400' : 'hover:text-slate-300'
                        }`}
                        title={isSpeaking ? t.stopReading : t.readAloud}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 md:gap-4">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/40 shrink-0">
                <img
                  src={assistantAvatar}
                  alt="Aura AI"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>
                  {settings.language === 'bn'
                    ? 'অরা চিন্তা করছে ও উত্তর তৈরি করছে...'
                    : 'Aura is reasoning & formulating response...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
          >
            <img
              src={previewImageUrl}
              alt="Generated Full Preview"
              className="max-h-[80vh] w-auto rounded-xl object-contain border border-slate-800 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => handleDownloadImage(previewImageUrl)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadImage}</span>
              </button>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Formats message code blocks, bold text, links cleanly
function renderFormattedMessage(
  content: string,
  onCopy: (id: string, text: string) => void
): React.ReactNode {
  // Check for code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text_${lastIndex}`}>
          {content.substring(lastIndex, match.index)}
        </span>
      );
    }

    const language = match[1] || 'code';
    const code = match[2];
    const blockId = `code_${match.index}`;

    parts.push(
      <div
        key={blockId}
        className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs"
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
          <span className="text-[11px] font-medium uppercase text-cyan-400">{language}</span>
          <button
            onClick={() => onCopy(blockId, code)}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span className="text-[10px]">Copy</span>
          </button>
        </div>
        <pre className="p-3 overflow-x-auto text-slate-200 leading-normal">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`text_end`}>
        {content.substring(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}
