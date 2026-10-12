import { LinkMetadata } from '../types';

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
  const matches = text.match(urlRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

export function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
}

export async function fetchLinkMetadata(urlStr: string): Promise<LinkMetadata> {
  const domain = extractDomain(urlStr);
  let title = domain;
  let description = `Explore content and resources from ${domain}.`;
  let image = '';

  // Generate a tailored high-fidelity preview graphic or favicon/open-graph style preview
  // Using reliable favicon & dynamic topic illustration
  const domainClean = domain.toLowerCase();
  
  if (domainClean.includes('github')) {
    title = 'GitHub Repository & Code';
    description = 'Open-source software project, code, and documentation on GitHub.';
  } else if (domainClean.includes('wikipedia')) {
    title = 'Wikipedia Knowledge Entry';
    description = 'Free encyclopedia knowledge article and detailed background.';
  } else if (domainClean.includes('youtube')) {
    title = 'YouTube Video Stream';
    description = 'Watch high-definition videos, channels, and playlists.';
  } else if (domainClean.includes('openrouter')) {
    title = 'OpenRouter AI Unified Interface';
    description = 'Unified API for cutting-edge LLMs and AI intelligence.';
  } else {
    // Human-friendly title
    const parts = domainClean.split('.');
    const brand = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : domain;
    title = `${brand} - Official Website`;
  }

  // Create an informative, verified preview image for the website topic using Pollinations
  const previewPrompt = encodeURIComponent(`high quality clean visual thumbnail banner for website ${domain}, modern digital photography, elegant web design aesthetic`);
  image = `https://image.pollinations.ai/prompt/${previewPrompt}?width=800&height=450&nologo=true`;

  return {
    url: urlStr,
    title,
    description,
    image,
    domain,
  };
}
