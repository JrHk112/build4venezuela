export function getVideoEmbedUrl(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);

    if (hostname === "youtu.be") {
      const videoId = segments[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (hostname === "youtube.com") {
      const videoId =
        url.searchParams.get("v") ??
        (segments[0] === "embed" || segments[0] === "shorts"
          ? segments[1]
          : null);

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (hostname === "vimeo.com") {
      const videoId = segments.find((segment) => /^\d+$/.test(segment));
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    if (hostname === "loom.com") {
      const videoId = segments[0] === "embed" ? segments[1] : segments[1];
      return videoId ? `https://www.loom.com/embed/${videoId}` : null;
    }

    if (hostname === "screen.studio" || hostname === "screenstudio.com") {
      return url.toString();
    }

    return null;
  } catch {
    return null;
  }
}
