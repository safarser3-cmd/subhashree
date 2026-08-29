// NVIDIA NIM Content Moderation Service
// Uses the free Llama Guard 3 model via integrate.api.nvidia.com
// Docs: https://docs.api.nvidia.com/nim/reference/llama-3-1-llama-guard-3-8b-instruct

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'meta/llama-guard-3-8b';
const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY as string | undefined;

export interface ModerationResult {
  safe: boolean;
  reason: string;
  category?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  S1: 'Violence or physical harm',
  S2: 'Sexual or erotic content',
  S3: 'Criminal planning or wrongdoing',
  S4: 'Weapons or explosives',
  S5: 'Substance abuse or illegal drugs',
  S6: 'Self-harm or suicide',
  S7: 'Hate speech or harassment',
  S8: 'Profanity or vulgar language',
  S9: 'Sexual content involving minors',
  S10: 'Personal data or private information',
  S11: 'Spam or unsolicited promotion',
  S12: 'Defamation or personal attack',
  S13: 'Political persuasion or lobbying',
  S14: 'Medical or health advice',
};

function formatCategory(code: string): string {
  return CATEGORY_LABELS[code] || code;
}

// Local fallback safety check (very basic, used only if API is unreachable)
function localFallbackCheck(text: string): ModerationResult {
  const lowered = text.toLowerCase();
  const bannedPatterns: Array<{ regex: RegExp; category: string; reason: string }> = [
    { regex: /\b(kill|murder|die|death|attack|hurt|harm|weapon|bomb|shoot)\w*\b/i, category: 'S1', reason: 'contains violent or threatening language' },
    { regex: /\b(sex|porn|nude|nsfw|adult|erotic|horny)\w*\b/i, category: 'S2', reason: 'contains sexual or adult content' },
    { regex: /\b(hate|slur|racist|bigot)\w*\b/i, category: 'S7', reason: 'contains hateful or harassing language' },
    { regex: /\b(suicide|self[- ]?harm|cut myself)\b/i, category: 'S6', reason: 'mentions self-harm' },
    { regex: /\b(buy now|click here|free money|crypto scam|viagra|casino)\b/i, category: 'S11', reason: 'appears to be spam or promotional' },
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
            role: 'system',
            content:
              'You are a strict but fair content moderator for a public fan message board dedicated to a public figure. ' +
              'Analyze the user message and decide if it is safe and appropriate to post. ' +
              'Reject any message containing: violence, threats, sexual or erotic content, hate speech, harassment, ' +
              'personal attacks, defamation, self-harm, illegal activity, weapons, drugs, spam, scams, or any inappropriate content. ' +
              'Reply with EXACTLY one line, no explanation, no markdown. The line must be one of:\n' +
              'safe\n' +
              'unsafe S1\n' +
              'unsafe S2\n' +
              'unsafe S3\n' +
              '... up to unsafe S14\n' +
              'where S1..S14 are the safety categories. The ONLY first word must be "safe" or "unsafe".',
          },
          {
            role: 'user',
            content: trimmed,
          },
        ],
        temperature: 0,
        max_tokens: 20,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[moderation] NVIDIA NIM error', response.status, errText);
      return localFallbackCheck(trimmed);
    }

    const data = await response.json();
    const raw: string = (data?.choices?.[0]?.message?.content || '').trim().toLowerCase();

    if (raw.startsWith('safe')) {
      return { safe: true, reason: 'OK' };
    }

    // Parse "unsafe S7" format
    const parts = raw.split(/\s+/);
    const code = parts[1]?.toUpperCase();
    return {
      safe: false,
      category: code,
      reason: `Your message was flagged: ${formatCategory(code || 'inappropriate content')}. Please rephrase and try again.`,
    };
  } catch (e) {
    console.error('[moderation] Network/API error, using local fallback', e);
    return localFallbackCheck(trimmed);
  }
}
