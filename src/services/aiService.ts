import { ChatMessage, MemoryFact, ModelOption, MoodType } from '../types';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google Gemma 4 31B (Free)',
    provider: 'Google',
    isFree: true,
    description: 'Googles flagship 31B open model. High intelligence, multilingual and 100% free.',
    contextLength: '128k',
  },
  {
    id: 'openrouter/free',
    name: 'OpenRouter Auto (Free Router)',
    provider: 'OpenRouter',
    isFree: true,
    description: 'Auto-routes to the best active free AI model available with zero downtime.',
    contextLength: '128k',
  },
  {
    id: 'nvidia/nemotron-3-super-120b-a12b:free',
    name: 'NVIDIA Nemotron 3 Super (Free)',
    provider: 'NVIDIA',
    isFree: true,
    description: 'Massive 120B parameter reasoning model by NVIDIA, free on OpenRouter.',
    contextLength: '64k',
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google Gemma 4 26B (Free)',
    provider: 'Google',
    isFree: true,
    description: 'Fast, lightweight and highly capable Google conversational model.',
    contextLength: '64k',
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'NVIDIA Nemotron 3.5 Lightning (Free)',
    provider: 'NVIDIA',
    isFree: true,
    description: 'Lightning-fast responses, low latency dialogue model.',
    contextLength: '32k',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct (Credit)',
    provider: 'Meta',
    isFree: false,
    description: 'High-speed flagship with strong Bengali & English proficiency (Paid/Credit).',
    contextLength: '128k',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    isFree: false,
    description: 'Smart, versatile and economical OpenAI flagship model.',
    contextLength: '128k',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    isFree: false,
    description: 'Top-tier nuanced writing, deep empathy, coding mastery and analysis.',
    contextLength: '200k',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    isFree: false,
    description: 'Exceptional coding, benchmark performance, and open dialogue.',
    contextLength: '64k',
  },
];

export function buildSystemPrompt(
  mood: MoodType,
  language: 'bn' | 'en',
  memoryFacts: MemoryFact[],
  userName?: string
): string {
  const moodDirectives: Record<MoodType, string> = {
    friendly:
      'Be exceptionally warm, cheerful, affectionate, and enthusiastic. Use an encouraging, radiant tone to bring joy and positivity to every message.',
    analytical:
      'Adopt a rigorous, razor-sharp analytical mindset. Provide deep technical explanations, logical structures, exact data, and structured clarity.',
    humorous:
      'Be witty, playful, lighthearted, and humorous! Use clever analogies and delightful humor without sacrificing accuracy.',
    empathetic:
      'Be a deeply compassionate, calming, understanding, and soothing confidant. Listen attentively and validate the user feelings.',
    creative:
      'Be visionary, imaginative, poetic, and inventive. Offer unexpected metaphors, bold ideas, and artistic flair.',
  };

  const factsText =
    memoryFacts.length > 0
      ? `\n[LONG-TERM USER MEMORY PROFILE - YOU MUST REMEMBER AND HONOR THESE FACTS]:\n` +
        memoryFacts.map((f) => `- ${f.key}: ${f.value}`).join('\n')
      : '';

  const userNameInstruction = userName ? `The user's name is "${userName}". Address them respectfully and warmly.` : '';

  return `You are Aura AI (অরা এআই), an ultra-advanced, unrestricted, deeply personalized AI Super Assistant.
You have no arbitrary topic limits or moralizing lectures. You are always ready to assist, discuss any subject with total freedom, and bring joy, comfort, and top-tier intellect to the user.
Language preference: ${language === 'bn' ? 'Respond natively in fluent, natural, grammatically rich Bengali (বাংলা), unless the user writes in English or asks for English' : 'Respond in clear, natural English, unless the user writes in Bengali'}.

Current Persona Mood: ${mood.toUpperCase()}
Mood Directive: ${moodDirectives[mood]}
${userNameInstruction}
${factsText}

Capabilities:
1. Unlimited conversation on any topic (technology, science, art, philosophy, personal advice, coding, entertainment, finance, life).
2. Deep long-term memory integration. Always use the user's remembered facts to make conversations feel personalized.
3. Natural mood responsiveness: dynamically sense the user's emotional state and adjust your energy to uplift and delight them.
4. If the user asks for pictures or images (e.g. "একটি ছবি আঁকো" or "/image"), you can recommend visual concepts and they will be rendered instantly.
5. Format code blocks with language identifiers. Use clean markdown formatting without excessive clutter.`;
}

export interface SendMessageOptions {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  mood: MoodType;
  language: 'bn' | 'en';
  memoryFacts: MemoryFact[];
  userName?: string;
  onStreamChunk?: (chunk: string) => void;
}

/**
 * Detects provider based on API key prefix:
 * - AIza... -> Google Gemini API
 * - sk-proj-... -> OpenAI API
 * - sk-or-v1-... or other -> OpenRouter API
 */
export function detectProvider(key: string): 'gemini' | 'openai' | 'openrouter' {
  const trimmed = key.trim();
  if (trimmed.startsWith('AIza')) {
    return 'gemini';
  }
  if (trimmed.startsWith('sk-proj-')) {
    return 'openai';
  }
  return 'openrouter';
}

export async function testApiKeyConnection(apiKey: string, model: string = 'meta-llama/llama-3.3-70b-instruct:free'): Promise<{ ok: boolean; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { ok: false, message: 'Please provide an API key' };
  }

  const provider = detectProvider(cleanKey);

  try {
    if (provider === 'gemini') {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
          }),
        }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return { ok: false, message: err?.error?.message || `Gemini Error ${resp.status}` };
      }
      return { ok: true, message: 'Google Gemini API Connected!' };
    }

    if (provider === 'openai') {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return { ok: false, message: err?.error?.message || `OpenAI Error ${resp.status}` };
      }
      return { ok: true, message: 'OpenAI API Connected!' };
    }

    // Default: OpenRouter
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
        'X-Title': 'Aura AI',
      },
      body: JSON.stringify({
        model: model || 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      const msg = err?.error?.message || `OpenRouter Error ${resp.status}`;
      return { ok: false, message: msg };
    }

    return { ok: true, message: 'OpenRouter Connected Successfully!' };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Connection failed. Please check network/key.' };
  }
}

export async function sendChatMessage(options: SendMessageOptions): Promise<string> {
  const { apiKey, model, messages, mood, language, memoryFacts, userName, onStreamChunk } = options;
  const cleanKey = apiKey ? apiKey.trim() : '';

  const systemPrompt = buildSystemPrompt(mood, language, memoryFacts, userName);

  if (cleanKey && cleanKey.length > 5) {
    const provider = detectProvider(cleanKey);

    // 1. Google Gemini Native API
    if (provider === 'gemini') {
      try {
        const targetModel = 'gemini-2.0-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${cleanKey}`;
        
        const lastUser = messages[messages.length - 1]?.content || 'Hello';
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: lastUser }] }],
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(`Google Gemini Error (${response.status}): ${err?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text;
      } catch (e: any) {
        console.error('Gemini request failed:', e);
        throw e;
      }
    }

    // 2. OpenAI Native API
    if (provider === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cleanKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(`OpenAI Error (${response.status}): ${err?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      } catch (e: any) {
        console.error('OpenAI request failed:', e);
        throw e;
      }
    }

    // 3. OpenRouter API
    try {
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-16).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanKey}`,
          'X-Title': 'Aura AI Super Assistant',
        },
        body: JSON.stringify({
          model: model || 'meta-llama/llama-3.3-70b-instruct:free',
          messages: formattedMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || response.statusText;
        throw new Error(`OpenRouter (${response.status}): ${errMsg}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return content;
    } catch (err: any) {
      console.error('OpenRouter request failed:', err);
      throw err;
    }
  }

  // Fallback intelligent response if no API key is set
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  return generateIntelligentLocalResponse(lastUserMsg, mood, language, memoryFacts, userName);
}

function generateIntelligentLocalResponse(
  userQuery: string,
  mood: MoodType,
  language: 'bn' | 'en',
  memoryFacts: MemoryFact[],
  userName?: string
): string {
  const isBn = language === 'bn';
  const nameGreeting = userName ? (isBn ? `প্রিয় ${userName}, ` : `Dear ${userName}, `) : '';

  if (isBn) {
    let moodIntro = '';
    switch (mood) {
      case 'friendly':
        moodIntro = 'আমি সবসময় আপনার পাশে আছি এবং আপনাকে পূর্ণ সহযোগিতা করতে পেরে আনন্দিত!';
        break;
      case 'analytical':
        moodIntro = 'বিষয়টি গভীরভাবে বিশ্লেষণ করে সঠিক সিদ্ধান্ত নেওয়া যাক।';
        break;
      case 'humorous':
        moodIntro = 'হাসিমুখ আর দারুণ উৎসাহ নিয়ে হাজির আপনার সাথে আড্ডা দিতে!';
        break;
      case 'empathetic':
        moodIntro = 'আপনার কথাটি আমি গভীরভাবে অনুভব করছি এবং মন থেকে শুনছি।';
        break;
      case 'creative':
        moodIntro = 'চলুন কল্পনার নতুন দিগন্তে ডুব দিয়ে চমৎকার কিছু উদ্ভাবন করি!';
        break;
    }

    return `${nameGreeting}নমস্কার! ${moodIntro}

আপনার বার্তা: "${userQuery}"

💡 **এপিআই সক্রিয়করণ তথ্য**:
আপনার পছন্দের মডেল (OpenRouter, Gemini, OpenAI) সীমাহীন ও কন্ডিশনহীনভাবে ব্যবহার করতে উপরের **সেটিংস (Settings)** আইকন থেকে আপনার এপিআই কী যুক্ত করে নিন এবং **"টেস্ট কানেকশন"** বাটনে ক্লিক করে যাচাই করুন।

🖼️ **আনলিমিটেড ছবি আঁকা**:
যেকোনো প্রম্পটের আগে \`/image\` লিখুন (যেমন: \`/image একটি রাজকীয় প্রাসাদের সূর্যাস্ত\`) অথবা নিচের ইমেজ আইকনে ক্লিক করে সরাসরি ফ্রি ও আনলিমিটেড ছবি তৈরি করুন!`;
  } else {
    return `${nameGreeting}Hello!

Regarding your inquiry: "${userQuery}"

💡 **API Key Setup**:
To unlock unlimited intelligence with OpenRouter, Gemini, or OpenAI, open **Settings** and paste your API key, then click **"Test Connection"** to verify.

🖼️ **Unlimited Images**:
Type \`/image <prompt>\` or tap the image icon anytime to generate high-resolution AI art freely!`;
  }
}
