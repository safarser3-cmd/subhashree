export interface ModerationResult {
  safe: boolean;
  reason: string;
  category?: string;
}

export async function moderateMessage(text: string): Promise<ModerationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { safe: false, reason: 'Message cannot be empty.' };
  }

  try {
    const response = await fetch('/api/moderate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: trimmed }),
    });

    if (response.status === 429) {
      const data = await response.json();
      return { safe: false, reason: data.reason || "You are posting too fast! Please wait before posting again." };
    }

    if (!response.ok) {
      console.error('[moderation] Backend API error', response.status);
      return { safe: true, reason: 'OK' }; // Fallback to safe if API is down
    }

    const data: ModerationResult = await response.json();
    return data;
  } catch (e) {
    console.error('[moderation] Network error calling backend', e);
    return { safe: true, reason: 'OK' }; // Fallback to safe if network fails
  }
}