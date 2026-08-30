export const scrapeTwitter = async (
  username = 'againsubha',
  bearerToken = process.env.TWITTER_BEARER_TOKEN || process.env.X_BEARER_TOKEN
) => {
  if (!bearerToken) {
    return {
      count: null,
      error: 'TWITTER_BEARER_TOKEN not configured',
      isLive: false
    };
  }

  try {
    const url =
      `https://api.twitter.com/2/users/by/username/${username}` +
      `?user.fields=public_metrics,description,profile_image_url,verified`;

    const tokenHeader = bearerToken.startsWith('Bearer ')
      ? bearerToken
      : `Bearer ${bearerToken}`;

    const response = await fetch(url, {
      headers: {
        Authorization: tokenHeader,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      let errorDetail = `Status ${response.status}`;
      try {
        const bodyJson: any = await response.json();
        if (bodyJson?.title) errorDetail = `${bodyJson.title} (${bodyJson.detail || response.status})`;
      } catch {
        // ignore parse error
      }

      console.log(`[X] API notice: ${errorDetail}`);
      return {
        count: null,
        error: errorDetail,
        status: response.status,
        isLive: false
      };
    }

    const user: any = await response.json();
    const metrics = user.data?.public_metrics;

    return {
      count: metrics?.followers_count ?? null,
      followingCount: metrics?.following_count ?? null,
      tweetCount: metrics?.tweet_count ?? null,
      bio: user.data?.description ?? null,
      pf: user.data?.profile_image_url?.replace('_normal', '') ?? null,
      verified: user.data?.verified ?? true,
      status: response.status,
      isLive: true
    };
  } catch (error: any) {
    console.log('[X] Notice: Connection timeout or unreachable:', error?.message || error);
    return {
      count: null,
      error: error?.message || 'Connection to X API unavailable',
      isLive: false
    };
  }
};
