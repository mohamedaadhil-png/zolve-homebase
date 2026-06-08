'use client'

import { useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [hasVideo, setHasVideo] = useState(true)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <section className="bg-white py-20 sm:py-28" aria-label="Product demo">
      <div className="max-w-6xl mx-auto px-6">
        {/* Headline row */}
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-16 items-end mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-[1.04] tracking-tight">
            Land sponsored roles with{' '}
            <span className="font-serif-accent text-[#ff6633]">less guesswork</span>
          </h2>
          <p className="text-navy-600 text-lg leading-relaxed lg:pb-2">
            Home Base is built for international tech professionals who want to stop wasting
            interviews on companies that never sponsor. See how it works in 90 seconds.
          </p>
        </div>

        {/* Video frame */}
        <div className="relative rounded-3xl overflow-hidden bg-navy aspect-video group">
          {hasVideo ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="/homebase-hero.png"
                playsInline
                preload="none"
                onEnded={() => setPlaying(false)}
                onError={() => setHasVideo(false)}
              >
                {/* Drop the demo file at public/homebase-demo.mp4 to enable */}
                <source src="/homebase-demo.mp4" type="video/mp4" />
              </video>

              {/* Play / pause control */}
              <button
                onClick={togglePlay}
                aria-label={playing ? 'Pause demo video' : 'Play demo video'}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                <span
                  className={`flex items-center justify-center w-20 h-20 rounded-full bg-[#ff6633] text-white shadow-2xl transition-all duration-200 group-hover:scale-105 ${
                    playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                  }`}
                >
                  {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </span>
              </button>

              {/* Overlay gradient when idle */}
              {!playing && (
                <div
                  className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent pointer-events-none"
                  aria-hidden="true"
                />
              )}
            </>
          ) : (
            /* Fallback placeholder until the video is uploaded */
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-full bg-[#ff6633] flex items-center justify-center mb-5">
                <Play className="w-7 h-7 text-white ml-1" aria-hidden="true" />
              </div>
              <p className="text-white font-semibold text-lg">Product demo coming soon</p>
              <p className="text-white/50 text-sm mt-1">
                Drop the file at <code className="text-white/70">public/homebase-demo.mp4</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
