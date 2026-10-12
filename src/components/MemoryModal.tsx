import React, { useState } from 'react';
import { X, Brain, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { AppSettings, MemoryFact } from '../types';
import { translations } from '../utils/translations';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateFacts: (facts: MemoryFact[]) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateFacts,
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryFact['category']>('personal');

  const t = translations[settings.language];

  if (!isOpen) return null;

  const handleAddFact = () => {
    if (!newKey.trim() || !newValue.trim()) return;

    const newFact: MemoryFact = {
      id: 'fact_' + Date.now(),
      key: newKey.trim(),
      value: newValue.trim(),
      category: newCategory,
      timestamp: Date.now(),
    };

    onUpdateFacts([...settings.userFacts, newFact]);
    setNewKey('');
    setNewValue('');
  };

  const handleDeleteFact = (id: string) => {
    onUpdateFacts(settings.userFacts.filter((f) => f.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">{t.memoryProfile}</h2>
              <p className="text-[11px] text-slate-400">
                {settings.userFacts.length} {t.memoryCount}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
            {t.memoryDescription}
          </div>

          {/* Add Fact Form */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>{t.addMemoryFact}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder={settings.language === 'bn' ? 'বিষয় (যেমন: পেশা / প্রিয় খাবার)' : 'Topic (e.g. Profession / Hobby)'}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-xs"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50 text-xs"
              >
                <option value="personal">{settings.language === 'bn' ? 'ব্যক্তিগত' : 'Personal'}</option>
                <option value="preference">{settings.language === 'bn' ? 'পছন্দ-অপছন্দ' : 'Preference'}</option>
                <option value="work">{settings.language === 'bn' ? 'কাজ ও প্রজেক্ট' : 'Work & Projects'}</option>
                <option value="interest">{settings.language === 'bn' ? 'আগ্রহ ও শখ' : 'Interests'}</option>
              </select>
            </div>

            <textarea
              rows={2}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={settings.language === 'bn' ? 'বিস্তারিত স্মৃতি তথ্য লিখুন...' : 'Enter memory details...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none text-xs"
            />

            <button
              type="button"
              onClick={handleAddFact}
              disabled={!newKey.trim() || !newValue.trim()}
              className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all text-xs ${
                newKey.trim() && newValue.trim()
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{settings.language === 'bn' ? 'স্মৃতিতে সংরক্ষণ করুন' : 'Save Fact to Memory'}</span>
            </button>
          </div>

          {/* List of Existing Facts */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">
              {settings.language === 'bn' ? 'সংরক্ষিত স্মৃতিতথ্য' : 'Current Retained Facts'}
            </h4>
            {settings.userFacts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                {settings.language === 'bn' ? 'এখনও কোনো তথ্য সংরক্ষিত নেই' : 'No memory facts added yet.'}
              </div>
            ) : (
              settings.userFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">{fact.key}</span>
                      <span className="text-[10px] text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/50">
                        {fact.category}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs break-words">{fact.value}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteFact(fact.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors shrink-0"
                    title={settings.language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-end bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
