export interface YoutubeProps {
  v: string;
}

export function Youtube({ v }: YoutubeProps) {
  const videos = v.split(",").map((vid) => vid.substring(2, vid.length - 1).trim());

  return (
    <div className="my-4 flex items-center gap-4 max-md:flex-col">
      {videos.map((videoId) => (
        <iframe
          key={`video-${videoId}`}
          width="100%"
          height="400"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      ))}
    </div>
  );
}
