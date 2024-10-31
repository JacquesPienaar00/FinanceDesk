'use client';

import { useCart } from '@/context/CartProvider';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SideCartProps {
  visible: boolean;
  onRequestClose: () => void;
}

export default function SideCart({ visible, onRequestClose }: SideCartProps) {
  const { items: cartItems, updateCart, removeFromCart, countTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onRequestClose();
      setIsClosing(false);
    }, 300);
  };

  const handleCheckout = () => {
    if (isLoggedIn) {
      console.log('send data to the server and create payment link');
      router.push('/checkout');
    } else {
      router.push('/auth');
    }
    handleClose();
  };

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 top-0 z-40 h-screen bg-black transition-opacity duration-300 ease-in-out ${
          visible && !isClosing ? 'opacity-50' : 'pointer-events-none opacity-0'
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full transform bg-background shadow-lg transition-transform duration-300 ease-in-out sm:w-96 ${
          visible && !isClosing ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-screen flex-col bg-background">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">Cart</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Separator />
          <ScrollArea className="flex-grow px-4">
            {cartItems.map((cartItem) => (
              <div key={cartItem.product?.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <Image
                    src={cartItem.product?.thumbnail || '/public/thefinancedesk.svg'}
                    alt={cartItem.product?.title || 'Product'}
                    className="rounded-md object-cover"
                    width={64}
                    height={64}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{cartItem.product?.title || 'Default Title'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cartItem.count} x R{' '}
                      {cartItem.product?.salePrice > 0
                        ? (cartItem.count * cartItem.product?.salePrice).toFixed(2)
                        : (cartItem.count * cartItem.product?.mrp).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(cartItem.product)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateCart(cartItem.product, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">{cartItem.count}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateCart(cartItem.product, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
          <Separator />
          <div className="space-y-4 p-4">
            <div>
              <h3 className="text-lg font-semibold">Total</h3>
              <p className="text-sm text-muted-foreground">
                The total of your cart is: R{countTotalPrice()}
              </p>
            </div>
            <Button className="w-full" onClick={handleCheckout}>
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
