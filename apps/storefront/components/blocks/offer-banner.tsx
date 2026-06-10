import type { OfferBannerBlock } from '@/lib/sanity/types'
import { urlForImage } from '@/lib/sanity/image'
import { AppImage } from '@/components/ui/app-image'
import { CtaButton } from './cta-button'
import { Countdown } from './countdown'
import { Reveal } from '@/components/motion/reveal'

export function OfferBanner({ block }: { block: OfferBannerBlock }) {
  const bg = urlForImage(block.backgroundImage, { width: 1600 })

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: block.backgroundColor ?? '#FF0F7B' }}
    >
      {bg ? (
        <AppImage src={bg} alt="" fill sizes="100vw" className="object-cover" />
      ) : null}
      <Reveal className="relative z-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center text-white">
          <p className="text-balance text-2xl font-bold sm:text-4xl">
            {block.text}
          </p>
          {block.countdownTo ? <Countdown to={block.countdownTo} /> : null}
          <CtaButton cta={block.cta} />
        </div>
      </Reveal>
    </section>
  )
}
