'use client'

import { useState } from 'react'
import {
  Play, Bookmark, BookmarkCheck, Calendar, Video,
  ArrowUpRight, Check, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { EventItem } from '@/lib/events/data'

interface EventCardProps {
  event: EventItem
  relative?: string | null
  isSaved: boolean
  isRegistered: boolean
  registering: boolean
  onSave: (id: string) => void
  onRegister: (event: EventItem) => void
}

/** Small circular avatar with graceful initial fallback */
function SpeakerAvatar({ name, photo }: { name?: string; photo?: string }) {
  const [broken, setBroken] = useState(false)
  const initials = (name || 'Z')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (photo && !broken) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setBroken(true)}
        className="w-9 h-9 rounded-full object-cover border border-navy-100 bg-navy-50 flex-shrink-0"
      />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-[11px] font-bold text-navy-600 border border-navy-200 flex-shrink-0">
      {initials}
    </div>
  )
}

/** Thumbnail header for past events (YouTube recording) */
function PastHeader({ event }: { event: EventItem }) {
  const [broken, setBroken] = useState(false)
  return (
    <div className="relative aspect-video bg-navy-100 overflow-hidden">
      {event.thumbnail && !broken ? (
        <img
          src={event.thumbnail}
          alt={event.title}
          loading="lazy"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-800 to-navy-700">
          <Video className="w-8 h-8 text-white/70" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/35 to-transparent" />
      {/* Play affordance */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200">
          <Play className="w-5 h-5 text-[#ff6633] fill-[#ff6633] ml-0.5" />
        </div>
      </div>
      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-navy-900/70 text-white text-[10px] font-semibold backdrop-blur-sm">
        <Play className="w-2.5 h-2.5 fill-white" /> Recording
      </span>
    </div>
  )
}

function BookmarkButton({
  saved, onClick, overImage = false,
}: { saved: boolean; onClick: () => void; overImage?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={saved ? 'Remove bookmark' : 'Save event'}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 flex-shrink-0',
        overImage
          ? saved
            ? 'bg-white text-[#ff6633] shadow-sm'
            : 'bg-navy-900/30 text-white hover:bg-navy-900/50 backdrop-blur-sm'
          : saved
            ? 'bg-[#fff1ec] border border-[#ff6633]/30 text-[#ff6633]'
            : 'border border-navy-200 text-navy-300 hover:border-navy-400 hover:text-navy-600'
      )}
    >
      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
    </button>
  )
}

export default function EventCard({
  event, relative, isSaved, isRegistered, registering, onSave, onRegister,
}: EventCardProps) {
  const isPast = event.category === 'past'
  const d = event.dateISO ? new Date(event.dateISO + 'T00:00:00') : null
  const day = d ? d.getDate() : null
  const month = d ? d.toLocaleString('en-US', { month: 'short' }).toUpperCase() : null

  return (
    <div className="group bg-white border border-navy-200 rounded-2xl overflow-hidden flex flex-col hover:border-navy-400 hover:shadow-lg hover:shadow-navy-900/5 transition-all duration-200">
      {/* Past events lead with the recording thumbnail */}
      {isPast && (
        <div className="relative">
          <PastHeader event={event} />
          <div className="absolute top-2.5 right-2.5">
            <BookmarkButton saved={isSaved} onClick={() => onSave(event.id)} overImage />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Upcoming: compact date badge + label row (no loud media header) */}
        {!isPast && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#fff1ec] text-[#ff6633] flex-shrink-0">
                <span className="text-lg font-extrabold leading-none">{day ?? ''}</span>
                <span className="text-[9px] font-bold tracking-wide leading-none mt-0.5">
                  {month ?? event.dateText}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-navy-50 text-navy-500 text-[11px] font-semibold">
                <Calendar className="w-3 h-3" /> Upcoming
              </span>
            </div>
            <BookmarkButton saved={isSaved} onClick={() => onSave(event.id)} />
          </div>
        )}

        {/* Host / speaker */}
        <div className="flex items-center gap-2.5">
          {isPast ? (
            <>
              <SpeakerAvatar name={event.speakerName} photo={event.speakerPhoto} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-navy-800 truncate capitalize">
                  {event.speakerName || 'Zolve Visa Expert'}
                </p>
                {event.speakerDesignation && (
                  <p className="text-[11px] text-navy-400 truncate">{event.speakerDesignation}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-[#fff1ec] border border-[#ff6633]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#ff6633] font-extrabold text-sm">Z</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-navy-800 truncate">Zolve HomeBase</p>
                <p className="text-[11px] text-navy-400 truncate">Virtual · Free webinar</p>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-navy-800 leading-snug line-clamp-2">
          {event.title}
        </h3>
        {event.subtitle && (
          <p className="text-xs text-navy-500 leading-relaxed line-clamp-2 -mt-1.5">{event.subtitle}</p>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((t) => (
              <Badge key={t} variant={isPast ? 'tag' : 'score'}>{t}</Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-navy-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-navy-400 truncate">
            {isPast ? event.dateText : (relative || event.dateText)}
          </span>

          {isPast ? (
            <a
              href={event.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-50 text-navy-700 text-xs font-semibold cursor-pointer hover:bg-navy-100 transition-colors flex-shrink-0"
            >
              Watch <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={() => onRegister(event)}
              disabled={registering}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex-shrink-0 disabled:opacity-70',
                isRegistered
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#ff6633] text-white hover:bg-[#e5572b]'
              )}
            >
              {registering ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> ...</>
              ) : isRegistered ? (
                <><Check className="w-3.5 h-3.5" /> Registered</>
              ) : (
                'Register'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
