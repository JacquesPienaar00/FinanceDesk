'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartProvider';
import SideCart from './SideCart';

export default function Navbar() {
  const { countAllItems } = useCart();
  const [showSideCart, setShowSideCart] = useState(false);
  const cartItems = countAllItems();

  return (
    <nav className="flex items-center justify-between">
      {/* Add your other navbar items here */}
      <div className="flex-grow" />
      <Button
        variant="ghost"
        size="icon"
        className="relative bg-background"
        onClick={() => setShowSideCart((prev) => !prev)}
      >
        <ShoppingCart className="h-5 w-5" />
        {cartItems > 0 && (
          <span className="absolute -mr-6 -mt-8 flex h-4 w-4 items-center justify-center rounded-full border border-primary bg-accent text-xs text-accent-foreground">
            {cartItems >= 9 ? '9+' : cartItems}
          </span>
        )}
      </Button>
      <SideCart visible={showSideCart} onRequestClose={() => setShowSideCart(false)} />
    </nav>
  );
}
