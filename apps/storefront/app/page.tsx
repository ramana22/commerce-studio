import { getDemoProducts } from '@/lib/catalog/product-service'
import { formatInr } from '@/lib/medusa/money'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'

export default async function HomePage() {
  const products = await getDemoProducts()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Shop SUGAR</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Phase 5 demo grid — Phase 7 replaces this with the full catalog.
      </p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          <p className="font-medium">No products found.</p>
          <p className="mt-1 text-sm">
            Start the backend, run <code>pnpm backend:seed</code>, set{' '}
            <code>NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY</code> in <code>.env</code>,
            then <code>pnpm catalog:import</code>.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-col overflow-hidden rounded-lg border border-neutral-200"
            >
              <div className="aspect-square bg-neutral-100">
                {p.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="flex-1 text-sm font-medium">{p.title}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatInr(p.price_inr)}
                </p>
                <div className="mt-3">
                  <AddToCartButton
                    variantId={p.variantId}
                    className="w-full rounded bg-pink-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
