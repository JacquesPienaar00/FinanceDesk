'use client';

import { useCart } from '@/context/CartProvider';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { generateSignature } from '@/app/utils/signatureUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import Header from '@/components/navigation/header';
import Footer from '@/components/navigation/footer';

const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID || '';
const merchantKey = process.env.NEXT_PUBLIC_MERCHANT_KEY || '';
const passphrase = process.env.NEXT_PUBLIC_MERCHANT_PASSPHRASE || '';
const payfastUrl = process.env.NEXT_PUBLIC_PAYFAST_URL || '';

const CheckoutForm: React.FC = () => {
  const { data: session } = useSession();
  const { countTotalPrice, items: cartItems } = useCart();
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const totalAmount = Number(countTotalPrice()).toFixed(2);
    const itemNames = cartItems
      .flatMap((item) => Array(item.count).fill(item.product.id))
      .join(', ');

    const newFormData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: 'https://thefinancedesk.co.za/dashboard',
      cancel_url: 'https://thefinancedesk.co.za',
      notify_url: 'https://thefinancedesk.co.za/api/pfValidate',
      name_first: session?.user?.name?.split(' ')[0] || '',
      name_last: session?.user?.name?.split(' ').slice(1).join(' ') || '',
      email_address: session?.user?.email || '',
      m_payment_id: `Order-${Date.now()}`,
      amount: totalAmount,
      item_name: itemNames,
    };

    newFormData.signature = generateSignature(newFormData, passphrase);
    setFormData(newFormData);
  }, [cartItems, countTotalPrice, session]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    form.submit();
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={payfastUrl} method="post" id="payfast-form" onSubmit={handleSubmit}>
          {Object.entries(formData)
            .filter(([, value]) => value.trim() !== '')
            .map(([key, value]) => (
              <input key={key} name={key} type="hidden" value={value.trim()} />
            ))}
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="payfast-form" className="w-full">
          Pay Now
        </Button>
      </CardFooter>
    </Card>
  );
};

const CheckoutPage: React.FC = () => {
  const { countTotalPrice, items: cartItems, removeFromCart, updateCart } = useCart();

  useEffect(() => {
    const result = localStorage.getItem('cartItems');
    if (result !== null) {
      // console.log(JSON.parse(result));
    }
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto mt-44 max-w-5xl rounded-3xl border bg-background p-5 shadow-md">
        <h1 className="py-4 text-3xl font-bold">Checkout</h1>
        {cartItems.map((cartItem) => (
          <Card key={cartItem.product.id} className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Image
                  src={cartItem.product.thumbnail}
                  alt={cartItem.product.title}
                  className="rounded object-scale-down"
                  width={64}
                  height={64}
                />
                <div className="flex-1">
                  <h2 className="font-semibold">{cartItem.product.title}</h2>
                  <div className="flex space-x-1 text-sm text-muted-foreground">
                    <span>{cartItem.count}</span>
                    <span>x</span>
                    <span>
                      {cartItem.product.salePrice > 0
                        ? (cartItem.count * cartItem.product.salePrice).toFixed(2)
                        : (cartItem.count * cartItem.product.mrp).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(cartItem.product)}
                    className="text-xs uppercase"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    <span className="sr-only">Remove {cartItem.product.title}</span>
                    Remove
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCart(cartItem.product, -1)}
                      aria-label={`Decrease quantity of ${cartItem.product.title}`}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{cartItem.count}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCart(cartItem.product, 1)}
                      aria-label={`Increase quantity of ${cartItem.product.title}`}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-col items-end py-4">
          <h2 className="text-xl font-semibold uppercase">Total</h2>
          <p className="font-semibold">
            <span className="font-normal text-muted-foreground">The total of your cart is:</span> R
            {Number(countTotalPrice()).toFixed(2)}
          </p>

          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CheckoutPage;
