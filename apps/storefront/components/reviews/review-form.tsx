'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { submitReview } from '@/lib/reviews/actions'
import { cn } from '@/lib/utils/cn'

interface ResizedImage {
  filename: string
  mimeType: string
  data: string
}

/** Downscale an image client-side and return base64 JPEG (keeps uploads small). */
function resizeImage(file: File, max = 1200): Promise<ResizedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas unavailable'))
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        resolve({
          filename: file.name.replace(/\.\w+$/, '.jpg'),
          mimeType: 'image/jpeg',
          data: dataUrl.split(',')[1] ?? '',
        })
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<ResizedImage[]>([])
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const onFiles = async (files: FileList | null) => {
    if (!files) return
    const picked = Array.from(files).slice(0, 6 - images.length)
    const resized = await Promise.all(picked.map((f) => resizeImage(f)))
    setImages((prev) => [...prev, ...resized].slice(0, 6))
  }

  const submit = () => {
    setResult(null)
    if (rating < 1) {
      setResult({ ok: false, message: 'Please pick a star rating.' })
      return
    }
    startTransition(async () => {
      const r = await submitReview({
        product_id: productId,
        email,
        author_name: name,
        rating,
        title,
        content,
        images,
      })
      setResult({ ok: r.ok, message: r.ok ? r.message : r.error })
      if (r.ok) {
        setRating(0); setName(''); setEmail(''); setTitle(''); setContent(''); setImages([])
      }
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-brand-ink px-6 py-3 text-sm font-semibold text-brand-ink transition hover:bg-brand-ink hover:text-white"
      >
        Write a review
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-neutral-200 p-5">
      <h3 className="font-display text-lg font-semibold text-brand-ink">Write a review</h3>

      {/* Stars */}
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className={cn(
              'text-2xl leading-none transition-colors',
              (hover || rating) >= n ? 'text-pink-600' : 'text-neutral-300',
            )}
          >
            ★
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          className="h-11 rounded-lg border border-neutral-300 px-3 text-sm outline-none focus:border-pink-500" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (used to verify your purchase)"
          className="h-11 rounded-lg border border-neutral-300 px-3 text-sm outline-none focus:border-pink-500" />
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)"
        className="mt-3 h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm outline-none focus:border-pink-500" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="How does it smell? How long does it last?"
        className="mt-3 w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-pink-500" />

      {/* Photos */}
      <div className="mt-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:border-pink-400">
          + Add photos
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => onFiles(e.target.files)} />
        </label>
        {images.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`data:${img.mimeType};base64,${img.data}`} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                  className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-xs text-white">×</button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {result ? (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={cn('mt-4 text-sm', result.ok ? 'text-green-700' : 'text-red-600')}>
            {result.message}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={submit} disabled={pending}
          className="rounded-full bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50">
          {pending ? 'Submitting…' : 'Submit review'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="rounded-full px-4 py-3 text-sm text-neutral-500 hover:text-brand-ink">Cancel</button>
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        Reviews are limited to verified purchasers and appear after moderation.
      </p>
    </div>
  )
}
