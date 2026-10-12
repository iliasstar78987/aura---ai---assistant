import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Send,
  Wand2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { AppSettings, GeneratedImage } from '../types';
import { translations } from '../utils/translations';
import {
  createGeneratedImageObj,
  STYLE_PRESETS,
} from '../services/imageService';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSendImageToChat: (image: GeneratedImage) => void;
}

export const ImageGenModal: React.FC<ImageGenModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSendImageToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16'>('1:1');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const t = translations[settings.language];

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    // Create the image URL and model object
    const newImage = createGeneratedImageObj({
      prompt: prompt.trim(),
      aspectRatio,
      style: selectedStyle,
    });

    // Simulate short network trigger and load
    setTimeout(() => {
      setCurrentImage(newImage);
      setIsGenerating(false);
    }, 800);
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    const additions = settings.language === 'bn'
      ? ', অতি চমৎকার সিনেমাটিক লাইটিং, বাস্তবসম্মত টেক্সচার, 8k রেজোলিউশন, শৈল্পিক গভীরতা'
      : ', ultra high resolution, cinematic volumetric lighting, photorealistic textures, masterwork 8k';
    setPrompt(prompt.trim() + additions);
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const a = document.createElement('a');
    a.href = currentImage.url;
    a.download = `aura-art-${Date.now()}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">{t.imageStudioTitle}</h2>
              <p className="text-[11px] text-emerald-400">{t.freeUnlimitedNotice}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Prompt Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">
                {settings.language === 'bn' ? 'ছবির বিবরণ (Prompt)' : 'Image Prompt Description'}
              </label>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{settings.language === 'bn' ? 'প্রম্পট আরও সুন্দর করুন' : 'Enhance Prompt'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.promptPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none text-xs"
            />
          </div>

          {/* Controls: Aspect Ratio & Styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300">{t.aspectRatio}</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1:1', label: '1:1 Square' },
                  { id: '16:9', label: '16:9 Wide' },
                  { id: '4:3', label: '4:3 Standard' },
                  { id: '9:16', label: '9:16 Story' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`py-2 px-1 text-center rounded-lg border text-[11px] font-medium transition-all ${
                      aspectRatio === ratio.id
                        ? 'border-cyan-400 bg-cyan-950/30 text-white font-semibold'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Preset */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300">{t.stylePreset}</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
              >
                {STYLE_PRESETS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {settings.language === 'bn' ? st.nameBn : st.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={!prompt.trim() || isGenerating}
            onClick={handleGenerate}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              prompt.trim() && !isGenerating
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-950'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? t.generating : t.generateImage}</span>
          </button>

          {/* Output Preview */}
          {currentImage && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-64">
                <img
                  src={currentImage.url}
                  alt={currentImage.prompt}
                  className="max-h-80 w-auto object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.downloadImage}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSendImageToChat(currentImage);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{settings.language === 'bn' ? 'চ্যাটে যুক্ত করুন' : 'Send to Chat'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
