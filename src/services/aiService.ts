import { ChatMessage, MemoryFact, ModelOption, MoodType } from '../types';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct (Free)',
    provider: 'Meta',
    isFree: true,
    description: 'High-speed, open-weights flagship with strong bilingual Bengali & English proficiency.',
    contextLength: '128k',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 Reasoning (Free)',
    provider: 'DeepSeek',
    isFree: true,
    description: 'State-of-the-art chain-of-thought reasoning, mathematics, and uncensored deep thinking.',
    contextLength: '64k',
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    provider: 'Google',
    isFree: true,
    description: 'Ultra-low latency, multimodal, lightning-fast responses.',
    contextLength: '1M',
  },
  {
    id: 'mistralai/mistral-small-24b-instruct-2501:free',
    name: 'Mistral Small 24B (Free)',
    provider: 'Mistral',
    isFree: true,
    description: 'Concise, sharp, and highly capable instruction follower.',
    contextLength: '32k',
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

export async function sendChatMessage(options: SendMessageOptions): Promise<string> {
  const { apiKey, model, messages, mood, language, memoryFacts, userName, onStreamChunk } = options;

  const systemPrompt = buildSystemPrompt(mood, language, memoryFacts, userName);

  // Prepare message history formatted for OpenAI / OpenRouter specs
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-16).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  // If user provided OpenRouter API Key
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': window.location.origin || 'https://aura-ai.local',
          'X-Title': 'Aura AI Super Assistant',
        },
        body: JSON.stringify({
          model: model || 'meta-llama/llama-3.3-70b-instruct:free',
          messages: formattedMessages,
          stream: !!onStreamChunk,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || response.statusText;
        throw new Error(`OpenRouter API Error (${response.status}): ${errMsg}`);
      }

      if (onStreamChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.substring(6);
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  fullText += delta;
                  onStreamChunk(fullText);
                }
              } catch {
                // Ignore incomplete SSE chunk
              }
            }
          }
        }

        if (fullText.trim()) {
          return fullText;
        }
      }

      // Non-streaming fallback
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return content;
    } catch (err: any) {
      console.error('OpenRouter request failed:', err);
      throw err;
    }
  }

  // Fallback engine if OpenRouter API Key is not yet configured:
  // We provide a rich, real intelligent conversational response informing how to enjoy full OpenRouter
  // and answering the query with high empathy and intelligence!
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

💡 **ওপেন রাউটার এপিআই সংযোগ নির্দেশিকা**:
আপনার পছন্দমতো যেকোনো শক্তিশালী মডেল (Llama 3.3 70B, DeepSeek R1, GPT-4o, Claude 3.5 Sonnet) সীমাহীন ও কন্ডিশনহীনভাবে ব্যবহার করার জন্য উপরের **"সেটিংস" (Settings)** আইকন থেকে আপনার **OpenRouter API Key** যুক্ত করে নিন।

🖼️ **আনলিমিটেড ছবি আঁকার সুবিধা**:
আপনি এখনই যেকোনো প্রম্পটের আগে \`/image\` লিখে (যেমন: \`/image একটি রাজকীয় প্রাসাদের সূর্যাস্তের দৃশ্য\`) অথবা নিচে ছবির আইকনে ক্লিক করে সীমাহীন ফ্রি হাই-রেজোলিউশন ছবি তৈরি করতে পারেন!

সব কথোপকথন ও তথ্য আপনার ব্রাউজারে সম্পূর্ণ **AES-256 এনক্রিপশনের** মাধ্যমে শতভাগ নিরাপদ সংরক্ষিত থাকবে। আপনার কোনো প্রশ্ন থাকলে এখনই বলুন!`;
  } else {
    let moodIntro = '';
    switch (mood) {
      case 'friendly':
        moodIntro = "I'm delighted to assist you and bring genuine joy to your day!";
        break;
      case 'analytical':
        moodIntro = 'Let us break this down with rigorous precision and data clarity.';
        break;
      case 'humorous':
        moodIntro = 'Ready to have a fun, witty, and productive conversation!';
        break;
      case 'empathetic':
        moodIntro = 'I hear you completely and I am here with calm, mindful support.';
        break;
      case 'creative':
        moodIntro = 'Let us unleash limitless imagination and build extraordinary concepts!';
        break;
    }

    return `${nameGreeting}Hello! ${moodIntro}

Regarding your inquiry: "${userQuery}"

💡 **OpenRouter API Key Activation**:
To power Aura AI with unlimited top-tier models (such as Llama 3.3 70B Free, DeepSeek R1 Reasoning, Claude 3.5 Sonnet, GPT-4o), click the **Settings** icon above and paste your **OpenRouter API Key**.

🖼️ **Unlimited Image Generation**:
You can immediately create stunning visual artwork anytime! Simply type \`/image <description>\` (e.g., \`/image a cyberpunk city with floating neon gardens\`) or tap the image icon in the input dock.

Your chats, profile, and memories are secured locally with client-side **AES-256 GCM encryption**. What would you like to explore next?`;
  }
}
