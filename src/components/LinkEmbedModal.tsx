import React, { useState } from 'react';
import { X, Link2, ExternalLink, Sparkles, Send } from 'lucide-react';
import { AppSettings, LinkMetadata } from '../types';
import { translations } from '../utils/translations';
import { fetchLinkMetadata } from '../utils/linkPreview';

interface LinkEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSendLinkToChat: (link: LinkMetadata) => void;
}

export const LinkEmbedModal: React.FC<LinkEmbedModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSendLinkToChat,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<LinkMetadata | null>(null);

  const t = translations[settings.language];

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    setIsLoading(true);
    try {
      const data = await fetchLinkMetadata(target);
      setPreview(data);
    } catch (e) {
      console.warn('Failed to parse link metadata', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!preview) return;
    onSendLinkToChat(preview);
    setUrl('');
    setPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">{t.linkModalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          <p className="text-slate-400 text-xs leading-relaxed">{t.linkModalDesc}</p>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.enterUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!url.trim() || isLoading}
                className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 text-xs transition-colors ${
                  url.trim() && !isLoading
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoading ? '...' : t.analyzeUrl}</span>
              </button>
            </div>
          </div>

          {/* Preview Card */}
          {preview && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              {preview.image && (
                <div className="relative rounded-lg overflow-hidden border border-slate-800 max-h-48">
                  <img
                    src={preview.image}
                    alt={preview.title}
                    className="w-full h-40 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-cyan-300 font-mono backdrop-blur-xs">
                    {preview.domain}
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-white">{preview.title}</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {preview.description}
                </p>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline mt-2"
                >
                  <span>{preview.url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            disabled={!preview}
            onClick={handleSend}
            className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              preview
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{settings.language === 'bn' ? 'চ্যাটে শেয়ার করুন' : 'Share to Chat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
