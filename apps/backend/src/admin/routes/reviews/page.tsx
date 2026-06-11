import { defineRouteConfig } from '@medusajs/admin-sdk'
import { Container, Heading, Button, Badge, Text, toast } from '@medusajs/ui'
import { useEffect, useState } from 'react'

type Review = {
  id: string
  product_id: string
  author_name: string
  email: string
  rating: number
  title: string | null
  content: string
  images: string[] | null
  status: string
  verified: boolean
  created_at: string
}

const STATUSES = ['pending', 'approved', 'rejected'] as const

const ReviewsPage = () => {
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>('pending')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const load = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/admin/reviews?status=${status}`, {
        credentials: 'include',
      })
      const data = await res.json()
      setReviews(data.reviews ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(filter)
  }, [filter])

  const moderate = async (id: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`/admin/reviews/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`Review ${status}`)
      setReviews((rs) => rs.filter((r) => r.id !== id))
    } else {
      toast.error('Could not update the review')
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Product Reviews</Heading>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <Button
              key={s}
              size="small"
              variant={filter === s ? 'primary' : 'secondary'}
              onClick={() => setFilter(s)}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-10">
          <Text className="text-ui-fg-subtle">Loading…</Text>
        </div>
      ) : reviews.length === 0 ? (
        <div className="px-6 py-10">
          <Text className="text-ui-fg-subtle">No {filter} reviews.</Text>
        </div>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text weight="plus">{'★'.repeat(Math.round(r.rating))}</Text>
                {r.title ? <Text weight="plus">{r.title}</Text> : null}
                {r.verified ? <Badge size="2xsmall" color="green">Verified</Badge> : null}
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                {r.author_name} · {new Date(r.created_at).toLocaleDateString()}
              </Text>
            </div>
            <Text size="small">{r.content}</Text>
            {r.images && r.images.length > 0 ? (
              <div className="flex gap-2">
                {r.images.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" className="h-16 w-16 rounded object-cover" />
                ))}
              </div>
            ) : null}
            <Text size="xsmall" className="text-ui-fg-subtle">
              product: {r.product_id}
            </Text>
            {filter !== 'approved' ? (
              <div className="flex gap-2">
                <Button size="small" variant="primary" onClick={() => moderate(r.id, 'approved')}>
                  Approve
                </Button>
                <Button size="small" variant="danger" onClick={() => moderate(r.id, 'rejected')}>
                  Reject
                </Button>
              </div>
            ) : (
              <div>
                <Button size="small" variant="secondary" onClick={() => moderate(r.id, 'rejected')}>
                  Unpublish
                </Button>
              </div>
            )}
          </div>
        ))
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: 'Reviews',
})

export default ReviewsPage
