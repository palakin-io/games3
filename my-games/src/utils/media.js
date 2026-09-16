/**
 * Parses a media URL and returns details on type and embeddable URL.
 * Supports YouTube video URLs (watch, share, shorts, music, embed)
 * and direct audio/video media files.
 */
export function parseMediaUrl(url) {
  if (!url || typeof url !== 'string') {
    return { type: 'unknown', url: '' };
  }

  const cleanUrl = url.trim();

  // YouTube match regex covering:
  // - youtube.com/watch?v=ID
  // - youtube.com/embed/ID
  // - youtube.com/v/ID
  // - youtube.com/shorts/ID
  // - music.youtube.com/watch?v=ID
  // - youtu.be/ID
  const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|music\.youtube\.com\/watch\?v=)([^"&?\/\s]{11})/;
  const ytMatch = cleanUrl.match(youtubeRegex);

  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      videoId: ytMatch[1],
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`
    };
  }

  // Direct video file extensions or upload paths
  const videoRegex = /\.(mp4|webm|ogv|mov|mkv)($|\?)/i;
  if (videoRegex.test(cleanUrl)) {
    return {
      type: 'video',
      embedUrl: cleanUrl
    };
  }

  // Direct audio file extensions
  const audioRegex = /\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/i;
  if (audioRegex.test(cleanUrl)) {
    return {
      type: 'audio',
      embedUrl: cleanUrl
    };
  }

  // Fallback: If it's an HTTP URL or local static route, treat as generic embed or link
  return {
    type: 'generic',
    embedUrl: cleanUrl
  };
}
