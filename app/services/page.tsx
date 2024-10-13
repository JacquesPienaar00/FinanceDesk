import ProductCard from '@/components/eCommerce/ProductCard';
import { Products } from '@/app/services/data/products';
import Header from '@/components/navigation/header';

// Function to group products by category
const groupByCategory = (products: any[]): { [key: string]: any[] } => {
  return products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized'; // Handle missing category
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});
};

const ServicesPage: React.FC = () => {
  const categorizedProducts = groupByCategory(Products);

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl justify-center">
        {Object.entries(categorizedProducts).map(([category, products], index) => (
          <div key={index} className="mb-32">
            <h2 className="mt-64 flex justify-center rounded-md border bg-accent py-4 text-3xl font-bold">
              {category}
            </h2>
            <div className="-mt-20 flex flex-wrap justify-center gap-4">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={{ ...product, id: product.id.toString() }} // Ensuring ID is a string
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ServicesPage;
