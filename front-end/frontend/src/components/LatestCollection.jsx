import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 8));
  }, [products]);

  return (
    <div className="my-10">
      <div className="py-8 text-3xl text-center">
        <Title text1={"LATEST"} text2={"TABLETS"} />
        <p className="w-3/4 m-auto text-xs text-gray-600 sm:text-sm md:text-base">
          Discover our newest tablet collections featuring cutting-edge technology, 
          premium displays, and powerful performance for work and entertainment.
        </p>
      </div>

      {/* Rendering Product Items */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 gap-y-6">
        {latestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
