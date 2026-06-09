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
  /** Briefly ring-highlight this card (e.g. when scrolled to from global search) */
  highlight?: boolean
  onSave: (id: string) => void
  onRegister: (event: EventItem) => void
}

/** Stable 0..2 variant derived from the id so placeholder banners vary but don't shuffle */
function variantOf(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 3
  return h
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

/** Recording thumbnail banner for past events */
function PastBanner({ event }: { event: EventItem }) {
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
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
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

/** Themed placeholder banner for upcoming events (no real image yet) */
function UpcomingBanner({ event }: { event: EventItem }) {
  const d = event.dateISO ? new Date(event.dateISO + 'T00:00:00') : null
  const day = d ? d.getDate() : null
  const month = d ? d.toLocaleString('en-US', { month: 'short' }).toUpperCase() : event.dateText

  const gradients = [
    'from-[#ff8a5b] via-[#ff6f3c] to-[#ff5e2a]',
    'from-navy-700 via-navy-800 to-navy-900',
    'from-[#ffab63] via-[#ff7d44] to-[#ff6633]',
  ]
  const grad = gradients[variantOf(event.id)]

  if (event.bannerImage) {
    return (
      <div className="relative aspect-video bg-navy-100 overflow-hidden">
        <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className={cn('relative aspect-video overflow-hidden bg-gradient-to-br', grad)}>
      {/* grid texture */}
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute right-6 bottom-4 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative h-full p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white text-[#ff6633] shadow-sm">
            <span className="text-lg font-extrabold leading-none">{day ?? ''}</span>
            <span className="text-[9px] font-bold tracking-wide leading-none mt-0.5">{month}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold backdrop-blur-sm">
            <Calendar className="w-3 h-3" /> Upcoming webinar
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-white/90">
          <span className="font-extrabold text-sm tracking-tight">Zolve</span>
          <span className="text-white/60 text-xs">HomeBase</span>
          <span className="text-white/40 text-xs">· Live session</span>
        </div>
      </div>
    </div>
  )
}

function BookmarkButton({ saved, onClick }: { saved: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={saved ? 'Remove bookmark' : 'Save event'}
      className={cn(
        'absolute top-2.5 right-2.5 z-10 w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150',
        saved ? 'bg-white text-[#ff6633] shadow-sm' : 'bg-navy-900/30 text-white hover:bg-navy-900/50 backdrop-blur-sm'
      )}
    >
      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
    </button>
  )
}

/** Host / speaker row — shows a named host when available, else the Zolve brand */
function HostRow({ event }: { event: EventItem }) {
  if (event.speakerName) {
    return (
      <div className="flex items-center gap-2.5">
        <SpeakerAvatar name={event.speakerName} photo={event.speakerPhoto} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-navy-800 truncate capitalize">{event.speakerName}</p>
          {event.speakerDesignation && (
            <p className="text-[11px] text-navy-400 truncate">{event.speakerDesignation}</p>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-full bg-[#fff1ec] border border-[#ff6633]/20 flex items-center justify-center flex-shrink-0">
        <span className="text-[#ff6633] font-extrabold text-sm">Z</span>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-navy-800 truncate">Zolve HomeBase</p>
        <p className="text-[11px] text-navy-400 truncate">Virtual · Free webinar</p>
      </div>
    </div>
  )
}

/** Shared inner content (host, title, tags) */
function CardBody({ event }: { event: EventItem }) {
  return (
    <>
      <HostRow event={event} />
      <h3 className="text-[15px] font-bold text-navy-800 leading-snug line-clamp-2">{event.title}</h3>
      {event.subtitle && (
        <p className="text-xs text-navy-500 leading-relaxed line-clamp-2 -mt-1.5">{event.subtitle}</p>
      )}
      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {event.tags.map((t) => (
            <Badge key={t} variant={event.category === 'past' ? 'tag' : 'score'}>{t}</Badge>
          ))}
        </div>
      )}
    </>
  )
}

export default function EventCard({
  event, relative, isSaved, isRegistered, registering, highlight, onSave, onRegister,
}: EventCardProps) {
  const isPast = event.category === 'past'
  const domId = `event-${event.id}`
  const shell = cn(
    'group bg-white border rounded-2xl overflow-hidden flex flex-col hover:border-navy-400 hover:shadow-lg hover:shadow-navy-900/5 transition-all duration-200 scroll-mt-24',
    highlight
      ? 'border-[#ff6633] ring-2 ring-[#ff6633]/40 ring-offset-2'
      : 'border-navy-200'
  )

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSave(event.id)
  }

  // PAST — entire card is a link to the recording
  if (isPast) {
    return (
      <a
        id={domId}
        href={event.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(shell, 'cursor-pointer')}
      >
        <div className="relative">
          <PastBanner event={event} />
          <BookmarkButton saved={isSaved} onClick={handleSave} />
        </div>
        <div className="flex flex-col flex-1 p-4 gap-3">
          <CardBody event={event} />
          <div className="mt-auto pt-3 border-t border-navy-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-navy-400 truncate">{event.dateText}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-50 text-navy-700 text-xs font-semibold group-hover:bg-[#fff1ec] group-hover:text-[#ff6633] transition-colors flex-shrink-0">
              Watch <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </a>
    )
  }

  // UPCOMING — same format, with placeholder banner + Register CTA
  return (
    <div id={domId} className={shell}>
      <div className="relative">
        <UpcomingBanner event={event} />
        <BookmarkButton saved={isSaved} onClick={handleSave} />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <CardBody event={event} />
        <div className="mt-auto pt-3 border-t border-navy-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-navy-400 truncate">{relative || event.dateText}</span>
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
        </div>
      </div>
    </div>
  )
}
