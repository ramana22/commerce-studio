import Link from 'next/link'
import { bottleImage } from '@/lib/catalog/placeholder'
import { moodHref } from '@/lib/catalog/scent'
import { AppImage } from '@/components/ui/app-image'
import { CarouselRail } from '@/components/ui/carousel-rail'
import { Reveal } from '@/components/motion/reveal'

interface Reel {
  caption: string
  author: string
  likes: string
  duration: string
  href: string
  /** Stable demo photo lock (loremflickr). */
  lock: number
}

/** Demo community reels — swapped for real UGC via the Sanity reel block. */
const REELS: Reel[] = [
  {
    caption: 'My 5-second signature scent routine before work',
    author: '@morningmuse',
    likes: '12.1k',
    duration: '0:09',
    href: moodHref('fresh'),
    lock: 61,
  },
  {
    caption: 'Layering Velvet Bloom over Skin Musk — obsessed',
    author: '@scentdiaries',
    likes: '9.4k',
    duration: '0:14',
    href: moodHref('floral'),
    lock: 62,
  },
  {
    caption: 'He finally found his signature. Noir Vetiver, obviously',
    author: '@theminimalman',
    likes: '21.7k',
    duration: '0:11',
    href: moodHref('woody'),
    lock: 63,
  },
  {
    caption: 'Date night in one roll: Praline Hour on pulse points',
    author: '@goldenhourgal',
    likes: '15.3k',
    duration: '0:13',
    href: moodHref('sweet'),
    lock: 64,
  },
  {
    caption: 'Pocket-size perfume oil = no more 5pm fade',
    author: '@carryonchic',
    likes: '7.8k',
    duration: '0:08',
    href: '/bestsellers',
    lock: 65,
  },
  {
    caption: 'Unboxing the gift set — that wax seal though',
    author: '@unwrapdaily',
    likes: '11.2k',
    duration: '0:16',
    href: '/gifting',
    lock: 66,
  },
]

function reelPhoto(lock: number): string {
  return `https://loremflickr.com/600/1067/perfume?lock=${lock}`
}

/** Instagram-style lifestyle rail — trust and mood, not just bottles. */
export function LifestyleReel() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
            From the community
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-brand-ink sm:text-5xl">
            #WearBodyScent
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
          Real routines, real layering tricks, real reactions — tag us to be
          featured.
        </p>
      </Reveal>

      <CarouselRail>
        {REELS.map((reel) => (
          <li key={reel.lock} className="w-56 shrink-0 snap-start sm:w-64">
            <Link
              href={reel.href}
              className="group relative block aspect-[9/16] overflow-hidden rounded-3xl bg-neutral-900 shadow-card transition-all duration-500 ease-smooth hover:-translate-y-1.5 hover:shadow-hover"
            >
              <AppImage
                src={reelPhoto(reel.lock)}
                fallbackSrc={bottleImage(`reel-${reel.lock}`)}
                alt={reel.caption}
                fill
                sizes="(min-width: 640px) 256px, 224px"
                className="object-cover opacity-90 transition-transform duration-700 ease-smooth group-hover:scale-105"
              />
              {/* Legibility + mood gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

              {/* Reel chrome */}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white backdrop-blur">
                  {reel.duration}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor">
                    <path d="M8 5.5v13l11-6.5-11-6.5z" />
                  </svg>
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-medium leading-snug text-white">
                  {reel.caption}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/75">
                  <span className="font-semibold">{reel.author}</span>
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M12 21s-7.5-4.7-10-9.3C.6 8.6 2.6 5 6.1 5c2 0 3.5 1 4.4 2.5h3C14.4 6 15.9 5 17.9 5c3.5 0 5.5 3.6 4.1 6.7C22 16.3 12 21 12 21z" />
                    </svg>
                    {reel.likes}
                  </span>
                </div>
                <span className="mt-3 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-brand-ink opacity-0 transition-all duration-500 ease-smooth group-hover:translate-y-0 group-hover:opacity-100">
                  Shop this mood →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </CarouselRail>
    </section>
  )
}
