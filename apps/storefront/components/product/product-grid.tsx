import type { ProductCard as ProductCardData } from '@sugar-store/types'
import { StaggerGroup, StaggerItem } from '@/components/motion/stagger'
import { ProductCard } from './product-card'

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-neutral-500">No products found.</p>
    )
  }
  return (
    <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <StaggerItem key={p.id}>
          <ProductCard product={p} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  )
}
