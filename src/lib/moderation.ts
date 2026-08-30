// Content Moderation Service (Frontend)
// All AI moderation is handled server-side via /api/moderate.
// This file only runs a fast local regex pre-check first, then delegates to the backend.
// NO API KEYS ARE EXPOSED HERE.

export interface ModerationResult {
  safe: boolean;
  reason: string;
  category?: string;
  provider?: string;
}

// ============================================
// TEXT NORMALIZATION (defeats evasion tricks)
// ============================================
function normalizeText(raw: string): { display: string; search: string } {
  let s = raw.normalize('NFKC');
  // Strip zero-width / invisible unicode characters
  s = s.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '');
  // Map common leetspeak / homoglyphs to plain letters
  const homoglyphMap: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g',
    '@': 'a', '$': 's', '!': 'i', '|': 'i', '+': 't',
    'ı': 'i', 'ɩ': 'l', 'о': 'o', 'е': 'e', 'а': 'a', 'с': 'c', 'р': 'p', 'х': 'x', 'у': 'y', 'ѕ': 's', 'і': 'i', 'ј': 'j',
  };
  s = s.replace(/[0134589@$!|+]|[\u043E\u0435\u0430\u0441\u0440\u0445\u0443\u0455\u0456\u0458\u0131\u0269]/gi, (ch) => homoglyphMap[ch.toLowerCase()] || ch);

  const display = s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Collapse spaced-out letters like "s e x y" → "sexy"
  const search = display.replace(/(?<=^|\s)\w(?:\s\w)+(?=\s|$)/g, (match) =>
    match.replace(/\s/g, '')
  );

  return { display, search };
}

// ============================================
// LOCAL HARD-BLOCK (instant, no network call)
// ============================================
const HARD_BLOCK_PATTERNS: Array<{ regex: RegExp; category: string; reason: string }> = [
  { regex: /\b(mms|leaked|viral|worth\s*it)\b/i, category: 'Inappropriate Reference', reason: 'references private or intimate content' },
  { regex: /\b(porn|pornhub|xxx|nsfw|onlyfans)\b/i, category: 'Sexual Content', reason: 'references adult content' },
  { regex: /\b(sex|sexy|horny|nude|naked|boob|ass|dick|pussy|fuck|fucking|shit|bitch|slut|whore)\w*/i, category: 'Vulgar/Sexual', reason: 'contains vulgar or sexual language' },
  { regex: /\b(boob|boobs|tits|breast|butt|body|figure)\b.*\b(nice|hot|sexy|beautiful|wants?|love)\b/i, category: 'Objectification', reason: 'objectifies the public figure' },
  { regex: /\b(spend|want|wish|love|like)\w*\s+(night|day|time|alone)\w*\s+(with|to)\s+her\b/i, category: 'Sexual Interest', reason: 'expresses sexual or romantic interest' },
  { regex: /\bher\s+(mms|video|pic|photo|content|material|body|figure|boob|tit|ass)\b/i, category: 'Inappropriate Reference', reason: 'references intimate content about her' },
  { regex: /\b(seen|saw|watch|view)\s+(her\s+)?(mms|leaked|viral|private|secret)/i, category: 'Inappropriate Reference', reason: 'implies access to private content' },
  { regex: /\b(kill|murder|die|death|attack|hurt|harm|weapon|bomb|shoot|terror)\w*\b/i, category: 'Violence', reason: 'contains violent or threatening language' },
  { regex: /\b(hate\s+(her|you)|slur|racist|bigot)\w*/i, category: 'Hate Speech', reason: 'contains hateful language' },
  { regex: /\b(suicide|self[- ]?harm|cut\s+myself)\b/i, category: 'Self-Harm', reason: 'mentions self-harm' },
  { regex: /\b(buy\s+now|click\s+here|free\s+money|crypto\s+scam|viagra|casino|telegram\s+@)\b/i, category: 'Spam', reason: 'appears to be spam or promotional' },
];

function localHardBlock(rawText: string): ModerationResult | null {
  const { display, search } = normalizeText(rawText);
  for (const candidate of [display, search]) {
    for (const p of HARD_BLOCK_PATTERNS) {
      if (p.regex.test(candidate)) {
        return {
          safe: false,
          category: p.category,
          reason: `Your message was flagged: ${p.reason}. Please rephrase and try again.`,
          provider: 'local-fallback',
        };
      }
    }
  }
  return null;
}

// ============================================
// MAIN ENTRY POINT
// ============================================
export async function moderateMessage(text: string): Promise<ModerationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { safe: false, reason: 'Message cannot be empty.' };
  }

  // Step 1: Local hard-block — instant, no network
  const blocked = localHardBlock(trimmed);
  if (blocked) return blocked;

  // Step 2: Backend AI moderation — keys are server-side only, never exposed in browser
  try {
    const response = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed }),
    });

    if (response.status === 429) {
      return {
        safe: false,
        reason: 'You are posting too fast! Please wait a few minutes before trying again.',
        provider: 'rate-limit',
      };
    }

    if (response.ok) {
      const data = await response.json();
      return data as ModerationResult;
    }

    // Non-ok but not 429 — server error, approve locally (local check passed)
    console.warn('[moderation] Server error, using local-only result');
    return { safe: true, reason: 'OK', provider: 'local-only' };
  } catch (e) {
    // Server unreachable — local check already passed, approve
    console.warn('[moderation] Backend unreachable, falling back to local-only');
    return { safe: true, reason: 'OK', provider: 'local-only' };
  }
}