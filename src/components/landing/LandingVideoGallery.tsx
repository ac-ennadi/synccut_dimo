const videos = [
  { src: '/videos/position-01.mp4', label: 'Video 01' },
  { src: '/videos/position-02.mp4', label: 'Video 02' },
  { src: '/videos/position-03.mp4', label: 'Video 03' },
];

export function LandingVideoGallery() {
  return (
    <section aria-labelledby="landing-videos-title" className="bg-white px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4 border-t border-[#d6d6d6] pt-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#707070]">Video gallery</p>
            <h2 id="landing-videos-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-3xl">
              Watch the cuts.
            </h2>
          </div>
          <span className="pb-1 text-xs tabular-nums text-[#86868b]">01 — 03</span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {videos.map((video) => (
            <figure key={video.src} className="min-w-0">
              <video
                controls
                playsInline
                preload="metadata"
                aria-label={video.label}
                className="aspect-video w-full rounded-2xl bg-black object-contain"
              >
                <source src={video.src} type="video/mp4" />
                Your browser does not support embedded video.
              </video>
              <figcaption className="mt-2 text-xs text-[#707070]">{video.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
