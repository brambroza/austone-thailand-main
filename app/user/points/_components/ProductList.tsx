import { usePointsPageStore } from "../_store";
import Product from "./Product";

const ProductList = () => {
  const products = usePointsPageStore((state) => state.products);
  return (
    <div className="flex flex-col gap-y-2 overflow-y-scroll h-full">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
