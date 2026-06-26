import { getVideoEmbedUrl } from "@/lib/projects/video-embed";
import { cn } from "@/lib/utils";

type ProjectVideoEmbedProps = {
  className?: string;
  title: string;
  videoUrl: string;
};

export function ProjectVideoEmbed({
  className,
  title,
  videoUrl,
}: ProjectVideoEmbedProps) {
  const embedUrl = getVideoEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <a
        className={cn(
          "flex aspect-video items-center justify-center border border-border bg-card font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition hover:border-primary hover:text-primary",
          className,
        )}
        href={videoUrl}
        rel="noreferrer"
        target="_blank"
      >
        Watch demo
      </a>
    );
  }

  return (
    <div
      className={cn(
        "aspect-video overflow-hidden border border-border bg-card",
        className,
      )}
    >
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src={embedUrl}
        title={`${title} demo video`}
      />
    </div>
  );
}
