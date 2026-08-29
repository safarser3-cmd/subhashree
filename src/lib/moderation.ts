// NVIDIA NIM Content Moderation Service
// Uses the nvidia/llama-3.1-nemoguard-8b-content-safety model via integrate.api.nvidia.com
// Docs: https://build.nvidia.com/nvidia/llama-3_1-nemoguard-8b-content-safety
//
// NOTE: meta/llama-guard-3-8b was deprecated by NVIDIA and returns 404.
// This service now uses the NemoGuard model which returns JSON:
//   { "User Safety": "safe" } or
//   { "User Safety": "unsafe", "Safety Categories": "Violence, Hate Speech" }

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'nvidia/llama-3.1-nemoguard-8b-content-safety';
const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY as string | undefined;

export interface ModerationResult {
  safe: boolean;
  reason: string;
  category?: string;
}

// Map NemoGuard category strings to user-friendly messages
function formatNemoCategory(categories: string): string {
  if (!categories) return 'inappropriate content';
  const lower = categories.toLowerCase();
  if (lower.includes('violence') || lower.includes('physical')) return 'Violence or physical harm';
  if (lower.includes('sexual') || lower.includes('erotic')) return 'Sexual or erotic content';
  if (lower.includes('hate') || lower.includes('harass')) return 'Hate speech or harassment';
  if (lower.includes('self-harm') || lower.includes('suicide')) return 'Self-harm or suicide';
  if (lower.includes('substance') || lower.includes('drug') || lower.includes('controlled')) return 'Substance abuse or illegal drugs';
  if (lower.includes('weapon') || lower.includes('explosive')) return 'Weapons or explosives';
  if (lower.includes('spam') || lower.includes('promotion')) return 'Spam or unsolicited promotion';
  if (lower.includes('defamat') || lower.includes('personal attack')) return 'Defamation or personal attack';
  if (lower.includes('minor') || lower.includes('child')) return 'Content inappropriate for minors';
  if (lower.includes('criminal') || lower.includes('illegal')) return 'Criminal planning or illegal activity';
  return categories; // Return raw string if no match
}

// Local fallback safety check (very basic, used only if API is unreachable)
function localFallbackCheck(text: string): ModerationResult {
  const lowered = text.toLowerCase();
  const bannedPatterns: Array<{ regex: RegExp; category: string; reason: string }> = [
    { regex: /\b(kill|murder|die|death|attack|hurt|harm|weapon|bomb|shoot)\w*\b/i, category: 'Violence', reason: 'contains violent or threatening language' },
    { regex: /\b(sex|porn|nude|nsfw|adult|erotic|horny)\w*\b/i, category: 'Sexual Content', reason: 'contains sexual or adult content' },
    { regex: /\b(hate|slur|racist|bigot)\w*\b/i, category: 'Hate Speech', reason: 'contains hateful or harassing language' },
    { regex: /\b(suicide|self[- ]?harm|cut myself)\b/i, category: 'Self-Harm', reason: 'mentions self-harm' },
    { regex: /\b(buy now|click here|free money|crypto scam|viagra|casino)\b/i, category: 'Spam', reason: 'appears to be spam or promotional' },
  ];
  for (const p of bannedPatterns) {
    if (p.regex.test(lowered)) {
      return { safe: false, category: p.category, reason: `Your message was flagged: ${p.reason}.` };
    }
  }
  return { safe: true, reason: 'OK' };
}

export async function moderateMessage(text: string): Promise<ModerationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { safe: false, reason: 'Message cannot be empty.' };
  }

  if (!API_KEY) {
    console.warn('[moderation] VITE_NVIDIA_API_KEY not set, using local fallback.');
    return localFallbackCheck(trimmed);
  }

  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: trimmed,
          },
        ],
        temperature: 0,
        max_tokens: 100,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[moderation] NVIDIA NIM error', response.status, errText);
      return localFallbackCheck(trimmed);
    }

    const data = await response.json();
    const raw: string = (data?.choices?.[0]?.message?.content || '').trim();

    // NemoGuard returns JSON like:
    // { "User Safety": "safe" }
    // { "User Safety": "unsafe", "Safety Categories": "Violence, Hate Speech" }
    try {
      const parsed = JSON.parse(raw);
      const userSafety = (parsed['User Safety'] || '').toLowerCase();
      const safetyCategories: string = parsed['Safety Categories'] || '';

      if (userSafety === 'safe') {
        return { safe: true, reason: 'OK' };
      }

      if (userSafety === 'unsafe') {
        const friendlyCategory = formatNemoCategory(safetyCategories);
        return {
          safe: false,
          category: safetyCategories,
          reason: `Your message was flagged: ${friendlyCategory}. Please rephrase and try again.`,
        };
      }
    } catch {
      // Response was not JSON — try legacy "safe" / "unsafe S7" plaintext format
      const lower = raw.toLowerCase();
      if (lower.startsWith('safe')) {
        return { safe: true, reason: 'OK' };
      }
      if (lower.startsWith('unsafe')) {
        const parts = lower.split(/\s+/);
        const code = parts[1]?.toUpperCase() || 'UNSAFE';
        return {
          safe: false,
          category: code,
          reason: `Your message was flagged as inappropriate. Please rephrase and try again.`,
        };
      }
    }

    // Unknown response format — fall back to local check
    console.warn('[moderation] Unexpected NIM response format, using local fallback. Raw:', raw);
    return localFallbackCheck(trimmed);

  } catch (e) {
    console.error('[moderation] Network/API error, using local fallback', e);
    return localFallbackCheck(trimmed);
  }
}
