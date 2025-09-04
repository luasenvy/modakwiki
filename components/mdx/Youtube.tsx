export interface YoutubeProps {
  v: string;
}

export function Youtube({ v }: YoutubeProps) {
  return (
    <iframe
      width="100%"
      height="400"
      src={`https://www.youtube.com/embed/${v}`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    ></iframe>
  );
}
