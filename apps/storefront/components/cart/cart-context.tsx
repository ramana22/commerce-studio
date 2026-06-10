'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import type { CartView } from '@/lib/cart/cart-service'
import { addToCart, removeLineItem, updateLineItem } from '@/lib/cart/actions'
import { track } from '@/lib/analytics/events'

interface CartContextValue {
  cart: CartView | null
  itemCount: number
  /** True while a cart mutation is in flight. */
  isPending: boolean
  /** Whether the cart drawer is open. */
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (variantId: string, quantity?: number) => void
  updateItem: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
  /** Clear local cart state after an order is placed. */
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: CartView | null
  children: ReactNode
}) {
  const [cart, setCart] = useState<CartView | null>(initialCart)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((variantId: string, quantity = 1) => {
    // Open the drawer immediately for responsive feedback, then sync.
    setIsOpen(true)
    track('add_to_cart', { variant_id: variantId, quantity })
    startTransition(async () => {
      setCart(await addToCart(variantId, quantity))
    })
  }, [])

  const updateItem = useCallback((lineId: string, quantity: number) => {
    startTransition(async () => {
      setCart(await updateLineItem(lineId, quantity))
    })
  }, [])

  const removeItem = useCallback((lineId: string) => {
    startTransition(async () => {
      setCart(await removeLineItem(lineId))
    })
  }, [])

  const clear = useCallback(() => setCart(null), [])

  const itemCount = cart?.totals.item_count ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isPending,
        isOpen,
        openCart,
        closeCart,
        addItem,
        updateItem,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/** Access cart state and mutators. Must be used within a `CartProvider`. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
