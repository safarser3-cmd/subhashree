// NVIDIA NIM Content Moderation Service
// Uses nvidia/nemotron-3-ultra-550b-a55b via integrate.api.nvidia.com
// Returns SAFE or UNSAFE: <reason> format

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b';
// Use backend environment variable
const API_KEY = process.env.NVIDIA_API_KEY;

export interface ModerationResult {
  safe: boolean;
  reason: string;
  category?: string;
}

const SYSTEM_PROMPT = `You are a content moderator for a public fan appreciation website for a young female public figure.

Read a user-submitted fan comment and decide if it is appropriate to display publicly.

APPROVE if the comment: expresses genuine admiration, compliments her work/talent/fashion/personality, offers encouragement or support, or shares a positive fan experience.

REJECT if the comment (including coded, implied, or indirect language):
- Contains or implies sexual interest, objectification, or body references
- References or hints at any private, personal, or intimate content about her (videos, images, recordings, etc.)
- Uses phrases that imply the user has seen private material ("worth it", "amazing find", "you know what I mean", etc.)
- Is degrading, harassing, or disrespectful in any way
- Contains spam, threats, or irrelevant content

Be especially alert to: vague references to "content", "videos", or "material" that imply private/intimate media. Also be alert to abbreviations or slang that may reference private recordings.

Reply with ONLY ONE of these two formats, nothing else:
SAFE
UNSAFE: one short sentence reason`;

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

export async function moderateMessageService(text: string): Promise<ModerationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { safe: false, reason: 'Message cannot be empty.' };
  }

  if (!API_KEY) {
    console.warn('[moderation] NVIDIA_API_KEY not set in backend, using local fallback.');
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: trimmed },
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

    if (!raw) {
      console.warn('[moderation] Empty response from NIM, using local fallback');
      return localFallbackCheck(trimmed);
    }

    const isSafe = raw.startsWith('SAFE');
    const reason = isSafe ? '' : raw.replace(/^UNSAFE:\s*/i, '');

    if (isSafe) {
      return { safe: true, reason: 'OK' };
    }

    return {
      safe: false,
      category: 'Content Policy',
      reason: reason || 'Your message was flagged as inappropriate. Please rephrase and try again.',
    };

  } catch (e) {
    console.error('[moderation] Network/API error, using local fallback', e);
    return localFallbackCheck(trimmed);
  }
}
