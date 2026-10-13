import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Link2,
  Smile,
  Image as ImageIcon,
  ChevronDown,
} from 'lucide-react';
import { AppSettings, MoodType } from '../types';
import { translations, moodIcons } from '../utils/translations';
import { SpeechHandler } from '../utils/speech';

interface InputBoxProps {
  onSendMessage: (text: string) => void;
  onOpenImageStudio: () => void;
  onOpenLinkModal: () => void;
  currentMood: MoodType;
  onChangeMood: (mood: MoodType) => void;
  settings: AppSettings;
  isLoading: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({
  onSendMessage,
  onOpenImageStudio,
  onOpenLinkModal,
  currentMood,
  onChangeMood,
  settings,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showMoodMenu, setShowMoodMenu] = useState(false);
  const speechHandlerRef = useRef<SpeechHandler | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = translations[settings.language];

  useEffect(() => {
    speechHandlerRef.current = new SpeechHandler();
    return () => {
      speechHandlerRef.current?.stopListening();
    };
  }, []);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceRecording = () => {
    if (!speechHandlerRef.current) return;

    if (isListening) {
      speechHandlerRef.current.stopListening();
      setIsListening(false);
    } else {
      const started = speechHandlerRef.current.startListening(
        settings.language,
        (transcript) => {
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
        },
        (err) => {
          console.warn('Voice recognition error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      if (started) {
        setIsListening(true);
      }
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const moodsList: MoodType[] = ['intimate', 'friendly', 'analytical', 'humorous', 'empathetic', 'creative'];

  return (
    <div className="p-3 md:p-4 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-md sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Voice Recording Status Bar */}
        {isListening && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-red-950/50 border border-red-800/60 rounded-lg text-xs text-red-200 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>{t.listening}</span>
            </div>
            <button
              onClick={toggleVoiceRecording}
              className="text-[11px] underline hover:text-white"
            >
              {t.voiceStop}
            </button>
          </div>
        )}

        {/* Input Box Shell */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all shadow-lg">
          {/* Main Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? t.listening : t.inputPlaceholder}
            className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none max-h-44 min-h-[44px]"
          />

          {/* Action Toolbar Inside Input Dock */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-slate-800/40">
            {/* Left Controls: Mood, Image Studio, Web Link */}
            <div className="flex items-center gap-1.5">
              {/* Mood Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMoodMenu(!showMoodMenu)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  title={t.changeMood}
                >
                  <span>{moodIcons[currentMood]}</span>
                  <span className="hidden sm:inline text-[11px] font-medium">{t.moods[currentMood]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {showMoodMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-full left-0 mb-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-40 space-y-1"
                  >
                    <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {t.changeMood}
                    </div>
                    {moodsList.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          onChangeMood(m);
                          setShowMoodMenu(false);
                        }}
                        className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          currentMood === m
                            ? 'bg-slate-800 text-cyan-400 font-medium'
                            : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="text-sm">{moodIcons[m]}</span>
                        <div className="flex-1 truncate">
                          <div className="text-xs">{t.moods[m]}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Image Studio Trigger */}
              <button
                type="button"
                onClick={onOpenImageStudio}
                className="flex items-center gap-1 p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
                title={t.generateImage}
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Web Link Trigger */}
              <button
                type="button"
                onClick={onOpenLinkModal}
                className="flex items-center gap-1 p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-colors"
                title={t.addLink}
              >
                <Link2 className="w-4 h-4" />
              </button>
            </div>

            {/* Right Controls: Voice Microphone + Send Button */}
            <div className="flex items-center gap-2">
              {/* Voice Input */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-2 rounded-lg transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isListening ? t.voiceStop : t.voiceInput}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="button"
                disabled={!inputText.trim() || isLoading}
                onClick={handleSend}
                className={`p-2 rounded-lg font-semibold transition-all ${
                  inputText.trim() && !isLoading
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-900/50 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title={t.send}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info line */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>{settings.language === 'bn' ? 'কমান্ড: /image লিখে সরাসরি ছবি আঁকুন' : 'Tip: Type /image <prompt> to render visuals'}</span>
          <span className="font-mono text-[10px] text-slate-500">Model: {settings.selectedModel.split('/')[1] || settings.selectedModel}</span>
        </div>
      </div>
    </div>
  );
};
