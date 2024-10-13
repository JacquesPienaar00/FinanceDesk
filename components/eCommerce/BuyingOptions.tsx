'use client';

import { Product, useCart } from '@/context/CartProvider';
import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';

interface Props {
  product: Product;
}

const BuyingOptions: FC<Props> = ({ product }) => {
  const { updateCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const onAddToCartClick = () => {
    updateCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="w-full">
      <Button
        onClick={onAddToCartClick}
        className="w-full transition-all duration-300 ease-in-out"
        variant={isAdded ? 'secondary' : 'default'}
      >
        {isAdded ? (
          <>
            <Check className="mr-2 h-4 w-4" /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </>
        )}
      </Button>
    </div>
  );
};

export default BuyingOptions;
