import { describe, expect, it } from 'vitest';

import {
  extractMatterportModelId,
  extractVimeoVideoId,
  extractYoutubeVideoId,
  resolveProjectCatalogVideoEmbed,
  resolveProjectCatalogVideoPreview,
} from '@/features/catalog/utils/resolve-project-catalog-video-embed';

describe('extractYoutubeVideoId', () => {
  it('parses watch, short, embed, and youtu.be URLs', () => {
    expect(
      extractYoutubeVideoId(new URL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')),
    ).toBe('dQw4w9WgXcQ');
    expect(extractYoutubeVideoId(new URL('https://youtu.be/dQw4w9WgXcQ'))).toBe('dQw4w9WgXcQ');
    expect(
      extractYoutubeVideoId(new URL('https://www.youtube.com/embed/dQw4w9WgXcQ')),
    ).toBe('dQw4w9WgXcQ');
    expect(
      extractYoutubeVideoId(new URL('https://www.youtube.com/shorts/dQw4w9WgXcQ')),
    ).toBe('dQw4w9WgXcQ');
  });
});

describe('extractVimeoVideoId', () => {
  it('parses vimeo and player URLs', () => {
    expect(extractVimeoVideoId(new URL('https://vimeo.com/123456789'))).toBe('123456789');
    expect(extractVimeoVideoId(new URL('https://player.vimeo.com/video/123456789'))).toBe(
      '123456789',
    );
  });
});

describe('extractMatterportModelId', () => {
  it('parses show query and space path URLs', () => {
    expect(
      extractMatterportModelId(new URL('https://my.matterport.com/show/?m=SxQL3iGyvQQ')),
    ).toBe('SxQL3iGyvQQ');
    expect(
      extractMatterportModelId(new URL('https://discover.matterport.com/space/SxQL3iGyvQQ')),
    ).toBe('SxQL3iGyvQQ');
  });
});

describe('resolveProjectCatalogVideoEmbed', () => {
  it('returns youtube embed and direct file sources', () => {
    expect(resolveProjectCatalogVideoEmbed('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      kind: 'iframe',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    });
    expect(
      resolveProjectCatalogVideoEmbed('https://cdn.example.com/tour.mp4'),
    ).toEqual({ kind: 'file', src: 'https://cdn.example.com/tour.mp4' });
  });
});

describe('resolveProjectCatalogVideoPreview', () => {
  it('uses YouTube thumbnail as poster preview', async () => {
    await expect(
      resolveProjectCatalogVideoPreview('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).resolves.toEqual({
      kind: 'poster',
      posterSrc: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      posterFallbackSrc: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
  });

  it('uses native file preview for mp4 URLs', async () => {
    await expect(
      resolveProjectCatalogVideoPreview('https://cdn.example.com/clip.mp4'),
    ).resolves.toEqual({
      kind: 'file',
      src: 'https://cdn.example.com/clip.mp4',
    });
  });

  it('uses Matterport thumb as poster preview', async () => {
    await expect(
      resolveProjectCatalogVideoPreview('https://my.matterport.com/show/?m=SxQL3iGyvQQ'),
    ).resolves.toEqual({
      kind: 'poster',
      posterSrc:
        'https://my.matterport.com/api/v1/player/models/SxQL3iGyvQQ/thumb?width=1280',
      href: 'https://my.matterport.com/show/?m=SxQL3iGyvQQ',
    });
  });
});
