import type { OfferBannerBlock } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'
import { CtaButton } from './cta-button'
import { Countdown } from './countdown'

export function OfferBanner({ block }: { block: OfferBannerBlock }) {
  const bg = urlForImage(block.backgroundImage, { width: 1600 })

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: block.backgroundColor ?? '#FF0F7B' }}
    >
      {bg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center text-white">
        <p className="text-xl font-semibold sm:text-3xl">{block.text}</p>
        {block.countdownTo ? <Countdown to={block.countdownTo} /> : null}
        <CtaButton cta={block.cta} />
      </div>
    </section>
  )
}
