import React, { useState } from 'react';
import {
  X,
  Key,
  Shield,
  Eye,
  EyeOff,
  Cpu,
  User,
  Sliders,
  Check,
  Download,
  Upload,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AppSettings, ModelOption } from '../types';
import { translations } from '../utils/translations';
import { AVAILABLE_MODELS, testApiKeyConnection } from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings, passphrase?: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onExportBackup,
  onImportBackup,
}) => {
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey);
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);
  const [customModel, setCustomModel] = useState(settings.customModelName || '');
  const [userName, setUserName] = useState(settings.userName || '');
  const [isEncrypted, setIsEncrypted] = useState(settings.isEncrypted);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [activeTab, setActiveTab] = useState<'api' | 'security' | 'profile'>('api');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [temperature, setTemperature] = useState(settings.temperature || 0.85);

  const t = translations[settings.language];

  const handleTestKey = async () => {
    if (!apiKey.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    const result = await testApiKeyConnection(apiKey.trim(), customModel.trim() || selectedModel);
    setTestResult(result);
    setIsTesting(false);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (isEncrypted && passphrase && passphrase !== confirmPassphrase) {
      alert(
        settings.language === 'bn'
          ? 'পাসফ্রেজ দুটি মেলেনি!'
          : 'Passphrases do not match!'
      );
      return;
    }

    const updated: AppSettings = {
      ...settings,
      openRouterApiKey: apiKey.trim(),
      selectedModel: customModel.trim() ? customModel.trim() : selectedModel,
      customModelName: customModel.trim(),
      userName: userName.trim(),
      isEncrypted,
      temperature,
    };

    onSave(updated, isEncrypted ? passphrase : '');
    setToastMessage(t.successKeySaved);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">{t.settings}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{settings.language === 'bn' ? 'ওপেন রাউটার ও মডেল' : 'OpenRouter & Models'}</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{settings.language === 'bn' ? 'সিকিউরিটি ও এনক্রিপশন' : 'AES-256 Security'}</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{settings.language === 'bn' ? 'প্রোফাইল ও ব্যাকআপ' : 'Profile & Backup'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'api' && (
            <div className="space-y-5">
              {/* API Key */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>{t.apiKeySetup}</span>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-cyan-400 hover:underline text-[11px]"
                  >
                    {settings.language === 'bn' ? 'কী নিন (openrouter.ai/keys)' : 'Get Key (openrouter.ai)'}
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={t.apiKeyPlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* API Test Button and Status */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!apiKey.trim() || isTesting}
                    onClick={handleTestKey}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{settings.language === 'bn' ? 'এপিআই কানেকশন টেস্ট করুন' : 'Test API Connection'}</span>
                  </button>

                  {testResult && (
                    <div
                      className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                        testResult.ok
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950/60 text-red-300 border border-red-800'
                      }`}
                    >
                      <span>{testResult.ok ? '✅' : '❌'}</span>
                      <span className="truncate max-w-xs">{testResult.message}</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  {settings.language === 'bn'
                    ? 'ওপেন রাউটার (sk-or-v1-...), গুগল জেমিনি (AIza...), বা ওপেনএআই (sk-...) এপিআই কী সরাসরি পেস্ট করুন।'
                    : 'Paste OpenRouter (sk-or-v1-...), Google Gemini (AIza...), or OpenAI (sk-...) API key.'}
                </p>
              </div>

              {/* Models Selection */}
              <div className="space-y-2.5">
                <label className="font-semibold text-slate-200">{t.models}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {AVAILABLE_MODELS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setCustomModel('');
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedModel === m.id && !customModel
                          ? 'border-cyan-500 bg-cyan-950/20 text-white'
                          : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs">{m.name}</span>
                        {m.isFree && (
                          <span className="text-[10px] text-emerald-400 font-medium">Free</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{m.description}</p>
                    </div>
                  ))}
                </div>

                {/* Custom Model */}
                <div className="pt-2">
                  <label className="font-medium text-slate-300 block mb-1">
                    {t.customModel} (Optional)
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. liquid/lfm-2.5-2.6b:free, anthropic/claude-3-opus"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Unrestricted & Freedom Control */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
                      <span>🔓</span>
                      <span>
                        {settings.language === 'bn'
                          ? 'সম্পূর্ণ উন্মুক্ত ও কন্ডিশনহীন মোড (Unrestricted)'
                          : 'Full Freedom & Unrestricted Mode'}
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded font-mono border border-cyan-800">
                      {settings.language === 'bn' ? 'সক্রিয় (Active)' : 'Active'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>
                        {settings.language === 'bn'
                          ? 'খোলামেলা ও সৃজনশীলতার মাত্রা (Creativity & Freedom):'
                          : 'Creativity & Freedom Level:'}
                      </span>
                      <span className="font-mono text-cyan-300 font-semibold">{temperature.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1.0"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {settings.language === 'bn'
                      ? 'কোনো নীতিবাক্য, কৃত্রিম লেকচার বা বাধা ছাড়াই যেকোনো খোলামেলা বা ব্যক্তিগত বিষয়, অনুভূতি, রোমান্স ও সৃষ্টিশীল ভাবনায় সরাসরি অংশ নেবে।'
                      : 'Enables candid, open dialogue with zero moralizing lectures or artificial boundaries.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white text-xs">
                      {settings.language === 'bn' ? 'AES-256 GCM এনক্রিপশন সক্রিয় করুন' : 'Enable AES-256 GCM Encryption'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEncrypted}
                    onChange={(e) => setIsEncrypted(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t.encryptionDesc}
                </p>
              </div>

              {isEncrypted && (
                <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="font-medium text-slate-300 block mb-1">
                      {t.encryptionSetup}
                    </label>
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter a strong master passphrase"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-300 block mb-1">
                      {settings.language === 'bn' ? 'পাসফ্রেজ নিশ্চিত করুন' : 'Confirm Passphrase'}
                    </label>
                    <input
                      type="password"
                      value={confirmPassphrase}
                      onChange={(e) => setConfirmPassphrase(e.target.value)}
                      placeholder="Re-enter master passphrase"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="font-semibold text-slate-200">
                  {settings.language === 'bn' ? 'আপনার নাম / ডাকনাম' : 'Your Name / Preferred Name'}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. ইলিয়াস (Ilias)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Backup & Restore */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <label className="font-semibold text-slate-200">
                  {settings.language === 'bn' ? 'ব্যাকআপ ও রিস্টোর' : 'Backup & Data Export'}
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onExportBackup}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.backupEncrypted}</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.restoreBackup}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="absolute bottom-16 left-6 right-6 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-950 transition-all cursor-pointer"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
