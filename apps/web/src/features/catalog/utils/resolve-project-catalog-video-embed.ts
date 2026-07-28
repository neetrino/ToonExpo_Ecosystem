export type ProjectCatalogVideoEmbed =
  { kind: 'iframe'; src: string } | { kind: 'file'; src: string };

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const youtubeEmbedSrc = (url: URL): string | null => {
  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  let videoId: string | null = null;
  if (host === 'youtu.be') {
    videoId = url.pathname.replace(/^\//, '').split('/')[0] ?? null;
  } else if (url.pathname.startsWith('/embed/')) {
    videoId = url.pathname.slice('/embed/'.length).split('/')[0] ?? null;
  } else if (url.pathname.startsWith('/shorts/')) {
    videoId = url.pathname.slice('/shorts/'.length).split('/')[0] ?? null;
  } else {
    videoId = url.searchParams.get('v');
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
    return null;
  }

  return `https://www.youtube.com/embed/${videoId}`;
};

const vimeoEmbedSrc = (url: URL): string | null => {
  const host = url.hostname.toLowerCase();
  if (!VIMEO_HOSTS.has(host)) {
    return null;
  }

  if (host === 'player.vimeo.com' && url.pathname.startsWith('/video/')) {
    const id = url.pathname.slice('/video/'.length).split('/')[0] ?? null;
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }

  const match = url.pathname.match(/\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)/);
  const id = match?.[1] ?? null;
  return id ? `https://player.vimeo.com/video/${id}` : null;
};

const isDirectVideoFile = (url: URL): boolean => {
  return /\.(mp4|webm|ogg)(?:$|\?)/i.test(url.pathname);
};

/**
 * Resolves a catalog video URL into an embeddable iframe or native video source.
 */
export const resolveProjectCatalogVideoEmbed = (
  rawUrl: string,
): ProjectCatalogVideoEmbed | null => {
  const trimmed = rawUrl.trim();
  if (!trimmed || !isHttpUrl(trimmed)) {
    return null;
  }

  const url = new URL(trimmed);
  const youtube = youtubeEmbedSrc(url);
  if (youtube) {
    return { kind: 'iframe', src: youtube };
  }

  const vimeo = vimeoEmbedSrc(url);
  if (vimeo) {
    return { kind: 'iframe', src: vimeo };
  }

  if (isDirectVideoFile(url)) {
    return { kind: 'file', src: url.toString() };
  }

  return null;
};
