import { Product } from '@/context/CartProvider';
import Image from 'next/image';
import { FC } from 'react';
import BuyingOptions from './BuyingOptions';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  product: Product;
}

const calculateDiscountPercent = (mrp: number, salePrice: number): number => {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - salePrice) / mrp) * 100);
};

const ProductCard: FC<Props> = ({ product }) => {
  const percentOff =
    product?.salePrice > 0 ? calculateDiscountPercent(product.mrp, product.salePrice) : 0;

  return (
    <Card className="mt-24 w-[350px] overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-24 w-full bg-accent">
          <Image
            src={product?.thumbnail}
            alt={product?.title}
            layout="fill"
            objectFit="contain"
            className="p-4"
          />
          {percentOff > 0 && <Badge className="absolute right-2 top-2">{percentOff}% Off</Badge>}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h2 className="mb-2 line-clamp-2 text-xl font-semibold">{product?.title}</h2>
        <div className="flex items-baseline space-x-2">
          {percentOff > 0 ? (
            <>
              <span className="text-2xl font-bold text-green-600">R{product.salePrice}</span>
              <span className="text-lg text-gray-500 line-through">R{product.mrp}</span>
            </>
          ) : (
            <span className="text-3xl font-bold text-green-600">R{product.mrp}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <BuyingOptions product={product} />
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
