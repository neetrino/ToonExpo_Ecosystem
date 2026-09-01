export type ProjectCatalogVideoEmbed =
  { kind: 'iframe'; src: string } | { kind: 'file'; src: string };

export type ProjectCatalogVideoPreview =
  | { kind: 'poster'; posterSrc: string; posterFallbackSrc?: string; href: string }
  | { kind: 'file'; src: string }
  | { kind: 'link'; href: string };

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);
const VIMEO_OEMBED_TIMEOUT_MS = 2_500;
/** Prefer 1280×720 when YouTube has it; fall back to hqdefault in the poster UI. */
const YOUTUBE_POSTER_PRIMARY = 'maxresdefault';
const YOUTUBE_POSTER_FALLBACK = 'hqdefault';
/** Ask Vimeo oEmbed for a wide thumbnail suitable for aspect-video posters. */
const VIMEO_OEMBED_THUMBNAIL_WIDTH = 1_280;
/** Matterport showcase thumb width for aspect-video posters. */
const MATTERPORT_THUMB_WIDTH = 1_280;

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const parseHttpUrl = (rawUrl: string): URL | null => {
  const trimmed = rawUrl.trim();
  if (!trimmed || !isHttpUrl(trimmed)) {
    return null;
  }
  return new URL(trimmed);
};

/**
 * Extracts a YouTube video id from common watch / share / embed / shorts URLs.
 */
export const extractYoutubeVideoId = (url: URL): string | null => {
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

  return videoId;
};

const youtubeEmbedSrc = (url: URL): string | null => {
  const videoId = extractYoutubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const youtubePosterSrc = (videoId: string, quality: string): string =>
  `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;

/**
 * Extracts a Vimeo numeric id from common Vimeo / player URLs.
 */
export const extractVimeoVideoId = (url: URL): string | null => {
  const host = url.hostname.toLowerCase();
  if (!VIMEO_HOSTS.has(host)) {
    return null;
  }

  if (host === 'player.vimeo.com' && url.pathname.startsWith('/video/')) {
    const id = url.pathname.slice('/video/'.length).split('/')[0] ?? null;
    return id && /^\d+$/.test(id) ? id : null;
  }

  const match = url.pathname.match(/\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)/);
  const id = match?.[1] ?? null;
  return id && /^\d+$/.test(id) ? id : null;
};

const vimeoEmbedSrc = (url: URL): string | null => {
  const id = extractVimeoVideoId(url);
  return id ? `https://player.vimeo.com/video/${id}` : null;
};

/**
 * Extracts a Matterport model id from show / discover / space URLs.
 */
export const extractMatterportModelId = (url: URL): string | null => {
  const host = url.hostname.toLowerCase();
  if (!host.endsWith('matterport.com')) {
    return null;
  }

  const fromQuery = url.searchParams.get('m')?.trim() ?? null;
  if (fromQuery && /^[a-zA-Z0-9_-]{6,}$/.test(fromQuery)) {
    return fromQuery;
  }

  const pathMatch = url.pathname.match(
    /\/(?:show|space|models)\/([a-zA-Z0-9_-]{6,})(?:\/|$)/i,
  );
  return pathMatch?.[1] ?? null;
};

const matterportPosterSrc = (modelId: string): string =>
  `https://my.matterport.com/api/v1/player/models/${modelId}/thumb?width=${MATTERPORT_THUMB_WIDTH}`;

const isDirectVideoFile = (url: URL): boolean => {
  return /\.(mp4|webm|ogg)(?:$|\?)/i.test(url.pathname);
};

type VimeoOEmbedResponse = {
  thumbnail_url?: string;
};

const fetchVimeoPosterSrc = async (pageUrl: string): Promise<string | null> => {
  const endpoint =
    `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(pageUrl)}` +
    `&width=${VIMEO_OEMBED_THUMBNAIL_WIDTH}`;
  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(VIMEO_OEMBED_TIMEOUT_MS),
      next: { revalidate: 86_400 },
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as VimeoOEmbedResponse;
    const thumbnail = data.thumbnail_url?.trim();
    return thumbnail && isHttpUrl(thumbnail) ? thumbnail : null;
  } catch {
    return null;
  }
};

/**
 * Resolves a catalog video URL into an embeddable iframe or native video source.
 */
export const resolveProjectCatalogVideoEmbed = (
  rawUrl: string,
): ProjectCatalogVideoEmbed | null => {
  const url = parseHttpUrl(rawUrl);
  if (!url) {
    return null;
  }

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

/**
 * Resolves a clickable preview: real video poster when available, else file/link.
 */
export const resolveProjectCatalogVideoPreview = async (
  rawUrl: string,
): Promise<ProjectCatalogVideoPreview | null> => {
  const url = parseHttpUrl(rawUrl);
  if (!url) {
    return null;
  }

  const href = url.toString();
  const youtubeId = extractYoutubeVideoId(url);
  if (youtubeId) {
    return {
      kind: 'poster',
      posterSrc: youtubePosterSrc(youtubeId, YOUTUBE_POSTER_PRIMARY),
      posterFallbackSrc: youtubePosterSrc(youtubeId, YOUTUBE_POSTER_FALLBACK),
      href,
    };
  }

  if (extractVimeoVideoId(url)) {
    const posterSrc = await fetchVimeoPosterSrc(href);
    if (posterSrc) {
      return { kind: 'poster', posterSrc, href };
    }
    return { kind: 'link', href };
  }

  const matterportId = extractMatterportModelId(url);
  if (matterportId) {
    return {
      kind: 'poster',
      posterSrc: matterportPosterSrc(matterportId),
      href,
    };
  }

  if (isDirectVideoFile(url)) {
    return { kind: 'file', src: href };
  }

  return { kind: 'link', href };
};
