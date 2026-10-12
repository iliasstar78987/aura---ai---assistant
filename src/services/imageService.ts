import { GeneratedImage } from '../types';

export interface ImageGenOptions {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '4:3' | '9:16';
  style?: string;
  seed?: number;
}

export const STYLE_PRESETS = [
  { id: 'photorealistic', nameBn: 'বাস্তবধর্মী ছবি (Realistic)', nameEn: 'Photorealistic' },
  { id: 'cinematic', nameBn: 'সিনেমাটিক দৃশ্য (Cinematic)', nameEn: 'Cinematic Movie' },
  { id: 'anime', nameBn: 'অ্যানিমে / মাঙ্গা (Anime)', nameEn: 'Anime Art' },
  { id: 'cyberpunk', nameBn: 'সাইবারপাঙ্ক নিয়ন (Cyberpunk)', nameEn: 'Cyberpunk' },
  { id: 'fantasy', nameBn: 'ফ্যান্টাসি ম্যাজিক (Fantasy)', nameEn: 'Epic Fantasy' },
  { id: 'digital-art', nameBn: 'ডিজিটাল ইলাস্ট্রেশন (Digital Art)', nameEn: 'Digital Painting' },
  { id: '3d-render', nameBn: 'থ্রি-ডি রেন্ডার (3D Render)', nameEn: '3D Octane Render' },
];

export function getResolutionForAspect(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1280, height: 720 };
    case '4:3':
      return { width: 1024, height: 768 };
    case '9:16':
      return { width: 720, height: 1280 };
    case '1:1':
    default:
      return { width: 1024, height: 1024 };
  }
}

export function generateImageUrl(options: ImageGenOptions): string {
  const { prompt, aspectRatio = '1:1', style, seed = Math.floor(Math.random() * 1000000) } = options;
  const { width, height } = getResolutionForAspect(aspectRatio);

  let enhancedPrompt = prompt.trim();
  if (style) {
    switch (style) {
      case 'photorealistic':
        enhancedPrompt += ', 8k uhd, photorealistic, ultra high detail, leica 35mm lens, natural lighting';
        break;
      case 'cinematic':
        enhancedPrompt += ', cinematic still, 35mm photograph, dramatic lighting, atmospheric depth, golden hour';
        break;
      case 'anime':
        enhancedPrompt += ', anime visual art, makoto shinkai style, vibrant colors, detailed illustration';
        break;
      case 'cyberpunk':
        enhancedPrompt += ', cyberpunk neon lights, futuristic city, night, high contrast, ray tracing';
        break;
      case 'fantasy':
        enhancedPrompt += ', epic fantasy concept art, magical glowing runes, ethereal, intricate details';
        break;
      case 'digital-art':
        enhancedPrompt += ', trending on artstation, smooth digital art masterpiece, vivid colors';
        break;
      case '3d-render':
        enhancedPrompt += ', 3d octane render, blender 3d, volumetric lighting, photorealistic materials';
        break;
    }
  }

  const encoded = encodeURIComponent(enhancedPrompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

export function createGeneratedImageObj(options: ImageGenOptions): GeneratedImage {
  const url = generateImageUrl(options);
  return {
    id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    prompt: options.prompt,
    url,
    aspectRatio: options.aspectRatio || '1:1',
    style: options.style,
    createdAt: Date.now(),
  };
}

/**
 * Detects if a message is an explicit request to generate an image
 * e.g., "/image a cat in space", "একটি বাঘের ছবি আঁকো", "generate an image of a sunset"
 */
export function detectImagePrompt(text: string): string | null {
  const trimmed = text.trim();
  
  // Command syntax /image or /img
  const slashMatch = trimmed.match(/^\/(?:image|img|draw|art)\s+(.+)/i);
  if (slashMatch) {
    return slashMatch[1];
  }

  // Bengali phrases
  const bnPatterns = [
    /(?:একটি|একটা)?\s*(.+?)\s*(?:এর\s*)?(?:ছবি|ইমেজ|চিত্র)\s*(?:আঁকো|বানাও|তৈরি করো|জেনারেট করো|দেখা|দেখাও)/i,
    /(?:ছবি|ইমেজ|চিত্র)\s*(?:আঁকো|বানাও|তৈরি করো|দেখা|দেখাও)\s*(?:যাতে|যেখানে)?\s*(.+)/i,
  ];

  for (const pattern of bnPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      return match[1].trim();
    }
  }

  // English phrases
  const enPatterns = [
    /(?:generate|create|draw|paint|show me)\s+(?:an?\s+)?(?:image|picture|photo|illustration|art)\s+(?:of\s+)?(.+)/i,
    /(?:image|picture|photo)\s+of\s+(.+)/i,
  ];

  for (const pattern of enPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      return match[1].trim();
    }
  }

  return null;
}
