'use client'

import Image from 'next/image'
import Button from '@/components/ui/Button'
import { useCart } from '@/contexts/CartContext'
import { Minus, Plus, Trash2 } from 'lucide-react'

interface CartItemProps {
  item: {
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateItemQuantity } = useCart()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      updateItemQuantity(item.id, newQuantity)
    } else {
      removeItem(item.id)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleQuantityChange(item.quantity - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleQuantityChange(item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 